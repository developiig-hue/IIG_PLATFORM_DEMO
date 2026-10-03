# IIG ADMIN BACKSTAGE / CMS — MASTER SPEC v1.0

**Step:** 26
**Status:** DEMO IMPLEMENTED / PRODUCTION BACKEND REQUIRED BEFORE STEP 27
**Date:** 2026-09-30
**Authority:** ADMIN_ONLY / NO_AUTO_PUBLISH

## 1. Purpose
The Admin Backstage is the single operational cockpit for IIG website content, Robots #1–#7, Digest, forms, subscribers, security, audit and deployment. The public website MUST NOT expose privileged actions or secrets.

## 2. Portability
Admin UI, contracts and configuration are repository-relative. Production base URLs, API endpoints, database credentials, mail credentials and secrets MUST be environment configuration, never hardcoded into HTML/JS or Git.

## 3. Modules
1. Dashboard — system status, queues, release blockers, environment.
2. Content — NEWS, Finance/Regulation, Chief Engineer Advice, IIG Original/Partner/Sponsored; Draft -> Review -> Approved -> Published -> Archived.
3. Admin Review — immutable Robot #5 queue; explicit APPROVE/REJECT; reviewer + reason + timestamp; preview before publish.
4. Digest — build, preview, direct-link QA, PDF artifact, admin approval, release state.
5. Subscribers & Mailing — consent, language, ACTIVE/UNSUBSCRIBED/BOUNCED/SUPPRESSED, campaigns, delivery history. PII MUST NOT live in Git.
6. Requests — Project, Subscribe and Engineer form submissions with status, owner and follow-up.
7. Media Library — asset, rights basis, source, credit, alt/caption, sector fallback.
8. Robots & Automation — #1–#7 state, last run, artifact, GREEN/FAIL/BLOCKED; privileged run/stop via backend only.
9. Source Registry — 260 sources, availability, owner approval, adapter/feed status.
10. Website Manager — pages, navigation, footer, contacts, UA/EN, SEO, redirects; design tokens are locked by approved MASTER.
11. Users / Roles — Super Admin, Admin, Editor, Chief Engineer; least privilege.
12. Security Center — MFA, sessions, auth events, WAF/rate-limit/provider status, incidents.
13. Audit Log — append-only privileged-action trail.
14. Backup / Restore — DB/content/config backups, restore approval and verification.
15. Deployment — staging/production releases, version, rollback and health check.
16. Integrations / API — email, database, analytics and future adapters; secrets hidden.

## 4. Security HARD RULES
- Production authentication MUST be server-side. Static GitHub Pages authentication is forbidden.
- MFA REQUIRED for Super Admin/Admin and all accounts with publish, deploy, user/role, export or mailing authority.
- Passwords MUST be hashed with a modern password hashing scheme by the production identity layer; never stored in repository or browser storage.
- Session cookies: Secure + HttpOnly + SameSite; server-side expiry/revocation.
- RBAC enforced on backend/API, not only by hiding UI controls.
- CSRF protection for state-changing browser requests.
- CSP, frame-ancestors, Referrer-Policy, Permissions-Policy and HSTS at production edge.
- Rate limiting and brute-force protection on authentication and forms.
- Secrets only in hosting secret manager/environment; never Git/client JS.
- Database uses least-privilege service accounts and parameterized queries.
- Uploads: MIME/signature validation, size limits, random server filenames, malware scanning where available; never execute uploaded files.
- PII: subscribers/forms/users are private DB records, never public JSON/Git artifacts.
- Audit log is append-only and records actor, role, action, object, timestamp, result and request/session correlation; IP retention follows privacy policy.
- High-risk actions require step-up confirmation: deploy production, restore backup, export DB, role escalation, mass mailing, destructive delete.
- Publication remains ADMIN_ONLY. Robot/CI cannot self-approve.
- Digest mailing requires exact approved digest identity/SHA and duplicate-send protection.
- Unsubscribe and suppression are production release blockers.
- Backup encryption, off-site copy and tested restore are mandatory before production cutover.
- Demo UI is READ-ONLY for privileged actions and MUST NOT simulate successful security-sensitive mutations.

## 5. Roles / Approval
- Super Admin: full operational authority; production deploy/restore/user-role/security/export.
- Admin: content, review, digest, requests and routine operations; no silent privilege escalation.
- Editor: create/edit drafts, submit for review; cannot production deploy, manage roles or export private DB.
- Chief Engineer: create/review engineering advice and technical approval; no user/security/deploy authority.
Separation of duties SHOULD be used for production deploy/restore and role escalation when more than one authorized person exists.

## 6. Content workflow
DISCOVERY -> CONTENT ENGINE -> QUALITY GATE -> IMAGE/RIGHTS -> ADMIN REVIEW -> PUBLICATION -> DIGEST -> SCHEDULER.
NEWS and CHIEF_ENGINEER_ADVICE remain two outputs of Content Engine.
Every public item keeps source evidence, status, public slug, version and approval identity.
Preview is mandatory before publication. Version history and rollback are mandatory.

## 7. Digest
Digest follows DIGEST_MASTER_SPEC.md and DIGEST_PROTOCOL.md. Every displayed content item MUST direct-link to the same individual IIG material. Missing/incorrect direct URL = release blocked. Mailing cannot start before explicit Admin approval of the exact artifact.

## 8. Demo behavior
admin.html is a public, non-authenticated review cockpit on GitHub Pages. It may read public repository JSON and show architecture/status. It MUST NOT contain credentials, PII, real sessions, real subscriber records, secret integration values or working privileged mutation endpoints. Privileged controls display PRODUCTION BACKEND REQUIRED.

## 9. Production API/DB contract before Step 27
Required backend domains: auth/session/MFA; users/roles; content/versioning; review/approval; publication; forms/requests; subscribers/consent/suppression; digest/campaign/delivery; robots/runs; audit; media; backup; deploy; system health.
Use a transactional production database (PostgreSQL recommended by prior architecture) and versioned API (e.g. /api/v1). Exact hosting implementation is selected at migration.

## 10. Step 26 acceptance gate
- Demo Admin link renders on desktop/mobile.
- All 16 modules are represented.
- Existing Robot #5 ADMIN_ONLY contract is preserved.
- Security Center distinguishes real vs demo/unconnected state.
- No secrets/PII embedded.
- No privileged action works client-side.
- Admin MASTER spec and security rules are in repository.
- Current public content/registry/digest artifacts can be inspected from the cockpit.
- Production gaps are explicit, not shown as GREEN.

## 11. Step 27 blockers
Do NOT call production ready until: server-side auth + MFA; RBAC API enforcement; production DB; forms backend; subscriber consent/suppression; real unsubscribe; email transport; audit persistence; backup/restore test; secrets management; security headers/WAF/rate limit; staging E2E; production health/rollback; final owner approval.


## 12. HARD RULE — ADMIN ENTRY / AUTHENTICATION FLOW
**APPROVED OWNER DECISION — 2026-09-30.**

The production Admin Backstage MUST use a dedicated administrative route on the final IIG domain:

`https://<IIG_PRODUCTION_DOMAIN>/admin/`

Canonical access flow:

`/admin/ -> IIG ADMIN BACKSTAGE Login -> Login + Password -> MFA one-time code -> authenticated Dashboard`

Mandatory rules:
- The public website does NOT need a visible ADMIN button. The administrative route is a separate operational entry point known to authorized users.
- Opening `/admin/` while unauthenticated MUST show only the IIG ADMIN BACKSTAGE authentication screen; protected Dashboard/content/API data MUST NOT be rendered before authentication.
- Step 1 requires Login + Password validated server-side over HTTPS.
- Successful password validation MUST NOT grant Dashboard access by itself.
- Step 2 requires a valid one-time MFA code for every privileged Admin Backstage account.
- Only after successful MFA may the server create the authenticated Admin session and open Dashboard.
- Authorization is then enforced server-side by RBAC for every protected API/action.
- Passwords, password hashes, MFA seeds/codes, session tokens and recovery secrets MUST NEVER be stored in public HTML/JavaScript, Git, browser localStorage or public artifacts.
- Authenticated session cookies MUST be Secure + HttpOnly + SameSite, with server-side expiry and revocation.
- Login and MFA endpoints MUST have rate limiting/brute-force protection and security audit events.
- Admin MUST provide explicit LOG OUT, inactivity timeout and server-side session termination/revocation.
- Failed password/MFA attempts MUST NOT reveal whether a login/account exists beyond the minimum safe authentication response.
- Recovery/reset flow MUST be server-side, audited and must not bypass MFA/RBAC controls.
- GitHub Pages demo MUST NOT implement fake client-side password protection. It may demonstrate the screens/flow only; real authentication is activated on the production backend during Step 27.
- Production release is BLOCKED if `/admin/` can expose protected data or privileged actions without the complete Password -> MFA -> authenticated session -> RBAC chain.

**Acceptance invariant:** `PASSWORD_OK != ADMIN_ACCESS`; only `PASSWORD_OK + MFA_OK + ACTIVE_AUTHORIZED_ACCOUNT + VALID_SERVER_SESSION` permits entry to Dashboard.


## 13. OWNER WORKFLOW — NEWS EDITOR / DIGEST BUILDER / MAILING CENTER
**APPROVED SCOPE — 2026-09-30.**

### 13.1 NEWS Editor and publication approval
Admin Backstage MUST provide a real content list and editor for NEWS and supported content types. Authorized users can open a material, edit title/category/date/summary/body/source/public slug, preview the resulting article, save a versioned draft and submit it for approval.
Production publication chain is mandatory:
`EDIT -> SAVE VERSION -> PREVIEW -> ADMIN APPROVE -> PUBLISH -> AUDIT`.
Robot #5 content enters the same review surface. No Robot may bypass Admin approval. Production PUBLISH requires authenticated backend RBAC and records actor, version/content SHA, reason/status and timestamp. Unpublish/rollback are required production functions.

### 13.2 Digest Builder
Admin Backstage MUST include a visual Digest Builder using the approved IIG Digest MASTER layout. Admin can:
- select approved NEWS/Finance/Regulation/Chief Engineer content from the content library;
- add/remove items from a Digest;
- change item order;
- move items between Digest pages;
- add additional pages when editorially required;
- rename/manage additional pages;
- preview the complete Digest structure;
- build the final renderer artifact/PDF;
- run direct-link and layout QA;
- approve the exact final Digest artifact/SHA.
The CMS controls content composition, not arbitrary MASTER design changes. Typography/layout/CTA MASTER remains governed by DIGEST_MASTER_SPEC and DIGEST_PROTOCOL. Production approval is `BUILD -> QA -> PREVIEW -> ADMIN APPROVE exact SHA -> READY_FOR_MAILING`.

### 13.3 Mailing & Recipient Database
Admin Backstage MUST include a separate `Mailing & Database` workspace.
Required production functions:
- import recipient database from approved CSV/XLSX format;
- validate and normalize email addresses;
- detect duplicates;
- map name/language/consent fields;
- store recipients only in the private production database;
- manage ACTIVE / UNSUBSCRIBED / BOUNCED / SUPPRESSED status;
- select the exact approved Digest;
- edit/approve campaign subject/template;
- run campaign preflight;
- send a controlled TEST SEND;
- start mass mailing only after Admin authorization;
- show delivery/reporting state and preserve campaign audit.
Recipient PII MUST NEVER be committed to Git, public JSON, static site assets or browser localStorage.

### 13.4 Mass-mailing HARD GATE
`START MAILING` is permitted only when all are true:
`AUTHENTICATED_ADMIN + MFA + RBAC + APPROVED_DIGEST_SHA + PRIVATE_RECIPIENT_DB + VALID_CONSENT + SUPPRESSION_CHECK + WORKING_UNSUBSCRIBE + EMAIL_TRANSPORT + DUPLICATE_SEND_PROTECTION + AUDIT`.
Failure of any term blocks send.

### 13.5 GitHub Pages Demo behavior
Step 26 demo MUST allow the owner to exercise the workflow safely:
- NEWS editing and Demo approval in volatile browser memory;
- Digest composition, pages, ordering and structure preview;
- CSV recipient parsing/validation/deduplication in volatile browser memory;
- campaign preflight.
The demo MUST NOT persist recipient PII, publish content, send email or perform privileged production mutations. Those actions remain visibly present but blocked until the Step 27 backend/security dependencies exist.


## 14. HARD RULE — UKRAINIAN ADMIN UX / SIMPLE OPERATION
**APPROVED OWNER DECISION — 2026-09-30.**

### 14.1 Language
- The default and primary language of the entire IIG Admin Backstage user interface MUST be Ukrainian.
- Navigation, buttons, field labels, help text, validation, warnings, confirmations, empty states, workflow guidance and operational notifications MUST be understandable in Ukrainian.
- English technical identifiers may remain only where they are established system terms or data identifiers (e.g. URL, API, MFA, SEO, CSV, SHA, slug), and MUST NOT replace a clear Ukrainian explanation for an administrator.
- New Admin modules/features MUST NOT ship with an English-only operator interface.
- UA Admin terminology is part of the portable MASTER and MUST survive hosting/domain migration.

### 14.2 Usability for any authorized administrator
The Admin UI MUST be task-oriented and understandable without knowledge of repository structure, Robots implementation or source code.
Primary owner workflow is visible in plain language:
`Новини та публікації -> Дайджест -> Розсилка та база`.

Mandatory UX rules:
- Use action names that describe the administrator's goal: `Створити новину`, `Зберегти чернетку`, `Попередній перегляд`, `Підтвердити`, `Опублікувати`, `Додати до дайджесту`, `Перевірити розсилку`, `Тестовий лист`, `Запустити розсилку`.
- Each workspace MUST show what the administrator should do next and the current state of the object.
- Technical/security detail MUST NOT obscure the normal editorial workflow; advanced details belong in Security/Audit/System areas.
- Dangerous or irreversible production actions MUST be visually distinct and require confirmation; security controls are never removed for simplicity.
- Forms use clear labels, sensible grouping, validation close to the field, and human-readable errors.
- Lists provide search/filter and a clear selected state.
- Preview is available before publication and before final Digest approval.
- The interface MUST distinguish `Чернетка`, `На перевірці`, `Підтверджено`, `Опубліковано`, `Заблоковано` using both text and visual state; color alone is insufficient.
- Empty states explain what is missing and how to proceed.
- Mobile/desktop layouts MUST preserve the same workflow and controls without horizontal operational confusion.
- An authorized administrator must be able to operate routine moderation without knowing GitHub, JSON, repository paths, Robot numbers or command-line tools.
- Robots and technical pipeline status remain available in a separate advanced module and do not replace human task navigation.

### 14.3 Acceptance test
Before Step 26 is accepted, owner testing MUST be possible entirely through Ukrainian UI for:
1. open/edit/preview/confirm a NEWS item;
2. compose/reorder/add pages/preview a Digest;
3. import and validate a recipient database, prepare a campaign and reach the protected send gate.
Any required routine step that forces the administrator to edit Git/JSON/source code is a Step 26 UX failure.


## 15. HARD RULE — SINGLE IIG CONTACT BASE / RADAR → CONTACT REVIEW → MAILING
**Owner request — 2026-09-30.**

The IIG Admin has one protected, unified contact database, not separate competing lists for RADAR and Digest. The administrator can import CSV/XLSX (CSV in static demo), search, add, edit, classify, deduplicate and review contacts; assign organization, position, language, source, provenance, consent evidence and mailing status. The production schema must retain audit/version history, source IDs, contact owner, verification timestamps and lawful processing basis.

**RADAR integration:** RADAR sends discovered decision-makers and contact proposals to a separate pending review queue with source/provenance, project/organization association and deduplication key. An Admin may reject, correct or accept a proposal into the unified contact database. Acceptance into the contact database MUST NOT mean marketing subscription or consent. RADAR never auto-enrolls contacts into the Digest mailing list, and RADAR cannot override UNSUBSCRIBED/BOUNCED/SUPPRESSED status. Contact sourcing, business outreach and marketing subscription are separate permissions/workflows.

**Mailing:** Only ACTIVE contacts with a documented applicable marketing consent or other verified lawful basis for the specific communication may be eligible, subject to jurisdiction and compliance review. Unknown/unspecified consent = PENDING and excluded. Opt-out, suppression and bounce history are immutable from ordinary import; reactivation requires a separate audited lawful event. Every campaign uses a suppression check immediately before send. Production import and export require authorization, audit and access restrictions; PII remains in the private DB, never Git, public HTML/JSON or static artifacts.

**Demo implementation:** the Ukrainian `Розсилка та база` workspace supports CSV import, search/filter, contact creation/editing, consent/status controls, RADAR CSV/JSON proposal import, duplicate detection and human acceptance/rejection. Demo data lives in volatile browser memory only. This is a manual RADAR import adapter, NOT a live RADAR connection or durable database. Real automated RADAR sync, XLSX parsing, persistent CRUD, suppression registry, campaign transport and role-scoped exports are Step 27 backend dependencies. Do not mark them as connected until verified.

**Production API contract:** `/api/v1/contacts`, `/api/v1/contacts/import`, `/api/v1/radar/contact-proposals`, `/api/v1/radar/contact-proposals/{id}/decision`, `/api/v1/consent-events`, `/api/v1/suppression`, and campaign recipient snapshots; exact implementation may differ while preserving semantics. Admin action and Robot ingestion must be authenticated, authorized, rate-limited and audited.


## 16. FINAL STEP 26 ADMIN MASTER GATE — 2026-10-01

STEP 26 is the ADMIN MASTER/CMS acceptance gate, not the production infrastructure gate. The canonical Demo entry is `admin-ua.html`; `admin.html` redirects to it to prevent stale English copies.

The operator-visible interface is Ukrainian. Only established technical identifiers/abbreviations may remain in English (IIG, CMS, MFA, RBAC, API, URL, CSV, XLSX, PDF, SEO, SHA, DB, HTTPS, SMTP, GitHub, MASTER). Machine identifiers and state values remain stable and are never translated inside code/data merely for display.

Canonical content state machine:
`DRAFT -> REVIEW -> APPROVED -> PUBLISHED`, with `REJECTED`, `BLOCKED` and production `UNPUBLISHED/rollback` branches. Demo may exercise DRAFT/APPROVED/REJECTED in volatile memory. Display labels are Ukrainian; machine states are not localized.

Canonical contact/mailing state model:
- UNKNOWN consent -> `PENDING` and excluded from mailing.
- Opt-out/bounce/suppression -> `SUPPRESSED` and excluded.
- `ACTIVE` requires documented evidence/lawful basis and still passes campaign suppression checks.
- RADAR acceptance into the contact base never implies `ACTIVE`.
- Approved MASTER XLSX schema is the production import contract; the public Demo may validate CSV locally and must never embed a third-party XLSX parser or persist PII merely to simulate production.

Digest library accepts only Admin-approved content. Every digest item must resolve to its same specific IIG article/advice URL. Missing IIG URL = `DIGEST_RELEASE_BLOCKED`.

Robot #7 must be reported from actual main state. As of this gate PR #10 is open/not merged, so Admin displays this honestly. STEP 26 GREEN MUST NOT be interpreted as seven-robot production release.

Final 10 gates:
1. UA LANGUAGE
2. NAVIGATION / UX
3. NEWS + CHIEF ENGINEER ADVICE CMS
4. ADMIN REVIEW / NO AUTO-PUBLISH
5. DIGEST BUILDER / direct-link QA
6. UNIFIED MAILING DATABASE / consent
7. RADAR / SUBSCRIBERS / PROJECT REQUESTS contract
8. ROBOTS / 260 SOURCES operator view
9. SECURITY / AUDIT / SYSTEM contract
10. OWNER E2E workflow

Repository acceptance is enforced by `python scripts/check_step26_admin.py`. A passing static/UI contract test means **STEP 26 ADMIN MASTER GREEN**. It does not waive any Step 27 blocker.


## 17. OWNER REVIEW — REQUESTS / ADMIN_1 GOVERNANCE — 2026-10-01

### 17.1 Incoming website requests
The Admin `Заявки` workspace MUST show a complete human-readable card for each website submission, not an empty placeholder. Project requests show at minimum: request ID, full name, company, email, phone, industry, solution/technology, free-text project description, consent text/evidence, timestamp/status. Digest subscription requests show full name, company, email, language, explicit Digest consent and status. Chief Engineer requests show full name, company, email, role/position, technical question, contact-processing consent and status.

Moderation rule: an Admin may approve or reject a request. Approved project/engineer contacts may be added to the unified IIG contact base as `PENDING`; processing consent for answering a request MUST NOT be converted into marketing consent. An approved Digest subscription with explicit evidence may enter as `ACTIVE`. Unsubscribe events MUST immediately set `SUPPRESSED`, must be visually highlighted red in Admin, and ordinary import must never reactivate them.

### 17.2 ADMIN_1
Primary accountable administrator:
- ID: `ADMIN_1`
- Name: Igor Kryvoshei
- Email: develop.iig@gmail.com
- Phone: +38 067 5063591
- Responsibility: correct operation of the IIG website and governance of Digest mailing.

The `Users & Roles` workspace is maintained in English by owner decision. Any new Admin account, restoration of Admin privileges, or elevation to an Admin role REQUIRES explicit approval by `ADMIN_1`. No second Admin, Robot, CI workflow or application service may self-approve or bypass this gate. Production approval requires MFA/RBAC and an immutable Audit event. `ADMIN_1` is the final authority for Admin-account governance unless the owner later changes this rule through a separately audited governance procedure.


## 18. ADMIN DIGEST MASTER VIEWER — 2026-10-01

The `Дайджест` workspace MUST expose the current approved Digest MASTER directly to ADMIN_1 as a read-only page-by-page reference before the editable Builder.

Current approved artifact:
- Owner-approved source: `IIG_Monthly_Digest_2026-09_FINAL_DEMO (2).pdf`
- Admin visual reference: `digest/admin-master-2026-09-v2.html`
- Legacy public-site file `digest/IIG-Monthly-Digest-2026-09.pdf` is NOT the ADMIN MASTER and MUST NOT be used by the Admin viewer.
- SHA-256: `6003552eed45f96e32bc1794b2297a04adef84dd319595844cebef57118111fc`
- Pages: exactly 3
- Page 1: Cover
- Page 2: 15 Ukraine / World events
- Page 3: Finance / Regulation / Chief Engineer Advice

Admin must be able to select Page 1/3, 2/3 and 3/3 and open the ADMIN MASTER v2 reference. The Admin reference must never silently fall back to the legacy public-site PDF. The reference is immutable/read-only; the working Digest Builder is a separate area below it. A Builder change does not alter the MASTER. Any replacement of this reference requires explicit ADMIN_1 approval, a new approved PDF artifact and a new SHA recorded in the Digest protocol.


## 19. DIGEST BUILDER PAGE-PACKING / ISSUE CONTROL / RUBRICS — 2026-10-01

Owner requirement: the working Digest in Admin MUST be formable page-by-page without avoidable blank areas.

- Page 1 is the locked cover layout; Admin controls the red issue badge month/year through a dedicated control.
- Page 2 and later NEWS pages use capacity-aware packing. Capacity is measured in layout units; headline length changes item cost, so the system does not rely on a blind fixed item count.
- Current NEWS page target capacity is 23 nominal short-headline slots, reflecting the approved layout remaining 7–8-card opportunity beyond the previous 15-card example.
- Page 3 reserves the Chief Engineer Advice block at fixed size and allows Finance/Regulation material to use the remaining capacity up to 14 nominal slots, reflecting the approximately five additional items identified by ADMIN_1.
- Overflow MUST move to the next compatible page; the UI shows used/free capacity and blocks manual moves that would overflow a page.
- The Auto-fill by free space action repacks all approved non-Advice content, prioritizing general NEWS and then Finance/Regulation, and creates additional NEWS pages only when required.
- Chief Engineer Advice is a fixed three-slot block on Page 3 and does not expand the page height.
- Admin content list and Digest library are grouped into the Digest rubrics: Ukraine / World, Financing, Regulation, Chief Engineer Advice.
- After Admin approval a material is visibly marked in green text as ZATVERDZHENO DO PUBLIKATSII / ЗАТВЕРДЖЕНО ДО ПУБЛІКАЦІЇ and enters the approved Digest library. Draft/rejected material must not carry this marker.
- Final approval is blocked if any page exceeds capacity or any Digest material lacks its exact IIG URL.


## 20. PORTABLE DIGEST CTA TYPOGRAPHY — OWNER LOCK — 2026-10-01
The current `main` branch and any future paid-hosting/domain deployment MUST preserve the latest approved Digest CTA typography. The bottom CTA pair on Page 1 uses white uppercase Bold labels at 14 px. The bottom CTA pair inside the fixed Chief Engineer block on Page 3 uses white uppercase Bold labels at 12 px. The two labels are `РОЗМІСТИТИ ПРОЄКТ` and `ПІДПИСАТИСЯ НА ДАЙДЖЕСТ`. This rule is part of the portable MASTER and cannot be silently reverted by migration, rebuild, Robot #6 or CSS normalization.


## 21. PAGE 3 — FINANCE + LEGISLATION CONTENT POOL — 2026-10-01

ADMIN_1 requirement: Page 3 of the working Digest MUST NOT remain empty when approved Finance or Regulation content exists.

Canonical Admin rubrics are now:
- `УКРАЇНА / СВІТ`
- `ФІНАНСИ`
- `ЗАКОНОДАВСТВО / РЕГУЛЮВАННЯ`
- `ПОРАДИ ГОЛОВНОГО ІНЖЕНЕРА`

The content model supports an explicit `digest_rubric` field independent of the industrial sector. This allows an article to remain, for example, Agriculture or Metallurgy in the site taxonomy while being intentionally placed in the Finance block of the Digest.

The approved demo pool contains at least 5 Finance items and 5 Regulation/Legislation items. Page 3 auto-packing places Finance first, then Regulation/Legislation, while retaining the fixed 3-slot Chief Engineer Advice block. If Page 3 capacity is exhausted, remaining eligible items flow to the next compatible page; they are never silently dropped or used to expand the fixed Advice block.

Regulatory content added to the approved pool is based on official primary sources (NEURC/NKREKP, Cabinet of Ministers, Verkhovna Rada) and must preserve the distinction between an enacted act and a draft bill. Each item has its own IIG article slug/direct URL so Digest direct-link QA remains valid.


## 22. DIGEST COVER + FLEXIBLE PAGES 4+ EDITOR — OWNER REQUIREMENT — 2026-10-01

Red-team review identified a missing operational layer: the Builder could compose approved materials but could not manage the working cover background/content or create fully designed extra pages for IIG original/promotional/project material.

### 22.1 Working cover editor
The Admin Digest workspace now provides a dedicated working-cover editor. ADMIN may change, for the current working issue:
- full-page background image;
- headline and subtitle;
- slogan;
- four cover announcements;
- background focal position and navy overlay strength;
- issue month/year through the existing separate control.

Background image gate: JPG/PNG/WebP only, max 10 MB, hard minimum 1200×1697 px, recommended 1800×2546 px or larger portrait source. The browser checks actual decoded dimensions before accepting the image. Low-resolution assets fail closed. Demo images stay in volatile browser memory and are never committed as hidden PII/content.

The approved read-only MASTER v2 remains the visual reference and is not mutated by working-cover edits. Final release of a materially changed cover requires Admin preview/approval and, in production, a newly rendered artifact/SHA.

### 22.2 Flexible pages 4+
Admin may add pages 4, 5, 6… as independent designed pages. Supported working page classes: `IIG_ORIGINAL`, `SUCCESS_PROJECT`, `PARTNER`, `SPONSORED`, `EDITORIAL`.

Each flexible page supports: background image with the same quality gate as the cover, page type/label, headline, subtitle/announcement, body copy, two configurable CTA labels and destinations, preview, rename/edit and deletion. This is intended for IIG original articles, successfully implemented project cases, partner material and clearly labelled advertising/sponsored content.

Every CTA/direct content destination must be an exact internal IIG route or HTTPS URL. Empty/unconfigured CTA is allowed; a configured invalid route blocks release. A page with no title or body blocks final Digest approval.

### 22.3 Governance / disclosure
Sponsored or partner material MUST be visibly identified as such; editorial/news material must never be silently converted into advertising. Working pages 4+ are not allowed to bypass Admin approval, direct-link QA, legal/rights review, or final exact-artifact approval. Robot #6 may render these pages but may not invent, auto-publish or auto-send them.

### 22.4 Portability
Cover and flexible-page configuration belong to the portable Digest schema and MUST survive migration to paid hosting/domain. Uploaded production backgrounds must be stored in the approved media storage/CDN rather than browser memory; Step 26 Demo only validates the operator workflow.


### 22.5 Red-team preservation rule — 2026-10-01
Auto-pack and compact/reorder logic MUST preserve all `promo` / page-4+ objects. Core NEWS repacking may rebuild pages 1–3 but MUST reattach additional pages in their existing order. Deleting/reordering a core NEWS item must never silently delete advertising, IIG ORIGINAL, Partner, Sponsored or Success Project pages.

Pages 4+ mirror the cover controls for visual composition: background image, focal position, navy overlay strength and announcement/teaser fields, in addition to title/subtitle/body/CTA. This closes the earlier partial implementation where extra pages had a background but lacked the cover-level positioning/overlay/announcement controls.


## 23. FILE-BASED IIG / ADVERTISING ARTICLE IMPORT — PAGE 2 CANVAS — 2026-10-01

ADMIN_1 requires a second mode for pages 4+: long personal IIG news, successful-project articles and advertising/partner materials may be imported from a separately prepared editor file rather than manually rebuilt card-by-card.

### 23.1 Source files
Step 26 Admin accepts DOCX, TXT, Markdown, RTF and HTML. DOCX parsing is local in the browser: the Admin reads the OOXML ZIP, extracts `word/document.xml`, paragraph text and embedded JPEG/PNG/WebP media. No external CDN/parser/API is used. Legacy binary `.doc` is intentionally not accepted; it must be saved as DOCX.

### 23.2 Canonical canvas
Imported material uses `ARTICLE_PAGE2_CANVAS`: the visual canvas, safe margins, top identity strip and footer logic follow Page 2. Article text/photos may differ, but the page may not grow vertically. Content is automatically paginated according to layout capacity. Overflow creates the next article page (4, 5, 6…) instead of shrinking below readability or creating empty dead zones.

### 23.3 Pagination
Paragraph length and images consume layout units. The first page reserves additional height for headline/lead; continuation pages reserve a smaller continuation heading. Images consume a fixed layout budget and embedded images with long side below 900 px are rejected from automatic layout as insufficient-quality source media. The administrator can edit imported text before pagination.

### 23.4 Repeated Subscribe CTA
Every generated ARTICLE_PAGE2_CANVAS page MUST contain the same lower Subscribe CTA component used by the Page-2 design: `ПІДПИСАТИСЯ НА ДАЙДЖЕСТ` -> `forms.html#subscribe`. Footer/CTA is reserved space and article text or images may not collide with it.

### 23.5 Editorial types and disclosure
Importer supports `IIG_ORIGINAL`, `SUCCESS_PROJECT`, `PARTNER`, `SPONSORED`. Partner/Sponsored type label remains visibly printed on every generated page. Import does not constitute publication approval. The resulting pages stay under final Admin approval, direct-link QA and exact-artifact SHA rules.

### 23.6 Preservation
Core Page 2/Page 3 auto-pack and compact logic MUST preserve both free-layout `promo` pages and imported `article` pages. Repacking normal news may not delete, reflow into, or reorder imported article sequences.


## 24. DEFAULT MASTER FALLBACK + ADMIN-ONLY NEXT-ISSUE READINESS — 2026-10-01

### 24.1 No-change fallback
If ADMIN does not explicitly change the working title page, the working Digest MUST use the approved MASTER v2 Page 1 as the default 1:1 title-page/canvas reference. Empty custom fields, missing custom background or absence of an Apply action must never produce a blank/blue substitute cover. Reset returns to the approved MASTER fallback. The same principle applies to canonical core canvases: Page 2 and Page 3 begin from approved layout standards; customization is opt-in, not required for a valid issue.

### 24.2 Editorial Admin-only workflow
STEP 26 now prepares the next issue through one operator path: repository baseline -> Admin editorial session -> review/approve -> Digest Builder. Public NEWS and ADVICE drafts are persisted locally in the browser under a versioned editorial-session key so an accidental refresh does not discard public editorial work. This local persistence is for non-secret editorial content only; credentials/PII are forbidden. A JSON export provides a portable editorial handoff. Production persistence remains backend-only.

### 24.3 CMS fixes from red-team audit
- NEWS editor exposes all nine industrial sectors plus Finance/Regulation/Other.
- Digest rubric is an independent Admin field (AUTO / General / Finance / Regulation / Advice) and does not corrupt the site's industrial taxonomy.
- ADVICE text editing now round-trips structured sections instead of silently discarding edits.
- Duplicate APPROVED filter state removed.
- Admin JS/CSS cache-busting versions must advance with functional changes.
- Website/media locked controls must explain the production gate instead of being inert.

### 24.4 New-issue readiness
Dashboard exposes operational counts for General, Finance, Regulation and Advice, unresolved Draft/Review content and direct-ID integrity. This is an operator readiness aid, not production approval. Robot/security/backend blockers remain visibly separate.

### 24.5 Source registry honesty
Admin Source view distinguishes owner approval from technical URL/feed verification. A source is not production-ready merely because `owner_approved=true`. Search/filter and URL/feed state are visible to Admin; this prevents the 260-source registry from being presented as technically connected when adapters remain unconfigured.


## 25. SEPTEMBER 2026 FULL-MONTH ADMIN CYCLE — 2026-10-01
The September issue is built from the completed calendar month 2026-09. Digest Auto-fill and readiness MUST filter editorial material by the selected issue month/year; archived approved material from other months remains on the website but is not silently reused in the new issue. The September release-candidate manifest is `content/digest-issues/2026-09-admin-candidate.json` and records the Admin Builder input set only; it is not a manually rendered Digest and it is not final publication approval.

The September candidate contains a verified editorial pool across general industrial-energy news/events, Finance, Regulation/Legislation and Chief Engineer Advice. Packing remains dynamic and based on the existing Admin capacity algorithm. If the full month exceeds a single core page, the system creates continuation pages rather than shrinking typography or dropping approved material. Final PDF/artifact SHA remains unapproved until ADMIN_1 reviews the rendered result.


## 26. ADMIN_1 REVIEW RESET / IMAGE FALLBACK / FINAL DIGEST PREVIEW — 2026-10-01
All NEWS for issue 2026-09 start in machine state `REVIEW` with `admin_approved=false`. No September NEWS enters the public site or Digest Builder until ADMIN_1 explicitly approves it in Admin. The browser editorial-session key is versioned for this review reset so historic Demo approvals cannot silently override the new REVIEW baseline.

Finance and Regulation news use the normal image priority: authorized article-specific image -> company logo if approved -> dedicated editorial rubric fallback. The rubric fallback is an explicitly labelled illustrative energy-infrastructure image and must never be represented as the reported facility/project. `Фото недоступне` is reserved for the case where both primary and approved fallback assets fail.

Admin Digest includes a separate FINAL LAYOUT PREVIEW after ordinary working preview. Final preview is blocked while any current-issue NEWS remains REVIEW/DRAFT/rejected, any direct link is invalid, a page overflows, or the fixed Advice block does not contain exactly three approved items. Final preview is visual QA only: it cannot publish the website, create mailing authorization or trigger Robot #7. Final layout approval and production publish/send remain distinct ADMIN_1 actions.


## 27. TEXT + IMAGE DOUBLE APPROVAL — ADMIN_1 — 2026-10-01
NEWS approval is a two-part Admin workflow. Text/content approval and image approval are independent gates. A NEWS item may enter machine state `APPROVED` and the Digest library only if `admin_approved=true` AND `image_admin_approved=true`. Editing the text of an already approved item returns its content state to REVIEW until ADMIN_1 approves the correction again; unchanged image approval may remain valid. Changing/resetting the image always clears image approval.

The NEWS editor provides three image sources: (1) rights-verified source_photo/company logo already registered on the item; (2) IIG repository image catalog/fallback with explicit illustrative labelling; (3) local ADMIN upload. A local upload requires explicit ADMIN_1 confirmation that IIG has the right to use the image and requires a credit/rights-owner field. Step 26 stores local uploads only in browser editorial state; production publication MUST first persist the asset to approved media storage/CDN and record rights metadata and Audit. If no image is approved, NEWS approval fails closed.

Successful editorial approval uses a normal green Admin confirmation. The protected-production modal is reserved for actual production actions such as Publish; it must not be shown for a successful Step 26 editorial approval because that falsely implies the approval failed.


## 28. ACTIVE ADMIN_1 EDITORIAL SESSION / NON-BLOCKING APPROVAL UX — 2026-10-01
STEP 26 Demo runs with an explicit editorial identity `ADMIN_1 / Igor Kryvoshei`. This identity may approve NEWS images, approve NEWS content and approve the final Digest layout. These operations are guarded by `requireAdmin1()` and logged as ADMIN_1 editorial actions. The Demo identity is explicitly NOT production authentication: `production_authenticated=false`; production Publish/Send/user-management remains Step 27 only.

Successful image/content approval MUST NOT open a blocking modal that resembles a production-security warning. It now uses a short non-blocking green toast and leaves the editor in place so ADMIN_1 can continue reviewing the next item. The protected modal is reserved for true production-locked actions or blocking validation errors.


## 29. STEP 26 DEMO PUBLICATION — 2026-10-01
ADMIN_1 may complete the full editorial acceptance cycle inside the Step 26 demo by changing a fully approved NEWS item to machine state `PUBLISHED` through the button `Опублікувати у DEMO`. Preconditions: active ADMIN_1 editorial authority, content approval, image approval and rights metadata. The action records `demo_published=true`, ADMIN_1 identity and timestamp in the local editorial session and Audit, and keeps the item eligible for Digest Builder.

Demo publication is NOT production publication and does not mutate the paid-hosting/public production backend. Production publication remains a separate Step 27 server-side action protected by Password + MFA + RBAC + server session + immutable Audit. Editing text or changing/resetting an image after Demo publication invalidates the publication state and returns the item to REVIEW for fresh ADMIN_1 approval.

The UI must not show the production-security modal when `Опублікувати у DEMO` succeeds. Successful Demo publication uses a non-blocking green Admin toast. The production-security modal is reserved for actual Step 27 operations.


## 30. ADMIN_1 RIGHTS FAST-PATH FOR NEWS IMAGES — 2026-10-02
ADMIN_1 is the accountable person who personally verifies whether an image may be used. For a locally uploaded NEWS image, the editorial image-rights gate is satisfied by one explicit ADMIN_1 confirmation that the official/source rights were personally checked. The separate `Credit / rights owner` text field is optional for ADMIN_1 and must not block image approval.

When ADMIN_1 confirms rights, the editorial state records at minimum: `rights_verified_by=ADMIN_1`, `rights_verification=OWNER_CONFIRMED`, timestamp, selected image metadata and the article/source URL when available. If ADMIN_1 supplies a credit, it is preserved; otherwise the system records a neutral audit value such as `Rights verified by ADMIN_1`.

This fast-path does not remove responsibility or the Audit requirement. It removes duplicate manual entry after ADMIN_1 has already performed the legal/source check. Production Step 27 must persist the image, source/reference and rights-verification metadata in server-side storage/Audit.


## 31. ADMIN ARTICLE PREVIEW / DEMO PUBLIC BRIDGE / TOP-5 — 2026-10-02
ADMIN_1 requires a full article preview inside Admin before publication. The preview must render the selected/approved image, date, sector, title, lead, body and source URL in an article-like canvas without forcing navigation to the public website.

Step 26 Demo publication must be observable on the Demo public surface. Public Demo renderers may overlay only local browser editorial records that meet ALL conditions: NEWS, `status=PUBLISHED`, `demo_published=true`, `admin_approved=true`, `image_admin_approved=true`. REVIEW/DRAFT/APPROVED-but-not-published local records must never leak onto the public Demo. This bridge is same-browser Demo behavior only and is replaced by backend persistence in Step 27.

A NEWS item has an optional boolean `homepage_top5`. Setting it does not remove the item from its industrial sector or the global News/Insights feed. Published items always appear in their sector and global feed; `homepage_top5=true` additionally gives the item priority in the homepage TOP-5 selection. If fewer than five flagged items exist, remaining TOP-5 positions are filled by the newest published items. Editing this flag after publication invalidates the content approval through the ordinary review rules.


## 32. EDITORIAL EMPHASIS + MONDAY UPDATE WINDOW — OWNER LOCK — 2026-10-02
### 32.1 Article preview
The Admin article preview is a release-control surface, not a small notification dialog. It MUST be vertically scrollable, render the approved/selected image at article width, preserve caption, date/sector metadata, title, lead, Company/Context, full body and primary source, and use the same editorial emphasis rules as the public article page.

### 32.2 Automatic bold emphasis
The NEWS renderer and Admin preview MUST automatically emphasize in bold, where present in article text/context: dates; investment/CAPEX/OPEX/project-cost amounts; monetary values; key capacities/technical numbers and percentages; named executives/interview participants together with roles such as CEO/Chief Executive Officer/генеральний директор/президент/голова правління; and direct quoted speech when the paragraph is attributable to an executive/interview participant. This is an editorial readability rule and must be identical in Admin Preview and the public article renderer. It must not invent names, figures, quotes or dates that are absent from source content.

### 32.3 Weekly refresh cadence
The canonical NEWS refresh window is every Monday, 09:00–10:00 local time in `Europe/Prague`. Robots #1 and #2 perform discovery/content preparation during that window, followed by Quality Gate #3 and Image/Rights #4. Newly prepared materials end in `REVIEW`; `auto_publish=false`. Publication occurs only after ADMIN_1 reviews text, source facts, image/rights, preview and explicitly approves/publishes the material. The scheduler must use the IANA timezone `Europe/Prague` so daylight-saving changes do not move the owner-facing window.

Machine-readable contract: `content/news-update-schedule.json`.


## 33. PUBLISHED VISIBILITY CONTRACT / NUMERIC EMPHASIS — 2026-10-02
### 33.1 Status semantics
After ADMIN_1 executes `Опублікувати у DEMO`, the NEWS list must immediately display **ОПУБЛІКОВАНО**. `PUBLISHED` must never be visually collapsed into `ЗАТВЕРДЖЕНО ДО ПУБЛІКАЦІЇ`; APPROVED and PUBLISHED are distinct workflow states.

### 33.2 Mandatory publication destinations
A NEWS item in `PUBLISHED` must automatically appear without a second editorial action in: (1) its canonical industrial-sector page; (2) the global `Новини та інсайти` feed; and (3) the homepage TOP-5 only when `homepage_top5=true`. Therefore a BASF NEWS item with `sector=chemical` must appear in `Хімічна промисловість` and the global feed immediately after publication. If any mandatory destination is absent, publication is incomplete.

For Step 26, the browser Demo uses a dedicated `PUBLIC_DEMO_PUBLISHED_KEY` bridge for fully published ADMIN_1-approved NEWS. Uploaded images are resized to a browser-safe web representation before persistence. If the bridge cannot be stored, the action must fail visibly and the item must remain APPROVED rather than falsely claiming PUBLISHED. Step 27 replaces this browser bridge with durable backend publication.

### 33.3 Numeric emphasis
The common editorial formatter must bold subject-relevant percentages and numerical facts when paired with meaningful context/units: capacities and energy, years/durations, numbers of turbines/engines/installations/containers/blocks/units/projects/sites, distances/areas/flows and comparable technical quantities. It must not bold every standalone digit indiscriminately and must not invent facts absent from the source material.


### 33.4 PERCENT EMPHASIS REGRESSION LOCK — 2026-10-02
Percent values use a dedicated formatter and MUST render bold regardless of following punctuation or whitespace. Required examples: **30%**, **19%**, **12,5%**, including `30%.` and `19% пов’язане`. The matcher must not depend on a trailing word-boundary after the `%` symbol. The same rule applies in Admin Preview and the public article page, including summary/lead and full body.


## 34. APPROVAL LEDGER + BULK FREEZE + MANUAL NEWS REFRESH — 2026-10-02
### 34.1 Approval preservation
ADMIN_1 approvals are durable editorial decisions and MUST NOT be reset by later NEWS refreshes, cache-version changes or additions of new material. Step 26 stores approved/published snapshots in the stable browser key `iig.admin.approval-ledger.v1`. This key is intentionally not versioned. On first load after this rule is deployed, the Admin automatically migrates already APPROVED/PUBLISHED records from the current editorial session into the Approval Ledger. New baseline data from main is merged underneath the ledger; previously approved content remains approved unless ADMIN_1 edits/rejects it, which explicitly invalidates the lock.

### 34.2 Bulk freeze
Admin provides `ЗАФІКСУВАТИ ВЕСЬ ЗАТВЕРДЖЕНИЙ МАТЕРІАЛ`. It snapshots every already APPROVED/PUBLISHED item (NEWS also requires approved image) into the Approval Ledger. It MUST NOT bulk-approve DRAFT/REVIEW material. This protects the owner's completed verification without weakening per-item moderation.

### 34.3 Weekly and manual refresh
The canonical automatic refresh window is Monday 09:00–10:00 `Europe/Prague`. In addition, ADMIN_1 may initiate a refresh at any time using `ОНОВИТИ НОВИНИ ЗАРАЗ`. Manual refresh uses the same pipeline: Discovery #1 → Content #2 → Quality #3 → Image/Rights #4 → ADMIN REVIEW. Manual or scheduled runs MUST preserve Approval Ledger records, MUST set newly generated content to REVIEW, and MUST keep `auto_publish=false`.

Because Step 26 is static GitHub Pages, browser code must not contain a GitHub token. The Admin button records the ADMIN_1 request, freezes current approvals, reloads the current main registry and opens the protected GitHub Actions `editorial-refresh.yml` workflow for authenticated execution. Step 27 may replace this with a server-side one-click API action while preserving the same role/Audit contract.


## 34. TOP-5 FLAG IS OPTIONAL ONLY — 2026-10-02
The Admin checkbox `homepage_top5` controls ONLY priority placement in the homepage TOP-5. It must never control or gate ordinary publication destinations.

For every NEWS item that reaches `PUBLISHED`, two destinations are mandatory and automatic: (1) the canonical industrial-sector page determined by `sector`; (2) the global site section `Новини та інсайти`. No extra checkbox or Admin action is required for these two destinations.

If `homepage_top5=true`, the same already-published NEWS receives one additional destination/priority: homepage TOP-5. If the flag is false, the NEWS still remains published in its sector and in `Новини та інсайти`.

Admin UI wording must make this separation explicit so the operator never interprets the TOP-5 checkbox as controlling sector/global publication.


## 35. ADVICE PUBLICATION / CONCEPTUAL SCHEMATIC — SUPERSEDED BY §40
The temporary generic-fallback rule is retired. See §40: every final APPROVED/PUBLISHED Chief Engineer Advice requires its own content-specific conceptual engineering schematic.


## 36. HOMEPAGE MUST SHOW LATEST 6 ADVICE — 2026-10-02
The homepage block `6 ОСТАННІХ ПОРАД` is mandatory dynamic content. It MUST load from the canonical `content/public-advice.json` registry through the same public Advice renderer used by `advice.html`.

Selection rule: include only Advice with `status=APPROVED/PUBLISHED` and `admin_approved=true`, sort descending by `publication_date`, and render exactly the six newest available items. No manual homepage curation is required.

After every new approved Advice publication, the homepage block must update automatically so the newest six replace older entries. The block must never remain empty when the canonical Advice registry contains approved items. Missing renderer connection, stale ordering or zero homepage Advice while approved Advice exist are release-blocking defects.


## 37. INDUSTRY NEWS USE ADVICE-STYLE CARDS / HOMEPAGE SIX VS DIGEST THREE — 2026-10-02
### 37.1 Industry NEWS presentation
Every industrial-sector page MUST render real PUBLISHED NEWS through the canonical public NEWS registry/ADMIN publication bridge. Legacy hard-coded demo cases must not populate the live sector feed.

Within each sector, NEWS uses the same editorial card principle as Chief Engineer Advice: image on top, compact taxonomy/date metadata, strong headline, short summary and a clear `ЧИТАТИ НОВИНУ →` action. Desktop layout is a three-column responsive grid, collapsing to two and then one column. This is a presentation rule only; the material remains NEWS and links to the NEWS article renderer.

All nine canonical sectors must resolve correctly: energy, metallurgy, food, logistics, datacenters, chemical, agriculture, pharma, waste.

### 37.2 Homepage Advice count
The homepage right rail MUST show the six newest approved/published Chief Engineer Advice items, sorted descending by publication_date. The two CTA controls below the list remain permanently visible: `ЗАДАТИ ПИТАННЯ ГОЛОВНОМУ ІНЖЕНЕРУ` and `НАДІСЛАТИ ПРОЄКТ`.

### 37.3 Digest remains fixed at three Advice
Increasing the homepage teaser list from 3 to 6 MUST NOT change Digest composition. The Digest fixed Advice block remains exactly **3** approved Advice items according to the existing Digest capacity and release rules. Homepage count and Digest count are independent presentation contracts.


## 38. DASHBOARD ONE-CLICK NEWS REFRESH CONTROL — 2026-10-02
The Admin Dashboard quick-actions area MUST expose one prominent control labelled `СГЕНЕРИРОВАТЬ ОБНОВЛЕНИЕ КОНТЕНТА НОВОСТЕЙ САЙТА` so ADMIN_1 does not need to navigate to Robots first.

The control represents the canonical manual editorial refresh chain: freeze/preserve current ADMIN_1 approvals -> Discovery #1 -> Content #2 -> Quality #3 -> Image/Rights #4 -> new material in REVIEW. It must never auto-publish.

The Dashboard must show an operator-facing duration indicator. In Step 26 Demo it displays an indicative full-cycle estimate of approximately 10–20 minutes and a live elapsed timer starting when ADMIN_1 requests the run. Because GitHub credentials must not be stored in browser JavaScript, the Demo button opens the protected GitHub Actions workflow for the actual privileged dispatch. Production Step 27 replaces that handoff with authenticated backend/API dispatch while preserving the same Dashboard UX and live run-status/timing surface.


## 39. DIGEST ROLE SPLIT / CURRENT-CONTENT CANDIDATE — 2026-10-02
Digest Builder supports two operational roles. ADMIN_2 is the Digest Builder: may generate/rebuild the release-candidate, manage layout/content, run previews and QA. ADMIN_1 is the final approver: may perform Builder actions and exclusively approves the final generated version. ADMIN_2 cannot approve final release or mailing.

The Generate New Digest action MUST read only the current approved/published CMS + Approval Ledger state for the selected issue. Historical content/digest-issues/*-admin-candidate.json snapshots are not release authority and must not silently override current Admin approvals. Candidate state is AWAITING_ADMIN_1_APPROVAL until ADMIN_1 final approval.

Public site policy: no old/static Digest file may remain linked after it is superseded. While the new issue is pending final approval, public Digest UI may offer subscription/status only; download is enabled only after ADMIN_1-approved exact artifact/SHA exists.


## 40. CHIEF ENGINEER ADVICE — CONTENT-SPECIFIC SCHEMATIC REQUIRED — 2026-10-02
Every final Chief Engineer Advice publication MUST be accompanied by a dedicated conceptual engineering schematic that explains the core structure, flow, interfaces, decision logic or system architecture of that specific advice.

A generic IIG editorial placeholder is permitted only during DRAFT/REVIEW and MUST NOT appear on the public Advice page for APPROVED/PUBLISHED material.

The schematic standard is:
- conceptual/engineering, not decorative stock photography;
- directly tied to the technical thesis of the Advice;
- uses clear nodes, flows, interfaces or decision chain;
- visually consistent with IIG engineering identity;
- captioned/identified as a conceptual IIG schematic, not an as-built drawing;
- available both on the Advice card and full Advice article.

Publication gate: APPROVED/PUBLISHED + admin_approved=true is insufficient if a dedicated schematic for the Advice slug is absent. Missing schematic is a release-blocking defect and must fail closed in CI rather than silently substituting a generic illustration.

For each new Advice generated by Robot #2, the content package must therefore include a conceptual_schematic definition before ADMIN approval/publication.


## 41. PUBLIC SEARCH / DIGEST CTA / ADVICE SCHEMATIC CACHE — 2026-10-02
### 41.1 Public bilingual search
The homepage search control is an operational site search, not decorative UI. Clicking ПОШУК/SEARCH or pressing Enter MUST search approved public content by keywords across BOTH Ukrainian and English fields, regardless of the currently selected UI language.

Minimum indexed sources: NEWS title/summary/body/company context/sector; Chief Engineer Advice title/summary/topic/sections; all nine industrial sectors; financing and core public sections. Matching must be case-insensitive and must support Ukrainian and English keywords. Results link directly to the corresponding NEWS article, Advice article or public section.

### 41.2 Advice schematic cache/version rule
Whenever conceptual schematic definitions are changed, every public surface loading public-advice.js (Advice listing, Advice article and homepage latest-Advice renderer) MUST advance the same cache-busting version. A stale cached generic placeholder after a schematic release is a release-blocking defect.

### 41.3 Public Digest CTA privacy
Internal workflow language such as ADMIN_1 approval state MUST NOT be exposed in the public Digest CTA. The public card may identify the monthly Digest, languages and cadence only. The circular Digest action icon uses a downward arrow for download-oriented semantics. Browser JavaScript MUST NOT rewrite the card to a deleted/superseded legacy PDF.


## 42. PORTABLE PUBLIC UX + SEARCH SOURCE OF TRUTH — 2026-10-02
The following public UX decisions are migration invariants and MUST survive transfer from GitHub Pages to paid hosting/domain:
1. Chief Engineer Advice uses content-specific conceptual engineering schematics for every APPROVED/PUBLISHED Advice; generic placeholders are forbidden for final public Advice.
2. The public Digest CTA uses the downward arrow (↓) and never exposes internal ADMIN_1/ADMIN_2 workflow text.
3. Homepage public search is operational and bilingual UA+EN.

Search source-of-truth is the union of:
- approved/published repository NEWS;
- same-browser Step-26 published NEWS bridge, so ADMIN-published Demo articles are searchable immediately;
- approved Chief Engineer Advice;
- Finance hub/institution destinations and bilingual aliases;
- canonical industrial sectors and core public sections.

Search query normalization MUST ignore conjunction stopwords such as і, та, and and support bilingual aliases including ЄІБ ↔ EIB. Multi-term queries rank items matching all meaningful terms above partial matches. A public article that is visible through the Demo publication bridge but absent from search is a release-blocking defect.

Example acceptance case: query `ЄІБ і BNP Paribas` must surface the published EIB/BNP Paribas NEWS item when it exists in the current public bridge/current approved registry, plus relevant finance destinations where applicable.


## 43. PUBLIC SEARCH RUNTIME SAFETY — 2026-10-02
The homepage search renderer MUST define and use a local HTML-escape helper before rendering result titles/summaries. A successful query must never fail at the presentation stage because of an undefined renderer helper.

Search button click and Enter use the same guarded execution path. Any runtime exception is logged as SEARCH_RUNTIME_ERROR and must surface a visible error block instead of failing silently.

Release acceptance verifies the renderer helper, guarded execution and cache-busting. The control query is: ЄІБ і BNP Paribas. When the corresponding ADMIN-published NEWS item exists in the Step-26 published bridge, results must include a direct link to that article.


## 44. CONTACT IIG PROJECT CTA ROUTING — 2026-10-02
The public CONTACT IIG card button `SUBMIT YOUR PROJECT →` MUST route directly to `forms.html#project`. It must never point to the homepage `#project` fragment or any non-form placeholder. This route is a migration invariant for paid hosting/domain transfer.


## 45. PRE-DIGEST GENERATION INTEGRITY GATE — 2026-10-02
Before a monthly Digest is generated from Admin, these invariants are mandatory:
- historical digest-issue candidate JSON files are reference snapshots only and must have release_authority=false;
- ADMIN_2 may build, edit, preview and QA a release-candidate; ADMIN_1 alone grants final approval;
- every release-candidate stores a deterministic fingerprint of issue, page structure, selected materials, direct links and cover/layout state;
- any change after candidate generation invalidates final approval and requires regeneration;
- Final Preview must render without undefined variables/runtime errors and show the exact current candidate layout;
- Digest uses exactly 3 newest approved Advice items; the homepage 6-Advice rule is independent;
- public pages must not expose internal ADMIN role workflow text;
- legacy Digest HTML/PDF routes remain absent.

Passing CI with these invariants establishes READY TO GENERATE. It does not authorize publication or mailing.


## 31. DIGEST COVER BACKGROUND — ADMIN_1 RIGHTS + APPLY CONFIRMATION — 2026-10-02
The Digest cover editor separates image technical validation from editorial authorization. Selecting a file only creates a pending background. ADMIN_1 must explicitly confirm rights before the image can be applied to the working cover. The approval action is guarded by requireAdmin1() and records actor, rights basis, timestamp, filename and dimensions in Audit/editorial state.

«Застосувати до титульної» must fail closed for a pending/unapproved custom background. On success the UI gives an explicit non-blocking confirmation that the background was applied, and all working/final previews must render that exact image. The MASTER v2 fallback remains pre-approved. A flat navy fallback appearing after an approved custom upload is considered a rendering regression and release blocker.


## 32. DIGEST COVER MASTER-LAYOUT INVARIANT — 2026-10-02
The Admin cover editor may edit background, cover text and issue content but may not silently switch to an alternate title-page composition. For a custom approved background, the renderer must preserve the owner-approved MASTER v2 structure: IIG header/UA-EN, title/subtitle, issue badge, mission, four linked thematic rows with icons/read-more, KPI strip, Project CTA and Subscribe CTA. The CTA destinations are fixed to forms.html#project and forms.html#subscribe. Visual drift from this structure is release-blocking.


## 33. DIGEST FINAL PREVIEW MUST PRECEDE FINAL APPROVAL — 2026-10-02
The Admin workflow separates inspection from authorization. ADMIN_2 or ADMIN_1 builds a release-candidate from eligible approved content. The exact candidate then opens in «ФІНАЛЬНИЙ ПЕРЕГЛЯД ВЕРСТКИ» across all pages before approval. QA blockers may be visible in Preview and must be corrected before approval, but they do not prevent visual inspection itself. Unapproved NEWS outside the candidate are not release blockers for this candidate.

Final approval by ADMIN_1 requires preview_completed=true and preview_fingerprint equal to the current digestFingerprint(). Any material/layout edit after preview invalidates the approval path and requires a fresh candidate and fresh Final Preview.


## 34. DIGEST CANDIDATE BROWSER STORAGE SAFETY — 2026-10-02
The release-candidate must be lightweight. Embedded base64/data-URL image bytes from the custom cover, article pages or promotional pages are excluded from the persisted fingerprint and replaced by deterministic compact markers. This prevents QuotaExceededError during «СФОРМУВАТИ НОВИЙ ДАЙДЖЕСТ».

Admin persistence order: localStorage first, sessionStorage fallback for the current session. A successful sessionStorage fallback is accepted for Demo QA and is surfaced to the operator. Final production persistence remains server-side in Step 27.


## 35. FINAL DIGEST APPROVAL -> PUBLIC PDF ROUTE — 2026-10-02
After the exact candidate has been Final-Previewed and ADMIN_1 approves it, Admin records the canonical public PDF path and exposes an «OPEN / DOWNLOAD PDF» link. The public website homepage Digest card points to the same versioned artifact. Pages deployment must build and verify that PDF before publishing the site. Mailing remains separate and must not be auto-triggered by PDF publication.


## 36. ADMIN-ONLY DIGEST EXPORT — SUPERSEDING RULE — 2026-10-02
ADMIN_1 final approval unlocks two export actions inside Admin: self-contained HTML download and browser PDF print/save. Both are generated from the current exact digestFingerprint() state and are blocked if that state differs from the approved/previewed candidate.

No Pages/CI/public-host generator may create the Digest. The Admin export contains the approved cover background (including uploaded data image), approved content and active links, making it portable to later paid hosting/domain deployment. Public publishing and mailing are downstream distribution steps, not generation steps.


## 37. DIGEST ADVICE — CLICKABLE + 1.5× TYPE — 2026-10-02
Admin Final Preview and Admin-generated artifacts must render each fixed Advice item as one clickable anchor using publicUrl(ADVICE), with both title and «Детальніше →» inside the anchor. Font size is locked to 13.5 px, i.e. 1.5× the previous 9 px value. Project and Subscribe controls in the same block are real anchors, not spans. CI must reject regressions.


## 38. DIGEST AUTO-PUBLISH / ARCHIVE ROTATION — 2026-10-02
Production Admin contract: after exact candidate Final Preview and ADMIN_1 final approval, Admin serializes the exact approved artifact and POSTs it to `/api/v1/digest/releases`. The backend requires authenticated ADMIN_1/MFA/session/RBAC and performs one transaction: archive previous CURRENT, persist new artifact, promote new CURRENT, return public_url/archive_url, and mark download_state=READY_FOR_DOWNLOAD plus mailing_state=READY_FOR_MAILING. Failure rolls back the rotation and Admin reports publication failure; no partial CURRENT switch is allowed.

The API accepts the already-generated Admin artifact and fingerprint. It MUST NOT regenerate Digest content from CMS or CI. Public site and Robot #7 consume the same artifact identity. Mailing remains separately executed, but it may start only from the READY_FOR_MAILING exact CURRENT artifact.

The final page of the generated artifact always contains two real anchors: Project -> forms.html#project and Subscribe -> forms.html#subscribe. CI treats their absence from the true final page as release-blocking.


### 38.1 Public current/archive read contract
Public site reads `GET /api/v1/digest/current` for the active download target and may read a paginated archive endpoint such as `GET /api/v1/digest/releases?status=ARCHIVE`. The public page never selects CURRENT by filename/date heuristics. Only the successful ADMIN_1 publication transaction changes CURRENT. Static Demo falls back to a non-download Digest information route when this backend is absent.


## 39. CANONICAL DIGEST PDF + LINK VERIFICATION — 2026-10-02
After ADMIN_1 approval, Admin sends the exact self-contained approved artifact to `/api/v1/digest/releases` with `output_format=PDF` and a complete list of IIG links expected in the PDF. The backend renders that exact artifact to PDF and verifies PDF link annotations before returning success. Required response includes a `.pdf` `public_url` and `links_preserved=true`.

If PDF creation or link verification fails, the transaction fails closed: previous CURRENT remains CURRENT and the candidate is not marked READY_FOR_DOWNLOAD or READY_FOR_MAILING. On success the backend atomically archives the previous CURRENT PDF, promotes the new PDF to CURRENT, and Robot #7 uses the same public PDF artifact. Content/layout generation remains Admin-only; backend conversion is technical serialization only.


## 40. DIGEST PAGE 3 / PAGE 4+ PACKING AND CTA CONTRACT — 2026-10-03
The Admin Builder reserves Page 3 capacity for enlarged Advice typography plus mandatory Project/Subscribe CTAs. Page 3 content capacity is therefore lower than ordinary NEWS pages and the auto-packer balances FINANCE and REGULATION counts with target parity; when both categories have available items, difference >1 is a QA blocker.

Working Preview must render the CTA footer on Page 3 and every page index >=4. Final Preview/export uses the same rule. Project route is `forms.html#project`; Subscribe route is `forms.html#subscribe`. Additional pages created by overflow, imported articles or promo content cannot omit these controls. CI guards both routes, Page 3 balancing logic and Page 3+ CTA rendering.
