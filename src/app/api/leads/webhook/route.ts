import { NextRequest, NextResponse } from "next/server";
import { ingestLead } from "@/lib/dash/ingest";

/**
 * POST /api/leads/webhook
 * Header: Authorization: Bearer <LEAD_WEBHOOK_SECRET>
 * Body: 고객사 대시보드/webhook/payload_spec.md 의 표준 페이로드 (client = projects.slug, phone 필수)
 * 중복 규칙: 같은 프로젝트 안에서 연락처(숫자만)가 같으면 is_duplicate=true + original_lead_id 연결. 버리지 않는다.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.LEAD_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: "LEAD_WEBHOOK_SECRET 미설정" }, { status: 500 });
  if ((req.headers.get("authorization") ?? "") !== `Bearer ${secret}`) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 }); }

  const r = await ingestLead({ ...(body as object), client: String(body.client ?? ""), phone: String(body.phone ?? ""), raw: body });
  if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: r.status });
  return NextResponse.json(r);
}
