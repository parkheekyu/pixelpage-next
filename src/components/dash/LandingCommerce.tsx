"use client";

import type { Ga4Commerce } from "@/lib/integrations/ga4";
import { fmtN, fmtW } from "@/lib/dash/agg";

const DEVICE: Record<string, string> = { mobile: "모바일", desktop: "PC", tablet: "태블릿", "smart tv": "TV" };
const pc = (a: number, b: number, d = 1) => (b > 0 ? ((a / b) * 100).toFixed(d) + "%" : "–");
const md = (d: string) => `${Number(d.slice(4, 6))}/${Number(d.slice(6, 8))}`;
/** 큰 금액은 만·억 단위로 줄여서 읽기 쉽게 */
const won = (n: number) => (n >= 1e8 ? `${(n / 1e8).toFixed(n >= 1e9 ? 1 : 2)}억` : n >= 1e4 ? `${fmtN(n / 1e4)}만` : fmtN(n)) + "원";
/** 표본이 너무 적은 줄은 비율 비교에서 뺀다 */
const MIN = 100;

/** 숫자를 볼 줄 몰라도 바로 읽히도록, 표에서 눈에 띄는 차이를 문장으로 뽑는다 */
function notes(c: Ga4Commerce): string[] {
  const t = c.totals, out: string[] = [], avg = t.sessions ? t.purchases / t.sessions : 0;
  const top3 = c.items.slice(0, 3).reduce((s, i) => s + i.revenue, 0);
  if (c.items.length > 3 && t.revenue) out.push(`매출의 ${pc(top3, t.revenue, 0)}가 상위 3개 상품에서 나옵니다. 1위는 「${c.items[0].name}」(${won(c.items[0].revenue)})입니다.`);
  const land = c.byLanding.filter((l) => l.sessions >= MIN && l.path !== "/").sort((a, b) => b.purchases / b.sessions - a.purchases / a.sessions)[0];
  if (land && avg && land.purchases / land.sessions >= avg * 1.5) out.push(`${land.path} 로 들어온 방문은 100번 중 ${((land.purchases / land.sessions) * 100).toFixed(1)}번 구매합니다. 전체 평균(${(avg * 100).toFixed(1)}번)보다 훨씬 높으니, 광고와 링크를 이 페이지로 더 보내 볼 만합니다.`);
  const src = c.bySource.filter((s) => !s.folded && s.sessions >= MIN && s.purchases > 0).sort((a, b) => b.revenue / b.sessions - a.revenue / a.sessions)[0];
  if (src) out.push(`방문 한 번당 매출이 가장 큰 유입처는 ${src.source} 입니다 (방문당 ${fmtW(src.revenue / src.sessions)}).`);
  const mo = c.byDevice.find((d) => d.device === "mobile"), pcd = c.byDevice.find((d) => d.device === "desktop");
  if (mo && pcd && mo.sessions >= MIN && pcd.sessions >= MIN) {
    const a = mo.purchases / mo.sessions, b = pcd.purchases / pcd.sessions;
    const [lo, hi, loName, hiName] = a < b ? [a, b, "모바일", "PC"] : [b, a, "PC", "모바일"];
    if (lo > 0 && hi / lo >= 1.5) out.push(`${loName}의 구매 전환율이 ${(lo * 100).toFixed(1)}%로 ${hiName}(${(hi * 100).toFixed(1)}%)보다 크게 낮습니다. ${loName} 결제 과정을 직접 한 번 따라가 보세요.`);
  }
  return out;
}

export default function LandingCommerce({ c }: { c: Ga4Commerce }) {
  const t = c.totals, max = Math.max(...c.daily.map((d) => d.revenue), 1);
  const peak = c.daily.reduce((a, b) => (b.revenue > a.revenue ? b : a), c.daily[0]);
  const shown = c.items.slice(0, 10), rest = c.items.slice(10);
  const restRev = rest.reduce((s, i) => s + i.revenue, 0), restQty = rest.reduce((s, i) => s + i.qty, 0);
  const ns = notes(c);
  const hop = c.bySource.find((s) => s.folded);

  return (
    <>
      <div className="sec-bar" style={{ marginTop: 18 }}><b>매출</b><span className="hint">{md(c.from)}부터 어제까지 · 사이트 전체 · GA4 구매 기록 기준</span></div>
      {c.trimmed && <div className="hint" style={{ marginBottom: 8 }}>GA4에 구매 기록이 {md(c.from)}부터 잡혀서, 매출 숫자는 그날부터만 집계했습니다.</div>}
      <section className="kpis" style={{ marginBottom: 12 }}>
        <div className="kpi"><span>매출</span><b>{fmtW(t.revenue)}</b></div>
        <div className="kpi"><span>구매 건수</span><b>{fmtN(t.purchases)}</b></div>
        <div className="kpi"><span>객단가</span><b>{t.purchases ? fmtW(t.revenue / t.purchases) : "–"}</b></div>
        <div className="kpi"><span>방문당 매출</span><b>{t.sessions ? fmtW(t.revenue / t.sessions) : "–"}</b></div>
        <div className="kpi"><span>구매자</span><b>{fmtN(t.purchasers)}명</b></div>
      </section>

      {ns.length > 0 && <div className="card lnotes"><h2>눈여겨볼 점</h2><ul>{ns.map((n) => <li key={n}>{n}</li>)}</ul></div>}

      <div className="card" style={{ marginBottom: 12 }}>
        <h2>날짜별 매출</h2><div className="sub">가장 많이 팔린 날은 {md(peak.date)} ({won(peak.revenue)}, {fmtN(peak.purchases)}건)</div>
        <div className="rvb" role="img" aria-label="날짜별 매출 막대 그래프">
          {c.daily.map((d) => <div key={d.date} className="rvb-c" title={`${md(d.date)} · ${fmtW(d.revenue)} · ${fmtN(d.purchases)}건 · 방문 ${fmtN(d.sessions)}`}><i className={d.date === peak.date ? "pk" : ""} style={{ height: `${Math.max((d.revenue / max) * 100, d.revenue ? 2 : 0)}%` }} /></div>)}
        </div>
        <div className="rvb-x"><span>{md(c.daily[0].date)}</span><span>{md(c.daily[c.daily.length - 1].date)}</span></div>
      </div>

      <section className="lts" style={{ marginBottom: 12 }}>
        <div className="card">
          <h2>상품별</h2><div className="sub">매출이 큰 순 · 이름만 바뀐 같은 상품은 하나로 합쳤습니다</div>
          <table className="atbl compact"><thead><tr><th>상품</th><th className="num">판매</th><th className="num">매출</th><th className="num">비중</th></tr></thead>
            <tbody>
              {shown.map((i) => <tr key={i.id}><td>{i.name}</td><td className="num">{fmtN(i.qty)}</td><td className="num">{fmtW(i.revenue)}</td><td className="num">{pc(i.revenue, t.revenue, 0)}</td></tr>)}
              {rest.length > 0 && <tr><td style={{ color: "var(--muted)" }}>그 외 {rest.length}개</td><td className="num">{fmtN(restQty)}</td><td className="num">{fmtW(restRev)}</td><td className="num">{pc(restRev, t.revenue, 0)}</td></tr>}
            </tbody></table>
        </div>
        <div className="card">
          <h2>처음 들어온 페이지별</h2><div className="sub">어느 페이지로 들어온 사람이 사는지 · 매출이 큰 순</div>
          <table className="atbl compact"><thead><tr><th>페이지</th><th className="num">방문</th><th className="num">구매</th><th className="num">전환율</th><th className="num">매출</th></tr></thead>
            <tbody>{c.byLanding.slice(0, 10).map((l) => <tr key={l.path}><td style={{ wordBreak: "break-all" }}>{l.path === "/" ? "/ (첫 화면)" : l.path}</td><td className="num">{fmtN(l.sessions)}</td><td className="num">{fmtN(l.purchases)}</td><td className="num">{pc(l.purchases, l.sessions)}</td><td className="num">{fmtW(l.revenue)}</td></tr>)}</tbody></table>
        </div>
      </section>

      <section className="lts">
        <div className="card">
          <h2>유입 경로별</h2><div className="sub">어디서 온 사람이 돈을 쓰는지 · 매출이 큰 순</div>
          <table className="atbl compact"><thead><tr><th>경로</th><th className="num">방문</th><th className="num">구매</th><th className="num">전환율</th><th className="num">매출</th></tr></thead>
            <tbody>{c.bySource.slice(0, 10).map((s) => <tr key={s.source}><td style={s.folded ? { color: "var(--muted)" } : undefined}>{s.source}</td><td className="num">{fmtN(s.sessions)}</td><td className="num">{fmtN(s.purchases)}</td><td className="num">{pc(s.purchases, s.sessions)}</td><td className="num">{fmtW(s.revenue)}</td></tr>)}</tbody></table>
          {hop && <div className="hint" style={{ marginTop: 8 }}>「결제·로그인 뒤 복귀」는 결제창이나 카카오 로그인을 거쳐 돌아온 방문입니다. 원래 어디서 왔는지가 가려진 매출이 {pc(hop.revenue, t.revenue, 0)} 있다는 뜻입니다.</div>}
        </div>
        <div className="card">
          <h2>기기별</h2><div className="sub">전환율 차이가 크면 낮은 쪽 결제 화면을 먼저 손봅니다</div>
          <table className="atbl compact"><thead><tr><th>기기</th><th className="num">방문</th><th className="num">구매</th><th className="num">전환율</th><th className="num">객단가</th><th className="num">매출</th></tr></thead>
            <tbody>{[...c.byDevice].sort((a, b) => b.revenue - a.revenue).map((d) => <tr key={d.device}><td>{DEVICE[d.device] ?? d.device}</td><td className="num">{fmtN(d.sessions)}</td><td className="num">{fmtN(d.purchases)}</td><td className="num">{pc(d.purchases, d.sessions)}</td><td className="num">{d.purchases ? fmtW(d.revenue / d.purchases) : "–"}</td><td className="num">{fmtW(d.revenue)}</td></tr>)}</tbody></table>
        </div>
      </section>
    </>
  );
}
