# IIG PRODUCTION PACKAGE FREEZE — RESULT

**Date:** 2026-10-14  
**Status:** GREEN / FROZEN FOR PRE-HOSTING  
**Package:** `IIG_PRODUCTION_DEPLOY_PACKAGE`  
**Version:** `2026.10.14-FREEZE-1`

## What is frozen

The repository now contains one canonical deployment package definition:

- `deploy/IIG_PRODUCTION_DEPLOY_PACKAGE/MANIFEST.json`
- `deploy/IIG_PRODUCTION_DEPLOY_PACKAGE/README.md`
- `deploy/IIG_PRODUCTION_DEPLOY_PACKAGE/ENV_REQUIRED.md`
- `deploy/IIG_PRODUCTION_DEPLOY_PACKAGE/COMMANDS.md`
- `deploy/IIG_PRODUCTION_DEPLOY_PACKAGE/PUBLIC_COPYLIST.txt`
- `deploy/IIG_PRODUCTION_DEPLOY_PACKAGE/assemble.sh`
- `deploy/IIG_PRODUCTION_DEPLOY_PACKAGE/verify_freeze.py`

The canonical frozen branch is:

`production-freeze-2026-10-14`

## Server copy model

The package assembles into:

`dist/IIG_PRODUCTION_DEPLOY_PACKAGE/`

with:

- `public/` — approved public site only;
- `backend/` — production backend, compose, env template, backup/restore and reverse-proxy templates;
- `admin-ua-v5.html` — backend Docker build input only, never public static root;
- `deploy/IIG_PRODUCTION_DEPLOY_PACKAGE/` — operational manifest and gates.

## Frozen public security boundary

Production public static root is:

`/srv/iig/public`

The following are explicitly excluded from public static deployment:

- `admin.html`
- `admin-ua.html`
- `admin-ua-v5.html`
- `admin-final-admin1-v1.html`
- `admin-backstage.html`
- `admin/`

Production Admin remains backend-owned via `/admin/` and secure session/RBAC.

## Frozen volumes

- `iig-private-var:/app/var`
- `iig-digest-data:/app/data/digest`
- `iig-postgres-data:/var/lib/postgresql/data`

## Frozen environment contract

All mandatory production variables are listed in:

`deploy/IIG_PRODUCTION_DEPLOY_PACKAGE/ENV_REQUIRED.md`

The actual server secret file is created only on paid hosting from:

`backend/.env.production.example`

Real secrets are not part of the repository/package artifact.

## Frozen commands

Build/start/health/backup commands are locked in:

`deploy/IIG_PRODUCTION_DEPLOY_PACKAGE/COMMANDS.md`

## Automated verification

GitHub Actions workflow:

`IIG Production Package Freeze`

Run:

https://github.com/developiig-hue/IIG_PLATFORM_DEMO/actions/runs/38543204015

Result: **SUCCESS**

Passed:
1. manifest verification;
2. deterministic package assembly;
3. public/Admin security-boundary assertion;
4. production Compose validation;
5. frozen backend Docker image build;
6. package SHA256 generation;
7. upload of the canonical package artifact.

## HARD RULE

This freeze does not change the current public-site architecture and does not activate the future public IIG MARKET page. That remains a next-stage development after paid-hosting migration.

## Next step

Step 1 is complete. The next preparation phase is **Step 2 — Full Pre-Hosting Acceptance**, where the entire frozen package is tested as one release candidate before any hosting credentials are received.
