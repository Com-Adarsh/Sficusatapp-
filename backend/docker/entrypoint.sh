#!/bin/sh
set -eu

echo "Running database migrations..."
node dist/migrate.js

if [ -n "${SEED_ADMIN_EMAIL:-}" ] && [ -n "${SEED_ADMIN_PASSWORD:-}" ]; then
  echo "Seeding configured administrator..."
  node dist/seed.js
fi

echo "Starting SFI CUSAT backend..."
exec node dist/server.js
