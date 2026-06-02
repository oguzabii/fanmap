"use client";

import { useEffect, useState } from "react";
import { formatNumber } from "@/lib/utils";

type Props = {
  total: number;
  nationsJoined: number;
  fastest: { name: string; emoji: string; growth: number; color: string } | null;
  leader: { name: string; emoji: string; color: string; share: number } | null;
};

// Subtle live drift: a tiny counter trickle so the hero feels alive without lying.
export function LiveCounters({ total, nationsJoined, fastest, leader }: Props) {
  const [trickle, setTrickle] = useState(0);

  useEffect(() => {
    const i = setInterval(() => {
      setTrickle((v) => v + Math.max(1, Math.round(Math.random() * 3)));
    }, 4000 + Math.random() * 3000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Stat
        label="Total supporters"
        value={formatNumber(total + trickle)}
        accent="#5EEAD4"
        live
      />
      <Stat
        label="Nations in the race"
        value={`${nationsJoined}`}
        accent="#A78BFA"
      />
      <Stat
        label="Fastest growing today"
        value={fastest ? `${fastest.emoji} ${fastest.name}` : "—"}
        sub={fastest ? `+${formatNumber(fastest.growth)} today` : undefined}
        accent={fastest?.color ?? "#F472B6"}
      />
      <Stat
        label="Map leader"
        value={leader ? `${leader.emoji} ${leader.name}` : "—"}
        sub={leader ? `${(leader.share * 100).toFixed(1)}% of map` : undefined}
        accent={leader?.color ?? "#FBBF24"}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
  live
}: {
  label: string;
  value: string;
  sub?: string;
  accent: string;
  live?: boolean;
}) {
  return (
    <div className="glass rounded-2xl p-3 sm:p-4 ring-soft">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/40">
        {live && <span className="size-1.5 rounded-full bg-neon-cyan animate-pulseGlow" />}
        {label}
      </div>
      <div className="mt-1.5 h-display text-lg sm:text-xl font-bold tabular-nums truncate" style={{ color: accent }}>
        {value}
      </div>
      {sub && <div className="text-xs text-white/55 mt-0.5 truncate">{sub}</div>}
    </div>
  );
}
