-- Local PostgreSQL compatibility shim for SQL-only CI.
-- Production is never contacted.

create extension if not exists pgcrypto;
create extension if not exists pg_trgm;
create extension if not exists unaccent;
create extension if not exists vector;

create schema if not exists auth;
create schema if not exists storage;
create schema if not exists private;

do $$
begin
  if not exists (select 1 from pg_roles where rolname='anon') then
    create role anon nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then
    create role authenticated nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then
    create role service_role nologin bypassrls;
  end if;
  if not exists (select 1 from pg_roles where rolname='authenticator') then
    create role authenticator login password 'ci-authenticator';
  end if;
  if not exists (select 1 from pg_roles where rolname='supabase_auth_admin') then
    create role supabase_auth_admin login password 'ci-auth-admin';
  end if;

  grant service_role to authenticator;
  grant anon to authenticator;
  grant authenticated to authenticator;
end $$;

-- Minimal Supabase-compatible request context helpers. These read the same
-- request.jwt.claims setting used by PostgREST/Supabase.
create or replace function auth.jwt()
returns jsonb
language sql
stable
as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb;
$$;

create or replace function auth.uid()
returns uuid
language sql
stable
as $$
  select nullif(auth.jwt()->>'sub', '')::uuid;
$$;

create or replace function auth.role()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt()->>'role', current_user);
$$;

-- Production-shaped auth.users subset used by the migration chain and tests.
create table if not exists auth.users (
  instance_id uuid,
  id uuid primary key,
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
  phone text default null::varchar,
  phone_confirmed_at timestamptz,
  phone_change text default ''::varchar,
  phone_change_token varchar(255) default ''::varchar,
  phone_change_sent_at timestamptz,
  confirmed_at timestamptz,
  email_change_token_current varchar(255) default ''::varchar,
  email_change_confirm_status smallint default 0 check (email_change_confirm_status >= 0 and email_change_confirm_status <= 2),
  banned_until timestamptz,
  reauthentication_token varchar(255) default ''::varchar,
  reauthentication_sent_at timestamptz,
  is_sso_user boolean not null default false,
  deleted_at timestamptz,
  is_anonymous boolean not null default false,
  constraint users_phone_key unique (phone)
);

create table if not exists storage.buckets (
  id text primary key,
  name text not null,
  public boolean not null default false,
  file_size_limit bigint,
  allowed_mime_types text[]
);

create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text,
  owner_id text,
  name text
);

grant usage on schema auth, storage to postgres, anon, authenticated, service_role, authenticator, supabase_auth_admin;
grant select, insert, update, delete on auth.users to postgres, service_role, authenticator, supabase_auth_admin;
grant select, insert, update, delete on storage.buckets, storage.objects to postgres, service_role, authenticator, supabase_auth_admin;
