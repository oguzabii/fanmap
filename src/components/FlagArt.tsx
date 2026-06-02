// Flag-inspired SVG art. Renders a recognizable national-flag motif for each
// team inside an arbitrary box, so territories and badges show REAL flag
// identity (crescent+star, crosses, diamonds, suns…) — not generic gradients.
//
// LEGAL: national flags / flag-inspired colors + motifs only. No federation
// crests, no national-team logos, no tournament/FIFA marks, no trophies/mascots.

import { getTeam, flagSrc, type Team } from "@/data/worldcup-2026-teams";

type ArtProps = {
  slug: string;
  x?: number;
  y?: number;
  w: number;
  h: number;
  rounded?: number;
};

// 5-point star path centered at (cx,cy).
function star(cx: number, cy: number, outer: number, inner: number, rotDeg = -90): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = ((rotDeg + i * 36) * Math.PI) / 180;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

export function FlagArt({ slug, x = 0, y = 0, w, h, rounded = 0 }: ArtProps) {
  const team = getTeam(slug);
  if (!team) return <rect x={x} y={y} width={w} height={h} rx={rounded} fill="#1A2138" />;

  const c = team.flagColors;
  const els = buildFlag(team, x, y, w, h, c);

  const clipId = `fa-${team.slug}-${Math.round(x)}-${Math.round(y)}-${Math.round(w)}x${Math.round(h)}`;
  if (rounded > 0) {
    return (
      <g>
        <defs>
          <clipPath id={clipId}>
            <rect x={x} y={y} width={w} height={h} rx={rounded} ry={rounded} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>{els}</g>
      </g>
    );
  }
  return <g>{els}</g>;
}

function buildFlag(team: Team, x: number, y: number, w: number, h: number, c: string[]) {
  const e: JSX.Element[] = [];
  const field = (fill: string) => <rect key="f" x={x} y={y} width={w} height={h} fill={fill} />;
  const mid = { cx: x + w / 2, cy: y + h / 2 };

  switch (team.flagPatternType) {
    case "vertical-tricolor": {
      const bw = w / 3;
      e.push(<rect key="a" x={x} y={y} width={bw} height={h} fill={c[0]} />);
      e.push(<rect key="b" x={x + bw} y={y} width={bw} height={h} fill={c[1]} />);
      e.push(<rect key="d" x={x + 2 * bw} y={y} width={w - 2 * bw} height={h} fill={c[2]} />);
      break;
    }
    case "horizontal-tricolor": {
      const bh = h / 3;
      e.push(<rect key="a" x={x} y={y} width={w} height={bh} fill={c[0]} />);
      e.push(<rect key="b" x={x} y={y + bh} width={w} height={bh} fill={c[1]} />);
      e.push(<rect key="d" x={x} y={y + 2 * bh} width={w} height={h - 2 * bh} fill={c[2]} />);
      break;
    }
    case "vertical-bicolor": {
      const split = team.slug === "portugal" ? w * 0.42 : w / 2;
      e.push(<rect key="a" x={x} y={y} width={split} height={h} fill={c[0]} />);
      e.push(<rect key="b" x={x + split} y={y} width={w - split} height={h} fill={c[1]} />);
      break;
    }
    case "horizontal-bicolor": {
      const bh = h / 2;
      e.push(<rect key="a" x={x} y={y} width={w} height={bh} fill={c[0]} />);
      e.push(<rect key="b" x={x} y={y + bh} width={w} height={h - bh} fill={c[1]} />);
      break;
    }
    case "bands-horizontal": {
      const n = c.length;
      for (let i = 0; i < n; i++) {
        e.push(<rect key={i} x={x} y={y + (h * i) / n} width={w} height={h / n + 0.5} fill={c[i]} />);
      }
      break;
    }
    case "triband-h": {
      if (c.length <= 2) {
        // red/white/red style (Spain, Austria)
        e.push(<rect key="a" x={x} y={y} width={w} height={h * 0.25} fill={c[0]} />);
        e.push(<rect key="b" x={x} y={y + h * 0.25} width={w} height={h * 0.5} fill={c[1]} />);
        e.push(<rect key="d" x={x} y={y + h * 0.75} width={w} height={h * 0.25} fill={c[0]} />);
      } else {
        // top-weighted (Colombia)
        e.push(<rect key="a" x={x} y={y} width={w} height={h * 0.5} fill={c[0]} />);
        e.push(<rect key="b" x={x} y={y + h * 0.5} width={w} height={h * 0.25} fill={c[1]} />);
        e.push(<rect key="d" x={x} y={y + h * 0.75} width={w} height={h * 0.25} fill={c[2]} />);
      }
      break;
    }
    case "swiss-cross": {
      e.push(field(c[0]));
      const t = Math.min(w, h) * 0.2;
      const len = Math.min(w, h) * 0.62;
      e.push(<rect key="h" x={mid.cx - len / 2} y={mid.cy - t / 2} width={len} height={t} fill={c[1]} rx={t * 0.12} />);
      e.push(<rect key="v" x={mid.cx - t / 2} y={mid.cy - len / 2} width={t} height={len} fill={c[1]} rx={t * 0.12} />);
      break;
    }
    case "st-george-cross": {
      e.push(field(c[0]));
      const t = h * 0.2;
      e.push(<rect key="h" x={x} y={mid.cy - t / 2} width={w} height={t} fill={c[1]} />);
      e.push(<rect key="v" x={mid.cx - t / 2} y={y} width={t} height={h} fill={c[1]} />);
      break;
    }
    case "nordic-cross": {
      e.push(field(c[0]));
      const t = h * 0.22;
      const vx = x + w * 0.36; // offset toward hoist
      const outer = c[1];
      const inner = c[2];
      e.push(<rect key="h" x={x} y={mid.cy - t / 2} width={w} height={t} fill={outer} />);
      e.push(<rect key="v" x={vx - t / 2} y={y} width={t} height={h} fill={outer} />);
      if (inner) {
        const ti = t * 0.45;
        e.push(<rect key="hi" x={x} y={mid.cy - ti / 2} width={w} height={ti} fill={inner} />);
        e.push(<rect key="vi" x={vx - ti / 2} y={y} width={ti} height={h} fill={inner} />);
      }
      break;
    }
    case "saltire": {
      e.push(field(c[0]));
      const sw = Math.min(w, h) * 0.16;
      e.push(
        <line key="d1" x1={x} y1={y} x2={x + w} y2={y + h} stroke={c[1]} strokeWidth={sw} />,
        <line key="d2" x1={x + w} y1={y} x2={x} y2={y + h} stroke={c[1]} strokeWidth={sw} />
      );
      break;
    }
    case "crescent-star": {
      e.push(field(c[0]));
      const r = Math.min(w, h) * 0.3;
      const ccx = x + w * 0.42;
      const ccy = mid.cy;
      // crescent = white disc minus offset field disc
      const cutId = `cr-${team.slug}-${Math.round(x)}-${Math.round(y)}-${Math.round(w)}x${Math.round(h)}`;
      e.push(
        <g key="cres">
          <defs>
            <mask id={cutId}>
              <rect x={x} y={y} width={w} height={h} fill="black" />
              <circle cx={ccx} cy={ccy} r={r} fill="white" />
              <circle cx={ccx + r * 0.38} cy={ccy} r={r * 0.82} fill="black" />
            </mask>
          </defs>
          <rect x={x} y={y} width={w} height={h} fill={c[1]} mask={`url(#${cutId})`} />
        </g>
      );
      e.push(<path key="st" d={star(x + w * 0.62, ccy, r * 0.5, r * 0.21, -90)} fill={c[1]} />);
      break;
    }
    case "pentagram": {
      e.push(field(c[0]));
      const r = Math.min(w, h) * 0.34;
      e.push(
        <path
          key="st"
          d={star(mid.cx, mid.cy, r, r * 0.42, -90)}
          fill="none"
          stroke={c[1]}
          strokeWidth={Math.min(w, h) * 0.05}
          strokeLinejoin="round"
        />
      );
      break;
    }
    case "diamond": {
      e.push(field(c[0]));
      const dx = w * 0.5;
      const dy = h * 0.5;
      e.push(
        <path
          key="rh"
          d={`M${x + w / 2} ${y + h * 0.12} L${x + w * 0.88} ${y + h / 2} L${x + w / 2} ${y + h * 0.88} L${x + w * 0.12} ${y + h / 2} Z`}
          fill={c[1]}
        />
      );
      e.push(<circle key="gl" cx={x + dx} cy={y + dy} r={Math.min(w, h) * 0.17} fill={c[2]} />);
      break;
    }
    case "sun": {
      // 3 horizontal bands c0/c1/c0 + sun disc center (Argentina); Uruguay reuses.
      const bh = h / 3;
      e.push(<rect key="a" x={x} y={y} width={w} height={bh} fill={c[0]} />);
      e.push(<rect key="b" x={x} y={y + bh} width={w} height={bh} fill={c[1]} />);
      e.push(<rect key="d" x={x} y={y + 2 * bh} width={w} height={h - 2 * bh} fill={c[0]} />);
      const sun = c[2] ?? "#F6B40E";
      e.push(<circle key="s" cx={mid.cx} cy={mid.cy} r={Math.min(w, h) * 0.14} fill={sun} />);
      break;
    }
    case "stripes-canton": {
      const stripes = 7;
      for (let i = 0; i < stripes; i++) {
        e.push(
          <rect key={i} x={x} y={y + (h * i) / stripes} width={w} height={h / stripes + 0.4} fill={i % 2 === 0 ? c[0] : c[1]} />
        );
      }
      const cw = w * 0.42;
      const ch = h * 0.54;
      e.push(<rect key="canton" x={x} y={y} width={cw} height={ch} fill={c[2]} />);
      // a couple of star motifs (not the official 50-star arrangement)
      e.push(
        <path key="cs1" d={star(x + cw * 0.34, y + ch * 0.36, Math.min(w, h) * 0.07, Math.min(w, h) * 0.03)} fill="#fff" />,
        <path key="cs2" d={star(x + cw * 0.66, y + ch * 0.64, Math.min(w, h) * 0.07, Math.min(w, h) * 0.03)} fill="#fff" />
      );
      break;
    }
    case "starfield": {
      e.push(field(c[0]));
      const sr = Math.min(w, h) * 0.07;
      const pts = [
        [0.62, 0.3],
        [0.78, 0.5],
        [0.6, 0.66],
        [0.84, 0.74],
        [0.7, 0.5]
      ];
      pts.forEach((p, i) =>
        e.push(<path key={`s${i}`} d={star(x + w * p[0], y + h * p[1], sr, sr * 0.42)} fill={c[1]} />)
      );
      break;
    }
    case "disc": {
      e.push(field(c[0]));
      e.push(<circle key="d" cx={mid.cx} cy={mid.cy} r={Math.min(w, h) * 0.28} fill={c[1]} />);
      break;
    }
    case "taegeuk": {
      e.push(field(c[0]));
      const r = Math.min(w, h) * 0.26;
      e.push(
        <path key="top" d={`M${mid.cx - r} ${mid.cy} A ${r} ${r} 0 0 1 ${mid.cx + r} ${mid.cy} Z`} fill={c[1]} />,
        <path key="bot" d={`M${mid.cx - r} ${mid.cy} A ${r} ${r} 0 0 0 ${mid.cx + r} ${mid.cy} Z`} fill={c[2]} />
      );
      break;
    }
    case "maple": {
      // red / white / red vertical, with a red leaf-ish motif on the white center
      e.push(<rect key="l" x={x} y={y} width={w * 0.25} height={h} fill={c[0]} />);
      e.push(<rect key="m" x={x + w * 0.25} y={y} width={w * 0.5} height={h} fill={c[1]} />);
      e.push(<rect key="r" x={x + w * 0.75} y={y} width={w * 0.25} height={h} fill={c[0]} />);
      e.push(<path key="leaf" d={star(mid.cx, mid.cy, Math.min(w, h) * 0.2, Math.min(w, h) * 0.09, -90)} fill={c[0]} />);
      break;
    }
    case "triangle-hoist": {
      const bands = c.slice(0, c.length - 1);
      const tri = c[c.length - 1];
      const n = Math.max(bands.length, 1);
      for (let i = 0; i < n; i++) {
        e.push(<rect key={i} x={x} y={y + (h * i) / n} width={w} height={h / n + 0.5} fill={bands[i] ?? c[0]} />);
      }
      e.push(<path key="tri" d={`M${x} ${y} L${x + w * 0.42} ${y + h / 2} L${x} ${y + h} Z`} fill={tri} />);
      break;
    }
    case "diagonal": {
      e.push(field(c[0]));
      const t = Math.min(w, h) * 0.34;
      e.push(
        <line key="b1" x1={x} y1={y + h} x2={x + w} y2={y} stroke={c[1]} strokeWidth={t} />,
        <line key="b2" x1={x} y1={y + h} x2={x + w} y2={y} stroke={c[2]} strokeWidth={t * 0.5} />
      );
      break;
    }
    case "quadrants": {
      e.push(<rect key="tl" x={x} y={y} width={w / 2} height={h / 2} fill={c[0]} />);
      e.push(<rect key="tr" x={x + w / 2} y={y} width={w / 2} height={h / 2} fill={c[1]} />);
      e.push(<rect key="bl" x={x} y={y + h / 2} width={w / 2} height={h / 2} fill={c[2]} />);
      e.push(<rect key="br" x={x + w / 2} y={y + h / 2} width={w / 2} height={h / 2} fill={c[0]} />);
      e.push(<path key="s1" d={star(x + w * 0.25, y + h * 0.25, Math.min(w, h) * 0.1, Math.min(w, h) * 0.045)} fill={c[1]} />);
      e.push(<path key="s2" d={star(x + w * 0.75, y + h * 0.75, Math.min(w, h) * 0.1, Math.min(w, h) * 0.045)} fill={c[2]} />);
      break;
    }
    case "solid":
    default: {
      e.push(field(c[0]));
      if (c[1]) e.push(<rect key="bar" x={x} y={mid.cy - h * 0.07} width={w} height={h * 0.14} fill={c[1]} opacity={0.85} />);
      break;
    }
  }
  return e;
}

// Emits one <pattern> per nation so a territory of many cells is drawn with a
// single motif definition (far lighter than a flag per cell). The pattern is
// aligned to the grid origin so each cell shows exactly one flag.
export function MapFlagDefs({
  slugs,
  cell,
  gap,
  pad,
  idPrefix
}: {
  slugs: string[];
  cell: number;
  gap: number;
  pad: number;
  idPrefix: string; // namespace so multiple maps on one page don't collide
}) {
  return (
    <defs>
      {slugs.map((slug) =>
        getTeam(slug) ? (
          <pattern
            key={slug}
            id={`flag-${idPrefix}-${slug}`}
            patternUnits="userSpaceOnUse"
            width={cell}
            height={cell}
            x={pad}
            y={pad}
          >
            <FlagArt slug={slug} x={0} y={0} w={cell - gap} h={cell - gap} />
          </pattern>
        ) : null
      )}
    </defs>
  );
}

// Standalone rounded flag badge — uses the REAL flag asset when available,
// falling back to the CSS-art flag only if a team has no mapped asset.
export function FlagBadge({
  slug,
  w = 30,
  h = 20,
  className,
  title
}: {
  slug: string;
  w?: number;
  h?: number;
  className?: string;
  title?: string;
}) {
  const team = getTeam(slug);
  const src = flagSrc(slug);
  const radius = Math.min(w, h) * 0.18;
  const label = title ?? (team ? `${team.name} flag` : "flag");

  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt={label}
        width={w}
        height={h}
        loading="lazy"
        className={className}
        style={{
          width: w,
          height: h,
          objectFit: "cover",
          borderRadius: radius,
          display: "block",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18)"
        }}
      />
    );
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className={className} role="img" aria-label={label} style={{ display: "block" }}>
      <FlagArt slug={slug} w={w} h={h} rounded={radius} />
      <rect x={0.5} y={0.5} width={w - 1} height={h - 1} rx={radius} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth={1} />
    </svg>
  );
}
