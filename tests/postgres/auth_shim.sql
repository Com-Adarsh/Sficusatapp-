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
