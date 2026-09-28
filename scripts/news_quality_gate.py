#!/usr/bin/env python3
"""Validate proposed News Robot editorial batches; NEVER approve or publish.

Usage: python scripts/news_quality_gate.py path/to/batch.json
Input: JSON array of candidate objects. Emits JSON report and exits 1 on failure.
This structural gate does not independently verify factual claims or source rights.
"""
import argparse
import json
import re
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import urlparse

SECTORS = {'energy', 'metallurgy', 'agriculture', 'food', 'chemical', 'pharma', 'logistics', 'datacenters', 'waste'}
COUNTRY = re.compile(r'^[A-Z]{2}$')


def https(url):
    return isinstance(url, str) and urlparse(url).scheme == 'https' and bool(urlparse(url).netloc)


def nonempty(value):
    return isinstance(value, str) and bool(value.strip())


def check(items):
    problems = []
    counts = Counter()
    seen = set()
    for i, item in enumerate(items):
        label = f'items[{i}]'
        if not isinstance(item, dict):
            problems.append(f'{label}: object required')
            continue
        sector = item.get('sector')
        country = item.get('project_country')
        if sector not in SECTORS:
            problems.append(f'{label}: invalid sector')
        if not isinstance(country, str) or not COUNTRY.fullmatch(country):
            problems.append(f'{label}: project_country must be ISO alpha-2 uppercase')
        else:
            counts[country] += 1
        url = item.get('canonical_url')
        if not https(url):
            problems.append(f'{label}: official HTTPS canonical_url required')
        elif url in seen:
            problems.append(f'{label}: duplicate canonical_url')
        else:
            seen.add(url)
        for field in ('project', 'project_status', 'project_status_evidence', 'company_background', 'project_background'):
            if not nonempty(item.get(field)):
                problems.append(f'{label}: missing {field}')
        for lang in ('ua', 'en'):
            if not nonempty(item.get('article', {}).get(lang) if isinstance(item.get('article'), dict) else None):
                problems.append(f'{label}: missing article.{lang}')
        sources = item.get('sources')
        if not isinstance(sources, list) or not sources or not any(isinstance(s, dict) and s.get('primary') is True and https(s.get('url')) and nonempty(s.get('date')) for s in sources):
            problems.append(f'{label}: dated primary-source evidence required')
        log = item.get('enrichment_search_log')
        if not isinstance(log, list) or not log or not any(isinstance(entry, dict) and nonempty(entry.get('language')) and nonempty(entry.get('query')) and nonempty(entry.get('searched_at')) for entry in log):
            problems.append(f'{label}: documented local-language enrichment search required')
        if item.get('high_value') is True:
            interview = item.get('interview')
            if not isinstance(interview, dict) or interview.get('status') not in ('VERIFIED', 'NOT_FOUND'):
                problems.append(f'{label}: high-value project requires interview research status')
            elif interview['status'] == 'VERIFIED':
                if not all(nonempty(interview.get(k)) for k in ('speaker', 'role', 'date', 'original_language', 'project_insight')) or not https(interview.get('url')):
                    problems.append(f'{label}: interview lacks attributable project-specific evidence')
            elif not (interview.get('editorial_waiver') is True and nonempty(interview.get('waiver_reason')) and nonempty(interview.get('waived_by'))):
                problems.append(f'{label}: interview not found; hold until explicit human waiver')
        if item.get('auto_publish') is not False or item.get('publish_authority') != 'ADMIN_ONLY':
            problems.append(f'{label}: publication safety fields missing or invalid')
        if item.get('status') != 'READY_FOR_REVIEW':
            problems.append(f'{label}: candidate must be READY_FOR_REVIEW')
    for country, number in sorted(counts.items()):
        if number > 2:
            problems.append(f'COUNTRY_CAP: {country} has {number} articles (maximum 2)')
    if len(items) > 9:
        problems.append(f'batch contains {len(items)} articles; maximum 9')
    return {'passed': not problems, 'articles': len(items), 'country_counts': dict(sorted(counts.items())), 'problems': problems,
            'note': 'Structural validation only: editorial fact verification, interview authenticity, translation accuracy and image rights still require review.'}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('batch', type=Path)
    args = parser.parse_args()
    data = json.loads(args.batch.read_text(encoding='utf-8'))
    if not isinstance(data, list):
        parser.error('batch must be a JSON array')
    report = check(data)
    print(json.dumps(report, ensure_ascii=False, indent=2))
    return 0 if report['passed'] else 1


if __name__ == '__main__':
    sys.exit(main())
