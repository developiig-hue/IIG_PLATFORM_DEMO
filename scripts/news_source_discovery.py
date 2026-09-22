#!/usr/bin/env python3
"""Portable RSS/Atom discovery and conservative source evidence screening.

Run: python scripts/news_source_discovery.py --feeds content/news-feeds.json --output content/discovered-candidates.json
Only explicitly configured HTTPS feeds are queried. Discovery is NOT independent fact verification,
and this script NEVER creates publishable articles or approves/publishes content.
"""
import argparse
import hashlib
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ATOM = '{http://www.w3.org/2005/Atom}'


def https(url):
    p = urlparse(url if isinstance(url, str) else '')
    return p.scheme == 'https' and bool(p.hostname) and not p.username and not p.password


def text(node, names):
    for name in names:
        element = node.find(name)
        if element is not None and element.text and element.text.strip():
            return element.text.strip()
    return ''


def parse_feed(xml):
    root = ET.fromstring(xml)
    records = []
    if root.tag == 'rss' or root.tag.endswith('}RDF'):
        for entry in root.findall('.//item'):
            records.append({'title': text(entry, ['title']), 'url': text(entry, ['link']),
                            'published': text(entry, ['pubDate', 'date', '{http://purl.org/dc/elements/1.1/}date']),
                            'summary': text(entry, ['description'])})
    elif root.tag == ATOM + 'feed':
        for entry in root.findall(ATOM + 'entry'):
            links = [link.attrib.get('href', '') for link in entry.findall(ATOM + 'link') if link.attrib.get('rel', 'alternate') == 'alternate']
            records.append({'title': text(entry, [ATOM + 'title']), 'url': links[0] if links else '',
                            'published': text(entry, [ATOM + 'published', ATOM + 'updated']),
                            'summary': text(entry, [ATOM + 'summary'])})
    else:
        raise ValueError('Unsupported feed format')
    return records


def discover(feeds, fetch=None, limit=100):
    if fetch is None:
        def fetch(url):
            with urlopen(Request(url, headers={'User-Agent': 'IIG-NewsResearch/0.1 (+editorial research)'}), timeout=15) as response:
                if response.geturl() != url and not https(response.geturl()):
                    raise ValueError('Insecure redirect')
                return response.read(2_000_001)
    results, failures, seen = [], [], set()
    for feed in feeds:
        url = feed.get('feed_url', '')
        if not https(url) or not https(feed.get('publisher_url', '')) or feed.get('sector') not in {'energy','metallurgy','agriculture','food','chemical','pharma','logistics','datacenters','waste'}:
            failures.append({'feed_url': url, 'reason': 'INVALID_FEED_CONFIG'})
            continue
        try:
            payload = fetch(url)
            if len(payload) > 2_000_000:
                raise ValueError('Feed too large')
            for entry in parse_feed(payload):
                link = entry['url'].strip()
                if not https(link) or not entry['title'] or link in seen:
                    continue
                seen.add(link)
                results.append({'id': hashlib.sha256(link.encode()).hexdigest()[:16], 'sector': feed['sector'],
                                'publisher': feed.get('publisher', ''), 'publisher_url': feed['publisher_url'],
                                'feed_url': url, 'canonical_url': link, 'title': re.sub('<[^>]*>', '', entry['title']),
                                'source_published_at_unverified': entry['published'],
                                'summary_unverified': re.sub('<[^>]*>', '', entry['summary'])[:1000],
                                'source_status': 'DISCOVERED_UNVERIFIED', 'fact_check_status': 'NOT_VERIFIED',
                                'auto_publish': False, 'publish_authority': 'ADMIN_ONLY'})
                if len(results) >= limit:
                    break
        except (OSError, ValueError, ET.ParseError) as exc:
            failures.append({'feed_url': url, 'reason': type(exc).__name__})
        if len(results) >= limit:
            break
    return {'schema': 'iig.discovery.v1', 'generated_at': datetime.now(timezone.utc).isoformat(),
            'items': results, 'failures': failures, 'note': 'RSS metadata is discovery only; verify article body, project status, dates and each factual claim independently.'}


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--feeds', type=Path, default=ROOT / 'content/news-feeds.json')
    p.add_argument('--output', type=Path, default=ROOT / 'content/discovered-candidates.json')
    args = p.parse_args()
    config = json.loads(args.feeds.read_text(encoding='utf-8'))
    if not isinstance(config, dict) or not isinstance(config.get('feeds'), list):
        p.error('feeds JSON must contain a feeds array')
    result = discover(config['feeds'])
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'discovered': len(result['items']), 'feed_failures': len(result['failures']), 'output': str(args.output)}))
    return 0


if __name__ == '__main__':
    sys.exit(main())
