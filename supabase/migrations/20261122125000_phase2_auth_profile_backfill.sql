-- Phase 2 auth/profile reconciliation backfill. NOT APPLIED TO PRODUCTION.
-- UNTESTED until CI is green.
--
-- Idempotent: only missing profile rows and missing student-role rows are added.
-- Existing profile/role values are not overwritten.

insert into public.profiles (id, full_name)
select
  u.id,
  coalesce(
    nullif(u.raw_user_meta_data->>'full_name',''),
    nullif(u.raw_user_meta_data->>'name',''),
    split_part(coalesce(u.email,'CUSAT Student'),'@',1)
  )
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

insert into public.user_roles (user_id, role)
select u.id, 'student'::public.user_role
from auth.users u
where not exists (
  select 1
  from public.user_roles r
  where r.user_id = u.id
    and r.role = 'student'::public.user_role
)
on conflict (user_id, role) do nothing;
