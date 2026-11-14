-- Public certificate verification uses a separate non-sensitive projection.
drop view if exists public.scribe_certificate_verification;

create table if not exists public.scribe_certificate_public (
  certificate_code text primary key,
  role_label text not null,
  issued_at timestamptz not null
);
alter table public.scribe_certificate_public enable row level security;
create policy "Public certificate codes are verifiable"
on public.scribe_certificate_public for select to anon,authenticated using (true);
create policy "Sahayi coordinators publish certificate verification"
on public.scribe_certificate_public for insert to authenticated
with check (
  exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id=ur.role_id
    where ur.user_id=(select auth.uid())
      and r.name in ('moderator','super_admin')
  )
  or exists (
    select 1 from public.user_roles ur
    join public.roles r on r.id=ur.role_id
    where ur.user_id=(select auth.uid())
      and r.name='initiative_coordinator'
      and ur.initiative='sahayi'
  )
);
