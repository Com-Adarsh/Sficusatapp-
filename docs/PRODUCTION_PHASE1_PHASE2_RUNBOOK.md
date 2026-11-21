# Production runbook — Phase 1 + Phase 2

**Do not execute this runbook automatically.** Production Supabase was intentionally not changed during Phase 2.

## 0. Target guard

Before every Supabase CLI/MCP command, verify the target project ref.

For this phase request, the stated production ref is `bdeuecrwqrnlwhxwbpmi`. The migration scripts refuse that ref and only allow dev `jwhyesglviptvklrclll`.

Do not paste service-role keys into Git, logs or chat.

## 1. Backup

Create and store a production backup outside Git:

```bash
supabase db dump --remote --schema public > production-schema-and-data.sql
supabase db dump --data-only --remote > production-data.sql
```

## 2. Phase 1 schema

Review and apply the Phase 1 foundation migration from `supabase/migrations/202611210001_phase1_foundation.sql`.

The migration must be reviewed against the current production schema before execution. Phase 1 was designed to be additive, but production currently contains legacy leaderboard tables that must not be deleted.

## 3. Phase 2 corrective migrations

Apply the Phase 2 migrations after Phase 1, in timestamp order:

1. `20261121162000_phase2_security_performance`
2. `20261121162500_phase2_advisor_cleanup`
3. `20261121163000_phase2_donor_consent_fix`

These include the profile/signup trigger, public issue-view hardening, leaderboard read policy, RLS performance improvements, foreign-key indexes, extension placement, and donor-consent enforcement.

## 4. Auth configuration

In the production Supabase Auth dashboard:

- Keep email/password enabled.
- Enable email confirmation.
- Configure password recovery redirect to the production app.
- Configure Google OAuth only after production Google credentials are supplied.
- Add the production callback URL to Supabase and Google allow-lists.
- Enable leaked-password protection if the production plan exposes the setting. If unavailable, upgrade only after explicit approval.

## 5. Vercel environment scoping

Production must contain only production Supabase values. Preview/Development must contain only `jwhyesglviptvklrclll` values.

Never place a service-role key in any `NEXT_PUBLIC_*` variable.

Server-only credentials must be Vercel `sensitive`/encrypted variables.

## 6. Convex

Convex `auth.config.ts` now reads `SUPABASE_AUTH_ISSUER` from the deployment environment. Set the production Convex deployment's issuer to the production Supabase Auth issuer and the development Convex deployment's issuer to:

`https://jwhyesglviptvklrclll.supabase.co/auth/v1`

Do not reuse the development issuer in production.

## 7. First admin/coordinator

Use `docs/ROLES_RUNBOOK.md` to grant the first production admin/coordinator roles by email. There is intentionally no public role-management UI.

## 8. Verification

After applying migrations, run:

- Supabase security advisor
- Supabase performance advisor
- RLS test suite
- typecheck
- lint
- production build
- Playwright against the production deployment only after all credentials and OAuth redirect settings are verified

Do not merge the Phase 2 PR until all production values have been independently verified.
