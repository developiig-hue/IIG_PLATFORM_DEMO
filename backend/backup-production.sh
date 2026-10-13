#!/bin/sh
set -eu
COMPOSE="docker compose -f backend/docker-compose.production.yml --env-file backend/.env.production"
OUT_DIR="${1:-/srv/iig/backups}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$OUT_DIR"

$COMPOSE exec -T postgres pg_dump -U "${POSTGRES_USER:-iig}" "${POSTGRES_DB:-iig}" | gzip > "$OUT_DIR/iig-postgres-$STAMP.sql.gz"

$COMPOSE run --rm --no-deps -v "$OUT_DIR:/backup" --entrypoint sh iig-backend -c "tar -czf /backup/iig-private-var-$STAMP.tar.gz -C /app/var ."
$COMPOSE run --rm --no-deps -v "$OUT_DIR:/backup" --entrypoint sh iig-backend -c "tar -czf /backup/iig-digest-data-$STAMP.tar.gz -C /app/data/digest ."

sha256sum "$OUT_DIR/iig-postgres-$STAMP.sql.gz" "$OUT_DIR/iig-private-var-$STAMP.tar.gz" "$OUT_DIR/iig-digest-data-$STAMP.tar.gz" > "$OUT_DIR/iig-backup-$STAMP.sha256"
echo "BACKUP_OK $STAMP $OUT_DIR"
