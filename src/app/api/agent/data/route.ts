import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { queryLeads } from "@/lib/dash/leads-query";
import { defaultQuery } from "@/lib/dash/leads-types";
import { getMetaSnapshot } from "@/lib/dash/analysis-data";
import { rankWinners, snapshotToText, type MetaGoal } from "@/lib/integrations/meta";
import { extractLanding, landingToText } from "@/lib/integrations/landing";
import { claritySummary } from "@/lib/integrations/clarity";
import { ga4Summary, hasGoogleServiceAccount } from "@/lib/integrations/ga4";
import { createProposalJob } from "@/lib/dash/proposals";
import { isDate } from "@/lib/dash/dates";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * AI 직원용 데이터 창구. 워커(scripts/dash-data.mjs)가 Bearer LEAD_WEBHOOK_SECRET 로 호출한다.
 * 대시보드 코드를 그대로 재사용해 리드·광고·리서치·랜딩 데이터를 텍스트로 돌려준다.
 */
type Db = ReturnType<typeof createAdminClient>;
const text = (s: string) => new NextResponse(s, { status: 200, headers: { "content-type": "text/plain; charset=utf-8" } });
const W = (n: number) => "₩" + Math.round(n || 0).toLocaleString("ko-KR");

async function findProject(db: Db, q: string) {
  const { data } = await db.from("projects").select("id,name,slug,landing_url,research_input,active").eq("active", true);
  const list = data ?? [];
  const s = q.trim().toLowerCase();
  return list.find((p) => p.name.toLowerCase() === s || p.slug === s) ?? list.find((p) => p.name.toLowerCase().includes(s) || s.includes(p.name.toLowerCase())) ?? null;
}

export async function GET(req: NextRequest) {
  const secret = process.env.LEAD_WEBHOOK_SECRET;
  if (!secret || (req.headers.get("authorization") ?? "") !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const sp = req.nextUrl.searchParams;
  const op = sp.get("op") ?? "";
  const db = createAdminClient();
  try {
    if (op === "projects") {
      const { data } = await db.from("projects").select("id,name,slug,landing_url,active").order("name");
      const { data: integ } = await db.from("project_integrations").select("project_id,meta_ad_account_id,meta_goal,slack_channel_id");
      const im = new Map((integ ?? []).map((i) => [i.project_id, i]));
      return text((data ?? []).filter((p) => p.active).map((p) => { const i = im.get(p.id); return `• ${p.name} (slug ${p.slug})${p.landing_url ? ` · 랜딩 ${p.landing_url}` : ""}${i?.meta_ad_account_id ? ` · 메타 연동 (목표: ${i.meta_goal === "purchase" ? "구매" : "리드"})` : " · 메타 미연동"}${i?.slack_channel_id ? ` · 슬랙 채널 ${i.slack_channel_id}` : ""}`; }).join("\n") || "고객사 없음");
    }
    const pname = sp.get("project") ?? "";
    const p = pname ? await findProject(db, pname) : null;
    if (!p) return text(`고객사 "${pname}" 를 찾지 못했습니다. 'projects' 로 목록을 확인하세요.`);
    const { data: integ } = await db.from("project_integrations").select("meta_ad_account_id,meta_goal,ga4_property_id,clarity_api_token,slack_channel_id").eq("project_id", p.id).maybeSingle();
    const goal: MetaGoal = integ?.meta_goal === "purchase" ? "purchase" : "lead";

    if (op === "project") {
      const r = (p.research_input ?? {}) as Record<string, string>;
      const lines = [`[고객사] ${p.name} (id ${p.id})`, `랜딩: ${p.landing_url ?? "-"}`, `전환 목표: ${goal === "purchase" ? "구매/매출" : "리드/상담"}`, `메타 광고 계정: ${integ?.meta_ad_account_id ?? "미연동"}`, `GA4: ${integ?.ga4_property_id ?? "-"} · Clarity: ${integ?.clarity_api_token ? "연동" : "-"}`];
      for (const [k, label] of [["product", "상품/서비스"], ["target", "타깃"], ["offer", "오퍼"], ["proof", "보유 증거"], ["notes", "주의"]] as const) if (r[k]) lines.push(`${label}: ${r[k]}`);
      return text(lines.join("\n"));
    }
    if (op === "leads") {
      const q = defaultQuery();
      if (isDate(sp.get("from"))) q.from = sp.get("from")!; if (isDate(sp.get("to"))) q.to = sp.get("to")!;
      const view = sp.get("view"); if (view && ["all", "todo", "conv", "need", "drop", "dup"].includes(view)) q.view = view as typeof q.view;
      q.q = sp.get("q") ?? ""; q.limit = Math.min(200, Number(sp.get("limit") ?? 30) || 30);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const page = await queryLeads(db as any, p.id, q);
      const s = page.summary;
      const head = `[${p.name} 리드 ${q.from}~${q.to}] 전체 ${s.all} · 미처리(신규+연락중) ${s.todo} · 전환 ${s.conv} · 매출 미입력 ${s.need} · 드랍 ${s.drop} · 중복 ${s.dup} · 매출 ${W(s.revenue)}`;
      const rows = page.rows.map((l) => `- ${String(l.submitted_at).slice(0, 16).replace("T", " ")} ${l.name ?? "-"} ${l.phone ?? ""} · ${l.status}${l.utm_source ? ` · ${l.utm_source}` : ""}${l.industry ? ` · ${l.industry}` : ""}${l.budget ? ` · ${l.budget}` : ""}${l.revenue ? ` · 매출 ${W(l.revenue)}` : ""}${l.drop_reason ? ` · 드랍: ${l.drop_reason}` : ""}${l.memo ? ` · 메모: ${String(l.memo).slice(0, 60)}` : ""}${l.message ? ` · "${String(l.message).replace(/\s+/g, " ").slice(0, 80)}"` : ""}`);
      return text(`${head}\n(표시 ${rows.length}/${page.total}건, view=${q.view})\n${rows.join("\n")}`);
    }
    if (op === "meta") {
      if (!integ?.meta_ad_account_id) return text(`${p.name}: 메타 광고 계정 미연동`);
      if (!process.env.META_ACCESS_TOKEN) return text("META_ACCESS_TOKEN 미설정");
      const preset = ["last_7d", "last_14d", "last_30d", "last_90d"].includes(sp.get("preset") ?? "") ? sp.get("preset")! : "last_30d";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const r = await getMetaSnapshot(db as any, p.id, integ.meta_ad_account_id, preset, sp.get("refresh") === "1");
      const winners = rankWinners(r.snapshot, goal, 6);
      return text(`[${p.name} 메타 광고 ${preset}] (조회 ${r.cached_at.slice(0, 16)}, 전환 목표 ${goal})\n${snapshotToText({ ...r.snapshot, winners }, goal)}`);
    }
    if (op === "research" || op === "analyses") {
      const kind = op === "research" ? "research" : (sp.get("kind") ?? "ads");
      const { data } = await db.from("analyses").select("id,title,status,created_at,result_md").eq("project_id", p.id).eq("kind", kind).order("created_at", { ascending: false }).limit(5);
      const list = data ?? [];
      const latest = list.find((a) => a.status === "done");
      const idx = list.map((a) => `- ${String(a.created_at).slice(0, 10)} ${a.title ?? kind} (${a.status})`).join("\n");
      return text(`[${p.name} ${kind} 보고서 목록]\n${idx || "없음"}\n\n[최신 보고서]\n${latest?.result_md ? String(latest.result_md).slice(0, Number(sp.get("max") ?? 30000)) : "완료된 보고서 없음"}`);
    }
    if (op === "landing") {
      if (!p.landing_url) return text(`${p.name}: 랜딩 URL 없음`);
      const parts: string[] = [];
      try { parts.push(landingToText(await extractLanding(p.landing_url))); } catch (e) { parts.push(`랜딩 추출 실패: ${(e as Error).message}`); }
      if (integ?.ga4_property_id && hasGoogleServiceAccount()) { try { parts.push("[GA4 28일]\n" + JSON.stringify(await ga4Summary(integ.ga4_property_id, 28)).slice(0, 4000)); } catch (e) { parts.push(`GA4 실패: ${(e as Error).message}`); } }
      if (integ?.clarity_api_token) { try { parts.push("[Clarity 3일]\n" + JSON.stringify(await claritySummary(integ.clarity_api_token, 3)).slice(0, 4000)); } catch (e) { parts.push(`Clarity 실패: ${(e as Error).message}`); } }
      return text(parts.join("\n\n"));
    }
    if (op === "proposals") {
      const { data } = await db.from("proposals").select("id,status,title,feedback,variants,created_at").eq("project_id", p.id).order("created_at", { ascending: false }).limit(8);
      return text((data ?? []).map((x) => `- ${String(x.created_at).slice(0, 16).replace("T", " ")} [${x.status}] ${x.title ?? ""} (id ${x.id})${x.feedback ? ` · 코멘트: ${x.feedback.slice(0, 100)}` : ""}\n  ${((x.variants ?? []) as { id: string; angle: string; headline: string }[]).map((v) => `${v.id}. ${v.angle} — ${v.headline}`).join(" / ")}`).join("\n") || "제안 없음");
    }
    if (op === "propose") {
      const count = Number(sp.get("count") ?? 4) || 4;
      const formats = (sp.get("formats") ?? "image_1x1,video_9x16").split(",").filter(Boolean);
      const notes = sp.get("notes") ?? undefined; const parent = sp.get("parent") ?? undefined;
      const slackCtx = sp.get("channel") ? { channel: sp.get("channel")!, thread_ts: sp.get("thread") ?? undefined } : undefined;
      const r = await createProposalJob(db, p.id, { formats, count, notes, engine: (sp.get("engine") as "claude" | "codex") ?? "codex" }, { parentId: parent, feedback: parent ? notes : undefined, requestedBy: sp.get("by") ?? "AI 직원", slack: slackCtx });
      return text(`제안 작업 등록 완료 (proposal ${r.id}). 워커가 처리 후 ${slackCtx?.thread_ts ? "이 스레드" : "고객사 채널"}에 게시합니다 (1~3분).`);
    }
    return text(`알 수 없는 op: ${op}`);
  } catch (e) { return text(`오류: ${(e as Error).message}`); }
}
