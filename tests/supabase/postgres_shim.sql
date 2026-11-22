-- Minimal Supabase/Postgres compatibility shim for SQL-only CI.
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
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin bypassrls; end if;
end $$;

-- The Supabase Postgres image already provides auth.uid(), auth.jwt(), and
-- auth.role(). Keep those image-native definitions so the shim does not try
-- to replace functions owned by supabase_auth_admin.

create table if not exists auth.users (
  instance_id uuid, id uuid primary key, aud varchar, role varchar, email varchar,
  encrypted_password varchar, email_confirmed_at timestamptz, invited_at timestamptz,
  confirmation_token varchar, confirmation_sent_at timestamptz, recovery_token varchar,
  recovery_sent_at timestamptz, email_change_token_new varchar, email_change varchar,
  email_change_sent_at timestamptz, last_sign_in_at timestamptz, raw_app_meta_data jsonb,
  raw_user_meta_data jsonb, is_super_admin boolean, created_at timestamptz,
  updated_at timestamptz, phone text default null::varchar, phone_confirmed_at timestamptz,
  phone_change text default ''::varchar, phone_change_token varchar default ''::varchar,
  phone_change_sent_at timestamptz, confirmed_at timestamptz,
  email_change_token_current varchar default ''::varchar,
  email_change_confirm_status smallint default 0, banned_until timestamptz,
  reauthentication_token varchar default ''::varchar, reauthentication_sent_at timestamptz,
  is_sso_user boolean not null default false, deleted_at timestamptz,
  is_anonymous boolean not null default false
);

create table if not exists storage.buckets (
  id text primary key, name text not null, public boolean not null default false,
  file_size_limit bigint, allowed_mime_types text[]
);

create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(), bucket_id text, owner_id text, name text
);

grant usage on schema auth, storage to postgres, anon, authenticated, service_role;
grant select, insert, update, delete on auth.users to postgres, service_role;
grant select, insert, update, delete on storage.buckets, storage.objects to postgres, service_role;
