# Production RLS Matrix — current baseline + proposed hardening

Captured from production read-only on 2026-11-21. The hardening rows marked **PROPOSED** are in `20261122120000_phase2_rls_hardening.sql` and have **not** been applied.

Legend:
- Self = authenticated owner.
- Staff = moderator/admin.
- Aashraya = aashraya_coordinator/admin.
- Sahayi = sahayi_coordinator/admin.
- Public = anon + authenticated where explicitly granted.
- WITH CHECK describes row values permitted on INSERT/UPDATE.
- Current production policies remain the baseline until the proposed migration is approved/applied.

| Table | SELECT / USING | INSERT | INSERT WITH CHECK | UPDATE | UPDATE WITH CHECK | DELETE |
|---|---|---|---|---|---|---|
| announcements | Public approved; Self; Staff | **PROPOSED:** Staff only | Staff | **PROPOSED:** Staff only | Staff | Staff |
| audit_log | Admin | — | — | — | — | — |
| blood_requests | Self; Aashraya/Admin | Self; Aashraya/Admin | Self; Aashraya/Admin | Self; Aashraya/Admin | **PROPOSED:** owner may only cancel; staff unrestricted | **PROPOSED:** no authenticated non-staff DELETE |
| bookmarks | Self | Self | Self | Self | Self | Self |
| departments | **Public — USING(true)** | — | — | — | — | — |
| donation_camps | Public approved; Aashraya/Admin | Aashraya/Admin | Aashraya/Admin | Aashraya/Admin | Aashraya/Admin | Aashraya/Admin |
| donor_contact_details | Self; Aashraya/Admin only when donor consent=true | Self | Self | Self | Self | Self |
| donor_matches | Aashraya/Admin | Aashraya/Admin | Aashraya/Admin | Aashraya/Admin | Aashraya/Admin | Aashraya/Admin |
| donors | Self | Self | Self | Self | Self | Self |
| event_registrations | Self | Self | Self | Self | Self | Self |
| events | Public approved; Staff | **PROPOSED:** Staff only | Staff | **PROPOSED:** Staff only | Staff | Staff |
| grievance_updates | Grievance owner; Staff | Staff | Staff | Staff | Staff | Staff |
| grievances | Owner; Staff | Owner; Staff | Owner/Staff | Staff | Staff | **PROPOSED:** no owner DELETE; owner cancellation via UPDATE |
| helpdesk_entries | Public approved; Self; Staff | Self/Staff | **PROPOSED:** Self requires status=pending | Self/Staff | **PROPOSED:** non-staff cannot change owner/status | Staff |
| interventions | Owner/coordinator; Staff | Coordinator/Staff | Coordinator/Staff | Coordinator/Staff | Coordinator/Staff | Coordinator/Staff |
| issues | **PROPOSED:** public_issues view only; Self; Staff | Self/Staff | **PROPOSED:** Self requires owner_id=auth.uid() and status=pending | Self/Staff | **PROPOSED:** non-staff cannot change owner/status | Staff |
| leaderboard | **Public — USING(true)** | — | — | — | — | — |
| leaderboard_sessions | SELECT policy false | — | — | — | — | — |
| notifications | Self | Self | Self | Self | Self | Self |
| opportunities | Public approved; Self; Staff | Self/Staff | **PROPOSED:** Self requires status=pending and own owner_id | Self/Staff | **PROPOSED:** non-staff cannot change owner/status | Staff |
| profiles | Self | Self | Self | Self | Self | Self |
| programmes | **Public — USING(true)** | — | — | — | — | — |
| resource_files | Self | Self | Self | Self | Self | Self |
| resources | Public approved; Self; Staff | Self/Staff | **PROPOSED:** Self requires status=pending and own owner_id | Self/Staff | **PROPOSED:** non-staff cannot change owner/status | Staff |
| scribe_assignments | Request/volunteer owner; Sahayi/Admin | Sahayi/Admin | Sahayi/Admin | Sahayi/Admin | Sahayi/Admin | Sahayi/Admin |
| scribe_requests | Self; Sahayi/Admin | Self; Sahayi/Admin | Self; Sahayi/Admin | Self; Sahayi/Admin | Self; Sahayi/Admin | Self; Sahayi/Admin |
| scribe_volunteers | Self; Sahayi/Admin | Self; Sahayi/Admin | Self; Sahayi/Admin | Self; Sahayi/Admin | Self; Sahayi/Admin | Self; Sahayi/Admin |
| site_settings | Admin | Admin | Admin | Admin | Admin | Admin |
| tickets | Self; Staff | Self/Staff | Self owner | Self/Staff | **PROPOSED:** non-staff cannot change owner | Staff |
| user_roles | Self read; Admin | Admin | Admin | Admin | Admin | Admin |

## High-risk findings and proposed disposition

### 1. Student self-approval
The baseline owner policies used `FOR ALL` with only `owner_id=auth.uid()`, which did not constrain moderation status. The proposed migration removes owner write access from announcements/events and constrains student-created helpdesk/issues/opportunities/resources to `status='pending'`. A BEFORE UPDATE trigger prevents non-staff owner/status changes.

### 2. Anonymous issue exposure
The baseline public issue policy is removed. Anonymous/public access is through `public.public_issues`, which contains only `id, category, title, description, created_at` and deliberately excludes `owner_id`.

### 3. Donor matching
The production `donors` table currently has no area column and is self-only. The proposed migration adds nullable `donors.area` and a SECURITY DEFINER coordinator/admin RPC `list_donor_matches(blood_group, area)` returning only donor id, blood group, area, availability and consent. Contact data remains in `donor_contact_details` behind consent.

### 4. Leaderboard
Current columns:
- `leaderboard.id`
- `run_id`
- `player_name`
- `score`
- `distance_meters`
- `blockades`
- `elapsed_seconds`
- `created_at`

`player_name` is personal data when it identifies a person; the remaining gameplay/technical fields are not normally direct identifiers. `leaderboard_sessions` contains `id, ip_hash, started_at, expires_at, submitted_at`; `ip_hash` is derived network information and should be treated as personal data. Recommendation: **drop the unconditional public leaderboard policy unless the product explicitly accepts public player names.** If kept, consider a public view with a pseudonym instead of raw player_name. No change is made by the hardening migration.

### 5. Hard deletes
The proposed migration removes authenticated DELETE from blood requests and provides cancellation via status update. Grievance owners already have no DELETE policy; the proposed migration adds explicit owner cancellation through UPDATE. Staff retention/deletion rules remain separate.

## Explicit USING(true) policies in current production

1. `departments_public_read`
2. `programmes_public_read`
3. `leaderboard_public_read`

These are the only unconditional public-read policies identified in the production snapshot.