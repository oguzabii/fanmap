// Independent fan products only. Real flags + FanMap branding — NO federation
// crests, NO official team/tournament logos, NO official jersey copies.

import { getTeam } from "@/data/worldcup-2026-teams";

export type ProductKind = "tee" | "scarf" | "sticker" | "mug" | "poster";

export type Product = {
  slug: string;
  name: string;
  tagline: string;
  price: string;
  kind: ProductKind;
  collection?: string;
  nation_slug?: string;
  /** Render this nation's real flag on the mockup (optional). */
  flagSlug?: string;
  colors: [string, string];
  /** Empty string => checkout link not configured (shown as "Coming soon"). */
  external_url: string;
};

// Real checkout base comes from env; until configured, links are intentionally
// empty so the UI honestly shows "Coming soon" (no fake buying).
const CHECKOUT_BASE = (process.env.NEXT_PUBLIC_SHOP_URL || "").replace(/\/$/, "");
const link = (suffix: string) => (CHECKOUT_BASE ? `${CHECKOUT_BASE}${suffix}` : "");

export function isCheckoutConfigured(p: Product): boolean {
  return Boolean(p.external_url);
}

// The four featured nation supporter collections (storefront sections).
export const SHOP_COLLECTIONS = ["turkiye", "switzerland", "portugal", "brazil"] as const;

// Featured catalog — nation supporter tees + universal gear.
export const PRODUCTS: Product[] = [
  {
    slug: "turkiye-supporter-tee",
    name: "Türkiye Supporter Tee",
    tagline: "For the loudest red corner in the stadium.",
    price: "CHF 29",
    kind: "tee",
    collection: "Türkiye Supporter Collection",
    nation_slug: "turkiye",
    flagSlug: "turkiye",
    colors: ["#E30A17", "#FFFFFF"],
    external_url: link("/turkiye-tee")
  },
  {
    slug: "switzerland-supporter-tee",
    name: "Switzerland Supporter Tee",
    tagline: "Mountain energy. Matchday volume.",
    price: "CHF 29",
    kind: "tee",
    collection: "Switzerland Supporter Collection",
    nation_slug: "switzerland",
    flagSlug: "switzerland",
    colors: ["#D52B1E", "#FFFFFF"],
    external_url: link("/switzerland-tee")
  },
  {
    slug: "portugal-supporter-tee",
    name: "Portugal Supporter Tee",
    tagline: "Old colors. New territory.",
    price: "CHF 29",
    kind: "tee",
    collection: "Portugal Supporter Collection",
    nation_slug: "portugal",
    flagSlug: "portugal",
    colors: ["#006600", "#FF0000"],
    external_url: link("/portugal-tee")
  },
  {
    slug: "brazil-supporter-tee",
    name: "Brazil Supporter Tee",
    tagline: "Paint your section gold.",
    price: "CHF 29",
    kind: "tee",
    collection: "Brazil Supporter Collection",
    nation_slug: "brazil",
    flagSlug: "brazil",
    colors: ["#009C3B", "#FFDF00"],
    external_url: link("/brazil-tee")
  },
  {
    slug: "fanmap-supporter-scarf",
    name: "FanMap Supporter Scarf",
    tagline: "Hold it up at kickoff. Knit, two-sided.",
    price: "CHF 24",
    kind: "scarf",
    colors: ["#5EEAD4", "#A78BFA"],
    external_url: link("/supporter-scarf")
  },
  {
    slug: "fanmap-sticker-pack",
    name: "FanMap Sticker Pack",
    tagline: "20 flag stickers for laptops, bottles, away cars.",
    price: "CHF 9",
    kind: "sticker",
    colors: ["#5EEAD4", "#A78BFA"],
    external_url: link("/sticker-pack")
  },
  {
    slug: "matchday-mug",
    name: "Matchday Mug",
    tagline: "Hot coffee, louder kickoffs.",
    price: "CHF 19",
    kind: "mug",
    colors: ["#F472B6", "#FBBF24"],
    external_url: link("/matchday-mug")
  },
  {
    slug: "fanmap-wall-poster",
    name: "FanMap Wall Poster",
    tagline: "Your nation's takeover, framed.",
    price: "CHF 18",
    kind: "poster",
    colors: ["#A78BFA", "#5EEAD4"],
    external_url: link("/wall-poster")
  }
];

// Nation-themed gear (real flag) shown on nation/card pages.
export function productsForNation(slug: string): Product[] {
  const t = getTeam(slug);
  if (!t) return PRODUCTS.filter((p) => p.kind !== "tee").slice(0, 4);
  const colors: [string, string] = [t.primary_color, t.secondary_color];
  const collection = `${t.name} Supporter Collection`;

  return [
    {
      slug: `${slug}-supporter-tee`,
      name: `${t.name} Supporter Tee`,
      tagline: "Wear the flag you just joined.",
      price: "CHF 29",
      kind: "tee",
      collection,
      nation_slug: slug,
      flagSlug: slug,
      colors,
      external_url: link(`/${slug}-tee`)
    },
    {
      slug: `${slug}-supporter-scarf`,
      name: `${t.name} Supporter Scarf`,
      tagline: "Two-sided knit. Hold it high at kickoff.",
      price: "CHF 24",
      kind: "scarf",
      collection,
      nation_slug: slug,
      flagSlug: slug,
      colors,
      external_url: link(`/${slug}-scarf`)
    },
    {
      slug: `${slug}-wall-poster`,
      name: `${t.name} Takeover Poster`,
      tagline: "Your nation, painted across the map.",
      price: "CHF 18",
      kind: "poster",
      collection,
      nation_slug: slug,
      flagSlug: slug,
      colors,
      external_url: link(`/${slug}-poster`)
    },
    {
      slug: "fanmap-sticker-pack",
      name: "FanMap Sticker Pack",
      tagline: "20 flag stickers for laptops, bottles, away cars.",
      price: "CHF 9",
      kind: "sticker",
      flagSlug: slug,
      colors: ["#5EEAD4", "#A78BFA"],
      external_url: link("/sticker-pack")
    },
    {
      slug: "matchday-mug",
      name: "Matchday Mug",
      tagline: "Hot coffee, louder kickoffs.",
      price: "CHF 19",
      kind: "mug",
      flagSlug: slug,
      colors,
      external_url: link("/matchday-mug")
    }
  ];
}

export const SHOP_DISCLAIMER =
  "Independent supporter products. No official team or tournament affiliation.";
