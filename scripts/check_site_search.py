#!/usr/bin/env python3
from pathlib import Path
import sys

ROOT=Path(__file__).resolve().parents[1]
idx=(ROOT/'index.html').read_text(encoding='utf-8')
js=(ROOT/'assets/iig.js').read_text(encoding='utf-8')
news=(ROOT/'assets/public-news.js').read_text(encoding='utf-8')
errors=[]

for token in [
    'const SEARCH_STATIC=',
    'content/public-news.json',
    'content/public-advice.json',
    'function initPublicSearch()',
    'runPublicSearchSafe()',
    "find='+encodeURIComponent(q)",
    'score+=200'
]:
    if token not in js:
        errors.append('assets/iig.js missing canonical search token: '+token)

if 'assets/site-search.js' in idx:
    errors.append('index.html must not load duplicate experimental site-search.js')
if 'class="searchbar"' not in idx:
    errors.append('index.html missing searchbar')

for token in ['highlightSearchHit','search-hit','scrollIntoView']:
    if token not in news:
        errors.append('assets/public-news.js missing deep-link highlight token: '+token)

if errors:
    print('SITE SEARCH GATE FAILED')
    for e in errors:
        print(' -',e)
    sys.exit(1)

print('SITE SEARCH GATE OK — canonical restored search')
