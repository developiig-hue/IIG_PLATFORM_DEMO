#!/bin/sh
set -eu
echo "RESTORE IS DESTRUCTIVE. Run only during maintenance after stopping iig-backend."
echo "Usage: $0 <postgres.sql.gz> <private-var.tar.gz> <digest-data.tar.gz>"
[ "$#" -eq 3 ] || exit 2
PG="$1"; PRIV="$2"; DIG="$3"
docker compose -f backend/docker-compose.production.yml stop iig-backend
gzip -dc "$PG" | docker compose -f backend/docker-compose.production.yml exec -T postgres psql -U "${POSTGRES_USER:-iig}" "${POSTGRES_DB:-iig}"
docker run --rm -v iig_platform_demo_iig-private-var:/dst -v "$(dirname "$PRIV")":/backup alpine sh -c "rm -rf /dst/* && tar -xzf /backup/$(basename "$PRIV") -C /dst"
docker run --rm -v iig_platform_demo_iig-digest-data:/dst -v "$(dirname "$DIG")":/backup alpine sh -c "rm -rf /dst/* && tar -xzf /backup/$(basename "$DIG") -C /dst"
docker compose -f backend/docker-compose.production.yml start iig-backend
echo "RESTORE_OK"
