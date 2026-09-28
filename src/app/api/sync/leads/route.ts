import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runAllLeadSync } from "@/lib/dash/leadsync-run";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** 시트·에어테이블 양방향 동기화 (워커가 2분마다 호출). Authorization: Bearer LEAD_WEBHOOK_SECRET */
export async function POST(req: NextRequest) {
  const secret = process.env.LEAD_WEBHOOK_SECRET;
  if (!secret || (req.headers.get("authorization") ?? "") !== `Bearer ${secret}`) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const t0 = Date.now();
  const results = await runAllLeadSync(createAdminClient());
  return NextResponse.json({ ok: true, ms: Date.now() - t0, results });
}
