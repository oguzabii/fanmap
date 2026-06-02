// Nation registry — derived from the 2026 tournament team data layer.
// Keeps the lightweight `Nation` shape used across the UI/DB, while the richer
// flag + group metadata lives in src/data/worldcup-2026-teams.ts.

import { TEAMS, getTeam, groupRivals, type Team } from "@/data/worldcup-2026-teams";

export type Nation = {
  slug: string;
  name: string;
  emoji: string;
  primary_color: string;
  secondary_color: string;
  supporter_count: number;
};

function toNation(t: Team): Nation {
  return {
    slug: t.slug,
    name: t.name,
    emoji: t.emojiFlag,
    primary_color: t.primary_color,
    secondary_color: t.secondary_color,
    supporter_count: t.supporter_count
  };
}

// Fallback registry used when Supabase isn't configured (preview/dev).
export const SEED_NATIONS: Nation[] = TEAMS.map(toNation);

export function getSeedNationBySlug(slug: string): Nation | null {
  const t = getTeam(slug);
  return t ? toNation(t) : null;
}

// Real, draw-accurate rivals = group-mates in the 2026 group stage.
export function rivalsOf(slug: string): string[] {
  return groupRivals(slug);
}
