#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
PKG="$ROOT/dist/IIG_PRODUCTION_DEPLOY_PACKAGE"
OPS="$PKG/deploy/IIG_PRODUCTION_DEPLOY_PACKAGE"

rm -rf "$PKG"
mkdir -p "$PKG/public" "$OPS"

copy_file(){
  local src="$1"
  [ -f "$ROOT/$src" ] || { echo "MISSING_PUBLIC_FILE $src"; exit 2; }
  cp -a "$ROOT/$src" "$PKG/public/"
}

copy_dir(){
  local src="$1"
  [ -d "$ROOT/$src" ] || { echo "MISSING_PUBLIC_DIR $src"; exit 3; }
  cp -a "$ROOT/$src" "$PKG/public/"
}

while IFS= read -r item; do
  [ -n "$item" ] || continue
  case "$item" in \#*) continue;; esac
  case "$item" in
    */) copy_dir "${item%/}" ;;
    *) copy_file "$item" ;;
  esac
done < "$ROOT/deploy/IIG_PRODUCTION_DEPLOY_PACKAGE/PUBLIC_COPYLIST.txt"

# Backend source/build context.
cp -a "$ROOT/backend" "$PKG/backend"
rm -f "$PKG/backend/.env" "$PKG/backend/.env.production"
cp -a "$ROOT/admin-ua-v5.html" "$PKG/admin-ua-v5.html"
cp -a "$ROOT/.dockerignore" "$PKG/.dockerignore"

# Package operations metadata.
cp -a "$ROOT/deploy/IIG_PRODUCTION_DEPLOY_PACKAGE/." "$OPS/"

# Explicit security assertions: demo/admin source pages must not be public.
for f in admin.html admin-ua.html admin-ua-v5.html admin-final-admin1-v1.html admin-backstage.html; do
  if [ -e "$PKG/public/$f" ]; then
    echo "SECURITY_FAIL_PUBLIC_ADMIN_SOURCE $f"
    exit 4
  fi
done
[ ! -d "$PKG/public/admin" ] || { echo "SECURITY_FAIL_PUBLIC_ADMIN_DIR"; exit 5; }
[ ! -f "$PKG/backend/.env.production" ] || { echo "SECURITY_FAIL_REAL_ENV_PACKAGED"; exit 6; }

# No runtime data in frozen output.
rm -rf "$PKG/backend/var" "$PKG/backend/data"

printf "%s\n" "IIG_PRODUCTION_DEPLOY_PACKAGE 2026.10.14-FREEZE-1" > "$PKG/FREEZE_VERSION"
printf "%s\n" "PACKAGE_ASSEMBLY_OK $PKG"
