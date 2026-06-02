"use client";

import { useMemo, useState } from "react";
import type { NationWithDelta } from "@/lib/stats";
import { formatNumber } from "@/lib/utils";
import { FlagBadge } from "./FlagArt";

type Props = {
  nations: NationWithDelta[];
  initialSlug?: string | null;
  onChange: (slug: string) => void;
  selected: string | null;
};

export function NationSelector({ nations, onChange, selected }: Props) {
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const sorted = [...nations].sort((a, b) => b.supporter_count - a.supporter_count);
    if (!term) return sorted;
    return sorted.filter(
      (n) => n.name.toLowerCase().includes(term) || n.slug.includes(term)
    );
  }, [nations, q]);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="chip">Pick a side</div>
        <div className="relative w-full max-w-xs">
          <input
            placeholder="Search nations…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full glass rounded-full px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-neon-cyan/40"
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {list.map((n) => {
          const isSelected = selected === n.slug;
          return (
            <button
              key={n.slug}
              type="button"
              onClick={() => onChange(n.slug)}
              className="group relative text-left rounded-2xl overflow-hidden ring-soft transition outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan/60"
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${n.primary_color}22, ${n.secondary_color}11)`
                  : "rgba(255,255,255,0.03)",
                borderColor: isSelected ? n.primary_color : "rgba(255,255,255,0.08)",
                borderWidth: 1,
                borderStyle: "solid",
                boxShadow: isSelected
                  ? `0 0 0 1px ${n.primary_color}, 0 20px 60px -20px ${n.primary_color}66`
                  : undefined
              }}
            >
              <div
                className="absolute inset-x-0 top-0 h-12 opacity-50 pointer-events-none"
                style={{
                  background: `linear-gradient(180deg, ${n.primary_color}55, transparent)`
                }}
              />
              <div className="relative p-4">
                <div className="flex items-start justify-between">
                  <FlagBadge slug={n.slug} w={42} h={28} />
                  {isSelected && (
                    <span className="text-[10px] uppercase tracking-widest text-neon-cyan">
                      Selected
                    </span>
                  )}
                </div>
                <div className="mt-3 font-semibold">{n.name}</div>
                <div className="mt-0.5 text-xs text-white/55 tabular-nums">
                  {formatNumber(n.supporter_count)} supporters
                </div>
                <div className="mt-3 flex items-center gap-1">
                  <div
                    className="h-1.5 rounded-full"
                    style={{
                      width: "60%",
                      background: `linear-gradient(90deg, ${n.primary_color}, ${n.secondary_color})`
                    }}
                  />
                  <div className="h-1.5 flex-1 rounded-full bg-white/5" />
                </div>
              </div>
            </button>
          );
        })}
        {list.length === 0 && (
          <div className="col-span-full text-center text-sm text-white/45 py-8">
            No nation found.
          </div>
        )}
      </div>
    </div>
  );
}
