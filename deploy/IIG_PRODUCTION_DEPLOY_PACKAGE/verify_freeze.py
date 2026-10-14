#!/usr/bin/env python3
from pathlib import Path
import json,sys,re

root=Path(__file__).resolve().parents[2]
pkg=root/'deploy/IIG_PRODUCTION_DEPLOY_PACKAGE'
errors=[]

def need(p):
    q=root/p
    if not q.exists(): errors.append('missing '+p)
    return q

manifest_path=need('deploy/IIG_PRODUCTION_DEPLOY_PACKAGE/MANIFEST.json')
copylist_path=need('deploy/IIG_PRODUCTION_DEPLOY_PACKAGE/PUBLIC_COPYLIST.txt')
env_path=need('backend/.env.production.example')
compose_path=need('backend/docker-compose.production.yml')
dockerfile_path=need('backend/Dockerfile')
nginx_path=need('backend/nginx.iig-production.conf.template')

if errors:
    print('IIG PRODUCTION PACKAGE FREEZE FAILED')
    [print(' -',e) for e in errors]
    sys.exit(1)

m=json.loads(manifest_path.read_text(encoding='utf-8'))
if m.get('package_name')!='IIG_PRODUCTION_DEPLOY_PACKAGE': errors.append('wrong package_name')
if m.get('package_version')!='2026.10.14-FREEZE-1': errors.append('wrong package_version')
if m.get('status')!='FROZEN_FOR_PREHOSTING': errors.append('package not frozen')
if m.get('public_root')!='/srv/iig/public': errors.append('public root mismatch')

for p in m.get('public_files',[]):
    need(p)
for p in m.get('public_directories',[]):
    q=need(p)
    if q.exists() and not q.is_dir(): errors.append('public directory is not dir '+p)
for p in m.get('backend_runtime_files',[]):
    need(p)

copy_items=[]
for line in copylist_path.read_text(encoding='utf-8').splitlines():
    s=line.strip()
    if s and not s.startswith('#'): copy_items.append(s.rstrip('/'))
for forbidden in ['admin.html','admin-ua.html','admin-ua-v5.html','admin-final-admin1-v1.html','admin-backstage.html','admin']:
    if forbidden in copy_items: errors.append('privileged admin source in PUBLIC_COPYLIST: '+forbidden)

env_text=env_path.read_text(encoding='utf-8')
env_keys=set()
for line in env_text.splitlines():
    s=line.strip()
    if not s or s.startswith('#') or '=' not in s: continue
    env_keys.add(s.split('=',1)[0])
for k in m.get('mandatory_env',[]):
    if k not in env_keys: errors.append('mandatory env missing from template: '+k)
for k in ['IIG_ALLOW_LEGACY_ADMIN_TOKENS','IIG_ALLOW_TRUSTED_PROXY_AUTH']:
    if not re.search(r'^'+re.escape(k)+r'=false$',env_text,re.M): errors.append(k+' must default false')
if not re.search(r'^IIG_COOKIE_SECURE=true$',env_text,re.M): errors.append('IIG_COOKIE_SECURE must be true')

compose=compose_path.read_text(encoding='utf-8')
for v in ['iig-private-var','iig-digest-data','iig-postgres-data']:
    if v not in compose: errors.append('compose volume missing '+v)
for bind in ['127.0.0.1:8787:8787','127.0.0.1:5432:5432']:
    if bind not in compose: errors.append('loopback bind missing '+bind)

dockerfile=dockerfile_path.read_text(encoding='utf-8')
for x in ['COPY backend/package.json','COPY backend/src','COPY admin-ua-v5.html','ENV NODE_ENV=production']:
    if x not in dockerfile: errors.append('Dockerfile freeze input missing '+x)

nginx=nginx_path.read_text(encoding='utf-8')
for x in ['root /srv/iig/public;','location /admin/','location /api/v1/','X-IIG-Admin-Role ""','X-IIG-Proxy-Secret ""']:
    if x not in nginx: errors.append('nginx freeze rule missing '+x)

pkgjson=json.loads((root/'backend/package.json').read_text(encoding='utf-8'))
for name,ver in pkgjson.get('dependencies',{}).items():
    if ver.startswith(('^','~','>','<','*')): errors.append('unfrozen direct dependency '+name+'='+ver)

for secret in ['backend/.env','backend/.env.production']:
    if (root/secret).exists(): errors.append('real environment file must not be committed: '+secret)

if errors:
    print('IIG PRODUCTION PACKAGE FREEZE FAILED')
    for e in errors: print(' -',e)
    sys.exit(1)
print('IIG PRODUCTION PACKAGE FREEZE OK — 2026.10.14-FREEZE-1')
