import { createHash, timingSafeEqual } from "crypto";

// Admin auth helpers. Keeps the existing single-password (ADMIN_PASSWORD) +
// cookie-session concept — just avoids storing the raw password in the cookie
// and compares secrets in constant time.

export const ADMIN_COOKIE = "fanmap_admin";

/**
 * Opaque session token derived from the admin password. Stored in the cookie
 * instead of the raw password, so the secret never sits in the browser jar.
 */
export function adminToken(secret: string): string {
  return createHash("sha256").update(`fanmap-admin-session:${secret}`).digest("hex");
}

/** Constant-time string comparison (false on length mismatch, never throws). */
export function safeEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/** True when a request cookie value is a valid admin session for `secret`. */
export function isAdminCookieValid(
  cookieValue: string | null | undefined,
  secret: string | null | undefined
): boolean {
  if (!secret) return false;
  return safeEqual(cookieValue, adminToken(secret));
}
