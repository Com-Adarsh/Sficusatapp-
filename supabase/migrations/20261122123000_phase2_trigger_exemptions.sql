-- Phase 2 trigger exemptions. NOT APPLIED TO PRODUCTION.
-- UNTESTED until CI is green.
--
-- Trusted paths:
--   * Supabase Auth signup: session_user = supabase_auth_admin
--   * PostgREST/server service path: auth.role() = service_role
--
-- Do not use session_user = service_role: PostgREST normally connects as
-- authenticator and changes role to service_role from the JWT role claim.

create or replace function private.prevent_owner_moderation_change()
returns trigger
language plpgsql
security definer
set search_path=''
as $fn$
declare
  old_row jsonb := to_jsonb(old);
  new_row jsonb := to_jsonb(new);
  protected_column text;
begin
  if session_user = 'supabase_auth_admin'
     or auth.role() = 'service_role' then
    return new;
  end if;

  if private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role) then
    return new;
  end if;

  if new_row ? 'owner_id' and new_row->'owner_id' is distinct from old_row->'owner_id' then
    raise exception 'owner_id may only be changed by staff';
  end if;

  foreach protected_column in array[
    'verified','reviewed_by','reviewed_at','published_at',
    'rejection','rejection_reason','rejected_at',
    'moderation_status','moderated_by','moderated_at',
    'attended','checked_in','check_in_at','checkin_at'
  ] loop
    if new_row ? protected_column
       and new_row->protected_column is distinct from old_row->protected_column then
      raise exception '% may only be changed by staff', protected_column;
    end if;
  end loop;

  if tg_table_name in ('resources','opportunities','helpdesk_entries','issues')
     and new_row ? 'status'
     and old_row->>'status' = 'approved'
     and new_row->>'status' <> 'pending' then
    new := jsonb_populate_record(new, jsonb_build_object('status','pending'));
    if new_row ? 'published_at' then
      new := jsonb_populate_record(new, jsonb_build_object('published_at',null));
    end if;
    new_row := to_jsonb(new);
  end if;

  if new_row ? 'status' and new_row->'status' is distinct from old_row->'status' then
    if tg_table_name in ('resources','opportunities','helpdesk_entries','issues')
       and old_row->>'status' = 'approved'
       and new_row->>'status' = 'pending' then
      null;
    else
      raise exception 'moderation status may only be changed by staff';
    end if;
  end if;

  return new;
end;
$fn$;

create or replace function private.prevent_owner_moderation_insert()
returns trigger
language plpgsql
security definer
set search_path=''
as $fn$
declare
  row_data jsonb := to_jsonb(new);
  col text;
  forced jsonb := '{}'::jsonb;
begin
  if session_user = 'supabase_auth_admin'
     or auth.role() = 'service_role' then
    return new;
  end if;

  if private.has_role('moderator'::public.user_role)
     or private.has_role('admin'::public.user_role)
     or private.has_role('grievance_officer'::public.user_role) then
    return new;
  end if;

  foreach col in array[
    'verified','attended','checked_in','check_in_at','checkin_at',
    'reviewed_by','reviewed_at','published_at',
    'rejection','rejection_reason','rejected_at',
    'moderation_status','moderated_by','moderated_at',
    'assignee_id','assigned_to','reviewer_id'
  ] loop
    if row_data ? col then
      forced := forced || jsonb_build_object(col, null);
    end if;
  end loop;

  if tg_table_name = 'profiles'
     and row_data ? 'id'
     and row_data->>'id' is distinct from auth.uid()::text then
    raise exception 'profile id may only be set to the current user';
  end if;

  if row_data ? 'status' then
    if tg_table_name in ('resources','opportunities','helpdesk_entries','issues',
                         'scribe_volunteers','scribe_requests') then
      forced := forced || jsonb_build_object('status','pending');
    elsif tg_table_name = 'blood_requests' then
      forced := forced || jsonb_build_object('status','pending');
    elsif tg_table_name in ('grievances','tickets') then
      forced := forced || jsonb_build_object('status','open');
    end if;
  end if;

  return jsonb_populate_record(new, forced);
end;
$fn$;
