#!/usr/bin/env python3
# ADMIN-APPROVED September 2026 PDF materialization trigger.
from pathlib import Path
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'digest/2026-09-review.html').resolve().as_uri()
pdf=ROOT/'digest/IIG-Monthly-Digest-2026-09.pdf'
PUBLIC_BASE='https://developiig-hue.github.io/IIG_PLATFORM_DEMO/'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={"width":1536,"height":1024}, device_scale_factor=1)
    page.goto(html, wait_until='networkidle', timeout=90000)
    # PDF destinations must be public HTTPS URLs, never file:// or local-only anchors.
    page.evaluate("""(base)=>{document.querySelectorAll('a[href]').forEach(a=>{const raw=a.getAttribute('href');if(!raw)return;if(raw.startsWith('#')){a.href=base+'digest/2026-09-review.html'+raw;return;}if(raw.startsWith('../')){a.href=new URL(raw,base+'digest/').href;return;}if(raw.startsWith('./')){a.href=new URL(raw,base+'digest/').href;return;}if(!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw)){a.href=new URL(raw,base+'digest/').href;}})}""", PUBLIC_BASE)
    # Critical usability rule: a reader must not have to hit the tiny arrow precisely.
    # Add invisible full-area anchors over every news row, financing item and engineer tip.
    # The visible design remains unchanged; Chromium exports these overlays as PDF Link annotations.
    page.evaluate("""()=>{
      const addOverlay=(box,href)=>{if(!box||!href||box.querySelector(':scope > .pdf-hit'))return;const cs=getComputedStyle(box);if(cs.position==='static')box.style.position='relative';const a=document.createElement('a');a.className='pdf-hit';a.href=href;a.setAttribute('aria-label','Open detailed IIG material');Object.assign(a.style,{position:'absolute',inset:'0',zIndex:'50',display:'block',background:'transparent',textDecoration:'none'});box.appendChild(a)};
      document.querySelectorAll('.row').forEach(box=>{const a=box.querySelector('a.arr');if(a)addOverlay(box,a.href)});
      document.querySelectorAll('.bullet').forEach(box=>{const card=box.closest('.card');const a=(card&&card.querySelector('a.flink'))||box.querySelector('a[href]');if(a)addOverlay(box,a.href)});
      document.querySelectorAll('.tip').forEach(box=>{const a=box.querySelector('a[href]');if(a)addOverlay(box,a.href)});
      document.querySelectorAll('.teaser').forEach(box=>{const a=box.querySelector('a[href]');if(a)addOverlay(box,a.href)});
    }""")
    page.add_style_tag(content='body{padding:0!important;background:#fff!important}.siteback,.digest-pdf-download{display:none!important}.spread-frame{width:1536px!important;height:1024px!important;margin:0!important}.spread{transform:none!important;width:1536px!important;height:1024px!important;box-shadow:none!important}')
    page.wait_for_timeout(2500)
    page.emulate_media(media='screen')
    page.pdf(path=str(pdf), width='1536px', height='1024px', print_background=True, margin={'top':'0','right':'0','bottom':'0','left':'0'}, page_ranges='1')
    browser.close()
assert pdf.stat().st_size>100_000, 'PDF unexpectedly small'
print(pdf)
