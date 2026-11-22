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

if [[ -f tests/supabase/postgres_shim.sql ]]; then
  psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -f tests/supabase/postgres_shim.sql
fi

echo "=== APPLY BASELINE ==="
psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -f supabase/baseline/00000000000000_prod_schema_baseline.sql

if [[ -n "${CATALOG_OUT:-}" ]]; then
  echo "=== CAPTURE FRESH BASELINE CATALOG ==="
  psql -v ON_ERROR_STOP=1 -At -d "$DB_NAME" -f scripts/catalog.sql > "$CATALOG_OUT"
  if ! diff -u docs/prod-catalog.json "$CATALOG_OUT"; then
    echo "ERROR: fresh baseline catalog differs from docs/prod-catalog.json" >&2
    exit 1
  fi
  echo "=== BASELINE CATALOG FIDELITY GREEN ==="
fi

recorded_versions=(
  20261121160535_phase1_foundation
  20261121160657_phase1_foundation_actual
  20261121161121_phase2_security_performance
  20261121161135_phase2_advisor_cleanup
  20261121161244_phase2_donor_consent_fix
  20261122110000_phase2_auth_trigger_failsafe
)
for file in $(find supabase/migrations -maxdepth 1 -type f -name '*.sql' | sort); do
  base="$(basename "$file" .sql)"
  skip=false
  for recorded in "${recorded_versions[@]}"; do
    [[ "$base" == "$recorded" ]] && skip=true
  done
  if [[ "$skip" == true ]]; then
    echo "=== SKIP recorded/baselined $file ==="
    continue
  fi
  echo "=== APPLY unapplied $file ==="
  psql -v ON_ERROR_STOP=1 -d "$DB_NAME" -f "$file"
done

echo "=== FRESH DATABASE GREEN ==="
