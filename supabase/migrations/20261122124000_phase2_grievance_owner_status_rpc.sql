-- Owner status-only grievance RPC. NOT APPLIED TO PRODUCTION.
-- Returns no description or other confidential grievance fields.

create or replace function public.get_my_grievance_status()
returns table (
  id uuid,
  category text,
  status text,
  created_at timestamptz
)
language sql
security definer
set search_path=''
as $fn$
  select g.id, g.category, g.status, g.created_at
  from public.grievances as g
  where g.owner_id = (select auth.uid())
  order by g.created_at desc;
$fn$;

revoke all on function public.get_my_grievance_status() from public;
revoke execute on function public.get_my_grievance_status() from anon;
grant execute on function public.get_my_grievance_status() to authenticated;
