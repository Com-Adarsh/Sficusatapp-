-- Phase 2 trigger exemption tests. UNTESTED until CI is green.
-- These tests model the two trusted request paths rather than checking
-- session_user = service_role, because PostgREST connects as authenticator
-- and changes to service_role from the JWT role claim.

\set ON_ERROR_STOP on

do $$
declare
  service_user uuid := gen_random_uuid();
  signup_user uuid := gen_random_uuid();
begin
  -- PostgREST-style service-role request:
  -- session_user remains authenticator; current_user becomes service_role.
  set session authorization authenticator;
  set local role service_role;
  perform set_config(
    'request.jwt.claims',
    json_build_object('role','service_role','sub',service_user::text)::text,
    true
  );

  insert into public.profiles(id, full_name)
  values (service_user, 'CI service-role profile');
end
$$;

reset role;
reset session authorization;

do $$
declare
  signup_user uuid := gen_random_uuid();
begin
  -- Supabase Auth signup path: the auth trigger executes under a
  -- supabase_auth_admin session, and its profile/role side effects must
  -- survive the moderation INSERT guard.
  set session authorization supabase_auth_admin;

  insert into auth.users(id, email, raw_user_meta_data, created_at, updated_at)
  values (
    signup_user,
    'phase2-trigger-test@example.invalid',
    jsonb_build_object('full_name','CI signup user'),
    now(),
    now()
  );

  if not exists (select 1 from public.profiles where id = signup_user) then
    raise exception 'signup exemption did not allow profile side effect';
  end if;

  if not exists (
    select 1 from public.user_roles
    where user_id = signup_user and role::text = 'student'
  ) then
    raise exception 'signup exemption did not allow student role side effect';
  end if;
end
$$;

reset session authorization;
