#!/usr/bin/env python3
"""IIG Robot #5: human Admin Review and publication authorization."""
import argparse,hashlib,json,os,re,tempfile,unicodedata
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
IN_DIR=ROOT/"content/image-rights";OUT=ROOT/"content/admin-review";PUB=ROOT/"content/publication"
def load(p):
    try:return json.loads(p.read_text(encoding="utf-8"))
    except Exception:raise ValueError(f"{p.name}: invalid JSON")
def atomic(p,o):
    p.parent.mkdir(parents=True,exist_ok=True);fd,t=tempfile.mkstemp(dir=p.parent,prefix=p.name)
    try:
        with os.fdopen(fd,"w",encoding="utf-8") as h:
            json.dump(o,h,ensure_ascii=False,indent=2);h.write("
");h.flush();os.fsync(h.fileno())
        os.replace(t,p)
    finally:
        if os.path.exists(t):os.unlink(t)
def sha(item):return hashlib.sha256(json.dumps(item,ensure_ascii=False,sort_keys=True,separators=(",",":")).encode()).hexdigest()
def upstream():
    r=load(ROOT/"content/image-rights-report.json")
    if r.get("schema")!="iig.image-rights-report.v1" or r.get("status")!="PASS" or r.get("next_state")!="ADMIN_REVIEW":
        raise SystemExit("ADMIN_REVIEW_BLOCKED: invalid Image Rights report")
    p=(ROOT/r.get("artifact","")).resolve()
    if IN_DIR.resolve() not in p.parents or not p.is_file():raise SystemExit("ADMIN_REVIEW_BLOCKED: unsafe upstream artifact")
    d=load(p)
    if d.get("schema")!="iig.image-rights.v1" or d.get("status")!="READY_FOR_ADMIN_REVIEW" or d.get("publish_authority")!="ADMIN_ONLY" or d.get("auto_publish") is not False:
        raise SystemExit("ADMIN_REVIEW_BLOCKED: invalid upstream governance")
    q=d.get("admin_review_queue")
    if not isinstance(q,list):raise SystemExit("ADMIN_REVIEW_BLOCKED: queue missing")
    seen=set()
    for x in q:
        if not isinstance(x,dict) or x.get("route") not in ("news","chief_engineer_advice") or not isinstance(x.get("item"),dict):
            raise SystemExit("ADMIN_REVIEW_BLOCKED: malformed queue item")
        h=x.get("item_sha256")
        if not isinstance(h,str) or len(h)!=64 or h!=sha(x["item"]):raise SystemExit("ADMIN_REVIEW_BLOCKED: payload integrity")
        if h in seen:raise SystemExit("ADMIN_REVIEW_BLOCKED: duplicate payload")
        seen.add(h)
        if x["route"]=="news" and (x.get("image_required") is not True or not x.get("selected_image")):
            raise SystemExit("ADMIN_REVIEW_BLOCKED: NEWS bypassed Image Rights")
    return p,d,q
def prepare():
    p,d,q=upstream();now=datetime.now(timezone.utc).isoformat()
    rows=[{"item_sha256":x["item_sha256"],"route":x["route"],"title":x["item"].get("title"),"state":"PENDING_ADMIN_DECISION"} for x in q]
    o={"schema":"iig.admin-review.v1","generated_at":now,"upstream_artifact":str(p.relative_to(ROOT)),"status":"AWAITING_ADMIN","authority":"ADMIN_ONLY","auto_approve":False,"auto_publish":False,"queue":rows,"pipeline":{"robot":"ADMIN_REVIEW_PUBLICATION","robot_number":5,"previous":"IMAGE_RIGHTS","next":"DIGEST","robot_count":7}}
    atomic(OUT/"review-queue.json",o)
    r={"schema":"iig.admin-review-report.v1","status":"PASS","generated_at":now,"queue_total":len(rows),"pending_total":len(rows),"approved_total":0,"rejected_total":0,"next_state":"ADMIN_DECISION_REQUIRED"}
    atomic(ROOT/"content/admin-review-report.json",r);print("ADMIN_REVIEW_PREPARE_PASS",json.dumps(r))
def public_slug(item,h):
    raw=unicodedata.normalize('NFKD',str(item.get('title',''))).encode('ascii','ignore').decode().lower()
    raw=re.sub(r'[^a-z0-9]+','-',raw).strip('-')[:70]
    return (raw or 'iig-material')+'-'+h[:10]
def valid_reviewer(v):return isinstance(v,str) and 2<=len(v.strip())<=120 and bool(re.fullmatch(r"[\w .@+\-]+",v.strip(),re.UNICODE))
def decide(item_sha,decision,reviewer,reason):
    p,d,q=upstream()
    if decision not in ("APPROVED","REJECTED"):raise SystemExit("ADMIN_REVIEW_BLOCKED: invalid decision")
    if not valid_reviewer(reviewer):raise SystemExit("ADMIN_REVIEW_BLOCKED: reviewer identity required")
    if not isinstance(reason,str) or len(reason.strip())<5 or len(reason)>1000:raise SystemExit("ADMIN_REVIEW_BLOCKED: decision reason required")
    matches=[x for x in q if x["item_sha256"]==item_sha]
    if len(matches)!=1:raise SystemExit("ADMIN_REVIEW_BLOCKED: item not in immutable upstream queue")
    ledger=OUT/"decisions.json";doc=load(ledger) if ledger.is_file() else {"schema":"iig.admin-decisions.v1","decisions":[]}
    if doc.get("schema")!="iig.admin-decisions.v1" or not isinstance(doc.get("decisions"),list):raise SystemExit("ADMIN_REVIEW_BLOCKED: invalid decision ledger")
    if any(x.get("item_sha256")==item_sha for x in doc["decisions"]):raise SystemExit("ADMIN_REVIEW_BLOCKED: terminal decision already exists")
    now=datetime.now(timezone.utc).isoformat();x=matches[0]
    rec={"item_sha256":item_sha,"route":x["route"],"decision":decision,"reviewer":reviewer.strip(),"reason":reason.strip(),"decided_at":now,"upstream_artifact":str(p.relative_to(ROOT))}
    doc["decisions"].append(rec);atomic(ledger,doc)
    if decision=="APPROVED":
        PUB.mkdir(parents=True,exist_ok=True);pp=PUB/"approved-content.json"
        pd=load(pp) if pp.is_file() else {"schema":"iig.publication-handoff.v1","items":[]}
        if pd.get("schema")!="iig.publication-handoff.v1" or not isinstance(pd.get("items"),list):raise SystemExit("ADMIN_REVIEW_BLOCKED: publication ledger invalid")
        if any(y.get("item_sha256")==item_sha for y in pd["items"]):raise SystemExit("ADMIN_REVIEW_BLOCKED: duplicate publication authorization")
        pd["items"].append({"item_sha256":item_sha,"route":x["route"],"item":x["item"],"public_slug":public_slug(x["item"],item_sha),"selected_image":x.get("selected_image"),"admin_approval":rec,"publication_authorized":True,"next":"DIGEST"})
        atomic(pp,pd)
    print("ADMIN_DECISION_RECORDED",json.dumps(rec,ensure_ascii=False))
def verify():
    _,_,q=upstream();qp=OUT/"review-queue.json";d=load(qp)
    assert d["schema"]=="iig.admin-review.v1" and d["authority"]=="ADMIN_ONLY" and d["auto_approve"] is False and d["auto_publish"] is False
    assert d["pipeline"]=={"robot":"ADMIN_REVIEW_PUBLICATION","robot_number":5,"previous":"IMAGE_RIGHTS","next":"DIGEST","robot_count":7}
    assert len(d["queue"])==len(q) and all(x["state"]=="PENDING_ADMIN_DECISION" for x in d["queue"])
    print("ADMIN_REVIEW_VERIFY_PASS",json.dumps({"queue_total":len(q)}))
def main():
    a=argparse.ArgumentParser();sub=a.add_subparsers(dest="cmd",required=True)
    sub.add_parser("prepare");sub.add_parser("verify")
    d=sub.add_parser("decide");d.add_argument("--item-sha",required=True);d.add_argument("--decision",required=True,choices=("APPROVED","REJECTED"));d.add_argument("--reviewer",required=True);d.add_argument("--reason",required=True)
    z=a.parse_args()
    if z.cmd=="prepare":prepare()
    elif z.cmd=="verify":verify()
    else:decide(z.item_sha,z.decision,z.reviewer,z.reason)
if __name__=="__main__":main()
