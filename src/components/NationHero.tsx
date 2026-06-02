import Link from "next/link";
import { formatNumber } from "@/lib/utils";
import type { NationWithDelta } from "@/lib/stats";
import { FlagBadge } from "./FlagArt";

type Props = {
  nation: NationWithDelta;
  rank: number;
  total: number;
};

export function NationHero({ nation, rank, total }: Props) {
  const share = nation.supporter_count / Math.max(total, 1);

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            background: `radial-gradient(80% 60% at 30% 0%, ${nation.primary_color}66, transparent 60%), radial-gradient(60% 50% at 80% 0%, ${nation.secondary_color}33, transparent 60%)`
          }}
        />
        <div className="absolute inset-0 grid-bg" />
      </div>

      <div className="container-wide pt-16 sm:pt-20 pb-10">
        <div className="flex items-center gap-3">
          <FlagBadge slug={nation.slug} w={56} h={38} />
          <div>
            <div className="chip">Team {nation.name}</div>
            <div className="mt-1 text-xs text-white/55">Live · 2026 fan race</div>
          </div>
        </div>

        <h1 className="mt-6 h-display text-5xl sm:text-6xl font-bold tracking-tight">
          Paint the world{" "}
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: `linear-gradient(120deg, ${nation.primary_color}, ${nation.secondary_color})`
            }}
          >
            {nation.name}.
          </span>
        </h1>

        <p className="mt-4 max-w-xl text-white/65">
          {nation.name} starts on its homeland and expands across the world map — every supporter
          grows the flag. Bring your friends. Bring your city. Make this race personal.
        </p>

        <div className="mt-7 grid sm:grid-cols-4 gap-3 max-w-3xl">
          <Stat label="Supporters" value={formatNumber(nation.supporter_count)} accent={nation.primary_color} />
          <Stat label="Map share" value={`${(share * 100).toFixed(2)}%`} accent={nation.secondary_color} />
          <Stat label="Global rank" value={`#${rank}`} accent="#5EEAD4" />
          <Stat label="Today's growth" value={`+${formatNumber(nation.growth24h)}`} accent="#F472B6" />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link href={`/join?nation=${nation.slug}`} className="btn-primary">
            Get Team {nation.name} poster
          </Link>
          <Link href="/?map=1" className="btn-ghost">View the FanMap</Link>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="glass rounded-2xl p-4 ring-soft">
      <div className="text-[10px] uppercase tracking-widest text-white/45">{label}</div>
      <div className="mt-1 h-display text-xl font-bold tabular-nums" style={{ color: accent }}>
        {value}
      </div>
    </div>
  );
}
