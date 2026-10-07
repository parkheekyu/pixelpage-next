import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** 단축 링크 이동: /s/<id> → 원래 주소 */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  if (!/^[a-z0-9]{4,12}$/.test(id)) return new NextResponse("not found", { status: 404 });
  const db = createAdminClient();
  const { data } = await db.from("short_links").select("url,hits").eq("id", id).maybeSingle();
  if (!data) return new NextResponse("링크를 찾을 수 없습니다", { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } });
  db.from("short_links").update({ hits: (data.hits ?? 0) + 1 }).eq("id", id).then(() => {});
  return NextResponse.redirect(data.url, 302);
}
