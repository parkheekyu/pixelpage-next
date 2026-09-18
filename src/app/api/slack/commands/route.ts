import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slack, verifySlack } from "@/lib/integrations/slack";
import { createProposalJob } from "@/lib/dash/proposals";

/** /pixel 소재 <고객사> [메모]  ·  /pixel 고객사  ·  /pixel 도움 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  if (!verifySlack(raw, req.headers.get("x-slack-request-timestamp"), req.headers.get("x-slack-signature"))) return NextResponse.json({ error: "bad signature" }, { status: 401 });
  const f = new URLSearchParams(raw);
  const text = (f.get("text") ?? "").trim(), channel = f.get("channel_id") ?? "", user = f.get("user_name") ?? f.get("user_id") ?? "slack", responseUrl = f.get("response_url") ?? "";
  const db = createAdminClient();
  const [cmd, ...rest] = text.split(/\s+/);
  if (!cmd || cmd === "도움" || cmd === "help") return NextResponse.json({ response_type: "ephemeral", text: "사용법\n• `/pixel 소재 고객사이름 [요청 메모]` — 소재 제안 봇에게 요청\n• `/pixel 고객사` — 등록된 고객사 목록\n제안이 올라오면 버튼으로 승인·재제안·반려, 스레드에 코멘트를 남기면 봇이 반영합니다." });
  if (cmd === "고객사") { const { data } = await db.from("projects").select("name,slug").eq("active", true).order("name"); return NextResponse.json({ response_type: "ephemeral", text: "고객사: " + (data ?? []).map((p) => `${p.name} (${p.slug})`).join(", ") }); }
  if (cmd === "소재") {
    const name = rest[0] ?? ""; const notes = rest.slice(1).join(" ");
    const { data: projects } = await db.from("projects").select("id,name,slug").eq("active", true);
    const p = (projects ?? []).find((x) => x.name === name || x.slug === name || x.name.includes(name));
    if (!p) return NextResponse.json({ response_type: "ephemeral", text: `고객사 "${name}" 을 찾지 못했습니다. /pixel 고객사 로 목록을 확인하세요.` });
    // 이 채널을 프로젝트 채널로 기억 (없을 때만)
    const { data: integ } = await db.from("project_integrations").select("slack_channel_id").eq("project_id", p.id).maybeSingle();
    if (!integ?.slack_channel_id) await db.from("project_integrations").upsert({ project_id: p.id, slack_channel_id: channel, updated_at: new Date().toISOString() }, { onConflict: "project_id" });
    after(async () => {
      try { await createProposalJob(db, p.id, { formats: ["image_1x1", "video_9x16"], count: 4, notes, engine: "codex" }, { requestedBy: user }); if (responseUrl) await fetch(responseUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ response_type: "in_channel", text: `🤖 ${p.name} 소재 제안을 준비합니다 (요청: ${user}${notes ? `, 메모: ${notes}` : ""}). 1~3분 뒤 이 채널에 올립니다.` }) }); }
      catch (e) { if (responseUrl) await fetch(responseUrl, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ response_type: "ephemeral", text: `요청 실패: ${(e as Error).message}` }) }); }
    });
    return NextResponse.json({ response_type: "ephemeral", text: "접수했습니다…" });
  }
  void slack; return NextResponse.json({ response_type: "ephemeral", text: "알 수 없는 명령입니다. `/pixel 도움`" });
}
