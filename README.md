# SFI CUSAT — Digital Student Platform

A mobile-first student-services platform run by SFI CUSAT.

> **Important:** Run by SFI CUSAT. Not an official website of Cochin University of Science and Technology.

## Phase 0

This first implementation establishes:
- Next.js + TypeScript application foundation
- Responsive SFI-red design system
- Mobile-first Home experience
- Academic Resources / Opportunities / Helpdesk information architecture
- Aashraya, Sahayi and Samskara initiative surfaces
- English-first shell ready for Malayalam i18n
- Initial Supabase schema for profiles, roles and academic hierarchy
- No fabricated announcements, impact metrics or personal data

## Run locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Next phases

Phase 1 will connect Supabase Auth, profiles, Academic Resources, Aashraya and Sahayi workflows with RLS and coordinator tools. Phase 2 adds Opportunities, Samskara and SFI CUSAT Updates. Phase 3 adds Student Support, notifications, PWA features, analytics and hardening.

## Product principles

- Services are open to all CUSAT students.
- SFI organisational updates are separately labelled.
- Sensitive blood, accessibility and grievance information is private by default.
- Database permissions are enforced with RLS, not only the UI.
- Placeholder content is clearly identified; facts are never fabricated.
