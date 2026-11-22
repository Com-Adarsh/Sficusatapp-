-- Phase 2 auth foundation (DEV only).
-- This file is intentionally NOT applied to production jwhyesglviptvklrclll.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Auth must never fail because profile/role side effects fail.
  begin
    insert into public.profiles (id, full_name)
    values (
      new.id,
      coalesce(
        nullif(new.raw_user_meta_data ->> 'full_name', ''),
        nullif(new.raw_user_meta_data ->> 'name', ''),
        split_part(coalesce(new.email, 'CUSAT Student'), '@', 1),
        'CUSAT Student'
      )
    )
    on conflict (id) do nothing;
  exception when others then
    raise warning 'handle_new_user profile side effect failed: %: %', sqlstate, sqlerrm;
  end;

  begin
    insert into public.user_roles (user_id, role)
    values (new.id, 'student'::public.user_role)
    on conflict (user_id, role) do nothing;
  exception when others then
    raise warning 'handle_new_user role side effect failed: %: %', sqlstate, sqlerrm;
  end;

  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Idempotent backfill for users that existed before the signup trigger.
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
