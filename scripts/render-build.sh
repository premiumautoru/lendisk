#!/usr/bin/env bash
# Build script for Render (or any Linux host with PostgreSQL).
set -euo pipefail

# Production uses PostgreSQL; the repo schema targets SQLite for zero-setup local development.
sed -i 's/provider = "sqlite"/provider = "postgresql"/' prisma/schema.prisma

npm ci --include=dev
npx prisma generate
npx prisma db push --skip-generate
# Idempotent: adds missing catalogue items, settings, demo content and the admin account.
npx tsx prisma/seed.ts
npm run build
