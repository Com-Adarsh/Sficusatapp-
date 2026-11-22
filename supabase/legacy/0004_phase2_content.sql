-- Phase 2 content model: opportunities, announcements, and Samskara culture.
-- Apply this migration to the dedicated SFI CUSAT Supabase project.
create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('scholarship','internship','job','fellowship')),
  organisation text not null,
  description text,
  eligibility text,
  deadline timestamptz,
  location text,
  amount text,
  apply_url text,
  tags text[] not null default '{}',
  verified boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published','expired')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists opportunities_category_deadline_idx on public.opportunities(category, deadline);
alter table public.opportunities enable row level security;
create policy "Published opportunities are public" on public.opportunities for select to anon, authenticated using (status='published' and (deadline is null or deadline >= now()));
create policy "Users can manage their own opportunity drafts" on public.opportunities for all to authenticated using ((select auth.uid())=created_by) with check ((select auth.uid())=created_by);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  category text not null default 'general',
  source_url text,
  pinned boolean not null default false,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists announcements_status_published_idx on public.announcements(status, published_at desc);
alter table public.announcements enable row level security;
create policy "Published announcements are public" on public.announcements for select to anon, authenticated using (status='published');
create policy "Users can manage their own announcement drafts" on public.announcements for all to authenticated using ((select auth.uid())=created_by) with check ((select auth.uid())=created_by);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  venue text,
  category text default 'cultural',
  status text not null default 'draft' check (status in ('draft','published','cancelled','completed')),
  registration_url text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists events_starts_at_idx on public.events(starts_at);
alter table public.events enable row level security;
create policy "Published events are public" on public.events for select to anon, authenticated using (status='published');
create policy "Users can manage their own event drafts" on public.events for all to authenticated using ((select auth.uid())=created_by) with check ((select auth.uid())=created_by);

create table if not exists public.magazine_issues (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issue_label text,
  pdf_url text,
  cover_url text,
  published_at timestamptz,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.magazine_issues enable row level security;
create policy "Published magazine issues are public" on public.magazine_issues for select to anon, authenticated using (status='published');
create policy "Users can manage their own magazine drafts" on public.magazine_issues for all to authenticated using ((select auth.uid())=created_by) with check ((select auth.uid())=created_by);

create table if not exists public.opportunity_bookmarks (
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (opportunity_id, user_id)
);
alter table public.opportunity_bookmarks enable row level security;
create policy "Users manage their opportunity bookmarks" on public.opportunity_bookmarks for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

create table if not exists public.competitions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete set null,
  title text not null,
  rules text,
  registration_deadline timestamptz,
  mode text default 'individual' check (mode in ('individual','team','both')),
  status text not null default 'draft' check (status in ('draft','published','closed','completed')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.competitions enable row level security;
create policy "Published competitions are public" on public.competitions for select to anon, authenticated using (status='published');
create policy "Users manage their competition drafts" on public.competitions for all to authenticated using ((select auth.uid())=created_by) with check ((select auth.uid())=created_by);

create table if not exists public.competition_registrations (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  team_name text,
  status text not null default 'registered' check (status in ('registered','withdrawn','disqualified','winner')),
  created_at timestamptz not null default now(),
  unique (competition_id, user_id)
);
alter table public.competition_registrations enable row level security;
create policy "Users manage their competition registrations" on public.competition_registrations for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

create table if not exists public.gallery_albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_id uuid references public.events(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.gallery_albums enable row level security;
create policy "Published gallery albums are public" on public.gallery_albums for select to anon, authenticated using (status='published');
create policy "Users manage their gallery drafts" on public.gallery_albums for all to authenticated using ((select auth.uid())=created_by) with check ((select auth.uid())=created_by);

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.gallery_albums(id) on delete cascade,
  media_url text not null,
  caption text,
  consent_confirmed boolean not null default false,
  status text not null default 'pending' check (status in ('pending','approved','rejected','removed')),
  created_at timestamptz not null default now()
);
alter table public.gallery_items enable row level security;
create policy "Approved gallery items are public" on public.gallery_items for select to anon, authenticated using (status='approved');

create table if not exists public.volunteer_signups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  area text not null,
  availability text,
  status text not null default 'pending' check (status in ('pending','approved','rejected','completed')),
  created_at timestamptz not null default now()
);
alter table public.volunteer_signups enable row level security;
create policy "Users manage their volunteer signups" on public.volunteer_signups for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
