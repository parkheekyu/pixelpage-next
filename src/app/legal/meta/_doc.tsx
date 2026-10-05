import type { ReactNode } from "react";

/** 메타 앱 심사 제출용 히든 문서 페이지 (noindex, 사이트 내 링크 없음) */
export const COMPANY = { name: "픽셀페이지", ceo: "박희규", reg: "477-11-01530", email: "contact@pixelpage.co.kr", address: "경기도 용인시 수지구 광교중앙로296번길 10, 207호-제24호 (상현동, 광교 리치안 오피스텔)", appId: "921074747412628", effective: "2026년 10월 5일" };

export function Doc({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main style={{ background: "#fff", color: "#111", minHeight: "100vh", padding: "56px 20px 80px", fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, 'Apple SD Gothic Neo', sans-serif", lineHeight: 1.75 }}>
      <article style={{ maxWidth: 760, margin: "0 auto", fontSize: 15 }}>
        <p style={{ fontSize: 12, letterSpacing: ".12em", color: "#888", textTransform: "uppercase", marginBottom: 6 }}>PixelPage · Meta App Legal</p>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.01em", margin: "0 0 6px" }}>{title}</h1>
        <p style={{ color: "#666", marginBottom: 32 }}>시행일: {COMPANY.effective}</p>
        {children}
        <hr style={{ border: 0, borderTop: "1px solid #e5e5e5", margin: "40px 0 20px" }} />
        <p style={{ color: "#555", fontSize: 13 }}>
          {COMPANY.name} · 대표 {COMPANY.ceo} · 사업자등록번호 {COMPANY.reg}<br />
          {COMPANY.address}<br />
          문의: <a href={`mailto:${COMPANY.email}`} style={{ color: "#1d4ed8" }}>{COMPANY.email}</a>
        </p>
      </article>
    </main>
  );
}
export const H = ({ children }: { children: ReactNode }) => <h2 style={{ fontSize: 17, fontWeight: 700, margin: "28px 0 8px" }}>{children}</h2>;
export const P = ({ children }: { children: ReactNode }) => <p style={{ margin: "0 0 10px" }}>{children}</p>;
export const UL = ({ items }: { items: ReactNode[] }) => <ul style={{ margin: "0 0 10px", paddingLeft: 22 }}>{items.map((it, i) => <li key={i} style={{ marginBottom: 4 }}>{it}</li>)}</ul>;
