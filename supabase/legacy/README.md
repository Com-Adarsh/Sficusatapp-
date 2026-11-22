# Legacy Supabase migrations

This directory contains historical SQL that is **not recorded as applied in the production Supabase migration history**.

## Why these files are here

The archived files (`0001_foundation.sql` through `0010_sahayi_public_certificates.sql`) are early foundation/service/module migrations. Production history begins with the recorded Phase 1 migration chain and does not record this legacy migration. Keeping the file under `supabase/legacy/` preserves it for audit/reference without allowing a fresh migration replay to execute the obsolete schema.

The legacy chain conflicts with the current production-shaped Phase 1 schema: it defines an older `profiles` shape, a separate `roles` table, and a `user_roles.role_id` foreign key model that are not part of the current schema. These files are not recorded in the production history listed below.

**Do not delete, edit, or apply these legacy files as production migrations.**

## Production history used for reconciliation

- `202611210001_phase1_foundation`
- `20261121161700_phase1_foundation_actual`
- `20261121162000_phase2_security_performance`
- `20261121162500_phase2_advisor_cleanup`
- `20261121163000_phase2_donor_consent_fix`

Production remains read-only unless a specific write is explicitly approved.
