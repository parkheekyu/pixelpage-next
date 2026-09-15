import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/leads/webhook
 * Header: Authorization: Bearer <LEAD_WEBHOOK_SECRET>
 * Body: 고객사 대시보드/webhook/payload_spec.md 의 표준 페이로드
 *  {
 *    "client": "speech",            // projects.slug
 *    "landing_id": "lp-a",
 *    "landing_url": "https://...",
 *    "submitted_at": "2026-09-12T21:05:33+09:00",
 *    "name": "홍길동", "phone": "010-1234-5678", "email": "", "message": "",
 *    "utm_source": "meta", "utm_medium": "cpc", "utm_campaign": "", "utm_content": "", "utm_term": ""
 *  }
 * 중복 규칙: 같은 프로젝트 안에서 연락처(숫자만)가 같으면 is_duplicate=true + original_lead_id 연결. 버리지 않는다.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.LEAD_WEBHOOK_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: "LEAD_WEBHOOK_SECRET 미설정" }, { status: 500 });
  const auth = req.headers.get("authorization") ?? "";
  if (auth !== `Bearer ${secret}`) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 }); }

  const str = (k: string) => { const v = body[k]; return v == null ? "" : String(v).trim(); };
  const client = str("client");
  const phone = str("phone");
  if (!client || !phone) return NextResponse.json({ ok: false, error: "client, phone 필수" }, { status: 400 });

  const admin = createAdminClient();
  const { data: project } = await admin.from("projects").select("id").eq("slug", client).maybeSingle();
  if (!project) return NextResponse.json({ ok: false, error: `unknown client: ${client}` }, { status: 404 });

  const phoneNorm = phone.replace(/[^0-9]/g, "");
  const { data: original } = await admin
    .from("leads").select("id").eq("project_id", project.id).eq("phone_norm", phoneNorm)
    .order("submitted_at", { ascending: true }).limit(1).maybeSingle();

  const submitted = str("submitted_at");
  const landingUrl = str("landing_url");
  const landingId = str("landing_id") || (landingUrl ? landingUrl.split("?")[0].split("/").filter(Boolean).pop() ?? null : null);

  const row = {
    project_id: project.id,
    submitted_at: submitted && !Number.isNaN(Date.parse(submitted)) ? new Date(submitted).toISOString() : new Date().toISOString(),
    name: str("name") || null,
    phone,
    phone_norm: phoneNorm,
    email: str("email") || null,
    message: str("message") || null,
    utm_source: (str("utm_source") || "unknown").toLowerCase(),
    utm_medium: str("utm_medium") || null,
    utm_campaign: str("utm_campaign") || null,
    utm_content: str("utm_content") || null,
    utm_term: str("utm_term") || null,
    landing_id: landingId,
    landing_url: landingUrl || null,
    status: original ? "드랍" : "신규",
    drop_reason: original ? "중복" : null,
    is_duplicate: !!original,
    original_lead_id: original?.id ?? null,
    raw_payload: body,
  };

  const { data, error } = await admin.from("leads").insert(row).select("id").single();
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id, duplicate: !!original, original_lead_id: original?.id ?? null });
}
