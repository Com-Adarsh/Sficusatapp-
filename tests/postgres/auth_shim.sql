-- Postgres-only CI shim.
-- Production auth.users columns/defaults/constraints were inspected read-only
-- from jwhyesglviptvklrclll on 2026-11-22 and reproduced here.
create extension if not exists pgcrypto;
create extension if not exists pgtap;

create schema if not exists auth;
create schema if not exists storage;

do $$
begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin; end if;
end $$;

create or replace function auth.uid()
returns uuid language sql stable
as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;

create or replace function auth.jwt()
returns jsonb language sql stable
as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb) $$;

create or replace function auth.role()
returns text language sql stable
as $$ select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), current_user::text) $$;

create table auth.users (
  instance_id uuid,
  id uuid not null primary key,
  aud varchar(255),
  role varchar(255),
  email varchar(255),
  encrypted_password varchar(255),
  email_confirmed_at timestamptz,
  invited_at timestamptz,
  confirmation_token varchar(255),
  confirmation_sent_at timestamptz,
  recovery_token varchar(255),
  recovery_sent_at timestamptz,
  email_change_token_new varchar(255),
  email_change varchar(255),
  email_change_sent_at timestamptz,
  last_sign_in_at timestamptz,
  raw_app_meta_data jsonb,
  raw_user_meta_data jsonb,
  is_super_admin boolean,
  created_at timestamptz,
  updated_at timestamptz,
  phone text default NULL::varchar,
  phone_confirmed_at timestamptz,
  phone_change text default ''::varchar,
  phone_change_token varchar(255) default ''::varchar,
  phone_change_sent_at timestamptz,
  confirmed_at timestamptz,
  email_change_token_current varchar(255) default ''::varchar,
  email_change_confirm_status smallint default 0,
  banned_until timestamptz,
  reauthentication_token varchar(255) default ''::varchar,
  reauthentication_sent_at timestamptz,
  is_sso_user boolean not null default false,
  deleted_at timestamptz,
  is_anonymous boolean not null default false,
  constraint users_email_change_confirm_status_check check (email_change_confirm_status >= 0 and email_change_confirm_status <= 2),
  constraint users_phone_key unique(phone)
);

create table storage.buckets (
  id text primary key,
  name text not null unique,
  public boolean not null default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);

create table storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text not null,
  name text not null,
  owner_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_accessed_at timestamptz default now(),
  metadata jsonb,
  version text
);
alter table storage.objects enable row level security;

grant usage on schema auth, storage to anon, authenticated, service_role;

-- Pre-Phase-1 production tables required by the applied security migration.
create table public.leaderboard_sessions (
  id uuid primary key,
  ip_hash text,
  started_at timestamptz,
  expires_at timestamptz,
  submitted_at timestamptz
);
alter table public.leaderboard_sessions enable row level security;

create table public.leaderboard (
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
