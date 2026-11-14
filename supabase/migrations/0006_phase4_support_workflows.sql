-- Phase 4: secure support workflows
-- Adds helpdesk tickets, grievance tracking, and role-scoped support operations.

create table if not exists public.helpdesk_tickets (
  id uuid primary key default gen_random_uuid(),
  ticket_code text unique not null,
  requester_id uuid not null references auth.users(id) on delete cascade,
  category text not null default 'general',
  subject text not null,
  description text not null,
  priority text not null default 'normal' check(priority in ('low','normal','high','urgent')),
  status text not null default 'open' check(status in ('open','in_progress','resolved','closed')),
  assigned_to uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.helpdesk_tickets enable row level security;

create index if not exists helpdesk_tickets_requester_idx on public.helpdesk_tickets(requester_id, created_at desc);
create index if not exists helpdesk_tickets_status_idx on public.helpdesk_tickets(status, created_at desc);

create policy "Users read own helpdesk tickets"
on public.helpdesk_tickets for select to authenticated
using ((select auth.uid()) = requester_id);

create policy "Users create own helpdesk tickets"
on public.helpdesk_tickets for insert to authenticated
with check ((select auth.uid()) = requester_id);

create policy "Support staff read helpdesk tickets"
on public.helpdesk_tickets for select to authenticated
using (
  exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name in ('moderator','super_admin')
  )
);

create policy "Support staff update helpdesk tickets"
on public.helpdesk_tickets for update to authenticated
using (
  exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name in ('moderator','super_admin')
  )
)
with check (
  exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name in ('moderator','super_admin')
  )
);

-- Anonymous grievances remain private, but the authenticated requester can still
-- track their own ticket. "Anonymous" means hidden from public display, not
-- inaccessible to the person who submitted it.
drop policy if exists "Users read own grievances" on public.grievances;
create policy "Users read own grievances"
on public.grievances for select to authenticated
using ((select auth.uid()) = requester_id);

drop policy if exists "Users read updates on own grievances" on public.grievance_updates;
create policy "Users read updates on own grievances"
on public.grievance_updates for select to authenticated
using (
  exists (
    select 1 from public.grievances g
    where g.id = grievance_id
      and g.requester_id = (select auth.uid())
  )
);

create policy "Support staff read grievances"
on public.grievances for select to authenticated
using (
  exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name in ('moderator','super_admin')
  )
);

create policy "Support staff update grievances"
on public.grievances for update to authenticated
using (
  exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name in ('moderator','super_admin')
  )
)
with check (
  exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name in ('moderator','super_admin')
  )
);

create policy "Support staff read grievance updates"
on public.grievance_updates for select to authenticated
using (
  exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name in ('moderator','super_admin')
  )
);

create policy "Support staff create grievance updates"
on public.grievance_updates for insert to authenticated
with check (
  exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name in ('moderator','super_admin')
  )
);

-- Keep the public issue board read-only for visitors. Authenticated students can
-- submit an issue through the UI; moderation remains staff-controlled.
create index if not exists issues_status_created_idx on public.issues(status, created_at desc);

create policy "Support staff moderate issues"
on public.issues for update to authenticated
using (
  exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name in ('moderator','super_admin')
  )
)
with check (
  exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name in ('moderator','super_admin')
  )
);

create policy "Support staff manage interventions"
on public.interventions for all to authenticated
using (
  exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name in ('moderator','super_admin')
  )
)
with check (
  exists (
    select 1
    from public.user_roles ur
    join public.roles r on r.id = ur.role_id
    where ur.user_id = (select auth.uid())
      and r.name in ('moderator','super_admin')
  )
);

create index if not exists grievance_updates_grievance_created_idx
on public.grievance_updates(grievance_id, created_at asc);
