import Link from "next/link";
import type { NationWithDelta } from "@/lib/stats";
import { formatNumber } from "@/lib/utils";
import { FlagBadge } from "./FlagArt";

type Props = { nations: NationWithDelta[]; live?: boolean };

export function NationRanking({ nations, live = true }: Props) {
  const total = nations.reduce((s, n) => s + n.supporter_count, 0);
  const sorted = [...nations].sort((a, b) => b.supporter_count - a.supporter_count);
  const top = sorted[0]?.supporter_count ?? 1;

  return (
    <section id="ranking" className="container-wide mt-24">
      <SectionHeader
        eyebrow={live ? "Live ranking" : "Ranking · Preview data"}
        title="The nations leading the race."
        sub={
          live
            ? "The leaderboard updates as supporters join. The bar shows each nation's share of the world map."
            : "Preview data — connect Supabase to show live supporter counts and real daily growth."
        }
      />

      <div className="mt-8 grid lg:grid-cols-[2fr_1fr] gap-6">
        {/* Ranking list */}
        <div className="glass rounded-3xl ring-soft p-4 sm:p-6">
          <ul className="divide-y divide-line">
            {sorted.map((n, i) => {
              const share = n.supporter_count / Math.max(total, 1);
              const widthPct = (n.supporter_count / Math.max(top, 1)) * 100;
              return (
                <li key={n.slug} className="py-3">
                  <Link
                    href={`/nation/${n.slug}`}
                    className="flex items-center gap-4 group"
                  >
                    <div className="text-sm tabular-nums w-7 text-white/45 text-right">#{i + 1}</div>
                    <FlagBadge slug={n.slug} w={38} h={26} className="shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <div className="font-semibold truncate group-hover:text-neon-cyan transition">
                          {n.name}
                        </div>
                        <div className="text-xs text-white/45 tabular-nums">
                          {formatNumber(n.supporter_count)} · {(share * 100).toFixed(1)}%
                        </div>
                      </div>
                      <div className="mt-1.5 h-1.5 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${widthPct}%`,
                            background: `linear-gradient(90deg, ${n.primary_color}, ${n.secondary_color})`,
                            boxShadow: `0 0 16px ${n.primary_color}55`
                          }}
                        />
                      </div>
                    </div>
                    {live && (
                      <div className="hidden sm:block text-xs text-white/45 tabular-nums">
                        +{formatNumber(n.growth24h)} today
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Side: fastest growing (live only) + how the race works */}
        <div className="space-y-4">
          {live && <FastestGrowing nations={nations} />}
          <div className="glass rounded-3xl ring-soft p-5">
            <div className="chip">How the race works</div>
            <p className="mt-3 text-sm text-white/65 leading-relaxed">
              Every supporter you bring expands your nation's territory on the FanMap. There is no
              payment, no login, no points to grind — just real fans, real flags, growing live.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/55">
              <li>· One supporter = more territory on the world map</li>
              <li>· The bigger your nation, the more territory it owns</li>
              <li>· Invites multiply your nation's colors faster</li>
            </ul>
            <Link href="/join" className="mt-5 btn-primary w-full">
              Join your nation
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function FastestGrowing({ nations }: { nations: NationWithDelta[] }) {
  const top3 = [...nations].sort((a, b) => b.growth24h - a.growth24h).slice(0, 3);
  return (
    <div className="glass rounded-3xl ring-soft p-5">
      <div className="chip">
        <span className="size-1.5 rounded-full bg-neon-magenta animate-pulseGlow" /> Fastest growing today
      </div>
      <ul className="mt-3 space-y-3">
        {top3.map((n) => (
          <li key={n.slug}>
            <Link href={`/nation/${n.slug}`} className="flex items-center gap-3 group">
              <FlagBadge slug={n.slug} w={34} h={23} />
              <div className="flex-1">
                <div className="text-sm font-medium group-hover:text-neon-cyan transition">{n.name}</div>
                <div className="text-xs text-white/45 tabular-nums">+{formatNumber(n.growth24h)} supporters today</div>
              </div>
              <div className="text-neon-cyan text-xs">→</div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  sub
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="max-w-2xl">
      <div className="chip">{eyebrow}</div>
      <h2 className="mt-3 h-display text-3xl sm:text-4xl font-bold tracking-tight">{title}</h2>
      {sub && <p className="mt-3 text-white/55">{sub}</p>}
    </div>
  );
}
