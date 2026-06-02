"use client";

import { useMemo, useState } from "react";
import type { NationWithDelta } from "@/lib/stats";
import { formatNumber } from "@/lib/utils";
import { FlagBadge } from "./FlagArt";

type Props = {
  nations: NationWithDelta[];
  open: boolean;
  onClose: () => void;
  onPick: (slug: string) => void;
};

export function ChooseNationOverlay({ nations, open, onClose, onPick }: Props) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const sorted = [...nations].sort((a, b) => b.supporter_count - a.supporter_count);
    return term ? sorted.filter((n) => n.name.toLowerCase().includes(term) || n.slug.includes(term)) : sorted;
  }, [nations, q]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />
      <div className="relative w-full sm:max-w-3xl max-h-[88vh] overflow-hidden rounded-t-3xl sm:rounded-3xl glass-strong ring-soft animate-rise">
        <div className="p-5 sm:p-6 border-b border-line/60 flex items-center justify-between gap-3">
          <div>
            <div className="chip">Choose your nation</div>
            <h3 className="mt-2 h-display text-xl font-bold">Pick the flag you'll grow.</h3>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost !py-2 !px-3 text-xs">
            Close
          </button>
        </div>

        <div className="p-4 sm:p-5">
          <input
            autoFocus
            placeholder="Search 48 nations…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full glass rounded-full px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-neon-cyan/40"
          />
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 overflow-y-auto max-h-[58vh] pr-1">
            {list.map((n) => (
              <button
                key={n.slug}
                type="button"
                onClick={() => onPick(n.slug)}
                className="flex items-center gap-3 rounded-2xl p-3 text-left glass transition hover:-translate-y-0.5"
                style={{ boxShadow: `inset 0 0 0 1px ${n.primary_color}22` }}
              >
                <FlagBadge slug={n.slug} w={40} h={27} />
                <div className="min-w-0">
                  <div className="font-semibold truncate">{n.name}</div>
                  <div className="text-xs text-white/45 tabular-nums">{formatNumber(n.supporter_count)}</div>
                </div>
              </button>
            ))}
            {list.length === 0 && (
              <div className="col-span-full text-center text-sm text-white/45 py-8">No nation found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
