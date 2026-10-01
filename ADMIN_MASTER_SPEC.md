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
