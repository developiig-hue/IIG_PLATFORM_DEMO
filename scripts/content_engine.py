#!/usr/bin/env python3
"""IIG Content Engine production router. Research/enrichment + two review outputs. Never publishes."""
import argparse,hashlib,ipaddress,json,os,re,tempfile
from datetime import datetime,timezone,timedelta
from pathlib import Path
from urllib.parse import urlparse
ROOT=Path(__file__).resolve().parents[1];QUEUE=ROOT/"content/review-queue";POLICY=ROOT/"content/moderation-policy.json";CAND=ROOT/"content/candidates"
SCHEMA="iig.content-engine.v4"; DISCOVERY_SCHEMA="iig.discovery-candidates.v1"
TYPES={"news":"news","chief-engineer-advice":"chief_engineer_advice"}
REQ=("title","company_name","company_activity","project","technology","project_status","project_status_evidence","date","canonical_url","company_context")
EVENT_TYPES={"EXHIBITION","CONFERENCE","FORUM","SUMMIT","CONGRESS","PUBLIC_PRESENTATION","INDUSTRY_EVENT"}
NEWS_MIN_CHARS=600
def load_json(p):
    try:return json.loads(p.read_text(encoding="utf-8"))
    except (OSError,json.JSONDecodeError) as e:raise ValueError(f"{p.name}: invalid JSON: {e}")
def atomic_json(p,obj):
    p.parent.mkdir(parents=True,exist_ok=True)
    fd,tmp=tempfile.mkstemp(prefix=p.name+".",suffix=".tmp",dir=p.parent)
    try:
        with os.fdopen(fd,"w",encoding="utf-8") as h:json.dump(obj,h,ensure_ascii=False,indent=2);h.write("\n");h.flush();os.fsync(h.fileno())
        os.replace(tmp,p)
    finally:
        if os.path.exists(tmp):os.unlink(tmp)
def policy():return load_json(POLICY)
def https_url(v):
    try:
        p=urlparse(v);h=(p.hostname or "").lower()
        if p.scheme!="https" or not h or p.username or p.password or h=="localhost" or h.endswith(".local"):return False
        try:
            ip=ipaddress.ip_address(h)
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:return False
        except ValueError:pass
        return True
    except Exception:return False
def iso_date(v):
    try:return datetime.fromisoformat(v.replace("Z","+00:00"))
    except Exception:return None
def score(x):return sum(max(0,min(5,int(x.get(k,0)))) for k in ("evidence","practical_value","transferability","technology_diversity","decision_maker_value"))
def validate_curated(x):
    errors=[]
    if not isinstance(x,dict):return ["not_object"]
    if x.get("type") not in TYPES:errors.append("invalid_type")
    for k in REQ:
        if not isinstance(x.get(k),str) or not x[k].strip():errors.append("missing_"+k)
    if errors:return errors
    if not https_url(x["canonical_url"]):errors.append("unsafe_canonical_url")
    if x.get("primary_source_verified") is not True:errors.append("primary_source_unverified")
    if not iso_date(x["date"]):errors.append("invalid_date")
    ps=x.get("supplementary_sources",[])
    if ps and (not isinstance(ps,list) or any(not isinstance(u,str) or not https_url(u) for u in ps)):errors.append("invalid_supplementary_sources")
    paras=[p.strip() for p in x["company_context"].split("\n\n")]
    if len(paras)!=3 or any(not p for p in paras) or len(x["company_context"])>600:errors.append("company_context_contract")
    q=x.get("executive_quote")
    if q:
        if not isinstance(q,dict) or any(not q.get(k) for k in ("verbatim","full_name","position","source_url")):errors.append("invalid_quote")
        elif not https_url(q["source_url"]):errors.append("unsafe_quote_url")
    if x.get("type")=="news":
        body=x.get("body")
        if not isinstance(body,str) or len(body.strip())<NEWS_MIN_CHARS:errors.append("news_body_min_600")
        if not isinstance(x.get("iig_advice"),str) or len(x["iig_advice"].strip())<80:errors.append("news_iig_advice_required")
        et=str(x.get("event_type") or "").upper()
        tag=str(x.get("editorial_tag") or "").upper()
        if et in EVENT_TYPES and tag!="EVENT":errors.append("event_tag_must_be_EVENT")
        if not x.get("executive_quote") and x.get("quote_search_status") not in ("NOT_FOUND","NOT_APPLICABLE"):errors.append("quote_search_status_required")
    if x.get("type")=="chief-engineer-advice":
        a=x.get("advice")
        if a is not None:
            if not isinstance(a,dict) or any(not isinstance(a.get(k),str) or len(a[k].strip())<40 for k in ("problem","checks","technical_solution","management_decision")):errors.append("advice_four_block_contract")
    return errors
def discovery_intake():
    p=CAND/"discovered-candidates.json"
    if not p.is_file():return {"present":False,"received":0,"accepted":0,"rejected":0,"items":[],"errors":[]}
    d=load_json(p)
    if d.get("schema")!=DISCOVERY_SCHEMA:return {"present":True,"received":0,"accepted":0,"rejected":0,"items":[],"errors":["schema_mismatch"]}
    raw=d.get("handoff_items",[]);items=[];errors=[]
    if not isinstance(raw,list):return {"present":True,"received":0,"accepted":0,"rejected":0,"items":[],"errors":["handoff_not_list"]}
    seen=set()
    for i,x in enumerate(raw):
        why=[]
        if not isinstance(x,dict):why=["not_object"]
        else:
            u=x.get("url");leads=x.get("supplementary_search",{}).get("leads",[])
            if x.get("handoff_ready") is not True:why.append("not_handoff_ready")
            if not isinstance(u,str) or not https_url(u):why.append("unsafe_primary_url")
            if not isinstance(leads,list) or not leads:why.append("missing_supplementary_leads")
            elif any(not isinstance(z,dict) or not https_url(z.get("url","")) for z in leads):why.append("unsafe_supplementary_url")
            key=(u or "").lower()
            if key in seen:why.append("duplicate_url")
            seen.add(key)
        if why:errors.append({"index":i,"reasons":why})
        else:items.append({"source_id":x.get("source_id"),"source_name":x.get("source_name"),"sector":x.get("sector"),"title":x.get("title"),"primary_url":x["url"],"published_at":x.get("published_at"),"supplementary_leads":x["supplementary_search"]["leads"],"state":"NEEDS_CONTENT_ENRICHMENT","publishable":False})
    return {"present":True,"received":len(raw),"accepted":len(items),"rejected":len(errors),"items":items,"errors":errors}
def curated_pool():
    accepted=[];rejected=[];seen=set()
    for p in sorted(CAND.glob("*.json")):
        try:d=load_json(p)
        except ValueError as e:
            rejected.append({"file":p.name,"index":None,"reasons":["invalid_json"],"detail":str(e)[:180]});continue
        if isinstance(d,dict) and d.get("schema")==DISCOVERY_SCHEMA:continue
        rows=d if isinstance(d,list) else [d]
        for i,x in enumerate(rows):
            why=validate_curated(x)
            key=(x.get("canonical_url","").strip().lower() if isinstance(x,dict) else "")
            if key and (key,x.get("type")) in seen:why.append("duplicate_type_url")
            if why:rejected.append({"file":p.name,"index":i,"reasons":sorted(set(why))})
            else:seen.add((key,x["type"]));accepted.append(x)
    return accepted,rejected
def existing_weekly():
    out=[]
    for p in QUEUE.glob("weekly-*.json"):
        try:r=load_json(p)
        except ValueError:continue
        if r.get("kind")=="weekly":out.append(r)
    return out
def route(items):
    return {"news":[x for x in items if x.get("type")=="news"],"chief_engineer_advice":[x for x in items if x.get("type")=="chief-engineer-advice"]}
def make(kind,now):
    pol=policy();pool,rejected=curated_pool();intake=discovery_intake()
    if intake["present"] and intake["errors"] and intake["accepted"]==0:raise SystemExit("CONTENT_ENGINE_BLOCKED: invalid Discovery handoff")
    if kind=="weekly":selected=sorted(pool,key=lambda x:(score(x),x["date"]),reverse=True)[:int(pol["weekly"]["max_candidates"])]
    else:
        month=(now.replace(day=1)-timedelta(days=1)).strftime("%Y-%m");selected=[];seen=set()
        for q in existing_weekly():
            if q.get("status")!="APPROVED" or q.get("moderation",{}).get("decision")!="APPROVED" or not q.get("moderation",{}).get("reviewed_by") or not q.get("moderation",{}).get("reviewed_at"):continue
            for x in q.get("items",[]):
                if not validate_curated(x) and x["date"].startswith(month) and x["canonical_url"].lower() not in seen:seen.add(x["canonical_url"].lower());selected.append(x)
        selected=sorted(selected,key=score,reverse=True)[:int(pol["monthly"]["max_items"])]
    outputs=route(selected);stamp=now.strftime("%Y%m%dT%H%M%SZ");ident=hashlib.sha256((kind+stamp+"|".join(x["canonical_url"] for x in selected)).encode()).hexdigest()[:16]
    doc={"schema":SCHEMA,"id":ident,"kind":kind,"generated_at":now.isoformat(),"status":"READY_FOR_REVIEW","publish_authority":"ADMIN_ONLY","auto_publish":False,"items":selected,"outputs":outputs,"output_counts":{k:len(v) for k,v in outputs.items()},"discovery_intake":{k:v for k,v in intake.items() if k!="items"}|{"research_packets":intake["items"],"raw_discovery_never_publishable":True},"validation":{"curated_accepted":len(pool),"curated_rejected":len(rejected),"rejections":rejected},"pipeline":{"input":"NEWS_SOURCE_DISCOVERY","engine":"CONTENT_ENGINE","outputs":["NEWS","CHIEF_ENGINEER_ADVICE"],"next":"QUALITY_GATE","robot_count":7,"new_robot_created":False},"moderation":{"reviewed_by":None,"reviewed_at":None,"decision":None},"audit":{"generator":"scripts/content_engine.py","rule":"NO_AUTO_PUBLISH","input_schema":DISCOVERY_SCHEMA,"output_schema":SCHEMA}}
    path=QUEUE/f"{kind}-{stamp}.json";atomic_json(path,doc)
    report={"schema":"iig.content-engine-report.v1","generated_at":now.isoformat(),"kind":kind,"artifact":str(path.relative_to(ROOT)),"discovery_received":intake["received"],"discovery_research_packets":intake["accepted"],"discovery_rejected":intake["rejected"],"curated_accepted":len(pool),"curated_rejected":len(rejected),"news_output":len(outputs["news"]),"chief_engineer_advice_output":len(outputs["chief_engineer_advice"]),"status":"PASS","next_state":"QUALITY_GATE_REVIEW"}
    atomic_json(ROOT/"content/content-engine-report.json",report);print(path.relative_to(ROOT));print(json.dumps(report,ensure_ascii=False))
def verify():
    pol=policy();assert pol["publication"]["auto_publish"] is False and pol["publication"]["authority"]=="ADMIN_ONLY"
    w=(ROOT/".github/workflows/content-engine.yml").read_text(encoding="utf-8").lower()
    assert "contents: read" in w and "contents: write" not in w
    for bad in ("git push","deploy-pages","gh api","curl -x post","publish_now"):assert bad not in w
    for p in QUEUE.glob("*.json"):
        r=load_json(p)
        if r.get("schema")!=SCHEMA:continue
        assert r["auto_publish"] is False and r["publish_authority"]=="ADMIN_ONLY" and r["status"] in ("READY_FOR_REVIEW","APPROVED","REJECTED")
        assert set(r["outputs"])=={"news","chief_engineer_advice"}
        assert all(x.get("type")=="news" for x in r["outputs"]["news"])
        assert all(x.get("type")=="chief-engineer-advice" for x in r["outputs"]["chief_engineer_advice"])
        assert r["pipeline"]["next"]=="QUALITY_GATE" and r["pipeline"]["robot_count"]==7
        assert r["schema"]==SCHEMA
        assert all(x.get("publishable") is False for x in r["discovery_intake"]["research_packets"])
    print("CONTENT_ENGINE_VERIFY_PASS")
def main():
    a=argparse.ArgumentParser();a.add_argument("command",choices=("weekly","monthly","verify"));z=a.parse_args()
    verify() if z.command=="verify" else make(z.command,datetime.now(timezone.utc))
if __name__=="__main__":main()
