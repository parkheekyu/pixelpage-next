import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/** Slack Web API 최소 래퍼 + 서명 검증 + 제안 메시지 블록 */
const API = "https://slack.com/api";
export const hasSlack = () => !!process.env.SLACK_BOT_TOKEN;

export async function slack<T = Record<string, unknown>>(method: string, body: Record<string, unknown>, tokenOverride?: string | null): Promise<T & { ok: boolean; error?: string }> {
  const token = tokenOverride || process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error("SLACK_BOT_TOKEN 미설정");
  const r = await fetch(`${API}/${method}`, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json; charset=utf-8" }, body: JSON.stringify(body), signal: AbortSignal.timeout(15000) });
  const j = (await r.json()) as T & { ok: boolean; error?: string };
  if (!j.ok) throw new Error(`Slack ${method}: ${j.error ?? r.status}`);
  return j;
}

/** 요청 서명 검증 (Signing Secret) */
export function verifySlack(rawBody: string, timestamp: string | null, signature: string | null, secretOverride?: string | null): boolean {
  const secret = secretOverride || process.env.SLACK_SIGNING_SECRET;
  if (!secret || !timestamp || !signature) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 60 * 5) return false;
  const mine = "v0=" + createHmac("sha256", secret).update(`v0:${timestamp}:${rawBody}`).digest("hex");
  try { return timingSafeEqual(Buffer.from(mine), Buffer.from(signature)); } catch { return false; }
}

/** 직원별 슬랙 앱 자격 (dash.slack_bots). employeeId 가 없거나 미설치면 null */
export interface SlackBot { employee_id: string; app_id: string | null; client_id: string | null; client_secret: string | null; signing_secret: string | null; bot_token: string | null; bot_user_id: string | null }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function botFor(db: any, employeeId: string): Promise<SlackBot | null> {
  const { data } = await db.from("slack_bots").select("*").eq("employee_id", employeeId).maybeSingle();
  return (data as SlackBot | null) ?? null;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function botByApp(db: any, appId: string): Promise<SlackBot | null> {
  const { data } = await db.from("slack_bots").select("*").eq("app_id", appId).maybeSingle();
  return (data as SlackBot | null) ?? null;
}

export interface VariantLike { id: string; angle: string; format: string; headline: string; primary_text: string; cta: string; visual: string; hook?: string; why: string }
const FMT: Record<string, string> = { image_1x1: "이미지 1:1", video_9x16: "세로 영상 9:16", carousel: "캐러셀" };
const cut = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

/** 제안 메시지 (Block Kit). 승인/재제안/반려 버튼 포함 */
export function proposalBlocks(p: { id: string; title: string | null; summary?: string; projectName: string; engine: string; variants: VariantLike[]; status: string; feedback?: string | null; dashboardUrl: string }) {
  const blocks: Record<string, unknown>[] = [
    { type: "header", text: { type: "plain_text", text: `${p.projectName} · 소재 제안 (${p.engine === "codex" ? "Codex 봇" : "Claude 봇"})`, emoji: false } },
    { type: "section", text: { type: "mrkdwn", text: `*이런 형식은 어때요?*${p.summary ? `\n${cut(p.summary, 400)}` : ""}${p.feedback ? `\n\n> 코멘트 반영: ${cut(p.feedback, 200)}` : ""}` } },
  ];
  for (const v of p.variants.slice(0, 6)) {
    blocks.push({ type: "divider" });
    blocks.push({ type: "section", text: { type: "mrkdwn", text: `*${v.id}. ${v.angle}* · ${FMT[v.format] ?? v.format}\n*${cut(v.headline, 120)}*\n${cut(v.primary_text, 600)}\n_CTA: ${v.cta}_` } });
    blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: `*비주얼* ${cut(v.visual, 300)}${v.hook ? `\n*첫 3초* ${cut(v.hook, 200)}` : ""}\n*근거* ${cut(v.why, 300)}` }] });
  }
  blocks.push({ type: "divider" });
  if (p.status === "proposed") {
    blocks.push({ type: "actions", block_id: `proposal:${p.id}`, elements: [
      { type: "button", style: "primary", text: { type: "plain_text", text: "승인" }, action_id: "proposal_approve", value: p.id },
      { type: "button", text: { type: "plain_text", text: "코멘트 반영해 재제안" }, action_id: "proposal_revise", value: p.id },
      { type: "button", style: "danger", text: { type: "plain_text", text: "반려" }, action_id: "proposal_reject", value: p.id, confirm: { title: { type: "plain_text", text: "반려할까요?" }, text: { type: "mrkdwn", text: "이 제안을 반려합니다. 코멘트는 스레드에 남겨 주세요." }, confirm: { type: "plain_text", text: "반려" }, deny: { type: "plain_text", text: "취소" } } },
    ] });
  } else {
    blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: p.status === "approved" ? "✅ 승인됨" : p.status === "rejected" ? "⛔ 반려됨" : `상태: ${p.status}` }] });
  }
  blocks.push({ type: "context", elements: [{ type: "mrkdwn", text: `<${p.dashboardUrl}|대시보드에서 보기> · 스레드에 코멘트를 남기면 봇이 반영합니다` }] });
  return blocks;
}

export function reviseModal(proposalId: string, channel: string, ts: string) {
  return { type: "modal", callback_id: "proposal_revise_submit", private_metadata: JSON.stringify({ proposalId, channel, ts }), title: { type: "plain_text", text: "재제안 코멘트" }, submit: { type: "plain_text", text: "다시 제안 요청" }, close: { type: "plain_text", text: "취소" },
    blocks: [{ type: "input", block_id: "fb", label: { type: "plain_text", text: "어떻게 바꿀까요?" }, element: { type: "plain_text_input", action_id: "text", multiline: true, placeholder: { type: "plain_text", text: "예: 헤드라인을 더 직설적으로, 가격 언급 빼고, 후기 인용 넣어서" } } }] };
}
