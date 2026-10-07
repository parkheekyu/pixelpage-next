import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";
const ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789"; // 헷갈리는 글자 제외
const gen = (n = 6) => Array.from(randomBytes(n), (b) => ALPHABET[b % ALPHABET.length]).join("");

/**
 * 단축 링크 생성 (n8n 등에서 문자 보내기 전에 호출)
 *   POST /api/shortlink  { "url": "https://pixelpage.co.kr/info/plusspeech?..." }   또는  { "path": "/info/plusspeech", "params": {...} }
 *   Authorization: Bearer LEAD_WEBHOOK_SECRET
 *   → { "ok": true, "short": "https://pixelpage.co.kr/s/abc123" }
 */
export async function POST(req: NextRequest) {
  const secret = process.env.LEAD_WEBHOOK_SECRET;
  if (!secret || (req.headers.get("authorization") ?? "") !== `Bearer ${secret}`) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { url?: string; path?: string; params?: Record<string, unknown> };
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pixelpage.co.kr";
  let url = (body.url ?? "").trim();
  if (!url && body.path) {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(body.params ?? {})) { if (v == null || v === "") continue; q.set(k, Array.isArray(v) ? v.map(String).join(", ") : String(v)); }
    url = `${site}${body.path.startsWith("/") ? body.path : "/" + body.path}${q.toString() ? "?" + q.toString() : ""}`;
  }
  if (!/^https?:\/\//.test(url)) return NextResponse.json({ ok: false, error: "url 또는 path 필요" }, { status: 400 });
  if (url.length > 8000) return NextResponse.json({ ok: false, error: "url 이 너무 깁니다" }, { status: 400 });
  const db = createAdminClient();
  for (let i = 0; i < 5; i++) {
    const id = gen();
    const { error } = await db.from("short_links").insert({ id, url });
    if (!error) return NextResponse.json({ ok: true, id, short: `${site}/s/${id}`, url });
  }
  return NextResponse.json({ ok: false, error: "생성 실패" }, { status: 500 });
}
