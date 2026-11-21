import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createMcp } from "@/lib/dash/mcp-core.mjs";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * 외부 AI(ChatGPT 등)용 대시보드 MCP 창구. 주소 끝의 토큰이 곧 열쇠다: https://pixelpage.co.kr/api/mcp/<MCP_TOKEN>
 * 토큰을 아는 쪽은 대시보드 데이터를 전부 읽고 고치고 지울 수 있으므로 주소를 남에게 보이지 않는다.
 * 유출되면 Vercel 의 MCP_TOKEN 값을 바꾸면 이전 주소는 바로 막힌다.
 */
function allowed(token: string) {
  const want = process.env.MCP_TOKEN ?? "";
  if (want.length < 32) return false; // 설정이 없거나 너무 짧으면 아예 닫아 둔다
  const a = Buffer.from(token), b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  if (!allowed((await params).token)) return NextResponse.json({ error: "not found" }, { status: 404 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "parse error" } }, { status: 400 }); }
  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { db: { schema: "dash" }, auth: { persistSession: false } });
  const handle = createMcp({ db, site: req.nextUrl.origin, secret: process.env.LEAD_WEBHOOK_SECRET });
  if (Array.isArray(body)) {
    const out = (await Promise.all(body.map((m) => handle(m)))).filter(Boolean);
    return out.length ? NextResponse.json(out) : new NextResponse(null, { status: 202 });
  }
  const res = await handle(body);
  return res ? NextResponse.json(res) : new NextResponse(null, { status: 202 });
}

// 서버가 먼저 보내는 알림은 없다. 스트림 연결 요청은 받지 않는다.
export function GET() { return new NextResponse(null, { status: 405, headers: { allow: "POST" } }); }
export function DELETE() { return new NextResponse(null, { status: 405, headers: { allow: "POST" } }); }
