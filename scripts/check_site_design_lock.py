#!/usr/bin/env python3
from pathlib import Path
import json, sys

ROOT=Path(__file__).resolve().parents[1]
cfg=json.loads((ROOT/"config/site-design-lock.json").read_text(encoding="utf-8"))
errors=[]

def need(path, needle, label):
    text=(ROOT/path).read_text(encoding="utf-8")
    if needle not in text:
        errors.append(f"{path}: missing {label}: {needle}")

index=(ROOT/"index.html").read_text(encoding="utf-8")
shared=(ROOT/"assets/step25-shared-fix.css").read_text(encoding="utf-8")

# Global assets/colors.
need("index.html","#06223d","approved navy")
need("index.html","assets/iig-logo-white.svg","white IIG logo")
need("index.html",cfg["assets"]["hero"],"approved sunrise hero")
need("index.html",cfg["assets"]["chief_engineer"],"approved Chief Engineer image")
need("index.html","STEP25/26 CANONICAL STATIC DESIGN LOCK","static architecture lock")
need("index.html",".advice-mini small{color:#0b2b5c!important","dark navy advice tag rule")

# HOME order.
markers=[
    'class="home-hero"',
    'ПРОГРАМИ ТА МОЖЛИВОСТІ ФІНАНСУВАННЯ',
    'TOP-5 АКТУАЛЬНИХ НОВИН ПРОМИСЛОВОЇ ЕНЕРГЕТИКИ',
    'ДОСЛІДЖУЙТЕ ЗА ГАЛУЗЗЮ',
    'class="bottom-values"'
]
pos=[]
for m in markers:
    p=index.find(m)
    if p<0: errors.append(f"index.html: missing HOME block {m}")
    pos.append(p)
if all(p>=0 for p in pos) and pos!=sorted(pos):
    errors.append("index.html: HOME block order regression")

news_id=index.find('id="homeTop5News"')
industries_id=index.find('id="industries"')
if news_id < 0 or industries_id < 0:
    errors.append("index.html: protected HOME section IDs missing")
elif not news_id < industries_id:
    errors.append("index.html: #homeTop5News MUST precede #industries")

runtime=(ROOT/"assets/iig.js").read_text(encoding="utf-8")
if "insertBefore(industry,news)" in runtime:
    errors.append("assets/iig.js: runtime must not move industries before TOP-5 news")

# Digest must be inside hero and before financing section.
hero_start=index.find('<section class="home-hero">')
finance_start=index.find('ПРОГРАМИ ТА МОЖЛИВОСТІ ФІНАНСУВАННЯ')
digest=index.find('class="digest-card"')
if not (hero_start>=0 and digest>hero_start and digest<finance_start):
    errors.append("index.html: digest must remain inside HOME hero before financing")
need("index.html","width:min(245px","compact digest 245px lock")

# Right rail order.
rail=index.find('<aside class="right-rail">')
right_markers=[
    'class="engineer-photo"',
    'class="engineer-title"',
    '6 ОСТАННІХ ПОРАД',
    'forms.html#engineer',
    'forms.html#project',
    'id="partnerProgram"'
]
rp=[index.find(x,rail) for x in right_markers]
if rail<0 or any(p<0 for p in rp) or rp!=sorted(rp):
    errors.append("index.html: right-rail order regression")

# Finance.
need("index.html","grid-template-columns:repeat(7,1fr)!important","7-column finance grid")
need("index.html","height:102px!important","102px finance card height")
for name in cfg["finance_order"]:
    if name.lower()=="bpifrance": token="bpifrance"
    elif name=="World Bank": token="worldbank"
    else: token=name.lower()
    if token not in index.lower():
        errors.append(f"index.html: missing finance institution {name}")

# Shared public pages.
for page in cfg["public_pages"]:
    text=(ROOT/page).read_text(encoding="utf-8")
    if 'class="site-header"' not in text and 'class="approved-header"' not in text:
        errors.append(f"{page}: shared header class missing")
    if page!="index.html" and "step25-shared-fix.css" not in text:
        errors.append(f"{page}: STEP25 shared visual lock stylesheet missing")

# Shared panorama lock for internal pages.
if cfg["assets"]["hero"] not in shared:
    errors.append("assets/step25-shared-fix.css: approved sunrise asset missing")
if "#06223d" not in shared.lower():
    errors.append("assets/step25-shared-fix.css: navy header lock missing")
if "iig-logo-white.svg" not in shared:
    errors.append("assets/step25-shared-fix.css: white logo lock missing")
if ".advice-mini small{color:#0b2b5c!important" not in shared:
    errors.append("assets/step25-shared-fix.css: advice tag contrast lock missing")

if errors:
    print("STEP26 DESIGN LOCK FAILED")
    for e in errors: print(" -",e)
    sys.exit(1)
print("STEP26 DESIGN LOCK OK:", cfg["version"])
