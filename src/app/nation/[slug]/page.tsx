import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchNations } from "@/lib/stats";
import { rivalsOf } from "@/lib/nations";
import { getPublicClient } from "@/lib/supabase";
import {
  getHostBattleState,
  isEligibleToday,
  tallyFor,
  rankFor,
  todayISO
} from "@/lib/host-battle";
import { nextFixtureForTeam } from "@/data/worldcup-2026-fixtures";
import { getTeam } from "@/data/worldcup-2026-teams";
import { NationHero } from "@/components/NationHero";
import { GlobalWorldMap } from "@/components/GlobalWorldMap";
import { BattleVote } from "@/components/BattleVote";
import { Countdown } from "@/components/Countdown";
import { FlagBadge } from "@/components/FlagArt";
import { RivalBattleCard } from "@/components/RivalBattleCard";
import { CityLeaderboard } from "@/components/CityLeaderboard";
import { InviteCTA } from "@/components/InviteCTA";
import { SponsorSlot } from "@/components/SponsorSlot";
import { ProductCard } from "@/components/ProductCard";
import { productsForNation } from "@/lib/products";
import { shareText, localeForNation, siteUrl } from "@/lib/share";
import { formatNumber } from "@/lib/utils";

type Params = { params: { slug: string } };

export const revalidate = 30;

export async function generateMetadata({ params }: Params) {
  const nations = await fetchNations();
  const nation = nations.find((n) => n.slug === params.slug);
  if (!nation) return {};
  return {
    title: `Team ${nation.name} on the FanMap`,
    description: `Back Team ${nation.name} and grow ${nation.name}'s territory on the FanMap.`
  };
}

export default async function NationPage({ params }: Params) {
  const nations = await fetchNations();
  const nation = nations.find((n) => n.slug === params.slug);
  if (!nation) return notFound();

  const sorted = [...nations].sort((a, b) => b.supporter_count - a.supporter_count);
  const rank = sorted.findIndex((n) => n.slug === nation.slug) + 1;
  const total = sorted.reduce((s, n) => s + n.supporter_count, 0);

  const rivalSlugs = rivalsOf(nation.slug);
  const rivals = rivalSlugs
    .map((s) => nations.find((n) => n.slug === s))
    .filter(Boolean) as typeof nations;

  const cityRows = await fetchCities(nation.slug);

  const products = productsForNation(nation.slug);
  const inviteLink = siteUrl(`/join?nation=${nation.slug}`);
  const text = shareText(nation.name, inviteLink, localeForNation(nation.slug));

  const hostState = await getHostBattleState(nations);
  const eligibleToday = isEligibleToday(hostState, nation.slug);
  const hostActive = eligibleToday && hostState.hasRealFixtures;
  const hostTally = tallyFor(hostState, nation.slug);
  const hostRank = rankFor(hostState, nation.slug);

  const team = getTeam(nation.slug);
  const nextMatch = nextFixtureForTeam(nation.slug, todayISO());
  const nextOpponent = nextMatch
    ? getTeam(nextMatch.teamA === nation.slug ? nextMatch.teamB : nextMatch.teamA)
    : null;

  return (
    <>
      <NationHero nation={nation} rank={rank} total={total} />

      <section className="container-wide mt-8">
        <div className="relative rounded-3xl ring-soft overflow-hidden">
          <GlobalWorldMap
            nations={nations}
            selectedSlug={nation.slug}
            focusSlug={nation.slug}
            showLabels
            className="h-[58vh] min-h-[420px]"
          />
          <div className="absolute top-4 left-4 glass-strong rounded-xl px-3 py-2">
            <div className="text-[10px] uppercase tracking-widest text-white/50">Territory of</div>
            <div className="font-bold">{nation.emoji} Team {nation.name}</div>
          </div>
        </div>
      </section>

      <section className="container-wide mt-6">
        <InviteCTA nationName={nation.name} inviteLink={inviteLink} shareText={text} />
      </section>

      <div className="container-wide mt-4 flex flex-wrap items-center gap-3">
        <Link href={`/join?nation=${nation.slug}`} className="btn-primary">
          Join & get your {nation.name} share poster →
        </Link>
        <span className="text-xs text-white/45">Real flag · 9:16 story-ready · share to expand {nation.name}</span>
      </div>

      {/* Today's Host Region Battle status for this nation */}
      <section className="container-wide mt-6">
        {hostActive ? (
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-6 items-start">
            <div className="glass rounded-3xl ring-soft p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="chip">
                  <span className="size-1.5 rounded-full bg-neon-magenta animate-pulseGlow" /> Playing
                  today
                </div>
                <Countdown targetISO={hostState.resetAtISO} />
              </div>
              <h2 className="mt-3 h-display text-2xl font-bold">
                {nation.name} is in today's Host Region Battle.
              </h2>
              <p className="mt-1 text-sm text-white/55">
                Back {nation.name} to paint the combined USA · Canada · Mexico map. One check-in per
                supporter, per day.
              </p>
              {hostTally && (
                <div className="mt-4 flex items-center gap-4 text-sm">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/45">Region share</div>
                    <div className="h-display text-xl font-bold tabular-nums">
                      {(hostTally.share * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/45">Today's rank</div>
                    <div className="h-display text-xl font-bold tabular-nums">#{hostRank}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/45">Check-ins</div>
                    <div className="h-display text-xl font-bold tabular-nums">
                      {formatNumber(hostTally.votes)}
                    </div>
                  </div>
                </div>
              )}
              <Link href="/battle" className="mt-4 inline-flex btn-ghost text-xs">
                Open the full battle →
              </Link>
            </div>
            <BattleVote state={hostState} presetSlug={nation.slug} />
          </div>
        ) : (
          <Link
            href="/battle"
            className="glass rounded-3xl ring-soft p-5 flex items-center justify-between gap-3 hover:bg-white/5 transition"
          >
            <div>
              <div className="chip">Daily Host Region Battle</div>
              <div className="mt-2 text-sm text-white/65">
                {nation.name} isn't playing today — but the combined host region is up for grabs right
                now.
              </div>
            </div>
            <span className="text-xs text-neon-cyan shrink-0">See today's battle →</span>
          </Link>
        )}
      </section>

      {/* Next tournament match (from fixture data) */}
      {nextMatch && nextOpponent && (
        <section className="container-wide mt-6">
          <div className="glass rounded-3xl ring-soft p-5 sm:p-6 flex items-center gap-4 flex-wrap">
            <div className="chip">Next match</div>
            <div className="flex items-center gap-3">
              <FlagBadge slug={nation.slug} w={34} h={23} />
              <span className="font-semibold">{nation.name}</span>
              <span className="text-white/40 text-sm">vs</span>
              <span className="font-semibold">{nextOpponent.name}</span>
              <FlagBadge slug={nextOpponent.slug} w={34} h={23} />
            </div>
            <div className="text-sm text-white/55 sm:ml-auto">
              {nextMatch.matchDate}
              {nextMatch.kickoff ? ` · ${nextMatch.kickoff}` : ""} · {nextMatch.hostCity} ·{" "}
              {nextMatch.venue}
            </div>
          </div>
        </section>
      )}

      {rivals.length > 0 && (
        <section className="container-wide mt-16">
          <div className="chip">Group {team?.group ?? ""} rivals</div>
          <h2 className="mt-3 h-display text-3xl font-bold">{nation.name}'s group-stage rivals.</h2>
          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            {rivals.map((r) => (
              <RivalBattleCard
                key={r.slug}
                a={nation}
                b={r}
                label={`${nation.name} vs ${r.name}`}
              />
            ))}
          </div>
        </section>
      )}

      <section className="container-wide mt-16 grid lg:grid-cols-2 gap-6">
        <CityLeaderboard
          rows={cityRows}
          primaryColor={nation.primary_color}
          secondaryColor={nation.secondary_color}
        />
        <SponsorSlot
          nationName={nation.name}
          primaryColor={nation.primary_color}
          secondaryColor={nation.secondary_color}
        />
      </section>

      {products.length > 0 && (
        <section className="container-wide mt-16">
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <div className="chip">{nation.name} fan shop</div>
              <h2 className="mt-3 h-display text-3xl font-bold">Wear the colors. Off the screen.</h2>
            </div>
            <Link href="/shop" className="btn-ghost">Full shop →</Link>
          </div>

          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard
                key={p.slug}
                product={p}
                sourcePage={`nation/${nation.slug}`}
                nationSlug={nation.slug}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}

async function fetchCities(slug: string): Promise<Array<{ city: string; count: number }>> {
  const client = getPublicClient();
  if (!client) return [];
  const { data: nationRow } = await client
    .from("nations")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();
  if (!nationRow) return [];

  const { data, error } = await client
    .from("supporters")
    .select("city")
    .eq("nation_id", nationRow.id)
    .not("city", "is", null)
    .limit(500);
  if (error || !data) return [];

  const counts = new Map<string, number>();
  for (const row of data) {
    const c = (row.city as string | null)?.trim();
    if (!c) continue;
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count);
}
