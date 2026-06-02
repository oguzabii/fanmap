import { createHash } from "crypto";

// Simple in-memory, fixed-window rate limiter. Best-effort: state lives per
// server instance (resets on cold start; not shared across serverless
// instances). Good enough as an anti-abuse speed bump in front of the API
// routes — not a substitute for a global store. No external dependencies.

type Entry = { count: number; resetAt: number };

const buckets = new Map<string, Entry>();
let lastSweep = 0;

function sweep(now: number): void {
  // Drop expired buckets occasionally so the map can't grow unbounded.
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [k, e] of buckets) {
    if (e.resetAt <= now) buckets.delete(k);
  }
}

export type RateResult = { ok: boolean; retryAfter: number };

/**
 * Allow up to `limit` hits per `windowMs` for a given key.
 * Returns ok=false with retryAfter (seconds) once the window is exhausted.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now();
  sweep(now);
  const e = buckets.get(key);
  if (!e || e.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, retryAfter: 0 };
  }
  if (e.count >= limit) {
    return { ok: false, retryAfter: Math.max(1, Math.ceil((e.resetAt - now) / 1000)) };
  }
  e.count += 1;
  return { ok: true, retryAfter: 0 };
}

/**
 * Privacy-preserving client fingerprint derived from IP + user-agent.
 * Never stores the raw IP/UA — only a truncated SHA-256 hash.
 */
export function clientHash(req: Request): string {
  const h = req.headers;
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "0.0.0.0";
  const ua = h.get("user-agent") || "unknown";
  return createHash("sha256").update(`fanmap-rl:${ip}:${ua}`).digest("hex").slice(0, 32);
}
