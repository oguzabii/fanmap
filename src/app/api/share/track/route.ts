import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";
import { rateLimit, clientHash } from "@/lib/rate-limit";

export const runtime = "nodejs";

type Body = {
  channel?: string;
  asset_type?: string | null;
  nation_slug?: string | null;
  supporter_id?: string | null;
  referral_code?: string | null;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CHANNELS = new Set([
  "whatsapp",
  "instagram",
  "tiktok",
  "facebook",
  "x",
  "copy",
  "download",
  "native"
]);
const ASSET_TYPES = new Set(["link", "poster_story", "poster_square"]);

// Fire-and-forget share tracking. Never blocks the user; silently no-ops
// without Supabase configured.
export async function POST(req: Request) {
  const supabase = getAdminClient();
  if (!supabase) return NextResponse.json({ ok: true, persisted: false });

  // Rate limit: 40 events/min per client (ip+ua hash).
  const limit = rateLimit(`share:${clientHash(req)}`, 40, 60_000);
  if (!limit.ok) return NextResponse.json({ ok: false }, { status: 429 });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // Validate channel against the whitelist — ignore anything else.
  const channel = (body.channel || "").toLowerCase().trim();
  if (!CHANNELS.has(channel)) return NextResponse.json({ ok: false }, { status: 400 });

  // Validate asset_type against the whitelist; unknown values are dropped to null.
  const assetRaw = (body.asset_type || "").toString().toLowerCase().trim();
  const asset_type = ASSET_TYPES.has(assetRaw) ? assetRaw : null;
  const referral_code = (body.referral_code || "").toString().slice(0, 16) || null;
  const supporter_id =
    body.supporter_id && UUID_RE.test(body.supporter_id) ? body.supporter_id : null;

  let nation_id: string | null = null;
  const slug = (body.nation_slug || "").toString().toLowerCase().trim();
  if (slug) {
    const { data } = await supabase
      .from("nations")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (data) nation_id = data.id as string;
  }

  const row = { channel, asset_type, referral_code, supporter_id, nation_id };
  let { error } = await supabase.from("share_events").insert(row);
  if (error && supporter_id) {
    const retry = await supabase.from("share_events").insert({ ...row, supporter_id: null });
    error = retry.error;
  }
  return NextResponse.json({ ok: !error, persisted: !error });
}
