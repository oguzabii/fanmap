"use client";

import { useState } from "react";

type Props = {
  text: string;
  link: string;
};

export function ShareButtons({ text, link }: Props) {
  const [copied, setCopied] = useState(false);

  const encoded = encodeURIComponent(text);
  const linkEnc = encodeURIComponent(link);

  const whatsapp = `https://wa.me/?text=${encoded}`;
  const twitter = `https://twitter.com/intent/tweet?text=${encoded}`;
  const facebook = `https://www.facebook.com/sharer/sharer.php?u=${linkEnc}`;
  const telegram = `https://t.me/share/url?url=${linkEnc}&text=${encoded}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  }

  async function nativeShare() {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ text, url: link });
      } catch {
        // ignore
      }
    } else {
      copyLink();
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a href={whatsapp} target="_blank" rel="noopener" className="btn-primary !py-2 !px-4 text-xs">
        <WhatsAppIcon /> Share on WhatsApp
      </a>
      <a href={twitter} target="_blank" rel="noopener" className="btn-ghost !py-2 !px-4 text-xs">
        <XIcon /> Share on X
      </a>
      <a href={facebook} target="_blank" rel="noopener" className="btn-ghost !py-2 !px-4 text-xs">
        <FacebookIcon /> Share on Facebook
      </a>
      <a href={telegram} target="_blank" rel="noopener" className="btn-ghost !py-2 !px-4 text-xs">
        Telegram
      </a>
      <button type="button" onClick={copyLink} className="btn-ghost !py-2 !px-4 text-xs">
        {copied ? "Link copied ✓" : "Copy invite link"}
      </button>
      <button type="button" onClick={nativeShare} className="btn-ghost !py-2 !px-4 text-xs">
        More…
      </button>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.5 3.5A11 11 0 0 0 3.7 17.3L2 22l4.8-1.6A11 11 0 1 0 20.5 3.5Zm-8.4 17a8.9 8.9 0 0 1-4.5-1.2l-.3-.2-2.9.9.9-2.8-.2-.3a8.9 8.9 0 1 1 7 3.6Zm5.1-6.6c-.3-.1-1.7-.8-2-.9s-.5-.1-.7.1-.8.9-1 1.1-.4.2-.7 0-1.2-.5-2.3-1.4a8.5 8.5 0 0 1-1.6-1.9c-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5s0-.4 0-.5L8 7.4c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.4a3 3 0 0 0-1 2.3c0 1.4 1 2.8 1.2 3a10.6 10.6 0 0 0 4.5 3.8c.6.3 1 .4 1.4.5.6.2 1.1.2 1.6.1.5-.1 1.7-.7 2-1.4s.3-1.3.2-1.4l-.6-.3Z"/>
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2H21.5l-7.59 8.67L22.5 22h-6.95l-5.44-7.13L3.7 22H.44l8.12-9.27L1.5 2h7.13l4.92 6.5L18.24 2Zm-1.22 18h1.94L7.05 4H5.04l11.98 16Z"/>
    </svg>
  );
}
function FacebookIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13 22v-8h2.7l.4-3.1H13V8.9c0-.9.3-1.5 1.6-1.5h1.7V4.5c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.5-4 4.2v2.3H7v3.1h2.9V22H13Z"/>
    </svg>
  );
}
