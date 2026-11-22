-- Phase 2 auth trigger fail-safe hotfix.
-- Applied to production jwhyesglviptvklrclll via raw SQL on 2026-11-22.
-- Function-only change: no backfill and no trigger recreation.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
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
