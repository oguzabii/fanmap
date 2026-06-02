import { getPublicClient } from "./supabase";
import { SEED_NATIONS, type Nation } from "./nations";

export type NationWithDelta = Nation & { id?: string; growth24h: number };

// Live read of nations + a simulated 24h growth column for the MVP.
// In a future iteration this should query a real supporters-by-day rollup.
export async function fetchNations(): Promise<NationWithDelta[]> {
  const client = getPublicClient();
  if (!client) {
    return SEED_NATIONS.map((n, i) => ({
      ...n,
      growth24h: simulatedGrowth(n.slug, n.supporter_count, i)
    })).sort((a, b) => b.supporter_count - a.supporter_count);
  }

  const { data, error } = await client
    .from("nations")
    .select("id,slug,name,emoji,primary_color,secondary_color,supporter_count")
    .order("supporter_count", { ascending: false });

  if (error || !data) {
    return SEED_NATIONS.map((n, i) => ({
      ...n,
      growth24h: simulatedGrowth(n.slug, n.supporter_count, i)
    }));
  }

  return data.map((n, i) => ({
    ...n,
    growth24h: simulatedGrowth(n.slug, n.supporter_count, i)
  }));
}

export async function fetchNation(slug: string): Promise<NationWithDelta | null> {
  const all = await fetchNations();
  return all.find((n) => n.slug === slug) ?? null;
}

// Deterministic pseudo-growth — keeps SSR + client output stable for MVP.
function simulatedGrowth(slug: string, count: number, idx: number): number {
  const seed = slug
    .split("")
    .reduce((acc, c) => (acc + c.charCodeAt(0)) % 997, 0);
  return Math.max(20, Math.round(((seed % 50) + 25 + (count % 73)) / (idx + 1)));
}

export function totalSupporters(nations: NationWithDelta[]): number {
  return nations.reduce((sum, n) => sum + n.supporter_count, 0);
}

export function fastestGrowing(nations: NationWithDelta[]): NationWithDelta | null {
  if (!nations.length) return null;
  return [...nations].sort((a, b) => b.growth24h - a.growth24h)[0];
}

export function mapShare(nation: Pick<Nation, "supporter_count">, total: number): number {
  if (total <= 0) return 0;
  return nation.supporter_count / total;
}
