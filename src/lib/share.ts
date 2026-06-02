export type ShareLocale = "en" | "tr" | "de";

export function localeForNation(slug: string): ShareLocale {
  if (slug === "turkiye") return "tr";
  if (slug === "switzerland") return "de";
  return "en";
}

export function shareText(nationName: string, link: string, locale: ShareLocale): string {
  if (locale === "tr") {
    return `Ben Team Türkiye'ye katıldım 🇹🇷
Her taraftar bayrağını haritada büyütür.
Sen de katıl, Türkiye'yi FanMap'te büyüt: ${link}`;
  }
  if (locale === "de") {
    return `Ich bin Team Schweiz auf FanMap beigetreten 🇨🇭
Jeder Supporter vergrössert die Flagge auf der Karte.
Mach mit und vergrössere die Schweiz: ${link}`;
  }
  return `I joined Team ${nationName} on FanMap 🌍
Every supporter expands the flag.
Join now and help us take over the map: ${link}`;
}

export function siteUrl(path = ""): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    "https://fanmap.example";
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
