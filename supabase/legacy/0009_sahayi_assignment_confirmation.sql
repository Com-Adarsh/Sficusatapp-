-- Phase 4: dual confirmation for Sahayi assignments.
alter table public.scribe_assignments
  add column if not exists requester_confirmed_at timestamptz,
  add column if not exists volunteer_confirmed_at timestamptz;

alter table public.scribe_assignments
  drop constraint if exists scribe_assignments_status_check;

alter table public.scribe_assignments
  add constraint scribe_assignments_status_check
  check (status in ('proposed','volunteer_confirmed','requester_confirmed','confirmed','declined','completed','cancelled'));
