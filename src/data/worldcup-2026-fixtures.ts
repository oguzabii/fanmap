// FanMap — 2026 group-stage fixtures.
//
// SOURCE: data/Spielplan.pdf (official 2026 schedule, Canada · Mexico · USA,
// 11.6.–19.7.26). All 72 group-stage matches are encoded below, verbatim from
// the Spielplan: date, kickoff (CEST / MESZ as printed), host city, group.
// Venue + host country are resolved from the host city. These are REAL fixtures
// (isSample: false). Times are CEST because that is the source document's zone.
//
// ┌──────────────────────────────────────────────────────────────────────────┐
// │ ADD / EDIT FIXTURES: append rows to GROUP_STAGE below. Format:             │
// │   [group, "YYYY-MM-DD", "HH:MM", cityKey, teamSlugA, teamSlugB]            │
// │ Set the row's date from the Spielplan. cityKey must exist in CITY.         │
// └──────────────────────────────────────────────────────────────────────────┘

export type HostCountry = "USA" | "Canada" | "Mexico";

export type Fixture = {
  id: string;
  matchDate: string; // YYYY-MM-DD (CEST calendar day, as printed in the Spielplan)
  kickoff: string | null; // "HH:MM CEST" display label
  teamA: string;
  teamB: string;
  hostCity: string;
  venue: string;
  hostCountry: HostCountry;
  group: string;
  stage: string;
  isSample: boolean;
};

export const SCHEDULE_TIMEZONE = "CEST";

// Host city → venue + country (the 16 official venues).
const CITY: Record<string, { city: string; venue: string; country: HostCountry }> = {
  "mexico-city": { city: "Mexico City", venue: "Estadio Azteca", country: "Mexico" },
  guadalajara: { city: "Guadalajara", venue: "Estadio Akron", country: "Mexico" },
  monterrey: { city: "Monterrey", venue: "Estadio BBVA", country: "Mexico" },
  toronto: { city: "Toronto", venue: "BMO Field", country: "Canada" },
  vancouver: { city: "Vancouver", venue: "BC Place", country: "Canada" },
  ny: { city: "New York/New Jersey", venue: "MetLife Stadium", country: "USA" },
  la: { city: "Los Angeles", venue: "SoFi Stadium", country: "USA" },
  sf: { city: "San Francisco Bay Area", venue: "Levi's Stadium", country: "USA" },
  boston: { city: "Boston", venue: "Gillette Stadium", country: "USA" },
  philadelphia: { city: "Philadelphia", venue: "Lincoln Financial Field", country: "USA" },
  seattle: { city: "Seattle", venue: "Lumen Field", country: "USA" },
  atlanta: { city: "Atlanta", venue: "Mercedes-Benz Stadium", country: "USA" },
  miami: { city: "Miami", venue: "Hard Rock Stadium", country: "USA" },
  houston: { city: "Houston", venue: "NRG Stadium", country: "USA" },
  dallas: { city: "Dallas", venue: "AT&T Stadium", country: "USA" },
  "kansas-city": { city: "Kansas City", venue: "Arrowhead Stadium", country: "USA" }
};

export const HOST_VENUES = Object.values(CITY);

// [group, date, kickoff(CEST), cityKey, teamA, teamB] — from Spielplan.pdf.
type Row = [string, string, string, string, string, string];

const GROUP_STAGE: Row[] = [
  // Group A
  ["A", "2026-06-11", "21:00", "mexico-city", "mexico", "south-africa"],
  ["A", "2026-06-12", "04:00", "guadalajara", "korea-republic", "czechia"],
  ["A", "2026-06-18", "18:00", "atlanta", "czechia", "south-africa"],
  ["A", "2026-06-19", "03:00", "guadalajara", "mexico", "korea-republic"],
  ["A", "2026-06-25", "03:00", "mexico-city", "czechia", "mexico"],
  ["A", "2026-06-25", "03:00", "monterrey", "south-africa", "korea-republic"],
  // Group B
  ["B", "2026-06-12", "21:00", "toronto", "canada", "bosnia-herzegovina"],
  ["B", "2026-06-13", "21:00", "sf", "qatar", "switzerland"],
  ["B", "2026-06-18", "21:00", "la", "switzerland", "bosnia-herzegovina"],
  ["B", "2026-06-19", "00:00", "vancouver", "canada", "qatar"],
  ["B", "2026-06-24", "21:00", "vancouver", "switzerland", "canada"],
  ["B", "2026-06-24", "21:00", "seattle", "bosnia-herzegovina", "qatar"],
  // Group C
  ["C", "2026-06-14", "00:00", "ny", "brazil", "morocco"],
  ["C", "2026-06-14", "03:00", "boston", "haiti", "scotland"],
  ["C", "2026-06-20", "00:00", "boston", "scotland", "morocco"],
  ["C", "2026-06-20", "02:30", "philadelphia", "brazil", "haiti"],
  ["C", "2026-06-25", "00:00", "miami", "scotland", "brazil"],
  ["C", "2026-06-25", "00:00", "atlanta", "morocco", "haiti"],
  // Group D
  ["D", "2026-06-13", "03:00", "la", "usa", "paraguay"],
  ["D", "2026-06-14", "06:00", "vancouver", "australia", "turkiye"],
  ["D", "2026-06-19", "21:00", "seattle", "usa", "australia"],
  ["D", "2026-06-20", "05:00", "sf", "turkiye", "paraguay"],
  ["D", "2026-06-26", "04:00", "la", "turkiye", "usa"],
  ["D", "2026-06-26", "04:00", "sf", "paraguay", "australia"],
  // Group E
  ["E", "2026-06-14", "19:00", "houston", "germany", "curacao"],
  ["E", "2026-06-15", "01:00", "philadelphia", "ivory-coast", "ecuador"],
  ["E", "2026-06-20", "22:00", "toronto", "germany", "ivory-coast"],
  ["E", "2026-06-21", "02:00", "kansas-city", "ecuador", "curacao"],
  ["E", "2026-06-25", "22:00", "philadelphia", "curacao", "ivory-coast"],
  ["E", "2026-06-25", "22:00", "ny", "ecuador", "germany"],
  // Group F
  ["F", "2026-06-14", "22:00", "dallas", "netherlands", "japan"],
  ["F", "2026-06-15", "04:00", "monterrey", "sweden", "tunisia"],
  ["F", "2026-06-20", "19:00", "houston", "netherlands", "sweden"],
  ["F", "2026-06-21", "06:00", "monterrey", "tunisia", "japan"],
  ["F", "2026-06-26", "01:00", "dallas", "japan", "sweden"],
  ["F", "2026-06-26", "01:00", "kansas-city", "tunisia", "netherlands"],
  // Group G
  ["G", "2026-06-15", "21:00", "seattle", "belgium", "egypt"],
  ["G", "2026-06-16", "03:00", "la", "iran", "new-zealand"],
  ["G", "2026-06-21", "21:00", "la", "belgium", "iran"],
  ["G", "2026-06-22", "03:00", "vancouver", "new-zealand", "egypt"],
  ["G", "2026-06-27", "05:00", "seattle", "egypt", "iran"],
  ["G", "2026-06-27", "05:00", "vancouver", "new-zealand", "belgium"],
  // Group H
  ["H", "2026-06-15", "18:00", "atlanta", "spain", "cape-verde"],
  ["H", "2026-06-16", "00:00", "miami", "saudi-arabia", "uruguay"],
  ["H", "2026-06-21", "18:00", "atlanta", "spain", "saudi-arabia"],
  ["H", "2026-06-22", "00:00", "miami", "uruguay", "cape-verde"],
  ["H", "2026-06-27", "02:00", "houston", "cape-verde", "saudi-arabia"],
  ["H", "2026-06-27", "02:00", "guadalajara", "uruguay", "spain"],
  // Group I
  ["I", "2026-06-16", "21:00", "ny", "france", "senegal"],
  ["I", "2026-06-17", "00:00", "boston", "iraq", "norway"],
  ["I", "2026-06-22", "23:00", "philadelphia", "france", "iraq"],
  ["I", "2026-06-23", "02:00", "ny", "norway", "senegal"],
  ["I", "2026-06-26", "21:00", "boston", "norway", "france"],
  ["I", "2026-06-26", "21:00", "toronto", "senegal", "iraq"],
  // Group J
  ["J", "2026-06-17", "03:00", "kansas-city", "argentina", "algeria"],
  ["J", "2026-06-17", "06:00", "sf", "austria", "jordan"],
  ["J", "2026-06-22", "19:00", "dallas", "argentina", "austria"],
  ["J", "2026-06-23", "05:00", "sf", "jordan", "algeria"],
  ["J", "2026-06-28", "04:00", "kansas-city", "algeria", "austria"],
  ["J", "2026-06-28", "04:00", "dallas", "jordan", "argentina"],
  // Group K
  ["K", "2026-06-17", "19:00", "houston", "portugal", "dr-congo"],
  ["K", "2026-06-18", "04:00", "mexico-city", "uzbekistan", "colombia"],
  ["K", "2026-06-22", "19:00", "houston", "portugal", "uzbekistan"],
  ["K", "2026-06-24", "04:00", "guadalajara", "colombia", "dr-congo"],
  ["K", "2026-06-28", "01:30", "miami", "colombia", "portugal"],
  ["K", "2026-06-28", "01:30", "atlanta", "dr-congo", "uzbekistan"],
  // Group L
  ["L", "2026-06-17", "22:00", "dallas", "england", "croatia"],
  ["L", "2026-06-18", "01:00", "toronto", "ghana", "panama"],
  ["L", "2026-06-23", "22:00", "boston", "england", "ghana"],
  ["L", "2026-06-24", "01:00", "toronto", "panama", "croatia"],
  ["L", "2026-06-27", "23:00", "ny", "panama", "england"],
  ["L", "2026-06-27", "23:00", "philadelphia", "croatia", "ghana"]
];

// Matchday index within each group: rows 0-1 = MD1, 2-3 = MD2, 4-5 = MD3.
const groupSeen: Record<string, number> = {};

export const FIXTURES: Fixture[] = GROUP_STAGE.map(([group, matchDate, kickoff, cityKey, teamA, teamB], i) => {
  const c = CITY[cityKey];
  const n = (groupSeen[group] = (groupSeen[group] ?? 0) + 1);
  const matchday = Math.ceil(n / 2);
  return {
    id: `wc26-${String(i + 1).padStart(3, "0")}`,
    matchDate,
    kickoff: `${kickoff} ${SCHEDULE_TIMEZONE}`,
    teamA,
    teamB,
    hostCity: c.city,
    venue: c.venue,
    hostCountry: c.country,
    group,
    stage: `Group stage · Matchday ${matchday}`,
    isSample: false
  };
});

/** True when at least one real (non-sample) fixture is loaded. */
export const HAS_REAL_FIXTURES = FIXTURES.some((f) => !f.isSample);

const ALL_DATES = Array.from(new Set(FIXTURES.map((f) => f.matchDate))).sort();
export const FIRST_FIXTURE_DATE = ALL_DATES[0] ?? null;
export const LAST_FIXTURE_DATE = ALL_DATES[ALL_DATES.length - 1] ?? null;

export function fixturesOn(date: string): Fixture[] {
  return FIXTURES.filter((f) => f.matchDate === date);
}

export function realFixturesOn(date: string): Fixture[] {
  return FIXTURES.filter((f) => f.matchDate === date && !f.isSample);
}

export function eligibleSlugsOn(date: string, realOnly = true): string[] {
  const rows = realOnly ? realFixturesOn(date) : fixturesOn(date);
  const set = new Set<string>();
  for (const f of rows) {
    set.add(f.teamA);
    set.add(f.teamB);
  }
  return Array.from(set);
}

/** Earliest date >= fromDate that has real fixtures (for "next matchday"). */
export function nextRealFixtureDate(fromDate: string): string | null {
  return FIXTURES.filter((f) => !f.isSample && f.matchDate >= fromDate)
    .map((f) => f.matchDate)
    .sort()[0] ?? null;
}

/** Next real fixture for a specific team (>= fromDate). */
export function nextFixtureForTeam(slug: string, fromDate: string): Fixture | null {
  return (
    FIXTURES.filter((f) => !f.isSample && f.matchDate >= fromDate && (f.teamA === slug || f.teamB === slug)).sort(
      (a, b) => a.matchDate.localeCompare(b.matchDate)
    )[0] ?? null
  );
}
