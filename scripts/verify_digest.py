#!/usr/bin/env python3
import json,sys
from pathlib import Path
R=Path(__file__).resolve().parents[1]
def fail(x):print("DIGEST_ACCEPTANCE_BLOCKED",x);sys.exit(1)
p=R/"content/digest/digest.json";rp=R/"content/digest-report.json";hp=R/"content/digest/digest.html"
if not p.is_file() or not rp.is_file() or not hp.is_file():fail("artifacts")
d=json.loads(p.read_text());r=json.loads(rp.read_text());h=hp.read_text()
if d.get("schema")!="iig.digest.v1" or d.get("status")!="READY_FOR_ADMIN_APPROVAL" or d.get("auto_send") is not False:fail("governance")
if d.get("pipeline",{}).get("robot_number")!=6 or d["pipeline"].get("robot_count")!=7 or d["pipeline"].get("next")!="SCHEDULER_ORCHESTRATION":fail("architecture")
if r.get("items_total")!=len(d.get("items",[])) or r.get("active_iig_links")!=len(d.get("items",[])):fail("link accounting")
for x in d.get("items",[]):
 if not x.get("url","").startswith("https://") or x["url"] not in h:fail("news/advice link")
for k in ("submit_project","subscribe_digest"):
 u=d.get("ctas",{}).get(k,"")
 if not u.startswith("https://") or u not in h:fail("CTA "+k)
wf=(R/".github/workflows/digest.yml").read_text()
if "contents: write" in wf or "pages: write" in wf or "digest_robot.py send" in wf:fail("workflow can publish/send")
print("DIGEST_ACCEPTANCE_PASS",json.dumps({"items_total":len(d["items"]),"active_iig_links":len(d["items"]),"cta_links":2}))
