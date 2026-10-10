// AUTO-COPIED from 광고제작/remotion/src/MotionCard.tsx by pipeline/editor_publish.py — 직접 수정 금지
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { ProjectData } from "./types";

/*
 * MotionCard (모션 카드): 배경 영상 없이 단색 배경(흰/검정) 위에 "요소 1개 + 헤드라인 2줄 + 브랜드 로고 줄"만 두는 B2B 세일즈 모션그래픽.
 * 레퍼런스(Onthe AI "원장님, 네이버 블로그 마케팅 고민 많으시죠?" 39s) 분석 → presets/_analysis/motion_card.md
 *  - 씬 = 문장. 92% 정지, 모션은 등장 0.3s / 교체 0.2s / 전환 0.37s 에만.
 *  - 레이아웃 bottom(요소 y0.40 + 텍스트 y0.63) / hook(로고 y0.367 + 텍스트 y0.46) / top(제목 y0.25 + 기기 + 단계칩 y0.645) / cta(아이콘 y0.335 + 텍스트 y0.43 + 버튼 y0.546). 브랜드 줄 y0.751 고정.
 *  - 요소: logo · chip(라벨 순환) · pins(지도+핀) · phone(폰 목업+블롭) · card(응답 카드 스켈레톤) · toggle · device(캡처+단계칩) · cta · image
 *  - 전환(이 씬으로 들어올 때): wipe(원형 와이프) · flash(어두움→회색→밝음) · fade · none
 *  - 폰트 Pretendard 만. 강조색 accent(#07C65F). 편집기 호환: src() 헬퍼, data-el 마커, 위치·크기는 프리셋 스칼라.
 */

type Chunk = { t: string; s: number; e: number };
type Label = { name: string; icon?: string };
type Shot = { file: string; step?: number; label?: string; at?: number };
type El = {
  type: "logo" | "chip" | "pins" | "phone" | "card" | "toggle" | "device" | "cta" | "image";
  file?: string; w?: number; text?: string; labels?: Label[]; every?: number; map?: string; pins?: [number, number][];
  screen?: string; blob?: [string, string]; title?: string; lines?: number; left?: string; right?: string; on_at?: number;
  shots?: Shot[]; face?: string; icon?: string; button?: string; aspect?: number;
};
type MScene = { idx: number; start: number; dur: number; chunks: Chunk[]; headline?: string[]; theme?: "light" | "dark"; layout?: "bottom" | "hook" | "top" | "cta"; el?: El; transition?: "wipe" | "flash" | "fade" | "none"; blob?: [string, string] };
type MData = Omit<ProjectData, "scenes"> & { scenes: MScene[]; brand?: { icon?: string; name?: string } };
type P = Record<string, unknown>;

const src = (p: string) => (/^https?:\/\//.test(p) ? p : staticFile(p));
const FONT = "'Pretendard', 'Apple SD Gothic Neo', sans-serif";
export const MOTION_DEFAULTS: Record<string, number | string> = {
  accent: "#07C65F", light_bg: "#FFFFFF", dark_bg: "#101010", light_text: "#111111", dark_text: "#FFFFFF",
  el_cy: 0.40, el_h: 0.22, text_cy: 0.63, text_size: 0.031, text_lh: 1.35, hook_el_cy: 0.367, hook_text_cy: 0.46, hook_text_size: 0.036,
  top_text_cy: 0.25, top_el_cy: 0.46, top_el_h: 0.27, top_chip_cy: 0.645, cta_icon_cy: 0.335, cta_text_cy: 0.43, cta_btn_cy: 0.546, cta_btn_w: 0.72,
  brand_cy: 0.751, brand_size: 0.02, enter: 0.22, swap: 0.15, wipe: 0.3, chip_every: 1.0, chip_w: 0.76, chip_h: 0.045,
};
const D = MOTION_DEFAULTS;
const n = (P: P, k: string) => Number(P[k] ?? D[k]);
const s = (P: P, k: string) => String(P[k] ?? D[k]);

/** 등장: 0→1 (ease-out), 스케일 0.85→1 + 페이드 */
const enterP = (frame: number, fps: number, dur: number, delay = 0) => interpolate(frame - delay * fps, [0, dur * fps], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: (t) => 1 - Math.pow(1 - t, 3) });
const popStyle = (p: number): React.CSSProperties => ({ opacity: p, transform: `scale(${0.85 + 0.15 * p})` });

/** [[강조]] 마크업 → 스팬 */
const Rich: React.FC<{ text: string; accent: string; bold?: boolean }> = ({ text, accent, bold }) => {
  const parts = text.split(/(\[\[.*?\]\])/g).filter(Boolean);
  return <>{parts.map((p, i) => p.startsWith("[[") ? <span key={i} style={{ color: accent, fontWeight: 700 }}>{p.slice(2, -2)}</span> : <span key={i} style={{ fontWeight: bold ? 700 : 600 }}>{p}</span>)}</>;
};

const Headline: React.FC<{ lines: string[]; cy: number; size: number; color: string; accent: string; H: number; W: number; P: P }> = ({ lines, cy, size, color, accent, H, W, P }) => (
  <div data-el="sub" style={{ position: "absolute", left: 0, width: W, top: H * cy, transform: "translateY(-50%)", textAlign: "center", fontFamily: FONT, fontSize: H * size, lineHeight: n(P, "text_lh"), color, letterSpacing: -0.5, whiteSpace: "pre" }}>
    {lines.map((l, i) => <div key={i}><Rich text={l} accent={accent} bold={i === lines.length - 1} /></div>)}
  </div>
);

const Brand: React.FC<{ data: MData; dark: boolean; H: number; W: number; P: P }> = ({ data, dark, H, W, P }) => {
  if (!data.brand?.name && !data.brand?.icon) return null;
  const fs = H * n(P, "brand_size");
  return (
    <div data-el="label" style={{ position: "absolute", left: 0, width: W, top: H * n(P, "brand_cy"), transform: "translateY(-50%)", display: "flex", justifyContent: "center", alignItems: "center", gap: fs * 0.35, fontFamily: FONT, fontWeight: 500, fontSize: fs, color: dark ? "#dddddd" : "#222222" }}>
      {data.brand.icon && <Img src={src(data.brand.icon)} style={{ height: fs * 1.15, filter: dark ? "invert(1)" : undefined }} />}
      <span>{data.brand.name}</span>
    </div>
  );
};

// ---------- 요소들 ----------
const Logo: React.FC<{ el: El; p: number; H: number; W: number; cy: number }> = ({ el, p, H, W, cy }) => {
  const w = W * (el.w ?? 0.07);
  return <div data-el="card" style={{ position: "absolute", left: W / 2 - w / 2, top: H * cy - w / 2, width: w, height: w, ...popStyle(p) }}>{el.file && <Img src={src(el.file)} style={{ width: "100%", height: "100%", objectFit: "contain" }} />}</div>;
};

const Chip: React.FC<{ el: El; frame: number; fps: number; dark: boolean; H: number; W: number; P: P; cy: number }> = ({ el, frame, fps, dark, H, W, P, cy }) => {
  const enter = n(P, "enter"), every = el.every ?? n(P, "chip_every"); const t = frame / fps;
  const p = enterP(frame, fps, enter);
  const cw = W * n(P, "chip_w"), ch = H * n(P, "chip_h"); const fs = ch * 0.4;
  const labels = el.labels ?? []; const li = labels.length ? Math.min(labels.length - 1, Math.floor(Math.max(0, t - 0.1) / every)) : -1;
  const lab = li >= 0 ? labels[li] : null; const lt = li >= 0 ? (t - 0.1 - li * every) : 0; const lp = Math.min(1, lt / 0.15);
  const w = cw * (0.08 + 0.92 * p); const bg = dark ? "#171717" : "#F2F4F7", bd = dark ? "#3a3a3a" : "#E2E5EA", fg = dark ? "#eeeeee" : "#222222";
  return (
    <div data-el="card" style={{ position: "absolute", left: 0, width: W, top: H * cy - ch / 2, height: ch }}>
      {lab && <div style={{ position: "absolute", left: 0, width: W, top: -ch * 1.05, textAlign: "center", fontFamily: FONT, fontWeight: 500, fontSize: fs * 1.05, color: fg, opacity: lp, transform: `translateY(${(1 - lp) * 6}px)`, display: "flex", justifyContent: "center", alignItems: "center", gap: fs * 0.3 }}>{lab.icon && <Img src={src(lab.icon)} style={{ height: fs * 1.2 }} />}<span>{lab.name}</span></div>}
      <div style={{ position: "absolute", left: W / 2 - w / 2, width: w, height: ch, borderRadius: ch / 2, background: bg, border: `1px solid ${bd}`, overflow: "hidden", display: "flex", alignItems: "center", gap: fs * 0.9, paddingLeft: ch * 0.5, boxSizing: "border-box" }}>
        <span style={{ color: fg, fontSize: fs * 1.3, fontWeight: 300, lineHeight: 1 }}>+</span>
        <span style={{ fontFamily: FONT, fontWeight: 400, fontSize: fs, color: fg, whiteSpace: "nowrap", opacity: p > 0.8 ? (p - 0.8) * 5 : 0 }}>{el.text}</span>
      </div>
    </div>
  );
};

const Pins: React.FC<{ el: El; frame: number; fps: number; H: number; W: number; P: P; cy: number; accent: string }> = ({ el, frame, fps, H, W, P, cy, accent }) => {
  const h = H * n(P, "el_h"), w = h; const left = W / 2 - w / 2, top = H * cy - h / 2;
  const mp = enterP(frame, fps, 0.15);
  const pins = el.pins ?? [[0.42, 0.22], [0.5, 0.3], [0.63, 0.33], [0.36, 0.5], [0.58, 0.55], [0.47, 0.72]];
  return (
    <div data-el="card" style={{ position: "absolute", left, top, width: w, height: h, opacity: mp }}>
      {el.map && <Img src={src(el.map)} style={{ width: "100%", height: "100%", objectFit: "contain", opacity: 0.9 }} />}
      {pins.map(([x, y], i) => {
        const pp = enterP(frame, fps, 0.25, 0.15 + i * 0.1); const breathe = 0.75 + 0.25 * Math.sin(frame / fps * 2.2 + i);
        const sz = h * 0.085;
        return (
          <div key={i} style={{ position: "absolute", left: x * w - sz / 2, top: y * h - sz, width: sz, height: sz, opacity: pp, transform: `translateY(${(1 - pp) * -20}px)` }}>
            <div style={{ position: "absolute", inset: -sz * 0.6, borderRadius: "50%", background: accent, opacity: 0.22 * breathe, filter: `blur(${sz * 0.35}px)` }} />
            <svg viewBox="0 0 24 32" width={sz} height={sz * 1.33} style={{ position: "absolute", left: 0, top: 0 }}><path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill={accent} /><circle cx="12" cy="12" r="5" fill="#fff" /></svg>
          </div>
        );
      })}
    </div>
  );
};

const Phone: React.FC<{ el: El; frame: number; fps: number; H: number; W: number; P: P; cy: number; dark: boolean }> = ({ el, frame, fps, H, W, P, cy, dark }) => {
  const h = H * n(P, "el_h") * 0.95, w = h * 0.48; const p = enterP(frame, fps, n(P, "enter"));
  const cp = enterP(frame, fps, 0.25, 0.3); const ch = H * n(P, "chip_h") * 0.9; const fs = ch * 0.4;
  return (
    <div data-el="card" style={{ position: "absolute", left: 0, width: W, top: H * cy - h / 2, height: h }}>
      <div style={{ position: "absolute", left: W / 2 - w / 2, top: (1 - p) * h * 0.6, width: w, height: h, borderRadius: w * 0.14, background: "#1c1c1e", padding: w * 0.035, boxSizing: "border-box", opacity: p, boxShadow: "0 20px 60px rgba(0,0,0,0.45)" }}>
        <div style={{ width: "100%", height: "100%", borderRadius: w * 0.11, overflow: "hidden", background: "linear-gradient(180deg,#ffffff 0%,#e9f1ff 70%,#cfe0ff 100%)" }}>{el.screen && <Img src={src(el.screen)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}</div>
      </div>
      {el.text && <div style={{ position: "absolute", left: W / 2 - W * 0.4, width: W * 0.8, top: h * 0.5 - ch / 2, height: ch, borderRadius: ch / 2, background: dark ? "rgba(20,20,20,0.92)" : "#F2F4F7", border: `1px solid ${dark ? "#3a3a3a" : "#E2E5EA"}`, display: "flex", alignItems: "center", gap: fs * 0.9, paddingLeft: ch * 0.5, boxSizing: "border-box", opacity: cp, transform: `translateY(${(1 - cp) * 10}px)` }}><span style={{ color: "#eee", fontSize: fs * 1.3, fontWeight: 300 }}>+</span><span style={{ fontFamily: FONT, fontSize: fs, color: "#eee", whiteSpace: "nowrap" }}>{el.text}</span></div>}
    </div>
  );
};

const Card: React.FC<{ el: El; frame: number; fps: number; H: number; W: number; P: P; cy: number; dark: boolean; accent: string }> = ({ el, frame, fps, H, W, P, cy, dark, accent }) => {
  const w = W * (el.w ?? 0.82), h = H * n(P, "el_h") * 0.6; const p = enterP(frame, fps, n(P, "enter")); const fs = h * 0.11;
  const lines = el.lines ?? 3;
  return (
    <div data-el="card" style={{ position: "absolute", left: W / 2 - w / 2, top: H * cy - h / 2, width: w, height: h, borderRadius: h * 0.12, background: dark ? "rgba(255,255,255,0.04)" : "#F7F8FA", border: `1px solid ${dark ? "rgba(255,255,255,0.14)" : "#E2E5EA"}`, padding: h * 0.14, boxSizing: "border-box", ...popStyle(p) }}>
      <div style={{ display: "flex", alignItems: "center", gap: fs * 0.5, fontFamily: FONT, fontWeight: 500, fontSize: fs, color: dark ? "#ddd" : "#333" }}><span style={{ color: accent }}>✦</span>{el.title}</div>
      {Array.from({ length: lines }).map((_, i) => <div key={i} style={{ marginTop: fs * 0.75, height: fs * 0.55, width: `${[82, 64, 72, 50][i % 4]}%`, borderRadius: fs * 0.3, background: dark ? "rgba(255,255,255,0.12)" : "#E3E6EB", opacity: enterP(frame, fps, 0.2, 0.25 + i * 0.08) }} />)}
    </div>
  );
};

const Toggle: React.FC<{ el: El; frame: number; fps: number; H: number; W: number; P: P; cy: number; dark: boolean; accent: string }> = ({ el, frame, fps, H, W, P, cy, dark, accent }) => {
  const w = W * 0.22, h = w * 0.5; const p = enterP(frame, fps, n(P, "enter")); const onAt = el.on_at ?? 0.45; const on = enterP(frame, fps, 0.27, onAt);
  const knob = h * 0.84; const fs = h * 0.26;
  return (
    <div data-el="card" style={{ position: "absolute", left: W / 2 - w / 2, top: H * cy - h / 2, width: w, height: h * 1.6, ...popStyle(p) }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: w, height: h, borderRadius: h / 2, background: on < 0.5 ? (dark ? "#3a3a3a" : "#d6d6d6") : `linear-gradient(90deg, ${accent} 0%, #3A8DFF 100%)`, transition: "none" }}>
        <div style={{ position: "absolute", top: (h - knob) / 2, left: (h - knob) / 2 + on * (w - h), width: knob, height: knob, borderRadius: "50%", background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.25)" }} />
      </div>
      <div style={{ position: "absolute", top: h * 1.15, left: 0, width: w, display: "flex", justifyContent: "space-between", fontFamily: FONT, fontSize: fs, color: dark ? "#aaa" : "#777" }}><span style={{ fontWeight: on < 0.5 ? 700 : 400, color: on < 0.5 ? (dark ? "#fff" : "#111") : undefined }}>{el.left}</span><span style={{ fontWeight: on >= 0.5 ? 700 : 400, color: on >= 0.5 ? (dark ? "#fff" : "#111") : undefined }}>{el.right}</span></div>
    </div>
  );
};

const Device: React.FC<{ el: El; frame: number; fps: number; dur: number; H: number; W: number; P: P; dark: boolean }> = ({ el, frame, fps, dur, H, W, P, dark }) => {
  const h = H * n(P, "top_el_h"), w = Math.min(W * 0.86, h * 1.5); const left = W / 2 - w / 2, top = H * n(P, "top_el_cy") - h / 2;
  const p = enterP(frame, fps, n(P, "enter")); const t = frame / fps;
  const shots = el.shots ?? []; let si = 0; shots.forEach((sh, i) => { if (t >= (sh.at ?? 0) * (sh.at != null && sh.at <= 1 ? dur : 1)) si = i; });
  const cur = shots[si]; const swapT = cur ? (cur.at ?? 0) * ((cur.at ?? 0) <= 1 ? dur : 1) : 0; const sp = si === 0 ? 1 : enterP(frame, fps, n(P, "swap"), swapT);
  const ch = H * n(P, "chip_h"), fs = ch * 0.42; const face = el.face ? W * 0.12 : 0;
  return (
    <>
      <div data-el="card" style={{ position: "absolute", left, top, width: w, height: h, opacity: p, transform: `translateX(${(1 - p) * 40}px)` }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: h * 0.06, background: "#fff", boxShadow: "0 18px 50px rgba(0,0,0,0.18)", border: "1px solid #E6E8EC", overflow: "hidden" }}>
          {cur && <Img src={src(cur.file)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", opacity: sp }} />}
        </div>
        {el.face && <div style={{ position: "absolute", right: -face * 0.15, bottom: -face * 0.2, width: face, height: face, borderRadius: "50%", overflow: "hidden", border: "4px solid #fff", boxShadow: "0 6px 18px rgba(0,0,0,0.25)" }}><Img src={src(el.face)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>}
      </div>
      {cur?.label && (
        <div key={si} style={{ position: "absolute", left: 0, width: W, top: H * n(P, "top_chip_cy") - ch / 2, display: "flex", justifyContent: "center", opacity: sp, transform: `translateY(${(1 - sp) * 8}px)` }}>
          <div style={{ height: ch, minWidth: W * 0.55, borderRadius: ch * 0.2, background: dark ? "#1b1b1b" : "#F2F4F7", display: "flex", alignItems: "center", gap: fs * 0.7, padding: `0 ${ch * 0.5}px`, fontFamily: FONT, fontWeight: 700, fontSize: fs, color: dark ? "#fff" : "#111" }}>
            <span style={{ width: fs * 1.25, height: fs * 1.25, borderRadius: fs * 0.3, background: dark ? "#fff" : "#181818", color: dark ? "#111" : "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: fs * 0.8 }}>{cur.step ?? si + 1}</span>{cur.label}
          </div>
        </div>
      )}
    </>
  );
};

const Cta: React.FC<{ el: El; frame: number; fps: number; H: number; W: number; P: P; dark: boolean }> = ({ el, frame, fps, H, W, P, dark }) => {
  const ic = H * 0.074; const p = enterP(frame, fps, n(P, "enter")); const bp = enterP(frame, fps, n(P, "enter"), 0.12);
  const bw = W * n(P, "cta_btn_w"), bh = H * 0.052; const fs = bh * 0.42;
  return (
    <>
      <div data-el="card" style={{ position: "absolute", left: W / 2 - ic / 2, top: H * n(P, "cta_icon_cy") - ic / 2, width: ic, height: ic, borderRadius: ic * 0.24, background: dark ? "#fff" : "#181818", overflow: "hidden", ...popStyle(p) }}>{el.icon && <Img src={src(el.icon)} style={{ width: "100%", height: "100%", objectFit: "contain", padding: ic * 0.2, boxSizing: "border-box", filter: dark ? undefined : "invert(1)" }} />}</div>
      <div data-el="cta" style={{ position: "absolute", left: W / 2 - bw / 2, top: H * n(P, "cta_btn_cy") - bh / 2, width: bw, height: bh, borderRadius: bh / 2, background: dark ? "#fff" : "#181818", color: dark ? "#111" : "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", padding: `0 ${bh * 0.55}px`, boxSizing: "border-box", fontFamily: FONT, fontWeight: 700, fontSize: fs, ...popStyle(bp) }}>
        <span style={{ flex: 1, textAlign: "center" }}>{el.button}</span><span>→</span>
      </div>
    </>
  );
};

const Picture: React.FC<{ el: El; frame: number; fps: number; H: number; W: number; P: P; cy: number }> = ({ el, frame, fps, H, W, P, cy }) => {
  const maxH = H * n(P, "el_h"), maxW = W * (el.w ?? 0.82); const asp = el.aspect ?? 1.6; let h = maxH, w = h * asp; if (w > maxW) { w = maxW; h = w / asp; }
  const p = enterP(frame, fps, n(P, "enter"));
  return <div data-el="card" style={{ position: "absolute", left: W / 2 - w / 2, top: H * cy - h / 2, width: w, height: h, borderRadius: h * 0.06, overflow: "hidden", boxShadow: "0 18px 50px rgba(0,0,0,0.2)", ...popStyle(p) }}>{el.file && <Img src={src(el.file)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}</div>;
};

// ---------- 씬 ----------
const SceneView: React.FC<{ sc: MScene; data: MData; prevDark: boolean }> = ({ sc, data, prevDark }) => {
  const frame = useCurrentFrame(); const { fps, width: W, height: H } = useVideoConfig(); const P = data.preset as P;
  const dark = sc.theme === "dark"; const accent = s(P, "accent"); const bg = dark ? s(P, "dark_bg") : s(P, "light_bg"); const fg = dark ? s(P, "dark_text") : s(P, "light_text");
  const layout = sc.layout ?? (sc.el?.type === "cta" ? "cta" : sc.el?.type === "device" ? "top" : sc.el ? "bottom" : "hook");
  const el = sc.el; const lines = sc.headline ?? [];
  // 전환 레이어
  const tr = sc.transition ?? "none"; const wipeP = enterP(frame, fps, n(P, "wipe"));
  let bgLayer: React.ReactNode = <AbsoluteFill style={{ background: bg }} />;
  if (tr === "wipe" && prevDark !== dark) {
    const prevBg = prevDark ? s(P, "dark_bg") : s(P, "light_bg"); const cx = W / 2, cy = H * n(P, "hook_el_cy"); const r = Math.hypot(W, H) * wipeP;
    bgLayer = <><AbsoluteFill style={{ background: prevBg }} /><div style={{ position: "absolute", left: cx - r, top: cy - r, width: r * 2, height: r * 2, borderRadius: "50%", background: bg }} /></>;
  } else if (tr === "flash" && prevDark !== dark) {
    const f = frame / fps; const mid = dark ? "#2a2a2a" : "#9a9a9a"; const col = f < 0.05 ? (prevDark ? s(P, "dark_bg") : s(P, "light_bg")) : f < 0.12 ? mid : bg;
    bgLayer = <AbsoluteFill style={{ background: col }} />;
  } else if (tr === "fade") {
    bgLayer = <><AbsoluteFill style={{ background: prevDark ? s(P, "dark_bg") : s(P, "light_bg") }} /><AbsoluteFill style={{ background: bg, opacity: enterP(frame, fps, 0.3) }} /></>;
  }
  const contentOpacity = tr === "wipe" ? interpolate(wipeP, [0.5, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
  // 블롭(하단 그라데이션)
  const blob = sc.blob ?? el?.blob;
  const textCy = layout === "hook" ? n(P, "hook_text_cy") : layout === "top" ? n(P, "top_text_cy") : layout === "cta" ? n(P, "cta_text_cy") : n(P, "text_cy");
  const textSize = layout === "hook" ? n(P, "hook_text_size") : n(P, "text_size");
  const elCy = layout === "hook" ? n(P, "hook_el_cy") : n(P, "el_cy");
  return (
    <AbsoluteFill>
      {bgLayer}
      {blob && <div style={{ position: "absolute", left: -W * 0.3, right: -W * 0.3, top: H * 0.45, bottom: -H * 0.2, background: `radial-gradient(ellipse at 30% 60%, ${blob[0]} 0%, transparent 55%), radial-gradient(ellipse at 75% 55%, ${blob[1]} 0%, transparent 55%)`, filter: "blur(40px)", opacity: 0.85 * enterP(frame, fps, 0.4) }} />}
      <div style={{ position: "absolute", inset: 0, opacity: contentOpacity }}>
        {el?.type === "logo" && <Logo el={el} p={enterP(frame, fps, n(P, "enter"), 0.1)} H={H} W={W} cy={elCy} />}
        {el?.type === "chip" && <Chip el={el} frame={frame} fps={fps} dark={dark} H={H} W={W} P={P} cy={elCy} />}
        {el?.type === "pins" && <Pins el={el} frame={frame} fps={fps} H={H} W={W} P={P} cy={elCy} accent={accent} />}
        {el?.type === "phone" && <Phone el={el} frame={frame} fps={fps} H={H} W={W} P={P} cy={elCy} dark={dark} />}
        {el?.type === "card" && <Card el={el} frame={frame} fps={fps} H={H} W={W} P={P} cy={elCy} dark={dark} accent={accent} />}
        {el?.type === "toggle" && <Toggle el={el} frame={frame} fps={fps} H={H} W={W} P={P} cy={elCy} dark={dark} accent={accent} />}
        {el?.type === "device" && <Device el={el} frame={frame} fps={fps} dur={sc.dur} H={H} W={W} P={P} dark={dark} />}
        {el?.type === "cta" && <Cta el={el} frame={frame} fps={fps} H={H} W={W} P={P} dark={dark} />}
        {el?.type === "image" && <Picture el={el} frame={frame} fps={fps} H={H} W={W} P={P} cy={elCy} />}
        {lines.length > 0 && <Headline lines={lines} cy={textCy} size={textSize} color={fg} accent={accent} H={H} W={W} P={P} />}
        <Brand data={data} dark={dark} H={H} W={W} P={P} />
      </div>
    </AbsoluteFill>
  );
};

export const MotionCard: React.FC<{ data: ProjectData }> = ({ data: raw }) => {
  const data = raw as unknown as MData; const { fps } = useVideoConfig();
  const seq = data.scenes.reduce<{ out: { sc: MScene; prevDark: boolean }[]; prev: boolean }>((acc, sc) => ({ out: [...acc.out, { sc, prevDark: acc.prev }], prev: sc.theme === "dark" }), { out: [], prev: data.scenes[0]?.theme === "dark" }).out;
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      <style>{`
        @font-face{font-family:'Pretendard';font-weight:400;src:url('${staticFile("fonts/Pretendard-Regular.otf")}') format('opentype');}
        @font-face{font-family:'Pretendard';font-weight:500;src:url('${staticFile("fonts/Pretendard-Medium.otf")}') format('opentype');}
        @font-face{font-family:'Pretendard';font-weight:600;src:url('${staticFile("fonts/Pretendard-SemiBold.otf")}') format('opentype');}
        @font-face{font-family:'Pretendard';font-weight:700;src:url('${staticFile("fonts/Pretendard-Bold.otf")}') format('opentype');}
        @font-face{font-family:'Pretendard';font-weight:800;src:url('${staticFile("fonts/Pretendard-ExtraBold.otf")}') format('opentype');}
      `}</style>
      {data.audio && <Audio src={src(data.audio)} />}
      {seq.map(({ sc, prevDark }) => (
        <Sequence key={sc.idx} from={Math.round(sc.start * fps)} durationInFrames={Math.round(sc.dur * fps)} layout="none">
          <SceneView sc={sc} data={data} prevDark={prevDark} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
