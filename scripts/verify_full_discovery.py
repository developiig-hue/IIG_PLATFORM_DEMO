#!/usr/bin/env python3
"""Hard gate for IIG News Source / Discovery production runs."""
import json, sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
policy=json.loads((ROOT/'content/moderation-policy.json').read_text(encoding='utf-8'))
TARGET=int(policy['discovery']['source_registry_target'])
registry_path=ROOT/policy['discovery']['registry_path']
report_path=ROOT/policy['discovery']['full_run_report_path']
def fail(msg):
    print('FULL_DISCOVERY_BLOCKED:',msg); sys.exit(1)
if not registry_path.is_file(): fail(f'missing audited registry: {registry_path.relative_to(ROOT)}')
registry=json.loads(registry_path.read_text(encoding='utf-8'))
items=registry.get('sources',[])
if len(items)!=TARGET: fail(f'registry_total={len(items)}; required={TARGET}')
urls=[x.get('canonical_url') for x in items]
if any(not isinstance(u,str) or not u.startswith('https://') for u in urls): fail('every source requires canonical https URL')
if len(set(urls))!=TARGET: fail('registry contains duplicate canonical URLs')
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
if r.get('run_type')!='FULL_DISCOVERY': fail('run is not marked FULL_DISCOVERY')
if not r.get('enrichment_gate_passed'): fail('web enrichment / quote / cross-source gate not passed')
print('FULL_DISCOVERY_PASS',json.dumps({k:r[k] for k in policy['discovery']['full_run_required_metrics']},ensure_ascii=False))
