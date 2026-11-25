-- ONE-PASTE PRODUCTION HOTFIX.
-- Apply only after CI is green and explicit approval is given.
-- This changes only public.handle_new_user().

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
  begin
    insert into public.profiles(id, full_name)
    values (
      new.id,
      coalesce(
        nullif(new.raw_user_meta_data->>'full_name', ''),
        nullif(new.raw_user_meta_data->>'name', ''),
        split_part(coalesce(new.email, 'CUSAT Student'), '@', 1)
      )
    )
    on conflict (id) do nothing;
  exception when others then
    raise warning 'handle_new_user profile side effect failed: %: %', sqlstate, sqlerrm;
  end;

  begin
    insert into public.user_roles(user_id, role)
    values (new.id, 'student'::public.user_role)
    on conflict (user_id, role) do nothing;
  exception when others then
    raise warning 'handle_new_user role side effect failed: %: %', sqlstate, sqlerrm;
  end;

  return new;
end;
$function$;

-- Function-definition verification.
select
  p.oid::regprocedure as function_name,
  p.prosecdef as security_definer,
  p.proconfig as function_config,
  pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'handle_new_user';

-- Trigger verification.
select
  tg.tgname,
  pg_get_triggerdef(tg.oid) as trigger_definition
from pg_trigger tg
join pg_class c on c.oid = tg.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'auth'
  and c.relname = 'users'
  and not tg.tgisinternal;

-- After the throwaway signup, run this verification query.
select
  u.id,
  u.email,
  p.id is not null as profile_created,
  ur.role = 'student'::public.user_role as student_role_created
from auth.users u
left join public.profiles p on p.id = u.id
left join public.user_roles ur on ur.user_id = u.id and ur.role = 'student'::public.user_role
where u.email = 'REPLACE_WITH_THROWAWAY_EMAIL@example.test';
