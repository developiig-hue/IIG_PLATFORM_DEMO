#!/usr/bin/env python3
"""IIG Image Rights Robot: evidence-based, fail-closed image selection."""
import argparse,hashlib,json,os,tempfile
from datetime import datetime,timezone
from pathlib import Path
from urllib.parse import urlparse
ROOT=Path(__file__).resolve().parents[1];AUDITS=ROOT/"content/image-moderation";OUT=ROOT/"content/image-rights";QOUT=ROOT/"content/quality-gate"
ALLOWED={"IIG_OWNED","EXPLICIT_PERMISSION","OPEN_LICENSE","PUBLIC_DOMAIN"}
def load(p):
    try:return json.loads(p.read_text(encoding="utf-8"))
    except Exception as e:raise ValueError(f"{p.name}: invalid JSON")
def atomic(p,o):
    p.parent.mkdir(parents=True,exist_ok=True);fd,t=tempfile.mkstemp(dir=p.parent,prefix=p.name)
    try:
        with os.fdopen(fd,"w",encoding="utf-8") as h:json.dump(o,h,ensure_ascii=False,indent=2);h.write("\n");h.flush();os.fsync(h.fileno())
        os.replace(t,p)
    finally:
        if os.path.exists(t):os.unlink(t)
def https(v):
    try:
        u=urlparse(v);return u.scheme=="https" and bool(u.hostname) and not u.username and not u.password and u.hostname!="localhost" and not u.hostname.endswith(".local")
    except Exception:return False
def rights_ok(r):
    if not isinstance(r,dict) or r.get("basis") not in ALLOWED:return False
    if not isinstance(r.get("evidence"),str) or len(r["evidence"].strip())<20:return False
    if r["basis"]=="IIG_OWNED":return isinstance(r.get("asset_sha256"),str) and len(r["asset_sha256"])==64
    return https(r.get("evidence_url",""))
def gates(a):
    bad=[];g=a.get("gates")
    if a.get("schema")!="iig.news-image-audit.v1" or not isinstance(g,dict):return ["audit_contract"]
    for k in ("G1_PROVENANCE","G2_RELEVANCE","G3_RIGHTS","G4_TECHNICAL"):
        v=g.get(k)
        if not isinstance(v,dict) or v.get("status") not in ("PASS","FAIL","NOT_EVALUATED"):bad.append(k+"_status")
        elif not isinstance(v.get("evidence"),str) or len(v["evidence"].strip())<12:bad.append(k+"_evidence")
    return bad
def local_asset(sector,m):
    try:
        meta=m["sectors"][sector];p=(ROOT/meta["image_url"]).resolve()
        if ROOT.resolve() not in p.parents or not p.is_file() or p.stat().st_size<1000:return None
        with p.open("rb") as h:
            if h.read(3)!=bytes([255,216,255]):return None
        return meta
    except Exception:return None
def evaluate(a,m):
    bad=gates(a)
    if bad:return "BLOCK",bad,None
    g=a["gates"];allpass=all(g[k]["status"]=="PASS" for k in ("G1_PROVENANCE","G2_RELEVANCE","G3_RIGHTS","G4_TECHNICAL"))
    if allpass:
        if not rights_ok(a.get("rights_basis")):return "BLOCK",["rights_basis_unproven"],None
        if not https(a.get("candidate_url","")):return "BLOCK",["candidate_url_unsafe"],None
        return "ORIGINAL_SOURCE_IMAGE",[],a["candidate_url"]
    meta=local_asset(a.get("fallback_sector"),m)
    if not meta:return "BLOCK",["fallback_asset_invalid"],None
    if not rights_ok(meta.get("rights_basis")):return "BLOCK",["fallback_rights_unproven"],None
    return "SAME_SECTOR_IIG_FALLBACK",[],meta["image_url"]
def run():
    qr=load(ROOT/"content/quality-gate-report.json")
    if qr.get("schema")!="iig.quality-gate-report.v1" or qr.get("status")!="PASS" or qr.get("next_state")!="IMAGE_RIGHTS":raise SystemExit("IMAGE_RIGHTS_BLOCKED: invalid Quality Gate handoff")
    qa=(ROOT/qr["artifact"]).resolve()
    if QOUT.resolve() not in qa.parents or not qa.is_file():raise SystemExit("IMAGE_RIGHTS_BLOCKED: unsafe Quality Gate artifact")
    q=load(qa);news=[x["item"] for x in q.get("admin_review_queue",[]) if x.get("route")=="news"]
    m=load(ROOT/"baze_foto_news/manifest.json");rows=[]
    for p in sorted(AUDITS.glob("*.json")):
        if p.name=="policy.json":continue
        try:a=load(p);d,b,s=evaluate(a,m)
        except ValueError:a={};d,b,s="BLOCK",["invalid_json"],None
        rows.append({"audit_file":str(p.relative_to(ROOT)),"slug":a.get("slug"),"source_page":a.get("source_page"),"decision":d,"selected_image":s,"reasons":b,"quality_gate_eligible":d!="BLOCK"})
    known={x.get("source_page"):x for x in rows}
    for item in news:
        if item.get("canonical_url") not in known:
            rows.append({"audit_file":None,"slug":item.get("title"),"source_page":item.get("canonical_url"),"decision":"BLOCK","selected_image":None,"reasons":["image_audit_missing"],"quality_gate_eligible":False})
    now=datetime.now(timezone.utc);ident=hashlib.sha256(now.isoformat().encode()).hexdigest()[:16]
    o={"schema":"iig.image-rights.v1","id":ident,"generated_at":now.isoformat(),"status":"READY_FOR_ADMIN_REVIEW","publish_authority":"ADMIN_ONLY","auto_publish":False,"results":rows,"passed_total":sum(x["quality_gate_eligible"] for x in rows),"blocked_total":sum(not x["quality_gate_eligible"] for x in rows),"pipeline":{"robot":"IMAGE_RIGHTS","robot_number":4,"next":"ADMIN_REVIEW","robot_count":7}}
    ap=OUT/f"image-rights-{ident}.json";atomic(ap,o)
    r={"schema":"iig.image-rights-report.v1","status":"PASS","generated_at":now.isoformat(),"artifact":str(ap.relative_to(ROOT)),"evaluated_total":len(rows),"passed_total":o["passed_total"],"blocked_total":o["blocked_total"],"next_state":"ADMIN_REVIEW"}
    atomic(ROOT/"content/image-rights-report.json",r);print("IMAGE_RIGHTS_RUN_PASS",json.dumps(r))
def verify():
    r=load(ROOT/"content/image-rights-report.json");assert r["schema"]=="iig.image-rights-report.v1" and r["status"]=="PASS"
    d=load(ROOT/r["artifact"]);assert d["schema"]=="iig.image-rights.v1" and d["auto_publish"] is False and d["publish_authority"]=="ADMIN_ONLY"
    assert d["passed_total"]+d["blocked_total"]==len(d["results"]);print("IMAGE_RIGHTS_VERIFY_PASS")
def main():
    a=argparse.ArgumentParser();a.add_argument("command",choices=("run","verify"));z=a.parse_args();run() if z.command=="run" else verify()
if __name__=="__main__":main()
