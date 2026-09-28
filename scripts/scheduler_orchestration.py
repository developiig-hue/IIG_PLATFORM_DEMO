#!/usr/bin/env python3
"""IIG Robot #7: publication preflight, scheduling and idempotent delivery authorization."""
import argparse,hashlib,json,os,tempfile,ipaddress,socket
from datetime import datetime,timezone
from pathlib import Path
from urllib.request import Request,urlopen
from urllib.parse import urlparse
import sys
sys.path.insert(0,str(Path(__file__).resolve().parent))
from recipient_provider import get_active_recipients
ROOT=Path(__file__).resolve().parents[1];IN=ROOT/"content/digest/approved-digest.json";OUT=ROOT/"content/orchestration"
NEWS=ROOT/"content/public-news.json";ADVICE=ROOT/"content/public-advice.json"
def load(p):
 try:return json.loads(p.read_text(encoding="utf-8"))
 except Exception:raise SystemExit("ORCHESTRATION_BLOCKED: invalid "+str(p))
def sha(x):return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(",",":")).encode()).hexdigest()
def atomic(p,o):
 p.parent.mkdir(parents=True,exist_ok=True);fd,t=tempfile.mkstemp(dir=p.parent,prefix=p.name)
 try:
  with os.fdopen(fd,"w",encoding="utf-8") as h:json.dump(o,h,ensure_ascii=False,indent=2);h.flush();os.fsync(h.fileno())
  os.replace(t,p)
 finally:
  if os.path.exists(t):os.unlink(t)
def published_slugs():
 n=load(NEWS);a=load(ADVICE)
 if n.get("schema")!="iig.public-news.v1" or a.get("schema")!="iig.advice.v1":raise SystemExit("ORCHESTRATION_BLOCKED: public registry schema")
 news={x.get("slug") for x in n.get("items",[]) if x.get("status")=="APPROVED" and x.get("admin_approved") is True}
 advice={x.get("slug") for x in a.get("items",[]) if x.get("slug")}
 return news,advice
def approved():
 x=load(IN)
 if x.get("schema")!="iig.approved-digest.v1":raise SystemExit("ORCHESTRATION_BLOCKED: digest approval schema")
 d=x.get("digest");a=x.get("approval")
 if not isinstance(d,dict) or not isinstance(a,dict) or a.get("decision")!="APPROVED" or a.get("delivery_authorized") is not True or a.get("next")!="SCHEDULER_ORCHESTRATION":raise SystemExit("ORCHESTRATION_BLOCKED: explicit digest approval missing")
 if a.get("digest_sha256")!=sha(d) or not a.get("reviewer") or not a.get("reason") or not a.get("approved_at"):raise SystemExit("ORCHESTRATION_BLOCKED: digest approval integrity")
 if d.get("schema")!="iig.digest.v1" or d.get("auto_send") is not False:raise SystemExit("ORCHESTRATION_BLOCKED: digest governance")
 return x
def safe_public_host(host):
 try:
  infos=socket.getaddrinfo(host,None)
  ips={ipaddress.ip_address(x[4][0]) for x in infos}
  return bool(ips) and all(not (i.is_private or i.is_loopback or i.is_link_local or i.is_reserved or i.is_multicast or i.is_unspecified) for i in ips)
 except Exception:return False
def url_contract(d):
 root=d.get("ctas",{}).get("site","");ru=urlparse(root)
 if ru.scheme!="https" or not ru.hostname or ru.username or ru.password or not safe_public_host(ru.hostname):raise SystemExit("ORCHESTRATION_BLOCKED: unsafe IIG site root")
 origin=(ru.scheme,ru.hostname,ru.port)
 expected={"news":"/IIG_PLATFORM_DEMO/article.html","chief_engineer_advice":"/IIG_PLATFORM_DEMO/advice-article.html"}
 prefix=ru.path.rstrip("/")
 for x in d.get("items",[]):
  u=urlparse(x.get("url",""))
  if (u.scheme,u.hostname,u.port)!=origin or u.path!=prefix+("/article.html" if x.get("route")=="news" else "/advice-article.html" if x.get("route")=="chief_engineer_advice" else "/__invalid__"):raise SystemExit("ORCHESTRATION_BLOCKED: non-IIG item URL")
 for k,frag in (("submit_project","project"),("subscribe_digest","subscribe")):
  u=urlparse(d.get("ctas",{}).get(k,""))
  if (u.scheme,u.hostname,u.port)!=origin or u.path!=prefix+"/forms.html" or u.fragment!=frag:raise SystemExit("ORCHESTRATION_BLOCKED: invalid IIG CTA")
 return True
def slug_from_url(u):
 q=urlparse(u).query
 from urllib.parse import parse_qs
 return parse_qs(q).get("id",[""])[0]
def registry_preflight(d):
 ns,ads=published_slugs();rows=[]
 for x in d.get("items",[]):
  slug=slug_from_url(x.get("url",""));route=x.get("route")
  ok=slug in (ns if route=="news" else ads if route=="chief_engineer_advice" else set())
  rows.append({"url":x.get("url"),"route":route,"slug":slug,"published":ok})
  if not ok:raise SystemExit("ORCHESTRATION_BLOCKED: digest item not actually published: "+slug)
 return rows
def live_check(url,timeout=12):
 u=urlparse(url)
 if u.scheme!="https" or not u.hostname or u.username or u.password or not safe_public_host(u.hostname):return {"url":url,"ok":False,"status":0}
 try:
  req=Request(url,headers={"User-Agent":"IIG-Orchestration-Preflight/1.0"})
  with urlopen(req,timeout=timeout) as r:return {"url":url,"ok":200<=r.status<400,"status":r.status}
 except Exception:return {"url":url,"ok":False,"status":0}
def preflight(check_http=True):
 x=approved();d=x["digest"];url_contract(d);rows=registry_preflight(d)
 urls=[i["url"] for i in d.get("items",[])]+[d.get("ctas",{}).get(k,"") for k in ("submit_project","subscribe_digest")]+[d.get("ctas",{}).get("site","")]
 if any(not u for u in urls):raise SystemExit("ORCHESTRATION_BLOCKED: mandatory URL missing")
 live=[live_check(u) for u in urls] if check_http else [{"url":u,"ok":True,"status":200} for u in urls]
 if not all(z["ok"] for z in live):raise SystemExit("ORCHESTRATION_BLOCKED: live IIG URL unavailable")
 did=x["approval"]["digest_sha256"];now=datetime.now(timezone.utc).isoformat()
 report={"schema":"iig.orchestration-preflight.v1","status":"PASS","digest_sha256":did,"checked_at":now,"published_items":rows,"live_urls":live,"delivery_authorized":True,"next":"DELIVERY_ADAPTER"}
 atomic(OUT/"preflight.json",report);print("ORCHESTRATION_PREFLIGHT_PASS",json.dumps({"published":len(rows),"live_urls":len(live),"digest_sha256":did}))
 return report
def schedule(send_at):
 r=preflight();dt=datetime.fromisoformat(send_at.replace("Z","+00:00"))
 if dt.tzinfo is None:raise SystemExit("ORCHESTRATION_BLOCKED: timezone required")
 did=r["digest_sha256"];ledger=OUT/"delivery-ledger.json";l=load(ledger) if ledger.exists() else {"schema":"iig.delivery-ledger.v1","jobs":[]}
 if any(j.get("digest_sha256")==did and j.get("state") in ("SCHEDULED","DISPATCHED","DELIVERED") for j in l["jobs"]):raise SystemExit("ORCHESTRATION_BLOCKED: duplicate digest delivery")
 recipients=get_active_recipients()
 if not recipients:raise SystemExit("ORCHESTRATION_BLOCKED: no ACTIVE recipients")
 job={"job_id":did[:16],"digest_sha256":did,"send_at":dt.astimezone(timezone.utc).isoformat(),"state":"SCHEDULED","recipient_count":len(recipients),"recipient_provider":os.getenv("RECIPIENT_PROVIDER","http_api"),"preflight_sha256":sha(r),"created_at":datetime.now(timezone.utc).isoformat()}
 l["jobs"].append(job);atomic(ledger,l);atomic(OUT/"delivery-job.json",{"schema":"iig.delivery-job.v1","job":job,"delivery_adapter_required":True})
 print("ORCHESTRATION_SCHEDULED",json.dumps(job))
def main():
 p=argparse.ArgumentParser();p.add_argument("cmd",choices=("preflight","schedule"));p.add_argument("--send-at");p.add_argument("--no-http",action="store_true");a=p.parse_args()
 if a.cmd=="preflight":preflight(not a.no_http)
 elif not a.send_at:raise SystemExit("ORCHESTRATION_BLOCKED: --send-at required")
 else:schedule(a.send_at)
if __name__=="__main__":main()
