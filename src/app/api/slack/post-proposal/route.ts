import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { postProposalToSlack } from "@/lib/dash/slack-proposals";

/** 워커가 제안 완료 후 호출: Authorization: Bearer LEAD_WEBHOOK_SECRET, body { proposal_id } */
export async function POST(req: NextRequest) {
  const secret = process.env.LEAD_WEBHOOK_SECRET;
  if (!secret || (req.headers.get("authorization") ?? "") !== `Bearer ${secret}`) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const { proposal_id } = (await req.json().catch(() => ({}))) as { proposal_id?: string };
  if (!proposal_id) return NextResponse.json({ ok: false, error: "proposal_id 필요" }, { status: 400 });
  try { const r = await postProposalToSlack(createAdminClient(), proposal_id); return NextResponse.json({ ok: true, ...r }); }
  catch (e) { return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 }); }
}
