# STEP 27 — DEMO UI acceptance (2026-10-09)

Status: GREEN — DEMO UI ONLY. Security blocker #2: OPEN / PENDING BACKEND VERIFICATION.

## Evidence
- Owner supplied screenshot of published GitHub Pages `/IIG_PLATFORM_DEMO/admin-backstage.html` displaying final `Демонстраційна панель ADMIN_1` screen after the simulated email/password → MFA (`123456`) → panel flow.
- Demo contains no backend login, no persistent registration, no real TOTP validation, no database session, and no authorization to RADAR/Excel.
- No real credentials should be entered into the demo.

## Next gates (NOT GREEN)
- Deploy protected FastAPI + PostgreSQL staging; enroll ADMIN_1 and ADMIN_2 using private enrollment procedure.
- Run real password/TOTP replay/lockout, CSRF, session expiry and revocation, unauthenticated endpoint denial, ADMIN_2 403 on ADMIN_1-only operations, ADMIN_1 superset ADMIN_2 permissions.
- Run browser and API negative tests and record results on the hosted backend; Actions blocked by billing on existing GitHub Free account.
- Preserve legacy ADMIN_1 access until both real admins pass MFA login and rollback checks; never publish secrets or disable legacy Bearer early.
- Preserve approved public site architecture and footer-only discreet `Admin · preview` entry.

## Release rule
DEMO UI GREEN is not authentication security GREEN. Production authorization remains BLOCKED pending real hosted verification.
