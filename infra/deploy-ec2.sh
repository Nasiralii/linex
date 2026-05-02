#!/usr/bin/env bash
# Run ON the EC2 host (not on your Mac):  bash infra/deploy-ec2.sh
# Assumes: app at ~/linex, PM2 app name "linex", 2GB+ swap recommended for next build.
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=3072}"
export NEXT_DISABLE_TURBOPACK="${NEXT_DISABLE_TURBOPACK:-1}"

echo "==> ${ROOT} — pull"
git fetch origin main
git reset --hard origin/main

echo "==> stop pm2"
pm2 stop linex 2>/dev/null || true

echo "==> clean + install"
rm -rf node_modules .next
npm install

echo "==> build (webpack; disable turbopack on small instances)"
npm run build

echo "==> start"
pm2 restart linex --update-env || pm2 start npm --name linex -- start
pm2 save

echo "==> health"
sleep 2
curl -sS "http://127.0.0.1:3000/api/health" | head -c 500 || true
echo ""
echo "Done."
