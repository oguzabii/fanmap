"use client";

import { useEffect, useState } from "react";

type Props = {
  targetISO: string; // ISO timestamp of the next daily reset (UTC midnight)
  className?: string;
  label?: string;
};

function format(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// Counts down to the daily reset. Renders a stable placeholder on the server to
// avoid hydration mismatch, then ticks every second on the client.
export function Countdown({ targetISO, className, label = "Resets in" }: Props) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const target = new Date(targetISO).getTime();
  const display = now === null ? "--:--:--" : format(target - now);

  return (
    <div className={`inline-flex items-center gap-2 ${className ?? ""}`}>
      <span className="text-[10px] uppercase tracking-widest text-white/45">{label}</span>
      <span className="h-display font-bold tabular-nums text-sm" suppressHydrationWarning>
        {display}
      </span>
    </div>
  );
}
