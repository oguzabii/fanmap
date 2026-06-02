import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

export const runtime = "nodejs";

type Body = {
  product_slug?: string;
  source_page?: string;
  nation_slug?: string | null;
  supporter_id?: string | null;
};

export async function POST(req: Request) {
  const supabase = getAdminClient();
  // If Supabase isn't configured we accept and discard — tracking should never break checkout.
  if (!supabase) return NextResponse.json({ ok: true, persisted: false });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const product_slug = (body.product_slug || "").trim().slice(0, 64);
  const source_page = (body.source_page || "").trim().slice(0, 64);
  if (!product_slug || !source_page) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let nation_id: string | null = null;
  if (body.nation_slug) {
    const { data } = await supabase
      .from("nations")
      .select("id")
      .eq("slug", body.nation_slug)
      .maybeSingle();
    if (data) nation_id = data.id as string;
  }

  await supabase.from("shop_clicks").insert({
    product_slug,
    source_page,
    nation_id,
    supporter_id: body.supporter_id || null
  });

  return NextResponse.json({ ok: true, persisted: true });
}
