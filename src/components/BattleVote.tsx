"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { HostBattleState } from "@/lib/host-battle";
import { Countdown } from "./Countdown";
import { FlagBadge } from "./FlagArt";

type Props = {
  state: HostBattleState;
  presetSlug?: string; // pre-select a nation (e.g. arriving from its page)
  className?: string;
};

const VOTER_KEY = "fanmap_voter_key";
const SUPPORTER_KEY = "fanmap_supporter_id";
const voteKeyFor = (date: string) => `fanmap_host_vote_${date}`;

function ensureVoterKey(): string {
  if (typeof window === "undefined") return "";
  let k = localStorage.getItem(VOTER_KEY);
  if (!k) {
    k =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `vk_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    localStorage.setItem(VOTER_KEY, k);
  }
  return k;
}

// Once-per-day host-region check-in. Only eligible nations are votable. When no
// real fixtures are loaded, check-in is preview-only (never recorded as real).
export function BattleVote({ state, presetSlug, className }: Props) {
  const eligible = state.eligible;
  const [voterKey, setVoterKey] = useState("");
  const [voted, setVoted] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(
    presetSlug && eligible.some((n) => n.slug === presetSlug) ? presetSlug : null
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setVoterKey(ensureVoterKey());
    const prior = localStorage.getItem(voteKeyFor(state.date));
    if (prior) setVoted(prior);
  }, [state.date]);

  const votedNation = useMemo(
    () => (voted ? eligible.find((n) => n.slug === voted) ?? null : null),
    [voted, eligible]
  );

  async function submit() {
    if (!selected || pending) return;
    setPending(true);
    setError(null);
    try {
      const supporterId =
        typeof window !== "undefined" ? localStorage.getItem(SUPPORTER_KEY) : null;
      const res = await fetch("/api/battle/vote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          date: state.date,
          slug: selected,
          voter_key: voterKey,
          supporter_id: supporterId || undefined
        })
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok || res.status === 409) {
        const finalSlug = (json.slug as string) || selected;
        localStorage.setItem(voteKeyFor(state.date), finalSlug);
        setVoted(finalSlug);
      } else {
        setError(json.error || "Could not record your check-in. Try again.");
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setPending(false);
    }
  }

  if (!eligible.length) {
    return (
      <div className={`glass rounded-3xl ring-soft p-6 ${className ?? ""}`}>
        <div className="chip">No matches today</div>
        <p className="mt-3 text-sm text-white/60">
          There are no host-region fixtures scheduled today. Keep growing your nation on the Global
          FanMap meanwhile.
        </p>
        <Link href="/" className="mt-4 btn-ghost text-xs">
          Back to the Global FanMap
        </Link>
      </div>
    );
  }

  return (
    <div className={`glass rounded-3xl ring-soft p-5 sm:p-6 ${className ?? ""}`}>
      {votedNation ? (
        <div>
          <div className="chip">
            <span className="size-1.5 rounded-full bg-neon-cyan animate-pulseGlow" /> Checked in today
          </div>
          <div className="mt-3 flex items-center gap-3">
            <FlagBadge slug={votedNation.slug} w={40} h={27} />
            <h3 className="h-display text-xl font-bold">You backed {votedNation.name} today.</h3>
          </div>
          <p className="mt-1 text-sm text-white/55">
            Your check-in is painting the host region right now. One check-in per day — come back
            tomorrow to vote again.
          </p>
          <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
            <Countdown targetISO={state.resetAtISO} label="Next battle in" />
            <Link href="/join" className="btn-ghost text-xs">
              Invite friends to vote →
            </Link>
          </div>
        </div>
      ) : (
        <div>
          <div className="chip">
            <span className="size-1.5 rounded-full bg-neon-magenta animate-pulseGlow" /> Daily check-in
          </div>
          <h3 className="mt-3 h-display text-xl font-bold">Pick who paints the host region today.</h3>
          <p className="mt-1 text-sm text-white/55">
            Only today's nations are eligible. One check-in per day — it controls territory across the
            combined USA · Canada · Mexico map.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            {eligible.map((n) => {
              const active = selected === n.slug;
              return (
                <button
                  key={n.slug}
                  type="button"
                  onClick={() => setSelected(n.slug)}
                  className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm glass transition text-left"
                  style={{
                    borderColor: active ? n.primary_color : undefined,
                    boxShadow: active
                      ? `0 0 0 1px ${n.primary_color}, 0 0 18px ${n.primary_color}55`
                      : undefined,
                    background: active ? `${n.primary_color}22` : undefined
                  }}
                >
                  <FlagBadge slug={n.slug} w={26} h={18} />
                  <span className="font-medium truncate">{n.name}</span>
                </button>
              );
            })}
          </div>

          {error && <p className="mt-3 text-xs text-neon-magenta">{error}</p>}

          {state.hasRealFixtures ? (
            <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
              <button
                type="button"
                onClick={submit}
                disabled={!selected || pending}
                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {pending ? "Checking in…" : "Lock in my check-in"}
              </button>
              <Countdown targetISO={state.resetAtISO} />
            </div>
          ) : (
            <div className="mt-4">
              <button type="button" disabled className="btn-primary opacity-40 cursor-not-allowed">
                Check-in opens on matchday
              </button>
              <p className="mt-3 text-[11px] text-amber-300/90">
                Preview only — these are sample teams. Real check-ins are recorded once real fixtures
                are loaded
                {state.nextRealDate ? ` (next matchday on file: ${state.nextRealDate})` : ""}.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
