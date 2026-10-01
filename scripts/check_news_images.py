#!/usr/bin/env python3
"""Fail deployment if an approved news item cannot resolve a local same-sector photo.
Rights metadata is not proof of a license; legal review remains a separate gate.
"""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'baze_foto_news/manifest.json').read_text(encoding='utf-8'))
registry = json.loads((root / 'content/public-news.json').read_text(encoding='utf-8'))
sectors = manifest['sectors']
all_items = list(registry['items'])
items = [x for x in all_items if x.get('sector') in sectors and not x.get('supplemental')]
assert len(items) == 9, f'Expected nine approved CORE news items, got {len(items)}'
assert len({x['sector'] for x in items}) == 9, 'Each approved CORE news item must have its own sector'
assert set(sectors) == {x['sector'] for x in items}, 'Manifest sectors do not match approved CORE news'
for item in items:
    sector = item['sector']
    image = sectors[sector]
    expected = f'baze_foto_news_{sector}.jpg'
    assert image['sector'] == sector and image['image_type'] == 'sector_photo', sector
    assert image['image_url'] == expected, f'{sector}: wrong fallback path'
    path = root / expected
    assert path.is_file() and path.stat().st_size > 1000, f'{sector}: missing or empty JPG {expected}'
    with path.open('rb') as f:
        assert f.read(3) == b'\xff\xd8\xff', f'{sector}: invalid JPEG signature'
    for language in ('ua', 'en'):
        assert image['image_alt'].get(language), f'{sector}: missing {language} alt'
        assert image['image_caption'].get(language), f'{sector}: missing {language} caption'
    assert image.get('image_rights_verified') is True, f'{sector}: image is not approved for display in manifest'
    if item.get('image_url'):
        assert item.get('image_rights_verified') is True, f'{item["slug"]}: original image rights not verified'
        assert item.get('image_type') == 'source_photo', f'{item["slug"]}: expected original source photo'
    print(f'PASS {item["slug"]} -> {expected} ({path.stat().st_size} bytes)')
# Four-stage original-source moderation is mandatory whenever an original is considered.
policy_path = root / 'content/image-moderation/policy.json'
assert policy_path.is_file(), 'Missing four-stage image moderation policy'
policy = json.loads(policy_path.read_text(encoding='utf-8'))
assert [g['id'] for g in policy['gates']] == ['G1_PROVENANCE','G2_RELEVANCE','G3_RIGHTS','G4_TECHNICAL']
for audit_path in sorted((root / 'content/image-moderation').glob('*.json')):
    if audit_path.name == 'policy.json': continue
    audit = json.loads(audit_path.read_text(encoding='utf-8'))
    statuses = [audit['gates'][g]['status'] for g in ('G1_PROVENANCE','G2_RELEVANCE','G3_RIGHTS','G4_TECHNICAL')]
    all_pass = statuses == ['PASS','PASS','PASS','PASS']
    expected = 'ORIGINAL_SOURCE_IMAGE' if all_pass else 'SAME_SECTOR_IIG_FALLBACK'
    assert audit['decision'] == expected, f'{audit_path.name}: unsafe image decision {audit["decision"]}; expected {expected}'
    print(f'IMAGE MODERATION {audit["slug"]}: {statuses} -> {expected}')
js = (root / 'assets/public-news.js').read_text(encoding='utf-8')
for token in ('manifestURL', 'fallback(x.sector)', 'data-news-image', 'aspect-ratio:16/9', "page==='news.html'", "page==='industry.html'", "page==='index.html'", "page==='article.html'"):
    assert token in js, f'Missing image routing feature: {token}'
print('PASS: nine CORE JPEG assets, nine same-sector mappings and supplemental Finance/Regulation content exempt from core-image quota')
print('NOTICE: rights flags are metadata, not legal evidence; confirm licenses separately.')
