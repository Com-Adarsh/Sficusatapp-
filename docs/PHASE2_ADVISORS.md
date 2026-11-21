# Phase 2 advisor status

Checked against DEV Supabase project `jwhyesglviptvklrclll` after the Phase 2 corrective migrations.

## Security

- **No RLS/view/security-definer warnings remain.**
- One remaining warning: leaked-password protection is disabled.
- This is a Supabase plan limitation on Free; leaked-password protection is available on Pro and above.
- No paid upgrade was performed.

## Performance

The remaining findings are intentionally documented rather than blindly removed:

1. **Unused indexes (42):** the DEV database is effectively empty, so many FK/search indexes have not yet accumulated usage. They should not be deleted before real workload exists.
2. **Multiple permissive policies (41):** these are intentional RBAC combinations where owner/public/moderator/coordinator access paths are OR-combined. Removing them blindly would change authorization semantics.

The corrective migrations already add the high-value FK indexes and convert common `auth.uid()` calls to initplan-friendly forms.

Re-run the advisor after representative production-like traffic before removing unused indexes or consolidating policies.

## Leaderboard

`leaderboard` and `leaderboard_sessions` are retained. They support the existing campus-game scoring/session workflow. They were not deleted or migrated away.
