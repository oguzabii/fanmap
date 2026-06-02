import type { HostBattleState, HostMatch } from "@/lib/host-battle";
import { formatHumanDate } from "@/lib/host-battle";
import { FlagBadge } from "./FlagArt";

type Props = {
  state: HostBattleState;
  className?: string;
};

function MatchRow({ m }: { m: HostMatch }) {
  return (
    <li className="rounded-2xl bg-white/[0.03] ring-1 ring-line/60 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] uppercase tracking-widest text-white/40">
          Group {m.group} · {m.hostCountry}
        </span>
        <span className="text-[10px] uppercase tracking-widest text-white/45">{m.kickoff ?? "TBD"}</span>
      </div>
      <div className="mt-2 flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FlagBadge slug={m.teamA.slug} w={26} h={18} />
          <span className="font-semibold truncate">{m.teamA.name}</span>
        </div>
        <span className="text-xs text-white/40 font-semibold shrink-0">vs</span>
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end text-right">
          <span className="font-semibold truncate">{m.teamB.name}</span>
          <FlagBadge slug={m.teamB.slug} w={26} h={18} />
        </div>
      </div>
      <div className="mt-2 text-xs text-white/45">
        {m.hostCity} · {m.venue}
      </div>
    </li>
  );
}

// Matchday-first panel: today's active matches, or the next matchday preview.
export function TodaysMatches({ state, className }: Props) {
  const live = state.hasRealFixtures;
  const next = state.nextMatches;
  const nextFirst = next[0];

  return (
    <div className={`glass rounded-3xl ring-soft p-5 sm:p-6 ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="chip">{live ? "Today's active matches" : "Matchday status"}</div>
          <div className="mt-2 text-sm text-white/55">{formatHumanDate(state.date)}</div>
        </div>
        <span
          className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ${
            live ? "bg-neon-cyan/15 text-neon-cyan" : "bg-white/10 text-white/60"
          }`}
        >
          {live ? "Live matchday" : "No match today"}
        </span>
      </div>

      {live ? (
        <ul className="mt-4 space-y-3">
          {state.matches.map((m) => (
            <MatchRow key={m.id} m={m} />
          ))}
        </ul>
      ) : (
        <div className="mt-4">
          <div className="rounded-2xl bg-white/[0.03] ring-1 ring-line/60 p-4">
            <div className="text-sm font-semibold">No matchday battle today.</div>
            {nextFirst ? (
              <p className="mt-1 text-sm text-white/60">
                Next battle: <span className="text-white/85">{formatHumanDate(state.nextRealDate || "")}</span> —{" "}
                {nextFirst.teamA.name} vs {nextFirst.teamB.name}
                {next.length > 1 ? ` +${next.length - 1} more` : ""}.
              </p>
            ) : (
              <p className="mt-1 text-sm text-white/60">Check back on the next matchday.</p>
            )}
          </div>

          {next.length > 0 && (
            <>
              <div className="mt-4 text-[10px] uppercase tracking-widest text-white/40">Next matchday</div>
              <ul className="mt-2 space-y-3">
                {next.slice(0, 4).map((m) => (
                  <MatchRow key={m.id} m={m} />
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
