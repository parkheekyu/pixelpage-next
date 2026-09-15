import { NextRequest, NextResponse } from "next/server";
import { ingestLead } from "@/lib/dash/ingest";

/**
 * POST /api/inquiry — 홈페이지 문의 폼 (공개). 자사 프로젝트(slug: pixelpage) 시트에 적재.
 * Body: { form: "consult" | "lp", name, phone, email?, company?, industry?, budget?, services?, marketingStatus?, message?,
 *         utm_source?..utm_term?, landing_id?, landing_url?, website?(허니팟) }
 */
const OWN_SLUG = "pixelpage";

export async function POST(req: NextRequest) {
  let b: Record<string, unknown>;
  try { b = await req.json(); } catch { return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 }); }
  const s = (k: string) => (b[k] == null ? "" : String(b[k]).trim());

  // 봇 허니팟: 숨은 필드가 채워져 있으면 조용히 성공 처리
  if (s("website")) return NextResponse.json({ ok: true, skipped: true });
  if (!s("name") || !s("phone")) return NextResponse.json({ ok: false, error: "이름과 연락처를 입력해 주세요." }, { status: 400 });

  const form = s("form") === "lp" ? "lp" : "consult";
  // 출처는 landing_id(consult/lp)와 utm 으로 구분한다
  const r = await ingestLead({
    client: OWN_SLUG,
    name: s("name"), phone: s("phone"), email: s("email"),
    message: s("message"),
    company: s("company"),
    industry: s("industry") || s("category"),
    budget: s("budget"),
    services: Array.isArray(b.services) ? (b.services as unknown[]).map(String).join(", ") : s("services"),
    marketing_status: s("marketingStatus") || s("marketing_status"),
    utm_source: s("utm_source") || "organic",
    utm_medium: s("utm_medium") || (s("utm_source") ? "" : "site"),
    utm_campaign: s("utm_campaign"), utm_content: s("utm_content"), utm_term: s("utm_term"),
    landing_id: s("landing_id") || form,
    landing_url: s("landing_url") || req.headers.get("referer") || "",
    raw: { ...b, ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null, ua: req.headers.get("user-agent") },
  });
  if (!r.ok) return NextResponse.json({ ok: false, error: r.error }, { status: r.status });
  return NextResponse.json({ ok: true, id: r.id });
}
