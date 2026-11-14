create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  resource_type text not null check (resource_type in ('notes','question_paper','syllabus','academic_update')),
  department_id uuid references public.departments(id),
  programme_id uuid references public.programmes(id),
  semester int,
  course_id uuid references public.courses(id),
  scheme_year text,
  file_path text,
  external_url text,
  uploader_id uuid not null references auth.users(id) on delete cascade,
  rights_confirmed boolean not null default false,
  status text not null default 'pending' check (status in ('pending','published','rejected','archived')),
  download_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.donors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  blood_group text not null check (blood_group in ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  last_donation_date date,
  next_eligible_date date,
  availability text not null default 'available' check (availability in ('available','temporarily_unavailable')),
  area text,
  contact_preference text not null default 'reveal_after_accept' check (contact_preference in ('reveal_after_accept','coordinator_only')),
  recognition_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blood_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  blood_group text not null check (blood_group in ('A+','A-','B+','B-','AB+','AB-','O+','O-')),
  units int not null check (units > 0),
  hospital text not null,
  district text not null,
  urgency text not null default 'routine' check (urgency in ('routine','urgent','emergency')),
  needed_by timestamptz not null,
  additional_info text,
  status text not null default 'open' check (status in ('open','matched','fulfilled','expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blood_request_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.blood_requests(id) on delete cascade,
  donor_id uuid not null references public.donors(id) on delete cascade,
  response text not null check (response in ('yes','no')),
  responded_at timestamptz not null default now(),
  unique(request_id, donor_id)
);

create table if not exists public.accessibility_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  private_notes text,
  supporting_document_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scribe_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references auth.users(id) on delete cascade,
  course_or_programme text not null,
  paper_or_subject text not null,
  exam_date date not null,
  exam_time time not null,
  duration text,
  venue text,
  language text,
  special_requirements text,
  status text not null default 'open' check (status in ('open','matching','assigned','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scribe_volunteers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  department_programme text,
  semester int,
  subjects text,
  languages text,
  availability text,
  status text not null default 'pending' check (status in ('pending','approved','paused','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scribe_assignments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.scribe_requests(id) on delete cascade,
  volunteer_id uuid not null references public.scribe_volunteers(id) on delete cascade,
  coordinator_id uuid references auth.users(id),
  status text not null default 'proposed' check (status in ('proposed','confirmed','declined','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(request_id, volunteer_id)
);

create index if not exists resources_filters_idx on public.resources(resource_type, programme_id, semester, status);
create index if not exists blood_requests_open_idx on public.blood_requests(status, blood_group, district);
create index if not exists scribe_requests_open_idx on public.scribe_requests(status, exam_date);

alter table public.resources enable row level security;
alter table public.donors enable row level security;
alter table public.blood_requests enable row level security;
alter table public.blood_request_responses enable row level security;
alter table public.accessibility_profiles enable row level security;
alter table public.scribe_requests enable row level security;
alter table public.scribe_volunteers enable row level security;
alter table public.scribe_assignments enable row level security;

create policy "published resources are readable" on public.resources for select to anon, authenticated using (status = 'published');
create policy "users can read own resource submissions" on public.resources for select to authenticated using ((select auth.uid()) = uploader_id);
create policy "users can submit resources" on public.resources for insert to authenticated with check ((select auth.uid()) = uploader_id);
create policy "users can edit own pending resources" on public.resources for update to authenticated using ((select auth.uid()) = uploader_id and status = 'pending') with check ((select auth.uid()) = uploader_id and status = 'pending');

create policy "donors can manage own record" on public.donors for select to authenticated using ((select auth.uid()) = user_id);
create policy "donors can register own record" on public.donors for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "donors can update own record" on public.donors for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "requesters can manage own blood requests" on public.blood_requests for select to authenticated using ((select auth.uid()) = requester_id);
create policy "requesters can create blood requests" on public.blood_requests for insert to authenticated with check ((select auth.uid()) = requester_id);
create policy "requesters can update own open requests" on public.blood_requests for update to authenticated using ((select auth.uid()) = requester_id and status in ('open','matched')) with check ((select auth.uid()) = requester_id);

create policy "donors can see own responses" on public.blood_request_responses for select to authenticated using (exists (select 1 from public.donors d where d.id = donor_id and d.user_id = (select auth.uid())));
create policy "donors can respond as themselves" on public.blood_request_responses for insert to authenticated with check (exists (select 1 from public.donors d where d.id = donor_id and d.user_id = (select auth.uid())));

create policy "users can manage own accessibility profile" on public.accessibility_profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "users can create own accessibility profile" on public.accessibility_profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users can update own accessibility profile" on public.accessibility_profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "requesters can manage own scribe requests" on public.scribe_requests for select to authenticated using ((select auth.uid()) = requester_id);
create policy "requesters can create scribe requests" on public.scribe_requests for insert to authenticated with check ((select auth.uid()) = requester_id);
create policy "requesters can update own open scribe requests" on public.scribe_requests for update to authenticated using ((select auth.uid()) = requester_id and status in ('open','matching')) with check ((select auth.uid()) = requester_id);

create policy "volunteers can manage own profile" on public.scribe_volunteers for select to authenticated using ((select auth.uid()) = user_id);
create policy "volunteers can register themselves" on public.scribe_volunteers for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "volunteers can update own pending profile" on public.scribe_volunteers for update to authenticated using ((select auth.uid()) = user_id and status in ('pending','approved','paused')) with check ((select auth.uid()) = user_id);

create policy "assigned parties can read assignment" on public.scribe_assignments for select to authenticated using (
  (select auth.uid()) = coordinator_id
  or exists (select 1 from public.scribe_requests r where r.id = request_id and r.requester_id = (select auth.uid()))
  or exists (select 1 from public.scribe_volunteers v where v.id = volunteer_id and v.user_id = (select auth.uid()))
);

comment on table public.accessibility_profiles is 'Private accessibility information. Never expose in public URLs, analytics, or public issue boards.';
comment on table public.donors is 'Sensitive donor information. Public views must expose aggregate counts only.';
comment on table public.blood_requests is 'Sensitive support request data. Public views must not expose requester contact information.';
