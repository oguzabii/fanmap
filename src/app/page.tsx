import { fetchNations } from "@/lib/stats";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getHostBattleState, getArchive } from "@/lib/host-battle";
import { MapHero } from "@/components/MapHero";
import { LiveTicker } from "@/components/LiveTicker";
import { NationRanking } from "@/components/NationRanking";
import { HostBattleSection } from "@/components/HostBattleSection";
import { FanCardPreview } from "@/components/FanCardPreview";
import { ShopPreview } from "@/components/ShopPreview";

export const revalidate = 30;

export default async function HomePage() {
  const nations = await fetchNations();
  const hostState = await getHostBattleState(nations);
  const archive = await getArchive(nations, 1);

  return (
    <>
      {/* Map-first: the live global territory race fills the first screen. */}
      <MapHero nations={nations} preview={!isSupabaseConfigured} />
      <LiveTicker nations={nations} live={isSupabaseConfigured} />
      <NationRanking nations={nations} live={isSupabaseConfigured} />
      {/* Daily Host Region Battle — secondary to the Global FanMap. */}
      <HostBattleSection state={hostState} yesterday={archive[0] ?? null} />
      <FanCardPreview />
      <ShopPreview />
    </>
  );
}
