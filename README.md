# FanMap

> Join your nation. Grow the map.

FanMap is an independent fan map for the 2026 football summer. Users pick a nation, get a free digital supporter jersey, and every supporter grows their nation's territory on a live world map.

It runs **two maps**:

- **Global FanMap** — permanent. Joining a nation once grows that nation's colors on a real-world-style world map, weighted by total supporters and anchored to each nation's home region. It **never resets**.
- **Daily Host Region Battle** — daily. One combined host region (**USA + Canada + Mexico together**, never split) is fought over each day. Only the nations playing that day are eligible. Fans check in once per day for the side they back, and check-ins paint territory across the whole region until the daily reset (00:00 UTC). Each day's winner is archived.

This repo is the launchable MVP — Next.js App Router, TypeScript, Tailwind, Supabase, Vercel-ready.

## Disclaimer

FanMap is an independent fan project and is not affiliated with FIFA, any tournament organizer, football federation, or national team. All visuals, names, and colors are original to the FanMap supporter palette.

---

## Stack

- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS with a custom premium design system
- Supabase (Postgres) for nations, supporters, referrals, shop clicks
- Vercel-ready (Node runtime API routes)

## Pages

| Route | Purpose |
|---|---|
| `/` | Premium landing — hero, Global FanMap, Daily Host Region Battle, ranking, rival battles, fan jersey preview, shop preview, how it works |
| `/join` | Joining flow with live jersey preview, referral via `?ref=CODE` |
| `/nation/[slug]` | Nation page — hero, Global FanMap, today's host-battle status + check-in, rivalries, city leaderboard, sponsor slot, nation shop |
| `/card/[supporterId]` | Free supporter jersey with one-tap sharing, host-battle check-in, matchday shop CTA |
| `/battle` | Daily Host Region Battle — combined USA·Canada·Mexico map, eligible nations, live standings, countdown, daily check-in |
| `/battle/archive` | Archive of past daily host-region winners (combined region, not per country) |
| `/shop` | Independent fan shop with click tracking |
| `/admin` | Password-protected ops dashboard (incl. host-battle status, eligible nations, daily votes, archived winners, fixture count) |

API routes: `/api/join`, `/api/shop-click`, `/api/admin/login`, `/api/battle/vote`, `/api/battle/close`.

## Getting started

```bash
# Install
npm install

# Configure env (copy and fill values)
cp .env.example .env.local

# Run dev
npm run dev

# Verify
npm run typecheck
npm run build
```

Then open http://localhost:3000.

## Environment variables

See [.env.example](./.env.example).

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes (prod) | Public Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes (prod) | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | yes (prod) | Server-only key for inserts. **Never expose.** |
| `NEXT_PUBLIC_SITE_URL` | yes | Used for share links |
| `ADMIN_PASSWORD` | yes | Required for `/admin` |
| `NEXT_PUBLIC_SHOP_URL` | no | Checkout base URL. Until set, shop shows "Coming soon" (no fake buying). |

> **Values with special characters (e.g. `ADMIN_PASSWORD`):** wrap the value in double quotes so a `#` isn't read as an inline comment (which silently truncates the value). A literal `$` must be escaped as `\$`, otherwise `$NAME` is expanded as a variable reference. Example: `ADMIN_PASSWORD="your#password$with-special-chars"` → use `"your#password\$with-special-chars"` to keep the `$` literal. Restart the dev server after editing `.env.local` — a running server keeps the old values.

Without Supabase configured the app still renders — it falls back to seed data so design previews work locally.

## Supabase

Run the migrations in [supabase/migrations](./supabase/migrations) in order:

1. `001_initial_schema.sql` — nations, supporters, referrals, shop_clicks + triggers
2. `002_seed_nations.sql` — the **48 real 2026 teams** (hosts + drawn qualifiers, groups A–L), upsert
3. `003_host_battle.sql` — storage tables only: `daily_host_votes`, `daily_host_snapshots`, optional `matches`
4. `004_share_events.sql` — `share_events` (channel, asset_type, nation, supporter, referral) for share analytics

You can run them via the Supabase SQL editor or `supabase db push`.

Teams + fixtures are defined in the TypeScript **data layer** (see below); the DB just records supporters, votes, and archived winners.

### Data model

- `nations` — slug, name, emoji, primary/secondary color, supporter_count
- `supporters` — nation_id, nickname, city, email, referral_code, referred_by, supporter_number, hashed ip/ua
- `referrals` — referrer/referred supporter IDs
- `shop_clicks` — product_slug, source_page, optional nation/supporter
- `daily_host_votes` — one check-in per `voter_key` per `vote_date` (unique), with nation_id + optional supporter_id
- `daily_host_snapshots` — archived daily result for the combined host region: snapshot_date (unique), winner_nation_id, total_votes, results jsonb
- `matches` — optional DB fixture mirror (the app reads fixtures from the TS data layer)

Counters are kept correct by triggers: `supporter_count` auto-increments on insert and decrements on delete; `supporter_number` is assigned per nation.

RLS is enabled. Anon can **read** nations, supporters, host votes and snapshots. All **writes** go through API routes using the service role key (no anon write policies).

Without Supabase configured, both maps still render from seed data so design previews work locally.

## Tournament data layer (teams + fixtures)

Teams and fixtures live in TypeScript so they are easy to read, diff, and update:

- **`src/data/worldcup-2026-teams.ts`** — the **48 participating teams only** (hosts + drawn qualifiers, groups A–L). Each team has: `slug`, `name`, `shortName`, `emojiFlag`, `flagColors`, `flagPatternType`, `group`, `qualified`, `primaryFanCollectionName`, plus a world-map `home` and a seed `supporter_count`. Teams not in the tournament are **not** seeded. Update this file (and re-run `002_seed_nations.sql`) if the participant list changes.
- **`src/data/worldcup-2026-fixtures.ts`** — the match schedule, encoded **from `data/Spielplan.pdf`** (the official 2026 schedule). All **72 group-stage matches** are included as **real** fixtures (`isSample: false`) with date, kickoff (CEST, as printed in the Spielplan), host city, venue, and group. **Where to add/edit fixtures:** append rows to `GROUP_STAGE` as `[group, "YYYY-MM-DD", "HH:MM", cityKey, teamA, teamB]`; the venue + country resolve from the host city. A nation is eligible for a day's battle by appearing in a real fixture on that `matchDate`.

The app **clearly distinguishes real vs preview** everywhere (and `/admin` shows the data source). When there is no match on the current day, the Host Region Battle shows **"No matchday battle today. Next battle: [date] — [Team A] vs [Team B]"** and does **not** record check-ins.

## Flags

Real national flags live in **`public/flags/<code>.svg`** (e.g. `tr.svg`, `ch.svg`, `pt.svg`, `br.svg`, plus `gb-eng.svg` / `gb-sct.svg`). All 48 participating teams have an asset. `flagSrc(slug)` in the teams data resolves the path; `FlagBadge` and the territory maps render the real flag, with the CSS-art renderer kept only as a fallback.

- **Source / license:** [flag-icons](https://github.com/lipis/flag-icons) by Panayiotis Lipiridis — **MIT**. The SVGs are vendored into `public/flags/` (the npm package is not a runtime dependency). National flags only — no federation crests or team logos.

## The two maps

### Global FanMap (permanent) — map-first

- **Real geographic world map.** `src/data/world-countries.generated.ts` holds 176 real country polygons (Natural Earth 110m via `world-atlas`, **public domain**) projected with `d3-geo` (Natural Earth projection). Generated once by `scripts/gen-world.mjs` — the geo libs are **dev-only**, so the app bundle ships just the static paths.
- **Country = territory.** `src/lib/worldgeo.ts` `allocateWorldGeo()` assigns every real country to the FanMap nation with the best supporter-weighted geographic proximity (each nation force-claims its own homeland). Bigger nations own bigger, contiguous slabs of the real world — a Risk-style takeover.
- **One real flag per region.** `GlobalWorldMap` (`src/components/GlobalWorldMap.tsx`) clips each country to its owner's **real flag** (`public/flags`), with glowing borders, big nation labels (TUR, USA, BRA…) and a dark cinematic ocean. It fills the homepage above the fold (`MapHero`).
- **Select-to-expand.** Choosing a nation dims the rest, glows its territory, and animates its flag growing into new countries (a 2.2× supporter "surge"), then shows a growth moment + "Claim your supporter poster". `focusSlug` zooms the map to a nation's empire (used on `/nation/[slug]`).
- Driven by `nations.supporter_count`. Joining grows it permanently.

### Daily Host Region Battle (resets daily, UTC) — secondary

- `HostRegionMap` renders the **combined USA + Canada + Mexico + Central America silhouette** (real country polygons from the same geo data) as **one** battlefield, split into real-flag regions by today's vote share. Never split into separate country battles.
- State in `src/lib/host-battle.ts`: `getHostBattleState()` reads today's **real fixtures** from the data layer to find eligible nations + matches, tallies `daily_host_votes`, and computes shares + leader. `getArchive()` reads `daily_host_snapshots`.
- **Eligibility:** only nations in a real fixture for the current UTC date. `/battle` and the homepage show today's date, active matches (Team A vs Team B, kickoff, host city/stadium), eligible nations, leader, vote share, countdown, and yesterday's winner.
- **Voting / check-in:** a device gets a random `voter_key` in localStorage. `POST /api/battle/vote` validates eligibility against the real fixtures and records one vote per `voter_key` per UTC day (DB unique index); a second attempt returns the existing pick.
- **Reset:** keyed by UTC date — resets automatically at 00:00 UTC.

### Archiving daily winners

The live battle resets by date automatically. To freeze a day's winner into the archive, call the admin-guarded endpoint (defaults to the previous UTC day):

```bash
curl -X POST https://your-site/api/battle/close \
  -H 'content-type: application/json' \
  -d '{"password":"YOUR_ADMIN_PASSWORD"}'
```

Run it shortly after 00:00 UTC (e.g. from a Vercel Cron job or any scheduler). It tallies `daily_host_votes` for the day and upserts a `daily_host_snapshots` row. You can pass `{"date":"YYYY-MM-DD"}` to archive a specific day.

## Visual system

- Dark cinematic base (`#05060A`) with neon cyan/violet/magenta accents
- Glass panels, subtle grid background, lightweight SVG **flag-territory** maps (Global FanMap + host region) — no heavy 3D
- Premium typography (Sora display + Inter body) loaded from Google Fonts
- Mobile-first; reduced-motion friendly

## Brand safety

This is an independent fan project. National **flags and flag-inspired colors/motifs are used** (flags are not protected the way logos are). We deliberately avoid:

- FIFA logos, federation crests, official tournament logos, official mascots, official trophy imagery
- National-team logos and replicas of official jerseys
- Any wording that implies affiliation with FIFA, organizers, federations, or national teams

Supporter gear is original and flag-inspired, organized into collections: "Red Wave", "Alpine Red", "Yellow Wave", and "Green Red" Supporter Collections, plus universal gear (Supporter Scarf, Sticker Pack, Matchday Mug, Wall Poster). Every shop surface carries: _"Independent supporter products. No official team or tournament affiliation."_

## Roadmap (post-MVP, not in this drop)

- Server-side render of the supporter card to PNG (so "download card" is one tap on iOS)
- Real-time supporter feed via Supabase Realtime
- Per-day growth rollup so the "fastest growing today" stat reads from a materialized view
- Stripe-backed checkout for the fan shop
- Email digest for verified supporters

## License

Independent fan project. Code is the author's own.
