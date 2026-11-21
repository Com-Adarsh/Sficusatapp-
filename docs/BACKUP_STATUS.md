# Backup status before Phase 1

## Supabase
A live inspection was performed against project `jwhyesglviptvklrclll`.

Current public schema contains only:
- leaderboard
- leaderboard_sessions

Both currently contain zero rows.

The requested application tables `grievances`, `grievance_updates`, and `issues` are absent from the live project.

A full production dump was **not** executed from the agent because the database password/connection secret is not available to the agent and must not be retrieved or committed. Before any production migration, the owner should run a reviewed Supabase CLI data/schema backup.

Recommended commands, targeting the intended production project only when you explicitly choose to do so:

```bash
supabase db dump --remote --schema public > production-schema-and-data.sql
supabase db dump --data-only --remote > production-data.sql
```

Review the dump and store it outside Git. Do not commit real student/grievance/blood data.

## Convex
The production Convex URL configured in Vercel is:
`https://fastidious-shrimp-629.convex.cloud`

The agent did not retrieve or print the Convex deploy key. A live data export cannot be performed without a valid Convex deployment credential. A read-only export script should be run by the owner with the deploy key supplied through the environment, and the resulting export must be stored outside Git.

No Convex runtime switch has been made by this branch.
