#!/usr/bin/env python3
"""Portable research and moderation artifact generator. NEVER publishes."""
import argparse
import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse
from news_image_selector import select_image
from news_source_discovery import discover

ROOT = Path(__file__).resolve().parents[1]
QUEUE = ROOT / 'content' / 'review-queue'
POLICY = ROOT / 'content' / 'moderation-policy.json'
MAPPING = ROOT / 'content' / 'news-sector-image-paths.json'
MANIFEST = ROOT / 'baze_foto_news' / 'manifest.json'
FEEDS = ROOT / 'content' / 'news-feeds.json'


def policy():
    return json.loads(POLICY.read_text(encoding='utf-8'))


def existing(kind):
    return [json.loads(p.read_text(encoding='utf-8')) for p in QUEUE.glob('*.json') if json.loads(p.read_text(encoding='utf-8')).get('kind') == kind]


def score(item):
    return sum(int(item.get(k, 0)) for k in ('evidence', 'practical_value', 'transferability', 'technology_diversity', 'decision_maker_value'))


def valid(item):
    """Legacy structural screening, NOT independent fact verification."""
    if not isinstance(item, dict):
        return False
    required = ('title', 'company_name', 'company_activity', 'project', 'technology', 'project_status', 'project_status_evidence', 'date', 'canonical_url', 'company_context')
    if any(not isinstance(item.get(k), str) or not item[k].strip() for k in required):
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
    return not quote or (isinstance(quote, dict) and all(quote.get(k) for k in ('verbatim', 'full_name', 'position', 'source_url')) and quote['source_url'] == item['canonical_url'])


def candidate_pool():
    pool = []
    for path in sorted((ROOT / 'content' / 'candidates').glob('*.json')):
        data = json.loads(path.read_text(encoding='utf-8'))
        pool.extend(data if isinstance(data, list) else [data])
    return [item for item in pool if valid(item)]


def image_resources():
    mapping = json.loads(MAPPING.read_text(encoding='utf-8'))
    manifest = json.loads(MANIFEST.read_text(encoding='utf-8'))
    register = os.environ.get('IIG_IMAGE_RIGHTS_REGISTER', '').strip()
    rights = json.loads(Path(register).read_text(encoding='utf-8')) if register else {}
    return mapping, manifest, rights


def attach_image(item, resources):
    mapping, manifest, rights = resources
    draft = dict(item)
    decision = select_image(draft, mapping, manifest, root=ROOT, rights=rights)
    draft['image_decision'] = decision
    draft['image_status'] = decision['image_status']
    draft['status'] = 'READY_FOR_REVIEW' if decision['image_status'] == 'SELECTED' else 'IMAGE_REVIEW_REQUIRED'
    draft['auto_publish'] = False
    draft['publish_authority'] = 'ADMIN_ONLY'
    draft.pop('approval', None)
    return draft


def research():
    """RSS discovery is separated from publishable drafts and cannot elevate RSS claims to facts."""
    config = json.loads(FEEDS.read_text(encoding='utf-8'))
    if not isinstance(config, dict) or not isinstance(config.get('feeds'), list):
        raise ValueError('Invalid news feed configuration')
    return discover(config['feeds'])


def make(kind, now):
    pol = policy()
    month = now.strftime('%Y-%m')
    discovery = research() if kind == 'weekly' else None
    if kind == 'weekly':
        selected = sorted((x for x in candidate_pool() if x.get('type') in ('news', 'chief-engineer-advice')), key=score, reverse=True)[:pol['weekly']['max_candidates']]
    else:
        approved = [x for x in existing('weekly') if x.get('status') == 'APPROVED' and x.get('moderation', {}).get('decision') == 'APPROVED' and x.get('moderation', {}).get('reviewed_by') and x.get('moderation', {}).get('reviewed_at')]
        items = [i for q in approved for i in q.get('items', []) if valid(i) and i['date'].startswith(month)]
        seen, selected = set(), []
        for item in sorted(items, key=score, reverse=True):
            key = item['canonical_url'].strip().lower()
            if key not in seen:
                seen.add(key)
                selected.append(item)
        selected = selected[:pol['monthly']['max_items']]
    selected = [attach_image(item, image_resources()) for item in selected]
    stamp = now.strftime('%Y%m%dT%H%M%SZ')
    ident = hashlib.sha256((kind + stamp).encode()).hexdigest()[:12]
    blocked = any(item['image_status'] != 'SELECTED' for item in selected)
    document = {'schema': 'iig.moderation.v1', 'id': ident, 'kind': kind, 'generated_at': now.isoformat(), 'status': 'IMAGE_REVIEW_REQUIRED' if blocked else 'READY_FOR_REVIEW', 'publish_authority': 'ADMIN_ONLY', 'auto_publish': False, 'items': selected, 'moderation': {'reviewed_by': None, 'reviewed_at': None, 'decision': None}, 'audit': {'generator': 'scripts/content_engine.py', 'immutable_rule': 'NO_AUTO_PUBLISH', 'image_selector': 'scripts/news_image_selector.py', 'discovery': 'scripts/news_source_discovery.py', 'discovery_is_not_fact_verification': True}}
    QUEUE.mkdir(parents=True, exist_ok=True)
    path = QUEUE / f'{kind}-{stamp}.json'
    path.write_text(json.dumps(document, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    if discovery is not None:
        discovery_path = QUEUE / f'discovery-{stamp}.json'
        discovery_path.write_text(json.dumps(discovery, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print(discovery_path.relative_to(ROOT))
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
        assert record.get('auto_publish') is False, f'Auto-publish must be disabled: {path}'
        assert record.get('publish_authority') == 'ADMIN_ONLY', f'Invalid publication authority: {path}'
        if record.get('schema') == 'iig.discovery.v1':
            assert all(x.get('fact_check_status') == 'NOT_VERIFIED' for x in record.get('items', []))
            continue
        assert record['status'] in ('READY_FOR_REVIEW', 'IMAGE_REVIEW_REQUIRED', 'APPROVED', 'REJECTED')
        if record['status'] == 'APPROVED':
            assert record['moderation']['decision'] == 'APPROVED' and record['moderation']['reviewed_by'] and record['moderation']['reviewed_at']
            assert all(i.get('image_status') == 'SELECTED' for i in record.get('items', []))
    print('PASS: scheduler and fail-closed moderation invariants')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('command', choices=('weekly', 'monthly', 'verify'))
    command = parser.parse_args().command
    verify() if command == 'verify' else make(command, datetime.now(timezone.utc))


if __name__ == '__main__':
    main()
