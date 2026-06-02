// Daily Host Region Battle data layer.
//
// ONE combined host-region battlefield: USA + Canada + Mexico together (never
// split). Only nations playing on a given day (real fixtures) are eligible.
// Fans check in once per day for an eligible nation; check-ins control territory
// across the full host-region map. Results reset daily (UTC) and are archived.
//
// Fixtures + teams come from the TS data layer (src/data). When there are NO
// real fixtures for today, the app shows a clearly-labeled SAMPLE preview and a
// "no real fixtures loaded" notice — it never presents sample as real.

import { getPublicClient } from "./supabase";
import { getTeam, type Team } from "@/data/worldcup-2026-teams";
import {
  realFixturesOn,
  nextRealFixtureDate,
  type Fixture
} from "@/data/worldcup-2026-fixtures";
import type { NationWithDelta } from "./stats";

export type HostMatch = {
  id: string;
  teamA: Team;
  teamB: Team;
  kickoff: string | null;
  hostCity: string;
  venue: string;
  hostCountry: string;
  group: string;
  stage: string;
  isSample: boolean;
};

export type HostTally = { team: Team; votes: number; share: number };

export type HostBattleState = {
  date: string; // YYYY-MM-DD (UTC)
  /** true when today's slate is a sample/preview (no real fixtures loaded). */
  isSample: boolean;
  hasRealFixtures: boolean;
  /** true when tallies come from recorded DB votes (not preview numbers). */
  votesAreLive: boolean;
  matches: HostMatch[];
  /** Matches on the next real matchday (shown when there are none today). */
  nextMatches: HostMatch[];
  eligible: Team[];
  tallies: HostTally[];
  totalVotes: number;
  leader: Team | null;
  resetAtISO: string;
  nextRealDate: string | null;
};

export type ArchiveEntry = {
  date: string;
  isSample: boolean;
  winner: Team | null;
  totalVotes: number;
  results: Array<{ team: Team; votes: number }>;
};

// ---- Date helpers (UTC daily reset) ----------------------------------------

export function todayISO(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function nextResetISO(now: Date = new Date()): string {
  const next = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0, 0)
  );
  return next.toISOString();
}

function addDaysISO(iso: string, delta: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return d.toISOString().slice(0, 10);
}

function formatHumanDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  });
}
export { formatHumanDate };

// ---- Fixtures → matches ----------------------------------------------------

function toMatch(f: Fixture): HostMatch | null {
  const teamA = getTeam(f.teamA);
  const teamB = getTeam(f.teamB);
  if (!teamA || !teamB) return null;
  return {
    id: f.id,
    teamA,
    teamB,
    kickoff: f.kickoff,
    hostCity: f.hostCity,
    venue: f.venue,
    hostCountry: f.hostCountry,
    group: f.group,
    stage: f.stage,
    isSample: f.isSample
  };
}

// Deterministic sample slate (real teams, clearly labeled sample) so the preview
// is never empty when no real fixtures are scheduled today.
const SAMPLE_SLATE: Array<[string, string, string, string]> = [
  ["usa", "mexico", "Los Angeles", "SoFi Stadium"],
  ["canada", "brazil", "Toronto", "BMO Field"],
  ["turkiye", "portugal", "New York/New Jersey", "MetLife Stadium"]
];

function sampleMatches(): HostMatch[] {
  return SAMPLE_SLATE.map(([a, b, city, venue], i) => {
    const teamA = getTeam(a);
    const teamB = getTeam(b);
    if (!teamA || !teamB) return null;
    return {
      id: `sample-${i}`,
      teamA,
      teamB,
      kickoff: null,
      hostCity: city,
      venue,
      hostCountry: "USA",
      group: "—",
      stage: "Sample preview (not a real fixture)",
      isSample: true
    } as HostMatch;
  }).filter(Boolean) as HostMatch[];
}

function sampleVotes(slug: string, date: string): number {
  const seed = (slug + date)
    .split("")
    .reduce((acc, ch) => (acc * 31 + ch.charCodeAt(0)) >>> 0, 7);
  return 760 + (seed % 1850);
}

function dedupeTeams(list: Team[]): Team[] {
  const seen = new Set<string>();
  const out: Team[] = [];
  for (const t of list) {
    if (t && !seen.has(t.slug)) {
      seen.add(t.slug);
      out.push(t);
    }
  }
  return out;
}

function buildTallies(
  eligible: Team[],
  votesBySlug: Map<string, number>
): { tallies: HostTally[]; total: number; leader: Team | null } {
  const raw = eligible.map((team) => ({ team, votes: votesBySlug.get(team.slug) ?? 0 }));
  const total = raw.reduce((s, r) => s + r.votes, 0);
  const tallies = raw
    .map((r) => ({ ...r, share: total > 0 ? r.votes / total : 0 }))
    .sort((a, b) => b.votes - a.votes || a.team.slug.localeCompare(b.team.slug));
  return { tallies, total, leader: tallies[0]?.team ?? null };
}

// ---- Public reads ----------------------------------------------------------

export async function getHostBattleState(
  nations: NationWithDelta[],
  date: string = todayISO()
): Promise<HostBattleState> {
  const realToday = realFixturesOn(date);
  const hasRealFixtures = realToday.length > 0;

  // When there's no match today, preview the NEXT real matchday's teams (so the
  // map + standings are meaningful) — voting stays disabled (hasRealFixtures=false).
  const previewDate = hasRealFixtures ? null : nextRealFixtureDate(date);
  const previewFixtures = previewDate ? realFixturesOn(previewDate) : [];

  let matches: HostMatch[];
  if (hasRealFixtures) {
    matches = realToday.map(toMatch).filter(Boolean) as HostMatch[];
  } else {
    matches = previewFixtures.map(toMatch).filter(Boolean) as HostMatch[];
    if (!matches.length) matches = sampleMatches(); // no schedule loaded at all
  }
  const isSample = !hasRealFixtures;

  const eligible = dedupeTeams(matches.flatMap((m) => [m.teamA, m.teamB]));

  // Tallies — live DB counts only for REAL fixtures with Supabase configured.
  let votesBySlug = new Map<string, number>();
  let votesAreLive = false;

  const client = getPublicClient();
  if (hasRealFixtures && client) {
    const idBySlug = new Map<string, string>();
    for (const n of nations) if (n.id) idBySlug.set(n.slug, n.id);
    if (idBySlug.size) {
      try {
        const counts = await Promise.all(
          eligible.map((t) =>
            client
              .from("daily_host_votes")
              .select("id", { count: "exact", head: true })
              .eq("vote_date", date)
              .eq("nation_id", idBySlug.get(t.slug) ?? "")
          )
        );
        eligible.forEach((t, i) => votesBySlug.set(t.slug, counts[i].count ?? 0));
        votesAreLive = true;
      } catch {
        votesAreLive = false;
      }
    }
  }
  if (!votesAreLive) {
    for (const t of eligible) votesBySlug.set(t.slug, sampleVotes(t.slug, date));
  }

  const { tallies, total, leader } = buildTallies(eligible, votesBySlug);

  const nextRealDate = hasRealFixtures ? nextRealFixtureDate(addDaysISO(date, 1)) : previewDate;
  const nextMatches: HostMatch[] = hasRealFixtures ? [] : matches;

  return {
    date,
    isSample,
    hasRealFixtures,
    votesAreLive,
    matches,
    nextMatches,
    eligible,
    tallies,
    totalVotes: total,
    leader,
    resetAtISO: nextResetISO(),
    nextRealDate
  };
}

// Sample archive (real teams, clearly flagged) used before any real battle is
// archived or when Supabase isn't configured.
const SAMPLE_ARCHIVE: Array<{ delta: number; winner: string; total: number; results: Array<[string, number]> }> = [
  { delta: -1, winner: "brazil", total: 4820, results: [["brazil", 2010], ["argentina", 1640], ["turkiye", 1170]] },
  { delta: -2, winner: "turkiye", total: 3960, results: [["turkiye", 1880], ["germany", 1240], ["switzerland", 840]] },
  { delta: -3, winner: "morocco", total: 4410, results: [["morocco", 2050], ["france", 1560], ["spain", 800]] }
];

function sampleArchive(today: string): ArchiveEntry[] {
  return SAMPLE_ARCHIVE.map((s) => ({
    date: addDaysISO(today, s.delta),
    isSample: true,
    winner: getTeam(s.winner),
    totalVotes: s.total,
    results: s.results
      .map(([slug, votes]) => ({ team: getTeam(slug)!, votes }))
      .filter((r) => r.team)
  }));
}

export async function getArchive(
  nations: NationWithDelta[],
  limit = 30
): Promise<ArchiveEntry[]> {
  const client = getPublicClient();
  if (!client) return sampleArchive(todayISO());

  const { data, error } = await client
    .from("daily_host_snapshots")
    .select("snapshot_date,winner_nation_id,total_votes,results")
    .order("snapshot_date", { ascending: false })
    .limit(limit);

  if (error || !data || !data.length) return sampleArchive(todayISO());

  const byId = new Map<string, Team>();
  for (const n of nations) {
    const t = getTeam(n.slug);
    if (n.id && t) byId.set(n.id, t);
  }

  return data.map((row: Record<string, unknown>) => {
    const results = (Array.isArray(row.results) ? row.results : []) as Array<{ slug: string; votes: number }>;
    const enriched = results
      .map((r) => ({ team: getTeam(r.slug)!, votes: r.votes }))
      .filter((r) => r.team);
    const winnerId = (row.winner_nation_id as string | null) ?? null;
    const winner: Team | null =
      (winnerId ? byId.get(winnerId) : undefined) ?? enriched[0]?.team ?? null;
    return {
      date: row.snapshot_date as string,
      isSample: false,
      winner,
      totalVotes: (row.total_votes as number) ?? 0,
      results: enriched
    };
  });
}

// ---- Page helpers ----------------------------------------------------------

export function isEligibleToday(state: HostBattleState, slug: string): boolean {
  return state.eligible.some((t) => t.slug === slug);
}

export function tallyFor(state: HostBattleState, slug: string): HostTally | null {
  return state.tallies.find((t) => t.team.slug === slug) ?? null;
}

export function rankFor(state: HostBattleState, slug: string): number | null {
  const idx = state.tallies.findIndex((t) => t.team.slug === slug);
  return idx === -1 ? null : idx + 1;
}
