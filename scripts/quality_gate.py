#!/usr/bin/env python3
"""IIG Quality Gate: deterministic fail-closed validation between Content Engine and Admin Review."""
import argparse,hashlib,ipaddress,json,os,tempfile
from datetime import datetime,timezone
from pathlib import Path
from urllib.parse import urlparse
ROOT=Path(__file__).resolve().parents[1];QUEUE=ROOT/"content/review-queue";OUT=ROOT/"content/quality-gate";IMG=ROOT/"content/image-moderation"
IN_SCHEMA="iig.content-engine.v3";OUT_SCHEMA="iig.quality-gate.v1";REPORT_SCHEMA="iig.quality-gate-report.v1"
def load(p):
    try:return json.loads(p.read_text(encoding="utf-8"))
    except (OSError,json.JSONDecodeError) as e:raise ValueError(f"{p.name}: invalid JSON: {e}")
def atomic(p,obj):
    p.parent.mkdir(parents=True,exist_ok=True);fd,tmp=tempfile.mkstemp(prefix=p.name+".",suffix=".tmp",dir=p.parent)
    try:
        with os.fdopen(fd,"w",encoding="utf-8") as h:json.dump(obj,h,ensure_ascii=False,indent=2);h.write("\n");h.flush();os.fsync(h.fileno())
        os.replace(tmp,p)
    finally:
        if os.path.exists(tmp):os.unlink(tmp)
def safe_https(v):
    try:
        p=urlparse(v);h=(p.hostname or "").lower()
        if p.scheme!="https" or not h or p.username or p.password or h=="localhost" or h.endswith(".local"):return False
        try:
            ip=ipaddress.ip_address(h)
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:return False
        except ValueError:pass
        return True
    except Exception:return False
def latest_input():
    rp=ROOT/"content/content-engine-report.json"
    if not rp.is_file():raise SystemExit("QUALITY_GATE_BLOCKED: missing Content Engine report")
    r=load(rp)
    if r.get("schema")!="iig.content-engine-report.v1" or r.get("status")!="PASS":raise SystemExit("QUALITY_GATE_BLOCKED: invalid Content Engine report")
    rel=r.get("artifact")
    if not isinstance(rel,str) or not rel:raise SystemExit("QUALITY_GATE_BLOCKED: missing Content Engine artifact reference")
    p=(ROOT/rel).resolve();root=QUEUE.resolve()
    if root not in p.parents:raise SystemExit("QUALITY_GATE_BLOCKED: unsafe Content Engine artifact path")
    if not p.is_file():raise SystemExit("QUALITY_GATE_BLOCKED: referenced Content Engine artifact missing")
    d=load(p)
    if r.get("kind") and d.get("kind")!=r["kind"]:raise SystemExit("QUALITY_GATE_BLOCKED: report/artifact kind mismatch")
    return p,d
def image_audits():
    out=[]
    for p in IMG.glob("*.json"):
        if p.name=="policy.json":continue
        try:d=load(p)
        except ValueError:continue
        if d.get("schema")=="iig.news-image-audit.v1":out.append(d)
    return out
def image_evidence(item,audits):
    u=item.get("canonical_url","")
    for a in audits:
        if a.get("source_page")==u:return a
    return None
def validate_image(a,item):
    if not isinstance(a,dict) or a.get("schema")!="iig.news-image-audit.v1":return ["image_audit_schema"]
    decision=a.get("decision")
    if decision=="ORIGINAL_SOURCE_IMAGE":
        g=a.get("gates",{})
        if any(g.get(k,{}).get("status")!="PASS" for k in ("G1_PROVENANCE","G2_RELEVANCE","G3_RIGHTS","G4_TECHNICAL")):return ["original_image_four_gate_failure"]
        return []
    if decision=="SAME_SECTOR_IIG_FALLBACK":
        sector=item.get("sector")
        if not sector or a.get("fallback_sector")!=sector:return ["image_fallback_sector_mismatch"]
        try:m=load(ROOT/"baze_foto_news/manifest.json");meta=m["sectors"][sector];asset=ROOT/meta["image_url"]
        except Exception:return ["image_fallback_manifest_invalid"]
        if not asset.is_file():return ["image_fallback_asset_missing"]
        return []
    return ["image_decision_invalid"]
def validate_item(x,audits):
    reasons=[];typ=x.get("type")
    if typ not in ("news","chief-engineer-advice"):reasons.append("invalid_type")
    for k in ("title","company_name","project","technology","project_status","project_status_evidence","date","canonical_url","company_context"):
        if not isinstance(x.get(k),str) or not x[k].strip():reasons.append("missing_"+k)
    if x.get("primary_source_verified") is not True:reasons.append("primary_source_unverified")
    try:
        when=datetime.fromisoformat(x.get("date","").replace("Z","+00:00"))
        if when.tzinfo and when>datetime.now(timezone.utc):reasons.append("future_date")
    except Exception:reasons.append("invalid_date")
    if not safe_https(x.get("canonical_url","")):reasons.append("unsafe_canonical_url")
    if typ=="chief-engineer-advice":
        a=x.get("advice")
        if not isinstance(a,dict) or any(not isinstance(a.get(k),str) or len(a[k].strip())<40 for k in ("problem","checks","technical_solution","management_decision")):reasons.append("advice_four_block_contract")
    if typ=="news":
        if not x.get("sector"):reasons.append("news_sector_missing")
        audit=image_evidence(x,audits)
        if not audit:reasons.append("image_validation_missing")
        else:reasons.extend(validate_image(audit,x))
    return sorted(set(reasons))
def gate(doc):
    fatal=[]
    if doc.get("schema")!=IN_SCHEMA:fatal.append("input_schema_mismatch")
    if doc.get("status")!="READY_FOR_REVIEW":fatal.append("input_not_ready_for_review")
    if doc.get("publish_authority")!="ADMIN_ONLY" or doc.get("auto_publish") is not False:fatal.append("governance_invariant")
    pipe=doc.get("pipeline",{})
    if pipe.get("engine")!="CONTENT_ENGINE" or pipe.get("next")!="QUALITY_GATE" or pipe.get("robot_count")!=7:fatal.append("pipeline_contract")
    if doc.get("discovery_intake",{}).get("raw_discovery_never_publishable") is not True:fatal.append("raw_discovery_boundary_missing")
    outputs=doc.get("outputs")
    if not isinstance(outputs,dict) or set(outputs)!={"news","chief_engineer_advice"}:fatal.append("routing_contract")
    if fatal:return fatal,[]
    audits=image_audits();results=[];seen=set()
    for route,expected in (("news","news"),("chief_engineer_advice","chief-engineer-advice")):
        rows=outputs.get(route,[])
        if not isinstance(rows,list):return ["route_not_list:"+route],[]
        for i,x in enumerate(rows):
            reasons=validate_item(x,audits) if isinstance(x,dict) else ["not_object"]
            if isinstance(x,dict) and x.get("type")!=expected:reasons.append("route_type_mismatch")
            key=(x.get("canonical_url",""),expected) if isinstance(x,dict) else ("",expected)
            if key in seen:reasons.append("duplicate_route_item")
            seen.add(key)
            payload=x if isinstance(x,dict) else None
            integrity=hashlib.sha256(json.dumps(payload,ensure_ascii=False,sort_keys=True,separators=(",",":")).encode()).hexdigest() if payload is not None else None
            results.append({"route":route,"index":i,"title":x.get("title") if isinstance(x,dict) else None,"canonical_url":x.get("canonical_url") if isinstance(x,dict) else None,"decision":"PASS" if not reasons else "BLOCK","reasons":sorted(set(reasons)),"admin_eligible":not reasons,"item_sha256":integrity,"item":payload})
    return [],results
def run():
    p,doc=latest_input();fatal,results=gate(doc)
    if fatal:raise SystemExit("QUALITY_GATE_BLOCKED: "+";".join(fatal))
    passed=[x for x in results if x["decision"]=="PASS"];blocked=[x for x in results if x["decision"]=="BLOCK"]
    now=datetime.now(timezone.utc);ident=hashlib.sha256((doc["id"]+now.isoformat()).encode()).hexdigest()[:16]
    artifact={"schema":OUT_SCHEMA,"id":ident,"generated_at":now.isoformat(),"input_artifact":str(p.relative_to(ROOT)),"input_id":doc["id"],"status":"READY_FOR_ADMIN_REVIEW","publish_authority":"ADMIN_ONLY","auto_publish":False,"evaluated_total":len(results),"passed_total":len(passed),"blocked_total":len(blocked),"results":results,"admin_review_queue":passed,"blocked_items":blocked,"pipeline":{"previous":"CONTENT_ENGINE","gate":"QUALITY_GATE","next":"ADMIN_REVIEW","robot_count":7},"audit":{"rule":"NO_AUTO_PUBLISH","blocked_items_never_admin_eligible":True}}
    ap=OUT/f"quality-{ident}.json";atomic(ap,artifact)
    report={"schema":REPORT_SCHEMA,"generated_at":now.isoformat(),"status":"PASS","input_id":doc["id"],"evaluated_total":len(results),"passed_total":len(passed),"blocked_total":len(blocked),"news_evaluated":sum(x["route"]=="news" for x in results),"advice_evaluated":sum(x["route"]=="chief_engineer_advice" for x in results),"artifact":str(ap.relative_to(ROOT)),"next_state":"ADMIN_REVIEW"}
    atomic(ROOT/"content/quality-gate-report.json",report);print("QUALITY_GATE_RUN_PASS",json.dumps(report))
def verify():
    for p in OUT.glob("quality-*.json"):
        d=load(p);assert d["schema"]==OUT_SCHEMA and d["auto_publish"] is False and d["publish_authority"]=="ADMIN_ONLY"
        assert d["pipeline"]["next"]=="ADMIN_REVIEW" and d["pipeline"]["robot_count"]==7
        assert all(x["decision"]=="PASS" and x["admin_eligible"] for x in d["admin_review_queue"])
        assert all(x["decision"]=="BLOCK" and not x["admin_eligible"] for x in d["blocked_items"])
    print("QUALITY_GATE_VERIFY_PASS")
def main():
    a=argparse.ArgumentParser();a.add_argument("command",choices=("run","verify"));z=a.parse_args();run() if z.command=="run" else verify()
if __name__=="__main__":main()
