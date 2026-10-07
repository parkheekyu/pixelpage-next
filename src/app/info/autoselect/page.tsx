import { Metadata } from "next";
import { Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "신청 정보 | 오토셀렉트",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * 오토셀렉트 신청자 확인·바로 통화 페이지 (n8n 등에서 링크 생성)
 *   /info/autoselect?name=고객명&phone=010-0000-0000&date=접수일시&car=희망차종&method=구매방법&cost=초기비용&when=차량필요시기
 * utm_* 파라미터는 무시됨(추적용으로 자유롭게 부착 가능)
 */
type SearchParams = Promise<Record<string, string | undefined>>;

const telHref = (phone: string) => `tel:${phone.replace(/[^0-9+]/g, "")}`;

const Row = ({ label, value }: { label: string; value: string }) => !value ? null : (
  <div className="border-t border-white/10 py-5 grid grid-cols-[104px_1fr] gap-5 items-baseline first:border-t-0">
    <span className="text-[12px] font-semibold tracking-[0.14em] text-emerald-300/80">{label}</span>
    <span className="text-[17px] font-medium text-white tracking-[-0.01em] break-all">{value || "—"}</span>
  </div>
);

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const q = await searchParams;
  const name = q.name ?? q["고객명"] ?? "";
  const phone = q.phone ?? q["연락처"] ?? "";
  const rows: [string, string][] = [
    ["접수일시", q.date ?? q["접수일시"] ?? ""],
    ["희망차종", q.car ?? q["희망차종"] ?? ""],
    ["구매방법", q.method ?? q["구매방법"] ?? ""],
    ["초기비용", q.cost ?? q["초기비용"] ?? ""],
    ["차량 필요시기", q.when ?? q["차량 필요시기"] ?? q["차량필요시기"] ?? ""],
  ];

  return (
    <main className="relative min-h-screen flex items-center justify-center px-5 py-16 overflow-hidden bg-[#06090f]">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 800px 480px at 50% 0%, rgba(16,185,129,0.16) 0%, transparent 60%), radial-gradient(ellipse 600px 400px at 100% 100%, rgba(59,130,246,0.12) 0%, transparent 60%)" }} />
      <div className="relative z-10 w-full max-w-[480px]">
        <div className="text-center mb-9">
          <p className="text-[11px] font-semibold tracking-[0.26em] uppercase text-emerald-300/80 mb-4">AUTOSELECT</p>
          <h1 className="text-[30px] font-bold text-white tracking-[-0.03em] leading-[1.2]">{name ? `${name}님 신청 정보` : "신청 정보"}</h1>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm px-7 py-2 mb-7">
          <Row label="고객명" value={name || "—"} />
          <Row label="연락처" value={phone || "—"} />
          {rows.map(([k, v]) => <Row key={k} label={k} value={v} />)}
        </div>

        {phone && (
          <a href={telHref(phone)} className="flex items-center justify-center gap-2.5 w-full py-4 rounded-xl bg-white text-black text-[16px] font-semibold tracking-[-0.01em] hover:bg-white/90 transition-colors">
            <Phone className="w-4 h-4" strokeWidth={2.5} />
            {name ? `${name}님께 바로 전화` : "바로 전화 연결"}
          </a>
        )}
        <p className="text-center text-[12px] text-white/40 mt-8 leading-[1.7]">상담 전 신청 내용을 확인하고 통화하세요.</p>
      </div>
    </main>
  );
}
