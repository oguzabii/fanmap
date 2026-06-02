import { NextResponse } from "next/server";
import { rateLimit, clientHash } from "@/lib/rate-limit";
import { ADMIN_COOKIE, adminToken, safeEqual } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: "ADMIN_PASSWORD not configured." }, { status: 500 });
  }

  // Throttle brute-force: 8 attempts per 10 minutes per client (ip+ua hash).
  const limit = rateLimit(`admin-login:${clientHash(req)}`, 8, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  // Constant-time comparison; never store/echo the raw password.
  if (!safeEqual(body.password, expected)) {
    return NextResponse.json({ error: "Invalid password." }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  // Store a derived session token, not the password itself.
  res.cookies.set(ADMIN_COOKIE, adminToken(expected), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  return res;
}
