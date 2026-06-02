import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { adminToken, safeEqual } from "@/lib/admin-auth";

export const runtime = "nodejs";

// Archive a day's combined host-region battle into daily_host_snapshots.
// Admin-guarded. The daily battle itself resets automatically by date — this
// just freezes the winner + tallies for the archive. Defaults to the previous
// UTC day (run it shortly after 00:00 UTC, e.g. from a scheduled job).
export async function POST(req: Request) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ error: "ADMIN_PASSWORD not configured." }, { status: 500 });
  }

  let body: { password?: string; date?: string } = {};
  try {
    body = await req.json();
  } catch {
    /* allow empty body + cookie auth */
  }
  const cookiePw = req.headers.get("cookie")?.match(/fanmap_admin=([^;]+)/)?.[1];
  // Accept either the raw admin password (server-to-server / curl) or a valid
  // admin session cookie token. Constant-time comparison; no raw secret stored.
  if (!safeEqual(body.password, expected) && !safeEqual(cookiePw, adminToken(expected))) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const supabase = getAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured." }, { status: 500 });
  }

  const date = (body.date || prevDayISO()).trim();

  const { data: matches } = await supabase
    .from("matches")
    .select("nation_a_id,nation_b_id")
    .eq("match_date", date);
  const idSet = new Set<string>();
  for (const m of matches ?? []) {
    idSet.add(m.nation_a_id as string);
    idSet.add(m.nation_b_id as string);
  }

  const { data: votes } = await supabase
    .from("daily_host_votes")
    .select("nation_id")
    .eq("vote_date", date)
    .limit(100000);
  const counts = new Map<string, number>();
  for (const v of votes ?? []) {
    const id = v.nation_id as string;
    counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  const ids = Array.from(new Set<string>([...idSet, ...counts.keys()]));
  const slugById = new Map<string, string>();
  if (ids.length) {
    const { data: nationRows } = await supabase.from("nations").select("id,slug").in("id", ids);
    for (const n of nationRows ?? []) slugById.set(n.id as string, n.slug as string);
  }

  const results = Array.from(counts.entries())
    .map(([id, v]) => ({ slug: slugById.get(id) ?? "unknown", votes: v }))
    .sort((a, b) => b.votes - a.votes);
  const total = results.reduce((s, r) => s + r.votes, 0);
  const winnerEntry = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0];
  const winnerId = winnerEntry ? winnerEntry[0] : null;

  const { error } = await supabase.from("daily_host_snapshots").upsert(
    {
      snapshot_date: date,
      winner_nation_id: winnerId,
      total_votes: total,
      results
    },
    { onConflict: "snapshot_date" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    date,
    total_votes: total,
    winner: winnerId ? slugById.get(winnerId) ?? null : null,
    results
  });
}

function prevDayISO(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}
