"use client";

import { useEffect, useState } from "react";
import { FlagBadge } from "./FlagArt";

type Props = {
  open: boolean;
  onClose: () => void;
  onChoose: () => void;
};

// Storyboard — also reusable for a 9:16 TikTok/Reels/Shorts promo cut.
const STEPS = [
  { t: "What if your country could take over the world map?", d: "FanMap is one live global territory race." },
  { t: "Choose your nation.", d: "Say Team Türkiye — one tap, you're in." },
  { t: "Your flag appears on your homeland.", d: "The first supporter activates Türkiye." },
  { t: "More fans join through your link.", d: "+1 supporter expanded Team Türkiye." },
  { t: "Every fan expands the flag.", d: "Türkiye grows into Greece, the Balkans, the Caucasus…" },
  { t: "Share your poster.", d: "A 9:16 story asset built to go viral." },
  { t: "Bring your crew.", d: "Every join through your link grows your nation." },
  { t: "Grow your flag.", d: "Now choose your nation." }
];

export function HowItWorksDemo({ open, onClose, onChoose }: Props) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setPlaying(true);
  }, [open]);

  useEffect(() => {
    if (!open || !playing) return;
    if (step >= STEPS.length - 1) return;
    const id = window.setTimeout(() => setStep((s) => s + 1), 1900);
    return () => window.clearTimeout(id);
  }, [open, playing, step]);

  if (!open) return null;
  const last = step === STEPS.length - 1;
  const grow = Math.min(1, (step + 1) / STEPS.length);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/75 backdrop-blur-md" />
      <div className="relative w-full max-w-lg rounded-3xl glass-strong ring-soft overflow-hidden animate-rise">
        <div className="p-5 border-b border-line/60 flex items-center justify-between">
          <div className="chip">▶ Watch the flag grow</div>
          <button type="button" onClick={onClose} className="btn-ghost !py-2 !px-3 text-xs">Close</button>
        </div>

        {/* Stage */}
        <div className="relative h-56 bg-[radial-gradient(120%_100%_at_50%_0%,#0c1530,#05060A)] grid place-items-center overflow-hidden">
          {/* growing flag territory */}
          <div className="absolute inset-x-8 bottom-8 h-24 rounded-xl ring-1 ring-white/10 bg-white/[0.03] overflow-hidden">
            <div
              className="h-full transition-all duration-700 ease-out flex items-center justify-end pr-2"
              style={{ width: `${20 + grow * 78}%`, background: "linear-gradient(90deg,#E30A17,#b00712)" }}
            >
              <FlagBadge slug="turkiye" w={34} h={23} />
            </div>
          </div>
          <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[11px] uppercase tracking-widest text-white/40">
            {last ? "Türkiye climbing the ranking" : `Step ${step + 1} of ${STEPS.length}`}
          </div>
          {step >= 3 && !last && (
            <div className="absolute top-10 right-6 text-xs font-bold text-neon-cyan animate-rise">+1 supporter</div>
          )}
        </div>

        <div className="p-5">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-neon-cyan" : "bg-white/10"}`} />
            ))}
          </div>
          <h3 className="mt-4 h-display text-xl font-bold">{STEPS[step].t}</h3>
          <p className="mt-1 text-sm text-white/60">{STEPS[step].d}</p>

          <div className="mt-5 flex items-center gap-3">
            {last ? (
              <>
                <button type="button" onClick={onChoose} className="btn-primary">Choose your nation</button>
                <button type="button" onClick={() => setStep(0)} className="btn-ghost text-xs">Replay</button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => setStep(STEPS.length - 1)} className="btn-ghost text-xs">Skip</button>
                <button type="button" onClick={() => setPlaying((p) => !p)} className="btn-ghost text-xs">
                  {playing ? "Pause" : "Play"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
