"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { NationWithDelta } from "@/lib/stats";
import { NationSelector } from "./NationSelector";
import { GlobalWorldMap } from "./GlobalWorldMap";

type Props = {
  nations: NationWithDelta[];
};

export function JoinFlow({ nations }: Props) {
  const router = useRouter();
  const search = useSearchParams();

  const refFromUrl = search?.get("ref") ?? null;
  const initialNation = search?.get("nation") ?? null;

  const [selected, setSelected] = useState<string | null>(initialNation);
  const [nickname, setNickname] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot — must stay empty
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nation = useMemo(() => nations.find((n) => n.slug === selected) ?? null, [nations, selected]);

  useEffect(() => {
    if (refFromUrl) {
      try {
        sessionStorage.setItem("fanmap:ref", refFromUrl);
      } catch {}
    }
  }, [refFromUrl]);

  const referralCode =
    refFromUrl || (typeof window !== "undefined" ? sessionStorage.getItem("fanmap:ref") : null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!nation) {
      setError("Pick a nation first.");
      return;
    }
    if (!nickname.trim() || nickname.trim().length < 2) {
      setError("Add a nickname (at least 2 characters).");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          nation_slug: nation.slug,
          nickname: nickname.trim(),
          city: city.trim() || null,
          email: email.trim() || null,
          ref: referralCode || null,
          website: website || null
        })
      });
      const data = await res.json();
      if (!res.ok || !data?.supporter_id) {
        // Preview mode (Supabase not configured): go to the preview poster
        // instead of surfacing a technical error.
        if (/supabase|configured/i.test(data?.error || "")) {
          router.push(`/card/demo?nation=${nation.slug}`);
          return;
        }
        setError(data?.error || "Could not join right now. Try again.");
        setSubmitting(false);
        return;
      }
      router.push(`/card/${data.supporter_id}`);
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  // Step 1 — visual nation selection.
  if (!nation) {
    return (
      <div>
        <div className="chip">Step 1 · Choose your nation</div>
        <h2 className="mt-3 h-display text-3xl sm:text-4xl font-bold tracking-tight">
          Pick your flag. Watch it take over the map.
        </h2>
        <p className="mt-2 text-white/60 max-w-xl">
          Every supporter expands the flag. Choose your nation to see your territory — then claim your
          supporter poster in under 30 seconds.
        </p>
        <div className="mt-6">
          <NationSelector nations={nations} selected={selected} onChange={setSelected} />
        </div>
      </div>
    );
  }

  // Step 2 — map takeover + minimal form.
  return (
    <div className="space-y-6">
      <div className="relative rounded-3xl ring-soft overflow-hidden">
        <GlobalWorldMap
          nations={nations}
          selectedSlug={nation.slug}
          focusSlug={nation.slug}
          labelCount={6}
          className="h-[44vh] min-h-[320px]"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(0deg, rgba(5,6,10,0.92) 4%, transparent 55%)" }}
        />
        <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 flex-wrap">
          <div className="glass-strong rounded-2xl px-4 py-3">
            <div className="text-[10px] uppercase tracking-widest text-neon-cyan">
              Team {nation.name} expanded the FanMap
            </div>
            <div className="h-display text-lg font-bold">Every supporter expands the flag.</div>
          </div>
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="btn-ghost text-xs pointer-events-auto"
          >
            Change nation
          </button>
        </div>
      </div>

      <form onSubmit={onSubmit} className="glass rounded-3xl ring-soft p-5 sm:p-6">
        {/* Honeypot: hidden from humans; bots that fill it are rejected server-side. */}
        <div aria-hidden="true" style={{ position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" }}>
          <label>
            Leave this field empty
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </label>
        </div>
        <div className="chip">Step 2 · Claim your supporter poster</div>
        <h3 className="mt-3 h-display text-xl font-bold">
          You're backing {nation.emoji} Team {nation.name}.
        </h3>
        <div className="mt-4 grid sm:grid-cols-2 gap-3">
          <Field label="Nickname" required placeholder="e.g. Selin" value={nickname} onChange={setNickname} />
          <Field label="City (optional)" placeholder="e.g. Zürich" value={city} onChange={setCity} />
          <div className="sm:col-span-2">
            <Field label="Email (optional)" placeholder="for matchday updates" value={email} onChange={setEmail} type="email" />
          </div>
        </div>

        {referralCode && (
          <div className="mt-3 text-xs text-white/55">
            Invited with code <span className="font-mono font-bold text-neon-cyan">{referralCode}</span>.
          </div>
        )}
        {error && (
          <div className="mt-3 text-sm text-red-300 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
            {error}
          </div>
        )}

        <div className="mt-5 flex items-center gap-3">
          <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-60">
            {submitting ? "Joining…" : "Generate my poster →"}
          </button>
          <span className="text-xs text-white/45">Free · no login · under 30 seconds</span>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <div className="text-xs text-white/55 mb-1">
        {label}
        {required && <span className="text-red-300"> *</span>}
      </div>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 outline-none focus:border-neon-cyan/60 focus:ring-2 focus:ring-neon-cyan/20"
      />
    </label>
  );
}
