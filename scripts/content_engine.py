#!/usr/bin/env python3
"""Generate moderation artifacts only. This program never publishes content."""
import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
QUEUE = ROOT / 'content' / 'review-queue'
POLICY = ROOT / 'content' / 'moderation-policy.json'


def policy():
    return json.loads(POLICY.read_text(encoding='utf-8'))


def existing(kind):
    result = []
    for path in QUEUE.glob('*.json'):
        record = json.loads(path.read_text(encoding='utf-8'))
        if record.get('kind') == kind:
            result.append(record)
    return result


def score(item):
    return sum(int(item.get(key, 0)) for key in ('evidence', 'practical_value', 'transferability', 'technology_diversity', 'decision_maker_value'))


def valid(item):
    """Fail closed: never send unverified or incomplete news to the editorial queue."""
    if not isinstance(item, dict):
        return False
    required = ('title', 'company_name', 'company_activity', 'project', 'technology', 'project_status', 'project_status_evidence', 'date', 'canonical_url', 'company_context')
    if any(not isinstance(item.get(key), str) or not item[key].strip() for key in required):
        return False
    url = urlparse(item['canonical_url'])
    if url.scheme != 'https' or not url.netloc or not item.get('primary_source_verified'):
        return False
    try:
        datetime.fromisoformat(item['date'].replace('Z', '+00:00'))
    except ValueError:
        return False
    paragraphs = [p.strip() for p in item['company_context'].split('\n\n')]
    if len(paragraphs) != 3 or any(not p for p in paragraphs) or len(item['company_context']) > 600:
        return False
    quote = item.get('executive_quote')
    if quote and (not isinstance(quote, dict) or any(not quote.get(k) for k in ('verbatim', 'full_name', 'position', 'source_url')) or quote['source_url'] != item['canonical_url']):
        return False
    return True


def candidate_pool():
    pool = []
    directory = ROOT / 'content' / 'candidates'
    for path in sorted(directory.glob('*.json')):
        data = json.loads(path.read_text(encoding='utf-8'))
        pool.extend(data if isinstance(data, list) else [data])
    return [item for item in pool if valid(item)]


def make(kind, now):
    pol = policy()
    month = now.strftime('%Y-%m')
    if kind == 'weekly':
        selected = sorted((x for x in candidate_pool() if x.get('type') in ('news', 'chief-engineer-advice')), key=score, reverse=True)[:pol['weekly']['max_candidates']]
    else:
        approved = [x for x in existing('weekly') if x.get('status') == 'APPROVED' and x.get('moderation', {}).get('decision') == 'APPROVED' and x.get('moderation', {}).get('reviewed_by') and x.get('moderation', {}).get('reviewed_at')]
        items = [i for q in approved for i in q.get('items', []) if valid(i) and i['date'].startswith(month)]
        seen = set()
        selected = []
        for item in sorted(items, key=score, reverse=True):
            key = item['canonical_url'].strip().lower()
            if key not in seen:
                seen.add(key)
                selected.append(item)
        selected = selected[:pol['monthly']['max_items']]
    stamp = now.strftime('%Y%m%dT%H%M%SZ')
    ident = hashlib.sha256((kind + stamp).encode()).hexdigest()[:12]
    document = {'schema': 'iig.moderation.v1', 'id': ident, 'kind': kind, 'generated_at': now.isoformat(), 'status': 'READY_FOR_REVIEW', 'publish_authority': 'ADMIN_ONLY', 'auto_publish': False, 'items': selected, 'moderation': {'reviewed_by': None, 'reviewed_at': None, 'decision': None}, 'audit': {'generator': 'scripts/content_engine.py', 'immutable_rule': 'NO_AUTO_PUBLISH'}}
    QUEUE.mkdir(parents=True, exist_ok=True)
    path = QUEUE / f'{kind}-{stamp}.json'
    path.write_text(json.dumps(document, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(path.relative_to(ROOT))


def verify():
    pol = policy()
    assert pol['publication']['auto_publish'] is False and pol['publication']['authority'] == 'ADMIN_ONLY'
    workflow = (ROOT / '.github/workflows/content-engine.yml').read_text(encoding='utf-8')
    assert "cron: '15 6 * * 1'" in workflow and "cron: '30 6 1 * *'" in workflow
    assert 'contents: read' in workflow
    for forbidden in ('git push', 'gh api', 'deploy-pages', 'curl -X POST', 'PUBLISH_NOW'):
        assert forbidden.lower() not in workflow.lower(), f'forbidden publish path: {forbidden}'
    for path in QUEUE.glob('*.json'):
        record = json.loads(path.read_text(encoding='utf-8'))
        assert record['auto_publish'] is False and record['publish_authority'] == 'ADMIN_ONLY'
        assert record['status'] in ('READY_FOR_REVIEW', 'APPROVED', 'REJECTED')
        if record['status'] == 'APPROVED':
            assert record['moderation']['decision'] == 'APPROVED' and record['moderation']['reviewed_by'] and record['moderation']['reviewed_at']
    print('PASS: scheduler and fail-closed moderation invariants')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('command', choices=('weekly', 'monthly', 'verify'))
    command = parser.parse_args().command
    verify() if command == 'verify' else make(command, datetime.now(timezone.utc))


if __name__ == '__main__':
    main()
