#!/bin/sh
set -eu
OUT_DIR="${1:-/srv/iig/backups}"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$OUT_DIR"
docker compose -f backend/docker-compose.production.yml exec -T postgres pg_dump -U "${POSTGRES_USER:-iig}" "${POSTGRES_DB:-iig}" | gzip > "$OUT_DIR/iig-postgres-$STAMP.sql.gz"
docker run --rm -v iig_platform_demo_iig-private-var:/src:ro -v "$OUT_DIR":/backup alpine sh -c "cd /src && tar -czf /backup/iig-private-var-$STAMP.tar.gz ."
docker run --rm -v iig_platform_demo_iig-digest-data:/src:ro -v "$OUT_DIR":/backup alpine sh -c "cd /src && tar -czf /backup/iig-digest-data-$STAMP.tar.gz ."
echo "BACKUP_OK $STAMP"
