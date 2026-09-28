#!/usr/bin/env python3
"""Acceptance gate for IIG Quality Gate."""
import json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def fail(m):print("QUALITY_GATE_ACCEPTANCE_BLOCKED:",m);sys.exit(1)
p=ROOT/"content/quality-gate-report.json"
if not p.is_file():fail("missing report")
r=json.loads(p.read_text(encoding="utf-8"))
if r.get("schema")!="iig.quality-gate-report.v1" or r.get("status")!="PASS":fail("bad report")
for k in ("evaluated_total","passed_total","blocked_total","news_evaluated","advice_evaluated"):
 if not isinstance(r.get(k),int) or r[k]<0:fail("bad metric "+k)
if r["evaluated_total"]<1 or r["evaluated_total"]!=r["passed_total"]+r["blocked_total"]:fail("evaluation accounting")
if r["news_evaluated"]<1 or r["advice_evaluated"]<1:fail("both routes must be evaluated")
a=ROOT/r["artifact"]
if not a.is_file():fail("artifact missing")
d=json.loads(a.read_text(encoding="utf-8"))
if d.get("schema")!="iig.quality-gate.v1" or d.get("auto_publish") is not False or d.get("publish_authority")!="ADMIN_ONLY":fail("governance")
if d.get("pipeline",{}).get("previous")!="CONTENT_ENGINE" or d.get("pipeline",{}).get("next")!="IMAGE_RIGHTS" or d.get("pipeline",{}).get("robot_count")!=7:fail("pipeline")
if any(x.get("decision")!="PASS" or x.get("admin_eligible") is not True for x in d.get("admin_review_queue",[])):fail("admin queue contamination")
if any(not isinstance(x.get("item"),dict) or not isinstance(x.get("item_sha256"),str) or len(x["item_sha256"])!=64 for x in d.get("admin_review_queue",[])):fail("admin payload/integrity missing")
if any(x.get("decision")!="BLOCK" or x.get("admin_eligible") is not False for x in d.get("blocked_items",[])):fail("blocked item escaped")
print("QUALITY_GATE_ACCEPTANCE_PASS",json.dumps({k:r[k] for k in ("evaluated_total","passed_total","blocked_total","news_evaluated","advice_evaluated")}))
