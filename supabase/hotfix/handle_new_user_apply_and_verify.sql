-- SQL-editor hotfix package: apply ONLY public.handle_new_user().
-- Production target: jwhyesglviptvklrclll
-- DO NOT run the rollback section unless explicitly instructed.
-- This script does not create/drop/recreate the trigger, backfill users, or change grants.

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

-- Immediate verification: function properties and current trigger wiring.
select
  p.oid::regprocedure as function_name,
  p.prosecdef as security_definer,
  p.proconfig as function_config,
  pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname = 'handle_new_user';

select
  n.nspname as trigger_schema,
  c.relname as table_name,
  t.tgname as trigger_name,
  pg_get_triggerdef(t.oid) as trigger_definition
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'auth'
  and c.relname = 'users'
  and not t.tgisinternal
  and t.tgname = 'on_auth_user_created';

-- AFTER the one throwaway signup, replace the email below and run:
-- select
--   u.id,
--   u.email,
--   (select count(*) from public.profiles p where p.id = u.id) as profile_count,
--   (select count(*) from public.user_roles r where r.user_id = u.id and r.role = 'student') as student_role_count
-- from auth.users u
-- where u.email = 'THROWAWAY_EMAIL_HERE';
