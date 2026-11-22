-- Postgres-only CI shim. The Supabase Postgres image ships a pre-seeded local
-- application schema, so CI explicitly clears public before applying this repo's
-- migrations. auth.users and auth.uid() come from the Supabase Postgres image.
-- Production auth.users columns/defaults/constraints were inspected read-only
-- on 2026-11-22; trigger tests use only columns common to production and CI.
create extension if not exists pgcrypto;
create extension if not exists pgtap;

drop schema public cascade;
create schema public;
grant all on schema public to postgres;
grant usage on schema public to anon, authenticated, service_role;

do $$
begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin; end if;
end $$;

grant usage on schema auth, storage to anon, authenticated, service_role;

-- Pre-Phase-1 production tables retained in the production baseline.
create table if not exists public.leaderboard_sessions (
  id uuid primary key,
  ip_hash text,
  started_at timestamptz,
  expires_at timestamptz,
  submitted_at timestamptz
);
alter table public.leaderboard_sessions enable row level security;
create table if not exists public.leaderboard (
  id bigint generated always as identity primary key,
  run_id uuid unique references public.leaderboard_sessions(id),
  player_name text check (char_length(player_name) between 1 and 18),
  score integer check (score between 0 and 2000000),
  distance_meters integer check (distance_meters between 0 and 25000),
  blockades integer check (blockades between 0 and 5040),
  elapsed_seconds integer check (elapsed_seconds between 1 and 3600),
  created_at timestamptz default now()
);
alter table public.leaderboard enable row level security;
