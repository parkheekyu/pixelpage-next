// AUTO-COPIED from 광고제작/remotion/src/BgTalk.tsx by pipeline/editor_publish.py — 직접 수정 금지
import { AbsoluteFill, Audio, Img, Loop, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { ProjectData } from "./types";

/*
 * BgTalk (배경 토크): 컷 없는 한 장면 배경 영상(고정) 위에 요소만 띄우는 정보형 릴스.
 * 레퍼런스(AI 목소리 툴 모음, 42s) 프레임 분석 → presets/_analysis/bg_talk.md
 *  - 배경: presets/bg_talk_samples/bg_hf_48s.mp4 고정(사용자 지정). 위치·확대는 bg_x/bg_y/bg_scale.
 *  - 요소(라벨·메모·카드·자막·불글자·엔딩 CTA)는 모두 프리셋 스칼라로 위치(cx, cy)·크기·폰트·색을 받는다 → 대시보드 편집기에서 드래그/설정.
 *  - 애니메이션 없음(2026-10-09 사용자 지시): 팝·스프링·페이드·깜빡임 없이 즉시 표시.
 *  - 폰트: 라벨 BMJUA(배민 주아), 자막 Pretendard Regular 기본. 기랑해랑 금지.
 *  - 인트로 카드: 같은 배경 위 검정 박스 3줄 + 로고, 자막 박스 없음. 엔딩: 검정 + CTA (+로고).
 * 파라미터 기본값은 presets/bg_talk.json 과 같고, 아래 D 가 코드 폴백.
 */

type Chunk = { t: string; s: number; e: number };
type CardSpec = { file: string; aspect?: number; w?: number; x?: number; y?: number; at?: number };
type Intro = { lines: string[]; logos?: string[]; bg?: string; bgDur?: number };
type BScene = {
  idx: number; start: number; dur: number; chunks: Chunk[];
  label?: string; note?: string; card?: CardSpec; card2?: CardSpec;
  hookFire?: boolean; intro?: Intro; ending?: boolean; cta?: string;
};
type BData = Omit<ProjectData, "scenes"> & { scenes: BScene[]; bg?: string; bgDur?: number; bgStill?: string; cta?: string; logo?: string };
type P = Record<string, unknown>;

/** 대시보드 편집기(Remotion Player)에서는 미디어가 절대 URL 로 온다 → 그대로, 아니면 public/ 기준 */
const src = (p: string) => (/^https?:\/\//.test(p) ? p : staticFile(p));

/** 폰트 이름 → font-family (public/fonts 의 @font-face 이름) */
const FAM: Record<string, string> = {
  Pretendard: "'Pretendard', 'Apple SD Gothic Neo', sans-serif", BMJUA: "'BMJUA', 'Pretendard', sans-serif", Jalnan2: "'Jalnan2', 'Pretendard', sans-serif",
  GumiRomance: "'GumiRomance', 'Pretendard', sans-serif", BMYEONSUNG: "'BMYEONSUNG', 'Pretendard', sans-serif", BMEULJIRO: "'BMEULJIRO', 'Pretendard', sans-serif", Kirang: "'Kirang', 'Pretendard', sans-serif",
};
const fam = (name: unknown, dflt: string) => FAM[String(name || dflt).replace(/ .*/, "")] ?? FAM[dflt];

/** 기본값(presets/bg_talk.json 과 동일하게 유지) */
export const BGTALK_DEFAULTS: Record<string, number | string> = {
  sub_cx: 0.5, sub_cy: 0.60, sub_size: 0.031, sub_alpha: 0.8, sub_font: "Pretendard", sub_weight: 400, sub_color: "#ffffff", sub_bg: "#000000", sub_lh: 1.25, sub_ls: -0.3, sub_pad_y: 0.12, sub_pad_x: 0.32, sub_radius: 0.12, sub_stroke: 0,
  label_cx: 0.5, label_cy: 0.26, label_size: 0.048, label_font: "BMJUA", label_color: "#ffffff", label_stroke: 0.06, label_stroke_color: "#222222", label_ls: 0,
  note_cx: 0.5, note_cy: 0.335, note_size: 0.03, note_font: "BMJUA", note_color: "#ffffff", note_stroke: 0.035,
  card_cx: 0.5, card_cy: 0.44, card_h: 0.13, card_w: 0.6, card_radius: 0, card_shadow: 0,
  fire_cx: 0.5, fire_cy: 0.55, fire_size: 0.05, fire_rot: -2,
  cta_cy: 0.5, cta_size: 0.034, cta_font: "Pretendard", cta_color: "#ffffff", logo_w: 0.22,
  intro_x: 0.08, intro_y: 0.50, intro_size: 0.03, intro_logo_x: 0.6, intro_logo_y: 0.36, intro_logo_w: 0.17,
  bg_x: 0, bg_y: 0, bg_scale: 1,
};
const D = BGTALK_DEFAULTS;
const n = (P: P, k: string) => Number(P[k] ?? D[k]);
const s = (P: P, k: string) => String(P[k] ?? D[k]);
const rgba = (hex: string, a: number) => { const h = hex.replace("#", ""); const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h; const r = parseInt(v.slice(0, 2), 16), g = parseInt(v.slice(2, 4), 16), b = parseInt(v.slice(4, 6), 16); return `rgba(${r},${g},${b},${a})`; };

const SubBox: React.FC<{ text: string; H: number; W: number; P: P }> = ({ text, H, W, P }) => {
  const fs = H * n(P, "sub_size"), st = n(P, "sub_stroke");
  return (
    <div style={{ position: "absolute", left: W * n(P, "sub_cx"), top: H * n(P, "sub_cy"), transform: "translate(-50%,-50%)" }}>
      <div data-el="sub" style={{ background: rgba(s(P, "sub_bg"), n(P, "sub_alpha")), color: s(P, "sub_color"), fontFamily: fam(P.sub_font, "Pretendard"), fontWeight: n(P, "sub_weight"), fontSize: fs, lineHeight: n(P, "sub_lh"), padding: `${fs * n(P, "sub_pad_y")}px ${fs * n(P, "sub_pad_x")}px`, borderRadius: fs * n(P, "sub_radius"), whiteSpace: "pre", letterSpacing: n(P, "sub_ls"), WebkitTextStroke: st ? `${fs * st}px #000` : undefined, paintOrder: "stroke fill", textAlign: "center" }}>{text}</div>
    </div>
  );
};

const Label: React.FC<{ text: string; note?: string; H: number; W: number; P: P }> = ({ text, note, H, W, P }) => {
  const fs = H * n(P, "label_size"), ns = H * n(P, "note_size");
  return (
    <>
      <div data-el="label" style={{ position: "absolute", left: W * n(P, "label_cx"), top: H * n(P, "label_cy"), transform: "translate(-50%,-50%)", textAlign: "center", fontFamily: fam(P.label_font, "BMJUA"), fontSize: fs, color: s(P, "label_color"), WebkitTextStroke: `${fs * n(P, "label_stroke")}px ${s(P, "label_stroke_color")}`, paintOrder: "stroke fill", textShadow: "0 2px 6px rgba(0,0,0,0.35)", whiteSpace: "pre", letterSpacing: n(P, "label_ls") }}>{text}</div>
      {note && <div data-el="note" style={{ position: "absolute", left: W * n(P, "note_cx"), top: H * n(P, "note_cy"), transform: "translate(-50%,-50%)", textAlign: "center", fontFamily: fam(P.note_font, "BMJUA"), fontSize: ns, color: s(P, "note_color"), WebkitTextStroke: `${ns * n(P, "note_stroke")}px ${s(P, "label_stroke_color")}`, paintOrder: "stroke fill", whiteSpace: "pre" }}>{note}</div>}
    </>
  );
};

/** 요소(카드) 실제 크기 — 날것 이미지를 그대로 배치(흰 카드 틀 없음, 2026-10-09 사용자 지시).
 *  c.w 가 있으면 그 폭(화면 비율)으로 고정하고 높이는 원본 비율. 없으면 card_w×card_h 안에 맞춘 기본 크기. 위치는 씬별 c.x/c.y, 없으면 card_cx/card_cy. */
export const cardBox = (c: CardSpec, W: number, H: number, P: P) => {
  const asp = c.aspect ?? 1;
  let w: number, h: number;
  if (c.w != null) { w = W * c.w; h = w / asp; }
  else { const maxH = H * n(P, "card_h"), maxW = W * n(P, "card_w"); h = maxH; w = h * asp; if (w > maxW) { w = maxW; h = w / asp; } }
  return { w, h, cx: W * (c.x ?? n(P, "card_cx")), cy: H * (c.y ?? n(P, "card_cy")) };
};

const Card: React.FC<{ c: CardSpec; H: number; W: number; P: P }> = ({ c, H, W, P }) => {
  const { w, h, cx, cy } = cardBox(c, W, H, P);
  const r = n(P, "card_radius"), sh = n(P, "card_shadow");
  return (
    <div data-el="card" style={{ position: "absolute", left: cx - w / 2, top: cy - h / 2, width: w, height: h, borderRadius: r ? h * r : 0, overflow: "hidden", boxShadow: sh ? "0 8px 22px rgba(0,0,0,0.35)" : undefined }}>
      <Img src={src(c.file)} style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }} />
    </div>
  );
};

const FireText: React.FC<{ text: string; H: number; W: number; P: P }> = ({ text, H, W, P }) => {
  const fs = H * n(P, "fire_size");
  return (
    <div style={{ position: "absolute", left: W * n(P, "fire_cx"), top: H * n(P, "fire_cy"), transform: `translate(-50%,-50%) rotate(${n(P, "fire_rot")}deg)` }}>
      <div data-el="sub" style={{ fontFamily: FAM.Pretendard, fontWeight: 900, fontSize: fs, color: "#fff", letterSpacing: 1, background: "linear-gradient(180deg,#fff2a8 0%,#ffb000 45%,#ff3d00 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 0 10px rgba(255,120,0,0.9)) drop-shadow(0 0 22px rgba(255,60,0,0.6))", padding: "0 10px", whiteSpace: "pre" }}>{text}</div>
    </div>
  );
};

const IntroCard: React.FC<{ it: Intro; H: number; W: number; P: P; fps: number }> = ({ it, H, W, P, fps }) => {
  const fs = H * n(P, "intro_size");
  return (
    <>
      {it.bg && (
        <Loop durationInFrames={Math.max(1, Math.round((it.bgDur ?? 4) * fps))} layout="none">
          <OffthreadVideo src={src(it.bg)} muted style={{ position: "absolute", inset: 0, width: W, height: H, objectFit: "cover" }} />
        </Loop>
      )}
      {(it.logos ?? []).map((lg, i) => {
        const sz = W * n(P, "intro_logo_w"); const x = W * (n(P, "intro_logo_x") + (i % 2) * 0.16), y = H * (n(P, "intro_logo_y") + Math.floor(i / 2) * 0.1 - (i % 2) * 0.05);
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: sz, height: sz, borderRadius: sz * 0.22, background: "#fff", boxShadow: "0 8px 20px rgba(0,0,0,0.3)", overflow: "hidden" }}><Img src={src(lg)} style={{ width: "100%", height: "100%", objectFit: "contain", padding: sz * 0.12 }} /></div>;
      })}
      <div data-el="intro" style={{ position: "absolute", left: W * n(P, "intro_x"), top: H * n(P, "intro_y"), display: "flex", flexDirection: "column", gap: 4 }}>
        {it.lines.map((l, i) => <div key={i} style={{ background: "#000", color: "#fff", fontFamily: fam(P.sub_font, "Pretendard"), fontWeight: 500, fontSize: fs, padding: `${fs * 0.15}px ${fs * 0.4}px`, whiteSpace: "pre", alignSelf: "flex-start" }}>{l}</div>)}
      </div>
    </>
  );
};

const SceneView: React.FC<{ sc: BScene; data: BData; label?: string; note?: string }> = ({ sc, data, label, note }) => {
  const frame = useCurrentFrame(); const { fps, width: W, height: H } = useVideoConfig();
  const P = data.preset as P;
  const cur = sc.chunks.find((c) => frame >= c.s * fps && frame < c.e * fps) ?? (frame >= (sc.chunks.at(-1)?.e ?? 0) * fps ? sc.chunks.at(-1) : undefined);
  // 인트로 카드: 제목 3줄이 자막 역할 → 자막 박스 없음. intro.bg 가 없으면 메인 배경 유지
  if (sc.intro) return <AbsoluteFill><IntroCard it={sc.intro} H={H} W={W} P={P} fps={fps} /></AbsoluteFill>;
  if (sc.ending) {
    const lw = W * n(P, "logo_w");
    return (
      <AbsoluteFill style={{ background: "#000" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: H * n(P, "cta_cy"), transform: "translateY(-50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {data.logo && <Img src={src(data.logo)} style={{ width: lw, height: lw, borderRadius: "50%", objectFit: "cover", marginBottom: H * 0.02 }} />}
          <div data-el="cta" style={{ fontFamily: fam(P.cta_font, "Pretendard"), fontWeight: 800, fontSize: H * n(P, "cta_size"), color: s(P, "cta_color"), textAlign: "center", whiteSpace: "pre-line", padding: "0 60px" }}>{sc.cta ?? data.cta ?? ""}</div>
        </div>
      </AbsoluteFill>
    );
  }
  const card2On = sc.card2 && frame >= Math.round((sc.card2.at ?? 0.5) * sc.dur * fps);
  const card = card2On ? sc.card2 : sc.card;
  return (
    <AbsoluteFill>
      {label && <Label text={label} note={note} H={H} W={W} P={P} />}
      {card && <Card c={card} H={H} W={W} P={P} />}
      {sc.hookFire && cur ? <FireText text={cur.t} H={H} W={W} P={P} /> : cur && <SubBox text={cur.t} H={H} W={W} P={P} />}
    </AbsoluteFill>
  );
};

export const BgTalk: React.FC<{ data: ProjectData }> = ({ data: raw }) => {
  const data = raw as unknown as BData;
  const { fps, width: W, height: H } = useVideoConfig();
  const P = data.preset as P;
  // 섹션 라벨은 다음 라벨이 나올 때까지 유지 (렌더 중 변수 재할당 금지 → reduce)
  const labeled = data.scenes.reduce<{ out: { sc: BScene; label?: string; note?: string }[]; label?: string; note?: string }>((acc, sc) => {
    let label = acc.label, note = acc.note;
    if (sc.label !== undefined) { label = sc.label || undefined; note = sc.note; }
    else if (sc.note !== undefined) note = sc.note;
    if (sc.intro || sc.ending) { label = undefined; note = undefined; }
    return { out: [...acc.out, { sc, label, note }], label, note };
  }, { out: [] }).out;
  const bgDur = Math.max(1, Math.round((data.bgDur ?? 8) * fps));
  const bodyTotal = Math.ceil(data.total * fps);
  const bgStyle: React.CSSProperties = { position: "absolute", inset: 0, width: W, height: H, objectFit: "cover", transform: `translate(${n(P, "bg_x") * W}px, ${n(P, "bg_y") * H}px) scale(${n(P, "bg_scale")})`, transformOrigin: "center" };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <style>{`
        @font-face{font-family:'Pretendard';font-weight:400;src:url('${staticFile("fonts/Pretendard-Regular.otf")}') format('opentype');}
        @font-face{font-family:'Pretendard';font-weight:500;src:url('${staticFile("fonts/Pretendard-Medium.otf")}') format('opentype');}
        @font-face{font-family:'Pretendard';font-weight:800;src:url('${staticFile("fonts/Pretendard-ExtraBold.otf")}') format('opentype');}
        @font-face{font-family:'Pretendard';font-weight:900;src:url('${staticFile("fonts/Pretendard-Black.otf")}') format('opentype');}
        @font-face{font-family:'BMJUA';src:url('${staticFile("fonts/BMJUA.otf")}') format('opentype');}
        @font-face{font-family:'Jalnan2';src:url('${staticFile("fonts/Jalnan2.ttf")}') format('truetype');}
        @font-face{font-family:'GumiRomance';src:url('${staticFile("fonts/GumiRomance.otf")}') format('opentype');}
        @font-face{font-family:'BMYEONSUNG';src:url('${staticFile("fonts/BMYEONSUNG.otf")}') format('opentype');}
        @font-face{font-family:'BMEULJIRO';src:url('${staticFile("fonts/BMEULJIRO.otf")}') format('opentype');}
        @font-face{font-family:'Kirang';src:url('${staticFile("fonts/Kirang.otf")}') format('opentype');}
      `}</style>
      {data.bg && (
        <Sequence from={0} durationInFrames={bodyTotal} layout="none">
          <Loop durationInFrames={bgDur} layout="none">
            <OffthreadVideo src={src(data.bg)} muted style={bgStyle} />
          </Loop>
        </Sequence>
      )}
      {!data.bg && data.bgStill && <Img src={src(data.bgStill)} style={bgStyle} />}
      {data.audio && <Audio src={src(data.audio)} />}
      {labeled.map(({ sc, label, note }) => (
        <Sequence key={sc.idx} from={Math.round(sc.start * fps)} durationInFrames={Math.round(sc.dur * fps)} layout="none">
          <SceneView sc={sc} data={data} label={label} note={note} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
