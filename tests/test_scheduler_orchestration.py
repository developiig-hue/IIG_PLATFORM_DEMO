import importlib.util,json,os,tempfile,unittest
from pathlib import Path
SPEC=importlib.util.spec_from_file_location("so",Path(__file__).parents[1]/"scripts/scheduler_orchestration.py");s=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(s)
class SchedulerTests(unittest.TestCase):
 def setUp(self):
  self.t=tempfile.TemporaryDirectory();self.old_safe=s.safe_public_host;s.safe_public_host=lambda h:True;s.ROOT=Path(self.t.name);s.IN=s.ROOT/"content/digest/approved-digest.json";s.OUT=s.ROOT/"content/orchestration";s.NEWS=s.ROOT/"content/public-news.json";s.ADVICE=s.ROOT/"content/public-advice.json";s.IN.parent.mkdir(parents=True);s.NEWS.parent.mkdir(parents=True,exist_ok=True)
  s.NEWS.write_text(json.dumps({"schema":"iig.public-news.v1","items":[{"slug":"published-news","status":"APPROVED","admin_approved":True}]}));s.ADVICE.write_text(json.dumps({"schema":"iig.advice.v1","items":[{"slug":"published-advice"}]}))
 def tearDown(self):s.safe_public_host=self.old_safe;self.t.cleanup()\n def seed(self,slug="published-news",route="news",tamper=False):
  d={"schema":"iig.digest.v1","auto_send":False,"items":[{"route":route,"url":"https://iig.example/"+("article.html" if route=="news" else "advice-article.html")+"?id="+slug}],"ctas":{"submit_project":"https://iig.example/forms.html#project","subscribe_digest":"https://iig.example/forms.html#subscribe","site":"https://iig.example/"}}
  h=s.sha(d);a={"digest_sha256":"0"*64 if tamper else h,"decision":"APPROVED","delivery_authorized":True,"next":"SCHEDULER_ORCHESTRATION","reviewer":"Admin","reason":"Approved digest","approved_at":"2026-09-28T12:00:00+00:00"}
  s.IN.write_text(json.dumps({"schema":"iig.approved-digest.v1","digest":d,"approval":a}));return h
 def test_published_news_passes_registry(self):self.seed();self.assertEqual(len(s.registry_preflight(s.approved()["digest"])),1)
 def test_published_advice_passes(self):self.seed("published-advice","chief_engineer_advice");self.assertTrue(s.registry_preflight(s.approved()["digest"])[0]["published"])
 def test_unpublished_slug_blocks(self):
  self.seed("not-live")
  with self.assertRaises(SystemExit):s.registry_preflight(s.approved()["digest"])
 def test_tampered_digest_blocks(self):
  self.seed(tamper=True)
  with self.assertRaises(SystemExit):s.approved()
 def test_rejected_digest_blocks(self):
  self.seed();x=json.loads(s.IN.read_text());x["approval"]["decision"]="REJECTED";s.IN.write_text(json.dumps(x))
  with self.assertRaises(SystemExit):s.approved()
 def test_foreign_host_blocks_even_with_published_slug(self):\n  self.seed();x=json.loads(s.IN.read_text());x["digest"]["items"][0]["url"]="https://evil.example/article.html?id=published-news";x["approval"]["digest_sha256"]=s.sha(x["digest"]);s.IN.write_text(json.dumps(x))\n  with self.assertRaises(SystemExit):s.preflight(False)\n def test_private_host_blocks(self):\n  self.seed();s.safe_public_host=lambda h:False\n  with self.assertRaises(SystemExit):s.preflight(False)\n def test_http_failure_blocks(self):
  self.seed();old=s.live_check;s.live_check=lambda u:{"url":u,"ok":False,"status":0}
  try:
   with self.assertRaises(SystemExit):s.preflight()
  finally:s.live_check=old
 def test_preflight_checks_item_ctas_and_site(self):
  self.seed();r=s.preflight(False);self.assertEqual(len(r["live_urls"]),4);self.assertTrue(r["delivery_authorized"])
 def test_duplicate_delivery_blocked(self):
  self.seed();old=s.preflight;s.preflight=lambda:{"digest_sha256":s.approved()["approval"]["digest_sha256"]}
  try:
   s.schedule("2026-09-29T09:00:00+02:00")
   with self.assertRaises(SystemExit):s.schedule("2026-09-29T10:00:00+02:00")
  finally:s.preflight=old
 def test_timezone_required(self):
  self.seed();old=s.preflight;s.preflight=lambda:{"digest_sha256":s.approved()["approval"]["digest_sha256"]}
  try:
   with self.assertRaises(SystemExit):s.schedule("2026-09-29T09:00:00")
  finally:s.preflight=old
if __name__=="__main__":unittest.main()
