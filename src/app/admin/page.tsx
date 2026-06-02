import { cookies } from "next/headers";
import { getAdminClient } from "@/lib/supabase";
import { ADMIN_COOKIE, isAdminCookieValid } from "@/lib/admin-auth";
import { getHostBattleState, getArchive, todayISO } from "@/lib/host-battle";
import {
  FIXTURES,
  HAS_REAL_FIXTURES,
  FIRST_FIXTURE_DATE,
  nextRealFixtureDate
} from "@/data/worldcup-2026-fixtures";
import { TEAMS, flagSrc } from "@/data/worldcup-2026-teams";
import { PRODUCTS, isCheckoutConfigured } from "@/lib/products";
import type { NationWithDelta } from "@/lib/stats";
import { AdminLogin } from "@/components/AdminLogin";
import { AdminStats, type AdminPayload } from "@/components/AdminStats";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const expected = process.env.ADMIN_PASSWORD;
  const cookieStore = cookies();
  const authed = isAdminCookieValid(cookieStore.get(ADMIN_COOKIE)?.value, expected);

  if (!authed) {
    return <AdminLogin configured={Boolean(expected)} />;
  }

  const data = await loadAdmin();
  if (!data) {
    return (
      <div className="container-wide py-16">
        <div className="chip">Admin</div>
        <h1 className="mt-3 h-display text-3xl font-bold">Supabase isn't configured.</h1>
        <p className="text-white/55 mt-2">
          Set <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
          <code>SUPABASE_SERVICE_ROLE_KEY</code> to see live data.
        </p>
      </div>
    );
  }
  return <AdminStats data={data} />;
}

async function loadAdmin(): Promise<AdminPayload | null> {
  const client = getAdminClient();
  if (!client) return null;

  const { data: nationsData } = await client
    .from("nations")
    .select("id,slug,name,emoji,primary_color,supporter_count")
    .order("supporter_count", { ascending: false });

  const nations = (nationsData ?? []).map((n) => ({
    slug: n.slug as string,
    name: n.name as string,
    emoji: n.emoji as string,
    primary_color: n.primary_color as string,
    supporter_count: n.supporter_count as number,
    share: 0
  }));
  const total = nations.reduce((s, n) => s + n.supporter_count, 0);
  for (const n of nations) n.share = total > 0 ? n.supporter_count / total : 0;

  const nationById = new Map<string, { name: string; emoji: string }>();
  for (const row of nationsData ?? []) {
    nationById.set(row.id as string, {
      name: row.name as string,
      emoji: row.emoji as string
    });
  }

  // City leaderboard (top 30 across all nations)
  const { data: citySupporters } = await client
    .from("supporters")
    .select("city,nation_id")
    .not("city", "is", null)
    .limit(2000);
  const cityCounts = new Map<string, number>();
  for (const r of citySupporters ?? []) {
    const nid = r.nation_id as string;
    const city = (r.city as string | null)?.trim();
    const nationName = nationById.get(nid)?.name;
    if (!city || !nationName) continue;
    const key = `${nationName}__${city}`;
    cityCounts.set(key, (cityCounts.get(key) ?? 0) + 1);
  }
  const city_leaderboard = Array.from(cityCounts.entries())
    .map(([k, count]) => {
      const [nation, city] = k.split("__");
      return { nation, city, count };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);

  // Referrals — top referrers
  const { data: refRows } = await client
    .from("referrals")
    .select("referrer_supporter_id")
    .limit(5000);
  const referrerCounts = new Map<string, number>();
  for (const r of refRows ?? []) {
    const id = r.referrer_supporter_id as string;
    referrerCounts.set(id, (referrerCounts.get(id) ?? 0) + 1);
  }
  const topReferrerIds = Array.from(referrerCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([id]) => id);

  let referrals: AdminPayload["referrals"] = [];
  if (topReferrerIds.length) {
    const { data: refs } = await client
      .from("supporters")
      .select("id,nickname,nation_id")
      .in("id", topReferrerIds);
    referrals = (refs ?? [])
      .map((r) => ({
        referrer: r.nickname as string,
        nation: nationById.get(r.nation_id as string)?.name ?? "—",
        count: referrerCounts.get(r.id as string) ?? 0
      }))
      .sort((a, b) => b.count - a.count);
  }

  // Shop clicks per product (top 30)
  const { data: clicks } = await client
    .from("shop_clicks")
    .select("product_slug")
    .limit(5000);
  const clickCounts = new Map<string, number>();
  for (const c of clicks ?? []) {
    const slug = c.product_slug as string;
    clickCounts.set(slug, (clickCounts.get(slug) ?? 0) + 1);
  }
  const shop_clicks = Array.from(clickCounts.entries())
    .map(([product_slug, count]) => ({ product_slug, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 30);

  // Recent supporters
  const { data: recent } = await client
    .from("supporters")
    .select("id,nickname,city,created_at,nation_id")
    .order("created_at", { ascending: false })
    .limit(20);
  const recent_supporters = (recent ?? []).map((r) => ({
    id: r.id as string,
    nickname: r.nickname as string,
    nation_name: nationById.get(r.nation_id as string)?.name ?? "—",
    nation_emoji: nationById.get(r.nation_id as string)?.emoji ?? "",
    city: (r.city as string | null) ?? null,
    created_at: r.created_at as string
  }));

  // Host Region Battle — driven by the TS fixtures data layer + live DB votes.
  const nationsForState: NationWithDelta[] = (nationsData ?? []).map((n) => ({
    id: n.id as string,
    slug: n.slug as string,
    name: n.name as string,
    emoji: n.emoji as string,
    primary_color: n.primary_color as string,
    secondary_color: n.primary_color as string,
    supporter_count: n.supporter_count as number,
    growth24h: 0
  }));
  const hostState = await getHostBattleState(nationsForState);
  const archiveEntries = await getArchive(nationsForState, 10);

  const host_battle: AdminPayload["host_battle"] = {
    date: hostState.date,
    data_source: hostState.hasRealFixtures ? "real" : "sample",
    votes_are_live: hostState.votesAreLive,
    total_fixtures: FIXTURES.length,
    real_fixtures: FIXTURES.filter((f) => !f.isSample).length,
    today_matches: hostState.matches.map((m) => ({
      a: m.teamA.name,
      b: m.teamB.name,
      city: m.hostCity,
      venue: m.venue,
      kickoff: m.kickoff,
      sample: m.isSample
    })),
    eligible: hostState.tallies.map((t) => ({
      name: t.team.name,
      votes: t.votes,
      share: t.share
    })),
    total_votes_today: hostState.totalVotes,
    archive: archiveEntries.map((a) => ({
      date: a.date,
      winner: a.winner?.name ?? "—",
      total_votes: a.totalVotes,
      sample: a.isSample
    }))
  };

  // System status (data layer — no DB needed for most of it).
  const system: AdminPayload["system"] = {
    supabase_connected: true,
    data_source: HAS_REAL_FIXTURES ? "real" : "missing",
    fixture_count: FIXTURES.length,
    first_fixture_date: FIRST_FIXTURE_DATE,
    next_fixture_date: nextRealFixtureDate(todayISO()),
    active_matches_today: hostState.hasRealFixtures ? hostState.matches.length : 0,
    missing_flags: TEAMS.filter((t) => !flagSrc(t.slug)).length,
    checkout_missing: PRODUCTS.filter((p) => !isCheckoutConfigured(p)).length
  };

  // Share stats.
  const { data: shareRows } = await client
    .from("share_events")
    .select("channel,nation_id")
    .limit(20000);
  const chCount = new Map<string, number>();
  const shareNation = new Map<string, number>();
  for (const r of shareRows ?? []) {
    const ch = (r.channel as string) ?? "other";
    chCount.set(ch, (chCount.get(ch) ?? 0) + 1);
    const nid = r.nation_id as string | null;
    if (nid) shareNation.set(nid, (shareNation.get(nid) ?? 0) + 1);
  }
  const shares: AdminPayload["shares"] = {
    total: (shareRows ?? []).length,
    by_channel: Array.from(chCount.entries())
      .map(([channel, count]) => ({ channel, count }))
      .sort((a, b) => b.count - a.count),
    top_nations: Array.from(shareNation.entries())
      .map(([id, count]) => ({ nation: nationById.get(id)?.name ?? "—", count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  };

  return {
    total_supporters: total,
    nations,
    city_leaderboard,
    referrals,
    shop_clicks,
    recent_supporters,
    host_battle,
    system,
    shares
  };
}
