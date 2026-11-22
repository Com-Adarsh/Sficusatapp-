# Fresh database baseline

The active production migration history is not a valid empty-database replay: the two recorded Phase 1 migrations both create `public.moderation_status`, so replaying them from zero fails before the later security migrations can run.

This baseline is generated directly from `docs/prod-schema-snapshot.sql`, including the production-shaped fail-safe `public.handle_new_user()` trigger/function. It lives under `supabase/baseline/` deliberately and is **not** a Supabase migration.

## Why `supabase db reset` cannot replay production history

`supabase db reset` replays files in `supabase/migrations/` against an empty local database. The production history contains timestamp/version pairs whose filenames in Git originally reflected migration names rather than the recorded production version values, and the two Phase 1 migrations overlap. Therefore a literal reset of the historical chain is not a faithful fresh-database construction.

Use `scripts/db-fresh.sh` for fresh local/CI construction instead:

1. create an empty database;
2. install the local Supabase-compatible auth/storage shim when present;
3. apply the production-schema baseline;
4. apply every migration currently in `supabase/migrations/`, in lexical order;
5. fail immediately on any SQL error.

Production migration history is never rewritten by this process.

## Production version mapping

Production's read-only `supabase_migrations.schema_migrations` history reports these versions:

| Git filename (recorded production migration) | Production version |
| --- | --- |
| `202611210001_phase1_foundation.sql` | `20261121160535` |
| `20261121161700_phase1_foundation_actual.sql` | `20261121160657` |
| `20261121162000_phase2_security_performance.sql` | `20261121161121` |
| `20261121162500_phase2_advisor_cleanup.sql` | `20261121161135` |
| `20261121163000_phase2_donor_consent_fix.sql` | `20261121161244` |

The Git files are being renamed to these production versions **without changing their SQL content**.

Unapplied version mapping:

| Old Git filename | New versioned filename |
| --- | --- |
| `20261121170000_phase2_auth_foundation.sql` | `20261122111000_phase2_auth_foundation.sql` |
| `20261121171000_phase2_role_rpc.sql` | `20261122112000_phase2_role_rpc.sql` |
| `20261122115000_phase2_grievance_officer_role.sql` | `20261122113000_phase2_grievance_officer_role.sql` |
| `20261122120000_phase2_rls_hardening.sql` | `20261122114000_phase2_rls_hardening.sql` |

These new versions are all later than the production hotfix `20261122110000` and later than every recorded production migration.

The raw-SQL fail-safe trigger hotfix is recorded in the repository as `20261122110000_phase2_auth_trigger_failsafe.sql`; it was applied to production outside the migration-history table and therefore must not be repaired/re-written in production.

Unapplied migrations are assigned versions later than `20261122110000` and later than every recorded production version. Their old-to-new mapping is recorded in the commit history and below.

## Legacy migrations

The files under `supabase/legacy/` are historical, unrecorded schema migrations. They are retained for audit/reference and are not replayed by the fresh-database baseline.

## Fidelity

The repository also contains `docs/prod-catalog.json`, a read-only production catalog for application-owned objects. CI generates the same catalog from the fresh database and compares it. Supabase-managed internal Auth/Storage tables outside the application contract are excluded from the fidelity comparison because they are supplied by the local Supabase/runtime shim rather than by this repository's schema.

## Production safety

Do not run `supabase migration repair` against production as part of this workflow. Production remains read-only unless a separate, explicit production-write approval is given.
