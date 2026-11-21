# NEEDS FROM ME

Values that must not be invented and must be supplied or confirmed before production launch.

## Required contacts
- [ ] Aashraya coordinator name
- [ ] Aashraya public contact environment value (phone/WhatsApp or neutral no-contact wording)
- [ ] Aashraya coordinator phone/WhatsApp
- [ ] Sahayi coordinator name
- [ ] Sahayi public contact environment value (phone/WhatsApp or neutral no-contact wording)
- [ ] Sahayi coordinator phone/WhatsApp
- [ ] Official escalation contact(s)
- [ ] Official anti-ragging contact(s)
- [ ] Any additional official wellbeing/escalation contacts

## Academic configuration
- [ ] Confirm the single semester scheme to use consistently across Profile, Resource Upload and Resource Browse. Current UI offers 1–10 while browse previously offered 1–8.
- [ ] Confirm canonical academic-year/batch representation if required.

## Security / infrastructure
- [ ] Cloudflare Turnstile site key and secret
- [ ] Sentry DSN
- [ ] Google OAuth client ID/secret
- [ ] Confirm Google OAuth redirect configuration
- [ ] Confirm AI provider
- [ ] Confirm AI model
- [ ] Confirm any AI provider billing/budget constraints

## Privacy / legal
- [ ] Confirm data-retention policy
- [ ] Confirm who may access grievance records
- [ ] Confirm deletion workflow/contact
- [ ] Review DPDP Act 2023 obligations and identify the responsible data/privacy contact
- [ ] Review Privacy Policy, Terms, About and Contact text before launch

## Blood-support configuration
- [ ] Confirm Aashraya emergency/contact wording
- [ ] Confirm blood-donation eligibility thresholds against current Indian blood-bank guidance before implementation
- [ ] Confirm cooldown policy if different from the configured guidance

No secret values should be committed to Git. Secrets belong in the appropriate local/Vercel/Supabase secret stores.
