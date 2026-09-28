import datetime as dt
from scripts import news_source_discovery as d
NOW=dt.datetime(2026,9,28,tzinfo=dt.timezone.utc)
def test_safe_url_security():
 assert d.safe_url("https://example.com/news")
 assert not d.safe_url("http://127.0.0.1/x")
 assert not d.safe_url("http://localhost/x")
def test_rss_recent_and_noise():
 b=b"""<rss><channel><item><title>New 100 MW battery project</title><link>https://example.com/news/bess</link><pubDate>Sun, 27 Sep 2026 10:00:00 GMT</pubDate></item><item><title>Old energy project</title><link>https://example.com/news/old</link><pubDate>Sun, 01 Jan 2023 10:00:00 GMT</pubDate></item></channel></rss>"""
 x=d.feed_items(b,"https://example.com",NOW,45);assert len(x)==1 and x[0]["method"]=="RSS_ATOM"
def test_sitemap_recent():
 b=b"""<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://example.com/news/200-mw-solar-project</loc><lastmod>2026-09-26</lastmod></url></urlset>"""
 x=d.sitemap_items(b,"https://example.com",NOW,45);assert len(x)==1 and x[0]["method"]=="SITEMAP"
def test_html_requires_date_and_filters_noise():
 b=b"""<a href="/2026/09/27/new-50-mw-power-project">New 50 MW power project</a><a href="/privacy">Energy privacy policy</a>"""
 x,_=d.html_items(b,"https://example.com",NOW,45);assert len(x)==1 and x[0]["method"]=="HTML"
def test_dedup_cross_source():
 rs=[{"id":"1","name":"A","priority":"P1","sector":"energy","website_url":"https://a.com","candidates":[{"url":"https://x.com/news","title":"100 MW power project","published_at":NOW.isoformat(),"method":"RSS_ATOM"}]},{"id":"2","name":"B","priority":"P2","sector":"energy","website_url":"https://b.com","candidates":[{"url":"https://x.com/news","title":"100 MW power project","published_at":NOW.isoformat(),"method":"HTML"}]}]
 x,n=d.dedup(rs);assert len(x)==1 and n==1 and x[0]["priority"]=="P1"
def test_registry_contract():
 s=d.load_registry()["sources"];assert len(s)==260;assert sum(x["priority"]=="P1" for x in s)==160;assert sum(x["priority"]=="P2" for x in s)==100
