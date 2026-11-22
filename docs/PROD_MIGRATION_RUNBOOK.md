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

## 1A. Migration-history reconciliation and secret pre-merge gate

1. If the migration was applied by raw SQL rather than the Supabase migration runner, reconcile history with `supabase migration repair 20261122110000 --status applied` **only after verifying the production SQL exactly matches Git**. This command changes migration history, so it is itself a production write and requires explicit approval.
2. Before merging any code that instantiates the server-side Supabase client, verify Vercel Production has `SUPABASE_SERVICE_ROLE_KEY` as a server-only **Sensitive** variable. Also verify the Turnstile secret (or approved equivalent) exists as a server-only **Sensitive** variable. Never use `NEXT_PUBLIC_*` for either secret and never commit their values.
3. Do not add or modify either production secret from automation without explicit approval for that exact Vercel operation.

## 2. Application pre-merge security gate

Before PR #18 or any application code using the service client can merge:

1. In Vercel Production, set `SUPABASE_SERVICE_ROLE_KEY` as a server-only **Sensitive** environment variable. Never expose it as `NEXT_PUBLIC_*` and never commit it.
2. Confirm the following routes currently use `createServiceClient()` and therefore require that secret: `app/api/grievances/route.ts` and `app/api/grievances/status/route.ts`.
3. `POST /api/grievances` and `POST /api/grievances/status` are unauthenticated at the HTTP boundary. They require rate limiting before production exposure, preferably keyed by IP plus a short-lived token bucket.
4. Add Cloudflare Turnstile (or the approved equivalent) to the public grievance submission flow and verify the token server-side before calling the service client.
5. Keep the service-role client in `server-only` code; it bypasses RLS and must never be imported into client components.
6. Re-test the routes with invalid, missing, replayed and excessive requests before merge.

## 3. Apply order

1. Apply `supabase/hotfix/handle_new_user_apply_and_verify.sql` in the Supabase SQL editor; it contains only the `public.handle_new_user()` replacement plus immediate verification queries.
2. Verify the function definition and trigger.
3. Run one controlled throwaway signup.
4. Verify profiles and user_roles rows.
5. Delete the throwaway Auth user and revoke its sessions.
6. Only after the hotfix is verified, apply the remaining Phase 2 migrations in migration order.
7. Re-run post-migration verification.
8. Only then merge/deploy application code that depends on the new schema or role helpers.

## 4. Post-checks

- New signup succeeds.
- New signup creates exactly one profile and student role.
- Existing user without a profile is backfilled by the approved migration.
- Existing user can sign in.
- Protected pages load after authentication.
- Moderator/coordinator/admin routes enforce the expected role.
- /profile, /ai, /resources, /support/*, /aashraya/*, and /sahayi/* do not regress.
- RLS tests remain green.

## 5. Rollback

If the hotfix causes an unexpected problem:

1. Stop further production migrations and do not merge dependent application code.
2. Re-run the exact rollback SQL captured in supabase/hotfix/handle_new_user_rollback.sql.
3. Re-check the trigger and function definition.
4. Re-test signup behavior in a controlled account.
5. Investigate logs before retrying.
6. Do not delete or rewrite migration history to hide an applied migration.

## 6. Production verification SQL

Use `supabase/hotfix/handle_new_user_apply_and_verify.sql` for the one-paste SQL-editor operation. The post-signup query in that file is intentionally commented until a throwaway email exists.

Use the prepared one-paste SQL in the deployment PR. It must verify:
- public.handle_new_user() retains SECURITY DEFINER and empty search_path.
- on_auth_user_created still calls handle_new_user().
- The controlled test signup has both profile and student-role rows.

## 7. Approval gate

No production SQL is applied by automation until the user explicitly approves that exact production operation. No merge to main occurs before the required migrations are applied and verified.
