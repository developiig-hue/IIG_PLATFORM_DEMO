#!/usr/bin/env python3
from pathlib import Path
import json, sys

root=Path(__file__).resolve().parents[1]
p=root/'docs/IIG_MARKET_PRODUCTION_PORTABILITY_PROTOCOL.md'
c=root/'config/iig-market-production-portability.json'
admin=(root/'ADMIN_MASTER_SPEC.md').read_text(encoding='utf-8')
errors=[]

if not p.exists(): errors.append('production MARKET protocol missing')
if not c.exists(): errors.append('production MARKET machine contract missing')

if p.exists():
    text=p.read_text(encoding='utf-8')
    required=[
      'IIG_MARKET_PRODUCTION_PORTABILITY_V2_MARKETPLACE_DIGEST',
      'PUBLIC_MARKET_STATUS = HIDDEN_UNTIL_CONTENT_READY',
      'NO PUBLIC PRICE WITHOUT ADMIN_1 APPROVAL',
      'ТЕРМІНОВО',
      'MARKET CANDIDATE != SILENT DIGEST PAGE',
      'Marketplace',
      'РОЗМІСТИТИ ПРОЄКТ',
      'ПІДПИСАТИСЯ НА ДАЙДЖЕСТ',
      'Password → MFA → server session → RBAC',
      'PostgreSQL',
      'S3-compatible object storage',
      'Production acceptance gate',
      'MARKET_READY != MARKET_PUBLIC'
    ]
    for x in required:
        if x not in text: errors.append('protocol missing '+x)

if c.exists():
    data=json.loads(c.read_text(encoding='utf-8'))
    checks=[
      (data.get('public_market_status')=='HIDDEN_UNTIL_CONTENT_READY','market must remain hidden'),
      (data.get('production',{}).get('server_side_auth') is True,'server auth missing'),
      (data.get('production',{}).get('browser_local_storage_allowed_as_production') is False,'localStorage forbidden rule missing'),
      (data.get('hard_rules',{}).get('public_price_requires_admin_1') is True,'price approval missing'),
      (data.get('hard_rules',{}).get('marketplace_explicit_auto_pull') is True,'Marketplace explicit auto-pull missing'),
      (data.get('hard_rules',{}).get('marketplace_auto_pull_selected_only') is True,'Marketplace selected-only pull missing'),
      (data.get('hard_rules',{}).get('marketplace_manual_reorder_after_pull') is True,'Marketplace manual reorder missing'),
      (data.get('hard_rules',{}).get('marketplace_exclude_is_issue_only') is True,'Marketplace issue-only exclusion missing'),
      (data.get('hard_rules',{}).get('every_market_digest_page_has_project_subscribe_cta') is True,'MARKET CTA invariant missing'),
      (data.get('hard_rules',{}).get('urgent_label_ua')=='ТЕРМІНОВО','urgent UA label missing')
    ]
    for ok,msg in checks:
        if not ok: errors.append(msg)

if 'IIG_MARKET_PRODUCTION_PORTABILITY_V2_MARKETPLACE_DIGEST' not in admin:
    errors.append('ADMIN_MASTER_SPEC is not linked to MARKET production portability master')

if errors:
    print('IIG MARKET PRODUCTION PORTABILITY GATE FAILED')
    for e in errors: print(' -',e)
    sys.exit(1)

print('IIG MARKET PRODUCTION PORTABILITY GATE OK — IIG_MARKET_PRODUCTION_PORTABILITY_V2_MARKETPLACE_DIGEST')
