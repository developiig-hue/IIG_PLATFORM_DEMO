# IIG_PRODUCTION_DEPLOY_PACKAGE — COMMANDS

Run from the package root on the paid-hosting staging server.

## 0. Preconditions

- Docker Engine + Docker Compose plugin installed.
- Nginx or hosting-panel reverse proxy available.
- Package extracted to `/srv/iig`.
- DNS is **not switched yet**.

## 1. Prepare production environment

```bash
cd /srv/iig
cp backend/.env.production.example backend/.env.production
chmod 600 backend/.env.production
# Fill every required host-specific value in backend/.env.production.
```

Do not store `backend/.env.production` in Git.

## 2. Verify frozen package

```bash
python3 deploy/IIG_PRODUCTION_DEPLOY_PACKAGE/verify_freeze.py
docker compose -f backend/docker-compose.production.yml --env-file backend/.env.production config
```

## 3. Build and start

```bash
docker compose -f backend/docker-compose.production.yml --env-file backend/.env.production build --pull
docker compose -f backend/docker-compose.production.yml --env-file backend/.env.production up -d
docker compose -f backend/docker-compose.production.yml --env-file backend/.env.production ps
```

## 4. Local backend health

```bash
curl -fsS http://127.0.0.1:8787/healthz
```

After TLS/reverse proxy is configured:

```bash
curl -fsS https://<staging-domain>/readyz
```

`/readyz` must be GREEN before live E2E.

## 5. Reverse proxy

Copy/adapt:

```text
backend/nginx.iig-production.conf.template
```

Static public root must remain:

```text
/srv/iig/public
```

Admin/API must proxy to:

```text
127.0.0.1:8787
```

## 6. Backup

```bash
chmod +x backend/backup-production.sh backend/restore-production.sh
backend/backup-production.sh /srv/iig/backups
```

Restore is destructive and is tested only during the next Final Pre-Hosting / staging gate.

## 7. Stop / rollback runtime

```bash
docker compose -f backend/docker-compose.production.yml --env-file backend/.env.production down
```

Do not remove Docker volumes during normal rollback.

## 8. DNS rule

No DNS/cutover command belongs to this frozen package. DNS switching is a separate final step and is forbidden until the Migration Gate is GREEN.
