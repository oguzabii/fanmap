import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "./ProductCard";
import { SectionHeader } from "./NationRanking";

export function ShopPreview() {
  const featured = PRODUCTS.slice(0, 4);
  return (
    <section className="container-wide mt-24">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <SectionHeader
          eyebrow="Matchday fan collection"
          title="Wear your nation. Off the screen."
          sub="Original, flag-inspired supporter gear. Independent products — no official team or tournament affiliation."
        />
        <Link href="/shop" className="btn-ghost hidden sm:inline-flex">View full shop →</Link>
      </div>

      <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {featured.map((p) => (
          <ProductCard key={p.slug} product={p} sourcePage="home" />
        ))}
      </div>

      <div className="mt-6 text-center sm:hidden">
        <Link href="/shop" className="btn-ghost">View full shop →</Link>
      </div>
    </section>
  );
}
