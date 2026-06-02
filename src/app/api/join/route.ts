import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { hashIp, hashUa, newReferralCode } from "@/lib/utils";
import { rateLimit, clientHash } from "@/lib/rate-limit";

export const runtime = "nodejs";

type Body = {
  nation_slug?: string;
  nickname?: string;
  city?: string | null;
  email?: string | null;
  ref?: string | null;
  // Honeypot: hidden field that must stay empty for humans. Bots tend to fill it.
  website?: string | null;
  hp?: string | null;
};

// Drop control characters (code < 0x20 or 0x7F) and collapse whitespace.
// Keeps letters, accents and emoji intact.
function sanitizeText(s: string): string {
  let out = "";
  for (const ch of s) {
    const code = ch.codePointAt(0) ?? 0;
    if (code < 0x20 || code === 0x7f) continue;
    out += ch;
  }
  return out.replace(/\s+/g, " ").trim();
}

export async function POST(req: Request) {
  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json(
      {
        error:
          "Supabase is not configured on the server. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
      },
      { status: 500 }
    );
  }

  // Anti-abuse: cap supporter creation per client (ip+ua hash).
  const limit = rateLimit(`join:${clientHash(req)}`, 5, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "You're going too fast. Please wait a moment and try again." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Honeypot: a filled hidden field means a bot — drop it without creating a row.
  if ((body.website && body.website.trim()) || (body.hp && body.hp.trim())) {
    return NextResponse.json({ error: "Could not join right now." }, { status: 400 });
  }

  const nation_slug = sanitizeText((body.nation_slug || "").toLowerCase()).slice(0, 64);
  const nickname = sanitizeText(body.nickname || "").slice(0, 32);
  const city = sanitizeText((body.city || "")?.toString()).slice(0, 64) || null;
  const email = (body.email || "")?.toString().trim().slice(0, 120) || null;
  const ref = (body.ref || "")?.toString().trim().slice(0, 16) || null;

  if (!nation_slug || nickname.length < 2) {
    return NextResponse.json({ error: "Missing nation or nickname." }, { status: 400 });
  }
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 });
  }

  const { data: nation, error: nationErr } = await supabase
    .from("nations")
    .select("id,name,slug")
    .eq("slug", nation_slug)
    .maybeSingle();

  if (nationErr || !nation) {
    return NextResponse.json({ error: "Unknown nation." }, { status: 400 });
  }

  // Resolve referrer (optional)
  let referrer_id: string | null = null;
  if (ref) {
    const { data: refRow } = await supabase
      .from("supporters")
      .select("id")
      .eq("referral_code", ref.toUpperCase())
      .maybeSingle();
    if (refRow) referrer_id = refRow.id as string;
  }

  const headers = req.headers;
  const ip =
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    null;
  const ua = headers.get("user-agent");

  // Generate a unique referral code; retry once on collision.
  let referral_code = newReferralCode();
  for (let i = 0; i < 3; i++) {
    const { data: collision } = await supabase
      .from("supporters")
      .select("id")
      .eq("referral_code", referral_code)
      .maybeSingle();
    if (!collision) break;
    referral_code = newReferralCode();
  }

  const { data: inserted, error: insErr } = await supabase
    .from("supporters")
    .insert({
      nation_id: nation.id,
      nickname,
      city,
      email,
      referral_code,
      referred_by: referrer_id,
      ip_hash: hashIp(ip),
      user_agent_hash: hashUa(ua),
      supporter_number: 1 // placeholder, trigger overwrites
    })
    .select("id,referral_code")
    .single();

  if (insErr || !inserted) {
    return NextResponse.json(
      { error: "Could not create supporter. " + insErr?.message },
      { status: 500 }
    );
  }

  if (referrer_id) {
    // Best-effort referrals row; ignore failures.
    await supabase
      .from("referrals")
      .insert({
        referrer_supporter_id: referrer_id,
        referred_supporter_id: inserted.id
      });
  }

  return NextResponse.json({
    supporter_id: inserted.id,
    referral_code: inserted.referral_code,
    nation_slug: nation.slug
  });
}
