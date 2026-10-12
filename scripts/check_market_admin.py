#!/usr/bin/env python3
from pathlib import Path
import sys

root=Path(__file__).resolve().parents[1]
html=(root/'admin-ua.html').read_text(encoding='utf-8')
js=(root/'assets/admin-market.js').read_text(encoding='utf-8')
css=(root/'assets/admin-market.css').read_text(encoding='utf-8')
contract=(root/'config/iig-market-admin-contract.json').read_text(encoding='utf-8')
errors=[]

required_html=[
 'data-tab="content"',
 'data-tab="market"',
 'data-tab="digest"',
 'id="market"',
 'IIG MARKET · ADMIN MASTER',
 'id="marketNewItem"',
 'id="marketTermsBtn"',
 'id="marketEditor"',
 'id="marketParamList"',
 'id="marketApprovePrice"',
 'id="marketTermsApprove"',
 'id="marketIncludeDigest"',
 'id="marketIncludeDigestTop"',
 'MANUAL PAGE 4+ ONLY',
 'РОЗМІСТИТИ ДАНЕ ОБЛАДНАННЯ У ДАЙДЖЕСТІ',
 'id="marketDigestQueue"',
 'id="marketDigestQueueCount"',
 'HARD RULE · NO AUTO PAGE',
 'КАНДИДАТИ IIG MARKET ДЛЯ РУЧНОГО ДОДАВАННЯ У ДАЙДЖЕСТ',
 'assets/admin-market.js?v=MARKET-DIGEST-V3',
 'assets/admin-market.css?v=MARKET-DIGEST-V3'
]
for x in required_html:
    if x not in html: errors.append('admin-ua.html missing '+x)

# NAV order NEWS -> MARKET -> DIGEST
p1=html.find('data-tab="content"')
p2=html.find('data-tab="market"')
p3=html.find('data-tab="digest"')
if min(p1,p2,p3)<0 or not p1<p2<p3:
    errors.append('ADMIN nav order must be NEWS -> IIG MARKET -> DIGEST')

required_js=[
 "iig.market.demo.v1",
 "ADMIN_2",
 "ADMIN_1",
 "PRICE_REAPPROVAL_REQUIRED",
 "ADMIN_1_APPROVED",
 "READY_FOR_ADMIN_1",
 "marketParamList",
 "marketPhotoFile",
 "marketTermsApprove",
 "marketCanonicalUrl",
 "renderDigestQueue",
 "digestEligibility",
 "PRICE_NOT_ADMIN_1_APPROVED",
 "market.html?id=",
 "include_digest",
 "HIDDEN"
]
for x in required_js:
    if x not in js: errors.append('admin-market.js missing '+x)

required_css=[
 '.market-editor-right',
 'overflow-y:auto',
 '.market-list',
 '.market-cond.NEW',
 '.market-cond.USED'
]
for x in required_css:
    if x not in css: errors.append('admin-market.css missing '+x)

required_contract=[
 '"public_status": "HIDDEN_UNTIL_CONTENT_READY"',
 '"public_price_requires_admin_1": true',
 '"terms_activation_requires_admin_1": true',
 '"right_parameter_editor_scroll": true',
 '"digest_market_exact_listing_link": true',
 '"digest_market_price_requires_admin_1": true',
 '"digest_market_never_auto_creates_page": true',
 '"digest_supplemental_pages_manual_only": true'
]
for x in required_contract:
    if x not in contract: errors.append('market contract missing '+x)

if errors:
    print('IIG MARKET ADMIN GATE FAILED')
    for e in errors: print(' -',e)
    sys.exit(1)
print('IIG MARKET ADMIN GATE OK — IIG_MARKET_ADMIN_PROTOCOL_V1')
