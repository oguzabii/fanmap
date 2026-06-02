import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-32 border-t border-line/60">
      <div className="container-wide py-12 grid gap-10 md:grid-cols-4">
        <div>
          <div className="h-display text-xl font-bold">
            Fan<span className="text-neon-cyan">Map</span>
          </div>
          <p className="mt-3 text-sm text-white/55 max-w-xs">
            The independent fan map of the 2026 football summer. Pick your nation, get a free
            supporter card, paint the world.
          </p>
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-white/40">Explore</div>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li><Link href="/#fanmap" className="hover:text-white">Live FanMap</Link></li>
            <li><Link href="/#ranking" className="hover:text-white">Ranking</Link></li>
            <li><Link href="/shop" className="hover:text-white">Fan shop</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-white/40">Join</div>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            <li><Link href="/join" className="hover:text-white">Choose your nation</Link></li>
            <li><Link href="/#fanmap" className="hover:text-white">Live FanMap</Link></li>
            <li><Link href="/battle" className="hover:text-white">Host Battle</Link></li>
            <li><Link href="/join" className="hover:text-white">Get free poster</Link></li>
            <li><Link href="/shop" className="hover:text-white">Fan shop</Link></li>
          </ul>
        </div>

        <div>
          <div className="text-xs uppercase tracking-widest text-white/40">Independent</div>
          <p className="mt-3 text-sm text-white/55">
            FanMap is an independent fan project and is not affiliated with FIFA, any tournament
            organizer, football federation, or national team.
          </p>
        </div>
      </div>

      <div className="border-t border-line/60">
        <div className="container-wide flex flex-col sm:flex-row items-center justify-between gap-3 py-6 text-xs text-white/40">
          <div>© {new Date().getFullYear()} FanMap. Independent fan project.</div>
          <div className="flex items-center gap-4">
            <span>Built for the global fan race</span>
            <span className="hidden sm:inline">·</span>
            <span>Made with ❤︎ for matchday energy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
