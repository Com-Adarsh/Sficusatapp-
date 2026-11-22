# Production RLS Matrix — current baseline + proposed hardening

Captured from production read-only on 2026-11-22. The hardening rows marked **PROPOSED** are in `20261122120000_phase2_rls_hardening.sql` and have **not** been applied.

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
| donors | Self | Self | **PROPOSED:** protected fields cleared on insert | Self; **owner_id protected** | **PROPOSED:** protected moderation fields cannot be self-changed | Self |
| event_registrations | Self | Self | **PROPOSED:** protected attendance fields cleared if present | Self; protected fields | **PROPOSED:** protected fields cannot be self-changed | Self |
| events | Public approved; Staff | **PROPOSED:** Staff only | Staff | **PROPOSED:** Staff only | Staff | Staff |
| grievance_updates | **PROPOSED:** Grievance officer/admin only | Staff workflow | **PROPOSED:** protected fields | Staff workflow | Staff workflow | Staff workflow |
| grievances | **PROPOSED:** Grievance officer/admin only | Self | **PROPOSED:** status forced open; protected fields cleared | **PROPOSED:** owner cancellation; officer/admin moderation | **PROPOSED:** owner may only set status=cancelled | Staff/officer |
| helpdesk_entries | Public approved; Self; Staff | Self/Staff | **PROPOSED:** Self requires status=pending | Self/Staff | **PROPOSED:** approved edits requeue to pending; protected fields cannot be self-changed | Staff |
| interventions | **PROPOSED:** Grievance officer/admin only | Coordinator/Staff | Coordinator/Staff | Coordinator/Staff | Coordinator/Staff | Coordinator/Staff |
| issues | **PROPOSED:** public_issues view only; Self; Staff | Self/Staff | **PROPOSED:** Self requires owner_id=auth.uid() and status=pending | Self/Staff | **PROPOSED:** approved edits requeue to pending; protected fields cannot be self-changed | Staff |
| leaderboard | **PROPOSED: explicit deny for anon/authenticated** | — | — | — | — | — |
| leaderboard_sessions | **PROPOSED: explicit deny for anon/authenticated** | — | — | — | — | — |
| notifications | Self | Self | Self | Self | Self | Self |
| opportunities | Public approved; Self; Staff | Self/Staff | **PROPOSED:** Self requires status=pending and own owner_id | Self/Staff | **PROPOSED:** approved edits requeue to pending; protected fields cannot be self-changed | Staff |
| profiles | Self | Self | Self | Self; **id protected by owner policy** | **PROPOSED:** id cannot be changed | Self |
| programmes | **Public — USING(true)** | — | — | — | — | — |
| resource_files | Self | Self | Self | Self; **file changes requeue parent resource** | Self | Self |
| resources | Public approved; Self; Staff | Self/Staff | **PROPOSED:** Self requires status=pending and own owner_id | Self/Staff | **PROPOSED:** approved edits requeue to pending; protected fields cannot be self-changed | Staff |
| scribe_assignments | Request/volunteer owner; Sahayi/Admin | Sahayi/Admin | Sahayi/Admin | Sahayi/Admin | Sahayi/Admin | Sahayi/Admin |
| scribe_requests | Self; Sahayi/Admin | Self; Sahayi/Admin | Self; Sahayi/Admin | Self; Sahayi/Admin; **status protected** | **PROPOSED:** non-staff cannot change status | Self; Sahayi/Admin |
| scribe_volunteers | Self; Sahayi/Admin | Self; Sahayi/Admin | Self; Sahayi/Admin | Self; Sahayi/Admin; **status protected** | **PROPOSED:** non-staff cannot change status | Self; Sahayi/Admin |
| site_settings | **PROPOSED:** anon/authenticated where is_public=true; Admin otherwise | Admin | Admin | Admin | Admin | Admin |
| tickets | **PROPOSED:** Grievance officer/admin only | Self | **PROPOSED:** status forced open; protected fields cleared | Self; officer/admin | **PROPOSED:** protected fields cannot be self-changed | Staff |
| user_roles | Self read; Admin | Admin | Admin | Admin | Admin | Admin |

## High-risk findings and proposed disposition

### 1. Student self-approval
The baseline owner policies used FOR ALL with only owner_id=auth.uid(), which did not constrain moderation status. The proposed migration removes owner write access from announcements/events and constrains student-created helpdesk/issues/opportunities/resources to status=pending. A BEFORE UPDATE trigger protects ownership and protected moderation fields and automatically re-queues edits to approved content to pending.

### 2. Anonymous issue exposure
The baseline public issue policy is removed. Anonymous/public access is through public.public_issues, which contains only id, category, title, description, created_at and deliberately excludes owner_id.

### 3. Donor matching
The production donors table currently has no area column and is self-only. The proposed migration adds nullable donors.area and a SECURITY DEFINER coordinator/admin RPC list_donor_matches(blood_group, area) returning only donor id, blood group, area, availability and consent. Contact data remains in donor_contact_details behind consent. The RPC explicitly revokes EXECUTE from PUBLIC and anon, grants it to authenticated, checks coordinator/admin role inside the function, and uses search_path=''.

### 4. Leaderboard
Current columns:
- leaderboard.id
- run_id
- player_name
- score
- distance_meters
- blockades
- elapsed_seconds
- created_at

leaderboard_sessions contains id, ip_hash, started_at, expires_at, submitted_at. player_name can be personal data and ip_hash is derived network information. The original locked behavior is restored: the proposed migration drops the unconditional public-read policy and creates explicit deny policies for anon and authenticated on both tables. A repository search found no current code reference to either table, so no live anon-key feature has been demonstrated.

### 5. Protected self-updates
The proposed trigger covers resources, opportunities, helpdesk_entries, issues, scribe_volunteers, scribe_requests, event_registrations, donors and profiles. Protected fields are: owner_id, status, verified, reviewed_by, reviewed_at, published_at, rejection, rejection_reason, rejected_at, moderation_status, moderated_by, moderated_at, attended, checked_in, check_in_at, and checkin_at. The current production schema has status on scribe requests/volunteers; event registrations currently has no attendance field; profiles currently has no moderation field. JSONB-based checks cover future additions of those named fields without changing the trigger attachment.

### 6. File replacement after approval
resource_files self-writes remain allowed, but an insert/update/delete by a non-staff owner automatically sets the parent approved resource back to pending and clears published_at. This prevents a previously approved publication from silently changing underneath its approval record.

### 7. Hard deletes
The proposed migration removes authenticated DELETE from blood requests and provides cancellation via status update. Grievance owners already have no DELETE policy; the proposed migration adds explicit owner cancellation through UPDATE. Staff retention/deletion rules remain separate.

## Explicit USING(true) policies in current production

1. departments_public_read
2. programmes_public_read
3. leaderboard_public_read

These are the only unconditional public-read policies identified in the production snapshot. The hardening migration explicitly removes leaderboard_public_read; departments and programmes remain public.


## Grievance confidentiality

The proposed migration adds the grievance_officer role. Moderators are not granted SELECT on grievances, grievance_updates, interventions, or tickets. Owner-read policies on grievances, grievance_updates, and interventions are removed. Owners may still submit grievances and cancel them through the explicit owner-cancel UPDATE policy.

## Insert-side protection

A BEFORE INSERT trigger covers scribe_volunteers, scribe_requests, event_registrations, donors, blood_requests, grievances, tickets, resources, opportunities, helpdesk_entries, and issues. For non-staff users it clears reviewer/assignee/moderation fields and forces safe status defaults: pending for moderation/content/scribe/blood workflows and open for grievances/tickets. Future named verified, attended, checked-in, reviewer, rejection, or assignee columns are also cleared automatically.

## Public issues

Production public.public_issues is filtered to status='approved' and anonymous=true, exposes only id/category/title/description/created_at, and has no owner_id or author columns. Its reloptions are security_barrier=true and security_invoker=true. The proposed hardening keeps this as the public path and revokes direct anon SELECT on issues.

## Site settings

The proposed migration adds is_public boolean not null default false. A public SELECT policy exposes only is_public=true rows; all other settings remain admin-only. This supports non-sensitive public notices such as coordinator contact information and the 112 notice.

## Leaderboard

A read-only production Supabase Edge Functions check returned zero Edge Functions. Therefore no current Supabase Edge Function touches leaderboard or leaderboard_sessions. The proposed migration restores the locked baseline with explicit deny policies and removes leaderboard_public_read.
