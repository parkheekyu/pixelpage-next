"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Download, RefreshCw, Save, Upload } from "lucide-react";
import { regenerateWebhookToken, saveIntegrations, saveProjectBasic, syncLeads } from "@/app/app/analysis-actions";
import type { ActionResult } from "@/app/app/actions";
import type { Project, ProjectIntegrations } from "@/lib/dash/types";

interface Props { project: Project; integ: ProjectIntegrations | null; env: { meta: boolean; google: boolean; googleEmail: string | null; siteUrl: string } }

export default function SettingsClient({ project, integ, env }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<Record<string, { ok: boolean; text: string }>>({});
  const note = (k: string, r: ActionResult) => setMsg((m) => ({ ...m, [k]: r.ok ? { ok: true, text: r.message ?? "저장됨" } : { ok: false, text: r.error } }));
  const [basic, setBasic] = useState({ name: project.name, landing_url: project.landing_url ?? "" });
  const [f, setF] = useState({ meta_ad_account_id: integ?.meta_ad_account_id ?? "", ga4_property_id: integ?.ga4_property_id ?? "", clarity_project_id: integ?.clarity_project_id ?? "", clarity_api_token: "", google_sheet_id: integ?.google_sheet_id ?? "", google_sheet_tab: integ?.google_sheet_tab ?? "리드", airtable_base_id: integ?.airtable_base_id ?? "", airtable_table: integ?.airtable_table ?? "", airtable_token: "", lead_sync_enabled: integ?.lead_sync_enabled ?? false });
  const [token, setToken] = useState(project.webhook_token ?? "");
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (k: string, v: string) => navigator.clipboard?.writeText(v).then(() => setCopied(k));
  const renderMsg = (k: string) => (msg[k] ? <div className={`msg ${msg[k].ok ? "ok" : "err"}`}>{msg[k].text}</div> : null);
  const saveInteg = (k: string) => start(async () => { const r = await saveIntegrations(project.id, f); note(k, r); setF((x) => ({ ...x, clarity_api_token: "", airtable_token: "" })); router.refresh(); });
  const webhookUrl = `${env.siteUrl}/api/leads/webhook`;
  const curl = `curl -X POST ${webhookUrl} \\\n  -H "Authorization: Bearer ${token}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"name":"홍길동","phone":"010-1234-5678","email":"","message":"","utm_source":"meta","utm_medium":"cpc","utm_campaign":"","utm_content":"","landing_id":"lp-a"}'`;

  return (
    <section className="grid">
      <div className="card c6">
        <h2>기본</h2><div className="sub">이름은 사이드바·보고서에, 랜딩 주소는 랜딩 분석에 쓰입니다. 슬러그: <code>{project.slug}</code></div>
        <div className="form-row">
          <label className="f">고객사 이름<input type="text" value={basic.name} onChange={(e) => setBasic({ ...basic, name: e.target.value })} /></label>
          <label className="f">랜딩페이지 주소<input type="text" value={basic.landing_url} onChange={(e) => setBasic({ ...basic, landing_url: e.target.value })} placeholder="https://example.com/lp" style={{ minWidth: 280 }} /></label>
          <button type="button" className="btn" disabled={pending} style={{ alignSelf: "flex-end" }} onClick={() => start(async () => { note("basic", await saveProjectBasic(project.id, basic)); router.refresh(); })}><Save className="ico" aria-hidden /> 저장</button>
        </div>
        {renderMsg("basic")}
      </div>

      <div className="card c6">
        <h2>광고 · 랜딩 분석 연동</h2><div className="sub">Meta 광고 계정 ID(광고 관리자 주소의 act= 뒤 숫자) · GA4 속성 ID · Clarity(프로젝트 ID, Data Export API 토큰)</div>
        <div className="form-row">
          <label className="f">Meta 광고 계정 ID {env.meta ? "" : "(서버 토큰 미설정)"}<input type="text" value={f.meta_ad_account_id} onChange={(e) => setF({ ...f, meta_ad_account_id: e.target.value })} placeholder="1234567890" /></label>
          <label className="f">GA4 속성 ID {env.google ? "" : "(서버 키 미설정)"}<input type="text" value={f.ga4_property_id} onChange={(e) => setF({ ...f, ga4_property_id: e.target.value })} placeholder="123456789" /></label>
          <label className="f">Clarity 프로젝트 ID<input type="text" value={f.clarity_project_id} onChange={(e) => setF({ ...f, clarity_project_id: e.target.value })} /></label>
          <label className="f">Clarity API 토큰 {integ?.clarity_api_token ? "(저장됨)" : ""}<input type="password" value={f.clarity_api_token} onChange={(e) => setF({ ...f, clarity_api_token: e.target.value })} autoComplete="off" placeholder="바꿀 때만 입력" /></label>
          <button type="button" className="btn" disabled={pending} style={{ alignSelf: "flex-end" }} onClick={() => saveInteg("analysis")}><Save className="ico" aria-hidden /> 저장</button>
        </div>
        {renderMsg("analysis")}
      </div>

      <div className="card c12">
        <h2>리드 연동</h2><div className="sub">리드가 들어오는 길(웹훅)과 나가는 길(구글 시트 · 에어테이블). 내보내기는 새 리드가 들어올 때 자동, 가져오기는 버튼으로.</div>

        <h3 style={{ fontSize: 14, margin: "10px 0 4px" }}>웹훅 (Make · n8n · 폼 빌더 → 이 프로젝트)</h3>
        <div className="sub">이 프로젝트 전용 토큰이라 <code>client</code> 값이 필요 없습니다. 연락처(phone)만 필수.</div>
        <div className="form-row" style={{ marginBottom: 6 }}>
          <label className="f" style={{ flex: 1 }}>URL<input type="text" readOnly value={webhookUrl} /></label>
          <label className="f" style={{ flex: 1 }}>토큰<input type="text" readOnly value={token} /></label>
          <button type="button" className="btn" onClick={() => copy("wh", token)} style={{ alignSelf: "flex-end" }}><Copy className="ico" aria-hidden /> {copied === "wh" ? "복사됨" : "토큰 복사"}</button>
          <button type="button" className="btn" onClick={() => copy("curl", curl)} style={{ alignSelf: "flex-end" }}><Copy className="ico" aria-hidden /> {copied === "curl" ? "복사됨" : "예시 요청 복사"}</button>
          <button type="button" className="btn danger" disabled={pending} style={{ alignSelf: "flex-end" }} onClick={() => { if (confirm("토큰을 재발급하면 기존 연동은 끊깁니다. 계속할까요?")) start(async () => { const r = await regenerateWebhookToken(project.id); if (r.ok && r.token) setToken(r.token); note("wh", r); }); }}><RefreshCw className="ico" aria-hidden /> 재발급</button>
        </div>
        {renderMsg("wh")}

        <h3 style={{ fontSize: 14, margin: "16px 0 4px" }}>구글 시트</h3>
        <div className="sub">{env.google ? <>시트를 <code>{env.googleEmail}</code> 에게 편집자로 공유한 뒤 시트 주소(또는 ID)를 넣으세요. 첫 행에 열 이름이 자동 생성됩니다.</> : "서버에 구글 서비스 계정 키(GA4_SERVICE_ACCOUNT_JSON)가 필요합니다."}</div>
        <div className="form-row">
          <label className="f" style={{ flex: 1 }}>시트 주소 또는 ID<input type="text" value={f.google_sheet_id} onChange={(e) => setF({ ...f, google_sheet_id: e.target.value })} placeholder="https://docs.google.com/spreadsheets/d/…" /></label>
          <label className="f">탭 이름<input type="text" value={f.google_sheet_tab} onChange={(e) => setF({ ...f, google_sheet_tab: e.target.value })} placeholder="리드" /></label>
        </div>

        <h3 style={{ fontSize: 14, margin: "16px 0 4px" }}>에어테이블</h3>
        <div className="sub">개인 액세스 토큰(data.records:read/write) · 베이스 ID(app…) · 테이블 이름. 테이블에 같은 이름의 열이 있어야 값이 들어갑니다: 리드ID, 등록일시, 이름, 연락처, 이메일, 문의내용, 유입매체, 상태, 매출액, 메모 등.</div>
        <div className="form-row">
          <label className="f">토큰 {integ?.airtable_token ? "(저장됨)" : ""}<input type="password" value={f.airtable_token} onChange={(e) => setF({ ...f, airtable_token: e.target.value })} autoComplete="off" placeholder="pat…" /></label>
          <label className="f">베이스 ID 또는 주소<input type="text" value={f.airtable_base_id} onChange={(e) => setF({ ...f, airtable_base_id: e.target.value })} placeholder="appXXXXXXXXXXXXXX" /></label>
          <label className="f">테이블 이름<input type="text" value={f.airtable_table} onChange={(e) => setF({ ...f, airtable_table: e.target.value })} placeholder="리드" /></label>
        </div>

        <div className="form-row" style={{ marginTop: 12, alignItems: "center" }}>
          <label className="f" style={{ flexDirection: "row", alignItems: "center", gap: 6 }}><input type="checkbox" checked={f.lead_sync_enabled} onChange={(e) => setF({ ...f, lead_sync_enabled: e.target.checked })} /> 새 리드가 들어오면 자동으로 내보내기</label>
          <button type="button" className="btn primary" disabled={pending} onClick={() => saveInteg("lead")}><Save className="ico" aria-hidden /> 리드 연동 저장</button>
        </div>
        {renderMsg("lead")}
        <div className="form-row" style={{ marginTop: 10 }}>
          <button type="button" className="btn" disabled={pending || !integ?.google_sheet_id} onClick={() => start(async () => note("sync", await syncLeads(project.id, "sheets", "push")))}><Upload className="ico" aria-hidden /> 시트로 전체 내보내기</button>
          <button type="button" className="btn" disabled={pending || !integ?.google_sheet_id} onClick={() => start(async () => note("sync", await syncLeads(project.id, "sheets", "pull")))}><Download className="ico" aria-hidden /> 시트에서 가져오기</button>
          <button type="button" className="btn" disabled={pending || !integ?.airtable_base_id} onClick={() => start(async () => note("sync", await syncLeads(project.id, "airtable", "push")))}><Upload className="ico" aria-hidden /> 에어테이블로 전체 내보내기</button>
          <button type="button" className="btn" disabled={pending || !integ?.airtable_base_id} onClick={() => start(async () => note("sync", await syncLeads(project.id, "airtable", "pull")))}><Download className="ico" aria-hidden /> 에어테이블에서 가져오기</button>
          {pending && <span className="hint" style={{ marginTop: 0 }}>처리 중…</span>}
        </div>
        {renderMsg("sync")}
        <div className="hint">가져오기는 우리 DB에 없는 연락처만 새 리드로 추가합니다(중복 방지). 시트와 에어테이블 사이 이동은 가져오기 뒤 내보내기 순서로 하면 됩니다.</div>
      </div>
    </section>
  );
}
