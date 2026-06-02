// FanMap — 2026 tournament team data layer.
//
// This is the single source of truth for participating teams. It contains ONLY
// the 48 teams in the 2026 men's tournament (hosts USA · Canada · Mexico + the
// drawn qualifiers, groups A–L). It deliberately excludes any nation that is not
// in the tournament.
//
// Source: 2026 group-stage draw (draw held Dec 5, 2025). Update `qualified` and
// add/remove teams here if the official participant list changes.
//
// LEGAL: only national flags / flag-inspired colors + motifs are used. No FIFA
// or tournament logos, no federation crests, no national-team logos, no trophy
// or mascot imagery. This is an independent fan project.

export type FlagPattern =
  | "vertical-tricolor"
  | "horizontal-tricolor"
  | "vertical-bicolor"
  | "horizontal-bicolor"
  | "triband-h"
  | "bands-horizontal"
  | "swiss-cross"
  | "st-george-cross"
  | "nordic-cross"
  | "saltire"
  | "crescent-star"
  | "pentagram"
  | "diamond"
  | "sun"
  | "stripes-canton"
  | "starfield"
  | "disc"
  | "taegeuk"
  | "maple"
  | "triangle-hoist"
  | "diagonal"
  | "quadrants"
  | "solid";

export type Team = {
  slug: string;
  name: string;
  shortName: string;
  emojiFlag: string;
  /** Ordered flag colors used by the flag-art renderer (field first). */
  flagColors: string[];
  flagPatternType: FlagPattern;
  /** UI gradient colors (kept visible — never pure white as primary). */
  primary_color: string;
  secondary_color: string;
  group: string;
  qualified: boolean;
  primaryFanCollectionName: string;
  /** Grid home (col,row) on the 40×20 world map used for territory seeding. */
  home: { col: number; row: number };
  /** Seed supporter count for preview only; live counts come from the DB. */
  supporter_count: number;
};

const RED_WAVE = "Red Wave Supporter Collection";
const ALPINE_RED = "Alpine Red Supporter Collection";
const YELLOW_WAVE = "Yellow Wave Supporter Collection";
const GREEN_RED = "Green Red Supporter Collection";
const BLUE_WAVE = "Blue Wave Supporter Collection";

export const TEAMS: Team[] = [
  // Group A
  { slug: "mexico", name: "Mexico", shortName: "MEX", emojiFlag: "🇲🇽", flagColors: ["#006847", "#FFFFFF", "#CE1126"], flagPatternType: "vertical-tricolor", primary_color: "#006847", secondary_color: "#CE1126", group: "A", qualified: true, primaryFanCollectionName: GREEN_RED, home: { col: 7, row: 6 }, supporter_count: 8700 },
  { slug: "south-africa", name: "South Africa", shortName: "RSA", emojiFlag: "🇿🇦", flagColors: ["#007A4D", "#FFB915", "#DE3831"], flagPatternType: "bands-horizontal", primary_color: "#007A4D", secondary_color: "#FFB915", group: "A", qualified: true, primaryFanCollectionName: YELLOW_WAVE, home: { col: 23, row: 13 }, supporter_count: 2600 },
  { slug: "korea-republic", name: "Korea Republic", shortName: "KOR", emojiFlag: "🇰🇷", flagColors: ["#FFFFFF", "#CD2E3A", "#0047A0"], flagPatternType: "taegeuk", primary_color: "#003478", secondary_color: "#CD2E3A", group: "A", qualified: true, primaryFanCollectionName: BLUE_WAVE, home: { col: 37, row: 5 }, supporter_count: 5200 },
  { slug: "czechia", name: "Czechia", shortName: "CZE", emojiFlag: "🇨🇿", flagColors: ["#FFFFFF", "#D7141A", "#11457E"], flagPatternType: "triangle-hoist", primary_color: "#11457E", secondary_color: "#D7141A", group: "A", qualified: true, primaryFanCollectionName: BLUE_WAVE, home: { col: 24, row: 3 }, supporter_count: 3300 },

  // Group B
  { slug: "canada", name: "Canada", shortName: "CAN", emojiFlag: "🇨🇦", flagColors: ["#FF0000", "#FFFFFF"], flagPatternType: "maple", primary_color: "#D80621", secondary_color: "#FFFFFF", group: "B", qualified: true, primaryFanCollectionName: RED_WAVE, home: { col: 7, row: 2 }, supporter_count: 7600 },
  { slug: "bosnia-herzegovina", name: "Bosnia & Herzegovina", shortName: "BIH", emojiFlag: "🇧🇦", flagColors: ["#001489", "#FECB00"], flagPatternType: "triangle-hoist", primary_color: "#001489", secondary_color: "#FECB00", group: "B", qualified: true, primaryFanCollectionName: BLUE_WAVE, home: { col: 25, row: 5 }, supporter_count: 3100 },
  { slug: "qatar", name: "Qatar", shortName: "QAT", emojiFlag: "🇶🇦", flagColors: ["#FFFFFF", "#8A1538"], flagPatternType: "vertical-bicolor", primary_color: "#8A1538", secondary_color: "#FFFFFF", group: "B", qualified: true, primaryFanCollectionName: RED_WAVE, home: { col: 28, row: 6 }, supporter_count: 2400 },
  { slug: "switzerland", name: "Switzerland", shortName: "SUI", emojiFlag: "🇨🇭", flagColors: ["#D52B1E", "#FFFFFF"], flagPatternType: "swiss-cross", primary_color: "#D52B1E", secondary_color: "#FFFFFF", group: "B", qualified: true, primaryFanCollectionName: ALPINE_RED, home: { col: 22, row: 4 }, supporter_count: 6800 },

  // Group C
  { slug: "brazil", name: "Brazil", shortName: "BRA", emojiFlag: "🇧🇷", flagColors: ["#009C3B", "#FFDF00", "#002776"], flagPatternType: "diamond", primary_color: "#009C3B", secondary_color: "#FFDF00", group: "C", qualified: true, primaryFanCollectionName: YELLOW_WAVE, home: { col: 12, row: 10 }, supporter_count: 14210 },
  { slug: "morocco", name: "Morocco", shortName: "MAR", emojiFlag: "🇲🇦", flagColors: ["#C1272D", "#006233"], flagPatternType: "pentagram", primary_color: "#C1272D", secondary_color: "#006233", group: "C", qualified: true, primaryFanCollectionName: GREEN_RED, home: { col: 18, row: 6 }, supporter_count: 8200 },
  { slug: "haiti", name: "Haiti", shortName: "HAI", emojiFlag: "🇭🇹", flagColors: ["#00209F", "#D21034"], flagPatternType: "horizontal-bicolor", primary_color: "#00209F", secondary_color: "#D21034", group: "C", qualified: true, primaryFanCollectionName: BLUE_WAVE, home: { col: 10, row: 7 }, supporter_count: 1800 },
  { slug: "scotland", name: "Scotland", shortName: "SCO", emojiFlag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", flagColors: ["#0065BF", "#FFFFFF"], flagPatternType: "saltire", primary_color: "#0065BF", secondary_color: "#FFFFFF", group: "C", qualified: true, primaryFanCollectionName: BLUE_WAVE, home: { col: 19, row: 2 }, supporter_count: 4200 },

  // Group D
  { slug: "usa", name: "USA", shortName: "USA", emojiFlag: "🇺🇸", flagColors: ["#B22234", "#FFFFFF", "#3C3B6E"], flagPatternType: "stripes-canton", primary_color: "#3C3B6E", secondary_color: "#B22234", group: "D", qualified: true, primaryFanCollectionName: BLUE_WAVE, home: { col: 7, row: 4 }, supporter_count: 9300 },
  { slug: "paraguay", name: "Paraguay", shortName: "PAR", emojiFlag: "🇵🇾", flagColors: ["#D52B1E", "#FFFFFF", "#0038A8"], flagPatternType: "horizontal-tricolor", primary_color: "#0038A8", secondary_color: "#D52B1E", group: "D", qualified: true, primaryFanCollectionName: RED_WAVE, home: { col: 11, row: 12 }, supporter_count: 2900 },
  { slug: "australia", name: "Australia", shortName: "AUS", emojiFlag: "🇦🇺", flagColors: ["#00247D", "#FFFFFF", "#CC142B"], flagPatternType: "starfield", primary_color: "#00247D", secondary_color: "#FFCD00", group: "D", qualified: true, primaryFanCollectionName: BLUE_WAVE, home: { col: 37, row: 13 }, supporter_count: 4100 },
  { slug: "turkiye", name: "Türkiye", shortName: "TUR", emojiFlag: "🇹🇷", flagColors: ["#E30A17", "#FFFFFF"], flagPatternType: "crescent-star", primary_color: "#E30A17", secondary_color: "#FFFFFF", group: "D", qualified: true, primaryFanCollectionName: RED_WAVE, home: { col: 26, row: 4 }, supporter_count: 12480 },

  // Group E
  { slug: "germany", name: "Germany", shortName: "GER", emojiFlag: "🇩🇪", flagColors: ["#000000", "#DD0000", "#FFCE00"], flagPatternType: "horizontal-tricolor", primary_color: "#111111", secondary_color: "#FFCE00", group: "E", qualified: true, primaryFanCollectionName: YELLOW_WAVE, home: { col: 22, row: 3 }, supporter_count: 11200 },
  { slug: "curacao", name: "Curaçao", shortName: "CUW", emojiFlag: "🇨🇼", flagColors: ["#002B7F", "#F9E814"], flagPatternType: "horizontal-bicolor", primary_color: "#002B7F", secondary_color: "#F9E814", group: "E", qualified: true, primaryFanCollectionName: BLUE_WAVE, home: { col: 10, row: 8 }, supporter_count: 900 },
  { slug: "ivory-coast", name: "Ivory Coast", shortName: "CIV", emojiFlag: "🇨🇮", flagColors: ["#F77F00", "#FFFFFF", "#009E60"], flagPatternType: "vertical-tricolor", primary_color: "#F77F00", secondary_color: "#009E60", group: "E", qualified: true, primaryFanCollectionName: GREEN_RED, home: { col: 19, row: 8 }, supporter_count: 3600 },
  { slug: "ecuador", name: "Ecuador", shortName: "ECU", emojiFlag: "🇪🇨", flagColors: ["#FFDD00", "#034EA2", "#ED1C24"], flagPatternType: "horizontal-tricolor", primary_color: "#034EA2", secondary_color: "#FFDD00", group: "E", qualified: true, primaryFanCollectionName: YELLOW_WAVE, home: { col: 8, row: 10 }, supporter_count: 3000 },

  // Group F
  { slug: "netherlands", name: "Netherlands", shortName: "NED", emojiFlag: "🇳🇱", flagColors: ["#AE1C28", "#FFFFFF", "#21468B"], flagPatternType: "horizontal-tricolor", primary_color: "#FF6B00", secondary_color: "#21468B", group: "F", qualified: true, primaryFanCollectionName: BLUE_WAVE, home: { col: 21, row: 3 }, supporter_count: 7400 },
  { slug: "japan", name: "Japan", shortName: "JPN", emojiFlag: "🇯🇵", flagColors: ["#FFFFFF", "#BC002D"], flagPatternType: "disc", primary_color: "#BC002D", secondary_color: "#FFFFFF", group: "F", qualified: true, primaryFanCollectionName: RED_WAVE, home: { col: 39, row: 5 }, supporter_count: 6100 },
  { slug: "sweden", name: "Sweden", shortName: "SWE", emojiFlag: "🇸🇪", flagColors: ["#005293", "#FECB00"], flagPatternType: "nordic-cross", primary_color: "#005293", secondary_color: "#FECB00", group: "F", qualified: true, primaryFanCollectionName: YELLOW_WAVE, home: { col: 23, row: 2 }, supporter_count: 4300 },
  { slug: "tunisia", name: "Tunisia", shortName: "TUN", emojiFlag: "🇹🇳", flagColors: ["#E70013", "#FFFFFF"], flagPatternType: "crescent-star", primary_color: "#E70013", secondary_color: "#FFFFFF", group: "F", qualified: true, primaryFanCollectionName: RED_WAVE, home: { col: 21, row: 6 }, supporter_count: 3400 },

  // Group G
  { slug: "belgium", name: "Belgium", shortName: "BEL", emojiFlag: "🇧🇪", flagColors: ["#000000", "#FAE042", "#ED2939"], flagPatternType: "vertical-tricolor", primary_color: "#ED2939", secondary_color: "#FAE042", group: "G", qualified: true, primaryFanCollectionName: YELLOW_WAVE, home: { col: 20, row: 3 }, supporter_count: 5200 },
  { slug: "egypt", name: "Egypt", shortName: "EGY", emojiFlag: "🇪🇬", flagColors: ["#CE1126", "#FFFFFF", "#000000"], flagPatternType: "horizontal-tricolor", primary_color: "#CE1126", secondary_color: "#000000", group: "G", qualified: true, primaryFanCollectionName: RED_WAVE, home: { col: 25, row: 6 }, supporter_count: 4800 },
  { slug: "iran", name: "Iran", shortName: "IRN", emojiFlag: "🇮🇷", flagColors: ["#239F40", "#FFFFFF", "#DA0000"], flagPatternType: "horizontal-tricolor", primary_color: "#239F40", secondary_color: "#DA0000", group: "G", qualified: true, primaryFanCollectionName: GREEN_RED, home: { col: 28, row: 5 }, supporter_count: 4000 },
  { slug: "new-zealand", name: "New Zealand", shortName: "NZL", emojiFlag: "🇳🇿", flagColors: ["#00247D", "#FFFFFF", "#CC142B"], flagPatternType: "starfield", primary_color: "#00247D", secondary_color: "#CC142B", group: "G", qualified: true, primaryFanCollectionName: BLUE_WAVE, home: { col: 39, row: 15 }, supporter_count: 1700 },

  // Group H
  { slug: "spain", name: "Spain", shortName: "ESP", emojiFlag: "🇪🇸", flagColors: ["#AA151B", "#F1BF00"], flagPatternType: "triband-h", primary_color: "#AA151B", secondary_color: "#F1BF00", group: "H", qualified: true, primaryFanCollectionName: RED_WAVE, home: { col: 19, row: 5 }, supporter_count: 9600 },
  { slug: "cape-verde", name: "Cape Verde", shortName: "CPV", emojiFlag: "🇨🇻", flagColors: ["#003893", "#FFFFFF", "#CF2027"], flagPatternType: "bands-horizontal", primary_color: "#003893", secondary_color: "#CF2027", group: "H", qualified: true, primaryFanCollectionName: BLUE_WAVE, home: { col: 16, row: 7 }, supporter_count: 800 },
  { slug: "saudi-arabia", name: "Saudi Arabia", shortName: "KSA", emojiFlag: "🇸🇦", flagColors: ["#006C35", "#FFFFFF"], flagPatternType: "solid", primary_color: "#006C35", secondary_color: "#FFFFFF", group: "H", qualified: true, primaryFanCollectionName: GREEN_RED, home: { col: 27, row: 6 }, supporter_count: 3900 },
  { slug: "uruguay", name: "Uruguay", shortName: "URU", emojiFlag: "🇺🇾", flagColors: ["#FFFFFF", "#0038A8", "#FCD116"], flagPatternType: "sun", primary_color: "#0038A8", secondary_color: "#FCD116", group: "H", qualified: true, primaryFanCollectionName: BLUE_WAVE, home: { col: 12, row: 13 }, supporter_count: 4600 },

  // Group I
  { slug: "france", name: "France", shortName: "FRA", emojiFlag: "🇫🇷", flagColors: ["#0055A4", "#FFFFFF", "#EF4135"], flagPatternType: "vertical-tricolor", primary_color: "#0055A4", secondary_color: "#EF4135", group: "I", qualified: true, primaryFanCollectionName: BLUE_WAVE, home: { col: 20, row: 4 }, supporter_count: 11800 },
  { slug: "senegal", name: "Senegal", shortName: "SEN", emojiFlag: "🇸🇳", flagColors: ["#00853F", "#FDEF42", "#E31B23"], flagPatternType: "vertical-tricolor", primary_color: "#00853F", secondary_color: "#FDEF42", group: "I", qualified: true, primaryFanCollectionName: GREEN_RED, home: { col: 17, row: 7 }, supporter_count: 4400 },
  { slug: "iraq", name: "Iraq", shortName: "IRQ", emojiFlag: "🇮🇶", flagColors: ["#CE1126", "#FFFFFF", "#000000"], flagPatternType: "horizontal-tricolor", primary_color: "#CE1126", secondary_color: "#000000", group: "I", qualified: true, primaryFanCollectionName: RED_WAVE, home: { col: 27, row: 5 }, supporter_count: 2700 },
  { slug: "norway", name: "Norway", shortName: "NOR", emojiFlag: "🇳🇴", flagColors: ["#BA0C2F", "#FFFFFF", "#00205B"], flagPatternType: "nordic-cross", primary_color: "#BA0C2F", secondary_color: "#00205B", group: "I", qualified: true, primaryFanCollectionName: RED_WAVE, home: { col: 22, row: 2 }, supporter_count: 4500 },

  // Group J
  { slug: "argentina", name: "Argentina", shortName: "ARG", emojiFlag: "🇦🇷", flagColors: ["#75AADB", "#FFFFFF", "#F6B40E"], flagPatternType: "sun", primary_color: "#75AADB", secondary_color: "#F6B40E", group: "J", qualified: true, primaryFanCollectionName: BLUE_WAVE, home: { col: 10, row: 14 }, supporter_count: 12600 },
  { slug: "algeria", name: "Algeria", shortName: "ALG", emojiFlag: "🇩🇿", flagColors: ["#006233", "#FFFFFF", "#D21034"], flagPatternType: "vertical-bicolor", primary_color: "#006233", secondary_color: "#D21034", group: "J", qualified: true, primaryFanCollectionName: GREEN_RED, home: { col: 20, row: 6 }, supporter_count: 4700 },
  { slug: "austria", name: "Austria", shortName: "AUT", emojiFlag: "🇦🇹", flagColors: ["#ED2939", "#FFFFFF"], flagPatternType: "triband-h", primary_color: "#ED2939", secondary_color: "#FFFFFF", group: "J", qualified: true, primaryFanCollectionName: RED_WAVE, home: { col: 23, row: 4 }, supporter_count: 3500 },
  { slug: "jordan", name: "Jordan", shortName: "JOR", emojiFlag: "🇯🇴", flagColors: ["#000000", "#FFFFFF", "#007A3D", "#CE1126"], flagPatternType: "triangle-hoist", primary_color: "#007A3D", secondary_color: "#CE1126", group: "J", qualified: true, primaryFanCollectionName: GREEN_RED, home: { col: 26, row: 5 }, supporter_count: 2100 },

  // Group K
  { slug: "portugal", name: "Portugal", shortName: "POR", emojiFlag: "🇵🇹", flagColors: ["#006600", "#FF0000"], flagPatternType: "vertical-bicolor", primary_color: "#006600", secondary_color: "#FF0000", group: "K", qualified: true, primaryFanCollectionName: GREEN_RED, home: { col: 18, row: 5 }, supporter_count: 9100 },
  { slug: "dr-congo", name: "DR Congo", shortName: "COD", emojiFlag: "🇨🇩", flagColors: ["#007FFF", "#F7D618", "#CE1021"], flagPatternType: "diagonal", primary_color: "#007FFF", secondary_color: "#F7D618", group: "K", qualified: true, primaryFanCollectionName: BLUE_WAVE, home: { col: 23, row: 9 }, supporter_count: 2300 },
  { slug: "uzbekistan", name: "Uzbekistan", shortName: "UZB", emojiFlag: "🇺🇿", flagColors: ["#0099B5", "#FFFFFF", "#1EB53A"], flagPatternType: "horizontal-tricolor", primary_color: "#0099B5", secondary_color: "#1EB53A", group: "K", qualified: true, primaryFanCollectionName: BLUE_WAVE, home: { col: 30, row: 4 }, supporter_count: 1900 },
  { slug: "colombia", name: "Colombia", shortName: "COL", emojiFlag: "🇨🇴", flagColors: ["#FCD116", "#003893", "#CE1126"], flagPatternType: "triband-h", primary_color: "#003893", secondary_color: "#FCD116", group: "K", qualified: true, primaryFanCollectionName: YELLOW_WAVE, home: { col: 9, row: 9 }, supporter_count: 5400 },

  // Group L
  { slug: "england", name: "England", shortName: "ENG", emojiFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", flagColors: ["#FFFFFF", "#CE1124"], flagPatternType: "st-george-cross", primary_color: "#CE1124", secondary_color: "#FFFFFF", group: "L", qualified: true, primaryFanCollectionName: RED_WAVE, home: { col: 19, row: 3 }, supporter_count: 10800 },
  { slug: "croatia", name: "Croatia", shortName: "CRO", emojiFlag: "🇭🇷", flagColors: ["#FF0000", "#FFFFFF", "#171796"], flagPatternType: "horizontal-tricolor", primary_color: "#FF0000", secondary_color: "#171796", group: "L", qualified: true, primaryFanCollectionName: RED_WAVE, home: { col: 24, row: 5 }, supporter_count: 5600 },
  { slug: "ghana", name: "Ghana", shortName: "GHA", emojiFlag: "🇬🇭", flagColors: ["#CE1126", "#FCD116", "#006B3F"], flagPatternType: "horizontal-tricolor", primary_color: "#006B3F", secondary_color: "#FCD116", group: "L", qualified: true, primaryFanCollectionName: YELLOW_WAVE, home: { col: 20, row: 8 }, supporter_count: 3800 },
  { slug: "panama", name: "Panama", shortName: "PAN", emojiFlag: "🇵🇦", flagColors: ["#FFFFFF", "#D21034", "#072357"], flagPatternType: "quadrants", primary_color: "#072357", secondary_color: "#D21034", group: "L", qualified: true, primaryFanCollectionName: BLUE_WAVE, home: { col: 9, row: 8 }, supporter_count: 1600 }
];

export const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"] as const;

const BY_SLUG: Record<string, Team> = (() => {
  const m: Record<string, Team> = {};
  for (const t of TEAMS) m[t.slug] = t;
  return m;
})();

export function getTeam(slug: string): Team | null {
  return BY_SLUG[slug] ?? null;
}

export function teamsInGroup(group: string): Team[] {
  return TEAMS.filter((t) => t.group === group);
}

// Group-mates are the natural tournament rivals (real, draw-accurate).
export function groupRivals(slug: string): string[] {
  const t = BY_SLUG[slug];
  if (!t) return [];
  return TEAMS.filter((x) => x.group === t.group && x.slug !== slug).map((x) => x.slug);
}

// Real flag assets live in public/flags/<code>.svg (flag-icons set, MIT).
// Codes are ISO 3166-1 alpha-2 (+ gb-eng / gb-sct for England / Scotland).
export const FLAG_CODE: Record<string, string> = {
  mexico: "mx", "south-africa": "za", "korea-republic": "kr", czechia: "cz",
  canada: "ca", "bosnia-herzegovina": "ba", qatar: "qa", switzerland: "ch",
  brazil: "br", morocco: "ma", haiti: "ht", scotland: "gb-sct",
  usa: "us", paraguay: "py", australia: "au", turkiye: "tr",
  germany: "de", curacao: "cw", "ivory-coast": "ci", ecuador: "ec",
  netherlands: "nl", japan: "jp", sweden: "se", tunisia: "tn",
  belgium: "be", egypt: "eg", iran: "ir", "new-zealand": "nz",
  spain: "es", "cape-verde": "cv", "saudi-arabia": "sa", uruguay: "uy",
  france: "fr", senegal: "sn", iraq: "iq", norway: "no",
  argentina: "ar", algeria: "dz", austria: "at", jordan: "jo",
  portugal: "pt", "dr-congo": "cd", uzbekistan: "uz", colombia: "co",
  england: "gb-eng", croatia: "hr", ghana: "gh", panama: "pa"
};

/** Public path to a team's real flag SVG, or null if none mapped. */
export function flagSrc(slug: string): string | null {
  const code = FLAG_CODE[slug];
  return code ? `/flags/${code}.svg` : null;
}

export const TOTAL_TEAMS = TEAMS.length;
