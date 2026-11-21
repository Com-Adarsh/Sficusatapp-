# SFI CUSAT Digital Student Platform — Production Audit

**Phase:** 0 / carried into Phase 1  
**Repository:** Com-Adarsh/Sficusatapp-  
**Production:** sficusatapp.vercel.app  
**Framework:** Next.js 16 App Router, React 19, TypeScript  
**Backend currently present:** Supabase + Convex  
**Production decision:** Supabase becomes the system of record; Convex remains runtime for Profile and Study AI until a later migration.

## 1. Executive summary
The UI is substantially built, but the application mixes live Supabase writes, Convex persistence, local-only React forms, and hardcoded/demo records. Sensitive workflows cannot be considered production-safe until server-side validation, database RLS, private storage and role checks are established.

The production target is:
- Supabase Auth
- Supabase Postgres
- Supabase Storage
- PostgreSQL RLS
- pgvector
- PostgreSQL FTS + pg_trgm
- server-side Zod validation
- Vercel deployment

## 2. Current stack
- Next.js 16 App Router
- React 19
- TypeScript
- custom CSS/UI components
- lucide-react
- Supabase Auth/client libraries
- Convex
- Vercel AI SDK / AI Gateway
- Vercel
- GitHub Actions

## 3. Backend assessment
Supabase is active and is now the production system of record for the Phase 1 foundation. The live production schema contains all 28 tables defined by the Phase 1 foundation migration, plus the two pre-Phase-1 leaderboard tables: `leaderboard` and `leaderboard_sessions`. Convex is also active and is currently used by Profile/Study AI. The production migration should not switch Profile or Study AI abruptly. Supabase will become authoritative for new production domains first.

### Production schema reconciliation
The earlier audit item saying Phase-1 tables were missing from live production was incorrect. Read-only reconciliation against `jwhyesglviptvklrclll` confirms that **none of the 28 Phase-1-defined tables are missing**.

The two tables that pre-dated Phase 1 are exactly:
- `leaderboard`
- `leaderboard_sessions`

They are retained and protected by RLS. `leaderboard_public_read` intentionally exposes leaderboard rows publicly; this is flagged separately in `docs/RLS_MATRIX.md`.

`scholarships` is different: it is an application/domain requirement represented by the `/scholarships` product area, but there is **no dedicated `public.scholarships` table** in production. The current domain model uses `opportunities.type = 'scholarship'`. A dedicated scholarships table remains a future schema-plan item if the product needs scholarship-specific fields/workflows.

## 4. Demo/hardcoded sources

### Learning Space
**Routes:** /resources, /resources/browse  
Current source includes hardcoded recent resources and browse rows.  
Examples include Probability & Random Variables, Statistical Inference, Mathematical Statistics, Academic Calendar and Statistical Computing.  
**Replacement:** approved/published rows from resources + resource_files, with loading/empty/error states.

### Student Issues
**Route:** /support/issues  
Contains demonstration issue records and previously stated backend-paused copy.  
**Replacement:** approved/anonymised public issue view backed by issues.

### Aashraya
**Routes:** /aashraya, /aashraya/request, /aashraya/donor, /aashraya/coordinator, /aashraya/camps, /aashraya/request/status  
Request and donor forms currently use local state. Coordinator page contains demo requests/donors and demo IDs.  
**Replacement:** blood_requests, donors, donor_contact_details, donor_matches, donation_camps, site_settings.

### Sahayi
**Routes:** /sahayi, /sahayi/request, /sahayi/volunteer, /sahayi/assignments  
Request and volunteer forms only change local state; success screens contain demo IDs. Assignments contain demo state.  
**Replacement:** scribe_requests, scribe_volunteers, scribe_assignments.

### SCHOLARX
**Routes:** /opportunities, /opportunities/browse, /opportunities/submit, /scholarships, /scholarships/chat  
Opportunity browse and featured cards are hardcoded. Submit/chat flows require persistence/security review.  
**Replacement:** one opportunities table with type = scholarship/internship/job/fellowship, source link, last_verified_at, moderation state and report-scam workflow.

### Samskara
**Routes:** /samskara, /samskara/events, /samskara/competitions, /samskara/gallery, /samskara/magazine, /samskara/volunteers  
Events, competitions and gallery contain hardcoded/demo records; volunteer flow requires persistence review.  
**Replacement:** events, event_registrations, moderated gallery/media records, magazine submissions and volunteers.

### Updates
**Route:** /updates  
Currently has no complete live announcement pipeline.  
**Replacement:** announcements with category, source, verification and publication state.

### Search
**Route:** /search  
Currently searches a client-side navigation/static array rather than platform data.  
**Replacement:** PostgreSQL tsvector + pg_trgm across resources, opportunities, events, announcements, helpdesk and static pages, including Malayalam-aware search.

### Profile
**Route:** /profile  
Currently uses Convex and CUSAT catalogue data.  
**Replacement in later migration:** Supabase profile/programme IDs. Convex remains authoritative for now.

### Study AI
**Route:** /ai  
AI route and Convex quota/context infrastructure exist.  
**Replacement in later AI phase:** Supabase-backed RAG over approved resources with citations. Convex remains untouched during Phase 1.

### Resource upload
**Route:** /resources/upload  
Currently selects a file locally and displays a success state; it does not establish the required production storage/moderation pipeline.  
**Replacement:** private Supabase Storage + pending resource record + MIME/magic-byte/hash checks + moderation.

## 5. Support/helpdesk audit
**Routes:** /support/helpdesk/* and support directory routes  
The support directory and submission workflows are not yet a complete live helpdesk system. They require moderated directory records, scoped coordinator access, server validation and public-safe views.  
**Replacement:** helpdesk_entries + issues + interventions with module-scoped roles and RLS.

## 6. Interventions
**Route:** /support/interventions  
Intervention/timeline data is not yet established as a production workflow.  
**Replacement:** interventions linked to issues/tickets, visible only to authorised participants/coordinators according to role and case scope.

## 7. Grievances
**Routes:** /support/grievance, /support/grievance/[id]  
Current submissions write to Supabase, but the tracking code uses CUSAT + Date.now() and the status page is ID-based.  
**Risk:** guessable identifiers and possible exposure if RLS is loose.  
**Replacement:** server-generated >=128-bit random tracking token; store only a hash; show token once; status lookup by token only.

## 8. Aashraya request status
**Route:** /aashraya/request/status  
Current tracking workflow requires redesign around unguessable random request identifiers and rate-limited lookup.  
**Replacement:** token-based status lookup, no sequential/guessable IDs.

## 9. Aashraya camps
**Route:** /aashraya/camps  
Camp content requires live donation_camps records and moderator/coordinator management. No invented dates, venues or contacts are permitted.

## 10. Aashraya coordinator
**Route:** /aashraya/coordinator  
Demo requests/donors are present.  
**Replacement:** role-gated coordinator workspace with consent-aware matching and fulfilment tracking.

## 11. Sahayi request/volunteer/assignments
**Routes:** /sahayi/request, /sahayi/volunteer, /sahayi/assignments  
Forms are local-only and expose demo success IDs.  
**Replacement:** minimum-necessary data in scribe_requests/scribe_volunteers, with coordinator-only matching and volunteer-specific assignment visibility.

## 12. Scholarships chat
**Route:** /scholarships/chat  
Needs a persistence/security audit and must not present fabricated scholarship information. It should eventually use the live opportunities source and clearly distinguish platform guidance from official scholarship sources.

## 13. Opportunities submission
**Route:** /opportunities/submit  
Submission needs server-side validation, moderation and a required source/application URL. No opportunity becomes public before approval.

## 14. Samskara volunteers
**Route:** /samskara/volunteers  
Requires a real volunteer record and coordinator/moderator workflow. Personal data must be minimised and protected by RLS.

## 15. Language toggle
The English/Malayalam toggle exists in the UI but requires verification that it actually changes translations across the application. Malayalam font support should use Noto Sans Malayalam via next/font.

## 16. Authentication
Email/password Supabase Auth exists. Google OAuth and campus-email verified badge remain to be implemented. Private routes require middleware plus server-side role checks. Private routes should be noindex.

## 17. Forms persistence matrix
| Workflow | Current | Target |
|---|---|---|
| Sign in | Supabase Auth | Keep + Google |
| Profile | Convex | Later Supabase migration |
| Resource upload | Local-only | Supabase Storage + DB |
| Issues | Supabase direct | Server mutation + RLS |
| Grievance | Supabase direct | Secure token + RLS |
| Aashraya request | Local-only | Supabase |
| Aashraya donor | Local-only | Supabase |
| Aashraya coordinator | Demo | Supabase |
| Sahayi request | Local-only | Supabase |
| Sahayi volunteer | Local-only | Supabase |
| Sahayi assignments | Demo/local | Supabase |
| Opportunities | Demo | Supabase |
| Scholarships | Demo/local | Supabase; currently represented through `opportunities.type = 'scholarship'`; dedicated `scholarships` table remains a future schema-plan item |
| Event registration | Incomplete | Supabase |
| Gallery | Demo | Private Storage + moderation |
| Magazine | Demo | Supabase |
| Volunteers | Incomplete | Supabase |
| Search | Client-only | PostgreSQL search |
| Study AI | Convex/AI | Later Supabase RAG |

## 18. Security findings
Sensitive data includes grievances, blood information and accessibility information. Application UI hiding is insufficient. RLS must be default-deny and enforced at the database layer. Donor contact data must be separated and consent-gated. No service-role key may reach the browser.

## 19. Storage findings
Current resource upload accepts Office formats in the browser. Production upload must use private storage and allow PDF/JPG/PNG/WebP, with server-side MIME and magic-byte validation, size limits, filename sanitisation and hash duplicate detection.

## 20. Search findings
Client-side search is not sufficient. PostgreSQL FTS, pg_trgm and indexed search columns are required.

## 21. UI consistency findings
Some routes do not use the shared PageShell. A single navigation config should drive header, mobile navigation and footer. Support icons need meaningful accessible icons. Icon-only links require aria-labels. All lists need loading/empty/error states.

## 22. Metadata and accessibility
Add unique metadata/Open Graph per route, sitemap.xml, robots.txt, noindex private routes, keyboard focus, 44px touch targets, dark-mode verification and Noto Sans Malayalam.

## 23. Developer/demo text to remove
Remove user-facing occurrences of demo mode, demo records, backend paused/backend connection, fabricated IDs and similar developer copy. Dev seed data must be isolated from production execution.

## 24. Route inventory requiring Phase 1+ work
/support/helpdesk/*
/support/interventions
/support/issues
/support/issues/new
/support/grievance
/support/grievance/[id]
/aashraya/request
/aashraya/request/status
/aashraya/donor
/aashraya/camps
/aashraya/coordinator
/sahayi/request
/sahayi/volunteer
/sahayi/assignments
/scholarships
/scholarships/chat
/opportunities
/opportunities/browse
/opportunities/[id]
/opportunities/submit
/samskara/events
/samskara/competitions
/samskara/gallery
/samskara/magazine
/samskara/volunteers
/updates
/search
/resources
/resources/browse
/resources/upload
/profile
/ai

## 25. Production architecture
Next.js → Supabase Auth → server-side mutations/queries → Postgres/RLS → private Storage; pgvector for later AI retrieval; PostgreSQL FTS/trgm for search.

## 26. Schema and migration strategy
The production schema reconciliation is now documented in `docs/prod-schema-snapshot.sql` and the effective RLS model in `docs/RLS_MATRIX.md`.

Schema-plan gap to carry forward: `scholarships` is a domain requirement but has no dedicated table yet. Keep it as a planned schema item rather than treating it as a missing Phase-1 table.

Migrate in small commits:
1. security hotfixes
2. schema/RLS
3. catalogue
4. tests
5. plumbing
6. auth
7. support
8. Aashraya
9. Sahayi
10. resources
11. opportunities
12. Samskara/updates/search
13. AI migration
14. launch/monitoring

## 27. Phase 0 conclusion
The application is not production-ready. The main risk is not visual polish but mixed persistence and incomplete access control. Supabase is the approved system of record. Convex remains running for Profile and Study AI until its later migration phase.
