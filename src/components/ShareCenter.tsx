"use client";

import { useEffect, useMemo, useState } from "react";
import { getTeam, flagSrc } from "@/data/worldcup-2026-teams";
import { buildPosterSvg, svgToDataUrl } from "@/lib/poster";
import { localeForNation } from "@/lib/share";

const MOTTO: Record<string, string> = {
  tr: "HER TARAFTAR BAYRAĞI BÜYÜTÜR",
  de: "JEDER FAN VERGRÖSSERT DIE FLAGGE",
  en: "EVERY FAN EXPANDS THE FLAG"
};

type Props = {
  slug: string;
  nationName: string;
  nickname: string;
  supporterNumber: number;
  rank: number;
  mapShare: number;
  referralCode?: string;
  inviteLink: string;
  shareText: string; // localized caption
  nextLine?: string | null;
  hostActive?: boolean;
  supporterId?: string | null;
  className?: string;
};

async function toDataUriFromUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const text = await res.text();
    const b64 = btoa(unescape(encodeURIComponent(text)));
    return `data:image/svg+xml;base64,${b64}`;
  } catch {
    return null;
  }
}

async function rasterize(svgDataUrl: string, filename: string, w: number, h: number) {
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = svgDataUrl;
  });
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.drawImage(img, 0, 0, w, h);
  await new Promise<void>((resolve) =>
    canvas.toBlob((blob) => {
      if (blob) {
        const u = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = u;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(u);
      }
      resolve();
    }, "image/png")
  );
}

export function ShareCenter({
  slug,
  nationName,
  nickname,
  supporterNumber,
  rank,
  mapShare,
  referralCode,
  inviteLink,
  shareText,
  nextLine,
  hostActive,
  supporterId,
  className
}: Props) {
  const team = getTeam(slug);
  const [storyUrl, setStoryUrl] = useState<string | null>(null);
  const [squareUrl, setSquareUrl] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [canNative, setCanNative] = useState(false);

  const siteHost = useMemo(() => {
    try {
      return new URL(inviteLink).host;
    } catch {
      return "fanmap";
    }
  }, [inviteLink]);

  useEffect(() => {
    setCanNative(typeof navigator !== "undefined" && !!(navigator as Navigator).share);
    let active = true;
    (async () => {
      const src = flagSrc(slug);
      const flagHref = src ? await toDataUriFromUrl(src) : null;
      const common = {
        flagHref,
        nationName,
        nickname,
        supporterNumber,
        rank,
        mapShare,
        nextLine: nextLine ?? null,
        motto: MOTTO[localeForNation(slug)] ?? MOTTO.en,
        hostActive,
        siteHost,
        fallbackColor: team?.primary_color
      };
      if (!active) return;
      setStoryUrl(svgToDataUrl(buildPosterSvg({ ...common, variant: "story" })));
      setSquareUrl(svgToDataUrl(buildPosterSvg({ ...common, variant: "square" })));
      setReady(true);
    })();
    return () => {
      active = false;
    };
  }, [slug, nationName, nickname, supporterNumber, rank, mapShare, nextLine, hostActive, siteHost, team?.primary_color]);

  function track(channel: string, asset_type: string) {
    try {
      fetch("/api/share/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          channel,
          asset_type,
          nation_slug: slug,
          supporter_id: supporterId || null,
          referral_code: referralCode || null
        }),
        keepalive: true
      }).catch(() => {});
    } catch {
      /* ignore */
    }
  }

  function flash(msg: string) {
    setNotice(msg);
    window.setTimeout(() => setNotice(null), 2600);
  }

  async function copyCaption() {
    try {
      await navigator.clipboard.writeText(shareText);
      return true;
    } catch {
      return false;
    }
  }

  async function downloadStoryFlow(channel: "instagram" | "tiktok" | "download") {
    if (!storyUrl) return;
    track(channel, "poster_story");
    await rasterize(storyUrl, `fanmap-${slug}-story.png`, 1080, 1920);
    if (channel === "download") {
      flash("Poster downloaded ✓");
    } else {
      const copied = await copyCaption();
      flash(copied ? "Poster saved + caption copied — paste into your post" : "Poster saved — add your caption");
    }
  }

  async function downloadSquareFlow() {
    if (!squareUrl) return;
    track("download", "poster_square");
    await rasterize(squareUrl, `fanmap-${slug}-square.png`, 1080, 1080);
    flash("Square post downloaded ✓");
  }

  async function copyLink() {
    track("copy", "link");
    try {
      await navigator.clipboard.writeText(inviteLink);
      flash("Invite link copied ✓");
    } catch {
      flash("Copy failed");
    }
  }

  async function nativeShare() {
    track("native", "link");
    try {
      await (navigator as Navigator).share({ text: shareText, url: inviteLink });
    } catch {
      /* user cancelled */
    }
  }

  const whatsapp = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(inviteLink)}`;
  const twitter = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;

  return (
    <div className={`glass rounded-3xl ring-soft p-5 sm:p-6 ${className ?? ""}`}>
      <div className="chip">
        <span className="size-1.5 rounded-full bg-neon-cyan animate-pulseGlow" /> Share Center
      </div>
      <h2 className="mt-3 h-display text-2xl font-bold">Share your nation. Grow the flag.</h2>
      <p className="mt-1 text-sm text-white/55">
        The more people join through your link, the more your nation grows on the map.
      </p>

      <div className="mt-5 grid sm:grid-cols-[200px_1fr] gap-5 items-start">
        {/* 9:16 poster preview */}
        <div className="mx-auto w-full max-w-[220px]">
          <div
            className="relative aspect-[9/16] rounded-2xl overflow-hidden ring-1 ring-white/15"
            style={{ background: team?.primary_color ?? "#0A0C14" }}
          >
            {storyUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={storyUrl} alt={`${nationName} supporter story poster`} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 grid place-items-center text-xs text-white/70">Building poster…</div>
            )}
          </div>
          <div className="mt-2 text-center text-[11px] text-white/40">9:16 story poster</div>
        </div>

        {/* Channels */}
        <div>
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener"
            onClick={() => track("whatsapp", "link")}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] px-5 py-3.5 text-base font-bold text-[#06270f] transition hover:brightness-110"
          >
            <WhatsAppIcon /> Share on WhatsApp
          </a>
          <div className="mt-1.5 text-[11px] text-white/40 text-center">Recommended — fastest way to grow your nation</div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => downloadStoryFlow("instagram")} disabled={!ready} className="btn-ghost text-xs justify-center disabled:opacity-40">
              📸 Instagram Story
            </button>
            <button type="button" onClick={() => downloadStoryFlow("tiktok")} disabled={!ready} className="btn-ghost text-xs justify-center disabled:opacity-40">
              🎵 TikTok
            </button>
            <a href={facebook} target="_blank" rel="noopener" onClick={() => track("facebook", "link")} className="btn-ghost text-xs justify-center">
              Facebook
            </a>
            <a href={twitter} target="_blank" rel="noopener" onClick={() => track("x", "link")} className="btn-ghost text-xs justify-center">
              Share on X
            </a>
            <button type="button" onClick={copyLink} className="btn-ghost text-xs justify-center">
              Copy invite link
            </button>
            <button type="button" onClick={() => downloadStoryFlow("download")} disabled={!ready} className="btn-ghost text-xs justify-center disabled:opacity-40">
              ⬇ Poster (9:16)
            </button>
            <button type="button" onClick={downloadSquareFlow} disabled={!ready} className="btn-ghost text-xs justify-center disabled:opacity-40">
              ⬇ Square post
            </button>
            {canNative && (
              <button type="button" onClick={nativeShare} className="btn-ghost text-xs justify-center">
                More…
              </button>
            )}
          </div>

          <div className="mt-3 rounded-xl bg-white/[0.04] ring-1 ring-line/60 px-3 py-2">
            <div className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Caption (auto-copied for IG/TikTok)</div>
            <p className="text-xs text-white/70 whitespace-pre-line">{shareText}</p>
          </div>

          {notice && <div className="mt-3 text-xs text-neon-cyan">{notice}</div>}
        </div>
      </div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.5 3.5A11 11 0 0 0 3.7 17.3L2 22l4.8-1.6A11 11 0 1 0 20.5 3.5Zm-8.4 17a8.9 8.9 0 0 1-4.5-1.2l-.3-.2-2.9.9.9-2.8-.2-.3a8.9 8.9 0 1 1 7 3.6Zm5.1-6.6c-.3-.1-1.7-.8-2-.9s-.5-.1-.7.1-.8.9-1 1.1-.4.2-.7 0-1.2-.5-2.3-1.4a8.5 8.5 0 0 1-1.6-1.9c-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5s0-.4 0-.5L8 7.4c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.4a3 3 0 0 0-1 2.3c0 1.4 1 2.8 1.2 3a10.6 10.6 0 0 0 4.5 3.8c.6.3 1 .4 1.4.5.6.2 1.1.2 1.6.1.5-.1 1.7-.7 2-1.4s.3-1.3.2-1.4l-.6-.3Z" />
    </svg>
  );
}
