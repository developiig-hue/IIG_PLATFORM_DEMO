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
items = [x for x in registry['items'] if x.get('status') == 'APPROVED' and x.get('admin_approved') is True]
assert len(items) == 9, f'Expected nine approved news items, got {len(items)}'
assert len({x['sector'] for x in items}) == 9, 'Each approved news item must have its own sector'
assert set(sectors) == {x['sector'] for x in items}, 'Manifest sectors do not match approved news'
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
js = (root / 'assets/public-news.js').read_text(encoding='utf-8')
for token in ('manifestURL', 'fallback(x.sector)', 'data-news-image', 'aspect-ratio:16/9', "page==='news.html'", "page==='industry.html'", "page==='index.html'", "page==='article.html'"):
    assert token in js, f'Missing image routing feature: {token}'
print('PASS: nine JPEG assets, nine same-sector mappings and four news render targets')
print('NOTICE: rights flags are metadata, not legal evidence; confirm licenses separately.')
