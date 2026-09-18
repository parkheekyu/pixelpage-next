"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, ChevronUp, Copy, Download, RefreshCw, Save, Upload, Webhook } from "lucide-react";
import { regenerateWebhookToken, saveIntegrations, saveProjectBasic, syncLeads } from "@/app/app/analysis-actions";
import type { ActionResult } from "@/app/app/actions";
import type { Project, ProjectIntegrations } from "@/lib/dash/types";
import { BRAND } from "./brand-icons";

interface Props { project: Project; integ: ProjectIntegrations | null; env: { meta: boolean; google: boolean; googleEmail: string | null; siteUrl: string } }

function Brand({ id, size = 28 }: { id: keyof typeof BRAND; size?: number }) {
  const b = BRAND[id];
  return <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={b.title}><path d={b.path} fill={b.hex} /></svg>;
}
/** Microsoft Clarity 는 아이콘 세트에 없어 자체 마크 */
function ClarityMark({ size = 28 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label="Microsoft Clarity"><circle cx="12" cy="12" r="11" fill="#0F6CBD" /><path d="M15.6 8.4a4.4 4.4 0 1 0 0 7.2" stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" /></svg>;
}

type CardState = "on" | "off" | "need";
function Card({ logo, title, desc, state, stateText, open, onToggle, children }: { logo: React.ReactNode; title: string; desc: string; state: CardState; stateText?: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className={`integ ${open ? "open" : ""}`}>
      <button type="button" className="integ-head" onClick={onToggle} aria-expanded={open}>
        <span className="integ-logo">{logo}</span>
        <span className="integ-title"><b>{title}</b><small>{desc}</small></span>
        <span className={`integ-state ${state}`}>{state === "on" && <Check className="ico" aria-hidden />}{stateText ?? (state === "on" ? "연결됨" : state === "need" ? "서버 설정 필요" : "미연결")}</span>
        {open ? <ChevronUp className="ico" aria-hidden /> : <ChevronDown className="ico" aria-hidden />}
      </button>
      {open && <div className="integ-body">{children}</div>}
    </div>
  );
}

export default function SettingsClient({ project, integ, env }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<Record<string, { ok: boolean; text: string }>>({});
  const note = (k: string, r: ActionResult) => setMsg((m) => ({ ...m, [k]: r.ok ? { ok: true, text: r.message ?? "저장됨" } : { ok: false, text: r.error } }));
  const renderMsg = (k: string) => (msg[k] ? <div className={`msg ${msg[k].ok ? "ok" : "err"}`}>{msg[k].text}</div> : null);
  const [open, setOpen] = useState<string | null>(null);
  const toggle = (k: string) => setOpen((o) => (o === k ? null : k));
  const [basic, setBasic] = useState({ name: project.name, landing_url: project.landing_url ?? "" });
  const [f, setF] = useState({ meta_ad_account_id: integ?.meta_ad_account_id ?? "", ga4_property_id: integ?.ga4_property_id ?? "", clarity_project_id: integ?.clarity_project_id ?? "", clarity_api_token: "", google_sheet_id: integ?.google_sheet_id ?? "", google_sheet_tab: integ?.google_sheet_tab ?? "리드", airtable_base_id: integ?.airtable_base_id ?? "", airtable_table: integ?.airtable_table ?? "", airtable_token: "", lead_sync_enabled: integ?.lead_sync_enabled ?? false });
  const [token, setToken] = useState(project.webhook_token ?? "");
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (k: string, v: string) => navigator.clipboard?.writeText(v).then(() => setCopied(k));
  const save = (k: string) => start(async () => { const r = await saveIntegrations(project.id, f); note(k, r); setF((x) => ({ ...x, clarity_api_token: "", airtable_token: "" })); router.refresh(); });
  const webhookUrl = `${env.siteUrl}/api/leads/webhook`;
  const curl = `curl -X POST ${webhookUrl} \\\n  -H "Authorization: Bearer ${token}" \\\n  -H "Content-Type: application/json" \\\n  -d '{"name":"홍길동","phone":"010-1234-5678","email":"","message":"","utm_source":"meta","utm_medium":"cpc","utm_campaign":"","utm_content":"","landing_id":"lp-a"}'`;
  const saveBtn = (k: string) => <button type="button" className="btn primary" disabled={pending} onClick={() => save(k)}><Save className="ico" aria-hidden /> 저장</button>;

  return (
    <>
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="form-row" style={{ alignItems: "flex-end" }}>
          <label className="f">고객사 이름<input type="text" value={basic.name} onChange={(e) => setBasic({ ...basic, name: e.target.value })} /></label>
          <label className="f" style={{ flex: 1, minWidth: 260 }}>랜딩페이지 주소<input type="text" value={basic.landing_url} onChange={(e) => setBasic({ ...basic, landing_url: e.target.value })} placeholder="https://example.com/lp" /></label>
          <span className="hint" style={{ marginTop: 0, paddingBottom: 8 }}>슬러그 <code>{project.slug}</code></span>
          <button type="button" className="btn" disabled={pending} onClick={() => start(async () => { note("basic", await saveProjectBasic(project.id, basic)); router.refresh(); })}><Save className="ico" aria-hidden /> 저장</button>
        </div>
        {renderMsg("basic")}
      </div>

      <h2 style={{ fontSize: 15, margin: "0 0 8px" }}>외부 연동</h2>
      <div className="integ-grid">
        <Card logo={<Brand id="meta" />} title="Meta 광고" desc="캠페인·광고 성과, 위너 분석" state={!env.meta ? "need" : integ?.meta_ad_account_id ? "on" : "off"} open={open === "meta"} onToggle={() => toggle("meta")}>
          <div className="form-row"><label className="f">광고 계정 ID<input type="text" value={f.meta_ad_account_id} onChange={(e) => setF({ ...f, meta_ad_account_id: e.target.value })} placeholder="1234567890" /></label>{saveBtn("meta")}</div>
          <div className="hint">광고 관리자 주소의 <code>act=</code> 뒤 숫자. 토큰은 서버 환경 변수 META_ACCESS_TOKEN {env.meta ? "(설정됨)" : "(미설정)"}.</div>
          {renderMsg("meta")}
        </Card>

        <Card logo={<Brand id="ga4" />} title="Google Analytics 4" desc="랜딩 참여율·전환·유입 소스" state={!env.google ? "need" : integ?.ga4_property_id ? "on" : "off"} open={open === "ga4"} onToggle={() => toggle("ga4")}>
          <div className="form-row"><label className="f">속성 ID<input type="text" value={f.ga4_property_id} onChange={(e) => setF({ ...f, ga4_property_id: e.target.value })} placeholder="123456789" /></label>{saveBtn("ga4")}</div>
          <div className="hint">{env.google ? <>GA4 관리 → 속성 액세스에 <code>{env.googleEmail}</code> 을 뷰어로 추가하세요.</> : "서버에 구글 서비스 계정 키(GA4_SERVICE_ACCOUNT_JSON)가 필요합니다."}</div>
          {renderMsg("ga4")}
        </Card>

        <Card logo={<ClarityMark />} title="Microsoft Clarity" desc="스크롤 깊이·데드클릭·레이지클릭" state={integ?.clarity_api_token ? "on" : "off"} open={open === "clarity"} onToggle={() => toggle("clarity")}>
          <div className="form-row">
            <label className="f">프로젝트 ID<input type="text" value={f.clarity_project_id} onChange={(e) => setF({ ...f, clarity_project_id: e.target.value })} /></label>
            <label className="f">API 토큰 {integ?.clarity_api_token ? "(저장됨)" : ""}<input type="password" value={f.clarity_api_token} onChange={(e) => setF({ ...f, clarity_api_token: e.target.value })} autoComplete="off" placeholder="바꿀 때만 입력" /></label>
            {saveBtn("clarity")}
          </div>
          <div className="hint">Clarity → Settings → Data Export 에서 토큰 발급. 최근 1~3일 데이터를 제공합니다.</div>
          {renderMsg("clarity")}
        </Card>

        <Card logo={<span className="integ-mark"><Webhook className="ico" aria-hidden /></span>} title="웹훅" desc="Make · n8n · 폼 빌더 → 리드 시트" state="on" stateText="항상 사용 가능" open={open === "webhook"} onToggle={() => toggle("webhook")}>
          <div className="form-row">
            <label className="f" style={{ flex: 1 }}>URL<input type="text" readOnly value={webhookUrl} /></label>
            <label className="f" style={{ flex: 1 }}>이 프로젝트 토큰<input type="text" readOnly value={token} /></label>
          </div>
          <div className="form-row" style={{ marginTop: 6 }}>
            <button type="button" className="btn" onClick={() => copy("wh", token)}><Copy className="ico" aria-hidden /> {copied === "wh" ? "복사됨" : "토큰 복사"}</button>
            <button type="button" className="btn" onClick={() => copy("curl", curl)}><Copy className="ico" aria-hidden /> {copied === "curl" ? "복사됨" : "예시 요청 복사"}</button>
            <button type="button" className="btn danger" disabled={pending} onClick={() => { if (confirm("토큰을 재발급하면 기존 연동은 끊깁니다. 계속할까요?")) start(async () => { const r = await regenerateWebhookToken(project.id); if (r.ok && r.token) setToken(r.token); note("wh", r); }); }}><RefreshCw className="ico" aria-hidden /> 재발급</button>
            <span className="integ-logos"><Brand id="make" size={18} /><Brand id="n8n" size={18} /></span>
          </div>
          <div className="hint">헤더 <code>Authorization: Bearer 토큰</code> 으로 보내면 <code>client</code> 없이 이 고객사 시트에 들어갑니다. 연락처(phone) 필수.</div>
          {renderMsg("wh")}
        </Card>

        <Card logo={<Brand id="sheets" />} title="Google Sheets" desc="리드 내보내기 · 가져오기" state={!env.google ? "need" : integ?.google_sheet_id ? "on" : "off"} open={open === "sheets"} onToggle={() => toggle("sheets")}>
          <div className="form-row">
            <label className="f" style={{ flex: 1, minWidth: 260 }}>시트 주소 또는 ID<input type="text" value={f.google_sheet_id} onChange={(e) => setF({ ...f, google_sheet_id: e.target.value })} placeholder="https://docs.google.com/spreadsheets/d/…" /></label>
            <label className="f">탭 이름<input type="text" value={f.google_sheet_tab} onChange={(e) => setF({ ...f, google_sheet_tab: e.target.value })} placeholder="리드" /></label>
            <label className="f" style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-end", paddingBottom: 8 }}><input type="checkbox" checked={f.lead_sync_enabled} onChange={(e) => setF({ ...f, lead_sync_enabled: e.target.checked })} /> 새 리드 자동 내보내기</label>
            {saveBtn("sheets")}
          </div>
          <div className="hint">{env.google ? <>시트를 <code>{env.googleEmail}</code> 에게 편집자로 공유하세요. 첫 행 열 이름은 자동 생성됩니다.</> : "서버에 구글 서비스 계정 키가 필요합니다."}</div>
          <div className="form-row" style={{ marginTop: 8 }}>
            <button type="button" className="btn" disabled={pending || !integ?.google_sheet_id} onClick={() => start(async () => note("sheets", await syncLeads(project.id, "sheets", "push")))}><Upload className="ico" aria-hidden /> 전체 내보내기</button>
            <button type="button" className="btn" disabled={pending || !integ?.google_sheet_id} onClick={() => start(async () => note("sheets", await syncLeads(project.id, "sheets", "pull")))}><Download className="ico" aria-hidden /> 가져오기</button>
          </div>
          {renderMsg("sheets")}
        </Card>

        <Card logo={<Brand id="airtable" />} title="Airtable" desc="리드 내보내기 · 가져오기" state={integ?.airtable_base_id && integ?.airtable_token ? "on" : "off"} open={open === "airtable"} onToggle={() => toggle("airtable")}>
          <div className="form-row">
            <label className="f">개인 토큰 {integ?.airtable_token ? "(저장됨)" : ""}<input type="password" value={f.airtable_token} onChange={(e) => setF({ ...f, airtable_token: e.target.value })} autoComplete="off" placeholder="pat…" /></label>
            <label className="f">베이스 ID 또는 주소<input type="text" value={f.airtable_base_id} onChange={(e) => setF({ ...f, airtable_base_id: e.target.value })} placeholder="appXXXXXXXXXXXXXX" /></label>
            <label className="f">테이블 이름<input type="text" value={f.airtable_table} onChange={(e) => setF({ ...f, airtable_table: e.target.value })} placeholder="리드" /></label>
            <label className="f" style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-end", paddingBottom: 8 }}><input type="checkbox" checked={f.lead_sync_enabled} onChange={(e) => setF({ ...f, lead_sync_enabled: e.target.checked })} /> 새 리드 자동 내보내기</label>
            {saveBtn("airtable")}
          </div>
          <div className="hint">토큰 권한 data.records:read/write. 테이블에 같은 이름의 열(리드ID, 등록일시, 이름, 연락처, 이메일, 문의내용, 유입매체, 상태, 매출액, 메모 등)이 있어야 값이 들어갑니다.</div>
          <div className="form-row" style={{ marginTop: 8 }}>
            <button type="button" className="btn" disabled={pending || !integ?.airtable_base_id} onClick={() => start(async () => note("airtable", await syncLeads(project.id, "airtable", "push")))}><Upload className="ico" aria-hidden /> 전체 내보내기</button>
            <button type="button" className="btn" disabled={pending || !integ?.airtable_base_id} onClick={() => start(async () => note("airtable", await syncLeads(project.id, "airtable", "pull")))}><Download className="ico" aria-hidden /> 가져오기</button>
          </div>
          {renderMsg("airtable")}
        </Card>
      </div>
      <div className="hint" style={{ marginTop: 10 }}>가져오기는 우리 DB에 없는 연락처만 새 리드로 추가합니다. 시트와 에어테이블 사이 이동은 가져오기 뒤 내보내기 순서로 하면 됩니다.</div>
    </>
  );
}
