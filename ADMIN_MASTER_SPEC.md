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
