#!/usr/bin/env python3
"""Prepare static deployment: remove demo news and connect approved registry.
Runs on the checked-out deployment artifact; does not approve or publish candidates.
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
registry = json.loads((ROOT / 'content/public-news.json').read_text(encoding='utf-8'))
assert registry['schema'] == 'iig.public-news.v1'
assert isinstance(registry['items'], list)
for item in registry['items']:
    assert item['status'] == 'APPROVED' and item['admin_approved'] is True
    assert item['primary_source_verified'] is True
    assert item['canonical_url'].startswith('https://')
    assert re.fullmatch(r'\d{4}-\d{2}-\d{2}', item['publication_date'])
    assert re.fullmatch(r'[a-z0-9-]+', item['slug'])
    assert len(item['company_context']) == 3
    assert sum(len(str(p.get('ua', p))) for p in item['company_context']) <= 600

script = '<script src="assets/public-news.js" defer></script>'
for name in ('index.html', 'industry.html', 'news.html', 'article.html'):
    file = ROOT / name
    html = file.read_text(encoding='utf-8')
    if name == 'index.html':
        html, n = re.subn(r'(<div class="top-grid"[^>]*>).*?(</div>\s*</section>)', r'\1<p role="status">Завантаження перевірених новин…</p>\2', html, count=1, flags=re.S)
        assert n == 1, 'Homepage news grid not found'
    if name == 'news.html':
        html, n = re.subn(r'(<div class="news-feed"[^>]*>).*?(</div>\s*<aside>)', r'\1<p role="status">Завантаження перевірених новин…</p>\2', html, count=1, flags=re.S)
        assert n == 1, 'News feed not found'
    if name == 'industry.html':
        # Remove the old inline demo-item generator, retaining sector metadata and labels.
        html, n = re.subn(r'<script>const sectors=.*?</script>', '''<script>
const sectors={metallurgy:['Металургія, важка промисловість та машинобудування','Metallurgy & Manufacturing'],food:['Харчова та молочна промисловість','Food & Dairy'],pharma:['Фармацевтична промисловість','Pharmaceuticals'],agriculture:['Сільське господарство та агропереробка','Agriculture'],datacenters:['Дата-центри','Data Centers'],chemical:['Хімічна промисловість','Chemical Industry']};
function renderSector(){const key=new URLSearchParams(location.search).get('sector'),s=sectors[key]||sectors.metallurgy,title=s[document.documentElement.lang==='en'?1:0];for(const id of ['title','crumb'])document.getElementById(id).textContent=title;document.getElementById('intro').textContent=document.documentElement.lang==='en'?'Verified and approved industrial energy news.':'Перевірені та затверджені новини промислової енергетики.';}
renderSector();document.addEventListener('click',e=>{if(e.target.closest('[data-lang]'))setTimeout(renderSector,0)});
</script>''', html, count=1, flags=re.S)
        assert n == 1, 'Industry demo script not found'
        assert 'id="list"' in html
    if script not in html:
        assert '</body>' in html
        html = html.replace('</body>', script + '</body>', 1)
    file.write_text(html, encoding='utf-8')

# Deployment is deliberately blocked if a public listing still contains demo article text.
for name in ('index.html', 'industry.html', 'news.html'):
    html = (ROOT / name).read_text(encoding='utf-8')
    assert script in html
    assert 'Нова промислова газова генерація для підвищення енергостійкості' not in html
    assert 'Industry procurement &amp; de-risking workshop' not in html
print('PASS: approved-only news module connected; demo news removed from home, industry and news deployment pages')
