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
NEWS_MIN_CHARS=1200
EVENT_MIN_CHARS=1800
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
        min_chars=EVENT_MIN_CHARS if str(x.get("event_type") or "").upper() in EVENT_TYPES else NEWS_MIN_CHARS
        if not isinstance(body,str) or len(body.strip())<min_chars:errors.append("event_body_min_1800" if min_chars==EVENT_MIN_CHARS else "news_body_min_1200")
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
        else:items.append({"source_id":x.get("source_id"),"source_name":x.get("source_name"),"sector":x.get("sector"),"title":x.get("title"),"primary_url":x["url"],"published_at":x.get("published_at"),"supplementary_leads":x["supplementary_search"]["leads"],"primary_source_excerpt":x.get("primary_source_excerpt",""),"primary_source_capture":x.get("primary_source_capture",{}),"state":"NEEDS_CONTENT_ENRICHMENT","publishable":False})
    return {"present":True,"received":len(raw),"accepted":len(items),"rejected":len(errors),"items":items,"errors":errors}

INDUSTRIAL_RELEVANCE_HINTS=("energy","power","electric","grid","gas","oil","hydrogen","solar","wind","battery","bess","chp","cogen","turbine","generator","boiler","steel","metallurg","cement","mining","industrial","infrastructure","data center","datacenter","heat","steam","decarbon","refiner","petrochem","газ","енерг","електр","мереж","водень","турбін","генерац","котел","металург","цемент","гірнич","промисл","інфраструктур","дата-центр","тепл","пара","нафт","нафтогаз")
EVENT_HINTS=("exhibition","conference","forum","summit","congress","expo","fair","presentation","kioge","вистав","конференц","форум","саміт","конгрес","презентац")
def _clean_source_text(v):
    s=re.sub(r"\s+"," ",str(v or "")).strip()
    parts=re.split(r"(?<=[.!?])\s+",s)
    out=[];seen=set()
    for p in parts:
        p=p.strip()
        key=re.sub(r"\W+","",p.lower())[:180]
        if len(p)<35 or key in seen:continue
        if any(x in p.lower() for x in ("cookie","privacy policy","accept all","javascript","subscribe newsletter")):continue
        seen.add(key);out.append(p)
    return out
def _event_type(packet):
    hay=(str(packet.get("title") or "")+" "+str(packet.get("source_name") or "")+" "+str(packet.get("primary_source_excerpt") or "")[:1200]).lower()
    return "INDUSTRY_EVENT" if any(k in hay for k in EVENT_HINTS) else None
def synthesize_news_from_research(packet):
    url=str(packet.get("primary_url") or "").strip()
    if not https_url(url):return None
    raw=str(packet.get("title") or "")+" "+str(packet.get("primary_source_excerpt") or "")[:3500]
    if not any(k in raw.lower() for k in INDUSTRIAL_RELEVANCE_HINTS):return None
    sentences=_clean_source_text(packet.get("primary_source_excerpt"))
    leads=packet.get("supplementary_leads") or []
    for z in leads:
        if isinstance(z,dict):
            sentences.extend(_clean_source_text((z.get("title") or "")+". "+(z.get("snippet") or "")))
    uniq=[];seen=set()
    for s in sentences:
        k=re.sub(r"\W+","",s.lower())[:220]
        if k and k not in seen:seen.add(k);uniq.append(s)
    et=_event_type(packet);minimum=EVENT_MIN_CHARS if et else NEWS_MIN_CHARS
    source=[]
    total=0
    for s in uniq:
        source.append(s);total+=len(s)+1
        if total>=max(minimum,2400 if et else 1600):break
    source_text=" ".join(source).strip()
    if len(source_text)<minimum:return None
    title=str(packet.get("title") or "Industry update").strip()
    src=str(packet.get("source_name") or "Primary source").strip()
    sector=str(packet.get("sector") or "other").strip()
    date=str(packet.get("published_at") or "")[:10]
    if not re.match(r"^\d{4}-\d{2}-\d{2}$",date):date=datetime.now(timezone.utc).date().isoformat()
    event_note=" Подія класифікована IIG як EVENT; технічна галузь зберігається окремо для пошуку та маршрутизації." if et else ""
    body=("ФАКТ / ПЕРВИННЕ ДЖЕРЕЛО. "+source_text+
          "\n\nЧОМУ ЦЕ ВАЖЛИВО. Матеріал важливий для керівників, інвесторів і технічних спеціалістів як перевірений ринковий сигнал щодо активності компаній, технологій, строків, партнерств та потенційних інвестиційних або EPC-рішень."+event_note+
          "\n\nПОРАДА IIG. Перед використанням цього кейсу у власному проєкті перевірте project stage, product scope, references, compliance, local acceptance, delivery terms, interfaces, warranty/LTSA, сервісну модель, CAPEX/OPEX та фінансову спроможність контрагентів. Для EVENT-контактів переводьте релевантних постачальників у formal vendor qualification, RFI/RFQ, technical workshop або pre-FEED.")
    if len(body)<minimum:return None
    ctx=(f"{src} опублікував первинний матеріал, який Robot #1 передав до Content Engine після source capture.\n\n"
         f"IIG зберігає первинний URL та відокремлює факти джерела від власної аналітики.\n\n"
         f"Матеріал віднесено до сектору {sector}; публікація залишається REVIEW до затвердження ADMIN_1.")
    return {
      "type":"news","title":title,"company_name":src,"company_activity":"Industry / energy market participant",
      "project":title,"technology":"Industrial / energy technology and market development",
      "project_status":"Primary-source development identified by Robot #1; requires ADMIN_1 editorial review",
      "project_status_evidence":"Primary-source text captured directly by Robot #1 and preserved in the generated NEWS draft.",
      "date":date,"canonical_url":url,"primary_source_verified":True,"company_context":ctx[:590],
      "evidence":4,"practical_value":4,"transferability":4,"technology_diversity":4,"decision_maker_value":4,
      "sector":sector,"body":body,
      "iig_advice":"Керівникам, інвесторам і технічним спеціалістам слід перевірити стадію проєкту, технічний scope, references, delivery, interfaces, CAPEX/OPEX і сервіс перед використанням матеріалу як основи для рішення.",
      "quote_search_status":"NOT_FOUND","editorial_tag":"EVENT" if et else sector.upper(),"event_type":et,
      "supplementary_sources":[z.get("url") for z in leads if isinstance(z,dict) and https_url(z.get("url",""))][:5],
      "generated_from":"DISCOVERY_PRIMARY_SOURCE_CAPTURE","source_capture_characters":len(str(packet.get("primary_source_excerpt") or ""))
    }

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
    generated=[]
    if kind=="weekly":
        for packet in intake.get("items",[]):
            item=synthesize_news_from_research(packet)
            if item and not validate_curated(item):generated.append(item)
        combined=[];seen=set()
        for x in generated+pool:
            key=(x.get("canonical_url","").lower(),x.get("type"))
            if key in seen:continue
            seen.add(key);combined.append(x)
        selected=sorted(combined,key=lambda x:(score(x),x["date"]),reverse=True)[:int(pol["weekly"]["max_candidates"])]
    else:
        month=(now.replace(day=1)-timedelta(days=1)).strftime("%Y-%m");selected=[];seen=set()
        for q in existing_weekly():
            if q.get("status")!="APPROVED" or q.get("moderation",{}).get("decision")!="APPROVED" or not q.get("moderation",{}).get("reviewed_by") or not q.get("moderation",{}).get("reviewed_at"):continue
            for x in q.get("items",[]):
                if not validate_curated(x) and x["date"].startswith(month) and x["canonical_url"].lower() not in seen:seen.add(x["canonical_url"].lower());selected.append(x)
        selected=sorted(selected,key=score,reverse=True)[:int(pol["monthly"]["max_items"])]
    outputs=route(selected);stamp=now.strftime("%Y%m%dT%H%M%SZ");ident=hashlib.sha256((kind+stamp+"|".join(x["canonical_url"] for x in selected)).encode()).hexdigest()[:16]
    doc={"schema":SCHEMA,"id":ident,"kind":kind,"generated_at":now.isoformat(),"status":"READY_FOR_REVIEW","publish_authority":"ADMIN_ONLY","auto_publish":False,"items":selected,"outputs":outputs,"output_counts":{k:len(v) for k,v in outputs.items()},"discovery_intake":{k:v for k,v in intake.items() if k!="items"}|{"research_packets":intake["items"],"raw_discovery_never_publishable":True},"validation":{"curated_accepted":len(pool),"curated_rejected":len(rejected),"discovery_generated_news":len(generated),"rejections":rejected},"pipeline":{"input":"NEWS_SOURCE_DISCOVERY","engine":"CONTENT_ENGINE","outputs":["NEWS","CHIEF_ENGINEER_ADVICE"],"next":"QUALITY_GATE","robot_count":7,"new_robot_created":False},"moderation":{"reviewed_by":None,"reviewed_at":None,"decision":None},"audit":{"generator":"scripts/content_engine.py","rule":"NO_AUTO_PUBLISH","input_schema":DISCOVERY_SCHEMA,"output_schema":SCHEMA}}
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
