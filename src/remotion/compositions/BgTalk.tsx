// AUTO-COPIED from 광고제작/remotion/src/BgTalk.tsx by pipeline/editor_publish.py — 직접 수정 금지
import { AbsoluteFill, Audio, Img, Loop, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { ProjectData } from "./types";

/*
 * BgTalk (배경 토크): 한 장면 배경 영상 위에 상단 절반(라벨~자막 y0.13~0.47) 만 쓰는 정보형 릴스.
 * 레퍼런스(AI 목소리 툴 모음, 42s) 프레임 분석 → presets/_analysis/bg_talk.md
 *  - 배경: 컷 없는 한 장면(사람이 작업하는 측면 샷 등) 끝까지. 화면 하단 3/4 은 손대지 않음.
 *  - (2026-10-09 재측정) 섹션 라벨(배민 주아 흰+검정 외곽) y 0.137H / 보조 메모(⚠ 작게) y 0.216H
 *  - 요소 카드(캡처·로고, 그림자, 애니메이션 없음) 중심 y 0.285H, 높이 ≤ 0.115H
 *  - 자막: 검정 박스 + 흰 배민 주아 0.034H, 중심 y 0.43H, 말하는 구절 그대로 즉시 교체
 *  - 훅: 첫 1초 "불타는 글자" y 0.43H
 *  - 인트로 카드(선택): 다른 컷 + 검정 박스 3줄 제목 + 로고 팝
 *  - 엔딩: 검정 + CTA 한 줄 (+로고)
 */

type Chunk = { t: string; s: number; e: number };
type CardSpec = { file: string; aspect?: number; w?: number; y?: number; at?: number };
type Intro = { lines: string[]; logos?: string[]; bg?: string; bgDur?: number };
type BScene = {
  idx: number; start: number; dur: number; chunks: Chunk[];
  label?: string; note?: string; card?: CardSpec; card2?: CardSpec;
  hookFire?: boolean; intro?: Intro; ending?: boolean; cta?: string;
};
type BData = Omit<ProjectData, "scenes"> & { scenes: BScene[]; bg?: string; bgDur?: number; bgStill?: string; cta?: string; logo?: string };

/** 대시보드 편집기(Remotion Player)에서는 미디어가 절대 URL 로 온다 → 그대로, 아니면 public/ 기준 */
const src = (p: string) => (/^https?:\/\//.test(p) ? p : staticFile(p));
const GOTHIC = "'Pretendard', 'Apple SD Gothic Neo', sans-serif";
const HAND = "'BMJUA', 'Pretendard', sans-serif";   // 라벨 = 배민 주아, 자막 박스 = Pretendard Regular(2026-10-09 3차)(레퍼런스 "3. 일레븐랩스" 라벨 폰트). 기랑해랑 금지(2026-10-09 사용자 지시)

const SubBox: React.FC<{ text: string; H: number; P: Record<string, unknown> }> = ({ text, H, P }) => {
  const fs = H * Number(P.sub_size ?? 0.031);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: H * Number(P.sub_cy ?? 0.60), display: "flex", justifyContent: "center", transform: "translateY(-50%)" }}>
      <div style={{ background: `rgba(0,0,0,${Number(P.sub_alpha ?? 0.8)})`, color: "#fff", fontFamily: GOTHIC, fontWeight: 400, fontSize: fs, lineHeight: 1.25, padding: `${fs * 0.12}px ${fs * 0.32}px`, borderRadius: fs * 0.12, whiteSpace: "pre", letterSpacing: -0.3 }}>{text}</div>
    </div>
  );
};

const Label: React.FC<{ text: string; note?: string; H: number; W: number; P: Record<string, unknown>; frame: number; fps: number }> = ({ text, note, H, W, P, frame, fps }) => {
  const fs = H * Number(P.label_size ?? 0.048);   // 애니메이션 없음(2026-10-09 사용자 지시: 폰트·요소에 애니메이션 금지)
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: H * Number(P.label_cy ?? 0.26), transform: "translateY(-50%)", textAlign: "center", fontFamily: HAND, fontSize: fs, color: "#fff", WebkitTextStroke: `${fs * 0.06}px #222`, paintOrder: "stroke fill", textShadow: "0 2px 6px rgba(0,0,0,0.35)", whiteSpace: "pre" }}>{text}</div>
      {note && <div style={{ position: "absolute", left: 0, right: 0, top: H * Number(P.note_cy ?? 0.335), transform: "translateY(-50%)", textAlign: "center", fontFamily: HAND, fontSize: fs * 0.62, color: "#fff", WebkitTextStroke: `${fs * 0.035}px #222`, paintOrder: "stroke fill", whiteSpace: "pre" }}>{note}</div>}
    </>
  );
};

const Card: React.FC<{ c: CardSpec; H: number; W: number; P: Record<string, unknown>; frame: number; fps: number }> = ({ c, H, W, P, frame, fps }) => {
  const maxH = H * Number(P.card_h ?? 0.13), maxW = W * (c.w ?? Number(P.card_w ?? 0.6));
  const asp = c.aspect ?? 1;
  let h = maxH, w = h * asp; if (w > maxW) { w = maxW; h = w / asp; }
  return (
    <div style={{ position: "absolute", left: (W - w) / 2, top: H * (c.y ?? Number(P.card_cy ?? 0.44)) - h / 2, width: w, height: h, borderRadius: h * 0.08, overflow: "hidden", boxShadow: "0 8px 22px rgba(0,0,0,0.35)", background: "#fff" }}>
      <Img src={src(c.file)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </div>
  );
};

const FireText: React.FC<{ text: string; H: number; W: number; frame: number }> = ({ text, H, W, frame }) => {
  const fs = H * 0.05;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: H * 0.55, display: "flex", justifyContent: "center", transform: "translateY(-50%) rotate(-2deg)" }}>
      <div style={{ fontFamily: GOTHIC, fontWeight: 900, fontSize: fs, color: "#fff", letterSpacing: 1, background: "linear-gradient(180deg,#fff2a8 0%,#ffb000 45%,#ff3d00 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 10px rgba(255,120,0,0.9)) drop-shadow(0 0 22px rgba(255,60,0,0.6))", padding: "0 10px", whiteSpace: "pre" }}>{text}</div>
    </div>
  );
};

const IntroCard: React.FC<{ it: Intro; H: number; W: number; frame: number; fps: number }> = ({ it, H, W, frame, fps }) => {
  const fs = H * 0.03;
  return (
    <>
      {it.bg && (
        <Loop durationInFrames={Math.max(1, Math.round((it.bgDur ?? 4) * fps))} layout="none">
          <OffthreadVideo src={src(it.bg)} muted style={{ position: "absolute", inset: 0, width: W, height: H, objectFit: "cover" }} />
        </Loop>
      )}
      {(it.logos ?? []).map((lg, i) => {
        const s = W * 0.17; const x = W * (0.6 + (i % 2) * 0.16), y = H * (0.36 + Math.floor(i / 2) * 0.1 - (i % 2) * 0.05);
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: s * 0.22, background: "#fff", boxShadow: "0 8px 20px rgba(0,0,0,0.3)", overflow: "hidden" }}><Img src={src(lg)} style={{ width: "100%", height: "100%", objectFit: "contain", padding: s * 0.12 }} /></div>;
      })}
      <div style={{ position: "absolute", left: W * 0.08, top: H * 0.50, display: "flex", flexDirection: "column", gap: 4 }}>
        {it.lines.map((l, i) => <div key={i} style={{ background: "#000", color: "#fff", fontFamily: GOTHIC, fontWeight: 500, fontSize: fs, padding: `${fs * 0.15}px ${fs * 0.4}px`, whiteSpace: "pre", alignSelf: "flex-start" }}>{l}</div>)}
      </div>
    </>
  );
};

const SceneView: React.FC<{ sc: BScene; data: BData; label?: string; note?: string }> = ({ sc, data, label, note }) => {
  const frame = useCurrentFrame(); const { fps, width: W, height: H } = useVideoConfig();
  const P = data.preset as Record<string, unknown>;
  const cur = sc.chunks.find((c) => frame >= c.s * fps && frame < c.e * fps) ?? (frame >= (sc.chunks.at(-1)?.e ?? 0) * fps ? sc.chunks.at(-1) : undefined);
  // 인트로 카드: 제목 3줄이 자막 역할 → 자막 박스 없음. intro.bg 가 없으면 메인 배경 유지(2026-10-09 "배경 고정")
  if (sc.intro) return <AbsoluteFill><IntroCard it={sc.intro} H={H} W={W} frame={frame} fps={fps} /></AbsoluteFill>;
  if (sc.ending) {
    return (
      <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center" }}>
        {data.logo && <Img src={src(data.logo)} style={{ width: W * 0.22, height: W * 0.22, borderRadius: "50%", objectFit: "cover", marginBottom: H * 0.02 }} />}
        <div style={{ fontFamily: GOTHIC, fontWeight: 800, fontSize: H * 0.034, color: "#fff", textAlign: "center", whiteSpace: "pre-line", padding: "0 60px" }}>{sc.cta ?? data.cta ?? ""}</div>
      </AbsoluteFill>
    );
  }
  const card2On = sc.card2 && frame >= Math.round((sc.card2.at ?? 0.5) * sc.dur * fps);
  const card = card2On ? sc.card2 : sc.card;
  const cardFrame = card2On ? frame - Math.round((sc.card2!.at ?? 0.5) * sc.dur * fps) : frame;
  return (
    <AbsoluteFill>
      {label && <Label text={label} note={note} H={H} W={W} P={P} frame={sc.label ? frame : 999} fps={fps} />}
      {card && <Card c={card} H={H} W={W} P={P} frame={sc.card || card2On ? cardFrame : 999} fps={fps} />}
      {sc.hookFire && cur ? <FireText text={cur.t} H={H} W={W} frame={frame} /> : cur && <SubBox text={cur.t} H={H} P={P} />}
    </AbsoluteFill>
  );
};

export const BgTalk: React.FC<{ data: ProjectData }> = ({ data: raw }) => {
  const data = raw as unknown as BData;
  const { fps, width: W, height: H } = useVideoConfig();
  // 섹션 라벨은 다음 라벨이 나올 때까지 유지
  const labeled = data.scenes.reduce<{ out: { sc: BScene; label?: string; note?: string }[]; label?: string; note?: string }>((acc, sc) => {
    let label = acc.label, note = acc.note;
    if (sc.label !== undefined) { label = sc.label || undefined; note = sc.note; }
    else if (sc.note !== undefined) note = sc.note;
    if (sc.intro || sc.ending) { label = undefined; note = undefined; }
    return { out: [...acc.out, { sc, label, note }], label, note };
  }, { out: [] }).out;
  const bgDur = Math.max(1, Math.round((data.bgDur ?? 8) * fps));
  const bodyTotal = Math.ceil(data.total * fps);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <style>{`
        @font-face{font-family:'Pretendard';font-weight:400;src:url('${staticFile("fonts/Pretendard-Regular.otf")}') format('opentype');}
        @font-face{font-family:'Pretendard';font-weight:500;src:url('${staticFile("fonts/Pretendard-Medium.otf")}') format('opentype');}
        @font-face{font-family:'Pretendard';font-weight:800;src:url('${staticFile("fonts/Pretendard-ExtraBold.otf")}') format('opentype');}
        @font-face{font-family:'Pretendard';font-weight:900;src:url('${staticFile("fonts/Pretendard-Black.otf")}') format('opentype');}
        @font-face{font-family:'BMJUA';src:url('${staticFile("fonts/BMJUA.otf")}') format('opentype');}
      `}</style>
      {data.bg && (
        <Sequence from={0} durationInFrames={bodyTotal} layout="none">
          <Loop durationInFrames={bgDur} layout="none">
            <OffthreadVideo src={src(data.bg)} muted style={{ position: "absolute", inset: 0, width: W, height: H, objectFit: "cover" }} />
          </Loop>
        </Sequence>
      )}
      {!data.bg && data.bgStill && <Img src={src(data.bgStill)} style={{ position: "absolute", inset: 0, width: W, height: H, objectFit: "cover" }} />}
      {data.audio && <Audio src={src(data.audio)} />}
      {labeled.map(({ sc, label, note }) => (
        <Sequence key={sc.idx} from={Math.round(sc.start * fps)} durationInFrames={Math.round(sc.dur * fps)} layout="none">
          <SceneView sc={sc} data={data} label={label} note={note} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
