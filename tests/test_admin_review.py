import importlib.util,json,tempfile,unittest
from pathlib import Path
SPEC=importlib.util.spec_from_file_location("ar",Path(__file__).parents[1]/"scripts/admin_review.py");ar=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(ar)
class AdminReviewTests(unittest.TestCase):
 def setUp(self):
  self.t=tempfile.TemporaryDirectory();self.root=Path(self.t.name)
  ar.ROOT=self.root;ar.IN_DIR=self.root/"content/image-rights";ar.OUT=self.root/"content/admin-review";ar.PUB=self.root/"content/publication";ar.IN_DIR.mkdir(parents=True)
 def tearDown(self):self.t.cleanup()
 def seed(self,route="chief_engineer_advice",tamper=False,news_image=True):
  item={"type":"CHIEF_ENGINEER_ADVICE" if route!="news" else "NEWS","title":"Safe item","canonical_url":"https://example.com/project"}
  h=ar.sha(item);x={"route":route,"item":item,"item_sha256":("0"*64 if tamper else h),"image_required":route=="news"}
  if route=="news" and news_image:x["selected_image"]="baze_foto_news_energy.jpg"
  d={"schema":"iig.image-rights.v1","status":"READY_FOR_ADMIN_REVIEW","publish_authority":"ADMIN_ONLY","auto_publish":False,"admin_review_queue":[x]}
  p=ar.IN_DIR/"image-rights-test.json";p.write_text(json.dumps(d))
  (self.root/"content/image-rights-report.json").write_text(json.dumps({"schema":"iig.image-rights-report.v1","status":"PASS","artifact":"content/image-rights/image-rights-test.json","next_state":"ADMIN_REVIEW"}))
  return h
 def test_prepare_is_pending_and_never_auto_approves(self):
  self.seed();ar.prepare();d=json.loads((ar.OUT/"review-queue.json").read_text())
  self.assertFalse(d["auto_approve"]);self.assertFalse(d["auto_publish"]);self.assertEqual(d["queue"][0]["state"],"PENDING_ADMIN_DECISION")
 def test_tampered_payload_fails_closed(self):
  self.seed(tamper=True)
  with self.assertRaises(SystemExit):ar.prepare()
 def test_news_cannot_bypass_image_rights(self):
  self.seed(route="news",news_image=False)
  with self.assertRaises(SystemExit):ar.prepare()
 def test_approve_requires_human_metadata_and_creates_handoff(self):
  h=self.seed();ar.decide(h,"APPROVED","admin@example.com","Reviewed and approved")
  p=json.loads((ar.PUB/"approved-content.json").read_text());self.assertTrue(p["items"][0]["publication_authorized"]);self.assertEqual(p["items"][0]["next"],"DIGEST")
 def test_reject_never_enters_publication_handoff(self):
  h=self.seed();ar.decide(h,"REJECTED","Admin User","Source wording needs correction")
  self.assertFalse((ar.PUB/"approved-content.json").exists())
 def test_duplicate_terminal_decision_blocked(self):
  h=self.seed();ar.decide(h,"REJECTED","Admin User","Not ready for release")
  with self.assertRaises(SystemExit):ar.decide(h,"APPROVED","Admin User","Changed mind without new review")
 def test_missing_reviewer_or_reason_blocked(self):
  h=self.seed()
  with self.assertRaises(SystemExit):ar.decide(h,"APPROVED","","valid reason")
  with self.assertRaises(SystemExit):ar.decide(h,"APPROVED","Admin","x")
 def test_wrong_upstream_state_blocked(self):
  self.seed();r=json.loads((self.root/"content/image-rights-report.json").read_text());r["next_state"]="OTHER";(self.root/"content/image-rights-report.json").write_text(json.dumps(r))
  with self.assertRaises(SystemExit):ar.prepare()
if __name__=="__main__":unittest.main()
