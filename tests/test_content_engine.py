import json
import tempfile
import unittest
from pathlib import Path
from scripts import content_engine as c
ROOT=Path(__file__).resolve().parents[1]

class ContentEngineTests(unittest.TestCase):
    def good(self,t="news"):
        x={"type":t,"title":"100 MW industrial project","company_name":"Example Energy","company_activity":"Industrial energy","project":"100 MW project","technology":"Generation","project_status":"Investment decision announced","project_status_evidence":"Official release confirms decision","date":"2026-09-20","canonical_url":"https://example.com/news/project","primary_source_verified":True,"company_context":"Example Energy develops industrial projects.\n\nOwnership context is source verified.\n\nThe project is announced and not commissioned.","evidence":5,"practical_value":4,"transferability":4,"technology_diversity":3,"decision_maker_value":5}
        if t=="chief-engineer-advice":
            x["advice"]={"problem":"Electrical demand can be understated when interfaces are assessed separately.","checks":"Verify load profiles, connection limits, redundancy criteria and operating modes before design freeze.","technical_solution":"Model coincident demand and interfaces, then size connection and reserve architecture against verified cases.","management_decision":"Do not approve procurement or connection capacity until the interface study and design basis are signed."}
        return x
    def test_policy_admin_only(self):
        p=c.policy();self.assertFalse(p["publication"]["auto_publish"]);self.assertEqual(p["publication"]["authority"],"ADMIN_ONLY")
    def test_valid_news(self):self.assertEqual(c.validate_curated(self.good()),[])
    def test_unverified_primary_blocked(self):
        x=self.good();x["primary_source_verified"]=False;self.assertIn("primary_source_unverified",c.validate_curated(x))
    def test_unsafe_url_blocked(self):
        x=self.good();x["canonical_url"]="https://127.0.0.1/a";self.assertIn("unsafe_canonical_url",c.validate_curated(x))
        x=self.good();x["canonical_url"]="https://localhost/a";self.assertIn("unsafe_canonical_url",c.validate_curated(x))
    def test_bad_date_blocked(self):
        x=self.good();x["date"]="not-a-date";self.assertIn("invalid_date",c.validate_curated(x))
    def test_advice_four_blocks(self):
        x=self.good("chief-engineer-advice");self.assertEqual(c.validate_curated(x),[])
        x["advice"]["checks"]="short";self.assertIn("advice_four_block_contract",c.validate_curated(x))
    def test_malformed_candidate_file_isolated(self):
        old=c.CAND
        with tempfile.TemporaryDirectory() as td:
            c.CAND=Path(td);(c.CAND/"bad.json").write_text("{broken",encoding="utf-8");(c.CAND/"good.json").write_text(json.dumps([self.good()]),encoding="utf-8")
            try:
                ok,bad=c.curated_pool();self.assertEqual(len(ok),1);self.assertEqual(bad[0]["reasons"],["invalid_json"])
            finally:c.CAND=old
    def test_discovery_schema_mismatch_is_explicit(self):
        old=c.CAND
        with tempfile.TemporaryDirectory() as td:
            c.CAND=Path(td);(c.CAND/"discovered-candidates.json").write_text(json.dumps({"schema":"wrong","handoff_items":[]}),encoding="utf-8")
            try:
                r=c.discovery_intake();self.assertTrue(r["present"]);self.assertIn("schema_mismatch",r["errors"])
            finally:c.CAND=old
    def test_routing_isolated(self):
        n=self.good();a=self.good("chief-engineer-advice");r=c.route([n,a]);self.assertEqual(len(r["news"]),1);self.assertEqual(len(r["chief_engineer_advice"]),1)
    def test_score_bounded(self):
        x=self.good();x["evidence"]=999;self.assertLessEqual(c.score(x),25)
    def test_workflow_read_only(self):
        w=(ROOT/".github/workflows/content-engine.yml").read_text().lower();self.assertIn("contents: read",w);self.assertNotIn("contents: write",w)
        for bad in ("git push","deploy-pages","gh api","curl -x post","publish_now"):self.assertNotIn(bad,w)
    def test_engine_contract_markers(self):
        s=(ROOT/"scripts/content_engine.py").read_text();self.assertIn("iig.content-engine.v3",s);self.assertIn("QUALITY_GATE",s);self.assertIn("raw_discovery_never_publishable",s)

if __name__=="__main__":unittest.main()
