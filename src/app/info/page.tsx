import { Metadata } from "next";
import { Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "신청 정보 | 픽셀페이지",
  robots: { index: false, follow: false, nocache: true },
};

type SearchParams = Promise<{
  name?: string;
  phone?: string;
  item?: string;
}>;

const telHref = (phone: string) => `tel:${phone.replace(/[^0-9+]/g, "")}`;

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="border-t border-white/10 py-6 grid grid-cols-[88px_1fr] gap-5 items-baseline first:border-t-0">
    <span className="text-[12px] font-semibold tracking-[0.18em] uppercase text-blue-300/80">
      {label}
    </span>
    <span className="text-[18px] font-medium text-white tracking-[-0.01em] break-all">
      {value}
    </span>
  </div>
);

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const { name = "", phone = "", item = "" } = await searchParams;

  return (
    <main className="relative min-h-screen flex items-center justify-center px-5 py-16 overflow-hidden bg-black">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-40">
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-black/95" />
      </div>

      <div className="relative z-10 w-full max-w-[480px]">
        <div className="text-center mb-10">
          <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-blue-300/80 mb-4">
            PIXELPAGE
          </p>
          <h1 className="text-[32px] font-bold text-white tracking-[-0.03em] leading-[1.2]">
            {name ? `${name}님 신청 정보` : "신청 정보"}
          </h1>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm px-7 py-3 mb-7">
          <Row label="성함" value={name || "—"} />
          <Row label="연락처" value={phone || "—"} />
          <Row label="신청항목" value={item || "—"} />
        </div>

        {phone && (
          <a
            href={telHref(phone)}
            className="flex items-center justify-center gap-2.5 w-full py-4 rounded-xl bg-white text-black text-[16px] font-semibold tracking-[-0.01em] hover:bg-white/90 transition-colors"
          >
            <Phone className="w-4 h-4" strokeWidth={2.5} />
            바로 전화 연결
          </a>
        )}

        <p className="text-center text-[12px] text-white/40 mt-8 leading-[1.7]">
          확인 후 담당자가 직접 연락드립니다.
        </p>
      </div>
    </main>
  );
}
