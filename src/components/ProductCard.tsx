"use client";

import type { Product } from "@/lib/products";
import { isCheckoutConfigured } from "@/lib/products";
import { flagSrc } from "@/data/worldcup-2026-teams";

type Props = {
  product: Product;
  sourcePage: string;
  nationSlug?: string;
  supporterId?: string;
};

export function ProductCard({ product, sourcePage, nationSlug, supporterId }: Props) {
  const configured = isCheckoutConfigured(product);

  async function onClick() {
    try {
      await fetch("/api/shop-click", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          product_slug: product.slug,
          source_page: sourcePage,
          nation_slug: nationSlug ?? product.nation_slug ?? null,
          supporter_id: supporterId ?? null
        }),
        keepalive: true
      });
    } catch {
      // ignore — tracking should never block the user
    }
  }

  const inner = (
    <>
      <div
        className="relative aspect-[4/5] w-full overflow-hidden"
        style={{ background: `radial-gradient(120% 110% at 25% 0%, ${product.colors[0]}33, #070A12 80%)` }}
      >
        <svg viewBox="0 0 300 360" className="absolute inset-0 w-full h-full" role="img" aria-label={product.name}>
          <Mockup product={product} />
        </svg>
        {product.collection && (
          <div className="absolute top-3 left-3 chip max-w-[78%] truncate">{product.collection}</div>
        )}
        {configured ? (
          <div className="absolute bottom-3 right-3 text-xs text-white/90 chip">{product.price}</div>
        ) : (
          <div className="absolute bottom-3 right-3 text-[10px] uppercase tracking-widest chip text-amber-300">
            Coming soon
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="font-semibold group-hover:text-neon-cyan transition">{product.name}</div>
          <div className="text-xs text-white/45">{configured ? "→" : ""}</div>
        </div>
        <p className="mt-1 text-sm text-white/55">{product.tagline}</p>
        {!configured && (
          <p className="mt-1 text-[11px] text-white/35">{product.price} · checkout link not configured</p>
        )}
      </div>
    </>
  );

  if (!configured) {
    return (
      <div className="group relative block overflow-hidden rounded-3xl ring-soft glass opacity-95">{inner}</div>
    );
  }

  return (
    <a
      href={product.external_url}
      target="_blank"
      rel="noopener"
      onClick={onClick}
      className="group relative block overflow-hidden rounded-3xl ring-soft glass transition hover:-translate-y-0.5"
    >
      {inner}
    </a>
  );
}

function Mockup({ product }: { product: Product }) {
  switch (product.kind) {
    case "tee":
      return <Tee product={product} />;
    case "scarf":
      return <Scarf product={product} />;
    case "mug":
      return <Mug product={product} />;
    case "poster":
      return <Poster product={product} />;
    default:
      return <Stickers product={product} />;
  }
}

// Real flag patch (or FanMap monogram when a product isn't nation-themed).
function Crest({ slug, x, y, w, h }: { slug?: string; x: number; y: number; w: number; h: number }) {
  const src = slug ? flagSrc(slug) : null;
  if (src) {
    return (
      <g>
        <image href={src} x={x} y={y} width={w} height={h} preserveAspectRatio="xMidYMid slice" />
        <rect x={x} y={y} width={w} height={h} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" rx="2" />
      </g>
    );
  }
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill="#0A0C14" stroke="rgba(255,255,255,0.4)" />
      <text x={x + w / 2} y={y + h / 2} textAnchor="middle" dominantBaseline="central" fontWeight="800" fontSize={h * 0.5} fill="#5EEAD4" fontFamily="Sora, sans-serif">
        FM
      </text>
    </g>
  );
}

function Tee({ product }: { product: Product }) {
  const [c0, c1] = product.colors;
  return (
    <g>
      <defs>
        <linearGradient id={`tee-${product.slug}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={c0} />
          <stop offset="100%" stopColor={c1} stopOpacity="0.85" />
        </linearGradient>
      </defs>
      <path
        d="M78 92 L120 66 Q150 96 180 66 L222 92 L252 132 L214 156 L210 300 Q150 316 90 300 L86 156 L48 132 Z"
        fill={`url(#tee-${product.slug})`}
        stroke="rgba(0,0,0,0.25)"
        strokeWidth="2"
      />
      <path d="M120 66 Q150 96 180 66" fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="4" />
      <Crest slug={product.flagSlug} x={132} y={150} w={36} h={24} />
      <text x="150" y="205" textAnchor="middle" fill="rgba(255,255,255,0.92)" fontWeight="800" fontSize="22" fontFamily="Sora, sans-serif">
        SUPPORTER
      </text>
      <text x="150" y="226" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontWeight="600" fontSize="12" letterSpacing="3">
        FANMAP · 2026
      </text>
    </g>
  );
}

function Scarf({ product }: { product: Product }) {
  const [c0, c1] = product.colors;
  return (
    <g>
      <rect x="118" y="40" width="64" height="250" rx="8" fill={c0} stroke="rgba(0,0,0,0.25)" strokeWidth="2" />
      <rect x="118" y="40" width="64" height="34" fill={c1} opacity="0.9" />
      <rect x="118" y="256" width="64" height="34" fill={c1} opacity="0.9" />
      <Crest slug={product.flagSlug} x={130} y={92} w={40} h={27} />
      <Crest slug={product.flagSlug} x={130} y={212} w={40} h={27} />
      {[140, 160, 180].map((y, i) => (
        <text key={i} x="150" y={y} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontWeight="800" fontSize="13" letterSpacing="2" fontFamily="Sora, sans-serif">
          FANMAP
        </text>
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <rect key={`f${i}`} x={120 + i * 9} y={290} width="5" height="14" fill={c1} />
      ))}
    </g>
  );
}

function Mug({ product }: { product: Product }) {
  const [c0, c1] = product.colors;
  return (
    <g>
      <rect x="80" y="108" width="135" height="170" rx="16" fill="#11151F" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
      <rect x="80" y="150" width="135" height="46" fill={c0} />
      <rect x="80" y="150" width="135" height="10" fill={c1} />
      <path d="M215 150 q44 12 44 56 t-44 56" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="11" />
      <Crest slug={product.flagSlug} x={108} y={120} w={30} h={20} />
      <text x="147" y="225" textAnchor="middle" fill="rgba(255,255,255,0.9)" fontWeight="800" fontSize="18" fontFamily="Sora, sans-serif">
        MATCHDAY
      </text>
    </g>
  );
}

function Poster({ product }: { product: Product }) {
  const src = product.flagSlug ? flagSrc(product.flagSlug) : null;
  return (
    <g>
      <rect x="66" y="48" width="168" height="264" rx="10" fill="#0A0C14" stroke="rgba(255,255,255,0.18)" strokeWidth="2" />
      {src ? (
        <g>
          <image href={src} x={86} y={78} width={128} height={86} preserveAspectRatio="xMidYMid slice" />
          <rect x={86} y={78} width={128} height={86} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        </g>
      ) : (
        <Crest x={110} y={86} w={80} h={70} />
      )}
      <text x="150" y="206" textAnchor="middle" fill="#fff" fontWeight="900" fontSize="26" fontFamily="Sora, sans-serif">
        GROW THE
      </text>
      <text x="150" y="236" textAnchor="middle" fill="#fff" fontWeight="900" fontSize="26" fontFamily="Sora, sans-serif">
        MAP
      </text>
      <text x="150" y="284" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontWeight="600" fontSize="12" letterSpacing="3">
        FANMAP · 2026
      </text>
    </g>
  );
}

function Stickers({ product }: { product: Product }) {
  const slots: Array<[number, number]> = [
    [96, 96], [150, 96], [204, 96],
    [96, 156], [150, 156], [204, 156],
    [96, 216], [150, 216], [204, 216]
  ];
  const src = product.flagSlug ? flagSrc(product.flagSlug) : null;
  return (
    <g>
      {slots.map(([cx, cy], i) => {
        const showFlag = src && i % 2 === 0;
        return (
          <g key={i}>
            <rect x={cx - 22} y={cy - 16} width={44} height={32} rx={7} fill="#0A0C14" stroke="rgba(255,255,255,0.18)" />
            {showFlag ? (
              <image href={src!} x={cx - 19} y={cy - 13} width={38} height={26} preserveAspectRatio="xMidYMid slice" />
            ) : (
              <text x={cx} y={cy} textAnchor="middle" dominantBaseline="central" fontWeight="800" fontSize="15" fill="#5EEAD4" fontFamily="Sora, sans-serif">
                FM
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}
