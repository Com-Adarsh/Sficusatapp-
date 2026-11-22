create extension if not exists pgcrypto;

create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text,
 department_id uuid,
 programme_id uuid,
 year_of_study int,
 language text not null default 'en' check (language in ('en','ml')),
 verified_cusat boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.roles (
 id uuid primary key default gen_random_uuid(),
 name text unique not null check (name in ('student','blood_donor','scribe_volunteer','cultural_volunteer','initiative_coordinator','moderator','super_admin'))
);

create table if not exists public.user_roles (
 user_id uuid references auth.users(id) on delete cascade,
 role_id uuid references public.roles(id) on delete cascade,
 initiative text check (initiative in ('aashraya','sahayi','samskara') or initiative is null),
 created_at timestamptz not null default now(),
 primary key(user_id,role_id)
);

create table if not exists public.departments (
 id uuid primary key default gen_random_uuid(),
 name text unique not null,
 code text unique,
 created_at timestamptz not null default now()
);

create table if not exists public.programmes (
 id uuid primary key default gen_random_uuid(),
 department_id uuid references public.departments(id),
 name text not null,
 code text,
 scheme_year text,
 created_at timestamptz not null default now()
);

create table if not exists public.courses (
 id uuid primary key default gen_random_uuid(),
 programme_id uuid references public.programmes(id),
 semester int,
 code text,
 title text not null,
 created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

create policy "users can read own profile" on public.profiles for select using (auth.uid() = id);
create policy "users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

create policy "users can read own roles" on public.user_roles for select using (auth.uid() = user_id);

insert into public.roles(name) values
 ('student'),('blood_donor'),('scribe_volunteer'),('cultural_volunteer'),
 ('initiative_coordinator'),('moderator'),('super_admin')
on conflict (name) do nothing;
