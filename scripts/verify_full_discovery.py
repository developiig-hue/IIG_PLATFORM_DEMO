#!/usr/bin/env python3
"""Hard gate for IIG News Source / Discovery production runs."""
import json, sys
from pathlib import Path
from news_registry import REGISTRY_URI, load_registry, resolve_repo_uri
ROOT=Path(__file__).resolve().parents[1]
policy=json.loads((ROOT/'content/moderation-policy.json').read_text(encoding='utf-8'))
TARGET=int(policy['discovery']['source_registry_target'])
registry_path=resolve_repo_uri(policy['discovery'].get('registry_uri', REGISTRY_URI), ROOT)
report_path=ROOT/policy['discovery']['full_run_report_path']
def fail(msg):
    print('FULL_DISCOVERY_BLOCKED:',msg); sys.exit(1)
if not registry_path.is_file(): fail(f'missing audited registry: {registry_path.relative_to(ROOT)}')
registry=load_registry(policy['discovery'].get('registry_uri', REGISTRY_URI), ROOT)
items=registry.get('sources',[])
if len(items)!=TARGET: fail(f'registry_total={len(items)}; required={TARGET}')
urls=[x.get('website_url') for x in items]
if any(not isinstance(u,str) or not u.startswith(('https://','http://')) for u in urls): fail('every source requires a valid website URL')
ids=[x.get('id') for x in items]
if len(set(ids))!=TARGET: fail('registry contains duplicate source IDs')
required=set(policy['discovery']['source_registry_required_fields'])
for i,x in enumerate(items,1):
    missing=required-set(x)
    if missing: fail(f'source #{i} missing fields: {sorted(missing)}')
if not report_path.is_file(): fail(f'missing run report: {report_path.relative_to(ROOT)}')
r=json.loads(report_path.read_text(encoding='utf-8'))
for k in policy['discovery']['full_run_required_metrics']:
    if k not in r: fail(f'report missing metric {k}')
if r['registry_total']!=TARGET or r['checked_total']!=TARGET: fail('not all 260 sources checked')
if r['accessible']+r['unavailable']!=TARGET: fail('access accounting does not total 260')
if r.get('p1_checked')!=160 or r.get('p2_checked')!=100: fail('priority contract must be 160 P1 then 100 P2')
if r.get('run_type')!='FULL_DISCOVERY': fail('run is not marked FULL_DISCOVERY')
sources=r.get('sources',[])
if len(sources)!=TARGET: fail('per-source report must contain 260 records')
if any(x.get('status') not in ('DISCOVERED','NO_MATCH','ERROR') for x in sources): fail('invalid per-source status')
if any(not isinstance(x.get('attempts'),list) or not x.get('attempts') for x in sources): fail('every source needs method attempts evidence')
if r.get('publications_found',0)>0 and r.get('external_search_attempted',0)<1: fail('expanded outside-registry search was not attempted')
if r.get('handoff_candidates',0)<1: fail('no enriched candidate reached Discovery handoff')
if not r.get('enrichment_gate_passed'): fail('outside-registry enrichment handoff gate not passed')
candidate_path=ROOT/'content/candidates/discovered-candidates.json'
if not candidate_path.is_file(): fail('missing discovered-candidates.json handoff')
c=json.loads(candidate_path.read_text(encoding='utf-8'))
if c.get('schema')!='iig.discovery-candidates.v1' or not c.get('handoff_items'): fail('invalid/empty Discovery handoff contract')
print('FULL_DISCOVERY_PASS',json.dumps({k:r[k] for k in policy['discovery']['full_run_required_metrics']},ensure_ascii=False))
