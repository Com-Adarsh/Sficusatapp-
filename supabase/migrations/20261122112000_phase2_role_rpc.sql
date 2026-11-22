-- Phase 2 authorization helper. Roles remain stored in public.user_roles and checked by private.has_role.
-- This file is intentionally NOT applied to production jwhyesglviptvklrclll.
create or replace function public.current_user_has_role(required_role public.user_role)
returns boolean
language sql
stable
security definer
set search_path=''
as $$ select private.has_role(required_role); $$;
revoke all on function public.current_user_has_role(public.user_role) from public, anon;
grant execute on function public.current_user_has_role(public.user_role) to authenticated;

-- Idempotent reconciliation for users created before the auth foundation migration.
insert into public.profiles (id, full_name)
select
  u.id,
  coalesce(
    nullif(u.raw_user_meta_data ->> 'full_name', ''),
    nullif(u.raw_user_meta_data ->> 'name', ''),
    split_part(coalesce(u.email, 'CUSAT Student'), '@', 1),
    'CUSAT Student'
  )
from auth.users u
on conflict (id) do nothing;

insert into public.user_roles (user_id, role)
select u.id, 'student'::public.user_role
from auth.users u
on conflict (user_id, role) do nothing;
