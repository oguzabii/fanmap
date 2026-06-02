import { Suspense } from "react";
import { fetchNations } from "@/lib/stats";
import { JoinFlow } from "@/components/JoinFlow";

export const dynamic = "force-dynamic";

export default async function JoinPage() {
  const nations = await fetchNations();
  return (
    <section className="container-wide pt-12 pb-16">
      <div className="max-w-2xl">
        <div className="chip">Join the race</div>
        <h1 className="mt-3 h-display text-4xl sm:text-5xl font-bold tracking-tight">
          Choose your nation.
        </h1>
        <p className="mt-3 text-white/65">
          Pick the colors you'll back. We'll generate your free supporter card the moment you join —
          ready to share on every social.
        </p>
      </div>

      <div className="mt-10">
        <Suspense
          fallback={
            <div className="text-white/55 text-sm">Loading…</div>
          }
        >
          <JoinFlow nations={nations} />
        </Suspense>
      </div>
    </section>
  );
}
