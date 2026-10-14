# IIG_PRODUCTION_DEPLOY_PACKAGE

**Version:** 2026.10.14-FREEZE-1  
**Status:** FROZEN FOR PRE-HOSTING  
**Purpose:** one canonical package definition for moving IIG from GitHub/demo runtime to paid-hosting staging without redesigning the site.

## Package principle

This folder is the single deployment manifest. It does **not** activate hosting. It freezes what must be copied, mounted, configured and started once hosting data is received.

The package is assembled by:

`bash deploy/IIG_PRODUCTION_DEPLOY_PACKAGE/assemble.sh`

Output:

`dist/IIG_PRODUCTION_DEPLOY_PACKAGE/`

The output preserves exactly three layers:

1. `public/` — only the approved public IIG site;
2. `backend/` + `admin-ua-v5.html` — secure backend/Admin build context;
3. `ops/` — manifest, environment checklist, commands and freeze verification.

## Security boundary

The following Admin source pages are **never copied into the public static root**:
- admin.html
- admin-ua.html
- admin-ua-v5.html
- admin-final-admin1-v1.html
- admin-backstage.html
- admin/

Production Admin is served only by backend route `/admin/` after Password → MFA → secure session → RBAC.

`admin-ua-v5.html` is present only at the package root as a Docker build input and is copied into the backend image by `backend/Dockerfile`.

## Frozen runtime

- Public static root: `/srv/iig/public`
- Backend bind: `127.0.0.1:8787`
- PostgreSQL bind: `127.0.0.1:5432`
- Reverse proxy: template `backend/nginx.iig-production.conf.template`
- Production compose: `backend/docker-compose.production.yml`
- Environment template: `backend/.env.production.example`

## Persistent volumes

- `iig-private-var:/app/var`
- `iig-digest-data:/app/data/digest`
- `iig-postgres-data:/var/lib/postgresql/data`

These names are frozen for the first paid-hosting deployment. Changing them requires an explicit migration.

## First hosting action

After hosting access is received:

1. place the assembled package at `/srv/iig`;
2. copy `backend/.env.production.example` to `backend/.env.production`;
3. replace every host-specific `CHANGE_ME` value with server-side values;
4. run the commands in `COMMANDS.md`;
5. do **not** change DNS until the separate Final Migration Gate is GREEN.

## HARD RULE

This Production Package Freeze changes no public site architecture. The future public IIG MARKET page remains a next-stage paid-hosting development concept and is not enabled by this package.
