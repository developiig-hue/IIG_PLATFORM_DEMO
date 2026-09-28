#!/usr/bin/env python3
"""Auditable 260-source connectivity and publication-link discovery; no publication."""
import argparse, concurrent.futures, datetime, html.parser, json, re, ssl, time, urllib.error, urllib.parse, urllib.request
from pathlib import Path
from news_registry import load_registry, REGISTRY_URI
ROOT=Path(__file__).resolve().parents[1]
UA="IIG-Discovery-Audit/1.0 (+https://github.com/; contact site administrator)"
HINT=re.compile(r"(news|press|media|release|insight|project|article|update|новин|прес|проект)",re.I)
class Links(html.parser.HTMLParser):
    def __init__(self): super().__init__(); self.links=[]
    def handle_starttag(self,tag,attrs):
        if tag=='a':
            d=dict(attrs); u=d.get('href','')
            if u and HINT.search(u): self.links.append(u)
def check(src,timeout):
    start=time.monotonic(); base=src['website_url']; out={'id':src['id'],'priority':src['priority'],'name':src['name'],'website_url':base,'adapter_type':src.get('adapter_type'),'feed_verified':src.get('feed_verified',False),'status':'unavailable','http_status':None,'final_url':None,'error':None,'publication_links':[],'elapsed_seconds':None}
    try:
        req=urllib.request.Request(base,headers={'User-Agent':UA,'Accept':'text/html,application/xhtml+xml,application/rss+xml,application/atom+xml;q=0.8,*/*;q=0.1'})
        with urllib.request.urlopen(req,timeout=timeout) as resp:
            out['http_status']=resp.status; out['final_url']=resp.geturl()
            typ=resp.headers.get('Content-Type','').lower()
            body=resp.read(350000)
            out['status']='accessible' if 200<=resp.status<400 else 'unavailable'
            if out['status']=='accessible' and ('html' in typ or b'<html' in body[:2000].lower()):
                parser=Links(); parser.feed(body.decode('utf-8',errors='replace'))
                seen=set()
                for link in parser.links:
                    url=urllib.parse.urljoin(out['final_url'],link)
                    p=urllib.parse.urlparse(url)
                    if p.scheme not in ('https','http') or not p.netloc or url in seen: continue
                    seen.add(url);out['publication_links'].append(url)
                    if len(out['publication_links'])>=30:break
    except urllib.error.HTTPError as exc: out['http_status']=exc.code;out['error']=f'HTTP {exc.code}'
    except Exception as exc: out['error']=f'{type(exc).__name__}: {str(exc)[:180]}'
    out['elapsed_seconds']=round(time.monotonic()-start,2)
    return out
def main():
    ap=argparse.ArgumentParser();ap.add_argument('--timeout',type=float,default=9);ap.add_argument('--workers',type=int,default=20);ap.add_argument('--output',default='content/discovery-report.json');args=ap.parse_args()
    sources=load_registry()['sources']; started=datetime.datetime.now(datetime.timezone.utc).isoformat()
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as ex:
        results=list(ex.map(lambda s:check(s,args.timeout),sources))
    available=sum(x['status']=='accessible' for x in results)
    candidates=sum(len(x['publication_links']) for x in results)
    report={'schema':'iig.discovery-audit.v1','run_type':'SOURCE_CONNECTIVITY_AND_LINK_DISCOVERY','registry_uri':REGISTRY_URI,'run_started_at':started,'run_finished_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'registry_total':len(sources),'checked_total':len(results),'accessible':available,'unavailable':len(results)-available,'publication_links_discovered':candidates,'publications_found':0,'rejected':0,'news_output':0,'chief_engineer_advice_output':0,'enrichment_gate_passed':False,'explanation':'Publication links are unverified leads, not validated dated publications. No claims of full editorial Discovery or automatic publication.','sources':results}
    target=ROOT/args.output;target.parent.mkdir(parents=True,exist_ok=True);target.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print('SOURCE_AUDIT_COMPLETE',json.dumps({k:report[k] for k in ('registry_total','checked_total','accessible','unavailable','publication_links_discovered','publications_found','news_output','chief_engineer_advice_output')},ensure_ascii=False))
    if len(results)!=260:raise SystemExit('ERROR: 260 source records were not checked')
if __name__=='__main__':main()
