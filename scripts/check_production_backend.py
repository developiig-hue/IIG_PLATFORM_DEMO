#!/usr/bin/env python3
from pathlib import Path
import sys

root=Path(__file__).resolve().parents[1]
required=[
 "backend/docker-compose.production.yml",
 "backend/.env.production.example",
 "backend/nginx.iig-production.conf.template",
 "backend/backup-production.sh",
 "backend/restore-production.sh",
 "backend/src/server.mjs"
]
errors=[]
for f in required:
    if not (root/f).exists(): errors.append("missing "+f)

compose=(root/"backend/docker-compose.production.yml").read_text(encoding="utf-8")
env=(root/"backend/.env.production.example").read_text(encoding="utf-8")
nginx=(root/"backend/nginx.iig-production.conf.template").read_text(encoding="utf-8")
server=(root/"backend/src/server.mjs").read_text(encoding="utf-8")

for x in [
 "iig-private-var:/app/var",
 "iig-digest-data:/app/data/digest",
 "iig-postgres-data:/var/lib/postgresql/data",
 "127.0.0.1:8787:8787",
 "read_only: true",
 "no-new-privileges:true"
]:
    if x not in compose: errors.append("compose missing "+x)

for x in [
 "PUBLIC_BASE_URL=https://",
 "IIG_SMTP_HOST=",
 "IIG_UNSUBSCRIBE_SECRET=",
 "IIG_RADAR_SEARCH_ENDPOINT=",
 "IIG_RADAR_SEARCH_TOKEN=",
 "IIG_ADMIN1_PASSWORD_HASH=",
 "IIG_ADMIN1_MFA_SECRET=",
 "IIG_ADMIN2_PASSWORD_HASH=",
 "IIG_ADMIN2_MFA_SECRET=",
 "IIG_REQUESTS_DIR=/app/var/requests",
 "IIG_EDITORIAL_DRAFT_DIR=/app/var/editorial-drafts",
 "IIG_MAILING_DIR=/app/var/mailing",
 "IIG_DIGEST_LOCAL_DIR=/app/data/digest"
]:
    if x not in env: errors.append("env template missing "+x)

for x in [
 "listen 443 ssl",
 "location /admin/",
 "location /api/v1/",
 "location = /digest/current.pdf",
 "location = /unsubscribe",
 "proxy_pass http://127.0.0.1:8787"
]:
    if x not in nginx: errors.append("nginx template missing "+x)

for x in [
 'app.get("/readyz"',
 'app.get("/api/v1/radar/status"',
 'app.post("/api/v1/radar/runs"',
 'app.get("/api/v1/radar/runs/:id"',
 'app.delete("/api/v1/radar/runs/:id"',
 "RADAR_MIN_SOURCES_1000_REQUIRED",
 "RADAR_SCAN_UNDER_1000_SOURCES",
 "RADAR_ACTIVE_BY_ACTOR",
 'mode:"EPHEMERAL"',
 "persisted:false"
]:
    if x not in server: errors.append("server missing "+x)

if errors:
    print("IIG PRODUCTION BACKEND GATE FAILED")
    for e in errors: print(" -",e)
    sys.exit(1)
print("IIG PRODUCTION BACKEND GATE OK")
