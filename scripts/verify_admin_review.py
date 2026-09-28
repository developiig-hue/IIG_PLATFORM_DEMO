#!/usr/bin/env python3
import hashlib,json,sys
from pathlib import Path
R=Path(__file__).resolve().parents[1]
def fail(x):print("ADMIN_REVIEW_ACCEPTANCE_BLOCKED",x);sys.exit(1)
rp=R/"content/admin-review-report.json";qp=R/"content/admin-review/review-queue.json"
if not rp.is_file() or not qp.is_file():fail("output missing")
r=json.loads(rp.read_text());q=json.loads(qp.read_text())
if r.get("schema")!="iig.admin-review-report.v1" or r.get("status")!="PASS":fail("report")
if q.get("schema")!="iig.admin-review.v1" or q.get("authority")!="ADMIN_ONLY" or q.get("auto_approve") is not False or q.get("auto_publish") is not False:fail("governance")
if q.get("pipeline")!={"robot":"ADMIN_REVIEW_PUBLICATION","robot_number":5,"previous":"IMAGE_RIGHTS","next":"DIGEST","robot_count":7}:fail("pipeline")
if r.get("queue_total")!=len(q.get("queue",[])) or r.get("pending_total")!=len(q.get("queue",[])):fail("accounting")
if any(x.get("state")!="PENDING_ADMIN_DECISION" for x in q["queue"]):fail("CI decision detected")
wf=(R/".github/workflows/admin-review.yml").read_text()
if "admin_review.py decide" in wf or "pages: write" in wf or "contents: write" in wf:fail("workflow can publish/approve")
print("ADMIN_REVIEW_ACCEPTANCE_PASS",json.dumps({"queue_total":r["queue_total"],"pending_total":r["pending_total"]}))
