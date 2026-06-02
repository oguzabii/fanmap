import Link from "next/link";
import { fetchNations } from "@/lib/stats";
import { getHostBattleState, getArchive } from "@/lib/host-battle";
import { HostRegionMap } from "@/components/HostRegionMap";
import { TodaysMatches } from "@/components/TodaysMatches";
import { BattleVote } from "@/components/BattleVote";
import { Countdown } from "@/components/Countdown";
import { FlagBadge } from "@/components/FlagArt";
import { formatNumber } from "@/lib/utils";

export const revalidate = 15;

export const metadata = {
  title: "Daily Host Region Battle · FanMap",
  description:
    "One combined host region — USA, Canada and Mexico — fought over every day. Check in for today's nations and paint the map."
};

export default async function BattlePage() {
  const nations = await fetchNations();
  const state = await getHostBattleState(nations);
  const archive = await getArchive(nations, 1);
  const yesterday = archive[0] ?? null;

  const maxVotes = Math.max(...state.tallies.map((t) => t.votes), 1);

  return (
    <section className="container-wide pt-10 pb-20">
      {/* Hero */}
      <div className="max-w-2xl">
        <div className="chip">
          <span className="size-1.5 rounded-full bg-neon-magenta animate-pulseGlow" /> Daily Host
          Region Battle · resets daily
        </div>
        <h1 className="mt-3 h-display text-4xl sm:text-5xl font-bold tracking-tight">
          Who paints the host region today?
        </h1>
        <p className="mt-3 text-white/65">
          One combined battlefield — USA · Canada · Mexico, never split. Only today's nations are
          eligible. Check in once and your pick controls territory across the whole map until the
          daily reset.
        </p>
        <div className="mt-4 flex items-center gap-3 flex-wrap">
          <Countdown targetISO={state.resetAtISO} className="glass rounded-full px-4 py-2" />
          <span
            className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full ${
              state.hasRealFixtures ? "bg-neon-cyan/15 text-neon-cyan" : "bg-amber-400/15 text-amber-300"
            }`}
          >
            {state.hasRealFixtures ? "Live matchday" : "Sample preview"}
          </span>
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
        <div className="space-y-6">
          <HostRegionMap state={state} />
          <TodaysMatches state={state} />
        </div>

        <div className="space-y-4">
          <BattleVote state={state} />

          {/* Live standings */}
          <div className="glass rounded-3xl ring-soft p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-white/80">Live standings</div>
              <div className="text-xs text-white/45 tabular-nums">
                {formatNumber(state.totalVotes)} check-ins today
              </div>
            </div>
            {state.tallies.length ? (
              <ul className="mt-4 space-y-2.5">
                {state.tallies.map((t, i) => (
                  <li key={t.team.slug} className="flex items-center gap-3">
                    <span className="text-xs text-white/40 w-4 text-right tabular-nums">{i + 1}</span>
                    <FlagBadge slug={t.team.slug} w={24} h={16} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-medium truncate">{t.team.name}</span>
                        <span className="text-xs text-white/45 tabular-nums">
                          {formatNumber(t.votes)} · {(t.share * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${(t.votes / maxVotes) * 100}%`,
                            background: `linear-gradient(90deg, ${t.team.primary_color}, ${t.team.secondary_color})`,
                            boxShadow: `0 0 14px ${t.team.primary_color}55`
                          }}
                        />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-white/55">No fixtures today — check back tomorrow.</p>
            )}
          </div>

          {yesterday && yesterday.winner && (
            <Link
              href="/battle/archive"
              className="glass rounded-3xl ring-soft p-5 flex items-center gap-3 hover:bg-white/5 transition"
            >
              <FlagBadge slug={yesterday.winner.slug} w={36} h={24} />
              <div className="flex-1">
                <div className="text-xs text-white/45">
                  Yesterday's champion{yesterday.isSample ? " · sample" : ""}
                </div>
                <div className="font-semibold">{yesterday.winner.name}</div>
              </div>
              <span className="text-xs text-neon-cyan">Full archive →</span>
            </Link>
          )}
        </div>
      </div>

      {/* How it works + sponsor */}
      <div className="mt-12 grid lg:grid-cols-[1.4fr_0.6fr] gap-6">
        <div className="glass rounded-3xl ring-soft p-6">
          <div className="chip">How the daily battle works</div>
          <ul className="mt-4 grid sm:grid-cols-3 gap-4 text-sm text-white/65">
            <li>
              <div className="h-display text-2xl font-bold text-white">1</div>
              Only nations playing today are eligible — real fixtures drive the battle.
            </li>
            <li>
              <div className="h-display text-2xl font-bold text-white">2</div>
              Each supporter checks in once per day for the side they back.
            </li>
            <li>
              <div className="h-display text-2xl font-bold text-white">3</div>
              Votes paint the combined region live; the winner is archived at reset.
            </li>
          </ul>
          <p className="mt-4 text-xs text-white/40">
            Your join on the Global FanMap is permanent. The Host Region Battle is the daily layer —
            it resets every midnight UTC and never touches your nation's global territory.
          </p>
        </div>

        <div className="glass rounded-3xl ring-soft p-6 flex flex-col justify-between">
          <div>
            <div className="chip">Sponsor placeholder</div>
            <div className="mt-3 h-display text-lg font-bold">Sponsor today's battle.</div>
            <p className="text-sm text-white/55 mt-1">
              Put your brand on the most-watched daily moment of the fan race.
            </p>
          </div>
          <a href="mailto:partners@fanmap.example" className="mt-4 btn-ghost text-xs">
            Become the sponsor →
          </a>
        </div>
      </div>
    </section>
  );
}
