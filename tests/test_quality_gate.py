import copy,json,tempfile,unittest
from pathlib import Path
from scripts import quality_gate as q
class QualityGateTests(unittest.TestCase):
 def base(self,t="chief-engineer-advice"):
  x={"type":t,"title":"Engineering item","company_name":"Example Energy","project":"Industrial project","technology":"CHP","project_status":"announced","project_status_evidence":"Official source confirms announcement","date":"2026-09-20","canonical_url":"https://example.com/news/a","primary_source_verified":True,"company_context":"Verified company and project context."}
  if t=="chief-engineer-advice":x["advice"]={"problem":"Industrial interfaces can be incorrectly assessed when design packages are separated.","checks":"Verify load profiles, operating cases, interfaces and redundancy before the design basis is frozen.","technical_solution":"Model the integrated system and define verified interface limits before major equipment is sized.","management_decision":"Do not approve procurement until the integrated design basis and interface register are approved."}
  return x
 def doc(self,items=None):
  items=items or [self.base()];return {"schema":q.IN_SCHEMA,"status":"READY_FOR_REVIEW","publish_authority":"ADMIN_ONLY","auto_publish":False,"pipeline":{"engine":"CONTENT_ENGINE","next":"QUALITY_GATE","robot_count":7},"discovery_intake":{"raw_discovery_never_publishable":True},"outputs":{"news":[],"chief_engineer_advice":items}}
 def test_valid_advice_passes(self):
  f,r=q.gate(self.doc());self.assertEqual(f,[]);self.assertEqual(r[0]["decision"],"PASS")
 def test_schema_fails_closed(self):
  d=self.doc();d["schema"]="wrong";f,r=q.gate(d);self.assertIn("input_schema_mismatch",f);self.assertEqual(r,[])
 def test_governance_fails_closed(self):
  d=self.doc();d["auto_publish"]=True;f,_=q.gate(d);self.assertIn("governance_invariant",f)
 def test_pipeline_fails_closed(self):
  d=self.doc();d["pipeline"]["next"]="PUBLIC";f,_=q.gate(d);self.assertIn("pipeline_contract",f)
 def test_raw_discovery_boundary_required(self):
  d=self.doc();d["discovery_intake"]["raw_discovery_never_publishable"]=False;f,_=q.gate(d);self.assertIn("raw_discovery_boundary_missing",f)
 def test_route_mismatch_blocked_not_crash(self):
  d=self.doc([self.base("news")]);f,r=q.gate(d);self.assertEqual(f,[]);self.assertEqual(r[0]["decision"],"BLOCK");self.assertIn("route_type_mismatch",r[0]["reasons"])
 def test_private_url_blocked(self):
  x=self.base();x["canonical_url"]="https://127.0.0.1/a";_,r=q.gate(self.doc([x]));self.assertIn("unsafe_canonical_url",r[0]["reasons"])
 def test_unverified_primary_blocked(self):
  x=self.base();x["primary_source_verified"]=False;_,r=q.gate(self.doc([x]));self.assertIn("primary_source_unverified",r[0]["reasons"])
 def test_bad_advice_blocked(self):
  x=self.base();x["advice"]["checks"]="short";_,r=q.gate(self.doc([x]));self.assertIn("advice_four_block_contract",r[0]["reasons"])
 def test_news_requires_sector_and_image_evidence(self):
  x=self.base("news");d=self.doc();d["outputs"]={"news":[x],"chief_engineer_advice":[]};_,r=q.gate(d);self.assertIn("news_sector_missing",r[0]["reasons"]);self.assertIn("image_validation_missing",r[0]["reasons"])
 def test_duplicate_isolated(self):
  x=self.base();d=self.doc([x,copy.deepcopy(x)]);_,r=q.gate(d);self.assertEqual(r[0]["decision"],"PASS");self.assertIn("duplicate_route_item",r[1]["reasons"])
if __name__=="__main__":unittest.main()
