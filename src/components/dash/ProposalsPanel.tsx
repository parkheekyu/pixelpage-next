"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Bot, Check, MessageSquare, RefreshCw, Send, X } from "lucide-react";
import { decideProposal, requestCreativeProposal, reviseProposal } from "@/app/app/proposal-actions";
import type { Engine, MetaGoalLike, Proposal } from "@/lib/dash/types";

const FORMATS: [string, string][] = [["image_1x1", "이미지 1:1"], ["video_9x16", "세로 영상 9:16"], ["carousel", "캐러셀"]];
const FMT: Record<string, string> = Object.fromEntries(FORMATS);
const fmt = (iso: string) => new Date(iso).toLocaleString("ko-KR", { timeZone: "Asia/Seoul", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });

/** 광고 소재 제안 봇: 요청 → 봇 제안(카드) → 승인 / 반려 코멘트 → 재제안 */
export default function ProposalsPanel({ projectId, proposals, isStaff, goal }: { projectId: string; proposals: Proposal[]; isStaff: boolean; goal: MetaGoalLike }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [formats, setFormats] = useState<string[]>(["image_1x1", "video_9x16"]);
  const [count, setCount] = useState(4); const [notes, setNotes] = useState(""); const [engine, setEngine] = useState<Engine>("codex");
  const [fb, setFb] = useState<Record<string, string>>({});
  const waiting = proposals.some((p) => p.status === "queued" || p.status === "running");
  useEffect(() => { if (!waiting) return; const t = setInterval(() => router.refresh(), 8000); return () => clearInterval(t); }, [waiting, router]);
  const req = () => start(async () => { const r = await requestCreativeProposal(projectId, { goal, formats, count, notes, engine }); setMsg(r.ok ? { ok: true, text: r.message ?? "요청됨" } : { ok: false, text: r.error }); router.refresh(); });
  const decide = (p: Proposal, d: "approved" | "rejected") => start(async () => { const r = await decideProposal(projectId, p.id, d, fb[p.id]); if (!r.ok) setMsg({ ok: false, text: r.error }); router.refresh(); });
  const revise = (p: Proposal) => { const f = (fb[p.id] ?? "").trim(); if (!f) { setMsg({ ok: false, text: "어떻게 바꿀지 코멘트를 적어 주세요." }); return; } start(async () => { const r = await reviseProposal(projectId, p.id, f); setMsg(r.ok ? { ok: true, text: "코멘트를 반영해 다시 제안합니다." } : { ok: false, text: r.error }); router.refresh(); }); };
  const statusLabel: Record<Proposal["status"], string> = { queued: "대기", running: "작성 중", proposed: "제안", approved: "승인", rejected: "반려", error: "실패" };

  return (
    <div className="card" style={{ marginTop: 12 }}>
      <div className="report-head">
        <div><h2 style={{ display: "inline" }}><Bot className="ico" aria-hidden /> 소재 제안 봇</h2> <span className="hint" style={{ display: "inline", marginLeft: 8 }}>리서치 보고서와 위너 소재를 근거로 새 소재안을 제안하고, 코멘트를 받아 다시 제안합니다</span></div>
        <span className="sp" />
        {isStaff && (
          <>
            <span className="tb" style={{ gap: 8 }}>{FORMATS.map(([k, l]) => <label key={k} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13 }}><input type="checkbox" checked={formats.includes(k)} onChange={(e) => setFormats((f) => (e.target.checked ? [...f, k] : f.filter((x) => x !== k)))} /> {l}</label>)}</span>
            <select value={count} onChange={(e) => setCount(+e.target.value)}>{[3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}개</option>)}</select>
            <select value={engine} onChange={(e) => setEngine(e.target.value as Engine)}><option value="codex">Codex 봇</option><option value="claude">Claude 봇</option></select>
            <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="요청 메모 (예: 가격 언급 없이, 후기 중심)" style={{ minWidth: 220 }} />
            <button type="button" className="btn primary" disabled={pending} onClick={req}><Send className="ico" aria-hidden /> 제안 요청</button>
          </>
        )}
      </div>
      {msg && <div className={`msg ${msg.ok ? "ok" : "err"}`}>{msg.text}</div>}
      {proposals.length === 0 && <div className="hint" style={{ margin: 0 }}>아직 제안이 없습니다. 오른쪽 위에서 포맷과 개수를 고르고 제안 요청을 누르세요.</div>}
      {proposals.map((p) => (
        <div key={p.id} className="prop">
          <div className="prop-head">
            <span className={`integ-state ${p.status === "approved" ? "on" : p.status === "rejected" || p.status === "error" ? "" : "need"}`}>{statusLabel[p.status]}</span>
            <b>{p.title ?? "소재 제안"}</b>
            <span className="hint" style={{ margin: 0 }}>{fmt(p.created_at)} · {p.engine === "codex" ? "Codex" : "Claude"} · {(p.brief?.formats ?? []).map((f) => FMT[f] ?? f).join(", ")}{p.parent_id ? " · 재제안" : ""}</span>
          </div>
          {(p.brief as { summary?: string } | null)?.summary && <div className="prop-summary">{(p.brief as { summary?: string }).summary}</div>}
          {p.status === "error" && <div className="msg err">실패: {p.error}</div>}
          {(p.status === "queued" || p.status === "running") && <div className="msg ok">봇이 작성 중입니다. 로컬 워커가 켜져 있으면 1~3분 안에 올라옵니다.</div>}
          {p.feedback && p.status === "rejected" && <div className="prop-fb"><MessageSquare className="ico" aria-hidden /> 코멘트: {p.feedback}</div>}
          {p.variants && (
            <div className="prop-grid">
              {p.variants.map((v) => (
                <div key={v.id} className="prop-card">
                  <div className="prop-card-head"><span className="pill">{v.id}</span> <b>{v.angle}</b> <small>{FMT[v.format] ?? v.format}</small></div>
                  <div className="prop-headline">{v.headline}</div>
                  <div className="prop-body">{v.primary_text}</div>
                  <div className="prop-cta">CTA · {v.cta}</div>
                  <div className="prop-kv"><b>비주얼</b><span>{v.visual}</span></div>
                  {v.hook && <div className="prop-kv"><b>첫 3초</b><span>{v.hook}</span></div>}
                  <div className="prop-kv why"><b>근거</b><span>{v.why}</span></div>
                </div>
              ))}
            </div>
          )}
          {isStaff && p.status === "proposed" && (
            <div className="form-row" style={{ marginTop: 10, alignItems: "center" }}>
              <input type="text" value={fb[p.id] ?? ""} onChange={(e) => setFb({ ...fb, [p.id]: e.target.value })} placeholder="코멘트 (반려·재제안 시 봇에게 전달)" style={{ flex: 1, minWidth: 260 }} />
              <button type="button" className="btn primary" disabled={pending} onClick={() => decide(p, "approved")}><Check className="ico" aria-hidden /> 승인</button>
              <button type="button" className="btn" disabled={pending} onClick={() => revise(p)}><RefreshCw className="ico" aria-hidden /> 코멘트 반영해 재제안</button>
              <button type="button" className="btn danger" disabled={pending} onClick={() => decide(p, "rejected")}><X className="ico" aria-hidden /> 반려</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
