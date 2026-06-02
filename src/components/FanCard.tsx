import { formatNumber } from "@/lib/utils";
import { flagSrc } from "@/data/worldcup-2026-teams";

type Props = {
  nickname: string;
  nationName: string;
  nationEmoji: string;
  primaryColor: string;
  secondaryColor: string;
  supporterNumber: number;
  rank: number;
  mapShare: number; // 0..1
  referralCode?: string;
  slug?: string; // enables real flag art (optional; callers pass it)
  variant?: "default" | "compact";
  className?: string;
};

// Premium shareable supporter POSTER (not an ID/bank card). Portrait, flag-led,
// screenshot- and story-friendly. Strong fan identity + viral copy.
export function FanCard({
  nickname,
  nationName,
  nationEmoji,
  primaryColor,
  secondaryColor,
  supporterNumber,
  rank,
  mapShare,
  referralCode,
  slug,
  variant = "default",
  className
}: Props) {
  const compact = variant === "compact";
  const name = nickname.length > 18 ? `${nickname.slice(0, 17)}…` : nickname;

  return (
    <div
      className={`relative overflow-hidden rounded-[28px] ring-soft aspect-[4/5] ${className ?? ""}`}
      style={{
        background: `radial-gradient(120% 80% at 50% -10%, ${primaryColor}, #06080F 72%)`
      }}
      data-fancard
    >
      {/* texture: soft secondary glow + dotted weave + diagonal sheen */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `radial-gradient(70% 50% at 80% 110%, ${secondaryColor}66, transparent 70%)` }}
      />
      <div
        className="absolute inset-0 opacity-[0.10] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
          backgroundSize: "16px 16px"
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(120deg, rgba(255,255,255,0.12), transparent 35%)" }}
      />

      <div className={`relative h-full flex flex-col ${compact ? "p-5" : "p-6 sm:p-7"}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="h-display text-base font-bold tracking-tight">
            Fan<span className="text-white/70">Map</span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/55">2026 fan race</span>
        </div>

        {/* Flag identity */}
        <div className={`mx-auto ${compact ? "mt-3 w-[58%]" : "mt-5 w-[62%]"}`}>
          <div
            className="rounded-2xl overflow-hidden ring-1 ring-white/25"
            style={{ boxShadow: `0 16px 40px ${primaryColor}66, 0 2px 0 rgba(255,255,255,0.15) inset` }}
          >
            {slug && flagSrc(slug) ? (
              // Real national flag asset (public/flags/*.svg) — no custom drawing.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={flagSrc(slug)!}
                alt={`${nationName} flag`}
                className="block w-full aspect-[3/2] object-cover"
              />
            ) : (
              <svg viewBox="0 0 240 160" className="w-full h-auto block" role="img" aria-label={`${nationName} flag`}>
                <rect width="120" height="160" fill={primaryColor} />
                <rect x="120" width="120" height="160" fill={secondaryColor} />
              </svg>
            )}
          </div>
        </div>

        {/* Headline */}
        <div className={`text-center ${compact ? "mt-3" : "mt-5"}`}>
          <div className="text-xs uppercase tracking-[0.22em] text-white/60">I joined Team</div>
          <div className={`h-display font-bold leading-tight ${compact ? "text-2xl" : "text-3xl sm:text-4xl"}`}>
            {nationName} <span aria-hidden>{nationEmoji}</span>
          </div>
          <div className={`mt-1 text-white/85 ${compact ? "text-sm" : "text-base"}`}>
            as <span className="font-semibold text-white">{name}</span>
          </div>
        </div>

        {/* Supporter number badge */}
        <div className={`mx-auto ${compact ? "mt-3" : "mt-4"}`}>
          <div
            className="rounded-full px-4 py-1.5 text-sm font-bold tracking-wide"
            style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(255,255,255,0.22)" }}
          >
            Supporter #{formatNumber(supporterNumber)}
          </div>
        </div>

        {/* Stats */}
        <div className={`grid grid-cols-2 gap-2 ${compact ? "mt-3" : "mt-auto"}`}>
          <Stat label="Global rank" value={`#${rank}`} />
          <Stat label="Map share" value={`${(mapShare * 100).toFixed(2)}%`} />
        </div>

        {/* Footer */}
        <div className={`flex items-end justify-between gap-3 ${compact ? "mt-3" : "mt-4"}`}>
          <div>
            <div className="h-display text-base font-bold">Grow the FanMap</div>
            <div className="text-[11px] text-white/65">Share and expand your nation</div>
          </div>
          {referralCode && (
            <div
              className="text-right rounded-xl px-3 py-1.5"
              style={{ background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <div className="text-[9px] uppercase tracking-widest text-white/60">Invite code</div>
              <div className="font-mono font-bold tracking-widest text-sm">{referralCode}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl px-3 py-2 text-center"
      style={{ background: "rgba(0,0,0,0.32)", border: "1px solid rgba(255,255,255,0.14)" }}
    >
      <div className="text-[10px] uppercase tracking-widest text-white/65">{label}</div>
      <div className="font-bold tabular-nums">{value}</div>
    </div>
  );
}
