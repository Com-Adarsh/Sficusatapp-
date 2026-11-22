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

-- For student-contributed moderation queues, owners may create only pending rows.
-- BEFORE UPDATE trigger below prevents owners from changing moderation/ownership fields.
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

create or replace function private.prevent_owner_moderation_change()
returns trigger
language plpgsql
security definer
set search_path=''
as $$
begin
  if not (private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role)) then
    if new.owner_id is distinct from old.owner_id then
      raise exception 'owner_id may only be changed by staff';
    end if;
    if tg_table_name in ('announcements','events','helpdesk_entries','issues','opportunities','resources')
       and new.status is distinct from old.status then
      raise exception 'moderation status may only be changed by staff';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_owner_moderation_change on public.helpdesk_entries;
create trigger prevent_owner_moderation_change before update on public.helpdesk_entries for each row execute function private.prevent_owner_moderation_change();
drop trigger if exists prevent_owner_moderation_change on public.issues;
create trigger prevent_owner_moderation_change before update on public.issues for each row execute function private.prevent_owner_moderation_change();
drop trigger if exists prevent_owner_moderation_change on public.opportunities;
create trigger prevent_owner_moderation_change before update on public.opportunities for each row execute function private.prevent_owner_moderation_change();
drop trigger if exists prevent_owner_moderation_change on public.resources;
create trigger prevent_owner_moderation_change before update on public.resources for each row execute function private.prevent_owner_moderation_change();

-- Public issues are exposed only through the author-free security-barrier view.
drop policy if exists issues_public_approved on public.issues;
revoke select on public.issues from anon;
grant select on public.public_issues to anon, authenticated;

-- Limited donor matching RPC: no contact fields.
create or replace function public.list_donor_matches(p_blood_group text, p_district text default null)
returns table(id uuid,blood_group text,district text,available boolean,consent boolean)
language sql
security definer
set search_path=''
as $$
  select d.id, d.blood_group, null::text as district, d.available, d.consent
  from public.donors d
  where (private.has_role('aashraya_coordinator'::public.user_role) or private.has_role('admin'::public.user_role))
    and d.blood_group = p_blood_group
    and d.available = true;
$$;
revoke all on function public.list_donor_matches(text,text) from public;
grant execute on function public.list_donor_matches(text,text) to authenticated;

-- Non-staff blood-request deletion becomes cancellation.
drop policy if exists blood_requests_owner on public.blood_requests;
create policy blood_requests_owner on public.blood_requests
for select, insert, update to authenticated
using (owner_id=auth.uid())
with check (owner_id=auth.uid());

create policy blood_requests_owner_cancel on public.blood_requests
for update to authenticated
using (owner_id=auth.uid())
with check (owner_id=auth.uid() and status='cancelled');

-- Grievance owners have no DELETE policy; add explicit cancellation update.
create policy grievances_owner_cancel on public.grievances
for update to authenticated
using (owner_id=auth.uid())
with check (owner_id=auth.uid() and status='cancelled');

-- Explicitly remove non-staff DELETE capability from blood requests.
revoke delete on public.blood_requests from authenticated;
