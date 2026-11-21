# Phase 2 — NEEDS FROM ME

- Google OAuth client ID + client secret for DEV Supabase Auth, plus the configured callback/redirect URL.
- Turnstile site key + secret for DEV and later production.
- Sentry DSN (and desired environment names).
- Confirmed Aashraya coordinator contact.
- Confirmed Sahayi coordinator contact.
- A dev-only Supabase service-role key for Playwright test-user seeding. Store it as a secret; never commit it.
- Production Supabase ref/value mapping needs confirmation: this phase request names `bdeuecrwqrnlwhxwbpmi` as production, while the existing Vercel production environment currently contains `jwhyesglviptvklrclll`. I did not overwrite production values.
- Convex deployment credentials if the cloud deployment itself needs its JWT issuer environment updated. The code now reads `SUPABASE_AUTH_ISSUER` per Convex deployment instead of hardcoding a Supabase project.
