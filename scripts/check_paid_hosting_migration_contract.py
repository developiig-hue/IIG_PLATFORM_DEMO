#!/usr/bin/env python3
from pathlib import Path
import json,sys

root=Path(__file__).resolve().parents[1]
errors=[]
contract_path=root/'config/paid-hosting-migration-contract-v5.json'
protocol_path=root/'docs/IIG-PAID-HOSTING-MIGRATION-HARD-LOCK-V5.md'

if not contract_path.exists(): errors.append('missing migration contract')
if not protocol_path.exists(): errors.append('missing migration protocol')

if not errors:
    c=json.loads(contract_path.read_text(encoding='utf-8'))
    for k,v in [('version','IIG_PAID_HOSTING_MIGRATION_V5'),('status','LOCKED'),('canonical_admin_route','/admin/')]:
        if c.get(k)!=v: errors.append(f'contract {k} must be {v}')
    for f in c.get('required_files',[]):
        if not (root/f).exists(): errors.append('required file missing: '+f)
    p=c.get('production',{})
    for k in ['https','mfa','rbac','audit_log','rate_limit','session_timeout','backups','restore_test','rollback','staging_before_production']:
        if p.get(k) is not True: errors.append('production requirement not locked: '+k)
    d=c.get('digest',{})
    for k in ['approved_content_only','manual_layout_authority_after_initial_build','any_change_invalidates_final_approval','ci_must_not_silently_rebuild_approved_issue','public_pdf_must_physically_exist','current_pdf_pointer_required']:
        if d.get(k) is not True: errors.append('digest requirement not locked: '+k)
    m=c.get('marketplace_digest',{})
    if m.get('material_type')!='MARKETPLACE': errors.append('Marketplace material type missing')
    if m.get('source_field')!='include_digest': errors.append('Marketplace include_digest mapping missing')
    if m.get('manual_controls')!=['UP','DOWN','MOVE','EXCLUDE_FROM_ISSUE']: errors.append('Marketplace manual controls mismatch')
    if m.get('exclude_does_not_delete_market_listing') is not True: errors.append('Digest exclusion must not delete MARKET listing')
    tags=m.get('category_tags',{})
    for src,label in {'Gas Engine / CHP':'KGU','Gas Boiler':'GAS BOILER','Gas Turbine':'TURBIN','BESS':'BESS'}.items():
        if tags.get(src)!=label: errors.append('category tag mismatch: '+src)
    if d.get('page4plus_cta')!=['forms.html#project','forms.html#subscribe']: errors.append('Page 4+ CTA invariant mismatch')

html=(root/'admin-ua.html').read_text(encoding='utf-8') if (root/'admin-ua.html').exists() else ''
js=(root/'assets/admin-market-digest-v5.js').read_text(encoding='utf-8') if (root/'assets/admin-market-digest-v5.js').exists() else ''
for token in ['value="MARKETPLACE"','MARKETPLACE AUTO-PULL','forms.html#project','forms.html#subscribe']:
    if token not in html: errors.append('admin-ua.html missing migration token: '+token)
for token in ['MARKETPLACE','mktUp','mktDown','mktMove','mktDel','ТЕРМІНОВО','market.html?id=']:
    if token not in js: errors.append('Marketplace V5 runtime missing token: '+token)

if errors:
    print('IIG PAID HOSTING MIGRATION GATE FAILED')
    for e in errors: print(' -',e)
    sys.exit(1)
print('IIG PAID HOSTING MIGRATION GATE OK — V5 HARD LOCK')
