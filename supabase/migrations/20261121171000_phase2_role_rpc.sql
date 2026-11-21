-- Phase 2 authorization helper. Roles remain stored in public.user_roles and checked by private.has_role.
create or replace function public.current_user_has_role(required_role public.user_role)
returns boolean
language sql
stable
security definer
set search_path=''
as $$ select private.has_role(required_role); $$;
revoke all on function public.current_user_has_role(public.user_role) from public, anon;
grant execute on function public.current_user_has_role(public.user_role) to authenticated;
