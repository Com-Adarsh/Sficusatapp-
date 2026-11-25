begin;
select plan(9);
set local role postgres;
select set_config('request.jwt.claim.sub','10000000-0000-0000-0000-000000000001',true);
insert into auth.users(id,aud,role,email,raw_user_meta_data)
values ('10000000-0000-0000-0000-000000000001','authenticated','authenticated','normal@example.invalid','{"full_name":"Normal User"}');
select ok(exists(select 1 from public.profiles where id='10000000-0000-0000-0000-000000000001'),'normal signup creates profile');
select ok(exists(select 1 from public.user_roles where user_id='10000000-0000-0000-0000-000000000001' and role='student'),'normal signup creates student role');
alter table public.user_roles add constraint ci_force_role_failure check (false) not valid;
insert into auth.users(id,aud,role,email,raw_user_meta_data)
values ('10000000-0000-0000-0000-000000000002','authenticated','authenticated','role-fail@example.invalid','{"full_name":"Role Fail"}');
alter table public.user_roles drop constraint ci_force_role_failure;
select ok(exists(select 1 from auth.users where id='10000000-0000-0000-0000-000000000002'),'role-side-effect failure does not abort auth user');
select ok(exists(select 1 from public.profiles where id='10000000-0000-0000-0000-000000000002'),'profile side effect survives role failure');
select ok(not exists(select 1 from public.user_roles where user_id='10000000-0000-0000-0000-000000000002' and role='student'),'failed role side effect leaves no student role');
alter table public.profiles add constraint ci_force_profile_failure check (false) not valid;
insert into auth.users(id,aud,role,email,raw_user_meta_data)
values ('10000000-0000-0000-0000-000000000003','authenticated','authenticated','profile-fail@example.invalid','{"full_name":"Profile Fail"}');
alter table public.profiles drop constraint ci_force_profile_failure;
select ok(exists(select 1 from auth.users where id='10000000-0000-0000-0000-000000000003'),'profile-side-effect failure does not abort auth user');
select ok(not exists(select 1 from public.profiles where id='10000000-0000-0000-0000-000000000003'),'failed profile side effect leaves no profile');
select ok(exists(select 1 from public.user_roles where user_id='10000000-0000-0000-0000-000000000003' and role='student'),'role side effect survives profile failure');
delete from public.profiles where id='10000000-0000-0000-0000-000000000001';
delete from public.user_roles where user_id='10000000-0000-0000-0000-000000000001' and role='student';
insert into public.profiles(id,full_name)
select u.id, coalesce(nullif(u.raw_user_meta_data->>'full_name',''),nullif(u.raw_user_meta_data->>'name',''),split_part(coalesce(u.email,'CUSAT Student'),'@',1),'CUSAT Student')
from auth.users u where u.id='10000000-0000-0000-0000-000000000001' on conflict(id) do nothing;
insert into public.user_roles(user_id,role)
select u.id,'student'::public.user_role from auth.users u where u.id='10000000-0000-0000-0000-000000000001' on conflict(user_id,role) do nothing;
insert into public.profiles(id,full_name)
select u.id, coalesce(nullif(u.raw_user_meta_data->>'full_name',''),nullif(u.raw_user_meta_data->>'name',''),split_part(coalesce(u.email,'CUSAT Student'),'@',1),'CUSAT Student')
from auth.users u where u.id='10000000-0000-0000-0000-000000000001' on conflict(id) do nothing;
insert into public.user_roles(user_id,role)
select u.id,'student'::public.user_role from auth.users u where u.id='10000000-0000-0000-0000-000000000001' on conflict(user_id,role) do nothing;
select is((select count(*) from public.profiles where id='10000000-0000-0000-0000-000000000001'),1::bigint,'profile backfill is idempotent');
select is((select count(*) from public.user_roles where user_id='10000000-0000-0000-0000-000000000001' and role='student'),1::bigint,'student role backfill is idempotent');
select * from finish();
rollback;
