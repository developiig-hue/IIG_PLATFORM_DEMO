#!/usr/bin/env python3
import json,sys
from pathlib import Path
R=Path(__file__).resolve().parents[1]
def fail(x):print("IMAGE_RIGHTS_ACCEPTANCE_BLOCKED",x);sys.exit(1)
rp=R/"content/image-rights-report.json"
if not rp.is_file():fail("report missing")
r=json.loads(rp.read_text())
if r.get("schema")!="iig.image-rights-report.v1" or r.get("status")!="PASS":fail("report contract")
if r.get("evaluated_total",0)<1 or r["evaluated_total"]!=r.get("passed_total",0)+r.get("blocked_total",0):fail("accounting")
ap=R/r["artifact"]
if not ap.is_file():fail("artifact missing")
d=json.loads(ap.read_text())
if d.get("schema")!="iig.image-rights.v1" or d.get("auto_publish") is not False or d.get("publish_authority")!="ADMIN_ONLY":fail("governance")
if d.get("pipeline")!={"robot":"IMAGE_RIGHTS","robot_number":4,"next":"QUALITY_GATE","robot_count":7}:fail("pipeline")
for x in d.get("results",[]):
 if x["decision"]=="BLOCK" and x.get("quality_gate_eligible") is not False:fail("blocked escaped")
 if x["decision"]!="BLOCK" and x.get("quality_gate_eligible") is not True:fail("pass not eligible")
print("IMAGE_RIGHTS_ACCEPTANCE_PASS",json.dumps({k:r[k] for k in ("evaluated_total","passed_total","blocked_total")}))
