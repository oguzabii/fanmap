import Link from "next/link";
import type { ArchiveEntry, HostBattleState } from "@/lib/host-battle";
import { formatNumber } from "@/lib/utils";
import { SectionHeader } from "./NationRanking";
import { HostRegionMap } from "./HostRegionMap";
import { TodaysMatches } from "./TodaysMatches";
import { Countdown } from "./Countdown";
import { FlagBadge } from "./FlagArt";

type Props = {
  state: HostBattleState;
  yesterday?: ArchiveEntry | null;
};

export function HostBattleSection({ state, yesterday }: Props) {
  const maxVotes = Math.max(...state.tallies.map((t) => t.votes), 1);
  const top = state.tallies.slice(0, 4);

  return (
    <section id="battle" className="container-wide mt-24">
      <SectionHeader
        eyebrow="Daily Host Region Battle"
        title="One map. USA · Canada · Mexico. Reset every day."
        sub="Today's nations fight for the combined host region. Check in once a day for the side you back — your vote paints territory across the whole map until midnight UTC."
      />

      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <Countdown targetISO={state.resetAtISO} className="glass rounded-full px-4 py-2" />
        <span
          className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full ${
            state.hasRealFixtures ? "bg-neon-cyan/15 text-neon-cyan" : "bg-amber-400/15 text-amber-300"
          }`}
        >
          {state.hasRealFixtures ? "Live matchday" : "Sample preview · no real fixtures today"}
        </span>
        <Link href="/battle" className="text-xs text-white/55 hover:text-white">
          Open the full battle →
        </Link>
      </div>

      <div className="mt-6 grid lg:grid-cols-[1.1fr_0.9fr] gap-6 items-start">
        <HostRegionMap state={state} />
        <TodaysMatches state={state} />
      </div>

      <div className="mt-6 grid lg:grid-cols-[1fr_0.62fr] gap-6 items-start">
        {/* Standings + CTA */}
        <div className="glass rounded-3xl ring-soft p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-sm font-semibold text-white/80">Live standings</div>
            <div className="text-xs text-white/45 tabular-nums">
              {formatNumber(state.totalVotes)} check-ins today
            </div>
          </div>

          {state.leader && state.totalVotes > 0 ? (
            <div className="mt-4 flex items-center gap-3">
              <FlagBadge slug={state.leader.slug} w={40} h={27} />
              <div>
                <div className="text-xs text-white/45 uppercase tracking-widest">Leading now</div>
                <div className="h-display text-lg font-bold">
                  {state.leader.name} · {((state.tallies[0]?.share || 0) * 100).toFixed(1)}% of the region
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-sm text-white/55">
              The region is wide open — first check-ins set the lead.
            </div>
          )}

          <ul className="mt-4 space-y-2.5">
            {top.map((t) => (
              <li key={t.team.slug} className="flex items-center gap-3">
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

          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <Link href="/battle" className="btn-primary">
              Cast your daily check-in →
            </Link>
            <Link href="/battle/archive" className="btn-ghost text-xs">
              Past winners
            </Link>
          </div>
        </div>

        {/* Yesterday + sponsor */}
        <div className="space-y-4">
          {yesterday && yesterday.winner && (
            <div className="glass rounded-3xl ring-soft p-5">
              <div className="chip">Yesterday's champion</div>
              <div className="mt-3 flex items-center gap-3">
                <FlagBadge slug={yesterday.winner.slug} w={36} h={24} />
                <div>
                  <div className="font-semibold">{yesterday.winner.name} took the region</div>
                  <div className="text-xs text-white/45 tabular-nums">
                    {formatNumber(yesterday.totalVotes)} check-ins
                    {yesterday.isSample ? " · sample" : ""}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="glass rounded-2xl ring-soft px-5 py-3 flex items-center justify-between gap-3">
            <span className="text-xs text-white/45">Sponsor today's Host Region Battle</span>
            <a href="mailto:partners@fanmap.example" className="text-xs text-neon-cyan hover:text-white">
              Get in touch →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
