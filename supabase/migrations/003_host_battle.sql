-- FanMap — Daily Host Region Battle (storage only).
--
-- Fixtures + teams now live in the TypeScript data layer (src/data). This
-- migration only creates the tables used to RECORD activity:
--   daily_host_votes      — one check-in per voter per day
--   daily_host_snapshots  — archived daily results for the combined host region
--                           (USA + Canada + Mexico treated as ONE battlefield)
--
-- `matches` is kept as an OPTIONAL mirror for teams who prefer DB-driven
-- fixtures, but the app reads fixtures from src/data/worldcup-2026-fixtures.ts.
-- No sample rows are inserted here — the app shows clearly-labeled sample
-- previews from the data layer until real fixtures are added.

create extension if not exists "pgcrypto";

-- MATCHES (optional fixture mirror) -------------------------------------
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  match_date date not null,
  nation_a_id uuid not null references public.nations(id) on delete cascade,
  nation_b_id uuid not null references public.nations(id) on delete cascade,
  host_city text,
  venue text,
  stage text,
  is_sample boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists matches_date_idx on public.matches (match_date);

-- DAILY HOST VOTES ------------------------------------------------------
-- One check-in per voter_key per day. voter_key is a device/supporter token.
create table if not exists public.daily_host_votes (
  id uuid primary key default gen_random_uuid(),
  vote_date date not null,
  nation_id uuid not null references public.nations(id) on delete cascade,
  supporter_id uuid references public.supporters(id) on delete set null,
  voter_key text not null,
  created_at timestamptz not null default now(),
  unique (vote_date, voter_key)
);
create index if not exists daily_host_votes_date_idx on public.daily_host_votes (vote_date);
create index if not exists daily_host_votes_date_nation_idx
  on public.daily_host_votes (vote_date, nation_id);

-- DAILY HOST SNAPSHOTS (archive) ---------------------------------------
create table if not exists public.daily_host_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_date date not null unique,
  winner_nation_id uuid references public.nations(id) on delete set null,
  total_votes integer not null default 0,
  results jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists daily_host_snapshots_date_idx
  on public.daily_host_snapshots (snapshot_date desc);

-- RLS -------------------------------------------------------------------
alter table public.matches              enable row level security;
alter table public.daily_host_votes     enable row level security;
alter table public.daily_host_snapshots enable row level security;

drop policy if exists "matches readable" on public.matches;
create policy "matches readable" on public.matches for select using (true);

drop policy if exists "host votes readable" on public.daily_host_votes;
create policy "host votes readable" on public.daily_host_votes for select using (true);

drop policy if exists "host snapshots readable" on public.daily_host_snapshots;
create policy "host snapshots readable" on public.daily_host_snapshots for select using (true);
-- Writes happen server-side via the service role (no anon write policies).
