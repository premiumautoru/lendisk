#!/usr/bin/env bash
# Update Lendisk on the VPS to the latest code from GitHub and restart it.
# Usage (as root): lendisk-deploy
set -euo pipefail

APP_DIR=/opt/lendisk
ENV_FILE=/etc/lendisk.env

cd "$APP_DIR"
sudo -u lendisk git fetch --depth 1 origin main
sudo -u lendisk git reset --hard origin/main
# Production uses PostgreSQL; the repo schema targets SQLite for local development.
sudo -u lendisk sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma

set -a; . "$ENV_FILE"; set +a
sudo -u lendisk --preserve-env=DATABASE_URL,AUTH_SECRET,ADMIN_LOGIN,ADMIN_PASSWORD,NEXT_PUBLIC_SITE_URL,STORAGE_DRIVER,UPLOAD_DIR,NEXT_TELEMETRY_DISABLED bash -c '
  npm ci --include=dev --no-audit --no-fund
  npx prisma generate
  npx prisma db push --skip-generate
  npx tsx prisma/seed.ts
  npm run build
'

if [ "${1:-}" != "--no-restart" ]; then
  systemctl restart lendisk
  echo "Lendisk updated and restarted."
fi
