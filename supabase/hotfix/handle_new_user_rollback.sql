-- ROLLBACK: exact current production definition captured before hotfix.
-- This restores the function body only; it does not modify the trigger.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to ''
as $function$
begin
insert into public.profiles(id,full_name) values(new.id,coalesce(nullif(new.raw_user_meta_data->>'full_name',''),nullif(new.raw_user_meta_data->>'name',''),split_part(coalesce(new.email,'CUSAT Student'),'@',1))) on conflict(id) do nothing;
insert into public.user_roles(user_id,role) values(new.id,'student') on conflict(user_id,role) do nothing;
return new;
end; $function$;
