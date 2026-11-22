do $$ begin
  if current_setting('app.settings.project_ref', true) = 'bdeuecrwqrnlwhxwbpmi' then raise exception 'REFUSED: production Supabase project ref'; end if;
end $$;

create or replace function private.donor_has_consent(donor_uuid uuid) returns boolean
language sql stable security definer set search_path=''
as $$ select exists(select 1 from public.donors where id=donor_uuid and consent=true); $$;
revoke all on function private.donor_has_consent(uuid) from public,anon,authenticated;
grant execute on function private.donor_has_consent(uuid) to authenticated;

drop policy if exists donor_contact_coordinator on public.donor_contact_details;
create policy donor_contact_coordinator on public.donor_contact_details for select to authenticated
using ((private.has_role('aashraya_coordinator'::public.user_role) or private.has_role('admin'::public.user_role))
  and private.donor_has_consent(donor_id));
