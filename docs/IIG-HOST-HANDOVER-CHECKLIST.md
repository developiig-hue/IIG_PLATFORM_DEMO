# IIG HOST HANDOVER CHECKLIST

**Status:** READY FOR HOSTING  
**Purpose:** one-page data request for paid-hosting handover.  
**Rule:** after these items are received, no architecture redesign is required; deployment follows the frozen `IIG_PRODUCTION_DEPLOY_PACKAGE` instructions.

## 1. Domain / staging
Provide:
- production domain;
- staging URL/subdomain;
- confirmation whether HTTPS/TLS is managed by hosting panel or by server/Certbot;
- confirmation that ports 80/443 are available.

## 2. Server access
Provide one of:
- SSH access: host/IP, port, username, authentication method (SSH key preferred);
- or hosting panel access with permission to upload files, configure Docker/containers, reverse proxy, environment variables/secrets and persistent volumes.

Also confirm:
- Linux distribution/version;
- Docker Engine + Docker Compose availability, or permission to install/use them;
- writable deployment path (target default: `/srv/iig`).

## 3. Database / storage
### PostgreSQL
If managed PostgreSQL is supplied, provide:
- host;
- port;
- database name;
- username;
- SSL requirement;
- connection string format / CA certificate if required.

If managed PostgreSQL is not supplied, confirm local Docker PostgreSQL is allowed.

### S3/object storage
If managed S3-compatible storage is supplied, provide:
- bucket name;
- region;
- endpoint;
- access key ID;
- secret access key;
- path-style requirement if applicable.

If no S3 is supplied, confirm persistent Docker/local volume storage is allowed for the first deployment.

## 4. SMTP
Provide:
- SMTP host;
- SMTP port;
- TLS/SSL mode;
- SMTP username;
- SMTP password or app password;
- approved sender address;
- authorized test recipient address for staging test mailing.

## 5. DNS
Provide:
- DNS provider/panel access, or responsible administrator contact;
- current A/AAAA/CNAME records;
- ability to create/update staging records;
- ability to change production A/AAAA/CNAME during final cutover;
- current TTL or permission to reduce TTL before cutover.

**Important:** no production DNS change is made until staging Migration Gate is GREEN.

## 6. Optional managed services / security
If available, provide:
- managed backup/snapshot policy;
- firewall/security-group controls;
- IP allowlist requirements;
- managed TLS/certificate service;
- secret manager;
- monitoring/logging service.

## Handover package already prepared
The following are already frozen in the repository:
- `IIG_PRODUCTION_DEPLOY_PACKAGE 2026.10.14-FREEZE-1`;
- `backend/docker-compose.production.yml`;
- `backend/.env.production.example`;
- `backend/nginx.iig-production.conf.template`;
- backup/restore scripts;
- secure Admin / MFA / RBAC;
- Full Pre-Hosting Final Gate = **READY FOR HOSTING**.

## After receipt of hosting data
Deployment sequence is fixed:
1. place package on staging and fill server-side `.env.production`;
2. start Docker stack + reverse proxy/TLS and run live Migration Gate;
3. only after full GREEN, perform production DNS cutover and keep GitHub as backup/CI.

**No public-site architecture change is part of this handover. Future public IIG MARKET remains a post-migration development step.**
