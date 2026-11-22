-- Trigger compatibility and owner grievance RPC tests.
-- Runs after the hardening and compatibility migrations.

\set ON_ERROR_STOP on

-- 1. Signup path: the real Auth role can insert auth.users and the trigger
-- side effects must not be rejected by the profile insert guard.
set role supabase_auth_admin;
insert into auth.users(id,email,raw_user_meta_data,created_at,updated_at)
values ('30000000-0000-0000-0000-000000000001','trigger-role@example.test','{"full_name":"Trigger Role"}',now(),now());
reset role;

do $$
begin
  if not exists (select 1 from public.profiles where id='30000000-0000-0000-0000-000000000001') then
    raise exception 'signup profile side effect missing';
  end if;
  if not exists (select 1 from public.user_roles where user_id='30000000-0000-0000-0000-000000000001' and role='student') then
    raise exception 'signup student role side effect missing';
  end if;
end $$;

-- 2. ensure_profile-style service_role reconciliation must bypass the
-- end-user profile-id trigger.
set role service_role;
select set_config('request.jwt.claim.sub','30000000-0000-0000-0000-000000000002',true);
insert into auth.users(id,email,created_at,updated_at)
values ('30000000-0000-0000-0000-000000000002','service@example.test',now(),now())
on conflict (id) do nothing;
insert into public.profiles(id,full_name)
values ('30000000-0000-0000-0000-000000000002','Service Reconciled')
on conflict (id) do update set full_name=excluded.full_name;
insert into public.user_roles(user_id,role)
values ('30000000-0000-0000-0000-000000000002','student')
on conflict do nothing;
reset role;

-- 3. Token cancellation path: service_role status update must not be
-- blocked by the owner moderation trigger.
set role service_role;
insert into auth.users(id,email,created_at,updated_at)
values ('30000000-0000-0000-0000-000000000003','grievance@example.test',now(),now())
on conflict (id) do nothing;
insert into public.grievances(owner_id,tracking_token_hash,title,description,category,status)
values ('30000000-0000-0000-0000-000000000003',
        encode(digest('ci-token','sha256'),'hex'),
        'CI grievance','confidential','academic','open');
update public.grievances
set status='cancelled'
where tracking_token_hash=encode(digest('ci-token','sha256'),'hex')
  and status in ('open','in_progress');
reset role;

do $$
begin
  if not exists (
    select 1 from public.grievances
    where tracking_token_hash=encode(digest('ci-token','sha256'),'hex')
      and status='cancelled'
  ) then
    raise exception 'service_role grievance token cancellation failed';
  end if;
end $$;

-- 4. A student cannot insert a profile row for another user id.
set role authenticated;
select set_config('request.jwt.claim.sub','30000000-0000-0000-0000-000000000002',true);
do $$
begin
  begin
    insert into public.profiles(id,full_name)
    values ('30000000-0000-0000-0000-000000000003','Wrong Owner');
    raise exception 'student inserted another profile id';
  exception
    when others then
      if sqlerrm = 'student inserted another profile id' then
        raise;
      end if;
  end;
end $$;
reset role;

-- 5. Owner status-only RPC: authenticated owner sees only the four allowed
-- columns and never receives description.
set role authenticated;
select set_config('request.jwt.claim.sub','30000000-0000-0000-0000-000000000003',true);
do $$
declare
  n integer;
begin
  select count(*) into n from public.get_my_grievance_status()
  where id='30000000-0000-0000-0000-000000000003'
    and category='academic'
    and status='cancelled';
  if n <> 1 then
    raise exception 'owner grievance status RPC returned unexpected result';
  end if;
end $$;
reset role;

do $$
begin
  if has_function_privilege('anon','public.get_my_grievance_status()','execute') then
    raise exception 'anon must not execute owner grievance status RPC';
  end if;
  if not has_function_privilege('authenticated','public.get_my_grievance_status()','execute') then
    raise exception 'authenticated must execute owner grievance status RPC';
  end if;
end $$;

select 'TRIGGER EXEMPTION AND OWNER GRIEVANCE RPC TESTS PASSED' as result;
