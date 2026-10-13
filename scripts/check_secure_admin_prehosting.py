#!/usr/bin/env python3
from pathlib import Path
import sys,re

root=Path(__file__).resolve().parents[1]
errors=[]
def read(p):
    f=root/p
    if not f.exists(): errors.append('missing '+p); return ''
    return f.read_text(encoding='utf-8')

auth=read('backend/src/auth.mjs')
session=read('backend/src/session-auth.mjs')
server=read('backend/src/server.mjs')
env=read('backend/.env.example')
nginx=read('backend/nginx.iig-digest.conf')
docker=read('backend/docker-compose.yml')
pkg=read('backend/package.json')
secure=read('assets/admin-secure-session.js')
e2e=read('backend/test/admin-e2e.test.mjs')

required_auth=[
 "IIG_ALLOW_LEGACY_ADMIN_TOKENS",
 "IIG_ALLOW_TRUSTED_PROXY_AUTH",
 "req.iigAdminSession?.role",
 "CSRF_REQUIRED",
 "RBAC_FORBIDDEN",
]
for x in required_auth:
    if x not in auth: errors.append('auth hardening missing '+x)

for x in ['HttpOnly','SameSite=Strict','Secure','IIG_SESSION_TTL_MINUTES','IIG_SESSION_ABSOLUTE_HOURS','verifyTotp','scryptHash']:
    if x not in session: errors.append('session security missing '+x)

for x in [
 '/admin/','/admin/app','/api/v1/auth/login','/api/v1/auth/mfa','/api/v1/auth/session','/api/v1/auth/logout',
 '/api/v1/editorial/drafts/:slug','/api/v1/editorial/:slug/approve','/api/v1/editorial/:slug/publish',
 '/api/v1/digest/approvals','/api/v1/digest/releases','/api/v1/mailing/test','/api/v1/mailing/send',
 '/api/v1/requests','/api/v1/contacts','/api/v1/radar/runs','/api/v1/audit'
]:
    if x not in server: errors.append('server route missing '+x)

for x in ['X-Content-Type-Options','X-Frame-Options','Referrer-Policy','Permissions-Policy','Content-Security-Policy']:
    if x not in server: errors.append('security header missing '+x)

for x in ['IIG_ADMIN1_PASSWORD_HASH=','IIG_ADMIN1_MFA_SECRET=','IIG_ADMIN2_PASSWORD_HASH=','IIG_ADMIN2_MFA_SECRET=','IIG_COOKIE_SECURE=true','IIG_ALLOW_LEGACY_ADMIN_TOKENS=false','IIG_ALLOW_TRUSTED_PROXY_AUTH=false']:
    if x not in env: errors.append('production env contract missing '+x)

for x in ['location /admin/','location /api/v1/','proxy_set_header X-IIG-Admin-Role ""','proxy_set_header X-IIG-Proxy-Secret ""']:
    if x not in nginx: errors.append('nginx hardening missing '+x)

for x in ['iig-private-var:/app/var','iig-digest-data:/app/data/digest','127.0.0.1:8787:8787']:
    if x not in docker: errors.append('docker persistence/bind missing '+x)

for x in ['credentials:same?"same-origin"','X-IIG-CSRF','ADMIN_SESSION_EXPIRED','/api/v1/auth/session','/api/v1/auth/logout']:
    if x not in secure: errors.append('secure browser session bridge missing '+x)

for x in ['"check"','"e2e"','node --test test/admin-e2e.test.mjs']:
    if x not in pkg: errors.append('backend package scripts missing '+x)

for x in ['secure Admin -> NEWS -> approval -> Digest -> test mailing -> RADAR -> contacts','/api/v1/editorial/','/api/v1/digest/approvals','/api/v1/mailing/test','/api/v1/radar/runs','/api/v1/contacts']:
    if x not in e2e: errors.append('E2E coverage missing '+x)

frontend={
 'assets/admin-final-admin1-v1.js':['/api/v1/editorial/','/api/v1/digest/'],
 'assets/admin-mailing.js':['/api/v1/mailing/'],
 'assets/admin-requests.js':['/api/v1/requests'],
 'assets/admin-contacts.js':['/api/v1/contacts'],
 'assets/admin-radar.js':['/api/v1/radar/runs'],
}
for p,tokens in frontend.items():
    s=read(p)
    for x in tokens:
        if x not in s: errors.append(p+' missing production API '+x)

# No real secrets may be present in the example env.
for line in env.splitlines():
    if not line or line.lstrip().startswith('#') or '=' not in line: continue
    k,v=line.split('=',1)
    if k in {'IIG_ADMIN1_PASSWORD_HASH','IIG_ADMIN1_MFA_SECRET','IIG_ADMIN2_PASSWORD_HASH','IIG_ADMIN2_MFA_SECRET','IIG_SMTP_PASS','IIG_GITHUB_ACTIONS_TOKEN','IIG_RADAR_SERVICE_TOKEN','IIG_TRUSTED_PROXY_SECRET'} and v.strip():
        errors.append('secret-like value committed in .env.example: '+k)

if errors:
    print('IIG SECURE ADMIN PREHOST GATE FAILED')
    for e in errors: print(' -',e)
    sys.exit(1)
print('IIG SECURE ADMIN PREHOST GATE OK')
