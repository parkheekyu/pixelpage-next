"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ExternalLink, RefreshCw, Search } from "lucide-react";

interface Row { n: number; t: number; c: string[] }
const RANGES = [{ key: "all", label: "최대", days: 0 }, { key: "1", label: "오늘", days: 1 }, { key: "7", label: "7일", days: 7 }, { key: "30", label: "30일", days: 30 }, { key: "month", label: "이번 달", days: 0 }, { key: "prev", label: "지난달", days: 0 }] as const;
const STEP = 200;

/** 리드 = 구글 시트 보기. 시트가 원본이고 여기서는 읽기만 한다. 수정은 시트에서 한다. */
export default function SheetLeads({ header, rows, total, hasDate, dateIndex, sheetUrl, tab, fetchedAt }: { header: string[]; rows: Row[]; total: number; hasDate: boolean; dateIndex: number; sheetUrl: string; tab: string; fetchedAt: number }) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const [q, setQ] = useState("");
  const [range, setRange] = useState<(typeof RANGES)[number]["key"]>("all");
  const [shown, setShown] = useState(STEP);
  const [busy, setBusy] = useState(false);

  const list = useMemo(() => {
    const days = RANGES.find((r) => r.key === range)!.days;
    // 오늘 = 한국 시간 자정부터, N일 = 오늘 포함 최근 N일
    const kstMidnight = Math.floor((fetchedAt + 9 * 3600_000) / 86400_000) * 86400_000 - 9 * 3600_000;
    let since = days ? kstMidnight - (days - 1) * 86400_000 : 0, until = Infinity;
    if (range === "month" || range === "prev") {
      // 이번 달 1일 0시(한국 시간). 지난달은 그 앞 달 1일부터 이번 달 1일 직전까지
      const k = new Date(fetchedAt + 9 * 3600_000), y = k.getUTCFullYear(), mo = k.getUTCMonth();
      const first = (n: number) => Date.UTC(y, mo + n, 1) - 9 * 3600_000;
      since = range === "month" ? first(0) : first(-1);
      if (range === "prev") until = first(0);
    }
    const term = q.trim().toLowerCase();
    return rows.filter((r) => (!since || r.t >= since) && r.t < until && (!term || r.c.some((v) => v.toLowerCase().includes(term))));
  }, [rows, q, range, fetchedAt]);

  const time = new Date(fetchedAt).toLocaleTimeString("ko-KR", { timeZone: "Asia/Seoul", hour: "2-digit", minute: "2-digit" });
  return (
    <div className="sl">
      <div className="sec-bar">
        {hasDate && (
          <div className="tabs">{RANGES.map((r) => <button key={r.key} type="button" className={range === r.key ? "on" : ""} onClick={() => { setRange(r.key); setShown(STEP); }}>{r.label}</button>)}</div>
        )}
        <label className="sl-search"><Search className="ico" aria-hidden /><input value={q} onChange={(e) => { setQ(e.target.value); setShown(STEP); }} placeholder="이름, 연락처 등 검색" aria-label="리드 검색" /></label>
        <b className="sl-count">{list.length.toLocaleString()}건</b>
        <span className="sp" />
        <span className="hint">{time} 기준 · 수정은 시트에서</span>
        <button type="button" className="btn" disabled={busy} onClick={() => { setBusy(true); router.replace(`${pathname}?r=${Date.now()}`); setTimeout(() => setBusy(false), 2500); }}><RefreshCw className="ico" aria-hidden /> 새로 고침</button>
        <a className="btn primary" href={sheetUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="ico" aria-hidden /> 시트 열기</a>
      </div>
      {total > rows.length && <div className="hint" style={{ margin: "0 0 8px" }}>시트의 {total.toLocaleString()}건 가운데 최근 {rows.length.toLocaleString()}건만 보여 줍니다. 이전 리드는 시트에서 확인해 주세요.</div>}
      <div className="card sl-card">
        <div className="sl-scroll">
          <table className="ndb sl-table">
            <thead><tr><th className="sl-no">#</th>{header.map((h, i) => <th key={i}>{h}</th>)}</tr></thead>
            <tbody>
              {list.slice(0, shown).map((r) => (
                <tr key={r.n}>
                  <td className="sl-no" title={`시트 ${r.n}행`}>{r.n}</td>
                  {r.c.map((v, i) => <td key={i} className={i === dateIndex ? "pad nowrap" : "pad"} title={v.length > 40 ? v : undefined}><span className="sl-cell">{v}</span></td>)}
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <div className="sl-empty">{rows.length === 0 ? `"${tab}" 탭에 리드가 없습니다.` : "조건에 맞는 리드가 없습니다."}</div>}
        </div>
        {list.length > shown && <button type="button" className="sl-more" onClick={() => setShown((n) => n + STEP)}>{(list.length - shown).toLocaleString()}건 더 보기</button>}
      </div>
    </div>
  );
}
