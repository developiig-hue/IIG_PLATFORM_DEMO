#!/usr/bin/env python3
# ADMIN-APPROVED September 2026 PDF materialization trigger.
from pathlib import Path
from playwright.sync_api import sync_playwright
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
html=(ROOT/'digest/2026-09-review.html').resolve().as_uri()
png=ROOT/'digest/.digest-render.png'
pdf=ROOT/'digest/IIG-Monthly-Digest-2026-09.pdf'
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={"width":1536,"height":1024}, device_scale_factor=1)
    page.goto(html, wait_until='networkidle', timeout=90000)
    page.add_style_tag(content='body{padding:0!important;background:#fff!important}.siteback,.digest-pdf-download{display:none!important}.spread-frame{width:1536px!important;height:1024px!important;margin:0!important}.spread{transform:none!important;width:1536px!important;height:1024px!important;box-shadow:none!important}')
    page.wait_for_timeout(2500)
    page.locator('.spread').screenshot(path=str(png))
    browser.close()
im=Image.open(png).convert('RGB')
assert im.size==(1536,1024), im.size
im.save(pdf,'PDF',resolution=144.0,quality=95)
png.unlink()
assert pdf.stat().st_size>100_000, 'PDF unexpectedly small'
print(pdf)
