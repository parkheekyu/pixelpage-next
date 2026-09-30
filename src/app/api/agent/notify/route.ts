import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { botFor, slack } from "@/lib/integrations/slack";
import team from "../../../../../agents/employees.json";

export const dynamic = "force-dynamic";

/**
 * 외부 CLI/스크립트(메타광고AI 등) → 담당 직원이 슬랙에 알림.
 * POST { project: "비포레스트"|slug, text: "무엇이 어떻게 바뀌었는지", employee?: "doyun", mode?: "say"|"raw", thread_ts?: string }
 *   mode "say"(기본): 담당 직원이 맥락을 보고 자기 말투로 짧게 전달 (워커가 처리, 30초~1분)
 *   mode "raw": 받은 문장을 그대로 담당 직원 계정으로 게시 (즉시)
 * Authorization: Bearer LEAD_WEBHOOK_SECRET
 */
type Emp = { id: string; name: string; project?: string | null; default?: boolean };
export async function POST(req: NextRequest) {
  const secret = process.env.LEAD_WEBHOOK_SECRET;
  if (!secret || (req.headers.get("authorization") ?? "") !== `Bearer ${secret}`) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { project?: string; text?: string; employee?: string; mode?: string; thread_ts?: string; source?: string };
  const text = (body.text ?? "").trim(); if (!text) return NextResponse.json({ ok: false, error: "text 필요" }, { status: 400 });
  const db = createAdminClient();
  const key = (body.project ?? "").trim().toLowerCase();
  const { data: projects } = await db.from("projects").select("id,name,slug").eq("active", true);
  const p = (projects ?? []).find((x) => x.name.toLowerCase() === key || x.slug === key) ?? (projects ?? []).find((x) => key && (x.name.toLowerCase().includes(key) || key.includes(x.name.toLowerCase())));
  if (!p) return NextResponse.json({ ok: false, error: `고객사 "${body.project}" 를 찾지 못함` }, { status: 404 });
  const emps = team.employees as Emp[];
  const emp = emps.find((e) => e.id === body.employee) ?? emps.find((e) => e.project === p.name) ?? emps.find((e) => e.default)!;
  const { data: integ } = await db.from("project_integrations").select("slack_channel_id").eq("project_id", p.id).maybeSingle();
  const channel = integ?.slack_channel_id || process.env.SLACK_DEFAULT_CHANNEL;
  if (!channel) return NextResponse.json({ ok: false, error: "고객사 슬랙 채널 미설정" }, { status: 400 });
  if (body.mode === "raw") {
    const bot = await botFor(db, emp.id);
    const r = await slack<{ ts: string }>("chat.postMessage", { channel, text, ...(body.thread_ts ? { thread_ts: body.thread_ts } : {}) }, bot?.bot_token);
    await db.from("agent_messages").upsert({ channel, thread_ts: body.thread_ts ?? null, ts: r.ts, employee_id: emp.id, user_name: emp.name, project_id: p.id, text }, { onConflict: "channel,ts" });
    return NextResponse.json({ ok: true, mode: "raw", employee: emp.id, channel, ts: r.ts });
  }
  const { data: job } = await db.from("agent_jobs").insert({ project_id: p.id, kind: "employee_turn", engine: "claude", payload: { employee: emp.id, channel, channel_type: "channel", thread_ts: body.thread_ts ?? null, text, notify: true, source: body.source ?? "external", user_name: body.source ?? "시스템", depth: 0, project_id: p.id } }).select("id").single();
  return NextResponse.json({ ok: true, mode: "say", employee: emp.id, channel, job_id: job?.id });
}
