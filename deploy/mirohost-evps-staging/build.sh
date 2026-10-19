#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/dist/IIG_MIROHOST_EVPS_STAGING"
PUBLIC="$OUT/public"
BACKEND="$OUT/backend"
rm -rf "$OUT"
mkdir -p "$PUBLIC" "$BACKEND"

copy_file(){ local src="$1"; [ -f "$ROOT/$src" ] || { echo "MISSING $src"; exit 2; }; cp -a "$ROOT/$src" "$PUBLIC/"; }
copy_dir(){ local src="$1"; [ -d "$ROOT/$src" ] || { echo "MISSING $src"; exit 3; }; cp -a "$ROOT/$src" "$PUBLIC/"; }

while IFS= read -r item; do
  [ -n "$item" ] || continue
  case "$item" in \#*) continue;; esac
  case "$item" in */) copy_dir "${item%/}" ;; *) copy_file "$item" ;; esac
done < "$ROOT/deploy/IIG_PRODUCTION_DEPLOY_PACKAGE/PUBLIC_COPYLIST.txt"

cp -a "$ROOT/backend/." "$BACKEND/"
rm -rf "$BACKEND/node_modules" "$BACKEND/var" "$BACKEND/data"
rm -f "$BACKEND/.env" "$BACKEND/.env.production"
cp -a "$ROOT/admin-ua-v5.html" "$OUT/admin-ua-v5.html"
cp -a "$ROOT/deploy/mirohost-evps-staging/README.md" "$OUT/README.md"

for f in admin.html admin-ua.html admin-ua-v5.html admin-final-admin1-v1.html admin-backstage.html; do
  [ ! -e "$PUBLIC/$f" ] || { echo "BLOCKED_PUBLIC_ADMIN_SOURCE $f"; exit 4; }
done
[ ! -d "$PUBLIC/admin" ] || { echo "BLOCKED_PUBLIC_ADMIN_DIR"; exit 5; }

python "$ROOT/scripts/check_prehosting_package_links.py" "$PUBLIC"
echo "MIROHOST_EVPS_STAGING_PACKAGE_READY $OUT"
