begin;
select plan(14);

insert into auth.users (id,aud,role,email,created_at,updated_at,email_confirmed_at)
values
('10000000-0000-0000-0000-000000000001','authenticated','authenticated','student-one@example.invalid',now(),now(),now()),
('10000000-0000-0000-0000-000000000002','authenticated','authenticated','student-two@example.invalid',now(),now(),now()),
('10000000-0000-0000-0000-000000000003','authenticated','authenticated','moderator@example.invalid',now(),now(),now()),
('10000000-0000-0000-0000-000000000004','authenticated','authenticated','aashraya@example.invalid',now(),now(),now()),
('10000000-0000-0000-0000-000000000005','authenticated','authenticated','sahayi@example.invalid',now(),now(),now()),
('10000000-0000-0000-0000-000000000006','authenticated','authenticated','admin@example.invalid',now(),now(),now())
on conflict (id) do nothing;

insert into public.profiles(id,full_name)
select id, split_part(email,'@',1) from auth.users where id::text like '10000000-0000-0000-0000-00000000000%';

insert into public.user_roles(user_id,role) values
('10000000-0000-0000-0000-000000000003','moderator'),
('10000000-0000-0000-0000-000000000004','aashraya_coordinator'),
('10000000-0000-0000-0000-000000000005','sahayi_coordinator'),
('10000000-0000-0000-0000-000000000006','admin')
on conflict do nothing;

insert into public.grievances(owner_id,tracking_token_hash,title,description,category) values
('10000000-0000-0000-0000-000000000001',encode(digest('g1','sha256'),'hex'),'G1','private','general'),
('10000000-0000-0000-0000-000000000002',encode(digest('g2','sha256'),'hex'),'G2','private','general');

insert into public.blood_requests(owner_id,requester_name,phone,blood_group,units,hospital,district,consent)
values ('10000000-0000-0000-0000-000000000002','Student Two','0000000000','O+',1,'Test Hospital','Test',true);

insert into public.scribe_requests(owner_id,subject,exam_date,consent)
values ('10000000-0000-0000-0000-000000000002','Test Subject',current_date + 1,true);

insert into public.resources(owner_id,title,category,status)
values ('10000000-0000-0000-0000-000000000002','Pending','Notes','pending');

insert into public.donors(owner_id,blood_group,consent)
values ('10000000-0000-0000-0000-000000000002','O+',false);

insert into public.donor_contact_details(donor_id,owner_id,phone)
select id,owner_id,'0000000000' from public.donors where owner_id='10000000-0000-0000-0000-000000000002';

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000001","role":"authenticated"}',true);
select is((select count(*) from public.grievances where owner_id='10000000-0000-0000-0000-000000000002'),0::bigint,'student cannot read another student grievance');
select is((select count(*) from public.blood_requests where owner_id='10000000-0000-0000-0000-000000000002'),0::bigint,'student cannot read another student blood request');
select is((select count(*) from public.scribe_requests where owner_id='10000000-0000-0000-0000-000000000002'),0::bigint,'student cannot read another student scribe request');
select is((select count(*) from public.resources where status='pending'),0::bigint,'student cannot read pending resource');
select is((select count(*) from public.donor_contact_details),0::bigint,'student cannot read donor contact without consent');

select set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000003","role":"authenticated"}',true);
select is((select count(*) from public.blood_requests where owner_id='10000000-0000-0000-0000-000000000002'),0::bigint,'moderator cannot read Aashraya blood request by coordinator policy');
select is((select count(*) from public.donor_contact_details),0::bigint,'moderator cannot read donor contact without consent');

select set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000004","role":"authenticated"}',true);
select is((select count(*) from public.donor_contact_details),0::bigint,'Aashraya coordinator cannot read donor contact without consent');

select set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000005","role":"authenticated"}',true);
select is((select count(*) from public.grievances where owner_id='10000000-0000-0000-0000-000000000001'),0::bigint,'Sahayi coordinator cannot read another student grievance');

select set_config('request.jwt.claims','{"sub":"10000000-0000-0000-0000-000000000006","role":"authenticated"}',true);
select ok((select count(*) from public.grievances) >= 2,'admin can read protected grievances');

set local role anon;
select set_config('request.jwt.claims','{"role":"anon"}',true);
select is((select count(*) from public.resources where status='pending'),0::bigint,'anonymous cannot read pending resources');
select is((select count(*) from public.grievances),0::bigint,'anonymous cannot read grievances');
select is((select count(*) from public.blood_requests),0::bigint,'anonymous cannot read blood requests');
select is((select count(*) from public.scribe_requests),0::bigint,'anonymous cannot read scribe requests');

select * from finish();
rollback;
