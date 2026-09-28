#!/usr/bin/env python3
"""Production News Source / Discovery: 260 sources, P1 then P2, RSS -> Sitemap -> HTML. Never publishes."""
import argparse,concurrent.futures,datetime as dt,email.utils,html.parser,ipaddress,json,os,re,time,urllib.error,urllib.parse,urllib.request,xml.etree.ElementTree as ET
from pathlib import Path
try:
    from .news_registry import REGISTRY_URI,load_registry
except ImportError:
    from news_registry import REGISTRY_URI,load_registry
ROOT=Path(__file__).resolve().parents[1]; UA=os.getenv("IIG_DISCOVERY_UA","IIG-News-Discovery/2.0")
MAX_BYTES=700000; MAX_LINKS=80
HINT=re.compile(r"(news|press|media|release|project|invest|energy|power|plant|factory|construction|commission|capacity|mw|mwh|solar|wind|battery|bess|chp|hydrogen|steel|data.?cent|chemical|pharma|logistics|agri|waste|новин|прес|проєкт|проект|інвест|енерг)",re.I)
NOISE=re.compile(r"(privacy|cookie|career|jobs|contact|about|login|register|newsletter|tag/|category/|author/)",re.I)
URLDATE=re.compile(r"/(20\d{2})[/-](0?[1-9]|1[0-2])(?:[/-]([0-3]?\d))?")
def safe_url(u):
    try:
        p=urllib.parse.urlparse(u); h=(p.hostname or "").lower()
        if p.scheme not in ("http","https") or not h or p.username or p.password or h in ("localhost","localhost.localdomain") or h.endswith(".local"): return False
        try:
            x=ipaddress.ip_address(h)
            if x.is_private or x.is_loopback or x.is_link_local or x.is_reserved or x.is_multicast:return False
        except ValueError:pass
        return True
    except Exception:return False
class SafeRedirect(urllib.request.HTTPRedirectHandler):
    max_redirections=5
    def redirect_request(self,req,fp,code,msg,headers,newurl):
        u=urllib.parse.urljoin(req.full_url,newurl)
        if not safe_url(u):raise urllib.error.HTTPError(u,code,"unsafe redirect",headers,fp)
        return super().redirect_request(req,fp,code,msg,headers,u)
OPENER=urllib.request.build_opener(SafeRedirect())
def fetch(u,timeout,accept="*/*"):
    if not safe_url(u):raise ValueError("unsafe URL")
    q=urllib.request.Request(u,headers={"User-Agent":UA,"Accept":accept})
    with OPENER.open(q,timeout=timeout) as r:
        if not safe_url(r.geturl()):raise ValueError("unsafe final URL")
        return r.status,r.geturl(),r.read(MAX_BYTES)
def when(v):
    if not v:return None
    try:return email.utils.parsedate_to_datetime(v).astimezone(dt.timezone.utc)
    except Exception:
        try:return dt.datetime.fromisoformat(v.replace("Z","+00:00")).astimezone(dt.timezone.utc)
        except Exception:return None
def url_date(u):
    m=URLDATE.search(u)
    if not m:return None
    try:return dt.datetime(int(m[1]),int(m[2]),int(m[3] or 1),tzinfo=dt.timezone.utc)
    except Exception:return None
def norm(u):
    p=urllib.parse.urlsplit(u);q=[(k,v) for k,v in urllib.parse.parse_qsl(p.query) if not k.lower().startswith("utm_") and k.lower() not in ("fbclid","gclid")]
    return urllib.parse.urlunsplit((p.scheme.lower(),p.netloc.lower(),p.path.rstrip("/") or "/",urllib.parse.urlencode(q),""))
def relevant(title,u):return len(title.strip())>=8 and bool(HINT.search(title+" "+u)) and not NOISE.search(u)
def fresh(d,now,days):return bool(d and dt.timedelta(days=-1)<=now-d<=dt.timedelta(days=days))
class Page(html.parser.HTMLParser):
    def __init__(self):super().__init__();self.links=[];self.feeds=[];self.href=None;self.txt=[]
    def handle_starttag(self,t,a):
        d=dict(a)
        if t=="link" and "alternate" in d.get("rel","") and ("rss" in d.get("type","") or "atom" in d.get("type","")) and d.get("href"):self.feeds.append(d["href"])
        if t=="a" and d.get("href"):self.href=d["href"];self.txt=[]
    def handle_data(self,d):
        if self.href:self.txt.append(d)
    def handle_endtag(self,t):
        if t=="a" and self.href:self.links.append((self.href," ".join(" ".join(self.txt).split())));self.href=None;self.txt=[]
def feed_items(body,base,now,days):
    out=[];root=ET.fromstring(body)
    for n in (root.findall(".//item")+root.findall(".//{*}entry"))[:100]:
        def tx(names):
            for name in names:
                e=n.find(name)
                if e is not None and e.text:return e.text.strip()
            return ""
        title=tx(["title","{*}title"]);link=tx(["link","{*}link"])
        if not link:
            e=n.find("{*}link");link=e.attrib.get("href","") if e is not None else ""
        link=urllib.parse.urljoin(base,link);d=when(tx(["pubDate","date","updated","published","{*}updated","{*}published"])) or url_date(link)
        if safe_url(link) and relevant(title,link) and fresh(d,now,days):out.append({"url":norm(link),"title":title,"published_at":d.isoformat(),"method":"RSS_ATOM"})
    return out
def sitemap_items(body,base,now,days):
    out=[];root=ET.fromstring(body)
    for n in root.findall(".//{*}url")[:5000]:
        loc=n.find("{*}loc");lm=n.find("{*}lastmod")
        if loc is None or not loc.text:continue
        link=urllib.parse.urljoin(base,loc.text.strip());d=when(lm.text.strip()) if lm is not None and lm.text else url_date(link)
        title=urllib.parse.unquote(urllib.parse.urlparse(link).path.rsplit("/",1)[-1]).replace("-"," ").replace("_"," ")
        if safe_url(link) and relevant(title,link) and fresh(d,now,days):out.append({"url":norm(link),"title":title,"published_at":d.isoformat(),"method":"SITEMAP"})
        if len(out)>=MAX_LINKS:break
    return out
def html_items(body,base,now,days):
    p=Page();p.feed(body.decode("utf-8",errors="replace"));out=[]
    for href,title in p.links:
        link=urllib.parse.urljoin(base,href);d=url_date(link)
        if safe_url(link) and relevant(title,link) and fresh(d,now,days):out.append({"url":norm(link),"title":title,"published_at":d.isoformat(),"method":"HTML"})
        if len(out)>=MAX_LINKS:break
    return out,p.feeds
def discover(src,timeout,now,days):
    start=time.monotonic();base=src["website_url"];r={"id":src["id"],"priority":src["priority"],"name":src["name"],"sector":src["sector"],"website_url":base,"status":"ERROR","method":None,"attempts":[],"candidates":[],"elapsed_seconds":None,"problem":None}
    home=None;final=base;feeds=[src["feed_url"]] if src.get("feed_url") else []
    try:
        st,final,home=fetch(base,timeout,"text/html,application/xhtml+xml,*/*;q=0.1");p=Page();p.feed(home.decode("utf-8",errors="replace"));feeds += [urllib.parse.urljoin(final,x) for x in p.feeds];r["attempts"].append({"method":"HOME","url":base,"http_status":st})
    except Exception as e:r["attempts"].append({"method":"HOME","url":base,"error":f"{type(e).__name__}: {str(e)[:120]}"})
    feeds += [urllib.parse.urljoin(base,x) for x in ("/feed","/rss","/rss.xml","/feed.xml","/atom.xml")]
    seen=set()
    for u in feeds:
        u=norm(u)
        if u in seen:continue
        seen.add(u)
        try:
            st,f,b=fetch(u,timeout,"application/rss+xml,application/atom+xml,application/xml,text/xml,*/*;q=0.1");x=feed_items(b,f,now,days);r["attempts"].append({"method":"RSS_ATOM","url":u,"http_status":st,"result_count":len(x)})
            if x:r["candidates"]=x;r["method"]="RSS_ATOM";break
        except Exception as e:r["attempts"].append({"method":"RSS_ATOM","url":u,"error":f"{type(e).__name__}: {str(e)[:100]}"})
    if not r["candidates"]:
        for u in (urllib.parse.urljoin(base,"/sitemap.xml"),urllib.parse.urljoin(base,"/sitemap_index.xml")):
            try:
                st,f,b=fetch(u,timeout,"application/xml,text/xml,*/*;q=0.1");x=sitemap_items(b,f,now,days);r["attempts"].append({"method":"SITEMAP","url":u,"http_status":st,"result_count":len(x)})
                if x:r["candidates"]=x;r["method"]="SITEMAP";break
            except Exception as e:r["attempts"].append({"method":"SITEMAP","url":u,"error":f"{type(e).__name__}: {str(e)[:100]}"})
    if not r["candidates"] and home is not None:
        x,_=html_items(home,final,now,days);r["attempts"].append({"method":"HTML","url":final,"result_count":len(x)})
        if x:r["candidates"]=x;r["method"]="HTML"
    r["status"]="DISCOVERED" if r["candidates"] else ("NO_MATCH" if home is not None else "ERROR")
    if r["status"]=="ERROR":r["problem"]="all access methods failed"
    r["elapsed_seconds"]=round(time.monotonic()-start,2);return r
def external_search(item,timeout):
    """Mandatory outside-registry search; supplementary leads are not automatic factual confirmation."""
    q=urllib.parse.quote('"' + item["title"][:180] + '"')
    u="https://news.google.com/rss/search?q="+q+"&hl=en&gl=US&ceid=US:en"
    try:
        st,final,body=fetch(u,timeout,"application/rss+xml,application/xml,text/xml")
        root=ET.fromstring(body);out=[]
        for n in root.findall(".//item")[:8]:
            title=(n.findtext("title") or "").strip();link=(n.findtext("link") or "").strip();src=n.find("source")
            publisher=(src.text or "").strip() if src is not None else ""
            if link and safe_url(link):out.append({"title":title,"url":link,"publisher":publisher,"discovery_method":"EXTERNAL_NEWS_SEARCH"})
            if len(out)>=3:break
        return {"attempted":True,"status":"FOUND" if out else "NO_MATCH","leads":out}
    except Exception as e:return {"attempted":True,"status":"ERROR","leads":[],"error":f"{type(e).__name__}: {str(e)[:120]}"}

def dedup(results):
    seen=set();out=[];rejected=0
    for r in results:
        for c in r["candidates"]:
            k=c["url"].lower()
            if k in seen:rejected+=1;continue
            seen.add(k);x=dict(c);x.update({"source_id":r["id"],"source_name":r["name"],"priority":r["priority"],"sector":r["sector"],"primary_source_url":r["website_url"],"enrichment_status":"REQUIRED"});out.append(x)
    out.sort(key=lambda x:(x["published_at"],x["priority"]=="P1"),reverse=True);return out,rejected
def main():
    a=argparse.ArgumentParser();a.add_argument("--timeout",type=float,default=8);a.add_argument("--workers",type=int,default=12);a.add_argument("--max-age-days",type=int,default=45);a.add_argument("--report",default="content/discovery-report.json");a.add_argument("--candidates",default="content/candidates/discovered-candidates.json");z=a.parse_args()
    sources=load_registry()["sources"];p1=[x for x in sources if x["priority"]=="P1"];p2=[x for x in sources if x["priority"]=="P2"];assert len(sources)==260 and len(p1)==160 and len(p2)==100
    now=dt.datetime.now(dt.timezone.utc);results=[]
    for batch in (p1,p2):
        with concurrent.futures.ThreadPoolExecutor(max_workers=z.workers) as ex:results.extend(ex.map(lambda s:discover(s,z.timeout,now,z.max_age_days),batch))
    items,rejected=dedup(results)
    # All 260 are checked; newest 24 candidates are the bounded handoff window.
    # Each handoff candidate receives the required search outside the 260 registry.
    for item in items[:24]:
        item["supplementary_search"]=external_search(item,z.timeout)
        item["handoff_ready"]=bool(item["supplementary_search"]["leads"])
        item["enrichment_status"]="SUPPLEMENTARY_LEADS_FOUND" if item["handoff_ready"] else "NEEDS_RESEARCH"
    for item in items[24:]:item["handoff_ready"]=False;item["enrichment_status"]="NOT_SELECTED_FOR_HANDOFF"
    handoff=[x for x in items[:24] if x["handoff_ready"]]
    counts={k:sum(x["status"]==k for x in results) for k in ("DISCOVERED","NO_MATCH","ERROR")}
    report={"schema":"iig.discovery-report.v2","run_type":"FULL_DISCOVERY","registry_uri":REGISTRY_URI,"run_finished_at":dt.datetime.now(dt.timezone.utc).isoformat(),"registry_total":260,"checked_total":260,"p1_checked":160,"p2_checked":100,"accessible":260-counts["ERROR"],"unavailable":counts["ERROR"],"discovered_sources":counts["DISCOVERED"],"no_match_sources":counts["NO_MATCH"],"error_sources":counts["ERROR"],"publications_found":len(items),"rejected":rejected,"news_output":0,"chief_engineer_advice_output":0,"handoff_candidates":len(handoff),"external_search_attempted":min(24,len(items)),"enrichment_gate_passed":bool(handoff) and all(x["supplementary_search"]["attempted"] and x["supplementary_search"]["leads"] for x in handoff),"pipeline_ready":True,"external_enrichment_required_for_routed_items":True,"sources":results}
    rp=ROOT/z.report;rp.parent.mkdir(parents=True,exist_ok=True);rp.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    cp=ROOT/z.candidates;cp.parent.mkdir(parents=True,exist_ok=True);cp.write_text(json.dumps({"schema":"iig.discovery-candidates.v1","generated_at":report["run_finished_at"],"items":items,"handoff_items":handoff},ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("FULL_DISCOVERY_COMPLETE",json.dumps({k:report[k] for k in ("checked_total","p1_checked","p2_checked","discovered_sources","no_match_sources","error_sources","publications_found","rejected")}))
if __name__=="__main__":main()
