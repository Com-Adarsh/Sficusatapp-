#!/usr/bin/env bash
set -euo pipefail

if [[ "${NODE_ENV:-development}" == "production" ]]; then
  echo "Refusing to run the Convex backup helper with NODE_ENV=production." >&2
  exit 1
fi

if [[ -z "${CONVEX_DEPLOY_KEY:-}" ]]; then
  echo "CONVEX_DEPLOY_KEY must be supplied through the environment; it is never stored in this repository." >&2
  exit 1
fi

OUT="${1:-./backups/convex-$(date -u +%Y%m%dT%H%M%SZ).zip}"
mkdir -p "$(dirname "$OUT")"

# Read-only export: Convex export creates a backup ZIP and does not mutate the deployment.
npx convex export --prod --path "$OUT"

echo "Convex backup written to $OUT"
echo "The studentProfiles table is included in the export. Review/export it separately for the later Supabase migration."
