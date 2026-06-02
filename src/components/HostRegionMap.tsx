"use client";

import { useMemo, useState } from "react";
import type { HostBattleState } from "@/lib/host-battle";
import { formatNumber } from "@/lib/utils";
import { flagSrc, getTeam } from "@/data/worldcup-2026-teams";
import { WORLD_COUNTRIES } from "@/lib/worldgeo";
import { FlagBadge } from "./FlagArt";

type Props = { state: HostBattleState; className?: string };

// Combined host region (USA + Canada + Mexico + Central America) as ONE real
// silhouette, split into real-flag regions by today's vote share.
const HOST_IDS = new Set(["840", "124", "484", "320", "084", "340", "222", "558", "188", "591"]);

function bbox(d: string) {
  const nums = d.match(/-?\d+\.?\d*/g);
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
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
  return { minX, minY, maxX, maxY };
}

export function HostRegionMap({ state, className }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);

  const host = useMemo(() => WORLD_COUNTRIES.filter((c) => HOST_IDS.has(c.id)), []);
  const view = useMemo(() => {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const c of host) {
      const b = bbox(c.d);
      minX = Math.min(minX, b.minX);
      minY = Math.min(minY, b.minY);
      maxX = Math.max(maxX, b.maxX);
      maxY = Math.max(maxY, b.maxY);
    }
    const padX = (maxX - minX) * 0.06;
    const padY = (maxY - minY) * 0.06;
    return { x: minX - padX, y: minY - padY, w: maxX - minX + padX * 2, h: maxY - minY + padY * 2 };
  }, [host]);

  // Vote-share bands across the silhouette width.
  const bands = useMemo(() => {
    const tallies = state.tallies;
    const total = tallies.reduce((s, t) => s + t.votes, 0);
    let cursor = view.x;
    return tallies.map((t) => {
      const frac = total > 0 ? t.votes / total : 1 / Math.max(tallies.length, 1);
      const w = frac * view.w;
      const band = { slug: t.team.slug, x0: cursor, w, share: frac };
      cursor += w;
      return band;
    });
  }, [state.tallies, view]);

  return (
    <div className={`relative overflow-hidden rounded-3xl glass ring-soft ${className ?? ""}`}>
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="relative p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="chip">USA · Canada · Mexico — one combined region</div>
          <div className="text-xs text-white/45 tabular-nums">{formatNumber(state.totalVotes)} check-ins today</div>
        </div>

        <div
          className="mt-3 relative rounded-2xl overflow-hidden ring-1 ring-white/5"
          style={{ background: "radial-gradient(120% 100% at 50% 0%, #0b1530, #05060A 80%)" }}
        >
          <svg
            viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
            className="w-full h-auto block"
            role="img"
            aria-label="Host region battle — USA, Canada and Mexico split by vote share with real flags"
          >
            <defs>
              <clipPath id="host-union">
                {host.map((c) => (
                  <path key={c.id} d={c.d} />
                ))}
              </clipPath>
              <filter id="host-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.8" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Dark base silhouette */}
            <g clipPath="url(#host-union)">
              <rect x={view.x} y={view.y} width={view.w} height={view.h} fill="#141d33" />
              {/* Vote-share flag bands */}
              {bands.map((band) => {
                const src = flagSrc(band.slug);
                const dim = hovered && hovered !== band.slug;
                if (!src) return null;
                return (
                  <image
                    key={band.slug}
                    href={src}
                    x={band.x0}
                    y={view.y}
                    width={band.w}
                    height={view.h}
                    preserveAspectRatio="xMidYMid slice"
                    opacity={dim ? 0.25 : 1}
                    style={{ transition: "opacity .3s ease" }}
                    onMouseEnter={() => setHovered(band.slug)}
                    onMouseLeave={() => setHovered(null)}
                  />
                );
              })}
              {/* Band divider glow lines */}
              {bands.slice(1).map((band) => (
                <line
                  key={`d-${band.slug}`}
                  x1={band.x0}
                  y1={view.y}
                  x2={band.x0}
                  y2={view.y + view.h}
                  stroke="rgba(255,255,255,0.65)"
                  strokeWidth={0.4}
                />
              ))}
            </g>

            {/* Silhouette outline */}
            {host.map((c) => (
              <path key={`o-${c.id}`} d={c.d} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={0.5} filter="url(#host-glow)" />
            ))}

            {/* Band labels */}
            {bands.map((band) => {
              const team = getTeam(band.slug);
              if (!team || band.w < view.w * 0.08) return null;
              return (
                <text
                  key={`l-${band.slug}`}
                  x={band.x0 + band.w / 2}
                  y={view.y + view.h * 0.5}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={Math.min(7, view.w * 0.018)}
                  fontWeight="900"
                  fill="#fff"
                  opacity={hovered && hovered !== band.slug ? 0.3 : 1}
                  style={{ textShadow: "0 1px 2px rgba(0,0,0,0.9)" }}
                >
                  {team.shortName}
                </text>
              );
            })}
          </svg>
        </div>

        {/* Eligible-nation legend with live share */}
        <div className="mt-4 flex flex-wrap gap-2">
          {state.tallies.map((t) => {
            const active = !hovered || hovered === t.team.slug;
            return (
              <button
                key={t.team.slug}
                type="button"
                onMouseEnter={() => setHovered(t.team.slug)}
                onMouseLeave={() => setHovered(null)}
                className="inline-flex items-center gap-2 rounded-lg px-2 py-1 text-xs glass transition"
                style={{ opacity: active ? 1 : 0.4 }}
              >
                <FlagBadge slug={t.team.slug} w={20} h={14} />
                <span className="text-white/80">{t.team.name}</span>
                <span className="text-white/45 tabular-nums">{(t.share * 100).toFixed(0)}%</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
