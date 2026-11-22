-- Guarded advisor cleanup.
do $$ begin
  if current_setting('app.settings.project_ref', true) = 'bdeuecrwqrnlwhxwbpmi' then raise exception 'REFUSED: production Supabase project ref'; end if;
end $$;

create schema if not exists extensions;
alter extension pg_trgm set schema extensions;
alter extension unaccent set schema extensions;
alter extension vector set schema extensions;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop policy if exists interventions_owner on public.interventions;
create policy interventions_owner on public.interventions for select to authenticated
using ((owner_id=(select auth.uid())) or (coordinator_id=(select auth.uid())) or private.has_role('admin'::public.user_role) or private.has_role('moderator'::public.user_role));

drop policy if exists interventions_staff on public.interventions;
create policy interventions_staff on public.interventions for all to authenticated
using ((coordinator_id=(select auth.uid())) or private.has_role('admin'::public.user_role) or private.has_role('moderator'::public.user_role))
with check ((coordinator_id=(select auth.uid())) or private.has_role('admin'::public.user_role) or private.has_role('moderator'::public.user_role));

drop policy if exists grievance_updates_owner on public.grievance_updates;
create policy grievance_updates_owner on public.grievance_updates for select to authenticated
using (exists(select 1 from public.grievances g where g.id=grievance_id and (g.owner_id=(select auth.uid()) or private.has_role('admin'::public.user_role) or private.has_role('moderator'::public.user_role))));

drop policy if exists grievance_updates_staff on public.grievance_updates;
create policy grievance_updates_staff on public.grievance_updates for all to authenticated
using (private.has_role('admin'::public.user_role) or private.has_role('moderator'::public.user_role))
with check (private.has_role('admin'::public.user_role) or private.has_role('moderator'::public.user_role));

drop policy if exists scribe_assignment_owner on public.scribe_assignments;
create policy scribe_assignment_owner on public.scribe_assignments for select to authenticated
using (exists(select 1 from public.scribe_volunteers v where v.id=volunteer_id and v.owner_id=(select auth.uid()))
    or exists(select 1 from public.scribe_requests r where r.id=request_id and r.owner_id=(select auth.uid())));

drop policy if exists scribe_assignment_coordinator on public.scribe_assignments;
create policy scribe_assignment_coordinator on public.scribe_assignments for all to authenticated
using (private.has_role('sahayi_coordinator'::public.user_role) or private.has_role('admin'::public.user_role))
with check (private.has_role('sahayi_coordinator'::public.user_role) or private.has_role('admin'::public.user_role));
