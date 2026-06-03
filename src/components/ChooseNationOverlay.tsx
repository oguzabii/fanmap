"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [panelH, setPanelH] = useState<number | null>(null);

  // On mobile, clamp the picker to the *visible* viewport so the list stays
  // scrollable above the on-screen keyboard (visualViewport shrinks when the
  // keyboard opens). Desktop keeps the native centered modal (panelH stays null).
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const apply = () => setPanelH(window.innerWidth >= 640 ? null : vv.height);
    apply();
    vv.addEventListener("resize", apply);
    window.addEventListener("orientationchange", apply);
    return () => {
      vv.removeEventListener("resize", apply);
      window.removeEventListener("orientationchange", apply);
    };
  }, [open]);

  const term = q.trim().toLowerCase();
  const sorted = useMemo(
    () => [...nations].sort((a, b) => b.supporter_count - a.supporter_count),
    [nations]
  );
  const filtered = term
    ? sorted.filter((n) => n.name.toLowerCase().includes(term) || n.slug.includes(term))
    : sorted;
  const popular = term ? [] : sorted.slice(0, 6);

  if (!open) return null;

  const card = (n: NationWithDelta) => (
    <button
      key={n.slug}
      type="button"
      onClick={() => onPick(n.slug)}
      className="flex items-center gap-3 rounded-2xl p-4 sm:p-3 text-left glass transition active:scale-[0.99] sm:hover:-translate-y-0.5"
      style={{ boxShadow: `inset 0 0 0 1px ${n.primary_color}22` }}
    >
      <FlagBadge slug={n.slug} w={44} h={30} />
      <div className="min-w-0">
        <div className="font-semibold truncate">{n.name}</div>
        <div className="text-xs text-white/45 tabular-nums">{formatNumber(n.supporter_count)} supporters</div>
      </div>
    </button>
  );

  const grid = (items: NationWithDelta[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">{items.map(card)}</div>
  );

  const label = "mb-2 text-[10px] uppercase tracking-widest text-white/40";

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />
      {/* Full-screen on mobile (height clamped to the visible viewport so the list
          stays above the keyboard), centered modal on desktop. */}
      <div
        style={panelH ? { height: panelH } : undefined}
        className="relative w-full h-full sm:h-auto sm:max-w-3xl sm:max-h-[88vh] flex flex-col overflow-hidden rounded-none sm:rounded-3xl glass-strong ring-soft animate-rise"
      >
        <div className="p-4 sm:p-6 border-b border-line/60 flex items-center justify-between gap-3 shrink-0">
          <div>
            <div className="chip">Choose your nation</div>
            <h3 className="mt-2 h-display text-lg sm:text-xl font-bold">Pick the flag you'll grow.</h3>
          </div>
          {/* Mobile: large, easy-to-tap round close. Desktop: original text button. */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close nation picker"
            className="sm:hidden shrink-0 inline-flex items-center justify-center rounded-full glass size-11 text-xl leading-none"
          >
            ✕
          </button>
          <button
            type="button"
            onClick={onClose}
            className="hidden sm:inline-flex btn-ghost !py-2 !px-3 text-xs shrink-0"
          >
            Close
          </button>
        </div>

        <div className="px-4 sm:px-5 pt-4 shrink-0">
          {/* No autoFocus: the keyboard must not open until the user taps search. */}
          <input
            placeholder="Search 48 nations…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            inputMode="search"
            className="w-full glass rounded-full px-4 py-3 sm:py-2.5 text-base sm:text-sm outline-none focus:ring-2 focus:ring-neon-cyan/40"
          />
        </div>

        {/* The only scrollable region — fills the space above the keyboard, with
            generous bottom padding so the last cards are always reachable. */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-5 pt-4 pb-24 sm:pb-6">
          {/* Popular / All split is a mobile affordance; desktop keeps one full grid. */}
          {!term && (
            <div className="sm:hidden">
              <div className={label}>Popular</div>
              {grid(popular)}
              <div className={`mt-5 ${label}`}>All teams</div>
            </div>
          )}
          {grid(filtered)}
          {term && filtered.length === 0 && (
            <div className="text-center text-sm text-white/45 py-8">No nation found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
