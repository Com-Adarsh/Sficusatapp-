# Production Migration Runbook

## Safety rule

**Migrations first, code merge second.** Production remains read-only until the specific migration or hotfix is explicitly approved.

## 1. Pre-flight

1. Confirm the target Supabase ref is jwhyesglviptvklrclll.
2. Confirm no production write is being performed accidentally.
3. Review the migration SQL and rollback SQL.
4. Verify GitHub CI is green on local Supabase.
5. Export Convex production profile data before any profile-related migration: npx convex export --prod.
6. Take a database backup/export using the approved Supabase/CLI mechanism.
7. Record current migration history and the current handle_new_user() definition.
8. Confirm Vercel production environment variables still point at production.

## 2. Apply order

1. Apply the approved auth trigger hotfix only.
2. Verify the function definition and trigger.
3. Run one controlled throwaway signup.
4. Verify profiles and user_roles rows.
5. Delete the throwaway Auth user and revoke its sessions.
6. Only after the hotfix is verified, apply the remaining Phase 2 migrations in migration order.
7. Re-run post-migration verification.
8. Only then merge/deploy application code that depends on the new schema or role helpers.

## 3. Post-checks

- New signup succeeds.
- New signup creates exactly one profile and student role.
- Existing user without a profile is backfilled by the approved migration.
- Existing user can sign in.
- Protected pages load after authentication.
- Moderator/coordinator/admin routes enforce the expected role.
- /profile, /ai, /resources, /support/*, /aashraya/*, and /sahayi/* do not regress.
- RLS tests remain green.

## 4. Rollback

If the hotfix causes an unexpected problem:

1. Stop further production migrations and do not merge dependent application code.
2. Re-run the exact rollback SQL captured in supabase/hotfix/handle_new_user_rollback.sql.
3. Re-check the trigger and function definition.
4. Re-test signup behavior in a controlled account.
5. Investigate logs before retrying.
6. Do not delete or rewrite migration history to hide an applied migration.

## 5. Production verification SQL

Use the prepared one-paste SQL in the deployment PR. It must verify:
- public.handle_new_user() retains SECURITY DEFINER and empty search_path.
- on_auth_user_created still calls handle_new_user().
- The controlled test signup has both profile and student-role rows.

## 6. Approval gate

No production SQL is applied by automation until the user explicitly approves that exact production operation. No merge to main occurs before the required migrations are applied and verified.
