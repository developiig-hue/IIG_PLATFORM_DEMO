#!/usr/bin/env python3
"""IIG News Source Robot: portable, fail-closed discovery across the approved registry.

Discovery order per source: RSS/Atom -> sitemap -> HTML. Results are research leads only:
this module never verifies facts, approves drafts, or publishes content.
"""
import argparse, hashlib, html, ipaddress, json, re, socket, sys, time
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse, urlunparse
from urllib.request import Request, build_opener, HTTPRedirectHandler
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DEFAULT_REGISTRY = ROOT / 'content' / 'news-source-registry.json'
DEFAULT_OUTPUT = ROOT / 'content' / 'discovered-candidates.json'
DEFAULT_LEDGER = ROOT / 'content' / 'news-discovery-ledger.json'
SECTORS={'energy','metallurgy','agriculture','food','chemical','pharma','logistics','datacenters','waste'}
UA='IIG-NewsResearch/1.0 (+editorial research; no publishing)'
MAX_BYTES=3_000_000
NEWS_HINTS=('news','press','media','article','story','release','project','update','insight')
JUNK_HINTS=('login','signup','privacy','cookie','terms','career','jobs','contact','about','tag/','category/')
ATOM='{http://www.w3.org/2005/Atom}'

def safe_url(url):
    if not isinstance(url,str): return False
    p=urlparse(url.strip())
    if p.scheme!='https' or not p.hostname or p.username or p.password: return False
    host=p.hostname.lower().rstrip('.')
    if host in {'localhost','localhost.localdomain'} or host.endswith('.local'): return False
    try:
        ip=ipaddress.ip_address(host.strip('[]'))
        if not ip.is_global: return False
    except ValueError: pass
    return True

def canonicalize(url):
    p=urlparse(url.strip()); path=re.sub(r'/+','/',p.path or '/')
    return urlunparse((p.scheme.lower(),p.netloc.lower(),path,'',p.query,''))

class SafeRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        target=urljoin(req.full_url,newurl)
        if not safe_url(target): raise ValueError('Unsafe redirect')
        return super().redirect_request(req,fp,code,msg,headers,target)

def _require_public_dns(url):
    host=urlparse(url).hostname
    if not host: raise ValueError('Missing hostname')
    try:
        ipaddress.ip_address(host.strip('[]'))
        return
    except ValueError:
        pass
    for info in socket.getaddrinfo(host,443,type=socket.SOCK_STREAM):
        if not ipaddress.ip_address(info[4][0]).is_global:
            raise ValueError('Hostname resolves to non-public address')

def http_fetch(url, timeout=15, max_bytes=MAX_BYTES):
    if not safe_url(url): raise ValueError('Unsafe URL')
    _require_public_dns(url)
    req=Request(url,headers={'User-Agent':UA,'Accept':'application/rss+xml, application/atom+xml, application/xml, text/xml, text/html;q=0.9, */*;q=0.1'})
    with build_opener(SafeRedirect()).open(req,timeout=timeout) as r:
        final=r.geturl()
        if not safe_url(final): raise ValueError('Unsafe final URL')
        data=r.read(max_bytes+1)
        if len(data)>max_bytes: raise ValueError('Response too large')
        return data, final, r.headers.get('Content-Type','')

def node_text(node,names):
    for name in names:
        e=node.find(name)
        if e is not None and e.text and e.text.strip(): return e.text.strip()
    return ''

def parse_feed(payload):
    root=ET.fromstring(payload); out=[]; tag=root.tag.lower()
    if tag.endswith('rss') or tag.endswith('rdf'):
        for e in root.findall('.//item'):
            out.append({'title':node_text(e,['title']),'url':node_text(e,['link']),'published':node_text(e,['pubDate','date','{http://purl.org/dc/elements/1.1/}date']),'summary':node_text(e,['description'])})
    elif root.tag==ATOM+'feed':
        for e in root.findall(ATOM+'entry'):
            links=[x.attrib.get('href','') for x in e.findall(ATOM+'link') if x.attrib.get('rel','alternate')=='alternate']
            out.append({'title':node_text(e,[ATOM+'title']),'url':links[0] if links else '','published':node_text(e,[ATOM+'published',ATOM+'updated']),'summary':node_text(e,[ATOM+'summary',ATOM+'content'])})
    else: raise ValueError('Unsupported feed format')
    return out

class LinkParser(HTMLParser):
    def __init__(self): super().__init__(); self.links=[]; self.feeds=[]; self.title=''; self._title=False
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='a' and a.get('href'): self.links.append((a['href'],a.get('title','')))
        if tag=='link' and a.get('href') and 'alternate' in a.get('rel','').lower() and ('rss' in a.get('type','').lower() or 'atom' in a.get('type','').lower()): self.feeds.append(a['href'])
        if tag=='title': self._title=True
    def handle_endtag(self,tag):
        if tag=='title': self._title=False
    def handle_data(self,data):
        if self._title: self.title+=data

def parse_html(payload,base):
    p=LinkParser(); p.feed(payload.decode('utf-8','replace'))
    feeds=[urljoin(base,x) for x in p.feeds if safe_url(urljoin(base,x))]
    links=[]
    for href,label in p.links:
        u=urljoin(base,href)
        if safe_url(u): links.append((u,re.sub(r'\s+',' ',html.unescape(label)).strip()))
    return feeds,links,p.title.strip()

def parse_sitemap(payload):
    root=ET.fromstring(payload); urls=[]
    for e in root.iter():
        if e.tag.lower().endswith('loc') and e.text and safe_url(e.text.strip()): urls.append(e.text.strip())
    return urls

def likely_news(url,title=''):
    s=(url+' '+title).lower()
    return any(h in s for h in NEWS_HINTS) and not any(h in s for h in JUNK_HINTS)

def clean_text(v): return re.sub(r'<[^>]*>','',html.unescape(v or '')).strip()

def candidate(source,url,title,published='',summary='',method='html'):
    url=canonicalize(url)
    return {'id':hashlib.sha256(url.encode()).hexdigest()[:16],'source_id':source['id'],'priority':source['priority'],'sector':source['sector'],'publisher':source['name'],'publisher_url':source['website_url'],'canonical_url':url,'title':clean_text(title)[:500] or url.rstrip('/').split('/')[-1].replace('-',' ')[:500],'source_published_at_unverified':published,'summary_unverified':clean_text(summary)[:1000],'discovery_method':method,'source_status':'DISCOVERED_UNVERIFIED','fact_check_status':'NOT_VERIFIED','enrichment_required':True,'auto_publish':False,'publish_authority':'ADMIN_ONLY'}

def content_identity(item):
    """Stable identity: canonical URL plus normalized editorial-visible content."""
    basis='|'.join([item.get('canonical_url',''), clean_text(item.get('title','')).lower(), clean_text(item.get('summary_unverified','')).lower()])
    return hashlib.sha256(basis.encode('utf-8')).hexdigest()

def load_ledger(path=DEFAULT_LEDGER):
    path=Path(path)
    if not path.exists(): return {'schema':'iig.discovery-ledger.v1','items':{}}
    data=json.loads(path.read_text(encoding='utf-8'))
    if data.get('schema')!='iig.discovery-ledger.v1' or not isinstance(data.get('items'),dict):
        raise ValueError('Invalid discovery ledger')
    return data

def update_seen_ledger(ledger, candidates, now=None):
    now=now or datetime.now(timezone.utc).isoformat()
    records=ledger.setdefault('items',{})
    for item in candidates:
        key=content_identity(item); rec=records.get(key)
        if rec:
            rec['last_seen_at']=now; rec['seen_count']=int(rec.get('seen_count',1))+1
        else:
            records[key]={'canonical_url':item['canonical_url'],'source_id':item['source_id'],'first_seen_at':now,'last_seen_at':now,'seen_count':1,'published_at':None}
        item['content_identity']=key
    return ledger

def mark_published(ledger, item, published_at=None):
    """Called only after ADMIN approval/publication; makes rediscovery non-publishable."""
    update_seen_ledger(ledger,[item],now=published_at or datetime.now(timezone.utc).isoformat())
    key=content_identity(item)
    ledger['items'][key]['published_at']=published_at or datetime.now(timezone.utc).isoformat()
    return ledger

def filter_already_published(candidates, ledger):
    records=ledger.get('items',{})
    out=[]
    for item in candidates:
        key=content_identity(item); item['content_identity']=key
        rec=records.get(key)
        if rec and rec.get('published_at'): continue
        out.append(item)
    return out

def load_registry(path=DEFAULT_REGISTRY):
    data=json.loads(Path(path).read_text(encoding='utf-8')); sources=data.get('sources')
    if not isinstance(sources,list): raise ValueError('registry must contain sources array')
    p1=sum(s.get('priority')=='P1' for s in sources); p2=sum(s.get('priority')=='P2' for s in sources)
    if len(sources)!=260 or (p1,p2)!=(160,100): raise ValueError('Expected exactly 160 P1 and 100 P2 sources')
    ids=[s.get('id') for s in sources]
    if len(set(ids))!=260 or None in ids: raise ValueError('Duplicate/missing source IDs')
    for s in sources:
        if s.get('sector') not in SECTORS or not safe_url(s.get('website_url','')): raise ValueError('Invalid source: '+str(s.get('id')))
    return sorted(sources,key=lambda s:(0 if s['priority']=='P1' else 1,s['id']))

def _configured(source,key):
    d=source.get('discovery') or {}; u=d.get(key)
    return u if safe_url(u) else None

def discover_source(source, fetch=http_fetch, per_source=5):
    attempts=[]; seen=set(); out=[]
    def add(c):
        if c['canonical_url'] not in seen: seen.add(c['canonical_url']); out.append(c)
    homepage=None; html_links=[]; feed_links=[]
    try:
        homepage,final,_=fetch(source['website_url']); feed_links,html_links,_=parse_html(homepage,final); attempts.append({'method':'bootstrap','status':'OK','url':final})
    except Exception as e: attempts.append({'method':'bootstrap','status':'ERROR','reason':type(e).__name__})
    rss=[]; configured=_configured(source,'rss_url')
    if configured: rss.append(configured)
    rss.extend(u for u in feed_links if u not in rss)
    for u in rss[:3]:
        try:
            payload,final,_=fetch(u); entries=parse_feed(payload); attempts.append({'method':'rss','status':'OK','url':final,'records':len(entries)})
            for e in entries:
                if safe_url(e.get('url','')): add(candidate(source,e['url'],e['title'],e['published'],e['summary'],'rss'))
            if out: return out[:per_source],attempts
        except Exception as e: attempts.append({'method':'rss','status':'ERROR','url':u,'reason':type(e).__name__})
    sitemap=_configured(source,'sitemap_url') or urljoin(source['website_url'],'/sitemap.xml')
    try:
        payload,final,_=fetch(sitemap); urls=parse_sitemap(payload); attempts.append({'method':'sitemap','status':'OK','url':final,'records':len(urls)})
        for u in urls:
            if likely_news(u): add(candidate(source,u,'',method='sitemap'))
        if out: return out[:per_source],attempts
    except Exception as e: attempts.append({'method':'sitemap','status':'ERROR','url':sitemap,'reason':type(e).__name__})
    news_url=_configured(source,'news_section_url')
    if news_url:
        try:
            payload,final,_=fetch(news_url); _,html_links,_=parse_html(payload,final); attempts.append({'method':'html','status':'OK','url':final,'records':len(html_links)})
        except Exception as e: attempts.append({'method':'html','status':'ERROR','url':news_url,'reason':type(e).__name__}); html_links=[]
    else: attempts.append({'method':'html','status':'OK' if homepage else 'SKIPPED','url':source['website_url'],'records':len(html_links)})
    for u,label in html_links:
        if likely_news(u,label): add(candidate(source,u,label,method='html'))
    return out[:per_source],attempts

def discover_registry(sources, fetch=http_fetch, limit=100, max_sources=None, per_source=5, delay_seconds=0):
    items=[]; failures=[]; attempts=[]; seen=set(); scanned=0
    selected=sources[:max_sources] if max_sources else sources
    for source in selected:
        if scanned and delay_seconds > 0: time.sleep(delay_seconds)
        scanned+=1
        try: found,log=discover_source(source,fetch=fetch,per_source=per_source)
        except Exception as e: found=[]; log=[{'method':'source','status':'ERROR','reason':type(e).__name__}]
        attempts.append({'source_id':source['id'],'priority':source['priority'],'attempts':log})
        if not found: failures.append({'source_id':source['id'],'priority':source['priority'],'status':'NO_MATCH_OR_ERROR'})
        for c in found:
            if c['canonical_url'] in seen: continue
            seen.add(c['canonical_url']); items.append(c)
            if len(items)>=limit: break
        if len(items)>=limit: break
    return {'schema':'iig.discovery.v2','generated_at':datetime.now(timezone.utc).isoformat(),'registry_sources':len(sources),'sources_scanned':scanned,'items':items,'failures':failures,'adapter_attempts':attempts,'auto_publish':False,'publish_authority':'ADMIN_ONLY','note':'Discovery only. Verify article body, dates, project status and every material factual claim independently before editorial use.'}

def atomic_write_json(path,data):
    path=Path(path); path.parent.mkdir(parents=True,exist_ok=True); tmp=path.with_name(path.name+'.tmp')
    tmp.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8'); tmp.replace(path)

def main():
    p=argparse.ArgumentParser(); p.add_argument('--registry',type=Path,default=DEFAULT_REGISTRY); p.add_argument('--output',type=Path,default=DEFAULT_OUTPUT); p.add_argument('--ledger',type=Path,default=DEFAULT_LEDGER); p.add_argument('--limit',type=int,default=100); p.add_argument('--max-sources',type=int); p.add_argument('--per-source',type=int,default=5); p.add_argument('--delay',type=float,default=0.2,help='Polite delay between sources in seconds')
    a=p.parse_args(); sources=load_registry(a.registry); ledger=load_ledger(a.ledger)
    result=discover_registry(sources,limit=a.limit,max_sources=a.max_sources,per_source=a.per_source,delay_seconds=max(0,a.delay))
    discovered=list(result['items']); result['items']=filter_already_published(discovered,ledger)
    result['already_published_suppressed']=len(discovered)-len(result['items'])
    update_seen_ledger(ledger,discovered)
    atomic_write_json(a.ledger,ledger); atomic_write_json(a.output,result)
    print(json.dumps({'items':len(result['items']),'failed_sources':len(result['failures']),'sources_scanned':result['sources_scanned'],'already_published_suppressed':result['already_published_suppressed'],'output':str(a.output)})); return 0

if __name__=='__main__': sys.exit(main())
