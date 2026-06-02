import { formatNumber } from "@/lib/utils";

type CityRow = { city: string; count: number };

type Props = {
  rows: CityRow[];
  primaryColor: string;
  secondaryColor: string;
};

export function CityLeaderboard({ rows, primaryColor, secondaryColor }: Props) {
  const top = rows[0]?.count ?? 1;

  return (
    <div className="glass rounded-3xl ring-soft p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="chip">City leaderboard</div>
        <div className="text-xs text-white/45">Where the energy is loudest</div>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-white/55">
          Be the first city to put your colors on the map. Invite friends — your city joins
          the leaderboard the moment fans add their hometown.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.slice(0, 10).map((r, i) => (
            <li key={r.city} className="flex items-center gap-3">
              <div className="text-xs tabular-nums w-6 text-white/45 text-right">#{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <div className="font-medium truncate">{r.city}</div>
                  <div className="text-xs text-white/55 tabular-nums">{formatNumber(r.count)}</div>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(r.count / Math.max(top, 1)) * 100}%`,
                      background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`
                    }}
                  />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
