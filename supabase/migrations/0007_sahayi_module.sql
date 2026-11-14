-- Phase 4: Sahayi (SFI CUSAT Scribe Cell) module
-- Keeps accessibility data private and scopes coordinator access to the Sahayi initiative.

create index if not exists scribe_volunteers_status_idx on public.scribe_volunteers(status);
create index if not exists scribe_assignments_status_idx on public.scribe_assignments(status, created_at desc);

-- Coordinator-scoped access: initiative must be Sahayi.
create policy "Sahayi coordinators read scribe requests"
on public.scribe_requests for select to authenticated
using (
  exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name = 'initiative_coordinator'
      and ur.initiative = 'sahayi'
  )
);

create policy "Sahayi coordinators update scribe requests"
on public.scribe_requests for update to authenticated
using (
  exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name in ('initiative_coordinator','moderator','super_admin')
      and (r.name <> 'initiative_coordinator' or ur.initiative = 'sahayi')
  )
)
with check (
  exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name in ('initiative_coordinator','moderator','super_admin')
      and (r.name <> 'initiative_coordinator' or ur.initiative = 'sahayi')
  )
);

create policy "Sahayi coordinators read volunteers"
on public.scribe_volunteers for select to authenticated
using (
  (select auth.uid()) = user_id
  or exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name in ('moderator','super_admin')
  )
  or exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name = 'initiative_coordinator'
      and ur.initiative = 'sahayi'
  )
);

create policy "Sahayi coordinators update volunteers"
on public.scribe_volunteers for update to authenticated
using (
  exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name in ('moderator','super_admin')
  )
  or exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name = 'initiative_coordinator'
      and ur.initiative = 'sahayi'
  )
)
with check (
  exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name in ('moderator','super_admin')
  )
  or exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name = 'initiative_coordinator'
      and ur.initiative = 'sahayi'
  )
);

create policy "Sahayi coordinators create assignments"
on public.scribe_assignments for insert to authenticated
with check (
  exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name in ('moderator','super_admin')
  )
  or exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name = 'initiative_coordinator'
      and ur.initiative = 'sahayi'
  )
);

create policy "Sahayi assignment parties update"
on public.scribe_assignments for update to authenticated
using (
  (select auth.uid()) = coordinator_id
  or exists (
    select 1 from public.scribe_volunteers v
    where v.id = volunteer_id and v.user_id = (select auth.uid())
  )
  or exists (
    select 1 from public.scribe_requests r
    where r.id = request_id and r.requester_id = (select auth.uid())
  )
  or exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name in ('moderator','super_admin')
  )
  or exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name = 'initiative_coordinator'
      and ur.initiative = 'sahayi'
  )
)
with check (
  (select auth.uid()) = coordinator_id
  or exists (
    select 1 from public.scribe_volunteers v
    where v.id = volunteer_id and v.user_id = (select auth.uid())
  )
  or exists (
    select 1 from public.scribe_requests r
    where r.id = request_id and r.requester_id = (select auth.uid())
  )
  or exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name in ('moderator','super_admin')
  )
  or exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name = 'initiative_coordinator'
      and ur.initiative = 'sahayi'
  )
);

create table if not exists public.scribe_certificates (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null unique references public.scribe_assignments(id) on delete cascade,
  recipient_id uuid not null references auth.users(id) on delete cascade,
  certificate_code text not null unique,
  role_label text not null default 'Sahayi Scribe Volunteer',
  issued_at timestamptz not null default now()
);
alter table public.scribe_certificates enable row level security;

create policy "Users read own scribe certificates"
on public.scribe_certificates for select to authenticated
using ((select auth.uid()) = recipient_id);

create policy "Public certificate verification"
on public.scribe_certificates for select to anon,authenticated
using (true);

create policy "Sahayi coordinators issue certificates"
on public.scribe_certificates for insert to authenticated
with check (
  exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name in ('moderator','super_admin')
  )
  or exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name = 'initiative_coordinator'
      and ur.initiative = 'sahayi'
  )
);

create index if not exists scribe_certificates_code_idx on public.scribe_certificates(certificate_code);
