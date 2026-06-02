import Link from "next/link";
import { SectionHeader } from "./NationRanking";
import { PosterCarousel } from "./PosterCarousel";

export function FanCardPreview() {
  return (
    <section className="container-wide mt-24">
      <SectionHeader
        eyebrow="Free supporter poster"
        title="Get your free supporter poster"
        sub="Choose your nation, claim your 9:16 story poster, and share it to grow your flag."
      />

      <div className="mt-8 grid lg:grid-cols-2 gap-6 items-center">
        <div className="space-y-3 text-white/65 text-sm">
          <p>· No login. No payment. No catch.</p>
          <p>· Real flag identity, your nickname, supporter number, and live map share.</p>
          <p>· One tap to WhatsApp, X, Facebook, or Telegram.</p>
          <p>· Portrait 9:16 poster, built for stories and screenshots.</p>
          <div className="pt-4 flex flex-wrap gap-3">
            <Link href="/join" className="btn-primary text-base !py-3.5 !px-6">Create my free poster</Link>
            <Link href="/?map=1" className="btn-ghost">See the map</Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-8 bg-grid-fade pointer-events-none" />
          <div className="relative max-w-md mx-auto">
            <PosterCarousel />
          </div>
        </div>
      </div>
    </section>
  );
}
