"""Offline tests: python -m unittest discover -s tests -v (no network)."""
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from news_source_discovery import discover, parse_feed

RSS = b'''<?xml version="1.0"?><rss version="2.0"><channel><title>Test feed</title><item><title>Sample project announcement</title><link>https://example.org/news/project</link><pubDate>Tue, 22 Sep 2026 08:00:00 GMT</pubDate><description>Unverified example.</description></item><item><title>Duplicate</title><link>https://example.org/news/project</link></item><item><title>Insecure</title><link>http://example.org/bad</link></item></channel></rss>'''
ATOM = b'''<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><entry><title>Example Atom</title><link href="https://example.org/atom/1"/><updated>2026-09-22T08:00:00Z</updated></entry></feed>'''
FEED = {'feed_url': 'https://example.org/rss.xml', 'publisher_url': 'https://example.org', 'publisher': 'Synthetic fixture', 'sector': 'energy'}


class DiscoveryTests(unittest.TestCase):
    def test_rss_offline_and_no_false_verification(self):
        result = discover([FEED], fetch=lambda _: RSS)
        self.assertEqual(len(result['items']), 1)
        self.assertEqual(result['failures'], [])
        item = result['items'][0]
        self.assertEqual(item['source_status'], 'DISCOVERED_UNVERIFIED')
        self.assertEqual(item['fact_check_status'], 'NOT_VERIFIED')
        self.assertIs(item['auto_publish'], False)
        self.assertEqual(item['publish_authority'], 'ADMIN_ONLY')

    def test_atom_offline(self):
        self.assertEqual(parse_feed(ATOM)[0]['url'], 'https://example.org/atom/1')

    def test_bad_config_does_not_fetch(self):
        result = discover([dict(FEED, feed_url='http://example.org/rss')], fetch=lambda _: self.fail('network fetch attempted'))
        self.assertEqual(result['items'], [])
        self.assertEqual(result['failures'][0]['reason'], 'INVALID_FEED_CONFIG')

    def test_feed_failure_is_reported(self):
        result = discover([FEED], fetch=lambda _: b'<broken')
        self.assertEqual(result['items'], [])
        self.assertEqual(len(result['failures']), 1)

    def test_empty_registry_does_not_invent_news(self):
        result = discover([], fetch=lambda _: self.fail('network fetch attempted'))
        self.assertEqual(result['items'], [])


if __name__ == '__main__':
    unittest.main()
