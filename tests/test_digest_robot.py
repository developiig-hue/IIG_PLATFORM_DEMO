import importlib.util,json,os,tempfile,unittest
from pathlib import Path
SPEC=importlib.util.spec_from_file_location("dr",Path(__file__).parents[1]/"scripts/digest_robot.py");d=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(d)
class DigestTests(unittest.TestCase):
 def setUp(self):
  self.t=tempfile.TemporaryDirectory();d.ROOT=Path(self.t.name);d.IN=d.ROOT/"content/publication/approved-content.json";d.OUT=d.ROOT/"content/digest";d.IN.parent.mkdir(parents=True);os.environ["IIG_PUBLIC_BASE_URL"]="https://iig.example/"
 def tearDown(self):self.t.cleanup();os.environ.pop("IIG_PUBLIC_BASE_URL",None)
 def seed(self,route="news",approved=True,tamper=False,image=True):
  item={"title":"Industrial project","type":"NEWS" if route=="news" else "CHIEF_ENGINEER_ADVICE"};h=d.sha(item)
  x={"item_sha256":"0"*64 if tamper else h,"route":route,"item":item,"selected_image":"img.jpg" if image else None,"public_slug":"industrial-project-"+h[:10],"publication_authorized":True,"next":"DIGEST","admin_approval":{"item_sha256":h,"decision":"APPROVED" if approved else "REJECTED","reviewer":"Admin","reason":"Reviewed for publication","decided_at":"2026-09-28T12:00:00+00:00"}}
  d.IN.write_text(json.dumps({"schema":"iig.publication-handoff.v1","items":[x]}));return h
 def test_every_news_has_active_iig_article_link(self):
  self.seed();d.build();x=json.loads((d.OUT/"digest.json").read_text());self.assertTrue(x["items"][0]["url"].startswith("https://iig.example/article.html?id=industrial-project-"));self.assertIn(x["items"][0]["url"],(d.OUT/"digest.html").read_text())
 def test_advice_has_iig_advice_link(self):
  self.seed("chief_engineer_advice",image=False);d.build();x=json.loads((d.OUT/"digest.json").read_text());self.assertIn("/advice-article.html?id=",x["items"][0]["url"])
 def test_ctas_are_real_forms(self):
  self.seed();d.build();x=json.loads((d.OUT/"digest.json").read_text());self.assertEqual(x["ctas"]["submit_project"],"https://iig.example/forms.html#project");self.assertEqual(x["ctas"]["subscribe_digest"],"https://iig.example/forms.html#subscribe")
 def test_rejected_admin_item_blocked(self):
  self.seed(approved=False)
  with self.assertRaises(SystemExit):d.build()
 def test_tampered_payload_blocked(self):
  self.seed(tamper=True)
  with self.assertRaises(SystemExit):d.build()
 def test_news_without_image_blocked(self):
  self.seed(image=False)
  with self.assertRaises(SystemExit):d.build()
 def test_http_base_blocked(self):
  self.seed();os.environ["IIG_PUBLIC_BASE_URL"]="http://iig.example/"
  with self.assertRaises(SystemExit):d.build()
 def test_digest_approval_is_explicit_and_hash_bound(self):\n  self.seed();d.build();d.approve("Admin User","Digest reviewed for mailing");a=json.loads((d.OUT/"approved-digest.json").read_text());self.assertTrue(a["approval"]["delivery_authorized"]);self.assertEqual(a["approval"]["next"],"SCHEDULER_ORCHESTRATION")\n def test_digest_approval_requires_human_metadata(self):\n  self.seed();d.build()\n  with self.assertRaises(SystemExit):d.approve("","x")\n def test_auto_send_false_and_scheduler_next(self):
  self.seed();d.build();x=json.loads((d.OUT/"digest.json").read_text());self.assertFalse(x["auto_send"]);self.assertEqual(x["status"],"READY_FOR_ADMIN_APPROVAL");self.assertEqual(x["pipeline"]["next"],"SCHEDULER_ORCHESTRATION")
if __name__=="__main__":unittest.main()
