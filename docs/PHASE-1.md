# Phase 1 — Core Student Services

## Implemented in repository

- Supabase browser/server clients using `@supabase/ssr`
- Next.js 16 Proxy-based auth session refresh using verified Supabase claims
- Sign in with email/password
- Registration with password confirmation
- Automatic profile creation trigger
- Authenticated student profile surface
- Academic Resources information surface
- Aashraya landing, donor registration and blood-request UI
- Sahayi landing, scribe request and volunteer UI
- Phase 1 Postgres schema for resources, donors, blood requests, responses, accessibility profiles, scribe requests, volunteers and assignments
- Ownership-focused RLS policies for sensitive records
- Private-data comments and no-public-contact design
- Supabase environment template

## Security notes

Coordinator workflows are intentionally not granted broad database access yet. Coordinator authorization will be wired to the final role-management model before production rather than using UI-only checks or unsafe client metadata.

Sensitive accessibility, blood-support and grievance information must not be exposed in public URLs, analytics or public listings.

## Supabase environment

The repository expects:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

No Supabase project has been automatically assigned to this application yet. Do not point this schema at the existing Aashraya/blood-donation project without an explicit decision, because that project belongs to a separate initiative.

## Next target

Finish coordinator-scoped RLS and dashboards, real form submissions, private Storage policies, donor/request matching, scribe assignment workflow, profile editing, Malayalam messages, and automated tests.
