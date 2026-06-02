// Builds the viral supporter POSTER as a self-contained SVG string.
// The flag is embedded as a data URI (flagHref) so the SVG works as an <img>
// source and rasterizes cleanly to PNG via canvas (no external refs).

export type PosterOpts = {
  flagHref: string | null; // data: URI of the nation flag (embedded)
  nationName: string;
  nickname: string;
  supporterNumber: number;
  rank: number;
  mapShare: number; // 0..1
  nextLine?: string | null; // e.g. "NEXT: Türkiye vs USA · 26 Jun"
  motto?: string; // localized rallying line, e.g. "EVERY FAN EXPANDS THE FLAG"
  hostActive?: boolean;
  siteHost: string;
  fallbackColor?: string;
  variant?: "story" | "square";
};

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function group(n: number): string {
  return n.toLocaleString("en-US");
}

export function buildPosterSvg(opts: PosterOpts): string {
  const variant = opts.variant ?? "story";
  const w = 1080;
  const h = variant === "story" ? 1920 : 1080;
  const nation = esc(opts.nationName).toUpperCase();
  const nick = esc(opts.nickname || "Supporter");
  const nationSize = nation.length > 12 ? 84 : nation.length > 9 ? 104 : 124;

  // Text block anchored to the lower portion.
  const baseY = variant === "story" ? 1180 : 560;
  const FF = "Inter, 'Helvetica Neue', Arial, sans-serif";

  const flag = opts.flagHref
    ? `<image href="${opts.flagHref}" x="0" y="0" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`
    : `<rect x="0" y="0" width="${w}" height="${h}" fill="${opts.fallbackColor || "#0A0C14"}"/>`;

  const nextBlock = opts.nextLine
    ? `<text x="90" y="${baseY + 372}" font-family="${FF}" font-size="34" font-weight="700" fill="#fff" opacity="0.92">${esc(
        opts.nextLine
      ).toUpperCase()}</text>`
    : "";

  const hostBlock = opts.hostActive
    ? `<g><rect x="90" y="${baseY + 404}" width="430" height="56" rx="28" fill="#F472B6"/><text x="305" y="${
        baseY + 441
      }" text-anchor="middle" font-family="${FF}" font-size="28" font-weight="800" fill="#0A0C14">TODAY: HOST REGION BATTLE</text></g>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="ov" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#05060A" stop-opacity="0.62"/>
      <stop offset="34%" stop-color="#05060A" stop-opacity="0.18"/>
      <stop offset="62%" stop-color="#05060A" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="#05060A" stop-opacity="0.94"/>
    </linearGradient>
  </defs>
  ${flag}
  <rect x="0" y="0" width="${w}" height="${h}" fill="url(#ov)"/>
  <text x="90" y="120" font-family="${FF}" font-size="46" font-weight="800" fill="#fff">FanMap</text>
  <text x="90" y="162" font-family="${FF}" font-size="26" font-weight="600" fill="#fff" opacity="0.7" letter-spacing="4">2026 FAN RACE</text>

  <text x="90" y="${baseY}" font-family="${FF}" font-size="40" font-weight="700" fill="#fff" opacity="0.85" letter-spacing="3">I JOINED TEAM</text>
  <text x="86" y="${baseY + nationSize}" font-family="${FF}" font-size="${nationSize}" font-weight="900" fill="#fff">${nation}</text>
  <text x="90" y="${baseY + nationSize + 64}" font-family="${FF}" font-size="44" font-weight="600" fill="#fff" opacity="0.92">as ${nick}</text>

  <g>
    <rect x="90" y="${baseY + nationSize + 104}" width="${Math.min(620, 360 + String(group(opts.supporterNumber)).length * 34)}" height="74" rx="37" fill="#ffffff"/>
    <text x="128" y="${baseY + nationSize + 153}" font-family="${FF}" font-size="40" font-weight="900" fill="#0A0C14">SUPPORTER #${group(
    opts.supporterNumber
  )}</text>
  </g>

  <text x="90" y="${baseY + nationSize + 222}" font-family="${FF}" font-size="34" font-weight="700" fill="#fff" opacity="0.9">GLOBAL RANK #${opts.rank}    ·    MAP SHARE ${(
    opts.mapShare * 100
  ).toFixed(2)}%</text>

  <text x="90" y="${baseY + nationSize + 286}" font-family="${FF}" font-size="38" font-weight="900" fill="#5EEAD4">${esc(
    opts.motto || "EVERY FAN EXPANDS THE FLAG"
  )}</text>

  ${nextBlock}
  ${hostBlock}

  <text x="90" y="${h - 150}" font-family="${FF}" font-size="58" font-weight="900" fill="#fff">GROW THE FANMAP</text>
  <text x="90" y="${h - 104}" font-family="${FF}" font-size="34" font-weight="700" fill="#5EEAD4">Share to expand the flag</text>
  <text x="90" y="${h - 58}" font-family="${FF}" font-size="30" font-weight="600" fill="#fff" opacity="0.7">${esc(
    opts.siteHost
  )}</text>
</svg>`;
}

export function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
