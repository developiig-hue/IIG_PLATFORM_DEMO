import hashlib,json,tempfile,unittest
from pathlib import Path
from scripts import image_rights_robot as r
class ImageRightsTests(unittest.TestCase):
 def audit(self):
  return {"schema":"iig.news-image-audit.v1","candidate_url":"https://example.com/a.jpg","fallback_sector":"energy","gates":{k:{"status":"PASS","evidence":"Documented evidence for this gate."} for k in ("G1_PROVENANCE","G2_RELEVANCE","G3_RIGHTS","G4_TECHNICAL")}}
 def test_original_requires_structured_rights(self):
  a=self.audit();d,b,_=r.evaluate(a,{"sectors":{}});self.assertEqual(d,"BLOCK");self.assertIn("rights_basis_unproven",b)
 def test_original_explicit_permission(self):
  a=self.audit();a["rights_basis"]={"basis":"EXPLICIT_PERMISSION","evidence":"Written permission from copyright holder.","evidence_url":"https://example.com/permission"};d,b,s=r.evaluate(a,{"sectors":{}});self.assertEqual((d,b,s),("ORIGINAL_SOURCE_IMAGE",[],"https://example.com/a.jpg"))
 def test_public_visibility_is_not_rights(self):
  a=self.audit();a["rights_basis"]={"basis":"PUBLICLY_VISIBLE","evidence":"Image appears on a public page."};d,b,_=r.evaluate(a,{"sectors":{}});self.assertEqual(d,"BLOCK")
 def test_failed_gate_never_promotes_original(self):
  a=self.audit();a["gates"]["G3_RIGHTS"]["status"]="FAIL";a["rights_basis"]={"basis":"EXPLICIT_PERMISSION","evidence":"Written permission from copyright holder.","evidence_url":"https://example.com/permission"};d,_,_=r.evaluate(a,{"sectors":{}});self.assertNotEqual(d,"ORIGINAL_SOURCE_IMAGE")
 def test_bad_gate_evidence_fails_closed(self):
  a=self.audit();a["gates"]["G2_RELEVANCE"]["evidence"]="x";d,b,_=r.evaluate(a,{"sectors":{}});self.assertEqual(d,"BLOCK");self.assertIn("G2_RELEVANCE_evidence",b)
 def test_unsafe_candidate_blocked(self):
  a=self.audit();a["candidate_url"]="http://example.com/a.jpg";a["rights_basis"]={"basis":"EXPLICIT_PERMISSION","evidence":"Written permission from copyright holder.","evidence_url":"https://example.com/permission"};d,b,_=r.evaluate(a,{"sectors":{}});self.assertEqual(d,"BLOCK");self.assertIn("candidate_url_unsafe",b)
 def test_iig_owned_requires_hash(self):
  self.assertFalse(r.rights_ok({"basis":"IIG_OWNED","evidence":"Owned by IIG with internal provenance."}))
  self.assertTrue(r.rights_ok({"basis":"IIG_OWNED","evidence":"Owned by IIG with internal provenance.","asset_sha256":"a"*64}))
 def test_open_license_requires_evidence_url(self):
  self.assertFalse(r.rights_ok({"basis":"OPEN_LICENSE","evidence":"Creative Commons license is documented."}))
 def test_unknown_schema_blocks(self):
  a=self.audit();a["schema"]="wrong";d,b,_=r.evaluate(a,{"sectors":{}});self.assertEqual(d,"BLOCK");self.assertIn("audit_contract",b)
 def test_protocol_declares_forward_pipeline(self):
  p=Path(__file__).resolve().parents[1]/"IMAGE_RIGHTS_PROTOCOL.md";t=p.read_text();self.assertIn("QUALITY_GATE",t);self.assertIn("ADMIN_REVIEW",t)
 def test_workflow_nonpublishing(self):
  p=Path(__file__).resolve().parents[1]/".github/workflows/image-rights.yml"
  if p.exists():
   w=p.read_text().lower();self.assertIn("contents: read",w);self.assertNotIn("contents: write",w);self.assertNotIn("deploy-pages",w)
if __name__=="__main__":unittest.main()
