// Geographic ownership for the Global FanMap.
// Real country polygons (from world-countries.generated.ts) are each assigned to
// ONE FanMap nation — supporter-weighted proximity to the nation's real home.
// Result: big nations own big, contiguous slabs of the real world map.

import { WORLD_COUNTRIES, WORLD_VIEW, type GeoCountry } from "@/data/world-countries.generated";

export { WORLD_COUNTRIES, WORLD_VIEW };
export type { GeoCountry };

// FanMap slug -> the country's own ISO-numeric id (zero-padded, as in the data).
// Used to force-claim each nation's real homeland. Omitted = no homeland in the
// 110m dataset (tiny states) — still gains territory by weighting.
export const NATION_ISO: Record<string, string> = {
  mexico: "484", "south-africa": "710", "korea-republic": "410", czechia: "203",
  canada: "124", "bosnia-herzegovina": "070", qatar: "634", switzerland: "756",
  brazil: "076", morocco: "504", haiti: "332", usa: "840",
  paraguay: "600", australia: "036", turkiye: "792", germany: "276",
  "ivory-coast": "384", ecuador: "218", netherlands: "528", japan: "392",
  sweden: "752", tunisia: "788", belgium: "056", egypt: "818",
  iran: "364", "new-zealand": "554", spain: "724", "saudi-arabia": "682",
  uruguay: "858", france: "250", senegal: "686", iraq: "368",
  norway: "578", argentina: "032", algeria: "012", austria: "040",
  jordan: "400", portugal: "620", "dr-congo": "180", uzbekistan: "860",
  colombia: "170", england: "826", croatia: "191", ghana: "288", panama: "591"
};

// FanMap slug -> [lon, lat] home (drives how far territory spreads).
export const NATION_LATLON: Record<string, [number, number]> = {
  mexico: [-102, 23], "south-africa": [25, -29], "korea-republic": [128, 36], czechia: [15, 50],
  canada: [-106, 56], "bosnia-herzegovina": [18, 44], qatar: [51, 25], switzerland: [8, 47],
  brazil: [-53, -10], morocco: [-6, 32], haiti: [-72, 19], scotland: [-4, 57],
  usa: [-98, 39], paraguay: [-58, -23], australia: [134, -25], turkiye: [35, 39],
  germany: [10, 51], curacao: [-69, 12], "ivory-coast": [-5, 8], ecuador: [-78, -1],
  netherlands: [5, 52], japan: [138, 37], sweden: [16, 62], tunisia: [9, 34],
  belgium: [4, 50], egypt: [30, 27], iran: [53, 32], "new-zealand": [172, -41],
  spain: [-4, 40], "cape-verde": [-24, 16], "saudi-arabia": [45, 24], uruguay: [-56, -33],
  france: [2, 47], senegal: [-14, 14], iraq: [44, 33], norway: [9, 61],
  argentina: [-64, -38], algeria: [3, 28], austria: [14, 47], jordan: [36, 31],
  portugal: [-8, 39], "dr-congo": [23, -3], uzbekistan: [64, 41], colombia: [-74, 4],
  england: [-1, 52], croatia: [16, 45], ghana: [-1, 8], panama: [-80, 9]
};

export type CountryOwners = Record<string, string>; // country id -> nation slug

function geoDist2(aLon: number, aLat: number, bLon: number, bLat: number): number {
  const midLat = ((aLat + bLat) / 2) * (Math.PI / 180);
  let dLon = aLon - bLon;
  if (dLon > 180) dLon -= 360;
  if (dLon < -180) dLon += 360;
  const dx = dLon * Math.cos(midLat);
  const dy = aLat - bLat;
  return dx * dx + dy * dy;
}

// Absolute expansion: territory scales with a nation's OWN supporters (not a
// relative share), so growth is real and the world keeps neutral land until
// nations actually earn it. ~1 extra country per this many supporters.
const SUPPORTERS_PER_COUNTRY = 3000;
const MAX_REACH = 16; // cap so no single nation swallows the planet

// HOMELAND-FIRST EXPANSION.
// Each active nation (supporters > 0) starts on its real homeland and grows
// outward to the nearest countries. A nation's reach scales with supporters, so
// strong nations spread across regions while weak ones stay home. Countries no
// nation reaches stay NEUTRAL (unowned). Nations with 0 supporters never appear.
export function allocateWorldGeo(
  nations: Array<{ slug: string; supporter_count: number }>
): CountryOwners {
  const owners: CountryOwners = {};
  const active = nations.filter((n) => n.supporter_count > 0 && NATION_LATLON[n.slug]);
  if (!active.length) return owners;

  const byId = new Map<string, GeoCountry>();
  for (const c of WORLD_COUNTRIES) byId.set(c.id, c);

  type Seed = {
    slug: string;
    homeId: string;
    order: string[]; // country ids sorted by distance from homeland
    budget: number;
    cursor: number;
    taken: number;
    supporters: number;
  };

  const seeds: Seed[] = active.map((n) => {
    const [lon, lat] = NATION_LATLON[n.slug];
    let homeId = NATION_ISO[n.slug];
    if (!homeId || !byId.has(homeId)) {
      // Tiny states absent from the dataset: anchor on the nearest country.
      let best = WORLD_COUNTRIES[0]?.id ?? "";
      let bd = Infinity;
      for (const c of WORLD_COUNTRIES) {
        const d = geoDist2(c.lon, c.lat, lon, lat);
        if (d < bd) {
          bd = d;
          best = c.id;
        }
      }
      homeId = best;
    }
    const order = [...WORLD_COUNTRIES]
      .sort((a, b) => geoDist2(a.lon, a.lat, lon, lat) - geoDist2(b.lon, b.lat, lon, lat))
      .map((c) => c.id);
    return {
      slug: n.slug,
      homeId,
      order,
      budget: Math.min(MAX_REACH, 1 + Math.floor(n.supporter_count / SUPPORTERS_PER_COUNTRY)),
      cursor: 0,
      taken: 0,
      supporters: n.supporter_count
    };
  });

  // Strongest nations pick contested borders first.
  seeds.sort((a, b) => b.supporters - a.supporters);

  // 1) Homelands (first supporter activates the homeland).
  for (const s of seeds) {
    if (owners[s.homeId] === undefined) {
      owners[s.homeId] = s.slug;
      s.taken = 1;
    }
  }

  // 2) Concentric outward expansion, round-robin (strong first each round).
  let progressing = true;
  while (progressing) {
    progressing = false;
    for (const s of seeds) {
      if (s.taken >= s.budget) continue;
      while (s.cursor < s.order.length && owners[s.order[s.cursor]] !== undefined) s.cursor++;
      if (s.cursor >= s.order.length) continue;
      owners[s.order[s.cursor]] = s.slug;
      s.taken++;
      s.cursor++;
      progressing = true;
    }
  }

  return owners;
}

export type Territory = {
  slug: string;
  ids: string[];
  paths: string[];
  count: number;
  minX: number;
  minY: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
};

// Group owned countries per nation + bbox/centroid (for flag clip + labels).
export function territoriesFromOwners(owners: CountryOwners): Territory[] {
  const byId = new Map<string, GeoCountry>();
  for (const c of WORLD_COUNTRIES) byId.set(c.id, c);

  const grouped: Record<string, GeoCountry[]> = {};
  for (const [id, slug] of Object.entries(owners)) {
    const c = byId.get(id);
    if (!c) continue;
    (grouped[slug] ??= []).push(c);
  }

  return Object.entries(grouped)
    .map(([slug, cs]) => {
      // bbox from projected centroids is imprecise; approximate using path bbox
      // via min/max of centroids padded — good enough for a slice flag fill.
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;
      for (const c of cs) {
        const b = pathBounds(c.d);
        if (b) {
          minX = Math.min(minX, b.minX);
          minY = Math.min(minY, b.minY);
          maxX = Math.max(maxX, b.maxX);
          maxY = Math.max(maxY, b.maxY);
        }
      }
      // largest country centroid for the label
      const main = cs.reduce((a, b) => (countryArea(b) > countryArea(a) ? b : a), cs[0]);
      return {
        slug,
        ids: cs.map((c) => c.id),
        paths: cs.map((c) => c.d),
        count: cs.length,
        minX: isFinite(minX) ? minX : 0,
        minY: isFinite(minY) ? minY : 0,
        w: isFinite(maxX - minX) ? maxX - minX : WORLD_VIEW.w,
        h: isFinite(maxY - minY) ? maxY - minY : WORLD_VIEW.h,
        cx: main.cx,
        cy: main.cy
      };
    })
    .sort((a, b) => b.count - a.count);
}

// Cheap path bounding box from the numbers in the `d` string.
function pathBounds(d: string): { minX: number; minY: number; maxX: number; maxY: number } | null {
  const nums = d.match(/-?\d+\.?\d*/g);
  if (!nums || nums.length < 2) return null;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i + 1 < nums.length; i += 2) {
    const x = parseFloat(nums[i]);
    const y = parseFloat(nums[i + 1]);
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return { minX, minY, maxX, maxY };
}

function countryArea(c: GeoCountry): number {
  const b = pathBounds(c.d);
  if (!b) return 0;
  return (b.maxX - b.minX) * (b.maxY - b.minY);
}

export const TOTAL_COUNTRIES = WORLD_COUNTRIES.length;
