import { NextRequest, NextResponse } from "next/server";
import { publishColumn, type PublishInput } from "@/lib/notion-publish";

/**
 * POST /api/columns/publish
 * Header: Authorization: Bearer <COLUMN_PUBLISH_SECRET>
 *
 * Body 예시:
 *  {
 *    "title": "칼럼 제목",
 *    "slug": "url-slug",
 *    "description": "메타 설명",
 *    "category": "칼럼",
 *    "cover_url": "https://... (선택)",
 *    "status": "Published",              // 기본
 *    "date": "2026-09-09",               // 선택, 기본 오늘
 *    "replace_existing": true,           // 기본 true (같은 slug 아카이브)
 *    "blocks": [
 *      ["p", "'광고비는 쓰는데 왜 문의가 안 늘지..'"],
 *      ["p", "안녕하세요. <b>픽셀페이지</b>입니다."],
 *      ["h2", "왜 이렇게 될까요?"],
 *      ["h3", "이유 1"],
 *      ["p", "본문 내용 ..."],
 *      ["quote", "핵심 문장"],
 *      ["bul", "리스트 항목"],
 *      ["img", "https://.../cover.png", "선택 캡션"],
 *      ["divider"]
 *    ]
 *  }
 *
 * 응답:
 *  { ok: true, url, site_url, slug, archived_previous, id }
 */
export async function POST(req: NextRequest) {
  const secret = process.env.COLUMN_PUBLISH_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: "COLUMN_PUBLISH_SECRET 미설정" },
      { status: 500 },
    );
  }

  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token || token !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: PublishInput;
  try {
    body = (await req.json()) as PublishInput;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  if (!body?.title || !body?.slug || !body?.description || !Array.isArray(body?.blocks)) {
    return NextResponse.json(
      { ok: false, error: "title, slug, description, blocks(array) 필수" },
      { status: 400 },
    );
  }

  try {
    const result = await publishColumn(body);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}

// GET는 헬스체크/문서 안내
export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "POST /api/columns/publish",
    auth: "Authorization: Bearer <COLUMN_PUBLISH_SECRET>",
    required: ["title", "slug", "description", "blocks[]"],
    optional: ["category", "status", "date", "cover_url", "replace_existing"],
    block_types: [
      '["h2", "…"]',
      '["h3", "…"]',
      '["p", "본문 <b>강조</b>"]',
      '["quote", "…"]',
      '["bul", "…"]',
      '["num", "…"]',
      '["img", "https://…", "선택 캡션"]',
      '["divider"]',
    ],
  });
}
