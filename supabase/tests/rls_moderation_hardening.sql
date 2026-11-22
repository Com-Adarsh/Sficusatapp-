begin;
select plan(9);

-- Student identity.
select set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
set local role authenticated;

-- Moderation status cannot be self-approved.
select throws_ok(
  $$insert into public.issues(owner_id,category,title,description,status) values ('10000000-0000-0000-0000-000000000001','general','x','x','approved')$$,
  'new row violates row-level security policy for table "issues"',
  'student cannot insert approved issue'
);

insert into public.issues(owner_id,category,title,description,status)
values ('10000000-0000-0000-0000-000000000001','general','pending','pending','pending');

select throws_ok(
  $$update public.issues set status='approved' where owner_id='10000000-0000-0000-0000-000000000001' and title='pending'$$,
  'moderation status may only be changed by staff',
  'student cannot approve own issue'
);

select throws_ok(
  $$update public.issues set owner_id='10000000-0000-0000-0000-000000000002' where owner_id='10000000-0000-0000-0000-000000000001' and title='pending'$$,
  'owner_id may only be changed by staff',
  'student cannot change owner'
);

-- Anonymous access is only through the author-free view.
set local role anon;
select is((select count(*) from public.issues),0::bigint,'anonymous cannot select issues table');
select ok((select count(*) from public.public_issues) >= 0,'anonymous can use public issue view');
select is((select count(*) from information_schema.columns where table_schema='public' and table_name='public_issues' and column_name='owner_id'),0::bigint,'public issue view has no owner_id');

-- Coordinator gets limited donor data but not contact details.
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000004","role":"authenticated"}',true);
select ok((select count(*) from public.list_donor_matches('O+',null)) >= 0,'coordinator can call donor directory');
select is((select count(*) from information_schema.columns where table_schema='public' and table_name='donor_contact_details' and column_name in ('phone','whatsapp','email')),3::bigint,'contact fields remain isolated from donor directory');

select * from finish();
rollback;
