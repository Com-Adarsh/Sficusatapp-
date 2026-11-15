# SFI CUSAT Digital Platform - Self-Hosted Backend

Provider-independent backend foundation for the whole SFI CUSAT Digital Student Platform.

Architecture: Next.js frontend -> Fastify API -> PostgreSQL. Redis is optional for queues/cache. Files can later use local disk, MinIO, S3 or R2.

Modules covered: identity, roles, departments, notifications, audit; Academic Helpdesk; CBT; Abhimanyu resources; SCHOLARX; Aashraya; Sahayi; Samskara; Helpdesk.

Local setup:
1. Copy .env.example to .env.
2. docker compose -f backend/docker-compose.yml up -d
3. cd backend && npm install
4. npm run migrate
5. npm run dev

API health: http://localhost:4000/health

No Supabase or other hosted service is required.

Production: run API and worker separately behind a TLS reverse proxy. Use self-hosted or managed PostgreSQL/Redis/object storage as desired. Keep secrets outside Git. Enable HTTPS, backups, monitoring, rate limiting and disaster recovery before public use.

Security: the browser is untrusted. Scores, roles, exam timers, answer keys and permissions are server-controlled. CBT answer keys are versioned and locked; attempts record the exact key version used. Sensitive Aashraya/Sahayi/Helpdesk data must not be public.
