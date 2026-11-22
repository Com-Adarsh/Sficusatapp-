-- Postgres-only CI shim. Production auth.users columns/defaults/constraints were
-- inspected read-only on jwhyesglviptvklrclll on 2026-11-22.
-- The Supabase Postgres image already provisions auth/storage schemas; this shim only
-- grants the test owner access and adds production columns absent from the base image.

create extension if not exists pgcrypto;
create extension if not exists pgtap;

grant usage, create on schema auth to postgres;
grant usage, create on schema storage to postgres;

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

alter table auth.users add column if not exists phone text default NULL::varchar;
alter table auth.users add column if not exists phone_confirmed_at timestamptz;
alter table auth.users add column if not exists phone_change text default ''::varchar;
alter table auth.users add column if not exists phone_change_token varchar(255) default ''::varchar;
alter table auth.users add column if not exists phone_change_sent_at timestamptz;
alter table auth.users add column if not exists email_change_token_current varchar(255) default ''::varchar;
alter table auth.users add column if not exists email_change_confirm_status smallint default 0;
alter table auth.users add column if not exists banned_until timestamptz;
alter table auth.users add column if not exists reauthentication_token varchar(255) default ''::varchar;
alter table auth.users add column if not exists reauthentication_sent_at timestamptz;
alter table auth.users add column if not exists is_sso_user boolean not null default false;
alter table auth.users add column if not exists deleted_at timestamptz;
alter table auth.users add column if not exists is_anonymous boolean not null default false;

do $$
begin
  if not exists (select 1 from pg_constraint where conname='ci_users_email_change_confirm_status_check') then
    alter table auth.users add constraint ci_users_email_change_confirm_status_check
      check (email_change_confirm_status >= 0 and email_change_confirm_status <= 2);
  end if;
  if not exists (select 1 from pg_constraint where conname='ci_users_phone_key') then
    alter table auth.users add constraint ci_users_phone_key unique(phone);
  end if;
end $$;

grant usage on schema auth, storage to anon, authenticated, service_role;
