#!/usr/bin/env python3
from pathlib import Path
import sys
ROOT=Path(__file__).resolve().parents[1]
idx=(ROOT/'index.html').read_text(encoding='utf-8')
js=(ROOT/'assets/site-search.js').read_text(encoding='utf-8')
errors=[]
for token in ['content/public-news.json','content/public-advice.json','finance-news.html?institution=eifo','IIGSiteSearch','stopImmediatePropagation']:
    if token not in js: errors.append('site-search.js missing '+token)
if 'assets/site-search.js?v=SITE-SEARCH-V1' not in idx: errors.append('index.html missing standalone search script')
if 'class="searchbar"' not in idx: errors.append('index.html missing searchbar')
if errors:
    print('SITE SEARCH GATE FAILED')
    [print(' -',e) for e in errors]
    sys.exit(1)
print('SITE SEARCH GATE OK')
