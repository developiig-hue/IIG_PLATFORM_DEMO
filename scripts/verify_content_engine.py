#!/usr/bin/env python3
"""Acceptance gate for IIG Content Engine production run."""
import json,sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];REPORT=ROOT/"content/content-engine-report.json";QUEUE=ROOT/"content/review-queue"
def fail(m):print("CONTENT_ENGINE_BLOCKED:",m);sys.exit(1)
if not REPORT.is_file():fail("missing content-engine-report.json")
r=json.loads(REPORT.read_text(encoding="utf-8"))
if r.get("schema")!="iig.content-engine-report.v1" or r.get("status")!="PASS":fail("invalid report")
for k in ("discovery_received","discovery_research_packets","discovery_rejected","curated_accepted","curated_rejected","news_output","chief_engineer_advice_output"):
    if not isinstance(r.get(k),int) or r[k]<0:fail("invalid metric "+k)
if r["curated_accepted"]<1:fail("no validated curated input")
if r["news_output"]<1:fail("NEWS route empty")
if r["chief_engineer_advice_output"]<1:fail("CHIEF_ENGINEER_ADVICE route empty")
p=ROOT/r.get("artifact","")
if not p.is_file() or QUEUE not in p.parents:fail("artifact missing/outside review queue")
d=json.loads(p.read_text(encoding="utf-8"))
if d.get("schema")!="iig.content-engine.v4":fail("wrong output schema")
if d.get("status")!="READY_FOR_REVIEW" or d.get("publish_authority")!="ADMIN_ONLY" or d.get("auto_publish") is not False:fail("governance invariant")
if d.get("pipeline",{}).get("next")!="QUALITY_GATE":fail("Quality Gate handoff missing")
if d.get("pipeline",{}).get("robot_count")!=7:fail("seven-robot invariant")
if d.get("output_counts")!={k:len(v) for k,v in d.get("outputs",{}).items()}:fail("route count mismatch")
if any(x.get("publishable") is not False for x in d.get("discovery_intake",{}).get("research_packets",[])):fail("raw Discovery escaped fail-closed state")
print("CONTENT_ENGINE_ACCEPTANCE_PASS",json.dumps({k:r[k] for k in ("discovery_received","discovery_research_packets","curated_accepted","curated_rejected","news_output","chief_engineer_advice_output")}))
