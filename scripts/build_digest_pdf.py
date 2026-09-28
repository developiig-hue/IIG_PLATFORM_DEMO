#!/usr/bin/env python3
from pathlib import Path
import subprocess,sys
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
subprocess.run([sys.executable,str(ROOT/"scripts/build_digest_release.py")],check=True)
src=(ROOT/"digest/2026-09-review.html").resolve().as_uri()
pdf=ROOT/"digest/IIG-Monthly-Digest-2026-09.pdf"
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True)
    page=browser.new_page(viewport={"width":1536,"height":1024},device_scale_factor=1)
    failed=[]
    page.on("requestfailed",lambda req: failed.append(req.url))
    page.goto(src,wait_until="networkidle",timeout=90000)
    page.wait_for_function("""()=>Array.from(document.images).every(i=>i.complete && i.naturalWidth>0)""",timeout=30000)
    if failed: raise SystemExit("DIGEST_PDF_BLOCKED: failed assets "+str(failed))
    page.emulate_media(media="screen")
    page.pdf(path=str(pdf),width="1536px",height="1024px",print_background=True,margin={"top":"0","right":"0","bottom":"0","left":"0"})
    browser.close()
if pdf.stat().st_size<100000: raise SystemExit("DIGEST_PDF_BLOCKED: unexpectedly small PDF")
print("DIGEST_PDF_PASS",{"bytes":pdf.stat().st_size,"pages":2})
