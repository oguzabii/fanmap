import Link from "next/link";
import { MapLink } from "./MapLink";
import { ChooseNationLink } from "./ChooseNationLink";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 backdrop-blur-md bg-ink-950/60">
      <div className="container-wide flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <LogoMark />
          <span className="h-display text-lg font-bold tracking-tight">
            Fan<span className="text-neon-cyan">Map</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm text-white/70">
          <MapLink className="hover:text-white transition">Global map</MapLink>
          <Link href="/battle" className="hover:text-white transition">Host Battle</Link>
          <Link href="/#ranking" className="hover:text-white transition">Ranking</Link>
          <Link href="/shop" className="hover:text-white transition">Shop</Link>
        </nav>

        <div className="flex items-center gap-2">
          <MapLink className="hidden sm:inline-flex btn-ghost !py-2 !px-4 text-xs">
            View map
          </MapLink>
          <ChooseNationLink className="btn-primary !py-2 !px-4 text-xs">
            Choose your nation
          </ChooseNationLink>
        </div>
      </div>
    </header>
  );
}

function LogoMark() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden="true">
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5EEAD4" />
          <stop offset="55%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#F472B6" />
        </linearGradient>
      </defs>
      <polygon
        points="16,2 29,9 29,23 16,30 3,23 3,9"
        fill="url(#lg)"
        opacity="0.95"
      />
      <polygon
        points="16,7 24.5,11.5 24.5,20.5 16,25 7.5,20.5 7.5,11.5"
        fill="#0A0C14"
      />
      <circle cx="16" cy="16" r="2.6" fill="url(#lg)" />
    </svg>
  );
}
