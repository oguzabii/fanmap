import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { todayISO } from "@/lib/host-battle";
import { eligibleSlugsOn, realFixturesOn } from "@/data/worldcup-2026-fixtures";
import { rateLimit, clientHash } from "@/lib/rate-limit";

export const runtime = "nodejs";

type Body = {
  date?: string;
  slug?: string;
  voter_key?: string;
  supporter_id?: string | null;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ALREADY = "Already checked in today.";

// One host-region check-in per voter per day. The combined region (USA + Canada
// + Mexico) is a single battlefield; the vote just records which eligible nation
// the supporter backs today.
export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const slug = (body.slug || "").toLowerCase().trim();
  const voter_key = (body.voter_key || "").trim().slice(0, 80);
  const supporter_id =
    body.supporter_id && UUID_RE.test(body.supporter_id) ? body.supporter_id : null;
  const today = todayISO();
  const date = (body.date || today).trim();

  if (!slug || !voter_key) {
    return NextResponse.json({ error: "Missing nation or voter key." }, { status: 400 });
  }

  // Anti-abuse: cap check-in attempts per client (ip+ua hash).
  const limit = rateLimit(`vote:${clientHash(req)}`, 10, 60_000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "You're going too fast. Please wait a moment." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } }
    );
  }

  // Daily reset: only today's battle accepts check-ins.
  if (date !== today) {
    return NextResponse.json({ error: "This battle has closed." }, { status: 400 });
  }

  // Eligibility is driven by the real fixtures data layer (not sample previews).
  if (realFixturesOn(today).length === 0) {
    // No real fixtures today — preview only, nothing is recorded.
    return NextResponse.json({ ok: true, slug, recorded: false, preview: true });
  }
  if (!eligibleSlugsOn(today).includes(slug)) {
    return NextResponse.json({ error: "That nation isn't playing today." }, { status: 400 });
  }

  const supabase = getAdminClient();
  // No DB configured — accept optimistically so the preview flow works (not stored).
  if (!supabase) return NextResponse.json({ ok: true, slug, recorded: false });

  const { data: nation } = await supabase
    .from("nations")
    .select("id,slug")
    .eq("slug", slug)
    .maybeSingle();
  if (!nation) return NextResponse.json({ error: "Unknown nation." }, { status: 400 });

  // Enforce one check-in per voter per day (also guarded by a DB unique index).
  const { data: existing } = await supabase
    .from("daily_host_votes")
    .select("nation_id")
    .eq("vote_date", today)
    .eq("voter_key", voter_key)
    .maybeSingle();
  if (existing) {
    const { data: prev } = await supabase
      .from("nations")
      .select("slug")
      .eq("id", existing.nation_id as string)
      .maybeSingle();
    return NextResponse.json(
      { ok: false, already: true, message: ALREADY, slug: prev?.slug ?? slug },
      { status: 409 }
    );
  }

  // Also enforce one check-in per supporter per day (across devices) when known.
  if (supporter_id) {
    const { data: bySupporter } = await supabase
      .from("daily_host_votes")
      .select("nation_id")
      .eq("vote_date", today)
      .eq("supporter_id", supporter_id)
      .limit(1)
      .maybeSingle();
    if (bySupporter) {
      const { data: prev } = await supabase
        .from("nations")
        .select("slug")
        .eq("id", bySupporter.nation_id as string)
        .maybeSingle();
      return NextResponse.json(
        { ok: false, already: true, message: ALREADY, slug: prev?.slug ?? slug },
        { status: 409 }
      );
    }
  }

  const row = { vote_date: today, nation_id: nation.id, voter_key, supporter_id };
  let { error: insErr } = await supabase.from("daily_host_votes").insert(row);
  // If a stale/unknown supporter_id trips the FK, retry detached from supporter.
  if (insErr && supporter_id) {
    const retry = await supabase.from("daily_host_votes").insert({ ...row, supporter_id: null });
    insErr = retry.error;
  }
  if (insErr) {
    // Unique violation (race) — treat as an existing check-in.
    return NextResponse.json(
      { ok: false, already: true, message: ALREADY, slug },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true, slug, recorded: true });
}
