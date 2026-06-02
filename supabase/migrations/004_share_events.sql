-- FanMap — share tracking. Records each share/download action so we can see
-- which channels drive growth and which nations share most.

create extension if not exists "pgcrypto";

create table if not exists public.share_events (
  id uuid primary key default gen_random_uuid(),
  supporter_id uuid references public.supporters(id) on delete set null,
  nation_id uuid references public.nations(id) on delete set null,
  channel text not null,        -- whatsapp | instagram | tiktok | facebook | x | copy | download | native
  asset_type text,              -- link | poster_story | poster_square
  referral_code text,
  created_at timestamptz not null default now()
);

create index if not exists share_events_channel_idx on public.share_events (channel);
create index if not exists share_events_created_idx on public.share_events (created_at desc);
create index if not exists share_events_nation_idx on public.share_events (nation_id);

alter table public.share_events enable row level security;
drop policy if exists "share events readable" on public.share_events;
create policy "share events readable" on public.share_events for select using (true);
-- Writes happen server-side via the service role (no anon write policy).
