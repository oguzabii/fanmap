import Link from "next/link";
import { PRODUCTS, SHOP_DISCLAIMER, isCheckoutConfigured } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";

export const revalidate = 300;

export default function ShopPage() {
  const tees = PRODUCTS.filter((p) => p.kind === "tee");
  const others = PRODUCTS.filter((p) => p.kind !== "tee");
  const anyConfigured = PRODUCTS.some(isCheckoutConfigured);

  return (
    <section className="container-wide pt-12 pb-20">
      <div className="max-w-2xl">
        <div className="chip">Independent fan shop</div>
        <h1 className="mt-3 h-display text-4xl sm:text-5xl font-bold tracking-tight">
          Supporter collections.
        </h1>
        <p className="mt-3 text-white/65">
          Original, flag-inspired supporter gear. {SHOP_DISCLAIMER}
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-xl glass px-3 py-2 text-xs text-white/60">
          <span className="size-1.5 rounded-full bg-neon-cyan" />
          Your supporter jersey is always free — the shop is just for fans who want the real thing.
          <Link href="/join" className="text-neon-cyan hover:text-white">
            Get the free card →
          </Link>
        </div>
      </div>

      {!anyConfigured && (
        <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/5 px-5 py-3 text-sm text-amber-200">
          Checkout isn't connected yet — products show as “Coming soon”. Set{" "}
          <code className="text-white/80">NEXT_PUBLIC_SHOP_URL</code> to enable buying.
        </div>
      )}

      <h2 className="mt-12 h-display text-xl font-semibold text-white/80">Supporter collections</h2>
      <p className="text-sm text-white/45 mt-1">Türkiye · Switzerland · Portugal · Brazil.</p>
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tees.map((p) => (
          <ProductCard key={p.slug} product={p} sourcePage="shop" />
        ))}
      </div>

      <h2 className="mt-16 h-display text-xl font-semibold text-white/80">Matchday gear</h2>
      <p className="text-sm text-white/45 mt-1">Scarves, sticker packs, mugs, and wall posters.</p>
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {others.map((p) => (
          <ProductCard key={p.slug} product={p} sourcePage="shop" />
        ))}
      </div>

      <div className="mt-14 glass rounded-3xl ring-soft p-6 sm:p-8">
        <div className="chip">Shipping & independence</div>
        <p className="mt-3 text-sm text-white/65 max-w-2xl">
          FanMap is an independent fan project. {SHOP_DISCLAIMER} Designs are flag-inspired originals —
          no FIFA marks, no official tournament logos, no federation crests, no national-team logos,
          and no replica jerseys.
        </p>
      </div>
    </section>
  );
}
