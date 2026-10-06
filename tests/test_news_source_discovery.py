import datetime as dt, unittest
from scripts import news_source_discovery as d
NOW=dt.datetime(2026,9,28,tzinfo=dt.timezone.utc)
class DiscoveryTests(unittest.TestCase):
 def test_safe_url_security(self):
  self.assertTrue(d.safe_url("https://example.com/news"));self.assertFalse(d.safe_url("http://127.0.0.1/x"));self.assertFalse(d.safe_url("http://localhost/x"))
 def test_rss_recent_and_noise(self):
  b=b"""<rss><channel><item><title>New 100 MW battery project</title><link>https://example.com/news/bess</link><pubDate>Sun, 27 Sep 2026 10:00:00 GMT</pubDate></item><item><title>Old energy project</title><link>https://example.com/news/old</link><pubDate>Sun, 01 Jan 2023 10:00:00 GMT</pubDate></item></channel></rss>"""
  x=d.feed_items(b,"https://example.com",NOW,45);self.assertEqual(len(x),1);self.assertEqual(x[0]["method"],"RSS_ATOM")
 def test_sitemap_recent(self):
  b=b"""<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://example.com/news/200-mw-solar-project</loc><lastmod>2026-09-26</lastmod></url></urlset>"""
  x=d.sitemap_items(b,"https://example.com",NOW,45);self.assertEqual(len(x),1);self.assertEqual(x[0]["method"],"SITEMAP")
 def test_html_date_and_noise(self):
  b=b"""<a href="/2026/09/27/new-50-mw-power-project">New 50 MW power project</a><a href="/privacy">Energy privacy policy</a>"""
  x,_=d.html_items(b,"https://example.com",NOW,45);self.assertEqual(len(x),1);self.assertEqual(x[0]["method"],"HTML")
 def test_sitemap_index_children(self):
  b=b"""<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>https://example.com/news-sitemap.xml</loc></sitemap></sitemapindex>"""
  self.assertEqual(d.sitemap_children(b),["https://example.com/news-sitemap.xml"])
 def test_dedup_prefers_first_priority_order(self):
  rs=[{"id":"1","name":"A","priority":"P1","sector":"energy","website_url":"https://a.com","candidates":[{"url":"https://x.com/news","title":"100 MW power project","published_at":NOW.isoformat(),"method":"RSS_ATOM"}]},{"id":"2","name":"B","priority":"P2","sector":"energy","website_url":"https://b.com","candidates":[{"url":"https://x.com/news","title":"100 MW power project","published_at":NOW.isoformat(),"method":"HTML"}]}]
  x,n=d.dedup(rs);self.assertEqual((len(x),n),(1,1));self.assertEqual(x[0]["priority"],"P1")
 def test_primary_source_text_parser(self):
  p=d.SourceText();p.feed("<html><body><script>bad()</script><h1>KIOGE 2026</h1><p>501 companies from 22 countries and practical technology agenda for industrial energy.</p></body></html>");self.assertIn("501 companies", " ".join(p.parts));self.assertNotIn("bad()", " ".join(p.parts))
 def test_registry_contract(self):
  s=d.load_registry()["sources"];self.assertEqual(len(s),260);self.assertEqual(sum(x["priority"]=="P1" for x in s),160);self.assertEqual(sum(x["priority"]=="P2" for x in s),100)
if __name__=="__main__":unittest.main()
