#!/usr/bin/env python3
from pathlib import Path
import re, sys

root=Path("dist/IIG_PRODUCTION_DEPLOY_PACKAGE/public").resolve()
errors=[]

for page in root.rglob("*.html"):
    text=page.read_text(encoding="utf-8", errors="ignore")
    for href in re.findall(r'href=["\']([^"\']+)["\']', text):
        if href.startswith(("http://","https://","mailto:","tel:","#","javascript:","data:")):
            continue
        if "${" in href or "{{" in href or "<%" in href:
            continue
        target=href.split("#",1)[0].split("?",1)[0]
        if not target:
            continue
        p=(page.parent/target).resolve()
        try:
            p.relative_to(root)
        except ValueError:
            errors.append(f"{page.relative_to(root)} -> {href} [escapes root]")
            continue
        if p.is_dir():
            p=p/"index.html"
        if not p.exists():
            errors.append(f"{page.relative_to(root)} -> {href}")

if errors:
    print("PACKAGE INTERNAL LINKS FAILED")
    for e in errors:
        print(" -",e)
    sys.exit(1)

print("PACKAGE INTERNAL LINKS OK")
