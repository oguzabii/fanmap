"use client";

import { useMemo } from "react";
import type { NationWithDelta } from "@/lib/stats";
import { flagSrc, getTeam } from "@/data/worldcup-2026-teams";
import {
  WORLD_COUNTRIES,
  WORLD_VIEW,
  allocateWorldGeo,
  territoriesFromOwners
} from "@/lib/worldgeo";

type Props = {
  nations: NationWithDelta[];
  selectedSlug?: string | null;
  focusSlug?: string | null; // zoom the viewBox to this nation's territory
  className?: string; // controls height (e.g. "h-[78vh]")
  showLabels?: boolean;
  labelCount?: number;
  onSelect?: (slug: string) => void; // click an owned territory -> select its owner
  expand?: boolean; // true = show growth surge; false = focus only (no new flags)
};

function bbox(d: string) {
  const nums = d.match(/-?\d+\.?\d*/g);
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  if (nums) {
    for (let i = 0; i + 1 < nums.length; i += 2) {
      const x = parseFloat(nums[i]);
      const y = parseFloat(nums[i + 1]);
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export function GlobalWorldMap({
  nations,
  selectedSlug,
  focusSlug,
  className,
  showLabels = true,
  labelCount = 10,
  onSelect,
  expand = false
}: Props) {
  const boxes = useMemo(() => {
    const m: Record<string, { x: number; y: number; w: number; h: number }> = {};
    for (const c of WORLD_COUNTRIES) m[c.id] = bbox(c.d);
    return m;
  }, []);

  const baseOwners = useMemo(
    () => allocateWorldGeo(nations.map((n) => ({ slug: n.slug, supporter_count: n.supporter_count }))),
    [nations]
  );

  // Expansion surge — ONLY in expand mode (choose-nation / join / demo). In
  // focus mode (e.g. a map click) we never invent new territories.
  const expansionIds = useMemo(() => {
    if (!selectedSlug || !expand) return [] as string[];
    const boosted = allocateWorldGeo(
      nations.map((n) => ({
        slug: n.slug,
        supporter_count: n.slug === selectedSlug ? n.supporter_count * 2.2 + 4000 : n.supporter_count
      }))
    );
    return WORLD_COUNTRIES.filter((c) => boosted[c.id] === selectedSlug && baseOwners[c.id] !== selectedSlug).map(
      (c) => c.id
    );
  }, [nations, selectedSlug, baseOwners, expand]);

  const territories = useMemo(() => territoriesFromOwners(baseOwners), [baseOwners]);
  // Top territories, de-cluttered: skip labels that sit too close to a kept one.
  const labels = useMemo(() => {
    const out: typeof territories = [];
    for (const t of territories) {
      if (out.length >= labelCount) break;
      if (out.some((o) => Math.hypot(o.cx - t.cx, o.cy - t.cy) < 62)) continue;
      out.push(t);
    }
    return out;
  }, [territories, labelCount]);
  const selectedFlag = selectedSlug ? flagSrc(selectedSlug) : null;

  // Optional zoom to a nation's empire.
  const focus = focusSlug ? territories.find((t) => t.slug === focusSlug) : null;
  const vb = useMemo(() => {
    // Default: show the WHOLE world (contain), never crop.
    if (!focus) return { x: 0, y: 0, w: WORLD_VIEW.w, h: WORLD_VIEW.h, par: "xMidYMid meet" as const };
    const pad = Math.max(focus.w, focus.h) * 0.45 + 30;
    const x = Math.max(0, focus.minX - pad);
    const y = Math.max(0, focus.minY - pad);
    const w = Math.min(WORLD_VIEW.w - x, focus.w + pad * 2);
    const h = Math.min(WORLD_VIEW.h - y, focus.h + pad * 2);
    return { x, y, w, h, par: "xMidYMid meet" as const };
  }, [focus]);

  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      <style>{`
        @keyframes fmGrow { 0%{opacity:0; transform:scale(.6)} 60%{opacity:1} 100%{opacity:1; transform:scale(1)} }
        @keyframes fmPulse { 0%,100%{opacity:.5} 50%{opacity:1} }
        @keyframes fmBreathe { 0%,100%{opacity:.82} 50%{opacity:1} }
        @keyframes fmSheen { 0%{background-position:130% 0} 100%{background-position:-30% 0} }
        .fm-grow { animation: fmGrow .7s cubic-bezier(.2,.8,.2,1) both; transform-box: fill-box; transform-origin: center; }
        .fm-borders { animation: fmBreathe 6s ease-in-out infinite; }
        .fm-sheen { background: linear-gradient(115deg, transparent 42%, rgba(255,255,255,0.05) 50%, transparent 58%); background-size: 280% 100%; animation: fmSheen 11s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .fm-borders, .fm-sheen { animation: none; } }
      `}</style>
      <svg
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        preserveAspectRatio={vb.par}
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label="Global FanMap — the world divided into nation territories by real flags"
      >
        <defs>
          <radialGradient id="fm-ocean" cx="50%" cy="36%" r="80%">
            <stop offset="0%" stopColor="#0c1530" />
            <stop offset="55%" stopColor="#070b18" />
            <stop offset="100%" stopColor="#04060d" />
          </radialGradient>
          <filter id="fm-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {WORLD_COUNTRIES.map((c) => (
            <clipPath key={c.id} id={`fmc-${c.id}`}>
              <path d={c.d} />
            </clipPath>
          ))}
        </defs>

        <rect x="0" y="0" width={WORLD_VIEW.w} height={WORLD_VIEW.h} fill="url(#fm-ocean)" />

        {/* Flag-filled country territories */}
        {WORLD_COUNTRIES.map((c) => {
          const owner = baseOwners[c.id];
          const src = owner ? flagSrc(owner) : null;
          const b = boxes[c.id];
          const dim = selectedSlug && owner !== selectedSlug;
          if (!src || !b) {
            // Neutral / unowned land — very dark and subtle so owned flags dominate.
            return <path key={c.id} d={c.d} fill="#0c1322" opacity={dim ? 0.2 : 0.55} />;
          }
          return (
            <image
              key={c.id}
              href={src}
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              preserveAspectRatio="xMidYMid slice"
              clipPath={`url(#fmc-${c.id})`}
              opacity={dim ? 0.22 : 1}
              onClick={onSelect ? () => onSelect(owner!) : undefined}
              style={{ transition: "opacity .35s ease", cursor: onSelect ? "pointer" : "default" }}
            />
          );
        })}

        {/* Expansion surge: selected flag grows into new territory */}
        {selectedSlug &&
          selectedFlag &&
          expansionIds.map((id) => {
            const b = boxes[id];
            if (!b) return null;
            return (
              <image
                key={`exp-${id}`}
                href={selectedFlag}
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                preserveAspectRatio="xMidYMid slice"
                clipPath={`url(#fmc-${id})`}
                className="fm-grow"
                style={{ pointerEvents: "none" }}
              />
            );
          })}

        {/* Borders — only around OWNED territory, very soft. Neutral land has no
            outline so Europe/Africa don't look technical. Selected nation glows. */}
        <g className="fm-borders">
          {WORLD_COUNTRIES.map((c) => {
            const owner = baseOwners[c.id];
            const isSel = selectedSlug && owner === selectedSlug;
            const isExp = selectedSlug && expansionIds.includes(c.id);
            if (!owner && !isExp) return null; // no outline on neutral land
            return (
              <path
                key={`b-${c.id}`}
                d={c.d}
                fill="none"
                stroke={isSel || isExp ? "#fff" : "rgba(255,255,255,0.1)"}
                strokeWidth={isSel || isExp ? 1.1 : 0.3}
                filter={isSel ? "url(#fm-glow)" : undefined}
                style={isSel ? { animation: "fmPulse 2s ease-in-out infinite" } : undefined}
              />
            );
          })}
        </g>

        {/* Compact flag-pin labels for the most active territories (de-cluttered). */}
        {showLabels && (
          <g style={{ pointerEvents: "none" }}>
            {labels.map((t) => {
              const team = getTeam(t.slug);
              const src = flagSrc(t.slug);
              if (!team) return null;
              const dim = selectedSlug && t.slug !== selectedSlug;
              const fw = 15;
              const fh = 10;
              const pad = 5;
              const gap = 4;
              const textW = team.shortName.length * 7.6;
              const pw = pad + fw + gap + textW + pad;
              const ph = 18;
              const lx = Math.min(Math.max(t.cx - pw / 2, 4), WORLD_VIEW.w - pw - 4);
              const ly = Math.min(Math.max(t.cy - ph / 2, 4), WORLD_VIEW.h - ph - 4);
              return (
                <g key={`l-${t.slug}`} opacity={dim ? 0.35 : 1}>
                  <rect x={lx} y={ly} width={pw} height={ph} rx={9} fill="rgba(5,6,10,0.78)" stroke="rgba(255,255,255,0.18)" strokeWidth={0.6} />
                  {src ? (
                    <image href={src} x={lx + pad} y={ly + (ph - fh) / 2} width={fw} height={fh} preserveAspectRatio="xMidYMid slice" />
                  ) : null}
                  <text
                    x={lx + pad + fw + gap}
                    y={ly + ph / 2}
                    dominantBaseline="central"
                    fontSize="11"
                    fontWeight="800"
                    fill="#fff"
                  >
                    {team.shortName}
                  </text>
                </g>
              );
            })}
          </g>
        )}
      </svg>
      {/* premium shimmer sweep (cheap, single element) */}
      <div className="fm-sheen absolute inset-0 pointer-events-none" aria-hidden />
    </div>
  );
}
