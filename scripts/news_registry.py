#!/usr/bin/env python3
"""Approved 260-source registry and prioritized, fail-closed discovery plan."""
import json
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / 'content' / 'news-source-registry.json'


def load_registry(path=REGISTRY):
    data = json.loads(Path(path).read_text(encoding='utf-8'))
    sources = data['sources']
    if len(sources) != 260 or sum(s['priority'] == 'P1' for s in sources) != 160 or sum(s['priority'] == 'P2' for s in sources) != 100:
        raise ValueError('Expected exactly 160 P1 and 100 P2 sources')
    ids = [s['id'] for s in sources]
    if len(set(ids)) != 260:
        raise ValueError('Duplicate source IDs')
    for source in sources:
        u = urlparse(source['website_url'])
        if u.scheme != 'https' or not u.hostname or u.username or u.password:
            raise ValueError('Invalid source website URL: ' + source['id'])
    return sorted(sources, key=lambda s: (0 if s['priority'] == 'P1' else 1, s['id']))


def audited_feeds(sources):
    """Only a real, individually configured HTTPS feed can be passed to RSS parser."""
    feeds = []
    for source in sources:
        url = source.get('feed_url')
        if source.get('feed_verified') is True and isinstance(url, str) and url.startswith('https://'):
            feeds.append({'feed_url': url, 'publisher_url': source['website_url'], 'publisher': source['name'], 'sector': source['sector'], 'priority': source['priority'], 'source_id': source['id']})
    return feeds


def discovery_plan(sources):
    """Every source is scheduled; missing adapters are reported, never silently skipped."""
    plan = []
    for source in sources:
        feed = audited_feeds([source])
        plan.append({'source_id': source['id'], 'priority': source['priority'], 'website_url': source['website_url'], 'name': source['name'], 'sector': source['sector'], 'adapter_type': source.get('adapter_type', 'UNCONFIGURED'), 'feed': feed[0] if feed else None, 'status': 'RSS_READY' if feed else 'ADAPTER_REQUIRED'})
    return plan


def enrichment_required(candidate):
    """Outside-registry research is required for thin evidence, poor images or missing context."""
    return any(not candidate.get(k) for k in ('full_primary_text', 'claim_evidence', 'image_rights_confirmed')) or any(candidate.get(k, False) for k in ('coverage_thin', 'interview_missing', 'image_quality_poor'))
