"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NationWithDelta } from "@/lib/stats";
import { getTeam } from "@/data/worldcup-2026-teams";
import { GlobalWorldMap } from "./GlobalWorldMap";
import { ChooseNationOverlay } from "./ChooseNationOverlay";
import { HowItWorksDemo } from "./HowItWorksDemo";
import { LiveMapMode } from "./LiveMapMode";
import { FlagBadge } from "./FlagArt";

export function MapHero({ nations, preview }: { nations: NationWithDelta[]; preview?: boolean }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [expanding, setExpanding] = useState(false); // true only via choose-nation (growth)
  const [chooser, setChooser] = useState(false);
  const [demo, setDemo] = useState(false);
  const [live, setLive] = useState(false);
  const team = selected ? getTeam(selected) : null;

  useEffect(() => {
    const openMap = () => setLive(true);
    const openChooser = () => setChooser(true);
    window.addEventListener("fanmap:open-map", openMap);
    window.addEventListener("fanmap:choose-nation", openChooser);
    try {
      if (new URLSearchParams(window.location.search).get("map") === "1") setLive(true);
    } catch {
      /* ignore */
    }
    return () => {
      window.removeEventListener("fanmap:open-map", openMap);
      window.removeEventListener("fanmap:choose-nation", openChooser);
    };
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 grid-bg" />
        <div className="absolute -top-40 left-1/3 size-[760px] rounded-full bg-neon-violet/10 blur-3xl" />
        <div className="absolute top-20 -right-24 size-[560px] rounded-full bg-neon-cyan/10 blur-3xl" />
      </div>

      <div className="container-wide pt-8 lg:pt-14 pb-12">
        <div className="grid lg:grid-cols-[0.86fr_1.14fr] gap-8 lg:gap-6 items-center">
          {/* Copy column — first on mobile so the CTA sits above the fold. */}
          <div className="order-1 animate-rise">
            <div className="flex flex-wrap items-center gap-2">
              <div className="chip">
                <span className="size-1.5 rounded-full bg-neon-cyan animate-pulseGlow" /> Independent fan map · 2026
                football summer
              </div>
              {preview && <span className="chip !text-amber-300 border-amber-400/30">Preview data</span>}
            </div>
            <h1 className="mt-4 h-display text-[40px] sm:text-6xl lg:text-[68px] font-bold leading-[0.96] tracking-tight">
              Which nation will{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(120deg,#5EEAD4 10%,#A78BFA 50%,#F472B6 90%)" }}
              >
                take over the FanMap?
              </span>
            </h1>
            <p className="mt-4 text-lg sm:text-xl text-white/75 max-w-md">
              Choose your nation. Every supporter expands the flag — your homeland grows across the
              world map.
            </p>
            {/* Mobile selected-state CTA (desktop keeps the buttons below + map overlay). */}
            {selected && team && (
              <div className="mt-6 lg:hidden">
                <div className="chip">Team {team.name} selected</div>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <Link href={`/join?nation=${team.slug}`} className="btn-primary text-base !py-4 !px-7">
                    Claim your free poster <span aria-hidden>→</span>
                  </Link>
                  <button type="button" onClick={() => setChooser(true)} className="btn-ghost text-base !py-4 !px-7">
                    Change nation
                  </button>
                </div>
              </div>
            )}
            <div className={`mt-6 flex-wrap items-center gap-3 ${selected ? "hidden lg:flex" : "flex"}`}>
              <button type="button" onClick={() => setChooser(true)} className="btn-primary text-base !py-4 !px-7">
                Choose your nation <span aria-hidden>→</span>
              </button>
              <button type="button" onClick={() => setDemo(true)} className="btn-ghost text-base !py-4 !px-7">
                ▶ Watch the flag grow
              </button>
            </div>
            <div className="mt-4 flex items-center gap-4 text-xs text-white/50">
              <button
                type="button"
                onClick={() => setLive(true)}
                className="underline-offset-2 hover:text-white hover:underline"
              >
                View map full-screen →
              </button>
              <span>{nations.length} nations · one live global territory race</span>
            </div>
          </div>

          {/* Map column — open & cinematic, edges fade into the page (no card frame).
              Box matches the world's 2:1 aspect so the WHOLE world fits (no crop). */}
          <div className="order-2 relative lg:-mr-6 xl:-mr-14">
            <div className="relative aspect-[2/1] w-full">
              {/* the map itself, masked so it dissolves into the background */}
              <div
                className="absolute inset-0"
                style={{
                  WebkitMaskImage:
                    "radial-gradient(125% 115% at 60% 42%, #000 50%, rgba(0,0,0,0) 100%)",
                  maskImage: "radial-gradient(125% 115% at 60% 42%, #000 50%, rgba(0,0,0,0) 100%)"
                }}
              >
                <GlobalWorldMap
                  nations={nations}
                  selectedSlug={selected}
                  expand={expanding}
                  onSelect={(s) => {
                    setSelected(s);
                    setExpanding(false); // map click = focus only, no growth flags
                  }}
                  className="w-full h-full"
                />
              </div>

              {/* overlays (not masked) */}
              <div className="absolute top-2 left-2 chip pointer-events-none">
                <span className="size-1.5 rounded-full bg-neon-cyan animate-pulseGlow" /> Live global map
              </div>
              <button
                type="button"
                onClick={() => setLive(true)}
                className="absolute top-2 right-2 lg:right-20 btn-ghost !py-1.5 !px-3 text-xs"
              >
                Expand ⤢
              </button>

              {/* Growth moment (expand) or focus info (map click) */}
              {team && (
                <div className="absolute inset-x-2 bottom-3 lg:inset-x-10">
                  <div className="glass-strong ring-soft rounded-2xl px-3 py-3 sm:px-4 flex items-center gap-3 animate-rise">
                    <FlagBadge slug={team.slug} w={44} h={30} />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold truncate">
                        {expanding ? `Team ${team.name} expanded the FanMap.` : `Team ${team.name}`}
                      </div>
                      <div className="text-xs text-white/55 truncate">
                        {expanding
                          ? "Your flag spread into new territory — lock it in."
                          : "Viewing this nation's territory — claim your poster to grow it."}
                      </div>
                    </div>
                    <Link href={`/join?nation=${team.slug}`} className="btn-primary !py-2 !px-3 text-xs shrink-0 whitespace-nowrap">
                      Claim your free poster →
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="hidden sm:inline-flex btn-ghost !py-2 !px-2.5 text-xs shrink-0"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ChooseNationOverlay
        nations={nations}
        open={chooser}
        onClose={() => setChooser(false)}
        onPick={(slug) => {
          setSelected(slug);
          setExpanding(true); // choosing a nation plays the growth/expansion preview
          setChooser(false);
        }}
      />
      <HowItWorksDemo
        open={demo}
        onClose={() => setDemo(false)}
        onChoose={() => {
          setDemo(false);
          setChooser(true);
        }}
      />
      <LiveMapMode nations={nations} open={live} onClose={() => setLive(false)} />
    </section>
  );
}
