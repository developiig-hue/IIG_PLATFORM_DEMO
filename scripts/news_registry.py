#!/usr/bin/env python3
"""Load the approved IIG source registry. A website URL is NOT an RSS feed."""
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
    for s in sources:
        u = urlparse(s['website_url'])
        if u.scheme != 'https' or not u.hostname or u.username or u.password:
            raise ValueError('Invalid source website URL: ' + s['id'])
    return sorted(sources, key=lambda s: (0 if s['priority'] == 'P1' else 1, s['id']))


def audited_feeds(sources):
    """Do not mistake owner-approved websites for individually audited feeds."""
    feeds = []
    for s in sources:
        url = s.get('feed_url')
        if s.get('feed_verified') is True and isinstance(url, str) and url.startswith('https://'):
            feeds.append({'feed_url': url, 'publisher_url': s['website_url'], 'publisher': s['name'], 'sector': s['sector'], 'priority': s['priority'], 'source_id': s['id']})
    return feeds


def enrichment_required(candidate):
    """Outside-registry research is required if coverage is thin, NOT a license to invent facts."""
    return any(not candidate.get(k) for k in ('full_primary_text', 'claim_evidence', 'image_rights_confirmed')) or candidate.get('coverage_thin', False) or candidate.get('interview_missing', False) or candidate.get('image_quality_poor', False)
