#!/bin/sh
set -e

# Export default database URL if not set
export DATABASE_URL="${DATABASE_URL:-file:/app/data/prod.db}"

echo "[FMKAL] Initializing database at ${DATABASE_URL}..."

# Apply Prisma schema to database
npx prisma db push --skip-generate --config prisma.config.ts || npx prisma db push --skip-generate --config prisma7.config.ts || npx prisma db push --skip-generate || true

# Seed default admin and settings if not already seeded
npx tsx prisma/seed.ts || true

echo "[FMKAL] Application ready. Starting server on port ${PORT:-1234}..."
exec "$@"
