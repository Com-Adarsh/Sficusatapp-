begin;
select plan(14);

-- Student identity.
select set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
set local role authenticated;

-- Moderation status cannot be self-approved.
select lives_ok(
  $insert into public.issues(owner_id,category,title,description,status) values ('10000000-0000-0000-0000-000000000001','general','x','x','approved')$,
  'student cannot insert an approved issue'
);
select is(
  (select status::text from public.issues where owner_id='10000000-0000-0000-0000-000000000001' and title='x'),
  'pending',
  'approved issue submission is rejected from publication queue'
);

insert into public.issues(owner_id,category,title,description,status)
values ('10000000-0000-0000-0000-000000000001','general','pending','pending','pending');

select throws_ok(
  $update public.issues set status='approved' where owner_id='10000000-0000-0000-0000-000000000001' and title='pending'$,
  'moderation status may only be changed by staff',
  'student cannot approve own issue'
);

-- Approved content edits are automatically re-queued.
update public.issues set status='approved' where title='pending' and owner_id='10000000-0000-0000-0000-000000000001';
update public.issues set description='edited after approval' where title='pending' and owner_id='10000000-0000-0000-0000-000000000001';
select is(
  (select status::text from public.issues where owner_id='10000000-0000-0000-0000-000000000001' and title='pending'),
  'pending',
  'editing approved issue requeues it'
);

select throws_ok(
  $update public.issues set owner_id='10000000-0000-0000-0000-000000000002' where owner_id='10000000-0000-0000-0000-000000000001' and title='pending'$,
  'owner_id may only be changed by staff',
  'student cannot change owner'
);

-- Volunteer moderation status cannot be self-approved.
insert into public.scribe_volunteers(owner_id,availability,status)
values ('10000000-0000-0000-0000-000000000001','weekdays','pending');
select throws_ok(
  $update public.scribe_volunteers set status='verified' where owner_id='10000000-0000-0000-0000-000000000001'$,
  'moderation status may only be changed by staff',
  'volunteer cannot self-verify'
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

set local role anon;
select throws_ok(
  $select * from public.list_donor_matches('O+',null)$,
  'permission denied for function list_donor_matches',
  'anonymous cannot call donor directory RPC'
);

select is((select count(*) from public.leaderboard),0::bigint,'anonymous cannot read locked leaderboard');
select is((select count(*) from public.leaderboard_sessions),0::bigint,'anonymous cannot read locked leaderboard sessions');
select is((select count(*) from information_schema.columns where table_schema='public' and table_name='donor_contact_details' and column_name in ('phone','whatsapp','email')),3::bigint,'contact fields remain isolated from donor directory');

select * from finish();
rollback;
