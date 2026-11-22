[object Object]
-- Pre-Phase-1 production tables required by the applied security migration.
create table public.leaderboard_sessions (
  id uuid primary key,
  ip_hash text,
  started_at timestamptz,
  expires_at timestamptz,
  submitted_at timestamptz
);
alter table public.leaderboard_sessions enable row level security;
create table public.leaderboard (
  id bigint generated always as identity primary key,
  run_id uuid unique references public.leaderboard_sessions(id),
  player_name text check (char_length(player_name) between 1 and 18),
  score integer check (score between 0 and 2000000),
  distance_meters integer check (distance_meters between 0 and 25000),
  blockades integer check (blockades between 0 and 5040),
  elapsed_seconds integer check (elapsed_seconds between 1 and 3600),
  created_at timestamptz default now()
);
alter table public.leaderboard enable row level security;
