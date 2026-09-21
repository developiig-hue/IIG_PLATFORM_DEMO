#!/usr/bin/env python3
"""Prepare portable static deployment: nine source-correct news sectors and advice."""
import json
import re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
SECTORS={
 'energy':('Енергетика та енергетична інфраструктура','Power & Energy Infrastructure'),
 'metallurgy':('Металургія, важка промисловість та машинобудування','Metallurgy, Heavy Industry & Manufacturing'),
 'food':('Харчова промисловість та напої','Food & Beverage Industry'),
 'logistics':('Логістика та розподільчі центри','Logistics & Distribution Centers'),
 'datacenters':('Дата-центри','Data Centers'),
 'chemical':('Хімічна промисловість','Chemical Industry'),
 'agriculture':('Сільське господарство та агропереробка','Agriculture & Agro-processing'),
 'pharma':('Фармацевтична промисловість','Pharmaceuticals'),
 'waste':('Управління відходами та переробка','Waste Management & Recycling')}
news_path=ROOT/'content/public-news.json'
registry=json.loads(news_path.read_text(encoding='utf-8'))
assert registry['schema']=='iig.public-news.v1' and isinstance(registry['items'],list)
# Reject a misclassified food-protein story; use a source-verified pharma plant release instead.
registry['items']=[x for x in registry['items'] if x['slug']!='solarfoods-factory02-financing-2026']
pharma=json.loads((ROOT/'content/pharma-news.json').read_text(encoding='utf-8'))
assert pharma['schema']=='iig.public-news.v1' and len(pharma['items'])==1
registry['items'].extend(pharma['items'])
assert len(registry['items'])==9 and {x['sector'] for x in registry['items']}==set(SECTORS),'Exactly one source-backed article per sector required'
slugs=set()
for item in registry['items']:
 assert item['status']=='APPROVED' and item['admin_approved'] is True
 assert item['primary_source_verified'] is True and item['canonical_url'].startswith('https://')
 assert re.fullmatch(r'\d{4}-\d{2}-\d{2}',item['publication_date'])
 assert re.fullmatch(r'[a-z0-9-]+',item['slug']) and item['slug'] not in slugs
 slugs.add(item['slug'])
 assert item['sector'] in SECTORS, f'Unroutable sector: {item["sector"]}'
 assert len(item['company_context'])==3
 assert all(item['title'][l] and item['summary'][l] and item['body'][l] for l in ('ua','en'))
 assert all(p['ua'] and p['en'] for p in item['company_context'])
 assert sum(len(p['ua']) for p in item['company_context'])<=600
news_path.write_text(json.dumps(registry,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
advice=json.loads((ROOT/'content/public-advice.json').read_text(encoding='utf-8'))
assert advice['schema']=='iig.advice.v1' and len(advice['items'])>=6
assert len({x['slug'] for x in advice['items']})==len(advice['items'])
for x in advice['items']:
 assert re.fullmatch(r'[a-z0-9-]+',x['slug'])
 assert all(x['title'][l] and x['summary'][l] for l in ('ua','en'))
 assert len(x['sections'])>=3 and all(all(s[k][l] for k in ('heading','body') for l in ('ua','en')) for s in x['sections'])
for asset in ('assets/public-news.js','assets/public-advice.js','assets/advice-content.css','assets/iig-editorial-illustration.svg','advice-article.html','advice.html','assets/news-editorial.svg'):
 assert (ROOT/asset).is_file(),f'Missing asset: {asset}'
script='<script src="assets/public-news.js" defer></script>'
for name in ('index.html','industry.html','news.html','article.html'):
 file=ROOT/name;html=file.read_text(encoding='utf-8')
 if name=='index.html':
  for sector in SECTORS: assert f'industry.html?sector={sector}' in html, f'Homepage industry missing: {sector}'
  html,n=re.subn(r'(<div class="top-grid"[^>]*>).*?(</div>\s*</section>)',r'\1<p role="status">Завантаження перевірених новин…</p>\2',html,count=1,flags=re.S)
  assert n==1,'Homepage news grid not found'
  advice_script='<script src="assets/public-advice.js" defer></script>'
  if advice_script not in html:html=html.replace('</body>',advice_script+'</body>',1)
  assert 'class="advice-mini"' in html
 if name=='news.html':
  html,n=re.subn(r'(<div class="news-feed"[^>]*>).*?(</div>\s*<aside>)',r'\1<p role="status">Завантаження перевірених новин…</p>\2',html,count=1,flags=re.S)
  assert n==1,'News feed not found'
 if name=='industry.html':
  labels=json.dumps(SECTORS,ensure_ascii=False)
  replacement='''<script>const sectors=SECTOR_LABELS;function renderSector(){const key=new URLSearchParams(location.search).get('sector'),s=sectors[key];const en=document.documentElement.lang==='en';const title=s?s[en?1:0]:(en?'Unknown industry':'Невідома галузь');for(const id of ['title','crumb'])document.getElementById(id).textContent=title;document.getElementById('intro').textContent=en?'Verified and approved industrial energy news.':'Перевірені та затверджені новини промислової енергетики.';}renderSector();document.addEventListener('click',e=>{if(e.target.closest('[data-lang]'))setTimeout(renderSector,0)});</script>'''.replace('SECTOR_LABELS',labels)
  html,n=re.subn(r'<script>const sectors=.*?</script>',lambda _:replacement,html,count=1,flags=re.S)
  assert n==1 and 'id="list"' in html,'Industry news list missing'
 if script not in html:html=html.replace('</body>',script+'</body>',1)
 file.write_text(html,encoding='utf-8')
for name in ('index.html','industry.html','news.html'):
 html=(ROOT/name).read_text(encoding='utf-8')
 assert script in html and 'Нова промислова газова генерація для підвищення енергостійкості' not in html
for name in ('index.html','advice.html','advice-article.html'):
 assert 'assets/public-advice.js' in (ROOT/name).read_text(encoding='utf-8')
coverage={s:sum(x['sector']==s for x in registry['items']) for s in SECTORS}
assert all(v==1 for v in coverage.values())
print('PASS: nine source-checked bilingual news articles, nine unique industry routes and six advice guides')
print('PUBLIC NEWS COVERAGE:',coverage)
