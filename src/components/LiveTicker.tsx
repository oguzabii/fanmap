import type { NationWithDelta } from "@/lib/stats";
import { formatNumber } from "@/lib/utils";
import { FlagBadge } from "./FlagArt";

type Props = { nations: NationWithDelta[]; live?: boolean };

export function LiveTicker({ nations, live = true }: Props) {
  // Live: order by today's growth. Preview: order by total supporters (no fake
  // daily numbers shown).
  const items = nations
    .slice()
    .sort((a, b) => (live ? b.growth24h - a.growth24h : b.supporter_count - a.supporter_count))
    .slice(0, 12);

  const doubled = [...items, ...items];

  return (
    <section className="container-wide mt-16">
      <div className="ticker-wrap overflow-hidden glass rounded-2xl ring-soft py-3">
        <div className="flex gap-10 whitespace-nowrap animate-ticker">
          {doubled.map((n, i) => (
            <div key={`${n.slug}-${i}`} className="flex items-center gap-2 text-sm text-white/70">
              <FlagBadge slug={n.slug} w={20} h={13} />
              <span className="text-white/85 font-medium">{n.name}</span>
              {live ? (
                <span className="text-white/40 tabular-nums">+{formatNumber(n.growth24h)} today</span>
              ) : (
                <span className="text-white/40 tabular-nums">{formatNumber(n.supporter_count)} supporters</span>
              )}
              <span className="text-white/20">·</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
