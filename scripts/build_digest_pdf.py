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
    # PDF must contain public HTTPS destinations, not file:// links or same-page anchors.
    page.evaluate("""(base)=>{document.querySelectorAll('a[href]').forEach(a=>{const raw=a.getAttribute('href');if(!raw)return;if(raw.startsWith('#')){a.href=base+'digest/2026-09-review.html'+raw;return;}if(raw.startsWith('../')){a.href=new URL(raw,base+'digest/').href;return;}if(raw.startsWith('./')){a.href=new URL(raw,base+'digest/').href;return;}if(!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(raw)){a.href=new URL(raw,base+'digest/').href;}})}""", PUBLIC_BASE)
    page.add_style_tag(content='body{padding:0!important;background:#fff!important}.siteback,.digest-pdf-download{display:none!important}.spread-frame{width:1536px!important;height:1024px!important;margin:0!important}.spread{transform:none!important;width:1536px!important;height:1024px!important;box-shadow:none!important}')
    page.wait_for_timeout(2500)
    page.emulate_media(media='screen')
    # Chromium PDF output preserves HTML hyperlink annotations.
    page.pdf(path=str(pdf), width='1536px', height='1024px', print_background=True, margin={'top':'0','right':'0','bottom':'0','left':'0'}, page_ranges='1')
    browser.close()
assert pdf.stat().st_size>100_000, 'PDF unexpectedly small'
print(pdf)
