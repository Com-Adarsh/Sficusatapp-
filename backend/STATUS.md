# Backend implementation status

## Implemented in this branch
- Self-hosted PostgreSQL schema covering all current platform domains.
- Fastify/TypeScript API server.
- JWT login/register and bcrypt password hashing.
- Student roll-number uniqueness and duplicate registration response.
- Role/permission model and seeded role mappings.
- Department submission endpoint.
- Academic exam creation and listing.
- CBT registration endpoint.
- Helpdesk ticket creation.
- Aashraya blood request creation.
- Sahayi scribe request creation.
- Samskara event creation.
- SCHOLARX opportunity listing.
- Local Docker PostgreSQL and Redis development stack.
- Migration runner and seed script.
- CBT route module containing question creation, answer-key versioning/locking, publishing, server-authoritative attempts, answer autosave and result evaluation.

## Important production work still required
- Wire the CBT route module into the main server registration if not already wired in the final integration commit.
- Add scoped department authorization to every coordinator operation.
- Add moderation/admin CRUD routes.
- Add private object-storage adapter and file upload scanning.
- Add email/push notification workers and Redis queue consumers.
- Add complete result release/export endpoints.
- Add PDF/XLSX/CSV/JSON question import workers.
- Add rate limits per authentication and exam action, idempotency keys and stronger session/device controls.
- Add comprehensive audit events for every privileged mutation.
- Add automated tests, migrations rollback strategy, backups and observability.
- Review privacy/legal requirements before storing blood, accessibility, grievance or identity data.
- Never use development credentials in production.

The branch is deliberately backend-first and hosting-neutral. It does not provision or connect to Supabase.
