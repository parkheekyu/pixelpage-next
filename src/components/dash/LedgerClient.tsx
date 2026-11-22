"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Repeat, Search, X } from "lucide-react";
import { KIND_LABEL, LEDGER_CATEGORIES, LEDGER_METHODS, type LedgerInput, type LedgerKind, type LedgerRow } from "@/lib/dash/ledger";
import { fmtN, fmtW } from "@/lib/dash/agg";
import { deleteLedger, saveLedger } from "@/app/app/ledger-actions";

const STEP = 100;
const pc = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) + "%" : "–");
/** 큰 금액은 만·억 단위로 줄여서 읽기 쉽게 */
const short = (n: number) => { const a = Math.abs(n), s = n < 0 ? "-" : ""; return s + (a >= 1e8 ? `${(a / 1e8).toFixed(2)}억` : a >= 1e4 ? `${fmtN(a / 1e4)}만` : fmtN(a)); };
const monthLabel = (m: string) => `${Number(m.slice(5, 7))}월`;
const periodLabel = (p: string) => (p === "all" ? "전체 기간" : p.length === 4 ? `${p}년` : `${p.slice(0, 4)}년 ${Number(p.slice(5, 7))}월`);
const sum = (rows: LedgerRow[], kind: LedgerKind) => rows.reduce((s, r) => s + (r.kind === kind ? r.amount : 0), 0);
/** 이름별로 묶어 금액이 큰 순으로 */
function group(rows: LedgerRow[], key: (r: LedgerRow) => string) {
  const m = new Map<string, { name: string; amount: number; count: number }>();
  for (const r of rows) { const k = key(r), c = m.get(k); if (c) { c.amount += r.amount; c.count++; } else m.set(k, { name: k, amount: r.amount, count: 1 }); }
  return [...m.values()].sort((a, b) => b.amount - a.amount);
}

function Bars({ items, total, color, onPick, picked }: { items: { name: string; amount: number; count: number }[]; total: number; color: string; onPick?: (name: string) => void; picked?: string }) {
  const max = Math.max(...items.map((i) => i.amount), 1);
  return (
    <div className="lg-bars">
      {items.map((i) => (
        <button type="button" key={i.name} className={`lg-bar ${picked === i.name ? "on" : ""}`} onClick={onPick ? () => onPick(i.name) : undefined} disabled={!onPick} title={`${i.name} · ${fmtW(i.amount)} · ${i.count}건`}>
          <span className="n">{i.name}</span>
          <span className="t"><i style={{ width: `${Math.max((i.amount / max) * 100, 1)}%`, background: color }} /></span>
          <b>{fmtW(i.amount)}</b><small>{pc(i.amount, total)}</small>
        </button>
      ))}
      {items.length === 0 && <div className="hint">해당하는 내역이 없습니다.</div>}
    </div>
  );
}

function Form({ init, id, categories, onClose }: { init: LedgerInput; id: string | null; categories: string[]; onClose: () => void }) {
  const router = useRouter();
  const [f, setF] = useState<LedgerInput>(init);
  const [amount, setAmount] = useState(init.amount ? String(init.amount) : "");
  const [err, setErr] = useState("");
  const [pending, start] = useTransition();
  const set = <K extends keyof LedgerInput>(k: K, v: LedgerInput[K]) => setF((p) => ({ ...p, [k]: v }));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    start(async () => {
      const r = await saveLedger(id, { ...f, amount: Number(amount.replace(/[^\d]/g, "")) });
      if (!r.ok) return setErr(r.error);
      router.refresh(); onClose();
    });
  };
  const remove = () => {
    if (!id || !window.confirm(`「${f.title}」 내역을 지울까요? 되돌릴 수 없습니다.`)) return;
    start(async () => { const r = await deleteLedger(id); if (!r.ok) return setErr(r.error); router.refresh(); onClose(); });
  };
  return (
    <form className="card lg-form" onSubmit={submit}>
      <div className="lg-form-head"><h2>{id ? "내역 고치기" : "내역 추가"}</h2><button type="button" className="btn ghost" onClick={onClose} aria-label="닫기"><X size={16} aria-hidden /></button></div>
      <div className="lg-fields">
        <label>날짜<input type="date" value={f.date} onChange={(e) => set("date", e.target.value)} required /></label>
        <label>구분<select value={f.kind} onChange={(e) => set("kind", e.target.value as LedgerKind)}><option value="income">수입</option><option value="expense">지출</option><option value="excluded">제외 (합계에서 뺌)</option></select></label>
        <label className="w2">내역<input type="text" value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="거래처나 내용" required autoFocus={!id} /></label>
        <label>금액 (원)<input type="text" inputMode="numeric" value={amount ? Number(amount.replace(/[^\d]/g, "") || 0).toLocaleString("ko-KR") : ""} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} placeholder="0" required /></label>
        <label>분류<select value={f.category} onChange={(e) => set("category", e.target.value)}>{categories.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label>결제수단<select value={f.method ?? ""} onChange={(e) => set("method", e.target.value || null)}><option value="">선택 안 함</option>{[...new Set([...LEDGER_METHODS, ...(f.method ? [f.method] : [])])].map((m) => <option key={m}>{m}</option>)}</select></label>
        <label className="chk"><input type="checkbox" checked={f.fixed} onChange={(e) => set("fixed", e.target.checked)} /> 매달 나가는 고정비</label>
        <label className="w4">메모<input type="text" value={f.memo ?? ""} onChange={(e) => set("memo", e.target.value)} placeholder="선택" /></label>
      </div>
      {err && <div className="msg err">{err}</div>}
      <div className="lg-form-foot">
        {id && <button type="button" className="btn danger" onClick={remove} disabled={pending}>삭제</button>}
        <span className="sp" />
        <button type="button" className="btn" onClick={onClose}>취소</button>
        <button type="submit" className="btn primary" disabled={pending}>{pending ? "저장 중…" : "저장"}</button>
      </div>
    </form>
  );
}

export default function LedgerClient({ rows, today }: { rows: LedgerRow[]; today: string }) {
  const [period, setPeriod] = useState("all");
  const [kind, setKind] = useState<"all" | LedgerKind>("all");
  const [cat, setCat] = useState("");
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(STEP);
  const [edit, setEdit] = useState<{ id: string | null; init: LedgerInput } | null>(null);

  const months = useMemo(() => [...new Set(rows.map((r) => r.date.slice(0, 7)))].sort(), [rows]);
  const years = useMemo(() => [...new Set(months.map((m) => m.slice(0, 4)))], [months]);
  const categories = useMemo(() => [...new Set([...LEDGER_CATEGORIES, ...rows.map((r) => r.category)])], [rows]);
  const monthly = useMemo(() => months.slice(-13).map((m) => { const rs = rows.filter((r) => r.date.startsWith(m)); const income = sum(rs, "income"), expense = sum(rs, "expense"); return { m, income, expense, net: income - expense }; }), [rows, months]);
  const inPeriod = useMemo(() => (period === "all" ? rows : rows.filter((r) => r.date.startsWith(period))), [rows, period]);

  const income = sum(inPeriod, "income"), expense = sum(inPeriod, "expense"), net = income - expense;
  const expenses = inPeriod.filter((r) => r.kind === "expense"), incomes = inPeriod.filter((r) => r.kind === "income");
  const fixed = expenses.filter((r) => r.fixed);
  const fixedSum = fixed.reduce((s, r) => s + r.amount, 0);
  const nMonths = new Set(inPeriod.map((r) => r.date.slice(0, 7))).size || 1;
  const byCat = group(expenses, (r) => r.category);
  // 이름 끝의 괄호(담당 프로젝트 등)는 떼고 같은 거래처로 묶는다
  const bySource = group(incomes.filter((r) => r.category !== "이자·환급"), (r) => r.title.replace(/\s*\(.*?\)\s*$/, "").trim() || r.title).slice(0, 8);
  const byFixed = group(fixed, (r) => r.title).slice(0, 10);
  const chartMax = Math.max(...monthly.flatMap((x) => [x.income, x.expense]), 1);

  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    return inPeriod.filter((r) => (kind === "all" || r.kind === kind) && (!cat || r.category === cat) && (!k || `${r.title} ${r.memo ?? ""} ${r.category} ${r.method ?? ""}`.toLowerCase().includes(k)));
  }, [inPeriod, kind, cat, q]);
  const pick = (v: string) => { setPeriod((p) => (p === v ? "all" : v)); setShown(STEP); };
  const blank = (): LedgerInput => ({ date: today, kind: "expense", category: "기타", method: "카카오뱅크", amount: 0, fixed: false, title: "", memo: null });

  return (
    <>
      <div className="sec-bar">
        <b>수입·지출</b><span className="hint">{periodLabel(period)} · {fmtN(inPeriod.length)}건</span>
        <span className="sp" />
        <select value={period} aria-label="기간" onChange={(e) => { setPeriod(e.target.value); setShown(STEP); }}>
          <option value="all">전체 기간</option>
          {[...years].reverse().map((y) => <option key={y} value={y}>{y}년</option>)}
          {[...months].reverse().map((m) => <option key={m} value={m}>{m.slice(0, 4)}년 {Number(m.slice(5, 7))}월</option>)}
        </select>
        <button type="button" className="btn primary" onClick={() => setEdit({ id: null, init: blank() })}><Plus className="ico" aria-hidden /> 내역 추가</button>
      </div>

      {edit && <Form key={edit.id ?? "new"} id={edit.id} init={edit.init} categories={categories} onClose={() => setEdit(null)} />}

      <section className="kpis" style={{ marginBottom: 12 }}>
        <div className="kpi"><span>수입</span><b>{fmtW(income)}</b></div>
        <div className="kpi"><span>지출</span><b>{fmtW(expense)}</b></div>
        <div className="kpi"><span>남은 돈 (수입 − 지출)</span><b style={{ color: net < 0 ? "var(--bad)" : undefined }}>{fmtW(net)}</b><small className="kpi-sub">수입의 {pc(net, income)}</small></div>
        <div className="kpi"><span>고정비</span><b>{fmtW(fixedSum)}</b><small className="kpi-sub">{nMonths > 1 ? `월평균 ${fmtW(fixedSum / nMonths)}` : `지출의 ${pc(fixedSum, expense)}`}</small></div>
      </section>

      <div className="card" style={{ marginBottom: 12 }}>
        <div className="lg-chart-head"><div><h2>월별 흐름</h2><div className="sub">막대를 누르면 그 달만 봅니다. 한 번 더 누르면 전체로 돌아갑니다</div></div>
          <div className="lg-legend"><span><i style={{ background: "var(--s1)" }} />수입</span><span><i style={{ background: "var(--s2)" }} />지출</span></div></div>
        <div className="lg-chart">
          {monthly.map((x) => (
            <button type="button" key={x.m} className={`lg-col ${period === x.m ? "on" : ""} ${period !== "all" && period.length === 7 && period !== x.m ? "dim" : ""}`} onClick={() => pick(x.m)} title={`${periodLabel(x.m)} · 수입 ${fmtW(x.income)} · 지출 ${fmtW(x.expense)} · 남은 돈 ${fmtW(x.net)}`}>
              <span className="net" style={{ color: x.net < 0 ? "var(--bad)" : undefined }}>{x.net >= 0 ? "+" : ""}{short(x.net)}</span>
              <span className="bars"><i style={{ height: `${(x.income / chartMax) * 100}%`, background: "var(--s1)" }} /><i style={{ height: `${(x.expense / chartMax) * 100}%`, background: "var(--s2)" }} /></span>
              <span className="lbl">{x.m.endsWith("-01") || x.m === monthly[0].m ? `${x.m.slice(2, 4)}년 ` : ""}{monthLabel(x.m)}</span>
            </button>
          ))}
        </div>
      </div>

      <section className="lts" style={{ marginBottom: 12 }}>
        <div className="card"><h2>어디에 썼나</h2><div className="sub">지출 분류별 · 누르면 아래 표가 그 분류만 보입니다</div>
          <Bars items={byCat} total={expense} color="var(--s2)" picked={kind === "expense" ? cat : ""} onPick={(n) => { const same = kind === "expense" && cat === n; setKind(same ? "all" : "expense"); setCat(same ? "" : n); setShown(STEP); }} /></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, minWidth: 0 }}>
          <div className="card"><h2>어디서 벌었나</h2><div className="sub">수입이 큰 거래처 · 이자와 환급은 뺐습니다</div><Bars items={bySource} total={income} color="var(--s1)" /></div>
          <div className="card"><h2>매달 나가는 돈</h2><div className="sub">고정비로 표시한 항목 · {periodLabel(period)} 합계</div><Bars items={byFixed} total={fixedSum} color="var(--s3)" /></div>
        </div>
      </section>

      <div className="card">
        <div className="lg-list-head">
          <h2>내역</h2>
          <div className="tabs">{(["all", "income", "expense", "excluded"] as const).map((k) => <button key={k} type="button" className={kind === k ? "on" : ""} onClick={() => { setKind(k); setShown(STEP); }}>{k === "all" ? "전체" : KIND_LABEL[k]}</button>)}</div>
          <select value={cat} aria-label="분류" onChange={(e) => { setCat(e.target.value); setShown(STEP); }}><option value="">모든 분류</option>{categories.map((c) => <option key={c}>{c}</option>)}</select>
          <label className="lg-search"><Search size={14} aria-hidden /><input type="text" value={q} onChange={(e) => { setQ(e.target.value); setShown(STEP); }} placeholder="내역·메모 검색" /></label>
          <span className="sp" />
          <span className="hint">{fmtN(list.length)}건 · 수입 {fmtW(sum(list, "income"))} · 지출 {fmtW(sum(list, "expense"))}</span>
        </div>
        <div className="lg-tbl-wrap">
          <table className="atbl lg-tbl">
            <thead><tr><th>날짜</th><th>내역</th><th>분류</th><th>결제수단</th><th className="num">금액</th><th aria-label="고치기" /></tr></thead>
            <tbody>
              {list.slice(0, shown).map((r) => (
                <tr key={r.id} className={r.kind}>
                  <td className="d">{r.date.slice(2).replace(/-/g, ".")}</td>
                  <td><span className="t">{r.title}</span>{r.fixed && <Repeat className="fx" size={13} aria-label="고정비" />}{r.memo && <small>{r.memo}</small>}</td>
                  <td><span className="pill tag-gray">{r.category}</span></td>
                  <td className="m">{r.method ?? "–"}</td>
                  <td className="num amt">{r.kind === "income" ? "+" : r.kind === "expense" ? "−" : ""}{fmtN(r.amount)}{r.kind === "excluded" && <small>제외</small>}</td>
                  <td><button type="button" className="btn ghost" aria-label={`${r.title} 고치기`} onClick={() => { const { id, ...init } = r; setEdit({ id, init }); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Pencil size={14} aria-hidden /></button></td>
                </tr>
              ))}
              {list.length === 0 && <tr><td colSpan={6}><div className="sl-empty" style={{ padding: "28px 0" }}>조건에 맞는 내역이 없습니다.</div></td></tr>}
            </tbody>
          </table>
        </div>
        {list.length > shown && <div style={{ textAlign: "center", marginTop: 12 }}><button type="button" className="btn" onClick={() => setShown((n) => n + STEP)}>더 보기 ({fmtN(list.length - shown)}건 남음)</button></div>}
      </div>
      <div className="hint" style={{ marginTop: 10 }}>「제외」는 본인 계좌 간 이체나 빌려준 돈처럼 수입·지출 합계에 넣지 않는 내역입니다. 해외 결제는 원화로 환산한 근사치입니다.</div>
    </>
  );
}
