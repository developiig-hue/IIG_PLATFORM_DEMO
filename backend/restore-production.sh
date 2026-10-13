#!/bin/sh
set -eu
COMPOSE="docker compose -f backend/docker-compose.production.yml --env-file backend/.env.production"
echo "RESTORE IS DESTRUCTIVE. Run only during maintenance."
echo "Usage: $0 <postgres.sql.gz> <private-var.tar.gz> <digest-data.tar.gz>"
[ "$#" -eq 3 ] || exit 2
PG="$1"; PRIV="$2"; DIG="$3"
[ -f "$PG" ] && [ -f "$PRIV" ] && [ -f "$DIG" ] || { echo "RESTORE_INPUT_MISSING"; exit 3; }

$COMPOSE stop iig-backend

gzip -dc "$PG" | $COMPOSE exec -T postgres psql -U "${POSTGRES_USER:-iig}" "${POSTGRES_DB:-iig}"

PRIV_DIR="$(cd "$(dirname "$PRIV")" && pwd)"
DIG_DIR="$(cd "$(dirname "$DIG")" && pwd)"
PRIV_NAME="$(basename "$PRIV")"
DIG_NAME="$(basename "$DIG")"

$COMPOSE run --rm --no-deps -v "$PRIV_DIR:/backup:ro" --entrypoint sh iig-backend -c "rm -rf /app/var/* && tar -xzf /backup/$PRIV_NAME -C /app/var"
$COMPOSE run --rm --no-deps -v "$DIG_DIR:/backup:ro" --entrypoint sh iig-backend -c "rm -rf /app/data/digest/* && tar -xzf /backup/$DIG_NAME -C /app/data/digest"

$COMPOSE start iig-backend
echo "RESTORE_OK"
