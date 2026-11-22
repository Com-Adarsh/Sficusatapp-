-- Phase 1 Supabase foundation
create extension if not exists pg_trgm;
create extension if not exists unaccent;
create extension if not exists vector;
create extension if not exists pgcrypto;

create schema if not exists private;

create type public.moderation_status as enum ('pending','approved','rejected');
create type public.user_role as enum ('student','moderator','admin','aashraya_coordinator','sahayi_coordinator');

create or replace function public.set_updated_at() returns trigger language plpgsql as $$begin new.updated_at=now(); return new; end$;


create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null,
 student_id text,
 roll_number text,
 department_id text,
 programme_id text,
 semester smallint check (semester between 1 and 10),
 year_of_study smallint check (year_of_study between 1 and 10),
 scheme text,
 campus text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table public.user_roles (
 user_id uuid not null references auth.users(id) on delete cascade,
 role public.user_role not null default 'student',
 created_at timestamptz not null default now(),
 primary key(user_id,role)
);

create or replace function private.has_role(required_role public.user_role) returns boolean
language sql stable security definer set search_path=''
as $$ select exists(select 1 from public.user_roles where user_id=(select auth.uid()) and role=required_role); $$;
revoke all on function private.has_role(public.user_role) from public, anon, authenticated;
grant execute on function private.has_role(public.user_role) to authenticated;

create table public.departments (
 id text primary key,
 slug text unique not null,
 name text not null unique,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table public.programmes (
 id text primary key,
 slug text unique not null,
 department_id text not null references public.departments(id) on delete restrict,
 level text not null check(level in ('UG','PG')),
 category text not null,
 name text not null,
 duration_years numeric(3,1) not null,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table public.resources (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid references auth.users(id) on delete set null,
 department_id text references public.departments(id),
 programme_id text references public.programmes(id),
 academic_year text,
 semester smallint check(semester between 1 and 10),
 course_code text,
 subject text,
 title text not null,
 description text,
 category text not null,
 status public.moderation_status not null default 'pending',
 published_at timestamptz,
 search_vector tsvector generated always as (
   to_tsvector('simple', (coalesce(title,'')||' '||coalesce(description,'')||' '||coalesce(subject,'')||' '||coalesce(course_code,'')))
 ) stored,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table public.resource_files (
 id uuid primary key default gen_random_uuid(),
 resource_id uuid not null references public.resources(id) on delete cascade,
 owner_id uuid references auth.users(id) on delete set null,
 storage_path text not null unique,
 original_filename text not null,
 mime_type text not null,
 byte_size bigint not null check(byte_size>0),
 sha256 text not null,
 created_at timestamptz not null default now()
);

create table public.opportunities (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid references auth.users(id) on delete set null,
 type text not null check(type in ('scholarship','internship','job','fellowship')),
 title text not null,
 organisation text not null,
 description text,
 eligibility text,
 location text,
 deadline timestamptz,
 source_url text not null,
 application_url text,
 last_verified_at timestamptz not null,
 status public.moderation_status not null default 'pending',
 search_vector tsvector generated always as (
   to_tsvector('simple', (coalesce(title,'')||' '||coalesce(organisation,'')||' '||coalesce(description,'')||' '||coalesce(eligibility,'')))
 ) stored,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table public.announcements (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid references auth.users(id) on delete set null,
 title text not null,
 body text not null,
 category text not null,
 source_url text,
 is_organisational boolean not null default false,
 status public.moderation_status not null default 'pending',
 published_at timestamptz,
 search_vector tsvector generated always as (
   to_tsvector('simple', (coalesce(title,'')||' '||coalesce(body,'')))
 ) stored,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table public.events (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid references auth.users(id) on delete set null,
 title text not null,
 description text,
 venue text,
 starts_at timestamptz,
 ends_at timestamptz,
 category text,
 status public.moderation_status not null default 'pending',
 published_at timestamptz,
 search_vector tsvector generated always as (to_tsvector('simple',(coalesce(title,'')||' '||coalesce(description,'')))) stored,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table public.event_registrations (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 event_id uuid not null references public.events(id) on delete cascade,
 created_at timestamptz not null default now(),
 unique(owner_id,event_id)
);

create table public.helpdesk_entries (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid references auth.users(id) on delete set null,
 module text not null,
 title text not null,
 description text,
 contact text,
 status public.moderation_status not null default 'pending',
 search_vector tsvector generated always as (to_tsvector('simple',(coalesce(title,'')||' '||coalesce(description,'')))) stored,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table public.issues (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid references auth.users(id) on delete set null,
 category text not null,
 title text not null,
 description text not null,
 anonymous boolean not null default true,
 status public.moderation_status not null default 'pending',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table public.interventions (
 id uuid primary key default gen_random_uuid(),
 issue_id uuid references public.issues(id) on delete cascade,
 owner_id uuid references auth.users(id) on delete set null,
 coordinator_id uuid references auth.users(id) on delete set null,
 note text not null,
 status text not null default 'open',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table public.grievances (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid references auth.users(id) on delete set null,
 tracking_token_hash text not null unique,
 title text not null,
 description text not null,
 category text not null,
 anonymous boolean not null default false,
 status text not null default 'open',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table public.grievance_updates (
 id uuid primary key default gen_random_uuid(),
 grievance_id uuid not null references public.grievances(id) on delete cascade,
 author_id uuid references auth.users(id) on delete set null,
 status text not null,
 note text,
 created_at timestamptz not null default now()
);

create table public.tickets (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid references auth.users(id) on delete set null,
 module text not null,
 title text not null,
 description text,
 status text not null default 'open',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table public.blood_requests (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid references auth.users(id) on delete set null,
 requester_name text not null,
 phone text not null,
 whatsapp text,
 consent boolean not null default false,
 blood_group text not null,
 units smallint not null check(units between 1 and 10),
 hospital text not null,
 district text not null,
 urgency text not null default 'normal',
 needed_by timestamptz,
 notes text,
 status text not null default 'pending',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table public.donors (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid unique references auth.users(id) on delete cascade,
 blood_group text not null,
 last_donation_date date,
 available boolean not null default true,
 eligible_from date,
 consent boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table public.donor_contact_details (
 donor_id uuid primary key references public.donors(id) on delete cascade,
 owner_id uuid unique not null references auth.users(id) on delete cascade,
 phone text,
 whatsapp text,
 email text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table public.donor_matches (
 id uuid primary key default gen_random_uuid(),
 blood_request_id uuid not null references public.blood_requests(id) on delete cascade,
 donor_id uuid not null references public.donors(id) on delete cascade,
 coordinator_id uuid references auth.users(id) on delete set null,
 consent_recorded_at timestamptz,
 status text not null default 'proposed',
 created_at timestamptz not null default now(),
 unique(blood_request_id,donor_id)
);

create table public.donation_camps (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid references auth.users(id) on delete set null,
 title text not null,
 venue text,
 starts_at timestamptz,
 ends_at timestamptz,
 status public.moderation_status not null default 'pending',
 description text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table public.scribe_requests (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 department_id text references public.departments(id),
 programme_id text references public.programmes(id),
 subject text not null,
 exam_date date not null,
 exam_time time,
 duration text,
 venue text,
 language text,
 special_requirements text,
 consent boolean not null default false,
 status text not null default 'pending',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table public.scribe_volunteers (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 department_id text references public.departments(id),
 programme_id text references public.programmes(id),
 semester smallint,
 subjects text,
 languages text,
 availability text not null,
 consent boolean not null default false,
 status text not null default 'pending',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table public.scribe_assignments (
 id uuid primary key default gen_random_uuid(),
 request_id uuid not null references public.scribe_requests(id) on delete cascade,
 volunteer_id uuid not null references public.scribe_volunteers(id) on delete cascade,
 coordinator_id uuid references auth.users(id) on delete set null,
 status text not null default 'proposed',
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(request_id,volunteer_id)
);

create table public.notifications (
 id uuid primary key default gen_random_uuid(),
 owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 title text not null,
 body text not null,
 read_at timestamptz,
 created_at timestamptz not null default now()
);

create table public.bookmarks (
 owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 resource_id uuid references public.resources(id) on delete cascade,
 opportunity_id uuid references public.opportunities(id) on delete cascade,
 created_at timestamptz not null default now(),
 check ((resource_id is not null) <> (opportunity_id is not null)),
 primary key(owner_id,resource_id,opportunity_id)
);

create table public.site_settings (
 key text primary key,
 value text,
 description text,
 updated_by uuid references auth.users(id) on delete set null,
 updated_at timestamptz not null default now()
);

create table public.audit_log (
 id uuid primary key default gen_random_uuid(),
 actor_id uuid references auth.users(id) on delete set null,
 action text not null,
 table_name text not null,
 row_id uuid,
 old_data jsonb,
 new_data jsonb,
 created_at timestamptz not null default now()
);

create index resources_search_idx on public.resources using gin(search_vector);
create index opportunities_search_idx on public.opportunities using gin(search_vector);
create index events_search_idx on public.events using gin(search_vector);
create index announcements_search_idx on public.announcements using gin(search_vector);
create index helpdesk_search_idx on public.helpdesk_entries using gin(search_vector);
create index resources_title_trgm_idx on public.resources using gin(title gin_trgm_ops);
create index opportunities_title_trgm_idx on public.opportunities using gin(title gin_trgm_ops);

do $$ declare t text; begin
 foreach t in array array['profiles','user_roles','departments','programmes','resources','resource_files','opportunities','announcements','events','event_registrations','helpdesk_entries','issues','interventions','grievances','grievance_updates','tickets','blood_requests','donors','donor_contact_details','donor_matches','donation_camps','scribe_requests','scribe_volunteers','scribe_assignments','notifications','bookmarks','site_settings','audit_log'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('alter table public.%I force row level security',t);
 end loop;
end $$;

-- Catalogue is public reference data.
create policy departments_public_read on public.departments for select to anon,authenticated using(true);
create policy programmes_public_read on public.programmes for select to anon,authenticated using(true);

-- Owner-scoped policies.
create policy profiles_self on public.profiles for all to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy roles_self_read on public.user_roles for select to authenticated using(user_id=auth.uid());
create policy roles_admin on public.user_roles for all to authenticated using(private.has_role('admin'::public.user_role)) with check(private.has_role('admin'::public.user_role));
create policy resources_owner on public.resources for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy resources_moderator on public.resources for select to authenticated using(private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role));
create policy resources_approved_public on public.resources for select to anon,authenticated using(status='approved');
create policy resource_files_owner on public.resource_files for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());

create policy opportunities_owner on public.opportunities for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy opportunities_moderator on public.opportunities for all to authenticated using(private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role)) with check(private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role));
create policy opportunities_public on public.opportunities for select to anon,authenticated using(status='approved');

create policy announcements_public on public.announcements for select to anon,authenticated using(status='approved');
create policy announcements_owner on public.announcements for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy announcements_moderator on public.announcements for all to authenticated using(private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role)) with check(private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role));

create policy events_public on public.events for select to anon,authenticated using(status='approved');
create policy events_owner on public.events for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy events_moderator on public.events for all to authenticated using(private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role)) with check(private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role));
create policy registrations_self on public.event_registrations for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());

create policy helpdesk_public on public.helpdesk_entries for select to anon,authenticated using(status='approved');
create policy helpdesk_owner on public.helpdesk_entries for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy helpdesk_moderator on public.helpdesk_entries for all to authenticated using(private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role)) with check(private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role));

create policy issues_owner on public.issues for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy issues_moderator on public.issues for all to authenticated using(private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role)) with check(private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role));
create policy interventions_owner on public.interventions for select to authenticated using(owner_id=auth.uid() or coordinator_id=auth.uid() or private.has_role('admin'::public.user_role) or private.has_role('moderator'::public.user_role));
create policy interventions_staff on public.interventions for all to authenticated using(coordinator_id=auth.uid() or private.has_role('admin'::public.user_role) or private.has_role('moderator'::public.user_role)) with check(coordinator_id=auth.uid() or private.has_role('admin'::public.user_role) or private.has_role('moderator'::public.user_role));

create policy grievances_owner on public.grievances for select to authenticated using(owner_id=auth.uid());
create policy grievances_insert on public.grievances for insert to authenticated with check(owner_id=auth.uid());
create policy grievance_updates_owner on public.grievance_updates for select to authenticated using(exists(select 1 from public.grievances g where g.id=grievance_id and (g.owner_id=auth.uid() or private.has_role('admin'::public.user_role) or private.has_role('moderator'::public.user_role))));
create policy grievance_updates_staff on public.grievance_updates for all to authenticated using(private.has_role('admin'::public.user_role) or private.has_role('moderator'::public.user_role)) with check(private.has_role('admin'::public.user_role) or private.has_role('moderator'::public.user_role));
create policy grievances_staff on public.grievances for all to authenticated using(private.has_role('admin'::public.user_role) or private.has_role('moderator'::public.user_role)) with check(private.has_role('admin'::public.user_role) or private.has_role('moderator'::public.user_role));

create policy tickets_owner on public.tickets for all to authenticated using(owner_id=auth.uid() or private.has_role('admin'::public.user_role) or private.has_role('moderator'::public.user_role)) with check(owner_id=auth.uid() or private.has_role('admin'::public.user_role) or private.has_role('moderator'::public.user_role));

create policy blood_requests_owner on public.blood_requests for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy blood_requests_coordinator on public.blood_requests for all to authenticated using(private.has_role('aashraya_coordinator'::public.user_role) or private.has_role('admin'::public.user_role)) with check(private.has_role('aashraya_coordinator'::public.user_role) or private.has_role('admin'::public.user_role));
create policy donors_owner on public.donors for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy donor_contact_owner on public.donor_contact_details for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy donor_contact_coordinator on public.donor_contact_details for select to authenticated using((private.has_role('aashraya_coordinator'::public.user_role) or private.has_role('admin'::public.user_role)) and exists(select 1 from public.donors d where d.id=donor_id and d.consent=true));
create policy matches_coordinator on public.donor_matches for all to authenticated using(private.has_role('aashraya_coordinator'::public.user_role) or private.has_role('admin'::public.user_role)) with check(private.has_role('aashraya_coordinator'::public.user_role) or private.has_role('admin'::public.user_role));
create policy camps_public on public.donation_camps for select to anon,authenticated using(status='approved');
create policy camps_coordinator on public.donation_camps for all to authenticated using(private.has_role('aashraya_coordinator'::public.user_role) or private.has_role('admin'::public.user_role)) with check(private.has_role('aashraya_coordinator'::public.user_role) or private.has_role('admin'::public.user_role));

create policy scribe_request_owner on public.scribe_requests for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy scribe_request_coordinator on public.scribe_requests for all to authenticated using(private.has_role('sahayi_coordinator'::public.user_role) or private.has_role('admin'::public.user_role)) with check(private.has_role('sahayi_coordinator'::public.user_role) or private.has_role('admin'::public.user_role));
create policy scribe_volunteer_owner on public.scribe_volunteers for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy scribe_volunteer_coordinator on public.scribe_volunteers for all to authenticated using(private.has_role('sahayi_coordinator'::public.user_role) or private.has_role('admin'::public.user_role)) with check(private.has_role('sahayi_coordinator'::public.user_role) or private.has_role('admin'::public.user_role));
create policy scribe_assignment_owner on public.scribe_assignments for select to authenticated using(exists(select 1 from public.scribe_volunteers v where v.id=volunteer_id and v.owner_id=auth.uid()) or exists(select 1 from public.scribe_requests r where r.id=request_id and r.owner_id=auth.uid()));
create policy scribe_assignment_coordinator on public.scribe_assignments for all to authenticated using(private.has_role('sahayi_coordinator'::public.user_role) or private.has_role('admin'::public.user_role)) with check(private.has_role('sahayi_coordinator'::public.user_role) or private.has_role('admin'::public.user_role));

create policy notifications_self on public.notifications for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy bookmarks_self on public.bookmarks for all to authenticated using(owner_id=auth.uid()) with check(owner_id=auth.uid());
create policy settings_admin on public.site_settings for all to authenticated using(private.has_role('admin'::public.user_role)) with check(private.has_role('admin'::public.user_role));
create policy audit_admin on public.audit_log for select to authenticated using(private.has_role('admin'::public.user_role));

create view public.public_issues with (security_barrier=true) as
select id,category,title,description,created_at from public.issues where status='approved' and anonymous=true;

create or replace function private.audit_privileged_change() returns trigger
language plpgsql security definer set search_path=''
as $$ begin if private.has_role('admin'::public.user_role) or private.has_role('moderator'::public.user_role) or private.has_role('aashraya_coordinator'::public.user_role) or private.has_role('sahayi_coordinator'::public.user_role) then insert into public.audit_log(actor_id,action,table_name,row_id,old_data,new_data) values(auth.uid(),tg_op,tg_table_name,coalesce(new.id,old.id),to_jsonb(old),to_jsonb(new)); end if; return coalesce(new,old); end $$;

do $$ declare t text; begin
 foreach t in array array['resources','opportunities','announcements','events','helpdesk_entries','issues','interventions','grievances','grievance_updates','tickets','blood_requests','donors','donor_contact_details','donor_matches','donation_camps','scribe_requests','scribe_volunteers','scribe_assignments','site_settings'] loop
  execute format('create trigger %I_updated_at before update on public.%I for each row execute function public.set_updated_at()',t||'_updated_at',t);
  execute format('create trigger %I_audit after insert or update or delete on public.%I for each row execute function private.audit_privileged_change()',t||'_audit',t);
 end loop;
end $$;

grant select on public.departments,public.programmes,public.public_issues to anon,authenticated;
grant select on public.resources,public.opportunities,public.announcements,public.events,public.helpdesk_entries,public.donation_camps to anon,authenticated;
revoke all on public.grievances,public.grievance_updates,public.blood_requests,public.donors,public.donor_contact_details,public.scribe_requests,public.scribe_volunteers,public.scribe_assignments from anon;


-- Storage: private resource files, with access controlled by storage.objects RLS.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('resource-files','resource-files',false,10485760,array['application/pdf','image/jpeg','image/png','image/webp'])
on conflict (id) do update set public=false,file_size_limit=10485760,allowed_mime_types=excluded.allowed_mime_types;

create policy resource_files_upload on storage.objects
for insert to authenticated
with check (bucket_id='resource-files' and owner_id=(select auth.uid()::text));

create policy resource_files_owner_read on storage.objects
for select to authenticated
using (bucket_id='resource-files' and owner_id=(select auth.uid()::text));

create policy resource_files_owner_delete on storage.objects
for delete to authenticated
using (bucket_id='resource-files' and owner_id=(select auth.uid()::text));

create policy resource_files_moderator_read on storage.objects
for select to authenticated
using (
 bucket_id='resource-files'
 and (private.has_role('moderator'::public.user_role) or private.has_role('admin'::public.user_role))
);

grant usage on schema private to authenticated;
