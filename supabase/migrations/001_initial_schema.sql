-- FanMap initial schema
-- Safe to run multiple times in dev (uses IF NOT EXISTS where possible)

create extension if not exists "pgcrypto";

-- NATIONS ---------------------------------------------------------------
create table if not exists public.nations (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  emoji text not null,
  primary_color text not null,
  secondary_color text not null,
  supporter_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists nations_supporter_count_idx
  on public.nations (supporter_count desc);

-- SUPPORTERS ------------------------------------------------------------
create table if not exists public.supporters (
  id uuid primary key default gen_random_uuid(),
  nation_id uuid not null references public.nations(id) on delete cascade,
  nickname text not null,
  city text,
  email text,
  referral_code text not null unique,
  referred_by uuid references public.supporters(id) on delete set null,
  supporter_number integer not null,
  ip_hash text,
  user_agent_hash text,
  created_at timestamptz not null default now()
);

create index if not exists supporters_nation_idx
  on public.supporters (nation_id, created_at desc);
create index if not exists supporters_city_idx
  on public.supporters (nation_id, city);
create index if not exists supporters_referral_idx
  on public.supporters (referral_code);

-- REFERRALS -------------------------------------------------------------
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_supporter_id uuid not null references public.supporters(id) on delete cascade,
  referred_supporter_id uuid not null references public.supporters(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (referrer_supporter_id, referred_supporter_id)
);

create index if not exists referrals_referrer_idx
  on public.referrals (referrer_supporter_id);

-- SHOP CLICKS -----------------------------------------------------------
create table if not exists public.shop_clicks (
  id uuid primary key default gen_random_uuid(),
  nation_id uuid references public.nations(id) on delete set null,
  supporter_id uuid references public.supporters(id) on delete set null,
  product_slug text not null,
  source_page text not null,
  created_at timestamptz not null default now()
);

create index if not exists shop_clicks_product_idx
  on public.shop_clicks (product_slug, created_at desc);
create index if not exists shop_clicks_nation_idx
  on public.shop_clicks (nation_id);

-- AUTO INCREMENT supporter_count + supporter_number ---------------------
create or replace function public.handle_new_supporter()
returns trigger
language plpgsql
as $$
declare
  next_num integer;
begin
  -- supporter_number is unique within a nation
  select coalesce(max(supporter_number), 0) + 1
    into next_num
  from public.supporters
  where nation_id = new.nation_id;

  new.supporter_number := next_num;

  update public.nations
     set supporter_count = supporter_count + 1
   where id = new.nation_id;

  return new;
end;
$$;

drop trigger if exists trg_handle_new_supporter on public.supporters;
create trigger trg_handle_new_supporter
before insert on public.supporters
for each row execute function public.handle_new_supporter();

-- Decrement counter when a supporter is deleted
create or replace function public.handle_delete_supporter()
returns trigger
language plpgsql
as $$
begin
  update public.nations
     set supporter_count = greatest(supporter_count - 1, 0)
   where id = old.nation_id;
  return old;
end;
$$;

drop trigger if exists trg_handle_delete_supporter on public.supporters;
create trigger trg_handle_delete_supporter
after delete on public.supporters
for each row execute function public.handle_delete_supporter();

-- Row Level Security ----------------------------------------------------
alter table public.nations       enable row level security;
alter table public.supporters    enable row level security;
alter table public.referrals     enable row level security;
alter table public.shop_clicks   enable row level security;

-- Public can read nations + their own supporter records (by id)
drop policy if exists "nations are readable" on public.nations;
create policy "nations are readable" on public.nations
  for select using (true);

drop policy if exists "supporters are readable" on public.supporters;
create policy "supporters are readable" on public.supporters
  for select using (true);

-- Writes happen server-side via service role; deny direct anon writes.
-- (No insert/update/delete policies = blocked for anon.)
