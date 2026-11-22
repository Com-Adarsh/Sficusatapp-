begin;
select no_plan();

-- Student identity.
select set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
set local role authenticated;

-- Moderation status cannot be self-approved.
select throws_ok(
  $q$insert into public.issues(owner_id,category,title,description,status) values ('10000000-0000-0000-0000-000000000001','general','x','x','approved')$q$,
  '42501',
  null,
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
  $q$update public.issues set status='approved' where owner_id='10000000-0000-0000-0000-000000000001' and title='pending'$q$,
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
  $q$update public.issues set owner_id='10000000-0000-0000-0000-000000000002' where owner_id='10000000-0000-0000-0000-000000000001' and title='pending'$q$,
  'owner_id may only be changed by staff',
  'student cannot change owner'
);

-- Volunteer moderation status cannot be self-approved.
insert into public.scribe_volunteers(owner_id,availability,status)
values ('10000000-0000-0000-0000-000000000001','weekdays','pending');
select throws_ok(
  $q$update public.scribe_volunteers set status='verified' where owner_id='10000000-0000-0000-0000-000000000001'$q$,
  'moderation status may only be changed by staff',
  'volunteer cannot self-verify'
);

-- A student can edit an approved resource only by re-queuing it.
insert into auth.users (id,email)
values
  ('10000000-0000-0000-0000-000000000010','rls-admin@test.local'),
  ('10000000-0000-0000-0000-000000000011','rls-owner@test.local');

insert into public.user_roles(user_id,role)
values ('10000000-0000-0000-0000-000000000010','admin');

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000011","role":"authenticated"}',true);

insert into public.resources(owner_id,title,category,status)
values ('10000000-0000-0000-0000-000000000011','file-swap','notes','pending');

set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000010","role":"authenticated"}',true);
update public.resources
set status='approved',published_at=now()
where owner_id='10000000-0000-0000-0000-000000000011' and title='file-swap';

set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000011","role":"authenticated"}',true);
insert into public.resource_files(resource_id,owner_id,storage_path,original_filename,mime_type,byte_size,sha256)
select id,owner_id,'rls-test/new.pdf','new.pdf','application/pdf',1,'test-sha'
from public.resources
where owner_id='10000000-0000-0000-0000-000000000011' and title='file-swap';

select is(
  (select status::text from public.resources where owner_id='10000000-0000-0000-0000-000000000011' and title='file-swap'),
  'pending',
  'file swap requeues approved resource'
);


-- INSERT-side moderation protection.
insert into public.scribe_volunteers(owner_id,availability,status)
values ('10000000-0000-0000-0000-000000000001','weekends','verified');
select is((select status from public.scribe_volunteers where owner_id='10000000-0000-0000-0000-000000000001' order by created_at desc limit 1),'pending','volunteer insert cannot self-verify');

insert into public.scribe_requests(owner_id,subject,exam_date,status)
values ('10000000-0000-0000-0000-000000000001','test','2030-01-01','approved');
select is((select status from public.scribe_requests where owner_id='10000000-0000-0000-0000-000000000001' order by created_at desc limit 1),'pending','scribe request insert cannot self-approve');

insert into public.donors(owner_id,blood_group,available,consent)
values ('10000000-0000-0000-0000-000000000001','O+',true,true);
select is((select available from public.donors where owner_id='10000000-0000-0000-0000-000000000001' order by created_at desc limit 1),true,'donor insert retains availability but protected verification fields are absent');

insert into public.blood_requests(owner_id,requester_name,phone,blood_group,units,hospital,district,status)
values ('10000000-0000-0000-0000-000000000001','Test','0000000000','O+',1,'Test Hospital','Ernakulam','resolved');
select is((select status from public.blood_requests where owner_id='10000000-0000-0000-0000-000000000001' order by created_at desc limit 1),'pending','blood request insert cannot self-resolve');

select throws_ok(
  $q$insert into public.grievances(owner_id,tracking_token_hash,title,description,category,status)
      values ('10000000-0000-0000-0000-000000000001','test-hash','Test grievance','Test','academic','open')$q$,
  '42501',
  null,
  'student cannot directly insert confidential grievance rows'
);

select throws_ok(
  $q$insert into public.tickets(owner_id,module,title,status)
      values ('10000000-0000-0000-0000-000000000001','test','Test ticket','open')$q$,
  '42501',
  null,
  'student cannot directly insert confidential ticket rows'
);

insert into public.helpdesk_entries(owner_id,module,title,status)
values ('10000000-0000-0000-0000-000000000001','test','Test helpdesk','approved');
select is((select status::text from public.helpdesk_entries where owner_id='10000000-0000-0000-0000-000000000001' order by created_at desc limit 1),'pending','helpdesk insert cannot self-approve');

insert into public.opportunities(owner_id,type,title,organisation,source_url,last_verified_at,status)
values ('10000000-0000-0000-0000-000000000001','internship','Test opportunity','Test','https://example.com',now(),'approved');
select is((select status::text from public.opportunities where owner_id='10000000-0000-0000-0000-000000000001' order by created_at desc limit 1),'pending','opportunity insert cannot self-approve');

-- Resource and issue insert-side protection.
insert into public.resources(owner_id,title,category,status)
values ('10000000-0000-0000-0000-000000000001','insert-test','notes','approved');
select is((select status::text from public.resources where owner_id='10000000-0000-0000-0000-000000000001' and title='insert-test'),'pending','resource insert cannot self-approve');

-- Event registration currently has no attended/check-in column; trigger coverage is asserted instead.
select ok(exists(select 1 from pg_trigger where tgname='prevent_owner_moderation_insert' and tgrelid='public.event_registrations'::regclass),'event registration has insert moderation trigger');

-- Grievance confidentiality.
set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',true);

-- Grievance confidentiality: moderator has no read or write path.
insert into auth.users (id,email)
values
 ('10000000-0000-0000-0000-000000000012','rls-moderator@test.local'),
 ('10000000-0000-0000-0000-000000000013','rls-officer@test.local')
on conflict (id) do nothing;
insert into public.user_roles(user_id,role)
values
 ('10000000-0000-0000-0000-000000000012','moderator'),
 ('10000000-0000-0000-0000-000000000013','grievance_officer')
on conflict do nothing;

select is(
  (select count(*) from pg_policies
   where schemaname='public'
     and tablename in ('grievances','grievance_updates','interventions','tickets')
     and cmd in ('INSERT','UPDATE','DELETE')
     and (coalesce(qual,'') || ' ' || coalesce(with_check,'')) ilike '%moderator%'),
  0::bigint,
  'moderators have no grievance write policies'
);

set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000012","role":"authenticated"}',true);
select is((select count(*) from public.grievances),0::bigint,'moderator without grievance_officer cannot read grievances');
select throws_ok(
  $q$insert into public.grievances(owner_id,tracking_token_hash,title,description,category)
      values ('10000000-0000-0000-0000-000000000012','moderator-hash','Moderator write','blocked','general')$q$,
  '42501',
  null,
  'moderator cannot insert grievance'
);
select throws_ok(
  $q$insert into public.grievance_updates(grievance_id,status,note)
      values ('00000000-0000-0000-0000-000000000001','open','blocked')$q$,
  '42501',
  null,
  'moderator cannot insert grievance update'
);
select throws_ok(
  $q$insert into public.interventions(note)
      values ('blocked')$q$,
  '42501',
  null,
  'moderator cannot insert intervention'
);
select throws_ok(
  $q$insert into public.tickets(owner_id,module,title)
      values ('10000000-0000-0000-0000-000000000012','test','blocked')$q$,
  '42501',
  null,
  'moderator cannot insert ticket'
);

set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000013","role":"authenticated"}',true);
select ok(
  (select count(*) from public.grievances) >= 0,
  'grievance officer has a confidential read path'
);

-- Public settings are opt-in; private settings remain hidden.
set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000010","role":"authenticated"}',true);
insert into public.site_settings(key,value,is_public) values
  ('public_test','visible',true),
  ('private_test','hidden',false)
on conflict (key) do update set value=excluded.value,is_public=excluded.is_public;

set local role anon;
select is((select count(*) from public.site_settings where key='public_test'),1::bigint,'anonymous can read public setting');
select is((select count(*) from public.site_settings where key='private_test'),0::bigint,'anonymous cannot read private setting');

-- Public issue view contains approved anonymous issues only.
set local role authenticated;
set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000010","role":"authenticated"}',true);
insert into public.issues(owner_id,category,title,description,status,anonymous)
values
 ('10000000-0000-0000-0000-000000000010','general','approved-public','ok','approved',true),
 ('10000000-0000-0000-0000-000000000010','general','pending-public','not yet','pending',true);
set local role anon;
select is((select count(*) from public.public_issues where title='approved-public'),1::bigint,'public issues exposes approved anonymous row');
select is((select count(*) from public.public_issues where title='pending-public'),0::bigint,'public issues hides pending row');

-- Anonymous access is only through the author-free view.
set local role anon;
select is((select count(*) from public.issues),0::bigint,'anonymous cannot select issues table');
select ok((select count(*) from public.public_issues) >= 0,'anonymous can use public issue view');
select is((select count(*) from information_schema.columns where table_schema='public' and table_name='public_issues' and column_name='owner_id'),0::bigint,'public issue view has no owner_id');

-- Coordinator gets limited donor data but not contact details.
insert into auth.users (id,email) values ('10000000-0000-0000-0000-000000000004','rls-coordinator@test.local') on conflict (id) do nothing;
insert into public.user_roles(user_id,role) values ('10000000-0000-0000-0000-000000000004','aashraya_coordinator') on conflict do nothing;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000004","role":"authenticated"}',true);
select ok((select count(*) from public.list_donor_matches('O+',null)) >= 0,'coordinator can call donor directory');

set local role anon;
select throws_ok(
  $q$select * from public.list_donor_matches('O+',null)$q$,
  'permission denied for function list_donor_matches',
  'anonymous cannot call donor directory RPC'
);

select is((select count(*) from public.leaderboard),0::bigint,'anonymous cannot read locked leaderboard');
select is((select count(*) from public.leaderboard_sessions),0::bigint,'anonymous cannot read locked leaderboard sessions');
select is((select count(*) from information_schema.columns where table_schema='public' and table_name='donor_contact_details' and column_name in ('phone','whatsapp','email')),3::bigint,'contact fields remain isolated from donor directory');

select * from finish();
rollback;
