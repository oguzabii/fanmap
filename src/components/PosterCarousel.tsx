"use client";

import { useEffect, useMemo, useState } from "react";
import { TEAMS, getTeam } from "@/data/worldcup-2026-teams";
import { FanCard } from "./FanCard";

const NAMES = ["Selin", "Lucas", "Noah", "Diogo", "Mason", "Yuki", "Omar", "Lea", "Mateo", "Ava", "Kai", "Sara"];

// Rotating poster preview through ALL participating teams (Türkiye first).
// Real flags only (FanCard uses flagSrc). Lightweight — only the current card renders.
export function PosterCarousel() {
  const { order, rankBySlug, total } = useMemo(() => {
    const sorted = [...TEAMS].sort((a, b) => b.supporter_count - a.supporter_count);
    const rank: Record<string, number> = {};
    sorted.forEach((t, idx) => (rank[t.slug] = idx + 1));
    const sum = TEAMS.reduce((s, t) => s + t.supporter_count, 0) || 1;
    const ord = ["turkiye", ...sorted.map((t) => t.slug).filter((s) => s !== "turkiye")];
    return { order: ord, rankBySlug: rank, total: sum };
  }, []);

  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % order.length), 2500);
    return () => clearInterval(id);
  }, [order.length]);

  const slug = order[i];
  const team = getTeam(slug);
  if (!team) return null;
  const name = NAMES[i % NAMES.length];

  return (
    <div className="relative">
      <FanCard
        key={slug}
        slug={slug}
        nationName={team.name}
        nationEmoji={team.emojiFlag}
        primaryColor={team.primary_color}
        secondaryColor={team.secondary_color}
        nickname={name}
        supporterNumber={team.supporter_count}
        rank={rankBySlug[slug]}
        mapShare={team.supporter_count / total}
        referralCode={`${team.shortName}26`}
        className="animate-rise"
      />
      <div className="mt-3 flex items-center gap-3">
        <div className="h-1 flex-1 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full bg-neon-cyan transition-all duration-500"
            style={{ width: `${((i + 1) / order.length) * 100}%` }}
          />
        </div>
        <div className="text-xs text-white/45 tabular-nums whitespace-nowrap">
          {team.name} · {i + 1}/{order.length}
        </div>
      </div>
    </div>
  );
}
