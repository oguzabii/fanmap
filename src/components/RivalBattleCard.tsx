import Link from "next/link";
import type { NationWithDelta } from "@/lib/stats";
import { formatNumber } from "@/lib/utils";
import { FlagBadge } from "./FlagArt";

type Props = {
  a: NationWithDelta;
  b: NationWithDelta;
  label?: string;
  emphasized?: boolean;
};

export function RivalBattleCard({ a, b, label, emphasized }: Props) {
  const total = a.supporter_count + b.supporter_count || 1;
  const aShare = a.supporter_count / total;
  const bShare = b.supporter_count / total;
  const leadingSlug = a.supporter_count >= b.supporter_count ? a.slug : b.slug;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl ring-soft ${emphasized ? "glass-strong" : "glass"}`}
    >
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `linear-gradient(120deg, ${a.primary_color}55 0%, transparent 45%, ${b.primary_color}55 100%)`
        }}
      />

      <div className="relative p-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="chip">{label ?? "Rival battle"}</div>
          <div className="text-xs text-white/45 tabular-nums">
            {formatNumber(total)} fans · live
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-4">
          <RivalSide nation={a} winning={leadingSlug === a.slug} alignRight={false} />
          <div className="h-display text-xs sm:text-sm font-bold text-white/55">VS</div>
          <RivalSide nation={b} winning={leadingSlug === b.slug} alignRight={true} />
        </div>

        <div className="mt-5 relative h-2 rounded-full bg-white/5 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-l-full"
            style={{
              width: `${aShare * 100}%`,
              background: `linear-gradient(90deg, ${a.primary_color}, ${a.secondary_color})`,
              boxShadow: `0 0 16px ${a.primary_color}55`
            }}
          />
          <div
            className="absolute inset-y-0 right-0 rounded-r-full"
            style={{
              width: `${bShare * 100}%`,
              background: `linear-gradient(90deg, ${b.secondary_color}, ${b.primary_color})`,
              boxShadow: `0 0 16px ${b.primary_color}55`
            }}
          />
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-white/55 tabular-nums">
          <span>{(aShare * 100).toFixed(1)}%</span>
          <span>{(bShare * 100).toFixed(1)}%</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/nation/${a.slug}`} className="btn-ghost !py-2 !px-4 text-xs">
            Back {a.emoji} {a.name}
          </Link>
          <Link href={`/nation/${b.slug}`} className="btn-ghost !py-2 !px-4 text-xs">
            Back {b.emoji} {b.name}
          </Link>
        </div>
      </div>
    </div>
  );
}

function RivalSide({
  nation,
  winning,
  alignRight
}: {
  nation: NationWithDelta;
  winning: boolean;
  alignRight: boolean;
}) {
  return (
    <div className={`flex-1 ${alignRight ? "text-right" : ""}`}>
      <div className={`flex items-center gap-2 ${alignRight ? "justify-end flex-row-reverse" : ""}`}>
        <FlagBadge slug={nation.slug} w={34} h={23} />
        <div className="font-semibold">{nation.name}</div>
        {winning && <span className="text-[10px] uppercase tracking-widest text-neon-cyan">Lead</span>}
      </div>
      <div className={`mt-1 text-xs text-white/55 tabular-nums ${alignRight ? "text-right" : ""}`}>
        {formatNumber(nation.supporter_count)} supporters
      </div>
    </div>
  );
}
