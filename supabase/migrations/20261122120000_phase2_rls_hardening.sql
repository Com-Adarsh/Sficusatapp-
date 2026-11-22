-- Phase 2 RLS hardening. NOT APPLIED TO PRODUCTION.
-- Migrations first, code merge second.

-- Announcements/events are moderation-owned.
drop policy if exists announcements_owner on public.announcements;
drop policy if exists events_owner on public.events;

create policy announcements_moderator_insert_update on public.announcements
for all to authenticated
using (private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role))
with check (private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role));

create policy events_moderator_insert_update on public.events
for all to authenticated
using (private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role))
with check (private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role));

-- Student-contributed moderation queues: owners may create/edit only their own pending rows.
-- The moderation trigger below re-queues approved content when an owner edits it.
drop policy if exists helpdesk_owner on public.helpdesk_entries;
create policy helpdesk_owner on public.helpdesk_entries
for all to authenticated
using (owner_id=auth.uid() or private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role))
with check (
  (private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role))
  or (owner_id=auth.uid() and status='pending')
);

drop policy if exists issues_owner on public.issues;
create policy issues_owner on public.issues
for all to authenticated
using (owner_id=auth.uid() or private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role))
with check (
  (private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role))
  or (owner_id=auth.uid() and status='pending')
);

drop policy if exists opportunities_owner on public.opportunities;
create policy opportunities_owner on public.opportunities
for all to authenticated
using (owner_id=auth.uid() or private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role))
with check (
  (private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role))
  or (owner_id=auth.uid() and status='pending')
);

drop policy if exists resources_owner on public.resources;
create policy resources_owner on public.resources
for all to authenticated
using (owner_id=auth.uid() or private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role))
with check (
  (private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role))
  or (owner_id=auth.uid() and status='pending')
);

drop policy if exists tickets_owner on public.tickets;
create policy tickets_owner on public.tickets
for all to authenticated
using (owner_id=auth.uid() or private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role))
with check (
  (private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role))
  or (owner_id=auth.uid())
);

-- One BEFORE UPDATE trigger protects ownership and all moderation/verification fields.
-- Protected fields: owner_id; status; verified; reviewed_by; reviewed_at; published_at;
-- rejection/rejection_reason/rejected_at; moderation_status/moderated_by/moderated_at;
-- attended; checked_in; check_in_at; checkin_at.
-- Tables covered: resources, opportunities, helpdesk_entries, issues,
-- scribe_volunteers, scribe_requests, event_registrations, donors, profiles.
-- Profiles has no moderation field in the current schema; its id is already protected by RLS.
-- Event registrations currently has no attendance/check-in field; the JSONB checks below
-- automatically cover those fields if they are added later without a new trigger.
create or replace function private.prevent_owner_moderation_change()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare
  old_row jsonb := to_jsonb(old);
  new_row jsonb := to_jsonb(new);
  protected_column text;
begin
  -- Trusted SECURITY DEFINER/service-role paths may reconcile protected rows.
  if current_user in ('postgres','service_role') then
    return new;
  end if;

  if private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role) then
    return new;
  end if;

  if new_row ? 'owner_id' and new_row->'owner_id' is distinct from old_row->'owner_id' then
    raise exception 'owner_id may only be changed by staff';
  end if;

  foreach protected_column in array array[
    'verified','reviewed_by','reviewed_at','published_at',
    'rejection','rejection_reason','rejected_at',
    'moderation_status','moderated_by','moderated_at',
    'attended','checked_in','check_in_at','checkin_at'
  ] loop
    if new_row ? protected_column
       and new_row->protected_column is distinct from old_row->protected_column then
      raise exception '% may only be changed by staff', protected_column;
    end if;
  end loop;

  -- Approved student content is never edited in place: the edit is re-queued.
  if tg_table_name in ('resources','opportunities','helpdesk_entries','issues')
     and new_row ? 'status'
     and old_row->>'status' = 'approved'
     and new_row->>'status' <> 'pending' then
    new := jsonb_populate_record(new, jsonb_build_object('status','pending'));
    if new_row ? 'published_at' then
      new := jsonb_populate_record(new, jsonb_build_object('published_at',null));
    end if;
    new_row := to_jsonb(new);
  end if;

  -- Status is protected everywhere it exists, except an approved content edit
  -- which is intentionally re-queued to pending above.
  if new_row ? 'status' and new_row->'status' is distinct from old_row->'status' then
    if tg_table_name in ('resources','opportunities','helpdesk_entries','issues')
       and old_row->>'status' = 'approved'
       and new_row->>'status' = 'pending' then
      null;
    else
      raise exception 'moderation status may only be changed by staff';
    end if;
  end if;

  return new;
end;
$$;

-- Grievance confidentiality: moderators are not grievance officers.
alter type public.user_role add value if not exists 'grievance_officer';

drop policy if exists grievances_staff on public.grievances;
drop policy if exists grievances_owner on public.grievances;
drop policy if exists grievance_updates_owner on public.grievance_updates;
drop policy if exists interventions_owner on public.interventions;
drop policy if exists grievance_updates_staff on public.grievance_updates;
drop policy if exists interventions_staff on public.interventions;
drop policy if exists tickets_owner on public.tickets;

-- Grievance data is confidential and is written only by grievance officers/admins.
-- Student submission and token-based cancellation/status lookup use the server API with
-- the service-role client; no direct student/moderator DML policy exists.
create policy grievances_officer_read on public.grievances
for select to authenticated
using (private.has_role('grievance_officer'::public.user_role) or private.has_role('admin'::public.user_role));

create policy grievances_officer_write on public.grievances
for all to authenticated
using (private.has_role('grievance_officer'::public.user_role) or private.has_role('admin'::public.user_role))
with check (private.has_role('grievance_officer'::public.user_role) or private.has_role('admin'::public.user_role));

create policy grievance_updates_officer_read on public.grievance_updates
for select to authenticated
using (private.has_role('grievance_officer'::public.user_role) or private.has_role('admin'::public.user_role));

create policy grievance_updates_officer_write on public.grievance_updates
for all to authenticated
using (private.has_role('grievance_officer'::public.user_role) or private.has_role('admin'::public.user_role))
with check (private.has_role('grievance_officer'::public.user_role) or private.has_role('admin'::public.user_role));

create policy interventions_officer_read on public.interventions
for select to authenticated
using (private.has_role('grievance_officer'::public.user_role) or private.has_role('admin'::public.user_role));

create policy interventions_officer_write on public.interventions
for all to authenticated
using (private.has_role('grievance_officer'::public.user_role) or private.has_role('admin'::public.user_role))
with check (private.has_role('grievance_officer'::public.user_role) or private.has_role('admin'::public.user_role));

create policy tickets_officer_read on public.tickets
for select to authenticated
using (private.has_role('grievance_officer'::public.user_role) or private.has_role('admin'::public.user_role));

create policy tickets_officer_write on public.tickets
for all to authenticated
using (private.has_role('grievance_officer'::public.user_role) or private.has_role('admin'::public.user_role))
with check (private.has_role('grievance_officer'::public.user_role) or private.has_role('admin'::public.user_role));

-- Public/non-sensitive settings are opt-in; all other settings remain admin-only.
alter table public.site_settings
  add column if not exists is_public boolean not null default false;

drop policy if exists site_settings_public_read on public.site_settings;
create policy site_settings_public_read on public.site_settings
for select to anon, authenticated
using (is_public=true);

-- INSERT protection: non-staff users cannot publish, verify, resolve, attend/check-in,
-- review, moderate, reject, or self-assign protected workflow fields.
create or replace function private.prevent_owner_moderation_insert()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
declare
  row_data jsonb := to_jsonb(new);
  col text;
  forced jsonb := '{}'::jsonb;
begin
  if private.has_role('moderator'::public.user_role)
     or private.has_role('admin'::public.user_role)
     or private.has_role('grievance_officer'::public.user_role) then
    return new;
  end if;

  foreach col in array array[
    'verified','attended','checked_in','check_in_at','checkin_at',
    'reviewed_by','reviewed_at','published_at',
    'rejection','rejection_reason','rejected_at',
    'moderation_status','moderated_by','moderated_at',
    'assignee_id','assigned_to','reviewer_id'
  ] loop
    if row_data ? col then
      forced := forced || jsonb_build_object(col, null);
    end if;
  end loop;

  if tg_table_name = 'profiles'
     and row_data ? 'id'
     and row_data->>'id' is distinct from auth.uid()::text then
    raise exception 'profile id may only be set to the current user';
  end if;

  if row_data ? 'status' then
    if tg_table_name in ('resources','opportunities','helpdesk_entries','issues',
                         'scribe_volunteers','scribe_requests') then
      forced := forced || jsonb_build_object('status','pending');
    elsif tg_table_name = 'blood_requests' then
      forced := forced || jsonb_build_object('status','pending');
    elsif tg_table_name in ('grievances','tickets') then
      forced := forced || jsonb_build_object('status','open');
    end if;
  end if;

  return jsonb_populate_record(new, forced);
end;
$$;

-- Attach INSERT protection to every self-insert workflow requested by the security review.
drop trigger if exists prevent_owner_moderation_insert on public.scribe_volunteers;
create trigger prevent_owner_moderation_insert before insert on public.scribe_volunteers
for each row execute function private.prevent_owner_moderation_insert();

drop trigger if exists prevent_owner_moderation_insert on public.scribe_requests;
create trigger prevent_owner_moderation_insert before insert on public.scribe_requests
for each row execute function private.prevent_owner_moderation_insert();

drop trigger if exists prevent_owner_moderation_insert on public.event_registrations;
create trigger prevent_owner_moderation_insert before insert on public.event_registrations
for each row execute function private.prevent_owner_moderation_insert();

drop trigger if exists prevent_owner_moderation_insert on public.donors;
create trigger prevent_owner_moderation_insert before insert on public.donors
for each row execute function private.prevent_owner_moderation_insert();

drop trigger if exists prevent_owner_moderation_insert on public.blood_requests;
create trigger prevent_owner_moderation_insert before insert on public.blood_requests
for each row execute function private.prevent_owner_moderation_insert();

drop trigger if exists prevent_owner_moderation_insert on public.grievances;
create trigger prevent_owner_moderation_insert before insert on public.grievances
for each row execute function private.prevent_owner_moderation_insert();

drop trigger if exists prevent_owner_moderation_insert on public.tickets;
create trigger prevent_owner_moderation_insert before insert on public.tickets
for each row execute function private.prevent_owner_moderation_insert();

drop trigger if exists prevent_owner_moderation_insert on public.resources;
create trigger prevent_owner_moderation_insert before insert on public.resources
for each row execute function private.prevent_owner_moderation_insert();

drop trigger if exists prevent_owner_moderation_insert on public.opportunities;
create trigger prevent_owner_moderation_insert before insert on public.opportunities
for each row execute function private.prevent_owner_moderation_insert();

drop trigger if exists prevent_owner_moderation_insert on public.helpdesk_entries;
create trigger prevent_owner_moderation_insert before insert on public.helpdesk_entries
for each row execute function private.prevent_owner_moderation_insert();

drop trigger if exists prevent_owner_moderation_insert on public.issues;
create trigger prevent_owner_moderation_insert before insert on public.issues
for each row execute function private.prevent_owner_moderation_insert();

drop trigger if exists prevent_owner_moderation_insert on public.profiles;
create trigger prevent_owner_moderation_insert before insert on public.profiles
for each row execute function private.prevent_owner_moderation_insert();

-- Content tables.
drop trigger if exists prevent_owner_moderation_change on public.helpdesk_entries;
create trigger prevent_owner_moderation_change before update on public.helpdesk_entries
for each row execute function private.prevent_owner_moderation_change();

drop trigger if exists prevent_owner_moderation_change on public.issues;
create trigger prevent_owner_moderation_change before update on public.issues
for each row execute function private.prevent_owner_moderation_change();

drop trigger if exists prevent_owner_moderation_change on public.opportunities;
create trigger prevent_owner_moderation_change before update on public.opportunities
for each row execute function private.prevent_owner_moderation_change();

drop trigger if exists prevent_owner_moderation_change on public.resources;
create trigger prevent_owner_moderation_change before update on public.resources
for each row execute function private.prevent_owner_moderation_change();

-- Self-service sensitive workflows.
drop trigger if exists prevent_owner_moderation_change on public.scribe_volunteers;
create trigger prevent_owner_moderation_change before update on public.scribe_volunteers
for each row execute function private.prevent_owner_moderation_change();

drop trigger if exists prevent_owner_moderation_change on public.scribe_requests;
create trigger prevent_owner_moderation_change before update on public.scribe_requests
for each row execute function private.prevent_owner_moderation_change();

drop trigger if exists prevent_owner_moderation_change on public.event_registrations;
create trigger prevent_owner_moderation_change before update on public.event_registrations
for each row execute function private.prevent_owner_moderation_change();

drop trigger if exists prevent_owner_moderation_change on public.donors;
create trigger prevent_owner_moderation_change before update on public.donors
for each row execute function private.prevent_owner_moderation_change();

drop trigger if exists prevent_owner_moderation_change on public.profiles;
create trigger prevent_owner_moderation_change before update on public.profiles
for each row execute function private.prevent_owner_moderation_change();

-- A file change invalidates publication of the parent resource.
create or replace function private.requeue_resource_after_file_change()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  if not (private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role)) then
    update public.resources
       set status='pending',
           published_at=null
     where id=coalesce(new.resource_id,old.resource_id)
       and owner_id=(select auth.uid())
       and status='approved';
  end if;
  return coalesce(new,old);
end;
$$;

drop trigger if exists requeue_resource_after_file_change on public.resource_files;
create trigger requeue_resource_after_file_change
after insert or update or delete on public.resource_files
for each row execute function private.requeue_resource_after_file_change();

-- Public issues are exposed only through the author-free security-barrier view.
drop policy if exists issues_public_approved on public.issues;
revoke select on public.issues from anon;
grant select on public.public_issues to anon, authenticated;

-- Limited donor matching RPC: no contact fields.
alter table public.donors add column if not exists area text;
create or replace function public.list_donor_matches(p_blood_group text, p_area text default null)
returns table(id uuid,blood_group text,area text,available boolean,consent boolean)
language sql
security definer
set search_path=''
as $$
  select d.id, d.blood_group, d.area, d.available, d.consent
  from public.donors d
  where (private.has_role('aashraya_coordinator'::public.user_role) or private.has_role('admin'::public.user_role))
    and d.blood_group = p_blood_group
    and (p_area is null or d.area = p_area)
    and d.available = true;
$$;
revoke all on function public.list_donor_matches(text,text) from public;
revoke all on function public.list_donor_matches(text,text) from anon;
grant execute on function public.list_donor_matches(text,text) to authenticated;

-- Leaderboard remains locked. No public read policy is created.
drop policy if exists leaderboard_public_read on public.leaderboard;
drop policy if exists leaderboard_sessions_public_read on public.leaderboard_sessions;
create policy leaderboard_deny_anon on public.leaderboard
for all to anon using (false) with check (false);
create policy leaderboard_deny_authenticated on public.leaderboard
for all to authenticated using (false) with check (false);
create policy leaderboard_sessions_deny_anon on public.leaderboard_sessions
for all to anon using (false) with check (false);
create policy leaderboard_sessions_deny_authenticated on public.leaderboard_sessions
for all to authenticated using (false) with check (false);

-- Non-staff blood-request deletion becomes cancellation.
drop policy if exists blood_requests_owner on public.blood_requests;
drop policy if exists blood_requests_owner_select on public.blood_requests;
drop policy if exists blood_requests_owner_insert on public.blood_requests;
create policy blood_requests_owner_select on public.blood_requests
for select to authenticated
using (owner_id=auth.uid());
create policy blood_requests_owner_insert on public.blood_requests
for insert to authenticated
with check (owner_id=auth.uid());

drop policy if exists blood_requests_owner_cancel on public.blood_requests;
create policy blood_requests_owner_cancel on public.blood_requests
for update to authenticated
using (owner_id=auth.uid())
with check (owner_id=auth.uid() and status='cancelled');

-- Grievance owner cancellation is routed through the token-based server API.
-- This avoids the PostgreSQL UPDATE/SELECT RLS interaction: an UPDATE target is
-- first filtered by the table's SELECT visibility, so a confidential owner cannot
-- reliably cancel a row after owner SELECT is removed.
revoke delete on public.blood_requests from authenticated;
