import type { NationWithDelta } from "@/lib/stats";
import { SectionHeader } from "./NationRanking";
import { RivalBattleCard } from "./RivalBattleCard";

type Props = { nations: NationWithDelta[] };

const PAIRS: Array<[string, string, string]> = [
  ["turkiye", "switzerland", "Türkiye vs Switzerland"],
  ["brazil", "argentina", "Brazil vs Argentina"],
  ["germany", "france", "Germany vs France"],
  ["albania", "kosovo", "Albania vs Kosovo"]
];

export function RivalBattles({ nations }: Props) {
  const map: Record<string, NationWithDelta> = {};
  for (const n of nations) map[n.slug] = n;

  const battles = PAIRS.map(([a, b, label]) => {
    const A = map[a];
    const B = map[b];
    if (!A || !B) return null;
    return { a: A, b: B, label };
  }).filter(Boolean) as { a: NationWithDelta; b: NationWithDelta; label: string }[];

  return (
    <section className="container-wide mt-24">
      <SectionHeader
        eyebrow="Rival battles"
        title="Old rivalries. New territory."
        sub="Some nations don't just play each other — they paint over each other. Pick a side."
      />

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        {battles.map((b, i) => (
          <RivalBattleCard key={i} a={b.a} b={b.b} label={b.label} emphasized={i === 0} />
        ))}
      </div>
    </section>
  );
}
