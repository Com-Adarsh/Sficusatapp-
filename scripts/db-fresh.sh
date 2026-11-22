#!/usr/bin/env bash
set -euo pipefail

DB_NAME="${1:-sficusatapp_fresh}"
DB_USER="${PGUSER:-postgres}"
DB_HOST="${PGHOST:-127.0.0.1}"
DB_PORT="${PGPORT:-5432}"

export PGHOST="$DB_HOST" PGPORT="$DB_PORT" PGUSER="$DB_USER"

if ! command -v psql >/dev/null 2>&1; then
  echo "ERROR: psql is required" >&2
  exit 1
fi

psql -v ON_ERROR_STOP=1 -d postgres -c "drop database if exists \"$DB_NAME\";"
psql -v ON_ERROR_STOP=1 -d postgres -c "create database \"$DB_NAME\";"

# The runner/CI shim supplies Supabase-managed auth/storage primitives before
# this baseline. Local Supabase development supplies those primitives itself.
if [[ -f tests/supabase/postgres_shim.sql ]]; then
  psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -f tests/supabase/postgres_shim.sql
fi

echo "=== APPLY BASELINE ==="
psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -f supabase/baseline/00000000000000_prod_schema_baseline.sql

echo "=== APPLY UNAPPLIED MIGRATIONS ==="
for file in $(find supabase/migrations -maxdepth 1 -type f -name '*.sql' | sort); do
  echo "=== APPLY $file ==="
  psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -f "$file"
done

echo "=== FRESH DATABASE GREEN ==="
