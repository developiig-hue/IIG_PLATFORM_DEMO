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
