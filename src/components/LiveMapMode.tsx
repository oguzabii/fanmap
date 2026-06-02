"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { NationWithDelta } from "@/lib/stats";
import { formatNumber } from "@/lib/utils";
import { getTeam } from "@/data/worldcup-2026-teams";
import { allocateWorldGeo, territoriesFromOwners, TOTAL_COUNTRIES } from "@/lib/worldgeo";
import { GlobalWorldMap } from "./GlobalWorldMap";
import { ChooseNationOverlay } from "./ChooseNationOverlay";
import { FlagBadge } from "./FlagArt";

type Props = {
  nations: NationWithDelta[];
  open: boolean;
  onClose: () => void;
};

// Full-screen Live Map Mode: the world map fills the screen with a minimal side
// panel (top nations, selected nation, choose + poster CTA).
export function LiveMapMode({ nations, open, onClose }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [expanding, setExpanding] = useState(false); // growth surge only via Choose nation
  const [chooser, setChooser] = useState(false);

  // Focus a nation (map click / panel) — no expansion preview.
  const focusNation = (slug: string) => {
    setSelected(slug);
    setExpanding(false);
  };

  const ranked = useMemo(() => {
    const owners = allocateWorldGeo(nations.map((n) => ({ slug: n.slug, supporter_count: n.supporter_count })));
    return territoriesFromOwners(owners).map((t) => ({
      slug: t.slug,
      share: t.count / Math.max(TOTAL_COUNTRIES, 1)
    }));
  }, [nations]);

  if (!open) return null;

  const sel = selected ? nations.find((n) => n.slug === selected) : null;
  const selShare = sel ? ranked.find((r) => r.slug === sel.slug)?.share ?? 0 : 0;

  return (
    <div className="fixed inset-0 z-50 bg-[#04060d] flex flex-col">
      <div className="flex items-center justify-between px-4 sm:px-6 h-14 border-b border-line/60 shrink-0">
        <div className="chip">
          <span className="size-1.5 rounded-full bg-neon-cyan animate-pulseGlow" /> Global map · live
        </div>
        <button type="button" onClick={onClose} className="btn-ghost !py-2 !px-4 text-xs">
          Close ✕
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {/* Right safe-area on desktop = panel width, so the whole world (incl.
            Australia) stays visible and is never hidden under the side panel. */}
        <div className="absolute inset-0 sm:right-[360px]">
          <GlobalWorldMap nations={nations} selectedSlug={selected} expand={expanding} onSelect={focusNation} className="w-full h-full" />
          {/* Caption centered over the map area (excludes the panel) */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 text-xs text-white/55 bg-black/40 rounded-full px-3 py-1 pointer-events-none whitespace-nowrap">
            Every supporter expands their nation's flag.
          </div>
        </div>

        {/* Panel — inset inward so it's balanced and off the scrollbar */}
        <div className="absolute inset-x-0 bottom-0 sm:inset-x-auto sm:top-4 sm:bottom-4 sm:right-6 sm:w-[330px] glass-strong border-t border-line/60 sm:border sm:rounded-2xl p-4 sm:p-5 overflow-y-auto max-h-[52%] sm:max-h-none">
          {sel ? (
            <div className="mb-4">
              <div className="flex items-center gap-3">
                <FlagBadge slug={sel.slug} w={46} h={31} />
                <div>
                  <div className="font-bold">Team {sel.name}</div>
                  <div className="text-xs text-white/55 tabular-nums">
                    {formatNumber(sel.supporter_count)} supporters · {(selShare * 100).toFixed(1)}% of map
                  </div>
                </div>
              </div>
              <Link href={`/join?nation=${sel.slug}`} className="mt-3 btn-primary w-full justify-center">
                Claim your free poster →
              </Link>
              <button type="button" onClick={() => setSelected(null)} className="mt-2 btn-ghost w-full justify-center text-xs">
                Back to all nations
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setChooser(true)} className="btn-primary w-full justify-center mb-4">
              Choose your nation →
            </button>
          )}

          <div className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Top nations</div>
          <ul className="space-y-1.5">
            {ranked.slice(0, 8).map((r, i) => {
              const team = getTeam(r.slug);
              if (!team) return null;
              return (
                <li key={r.slug}>
                  <button
                    type="button"
                    onClick={() => focusNation(r.slug)}
                    className="w-full flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm glass text-left"
                    style={{ opacity: selected && selected !== r.slug ? 0.5 : 1 }}
                  >
                    <span className="text-white/40 w-4 text-center tabular-nums text-xs">{i + 1}</span>
                    <FlagBadge slug={r.slug} w={22} h={15} />
                    <span className="flex-1 truncate">{team.name}</span>
                    <span className="text-white/45 tabular-nums text-xs">{(r.share * 100).toFixed(0)}%</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <ChooseNationOverlay
        nations={nations}
        open={chooser}
        onClose={() => setChooser(false)}
        onPick={(slug) => {
          setSelected(slug);
          setExpanding(true); // choosing a nation plays the expansion preview
          setChooser(false);
        }}
      />
    </div>
  );
}
