# Convex backend layer

This directory is the Convex data/backend layer for the SFI CUSAT platform.

## Migration strategy

The existing Fastify + PostgreSQL API remains the authentication and compatibility gateway for now. Convex is added as the next-generation application backend rather than silently replacing the current API.

The bridge is intentionally server-to-server:

- Fastify authenticates the request with the existing JWT/session model.
- Fastify can forward the authenticated user's legacy ID in `x-sfi-user-id`.
- Fastify calls the Convex HTTP API with `x-convex-api-secret`.
- Convex HTTP actions validate the shared secret and invoke internal queries/mutations.
- Convex stores the migrated platform and CBT data with typed schemas and indexes.
- No Convex mutation in this layer is directly exposed to browsers.

This avoids a dual-auth migration and keeps the existing student login contract intact while the Convex data layer is introduced.

## Required Convex environment variable

Set this only on the Convex deployment:

```text
CONVEX_API_SECRET=<long-random-secret>
```

Never put this in `NEXT_PUBLIC_*` variables, Git, or browser code.

The HTTP bridge is served from the deployment's `.convex.site` URL.

## Development

Run:

```bash
npm install
npx convex dev --once
```

Convex generates `convex/_generated/` locally; that generated directory should not be hand-authored.

For CI/agent checks, Convex supports `npx convex dev --once` without an account by using its local anonymous deployment mode.

## What is implemented

### Core
- users
- departments
- helpdesk tickets
- Aashraya blood requests
- Sahayi scribe requests
- Samskara events
- SCHOLARX opportunities
- notifications
- audit logs

### CBT
- exams
- question banks
- questions/options
- exam-question ordering
- versioned answer keys
- answer-key locking
- student registrations
- server-authoritative attempts
- autosaved answers
- mark-for-review state
- server-side scoring
- negative marking
- result release
- indexed result queries

## Next migration step

The next safe step is to add a small Fastify Convex adapter and migrate one vertical at a time (CBT first), with PostgreSQL kept as the fallback until the Convex path passes an end-to-end test.

Do not delete the PostgreSQL backend or change production `NEXT_PUBLIC_CBT_API_URL` until that verification is complete.
