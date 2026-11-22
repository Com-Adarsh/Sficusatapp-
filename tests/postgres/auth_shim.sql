-- Postgres-only CI shim. The Supabase Postgres image provisions auth/storage and
-- its real auth.uid()/auth.jwt() helpers. Production auth.users was inspected
-- read-only on 2026-11-22; tests only use columns common to the real and CI schemas.
create extension if not exists pgcrypto;
create extension if not exists pgtap;

do $$
begin
  if not exists (select 1 from pg_roles where rolname='anon') then create role anon nologin; end if;
  if not exists (select 1 from pg_roles where rolname='authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname='service_role') then create role service_role nologin; end if;
end $$;

grant usage on schema auth, storage to anon, authenticated, service_role;
