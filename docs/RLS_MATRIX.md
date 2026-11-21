# Production RLS Matrix — jwhyesglviptvklrclll

Captured read-only from production on 2026-11-21. Production remains READ-ONLY.

Legend:
- Self = the authenticated owner of the row.
- Moderator/Admin = users with the corresponding role in public.user_roles.
- Aashraya = aashraya_coordinator or Admin.
- Sahayi = sahayi_coordinator or Admin.
- Public = anon and authenticated users where the policy says so.
- A dash means there is no matching RLS policy for that operation.
- RLS is enabled on every public table observed.
- PostgreSQL table grants alone do not bypass RLS.

| Table | SELECT | INSERT | UPDATE | DELETE |
|---|---|---|---|---|
| announcements | Public approved; Self; Moderator/Admin | Self; Moderator/Admin | Self; Moderator/Admin | Self; Moderator/Admin |
| audit_log | Admin only | — | — | — |
| blood_requests | Self; Aashraya/Admin | Self; Aashraya/Admin | Self; Aashraya/Admin | Self; Aashraya/Admin |
| bookmarks | Self | Self | Self | Self |
| departments | **Public — policy uses true** | — | — | — |
| donation_camps | Public approved; Aashraya/Admin | Aashraya/Admin | Aashraya/Admin | Aashraya/Admin |
| donor_contact_details | Self; Aashraya/Admin when donor consent is true | Self | Self | Self |
| donor_matches | Aashraya/Admin | Aashraya/Admin | Aashraya/Admin | Aashraya/Admin |
| donors | Self | Self | Self | Self |
| event_registrations | Self | Self | Self | Self |
| events | Public approved; Self; Moderator/Admin | Self; Moderator/Admin | Self; Moderator/Admin | Self; Moderator/Admin |
| grievance_updates | Grievance owner; Moderator/Admin | Moderator/Admin | Moderator/Admin | Moderator/Admin |
| grievances | Owner; Moderator/Admin | Owner; Moderator/Admin | Moderator/Admin | Moderator/Admin |
| helpdesk_entries | Public approved; Self; Moderator/Admin | Self; Moderator/Admin | Self; Moderator/Admin | Self; Moderator/Admin |
| interventions | Owner/coordinator; Moderator/Admin | Coordinator; Moderator/Admin | Coordinator; Moderator/Admin | Coordinator; Moderator/Admin |
| issues | Public approved + anonymous; Self; Moderator/Admin | Self; Moderator/Admin | Self; Moderator/Admin | Self; Moderator/Admin |
| leaderboard | **Public — policy uses true** | — | — | — |
| leaderboard_sessions | **None (SELECT policy is false)** | — | — | — |
| notifications | Self | Self | Self | Self |
| opportunities | Public approved; Self; Moderator/Admin | Self; Moderator/Admin | Self; Moderator/Admin | Self; Moderator/Admin |
| profiles | Self | Self | Self | Self |
| programmes | **Public — policy uses true** | — | — | — |
| resource_files | Self | Self | Self | Self |
| resources | Public approved; Self; Moderator/Admin | Self | Self | Self |
| scribe_assignments | Request/volunteer owner; Sahayi/Admin | Sahayi/Admin | Sahayi/Admin | Sahayi/Admin |
| scribe_requests | Self; Sahayi/Admin | Self; Sahayi/Admin | Self; Sahayi/Admin | Self; Sahayi/Admin |
| scribe_volunteers | Self; Sahayi/Admin | Self; Sahayi/Admin | Self; Sahayi/Admin | Self; Sahayi/Admin |
| site_settings | Admin only | Admin | Admin | Admin |
| tickets | Self; Moderator/Admin | Self; Moderator/Admin | Self; Moderator/Admin | Self; Moderator/Admin |
| user_roles | Self read; Admin | Admin | Admin | Admin |

## Explicit flags

### leaderboard_public_read
This policy is FOR SELECT TO anon, authenticated USING (true). It intentionally makes all rows in the pre-existing public.leaderboard table publicly readable. This is the most permissive public policy in the production schema and should remain a deliberate product decision, not an accidental default.

### Policies using true
The following production policies use an unconditional USING (true) predicate:
1. departments_public_read
2. programmes_public_read
3. leaderboard_public_read

### No policy using true was found on sensitive workflows
Blood, donor contact, grievance, intervention, scribe and profile data are not covered by unconditional public-read policies.

## Notes
- ALL policies provide SELECT/INSERT/UPDATE/DELETE subject to both USING and WITH CHECK where defined.
- UPDATE policies have SELECT coverage where required by PostgreSQL RLS.
- leaderboard_sessions_service_read is named service_read but its RLS predicate is false; it does not grant normal authenticated users access.
- This document describes RLS policy decisions. It does not treat broad base table grants as an authorization decision because RLS remains enforced.