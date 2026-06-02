import { createHash, randomBytes } from "crypto";

export function classNames(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function newReferralCode(): string {
  // 8 chars, URL-safe, uppercase
  return randomBytes(6)
    .toString("base64")
    .replace(/[^A-Za-z0-9]/g, "")
    .slice(0, 8)
    .toUpperCase();
}

export function hashIp(ip: string | null | undefined): string | null {
  if (!ip) return null;
  return createHash("sha256")
    .update(`fanmap:${ip}`)
    .digest("hex");
}

export function hashUa(ua: string | null | undefined): string | null {
  if (!ua) return null;
  return createHash("sha256")
    .update(`fanmap:${ua}`)
    .digest("hex");
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(Math.max(n, min), max);
}
