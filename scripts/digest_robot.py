#!/usr/bin/env python3
"""IIG Robot #6: build an approved-content digest with safe IIG links."""
import argparse,hashlib,html,json,os,tempfile
from datetime import datetime,timezone
from pathlib import Path
from urllib.parse import quote,urljoin,urlparse
ROOT=Path(__file__).resolve().parents[1]
IN=ROOT/"content/publication/approved-content.json";OUT=ROOT/"content/digest"
DEFAULT_BASE="https://developiig-hue.github.io/IIG_PLATFORM_DEMO/"
def load(p):
    try:return json.loads(p.read_text(encoding="utf-8"))
    except Exception:raise SystemExit(f"DIGEST_BLOCKED: invalid JSON {p.name}")
def atomic(p,o):
    p.parent.mkdir(parents=True,exist_ok=True);fd,t=tempfile.mkstemp(dir=p.parent,prefix=p.name)
    try:
        with os.fdopen(fd,"w",encoding="utf-8") as h:json.dump(o,h,ensure_ascii=False,indent=2);h.flush();os.fsync(h.fileno())
        os.replace(t,p)
    finally:
        if os.path.exists(t):os.unlink(t)
def sha(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(",",":")).encode()).hexdigest()
def base_url():
    b=os.getenv("IIG_PUBLIC_BASE_URL",DEFAULT_BASE).strip()
    u=urlparse(b)
    if u.scheme!="https" or not u.hostname or u.username or u.password:raise SystemExit("DIGEST_BLOCKED: IIG_PUBLIC_BASE_URL must be public HTTPS")
    return b if b.endswith("/") else b+"/"
def upstream():
    d=load(IN)
    if d.get("schema")!="iig.publication-handoff.v1" or not isinstance(d.get("items"),list):raise SystemExit("DIGEST_BLOCKED: invalid Admin publication handoff")
    seen=set()
    for x in d["items"]:
        if not isinstance(x,dict) or x.get("publication_authorized") is not True or x.get("next")!="DIGEST":raise SystemExit("DIGEST_BLOCKED: unauthorized item")
        item=x.get("item");h=x.get("item_sha256");a=x.get("admin_approval")
        if not isinstance(item,dict) or not isinstance(h,str) or h!=sha(item):raise SystemExit("DIGEST_BLOCKED: item integrity")
        if h in seen:raise SystemExit("DIGEST_BLOCKED: duplicate item");seen.add(h)
        if not isinstance(a,dict) or a.get("decision")!="APPROVED" or a.get("item_sha256")!=h or not a.get("reviewer") or not a.get("reason") or not a.get("decided_at"):raise SystemExit("DIGEST_BLOCKED: explicit Admin approval missing")
        if x.get("route")=="news" and not x.get("selected_image"):raise SystemExit("DIGEST_BLOCKED: NEWS image authorization missing")
        slug=x.get("public_slug","")
        if not isinstance(slug,str) or not __import__("re").fullmatch(r"[a-z0-9-]{3,90}",slug):raise SystemExit("DIGEST_BLOCKED: stable public slug missing")
        if x.get("route") not in ("news","chief_engineer_advice"):raise SystemExit("DIGEST_BLOCKED: invalid route")
    return d
def public_link(x,b):
    page="article.html" if x["route"]=="news" else "advice-article.html"
    return urljoin(b,page)+"?id="+quote(x["public_slug"],safe="")
def build():
    d=upstream();b=base_url();now=datetime.now(timezone.utc).isoformat()
    items=[]
    for x in d["items"]:
        it=x["item"];items.append({"item_sha256":x["item_sha256"],"route":x["route"],"title":it.get("title",""),"url":public_link(x,b),"selected_image":x.get("selected_image")})
    ctas={"submit_project":urljoin(b,"forms.html#project"),"subscribe_digest":urljoin(b,"forms.html#subscribe"),"site":b}
    digest={"schema":"iig.digest.v1","generated_at":now,"status":"READY_FOR_ADMIN_APPROVAL","publication_authority":"ADMIN_ONLY","auto_send":False,"source":"ADMIN_APPROVED_PUBLICATION_HANDOFF","items":items,"ctas":ctas,"pipeline":{"robot":"DIGEST","robot_number":6,"previous":"ADMIN_REVIEW_PUBLICATION","next":"SCHEDULER_ORCHESTRATION","robot_count":7}}
    atomic(OUT/"digest.json",digest)
    cards="".join(f'<article><h2>{html.escape(str(x["title"]))}</h2><a href="{html.escape(x["url"],quote=True)}">Читати на сайті IIG →</a></article>' for x in items)
    body=f'''<!doctype html><html lang="uk"><head><meta charset="utf-8"><title>IIG Digest</title></head><body><header><a href="{html.escape(b,quote=True)}">IIG</a><h1>IIG Monthly Digest</h1></header><main>{cards}</main><footer><a href="{html.escape(ctas["submit_project"],quote=True)}">Розмістити проєкт</a> · <a href="{html.escape(ctas["subscribe_digest"],quote=True)}">Підписатися на Дайджест</a></footer></body></html>'''
    (OUT/"digest.html").write_text(body,encoding="utf-8")
    r={"schema":"iig.digest-report.v1","status":"PASS","generated_at":now,"items_total":len(items),"active_iig_links":len(items),"cta_links":2,"artifact":"content/digest/digest.json","html":"content/digest/digest.html","next_state":"DIGEST_ADMIN_APPROVAL_REQUIRED"}
    atomic(ROOT/"content/digest-report.json",r);print("DIGEST_BUILD_PASS",json.dumps(r))
def verify():
    d=load(OUT/"digest.json");h=(OUT/"digest.html").read_text(encoding="utf-8");b=base_url()
    if d.get("schema")!="iig.digest.v1" or d.get("status")!="READY_FOR_ADMIN_APPROVAL" or d.get("publication_authority")!="ADMIN_ONLY" or d.get("auto_send") is not False:raise SystemExit("DIGEST_BLOCKED: governance")
    if d.get("pipeline")!={"robot":"DIGEST","robot_number":6,"previous":"ADMIN_REVIEW_PUBLICATION","next":"SCHEDULER_ORCHESTRATION","robot_count":7}:raise SystemExit("DIGEST_BLOCKED: pipeline")
    for x in d.get("items",[]):
        if not x.get("url","").startswith(b) or x["url"] not in h:raise SystemExit("DIGEST_BLOCKED: item IIG link")
    if d.get("ctas",{}).get("submit_project")!=urljoin(b,"forms.html#project") or d["ctas"].get("subscribe_digest")!=urljoin(b,"forms.html#subscribe"):raise SystemExit("DIGEST_BLOCKED: CTA")
    if d["ctas"]["submit_project"] not in h or d["ctas"]["subscribe_digest"] not in h:raise SystemExit("DIGEST_BLOCKED: inactive CTA")
    print("DIGEST_VERIFY_PASS",json.dumps({"items_total":len(d["items"]),"active_iig_links":len(d["items"]),"cta_links":2}))
def approve(reviewer,reason):
    d=load(OUT/"digest.json")
    if d.get("status")!="READY_FOR_ADMIN_APPROVAL" or d.get("auto_send") is not False:raise SystemExit("DIGEST_BLOCKED: digest not approvable")
    if not reviewer.strip() or len(reason.strip())<5:raise SystemExit("DIGEST_BLOCKED: reviewer/reason required")
    digest_sha=sha(d);now=datetime.now(timezone.utc).isoformat()
    a={"schema":"iig.digest-approval.v1","digest_sha256":digest_sha,"decision":"APPROVED","reviewer":reviewer.strip(),"reason":reason.strip(),"approved_at":now,"delivery_authorized":True,"next":"SCHEDULER_ORCHESTRATION"}
    atomic(OUT/"approved-digest.json",{"schema":"iig.approved-digest.v1","digest":d,"approval":a})
    print("DIGEST_ADMIN_APPROVAL_RECORDED",json.dumps(a,ensure_ascii=False))
def main():
    p=argparse.ArgumentParser();p.add_argument("cmd",choices=("build","verify","approve"));p.add_argument("--reviewer",default="");p.add_argument("--reason",default="");a=p.parse_args();build() if a.cmd=="build" else verify() if a.cmd=="verify" else approve(a.reviewer,a.reason)
if __name__=="__main__":main()
