import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchNations } from "@/lib/stats";
import { getPublicClient } from "@/lib/supabase";
import { getHostBattleState, isEligibleToday } from "@/lib/host-battle";
import { nextFixtureForTeam } from "@/data/worldcup-2026-fixtures";
import { getTeam } from "@/data/worldcup-2026-teams";
import { todayISO } from "@/lib/host-battle";
import { ShareCenter } from "@/components/ShareCenter";
import { BattleVote } from "@/components/BattleVote";
import { RememberSupporter } from "@/components/RememberSupporter";
import { ProductCard } from "@/components/ProductCard";
import { productsForNation } from "@/lib/products";
import { shareText, localeForNation, siteUrl } from "@/lib/share";

type Params = { params: { supporterId: string }; searchParams?: { nation?: string } };

export const dynamic = "force-dynamic";

type SupporterView = {
  id: string;
  nickname: string;
  city: string | null;
  referral_code: string;
  supporter_number: number;
  nation_slug: string;
};

async function fetchSupporter(id: string, fallbackNation?: string): Promise<SupporterView | null> {
  const client = getPublicClient();
  if (!client) {
    // No DB — show a deterministic preview so the page is still beautiful.
    return {
      id,
      nickname: "Supporter",
      city: null,
      referral_code: "FANMAP26",
      supporter_number: 1,
      nation_slug: getTeam(fallbackNation ?? "")?.slug ?? "turkiye"
    };
  }
  const { data, error } = await client
    .from("supporters")
    .select("id,nickname,city,referral_code,supporter_number,nation_id,nations(slug)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  const slug = ((data as any).nations?.slug as string) ?? null;
  if (!slug) return null;
  return {
    id: data.id as string,
    nickname: data.nickname as string,
    city: (data.city as string | null) ?? null,
    referral_code: data.referral_code as string,
    supporter_number: data.supporter_number as number,
    nation_slug: slug
  };
}

function shortDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC"
  });
}

export default async function CardPage({ params, searchParams }: Params) {
  const supporter = await fetchSupporter(params.supporterId, searchParams?.nation);
  if (!supporter) return notFound();

  const nations = await fetchNations();
  const nation = nations.find((n) => n.slug === supporter.nation_slug);
  if (!nation) return notFound();

  const sorted = [...nations].sort((a, b) => b.supporter_count - a.supporter_count);
  const rank = sorted.findIndex((n) => n.slug === nation.slug) + 1;
  const total = sorted.reduce((s, n) => s + n.supporter_count, 0);
  const share = nation.supporter_count / Math.max(total, 1);

  const inviteLink = siteUrl(`/join?ref=${supporter.referral_code}`);
  const text = shareText(nation.name, inviteLink, localeForNation(nation.slug));
  const products = productsForNation(nation.slug);

  const hostState = await getHostBattleState(nations);
  const eligibleToday = isEligibleToday(hostState, nation.slug);
  const hostActive = eligibleToday && hostState.hasRealFixtures;

  const nextMatch = nextFixtureForTeam(nation.slug, todayISO());
  const nextOpp = nextMatch
    ? getTeam(nextMatch.teamA === nation.slug ? nextMatch.teamB : nextMatch.teamA)
    : null;
  const nextLine =
    nextMatch && nextOpp ? `Next: ${nation.name} vs ${nextOpp.name} · ${shortDate(nextMatch.matchDate)}` : null;

  return (
    <section className="container-wide pt-10 pb-20">
      <RememberSupporter id={supporter.id} />
      <div className="max-w-2xl">
        <div className="chip">
          <span className="size-1.5 rounded-full bg-neon-cyan animate-pulseGlow" />
          You're in. Team {nation.name} just grew on the Global FanMap — permanently.
        </div>
        <h1 className="mt-3 h-display text-4xl sm:text-5xl font-bold tracking-tight">
          Your free supporter poster.
        </h1>
        <p className="mt-3 text-white/65">
          A story-ready poster with {nation.name}'s real flag. Share it — every friend who joins
          through your link expands {nation.name} on the map.
        </p>
      </div>

      <div className="mt-8">
        <ShareCenter
          slug={nation.slug}
          nationName={nation.name}
          nickname={supporter.nickname}
          supporterNumber={supporter.supporter_number}
          rank={rank}
          mapShare={share}
          referralCode={supporter.referral_code}
          inviteLink={inviteLink}
          shareText={text}
          nextLine={nextLine}
          hostActive={hostActive}
          supporterId={supporter.id}
        />
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-4">
        {hostActive ? (
          <BattleVote state={hostState} presetSlug={nation.slug} />
        ) : (
          <Link
            href="/battle"
            className="glass rounded-3xl ring-soft p-5 sm:p-6 flex items-center justify-between gap-3 hover:bg-white/5 transition"
          >
            <div>
              <div className="chip">Daily Host Region Battle</div>
              <p className="mt-2 text-sm text-white/60">
                {nation.name} isn't playing today — open the battle to see today's matchday.
              </p>
            </div>
            <span className="text-xs text-neon-cyan shrink-0">Today's battle →</span>
          </Link>
        )}

        <div className="glass rounded-3xl ring-soft p-5 sm:p-6">
          <div className="chip">What's next</div>
          <ul className="mt-3 space-y-2 text-sm text-white/65">
            <li>· {nation.name} is currently #{rank} globally — share to climb.</li>
            <li>· Send your invite link to two friends. That's permanent territory.</li>
            {nextLine && <li>· {nextLine}.</li>}
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/nation/${nation.slug}`} className="btn-primary !py-2 !px-4 text-xs">
              Open Team {nation.name}
            </Link>
            <Link href="/#fanmap" className="btn-ghost !py-2 !px-4 text-xs">View the map</Link>
          </div>
        </div>
      </div>

      {products.length > 0 && (
        <section className="mt-16">
          <div className="flex items-end justify-between flex-wrap gap-3">
            <div>
              <div className="chip">{nation.name} Supporter Collection</div>
              <h2 className="mt-3 h-display text-2xl font-bold">After you share — wear the flag.</h2>
            </div>
            <Link href="/shop" className="btn-ghost">Full shop →</Link>
          </div>

          <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard
                key={p.slug}
                product={p}
                sourcePage={`card/${supporter.id}`}
                nationSlug={nation.slug}
                supporterId={supporter.id}
              />
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
