import unittest
from scripts.news_registry import REGISTRY_URI, load_registry, resolve_repo_uri
class RegistryPortabilityTests(unittest.TestCase):
    def test_canonical_uri(self):
        self.assertEqual(REGISTRY_URI,"repo://content/discovery/IIG_news_source_registry_260.json")
    def test_registry_is_portable_and_complete(self):
        p=resolve_repo_uri(); self.assertTrue(p.is_file()); self.assertFalse(str(p).startswith("/mnt/data"))
        d=load_registry(); self.assertEqual(len(d["sources"]),260)
if __name__=="__main__": unittest.main()
