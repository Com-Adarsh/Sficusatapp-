-- DEV/PRODUCTION-GUARDED. Review target before execution.
do $$ begin
  if current_setting('app.settings.project_ref', true) = 'bdeuecrwqrnlwhxwbpmi' then
    raise exception 'REFUSED: production Supabase project ref';
  end if;
end $$;

create or replace function public.set_updated_at() returns trigger
language plpgsql set search_path=''
as $$ begin new.updated_at=now(); return new; end $$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(nullif(new.raw_user_meta_data ->> 'full_name',''), split_part(new.email,'@',1), 'Student'))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role)
  values (new.id, 'student'::public.user_role)
  on conflict (user_id, role) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

drop view if exists public.public_issues;
create view public.public_issues with (security_barrier=true, security_invoker=true) as
select id,category,title,description,created_at
from public.issues
where status='approved' and anonymous=true;
grant select on public.public_issues to anon,authenticated;

create policy issues_public_approved on public.issues
for select to anon,authenticated using (status='approved' and anonymous=true);

create policy leaderboard_public_read on public.leaderboard
for select to anon,authenticated using (true);

create policy leaderboard_sessions_service_read on public.leaderboard_sessions
for select to authenticated using (false);

create index if not exists announcements_owner_id_idx on public.announcements(owner_id);
create index if not exists audit_log_actor_id_idx on public.audit_log(actor_id);
create index if not exists blood_requests_owner_id_idx on public.blood_requests(owner_id);
create index if not exists bookmarks_resource_id_idx on public.bookmarks(resource_id);
create index if not exists bookmarks_opportunity_id_idx on public.bookmarks(opportunity_id);
create index if not exists donation_camps_owner_id_idx on public.donation_camps(owner_id);
create index if not exists donor_matches_coordinator_id_idx on public.donor_matches(coordinator_id);
create index if not exists donor_matches_donor_id_idx on public.donor_matches(donor_id);
create index if not exists event_registrations_event_id_idx on public.event_registrations(event_id);
create index if not exists events_owner_id_idx on public.events(owner_id);
create index if not exists grievance_updates_author_id_idx on public.grievance_updates(author_id);
create index if not exists grievance_updates_grievance_id_idx on public.grievance_updates(grievance_id);
create index if not exists grievances_owner_id_idx on public.grievances(owner_id);
create index if not exists helpdesk_entries_owner_id_idx on public.helpdesk_entries(owner_id);
create index if not exists interventions_coordinator_id_idx on public.interventions(coordinator_id);
create index if not exists interventions_issue_id_idx on public.interventions(issue_id);
create index if not exists interventions_owner_id_idx on public.interventions(owner_id);
create index if not exists issues_owner_id_idx on public.issues(owner_id);
create index if not exists notifications_owner_id_idx on public.notifications(owner_id);
create index if not exists opportunities_owner_id_idx on public.opportunities(owner_id);
create index if not exists programmes_department_id_idx on public.programmes(department_id);
create index if not exists resource_files_owner_id_idx on public.resource_files(owner_id);
create index if not exists resource_files_resource_id_idx on public.resource_files(resource_id);
create index if not exists resources_department_id_idx on public.resources(department_id);
create index if not exists resources_owner_id_idx on public.resources(owner_id);
create index if not exists resources_programme_id_idx on public.resources(programme_id);
create index if not exists scribe_assignments_coordinator_id_idx on public.scribe_assignments(coordinator_id);
create index if not exists scribe_assignments_volunteer_id_idx on public.scribe_assignments(volunteer_id);
create index if not exists scribe_requests_department_id_idx on public.scribe_requests(department_id);
create index if not exists scribe_requests_owner_id_idx on public.scribe_requests(owner_id);
create index if not exists scribe_requests_programme_id_idx on public.scribe_requests(programme_id);
create index if not exists scribe_volunteers_department_id_idx on public.scribe_volunteers(department_id);
create index if not exists scribe_volunteers_owner_id_idx on public.scribe_volunteers(owner_id);
create index if not exists scribe_volunteers_programme_id_idx on public.scribe_volunteers(programme_id);
create index if not exists site_settings_updated_by_idx on public.site_settings(updated_by);
create index if not exists tickets_owner_id_idx on public.tickets(owner_id);
