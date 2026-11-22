begin;

select plan(8);

-- Test fixtures. These UUIDs are synthetic and never represent real users.
insert into auth.users (id,aud,role,email,created_at,updated_at,email_confirmed_at)
values
('00000000-0000-0000-0000-000000000001','authenticated','authenticated','test-one@example.invalid',now(),now(),now()),
('00000000-0000-0000-0000-000000000002','authenticated','authenticated','test-two@example.invalid',now(),now(),now())
on conflict (id) do nothing;

insert into public.user_roles (user_id,role)
values ('00000000-0000-0000-0000-000000000002','aashraya_coordinator')
on conflict do nothing;

insert into public.profiles (id,full_name) values
('00000000-0000-0000-0000-000000000001','Test Student One'),
('00000000-0000-0000-0000-000000000002','Test Student Two');

insert into public.grievances (owner_id,tracking_token_hash,title,description,category)
values
('00000000-0000-0000-0000-000000000001',encode(digest('token-one','sha256'),'hex'),'Private one','Private','general'),
('00000000-0000-0000-0000-000000000002',encode(digest('token-two','sha256'),'hex'),'Private two','Private','general');

insert into public.blood_requests (owner_id,requester_name,phone,blood_group,units,hospital,district,consent)
values
('00000000-0000-0000-0000-000000000001','One','0000000000','O+',1,'Test','Test',true);

insert into public.scribe_requests (owner_id,subject,exam_date,consent)
values
('00000000-0000-0000-0000-000000000001','Test Subject',current_date + 1,true);

insert into public.resources (owner_id,title,category,status)
values
('00000000-0000-0000-0000-000000000001','Pending Resource','Notes','pending');

insert into public.donors (owner_id,blood_group,consent)
values ('00000000-0000-0000-0000-000000000001','O+',true);

insert into public.donor_contact_details (donor_id,owner_id,phone)
select id,owner_id,'0000000000' from public.donors where owner_id='00000000-0000-0000-0000-000000000001';

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-000000000001","role":"authenticated"}',true);

select is((select count(*) from public.profiles where id='00000000-0000-0000-0000-000000000002'),0::bigint,'student cannot read another student profile');
select is((select count(*) from public.grievances where owner_id='00000000-0000-0000-0000-000000000002'),0::bigint,'student cannot read another student grievance');
select is((select count(*) from public.blood_requests where owner_id='00000000-0000-0000-0000-000000000002'),0::bigint,'student cannot read another student blood request');
select is((select count(*) from public.scribe_requests where owner_id='00000000-0000-0000-0000-000000000001'),0::bigint,'student cannot read another student scribe request');
select is((select count(*) from public.resources where status='pending'),0::bigint,'authenticated public cannot read pending resources');
select is((select count(*) from public.donor_contact_details),0::bigint,'student cannot read donor contact details');
select is((select count(*) from public.user_roles where user_id='00000000-0000-0000-0000-000000000002'),0::bigint,'student cannot read another user role');

select * from finish();

rollback;
