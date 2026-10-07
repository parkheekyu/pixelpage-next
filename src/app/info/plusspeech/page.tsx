import { Metadata } from "next";
import { Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "신청 정보 | 플러스스피치",
  robots: { index: false, follow: false, nocache: true },
};

/**
 * 플러스스피치 신청자 확인·바로 통화 페이지 (n8n 등에서 링크 생성)
 *   /info/plusspeech?name=성함&phone=연락처&date=신청일시&concern=고민&start=시작희망시기&branch=희망지점&survey=설문응답&note=추가내용
 * 한글 키(성함, 연락처, 신청일시, 고민, 시작 희망 시기, 희망 지점, 설문 응답, 추가 내용)도 그대로 받음. 복수 값은 쉼표로 이어서. utm_* 는 무시.
 */
type SearchParams = Promise<Record<string, string | undefined>>;

const telHref = (phone: string) => `tel:${phone.replace(/[^0-9+]/g, "")}`;
const pick = (q: Record<string, string | undefined>, ...keys: string[]) => { for (const k of keys) { const v = q[k]; if (v && v.trim()) return v.trim(); } return ""; };

const Row = ({ label, value, lines }: { label: string; value?: string; lines?: string[] }) => (!value && !lines?.length) ? null : (
  <div className="border-t border-white/10 py-5 grid grid-cols-[96px_1fr] gap-4 items-baseline first:border-t-0">
    <span className="text-[12px] font-semibold tracking-[0.12em] text-violet-300/85 leading-[1.6]">{label}</span>
    {lines ? (
      <ul className="space-y-2">{lines.length ? lines.map((l, i) => <li key={i} className="text-[14.5px] text-white/90 leading-[1.6]">{l}</li>) : <li className="text-white/40">—</li>}</ul>
    ) : (
      <span className="text-[17px] font-medium text-white tracking-[-0.01em] break-words leading-[1.5]">{value || "—"}</span>
    )}
  </div>
);

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const q = await searchParams;
  const name = pick(q, "name", "성함", "이름");
  const phone = pick(q, "phone", "연락처");
  const date = pick(q, "date", "신청일시");
  const concern = pick(q, "concern", "고민", "고민 (복수 선택)");
  const start = pick(q, "start", "시작 희망 시기", "시작희망시기");
  const branch = pick(q, "branch", "희망 지점", "희망지점");
  const survey = pick(q, "survey", "설문 응답", "설문 응답 (질문·답변)", "설문응답");
  const note = pick(q, "note", "추가 내용", "추가내용");
  const surveyLines = survey.split(/\s*\/\s*|\n/).map((s) => s.trim()).filter(Boolean);

  return (
    <main className="relative min-h-screen flex items-center justify-center px-5 py-14 overflow-hidden bg-[#0a0812]">
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 800px 480px at 50% 0%, rgba(139,92,246,0.2) 0%, transparent 60%), radial-gradient(ellipse 600px 400px at 100% 100%, rgba(59,130,246,0.12) 0%, transparent 60%)" }} />
      <div className="relative z-10 w-full max-w-[480px]">
        <div className="text-center mb-8">
          <p className="text-[11px] font-semibold tracking-[0.26em] uppercase text-violet-300/85 mb-4">PLUS SPEECH</p>
          <h1 className="text-[30px] font-bold text-white tracking-[-0.03em] leading-[1.2]">{name ? `${name}님 상담 신청` : "상담 신청 정보"}</h1>
          {date && <p className="text-[13px] text-white/45 mt-3">신청일시 {date}</p>}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm px-6 py-2 mb-5">
          <Row label="성함" value={name || "—"} />
          <Row label="연락처" value={phone || "—"} />
          <Row label="고민" value={concern.replace(/\s*,\s*/g, " · ")} />
          <Row label="시작 희망" value={start} />
          <Row label="희망 지점" value={branch.replace(/\s*,\s*/g, " · ")} />
        </div>

        {(surveyLines.length > 0 || note) && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-2 mb-7">
            {surveyLines.length > 0 && <Row label="설문 응답" lines={surveyLines} />}
            {note && <Row label="추가 내용" lines={[note]} />}
          </div>
        )}

        {phone && (
          <a href={telHref(phone)} className="flex items-center justify-center gap-2.5 w-full py-4 rounded-xl bg-white text-black text-[16px] font-semibold tracking-[-0.01em] hover:bg-white/90 transition-colors">
            <Phone className="w-4 h-4" strokeWidth={2.5} />
            {name ? `${name}님께 바로 전화` : "바로 전화 연결"}
          </a>
        )}
        <p className="text-center text-[12px] text-white/40 mt-7 leading-[1.7]">상담 전 신청 내용을 확인하고 통화하세요.</p>
      </div>
    </main>
  );
}
