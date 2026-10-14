# IIG_PRODUCTION_DEPLOY_PACKAGE — ENV REQUIRED

No real values belong in GitHub. Fill `backend/.env.production` only on the paid-hosting server or approved secret manager.

## Mandatory core
NODE_ENV=production
PORT=8787
HOST=0.0.0.0
PUBLIC_BASE_URL=https://<production-domain>
IIG_ALLOWED_ORIGINS=https://<production-domain>,https://www.<production-domain>
IIG_COOKIE_SECURE=true

## Mandatory persistent paths
IIG_AUTH_DIR=/app/var/auth
IIG_AUDIT_DIR=/app/var/audit
IIG_REQUESTS_DIR=/app/var/requests
IIG_EDITORIAL_DRAFT_DIR=/app/var/editorial-drafts
IIG_MAILING_DIR=/app/var/mailing
IIG_DIGEST_LOCAL_DIR=/app/data/digest
IIG_DIGEST_STORAGE=local

## Mandatory PostgreSQL foundation
POSTGRES_DB=iig
POSTGRES_USER=iig
POSTGRES_PASSWORD=<long-random-secret>
IIG_DATABASE_URL=postgresql://iig:<password>@postgres:5432/iig

## Mandatory secure Admin
IIG_ADMIN1_USERNAME=<server-side>
IIG_ADMIN2_USERNAME=<server-side>
IIG_ADMIN1_PASSWORD_HASH=<scrypt-hash>
IIG_ADMIN2_PASSWORD_HASH=<scrypt-hash>
IIG_ADMIN1_MFA_SECRET=<base32-secret>
IIG_ADMIN2_MFA_SECRET=<base32-secret>
IIG_ADMIN1_DISPLAY_NAME=ADMIN_1
IIG_ADMIN2_DISPLAY_NAME=ADMIN_2
IIG_AUTH_IP_SALT=<long-random-secret>
IIG_SESSION_TTL_MINUTES=30
IIG_SESSION_ABSOLUTE_HOURS=12
IIG_ALLOW_LEGACY_ADMIN_TOKENS=false
IIG_ALLOW_TRUSTED_PROXY_AUTH=false

## Mandatory requests / privacy
IIG_REQUESTS_IP_SALT=<long-random-secret>

## Mandatory editorial dispatch
IIG_GITHUB_REPO=developiig-hue/IIG_PLATFORM_DEMO
IIG_GITHUB_EDITORIAL_WORKFLOW=editorial-refresh.yml
IIG_GITHUB_BRANCH=main
IIG_GITHUB_ACTIONS_TOKEN=<server-side-token>

## Mandatory SMTP
IIG_SMTP_HOST=<smtp-host>
IIG_SMTP_PORT=587
IIG_SMTP_SECURE=false
IIG_SMTP_USER=<smtp-user>
IIG_SMTP_PASS=<smtp-password>
IIG_MAIL_FROM="IIG Monthly Digest <digest@iig.energy>"
IIG_UNSUBSCRIBE_SECRET=<64-plus-random-chars>

## Mandatory production RADAR
IIG_RADAR_SEARCH_ENDPOINT=https://<stable-private-radar-provider>
IIG_RADAR_SEARCH_TOKEN=<server-side-token>
IIG_RADAR_HTTP_TIMEOUT_MS=120000

## Optional
IIG_MAIL_TEST_TO=
IIG_TRUSTED_PROXY_SECRET=

# Optional S3-compatible Digest storage; required only when IIG_DIGEST_STORAGE=s3
IIG_S3_BUCKET=
IIG_S3_REGION=auto
IIG_S3_ENDPOINT=
IIG_S3_ACCESS_KEY_ID=
IIG_S3_SECRET_ACCESS_KEY=
IIG_S3_FORCE_PATH_STYLE=false
