#!/usr/bin/env bash
set -u
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
OUT="$ROOT/prehosting-final-evidence"
LOG="$OUT/PREHOST_FINAL_GATE.log"
STATUS="$OUT/PREHOST_STATUS.txt"
FAILS="$OUT/FAILED_GATES.txt"
rm -rf "$OUT"
mkdir -p "$OUT"
: > "$LOG"
: > "$FAILS"
failed=0

run_gate(){
  local name="$1"; shift
  { echo "===== $name ====="; "$@"; } >>"$LOG" 2>&1
  local rc=$?
  if [ "$rc" -ne 0 ]; then
    echo "$name" >>"$FAILS"
    failed=1
  fi
  return 0
}

run_gate "A01_PACKAGE_FREEZE" python3 deploy/IIG_PRODUCTION_DEPLOY_PACKAGE/verify_freeze.py
run_gate "A02_ADMIN_MASTER" python3 scripts/check_step26_admin.py
run_gate "A03_SITE_DESIGN_LOCK" python3 scripts/check_site_design_lock.py
run_gate "A04_MARKET_ADMIN" python3 scripts/check_market_admin.py
run_gate "A05_MARKET_PORTABILITY" python3 scripts/check_market_production_portability.py
run_gate "A06_PAID_HOST_MIGRATION_CONTRACT" python3 scripts/check_paid_hosting_migration_contract.py
run_gate "A07_PUBLIC_SEARCH" python3 scripts/check_site_search.py
run_gate "A08_SECURE_ADMIN_STATIC" python3 scripts/check_secure_admin_prehosting.py

run_gate "B01_ROBOTS_TEST_SUITE" python3 -m unittest discover -s tests -p "test_*.py"

run_gate "C01_JS_SYNTAX" bash -c 'set -e; while IFS= read -r -d "" f; do node --check "$f" >/dev/null; done < <(find assets -maxdepth 1 -type f -name "*.js" -print0)'

run_gate "D01_BACKEND_INSTALL" bash -c 'cd backend && npm install --ignore-scripts --no-audit --no-fund'
run_gate "D02_BACKEND_CHECK" bash -c 'cd backend && npm run check'
run_gate "D03_BACKEND_TESTS" bash -c 'cd backend && npm test'
run_gate "D04_ADMIN_E2E" bash -c 'cd backend && npm run e2e'

run_gate "E01_ASSEMBLE_PACKAGE" bash deploy/IIG_PRODUCTION_DEPLOY_PACKAGE/assemble.sh

run_gate "F01_PUBLIC_ADMIN_BOUNDARY" bash -c 'set -e; P=dist/IIG_PRODUCTION_DEPLOY_PACKAGE; test -s "$P/public/index.html"; test -s "$P/backend/docker-compose.production.yml"; test -s "$P/admin-ua-v5.html"; test ! -e "$P/public/admin.html"; test ! -e "$P/public/admin-ua-v5.html"; test ! -d "$P/public/admin"; test ! -e "$P/backend/.env.production"'
run_gate "F02_PUBLIC_SECRET_SCAN" bash -c 'set -e; P=dist/IIG_PRODUCTION_DEPLOY_PACKAGE/public; if grep -RqiE "(postgresql://|BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY|IIG_ADMIN[12]_PASSWORD_HASH=|IIG_SMTP_PASS=|IIG_GITHUB_ACTIONS_TOKEN=|IIG_RADAR_SEARCH_TOKEN=)" "$P"; then exit 1; fi'

run_gate "G01_INTERNAL_LINKS" python3 scripts/check_prehosting_package_links.py

PKG="$ROOT/dist/IIG_PRODUCTION_DEPLOY_PACKAGE"
ENVFILE="$PKG/backend/.env.production"
cp "$PKG/backend/.env.production.example" "$ENVFILE"
python3 - "$ENVFILE" <<'PY'
from pathlib import Path
import sys
p=Path(sys.argv[1]); s=p.read_text()
s=s.replace('CHANGE_ME_64_PLUS_RANDOM_CHARS','PREHOST_ONLY_'+'X'*64)
p.write_text(s)
PY

run_gate "H01_COMPOSE_CONFIG" docker compose -f "$PKG/backend/docker-compose.production.yml" --env-file "$ENVFILE" config
run_gate "H02_DOCKER_BUILD" docker compose -f "$PKG/backend/docker-compose.production.yml" --env-file "$ENVFILE" build --pull
run_gate "H03_DOCKER_UP" docker compose -f "$PKG/backend/docker-compose.production.yml" --env-file "$ENVFILE" up -d
run_gate "H04_HEALTHZ" curl -fsS --retry 10 --retry-delay 2 http://127.0.0.1:8787/healthz
run_gate "H05_READYZ" curl -fsS --retry 5 --retry-delay 2 http://127.0.0.1:8787/readyz
run_gate "H06_ADMIN_LOGIN_SURFACE" bash -c 'set -e; h=$(mktemp); b=$(mktemp); curl -fsS -D "$h" -o "$b" http://127.0.0.1:8787/admin/; grep -q "Захищена адмін-панель" "$b"; grep -qi "^X-Frame-Options: DENY" "$h"; grep -qi "^Cache-Control: no-store" "$h"; rm -f "$h" "$b"'
run_gate "H07_UNAUTH_PRIVILEGED_BLOCK" bash -c 'code=$(curl -s -o /tmp/iig-unauth.json -w "%{http_code}" http://127.0.0.1:8787/api/v1/contacts); test "$code" = "401"'

BACK="$PKG/.prehost-backups"
mkdir -p "$BACK"
run_gate "I01_BACKUP_DRY_RUN" bash -c 'cd "'"$PKG"'" && chmod +x backend/backup-production.sh backend/restore-production.sh && backend/backup-production.sh "'"$BACK"'"'
run_gate "I02_BACKUP_CHECKSUMS" bash -c 'set -e; f=$(ls -1 "'"$BACK"'"/iig-backup-*.sha256 | tail -1); sha256sum -c "$f"'
run_gate "I03_RESTORE_DRY_RUN" bash -c 'set -e; cd "'"$PKG"'"; pg=$(ls -1 "'"$BACK"'"/iig-postgres-*.sql.gz | tail -1); pr=$(ls -1 "'"$BACK"'"/iig-private-var-*.tar.gz | tail -1); dg=$(ls -1 "'"$BACK"'"/iig-digest-data-*.tar.gz | tail -1); backend/restore-production.sh "$pg" "$pr" "$dg"'
run_gate "I04_POST_RESTORE_HEALTH" curl -fsS --retry 10 --retry-delay 2 http://127.0.0.1:8787/healthz

run_gate "J01_PACKAGE_SHA256" bash -c 'cd "'"$PKG"'" && find . -type f ! -path "./.prehost-backups/*" ! -name ".env.production" -print0 | sort -z | xargs -0 sha256sum > PACKAGE_SHA256SUMS.txt && test -s PACKAGE_SHA256SUMS.txt'

{ docker compose -f "$PKG/backend/docker-compose.production.yml" --env-file "$ENVFILE" down >/dev/null 2>&1 || true; rm -f "$ENVFILE"; } >>"$LOG" 2>&1

if [ "$failed" -eq 0 ]; then
  printf "%s\n" "READY FOR HOSTING" > "$STATUS"
  printf "%s\n" "READY FOR HOSTING"
  exit 0
else
  printf "%s\n" "BLOCKED" > "$STATUS"
  printf "%s\n" "BLOCKED"
  exit 1
fi
