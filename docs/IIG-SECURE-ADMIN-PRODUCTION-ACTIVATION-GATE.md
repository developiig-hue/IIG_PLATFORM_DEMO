# IIG SECURE ADMIN PRODUCTION ACTIVATION GATE
Status: BLOCKED UNTIL LIVE STAGING VALIDATION
Date: 2026-10-13

## Scope
Production /admin/ -> password login -> MFA -> secure server session -> RBAC.
All privileged NEWS, approval/publication, Digest approval/release, mailing, requests, contacts, RADAR actions must execute via backend, never browser localStorage as source of truth.

## Existing implementation
- backend/src/session-auth.mjs: scrypt password hashes, TOTP MFA, HttpOnly secure cookie, session expiry, CSRF.
- backend/src/admin-login.mjs: two-step login UI.
- backend/src/server.mjs: API endpoints and protected routes.
- backend/test/admin-e2e.test.mjs: simulated end-to-end sequence.
Existing implementation is not proof of paid-hosting deployment.

## Mandatory fail-closed gates
1. Paid-hosting staging domain and HTTPS configured; /admin/ served from same-origin production backend.
2. Real ADMIN_1/ADMIN_2 usernames, scrypt hashes and TOTP secrets configured ONLY as server-side secrets. No credentials committed to GitHub.
3. Login failures, MFA replay/expiry, session expiry, logout, CSRF and ADMIN_2 forbidden operations tested.
4. Every privileged frontend button calls protected /api/v1 endpoints. Remove localStorage/demo fallback for privileged mutations in production.
5. ADMIN_2 may draft/edit; ADMIN_1 final publication, commercial price and Digest approval.
6. NEWS draft -> review -> ADMIN_1 approve -> publish -> verify public page.
7. Digest fingerprint -> ADMIN_1 approval -> validated PDF -> CURRENT public URL -> download and links verified.
8. Test mailing uses SMTP sandbox or authorized test inbox only. Do not send to real contact database in E2E.
9. Requests intake -> processing -> contact promotion -> audit verified.
10. RADAR /api/v1/radar/runs uses configured production provider; simulated E2E response alone is insufficient.
11. Persistent DB/object storage, backups/restore, SMTP, production secrets and /readyz all GREEN.
12. Mobile/desktop, UA/EN, site search, PDF, MARKET and design HARD RULE regression GREEN.
13. No cutover until all gates GREEN, rollback and DNS plan accepted.

## E2E
Existing backend/test/admin-e2e.test.mjs uses NODE_ENV=test and IIG_E2E_MODE=true. This is a simulated local integration test, not production validation. Run npm ci, npm run check, npm test, npm run e2e in backend and repeat real staging tests with non-production data.

## Deployment status
No staging hostname, SSH/container deployment or live credentials are established by this document. Production activation remains BLOCKED until actual staging validation.