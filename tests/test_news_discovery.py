"""Offline News Source Robot acceptance tests; no network and no publishing."""
import json, sys, tempfile, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'scripts'))
from news_source_discovery import safe_url, discover_source, discover_registry, atomic_write_json, load_registry, update_seen_ledger, mark_published, filter_already_published, content_identity

SRC={'id':'IIG-001','priority':'P1','name':'Example','website_url':'https://example.org/','sector':'energy','discovery':{}}
RSS=b'<rss><channel><item><title>New project</title><link>https://example.org/news/a</link><pubDate>2026-09-24</pubDate></item></channel></rss>'
HTML=b'<html><head><link rel="alternate" type="application/rss+xml" href="/feed.xml"></head><body><a href="/news/b" title="Project news">News</a><a href="/careers">Jobs</a></body></html>'
SITEMAP=b'<urlset><url><loc>https://example.org/news/c</loc></url><url><loc>https://example.org/about</loc></url></urlset>'

class DiscoveryTests(unittest.TestCase):
    def test_safe_url_rejects_insecure_credentials_and_private_literal(self):
        self.assertTrue(safe_url('https://example.org/a'))
        self.assertFalse(safe_url('http://example.org'))
        self.assertFalse(safe_url('https://127.0.0.1/a'))
        self.assertFalse(safe_url('https://user:pass@example.org'))

    def test_rss_is_first_and_never_publishes(self):
        def fetch(url,**_):
            if url=='https://example.org/': return HTML,url,'text/html'
            if url=='https://example.org/feed.xml': return RSS,url,'application/rss+xml'
            self.fail(url)
        items,_=discover_source(SRC,fetch=fetch)
        self.assertEqual(items[0]['discovery_method'],'rss')
        self.assertEqual(items[0]['fact_check_status'],'NOT_VERIFIED')
        self.assertFalse(items[0]['auto_publish'])
        self.assertEqual(items[0]['publish_authority'],'ADMIN_ONLY')

    def test_sitemap_fallback(self):
        def fetch(url,**_):
            if url=='https://example.org/': return b'<html></html>',url,'text/html'
            if url.endswith('/sitemap.xml'): return SITEMAP,url,'application/xml'
            self.fail(url)
        items,_=discover_source(SRC,fetch=fetch)
        self.assertEqual(len(items),1)
        self.assertEqual(items[0]['discovery_method'],'sitemap')

    def test_html_fallback_filters_junk(self):
        def fetch(url,**_):
            if url=='https://example.org/': return b'<a href="/news/project-x" title="Project update">x</a><a href="/careers">jobs</a>',url,'text/html'
            if url.endswith('/sitemap.xml'): raise OSError('no sitemap')
        items,_=discover_source(SRC,fetch=fetch)
        self.assertEqual(len(items),1)
        self.assertEqual(items[0]['discovery_method'],'html')

    def test_failure_isolation_p1_before_p2_and_cross_source_dedup(self):
        p2=dict(SRC,id='IIG-161',priority='P2',name='Two',website_url='https://two.example.org/')
        def fetch(url,**_):
            if 'two.example.org' in url: raise OSError('offline')
            if url.endswith('/sitemap.xml'): raise OSError('none')
            return b'<a href="https://shared.example.org/news/x" title="News project">x</a>',url,'text/html'
        result=discover_registry([SRC,p2],fetch=fetch,limit=10)
        self.assertEqual(result['adapter_attempts'][0]['priority'],'P1')
        self.assertEqual(len(result['items']),1)
        self.assertEqual(len(result['failures']),1)

    def test_atomic_write_is_location_independent(self):
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/'arbitrary-host-root'/'content'/'x.json'
            atomic_write_json(path,{'ok':True})
            self.assertEqual(json.loads(path.read_text()),{'ok':True})

    def test_undated_item_is_allowed_but_published_identity_is_suppressed(self):
        item={'canonical_url':'https://example.org/news/undated','source_id':'IIG-001','title':'Useful industrial project','summary_unverified':'Relevant IIG content','source_published_at_unverified':''}
        ledger={'schema':'iig.discovery-ledger.v1','items':{}}
        update_seen_ledger(ledger,[item],now='2026-09-25T10:00:00+00:00')
        self.assertEqual(len(filter_already_published([item],ledger)),1)
        self.assertEqual(ledger['items'][content_identity(item)]['seen_count'],1)
        mark_published(ledger,item,published_at='2026-09-25T11:00:00+00:00')
        self.assertEqual(filter_already_published([item],ledger),[])
        self.assertEqual(ledger['items'][content_identity(item)]['published_at'],'2026-09-25T11:00:00+00:00')

    def test_registry_contract_160_p1_100_p2(self):
        sources=[]
        for i in range(260):
            sources.append({'id':f'IIG-{i+1:03d}','priority':'P1' if i<160 else 'P2','name':'x','website_url':f'https://example{i}.org/','sector':'energy'})
        with tempfile.TemporaryDirectory() as d:
            path=Path(d)/'registry.json'; path.write_text(json.dumps({'sources':sources}),encoding='utf-8')
            got=load_registry(path)
            self.assertEqual((len(got),got[159]['priority'],got[160]['priority']),(260,'P1','P2'))

if __name__=='__main__': unittest.main()
