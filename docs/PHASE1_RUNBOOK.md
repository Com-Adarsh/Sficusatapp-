# Phase 1 Production Runbook

## Safety rule
Do not apply these migrations to the production Supabase project during Phase 1 review.

## Current production facts
- Supabase production project: `jwhyesglviptvklrclll`
- Current status: ACTIVE_HEALTHY
- Current public tables discovered: `leaderboard`, `leaderboard_sessions`
- The requested `grievances`, `grievance_updates`, and `issues` tables are not currently present in this Supabase project, so there are no current RLS policies on those three tables to expose. This also means the browser forms that target those tables cannot rely on them being present in the current database.
- Security Advisor currently reports:
  - RLS enabled with no policy on `leaderboard`
  - RLS enabled with no policy on `leaderboard_sessions`
  - leaked-password protection disabled
These production findings are intentionally not changed by this branch.

## Migration order after review
1. Create/confirm a separate development Supabase project.
2. Apply `supabase/migrations/202611210001_phase1_foundation.sql` to the development project only.
3. Verify extensions, tables, enums, functions, RLS, grants and storage bucket.
4. Run `supabase/tests/phase1_rls.sql` against the clean development database.
5. Seed the catalogue with `npm run seed:catalog` using development-only credentials.
6. Generate Supabase types from the development database.
7. Add Preview-only Vercel environment variables for development/preview testing.
8. Run typecheck, lint and build.
9. Run application smoke tests against a Preview deployment.
10. Review SQL and test output.
11. Only after explicit approval, apply the migration to production with the reviewed SQL and a fresh backup.
12. Re-run the Security Advisor after production application.

## Never do during review
- Do not run `supabase db push --remote` against production.
- Do not run `supabase db reset --remote` against production.
- Do not put a service/secret key in NEXT_PUBLIC_* variables.
- Do not commit a production database password or service key.

## Rollback
For a migration already applied to a hosted database, use a reviewed forward migration to reverse or disable the specific change. Do not use an ad-hoc destructive reset against production.
