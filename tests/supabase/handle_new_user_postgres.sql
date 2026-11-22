-- Postgres-only direct trigger test; GoTrue is intentionally not involved.
begin;
set local role postgres;
select plan(10);

insert into auth.users(id,email,raw_user_meta_data,created_at,updated_at)
values ('20000000-0000-0000-0000-000000000001','normal@example.invalid','{"full_name":"Normal CI"}',now(),now());

select is((select count(*) from public.profiles where id='20000000-0000-0000-0000-000000000001'),1::bigint,'normal insert creates profile');
select is((select count(*) from public.user_roles where user_id='20000000-0000-0000-0000-000000000001' and role='student'),1::bigint,'normal insert creates student role');

alter table public.user_roles add constraint ci_force_role_failure check (false) not valid;
insert into auth.users(id,email,raw_user_meta_data,created_at,updated_at)
values ('20000000-0000-0000-0000-000000000002','rolefail@example.invalid','{"full_name":"Role Fail"}',now(),now());
alter table public.user_roles drop constraint ci_force_role_failure;
select is((select count(*) from public.profiles where id='20000000-0000-0000-0000-000000000002'),1::bigint,'role failure does not abort auth insert');
select is((select count(*) from public.user_roles where user_id='20000000-0000-0000-0000-000000000002' and role='student'),0::bigint,'role failure leaves role absent');

alter table public.profiles add constraint ci_force_profile_failure check (false) not valid;
insert into auth.users(id,email,raw_user_meta_data,created_at,updated_at)
values ('20000000-0000-0000-0000-000000000003','profilefail@example.invalid','{"full_name":"Profile Fail"}',now(),now());
alter table public.profiles drop constraint ci_force_profile_failure;
select is((select count(*) from public.profiles where id='20000000-0000-0000-0000-000000000003'),0::bigint,'profile failure does not abort auth insert');
select is((select count(*) from public.user_roles where user_id='20000000-0000-0000-0000-000000000003' and role='student'),1::bigint,'profile failure still creates role');

insert into auth.users(id,email,raw_user_meta_data,created_at,updated_at)
values ('20000000-0000-0000-0000-000000000004','idempotent@example.invalid','{"full_name":"Idempotent"}',now(),now());
insert into public.profiles(id,full_name) values ('20000000-0000-0000-0000-000000000004','Idempotent') on conflict(id) do nothing;
insert into public.user_roles(user_id,role) values ('20000000-0000-0000-0000-000000000004','student') on conflict(user_id,role) do nothing;
select is((select count(*) from public.profiles where id='20000000-0000-0000-0000-000000000004'),1::bigint,'profile backfill is idempotent');
select is((select count(*) from public.user_roles where user_id='20000000-0000-0000-0000-000000000004' and role='student'),1::bigint,'role backfill is idempotent');

select * from finish();
rollback;
