#!/usr/bin/env python3
"""Build a QA-only news page from live discovery output. Never writes public-news.json."""
import argparse, html, json
from datetime import datetime, timezone
from pathlib import Path

def esc(v): return html.escape(str(v or ''), quote=True)

def main():
    p=argparse.ArgumentParser(); p.add_argument('--input',required=True); p.add_argument('--output',required=True); p.add_argument('--max-items',type=int,default=36)
    a=p.parse_args(); data=json.loads(Path(a.input).read_text(encoding='utf-8'))
    items=[]
    seen=set()
    for x in data.get('items',[]):
        url=x.get('canonical_url',''); title=x.get('title','').strip()
        if not url or url in seen or len(title)<12: continue
        seen.add(url); items.append(x)
        if len(items)>=a.max_items: break
    now=datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
    cards=[]
    for x in items:
        srcdate=x.get('source_published_at_unverified','').strip()
        date=srcdate or ('IIG QA publication · '+now)
        summary=x.get('summary_unverified','').strip() or 'Матеріал знайдено News Source Robot. Повний зміст і фактичні твердження потребують перевірки Content/Quality Gate.'
        cards.append(f"""<article class="card"><div class="meta">{esc(x.get('priority'))} · {esc(x.get('sector'))} · {esc(x.get('publisher'))}</div><h2>{esc(x.get('title'))}</h2><p>{esc(summary)}</p><div class="date">{esc(date)}</div><a href="{esc(x.get('canonical_url'))}" target="_blank" rel="noopener noreferrer">ДЖЕРЕЛО →</a></article>""")
    page=f"""<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>IIG News Robot — Live QA</title><style>body{{font-family:Arial,sans-serif;margin:0;background:#f5f6f8;color:#18202b}}header,main{{max-width:1180px;margin:auto;padding:28px}}header{{background:#10253f;color:white;max-width:none}}header>div{{max-width:1180px;margin:auto}}.note{{background:#fff3cd;padding:14px;border-radius:8px;margin:20px 0}}.grid{{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:18px}}.card{{background:white;padding:20px;border-radius:10px;box-shadow:0 2px 10px #0001}}.meta,.date{{font-size:12px;color:#687384;text-transform:uppercase}}h2{{font-size:20px}}a{{display:inline-block;margin-top:14px;font-weight:bold;color:#0a5796}}</style></head><body><header><div><h1>IIG News Robot — LIVE QA</h1><p>Автоматичне наповнення після обходу 260 джерел · {esc(now)}</p></div></header><main><div class="note"><b>QA DEMO:</b> це автоматично відібрані discovery-матеріали для оцінки якості робота. Вони не є production-публікаціями та не змінюють public-news.json.</div><div class="grid">{''.join(cards)}</div></main></body></html>"""
    Path(a.output).write_text(page,encoding='utf-8')
    print(json.dumps({'qa_items':len(items),'output':a.output}))
if __name__=='__main__': main()
