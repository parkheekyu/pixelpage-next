"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Player, type PlayerRef } from "@remotion/player";
import { ChevronLeft, Pause, Play, Redo2, RotateCcw, SkipBack, Trash2, Undo2, ZoomIn, ZoomOut } from "lucide-react";
import { COMPOSITIONS } from "@/remotion/registry";
import { BGTALK_DEFAULTS } from "@/remotion/compositions/BgTalk";
import type { ProjectData } from "@/remotion/compositions/types";
import type { CardSpec, EditAsset, EditData, EditScene, ProjectEdit } from "@/lib/dash/editor-types";
import { requestRender, resetProjectEdit, saveProjectEdit } from "@/app/app/editor-actions";

/**
 * 소재 편집기 (캡컷식, 전체화면 다크):
 *  - 가운데 캔버스 = 실제 Remotion 컴포지션(Player). 요소(라벨·메모·카드·자막·배경·CTA)를 **직접 드래그**해 위치 이동, 모서리 핸들로 크기.
 *  - 오른쪽 패널 = 탭(씬 / 라벨 / 메모 / 카드 / 자막 / 배경 / 엔딩): 폰트·사이즈·색상·배경색·테두리·행간·자간·위치 숫자.
 *  - 아래 = 재생 컨트롤 + 파형 타임라인(자막 청크 블록, 가장자리 드래그로 시각).
 *  저장 → dash.project_edits.data (프리셋 스칼라 + 씬 데이터). 최종 저장 = 저장 + 렌더 요청.
 */

type Params = Record<string, unknown>;
type ElemId = "label" | "note" | "card" | "sub" | "bg" | "cta" | "intro";
type Tab = "scene" | ElemId;
const fmt = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(Math.floor(sec % 60)).padStart(2, "0")}.${String(Math.floor((sec % 1) * 10))}`;
const FONTS: [string, string][] = [["Pretendard", "프리텐다드"], ["BMJUA", "배민 주아"], ["Jalnan2", "잘난체"], ["GumiRomance", "낭만있구미체"], ["BMYEONSUNG", "배민 연성"], ["BMEULJIRO", "배민 을지로"]];
const SWATCH = ["#ffffff", "#ff3b30", "#ffcc00", "#34c759", "#5ac8fa", "#000000", "#FFE600", "#ff2d55"];
const H_REF = 1920;

type Ctl = { num: (k: string) => number; str: (k: string) => string; setP: (k: string, v: unknown) => void };
type NumProps = { c: Ctl; k: string; step?: number; min?: number; max?: number; scale?: number; unit?: string };
const Row = ({ label, children }: { label: string; children: React.ReactNode }) => <div className="vx-row"><span>{label}</span><div>{children}</div></div>;
const NumField = ({ c, k, step = 1, min, max, scale = 1, unit }: NumProps) => <label className="vx-num"><input type="number" step={step} min={min} max={max} value={+(c.num(k) * scale).toFixed(scale === 1 ? 3 : 0)} onChange={(e) => c.setP(k, Number(e.target.value) / scale)} />{unit && <small>{unit}</small>}</label>;
const ColorField = ({ c, k }: { c: Ctl; k: string }) => <div className="vx-colors">{SWATCH.map((col) => <button key={col} type="button" className={`vx-sw ${c.str(k).toLowerCase() === col.toLowerCase() ? "on" : ""}`} style={{ background: col }} onClick={() => c.setP(k, col)} />)}<label className="vx-sw custom" title="직접 선택"><input type="color" value={/^#[0-9a-f]{6}$/i.test(c.str(k)) ? c.str(k) : "#ffffff"} onChange={(e) => c.setP(k, e.target.value)} />+</label></div>;
const PosField = ({ c, xk, yk }: { c: Ctl; xk?: string; yk: string }) => <Row label="위치">{xk && <NumField c={c} k={xk} step={0.005} min={0} max={1} />}<NumField c={c} k={yk} step={0.005} min={0} max={1} /><small className="vx-hint">X · Y (0~1, 캔버스에서 드래그 가능)</small></Row>;
const FontField = ({ c, k }: { c: Ctl; k: string }) => <select className="vx-sel" value={c.str(k).replace(/ .*/, "")} onChange={(e) => c.setP(k, e.target.value)}>{FONTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>;

export default function VideoEditor({ edit, projectId, projectName }: { edit: ProjectEdit; projectId: string; projectName: string }) {
  const router = useRouter();
  const Comp = COMPOSITIONS[edit.composition];
  const [data, setData] = useState<EditData>(edit.data);
  const hist = useRef<{ past: EditData[]; future: EditData[] }>({ past: [], future: [] });
  const [tab, setTab] = useState<Tab>("scene");
  const [selChunk, setSelChunk] = useState<number | null>(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [zoom, setZoom] = useState(70);   // px/초
  const [pending, start] = useTransition();
  const player = useRef<PlayerRef>(null);
  const saveRef = useRef<() => void>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<HTMLDivElement>(null);
  const waveRef = useRef<HTMLCanvasElement>(null);
  const [peaks, setPeaks] = useState<Float32Array | null>(null);

  const fps = data.fps, total = data.total, durF = Math.ceil(total * fps);
  const inputProps = useMemo(() => ({ data: data as unknown as ProjectData }), [data]);   // 프레임 변화로는 컴포지션을 다시 그리지 않음(재생 끊김 방지)
  const t = frame / fps;
  const P = data.preset as Params;
  const num = useCallback((k: string) => Number(P[k] ?? BGTALK_DEFAULTS[k] ?? 0), [P]);
  const str = (k: string) => String(P[k] ?? BGTALK_DEFAULTS[k] ?? "");
  const si = useMemo(() => Math.max(0, data.scenes.findIndex((s) => t >= s.start && t < s.start + s.dur)), [data.scenes, t]);
  const scene: EditScene | undefined = data.scenes[si];
  // 현재 유효 라벨/메모(이전 씬에서 이어짐)
  const live = useMemo(() => { let label: string | undefined, note: string | undefined; for (let i = 0; i <= si; i++) { const s = data.scenes[i]; if (s.label !== undefined) { label = s.label || undefined; note = s.note; } else if (s.note !== undefined) note = s.note; if (s.intro || s.ending) { label = undefined; note = undefined; } } return { label, note }; }, [data.scenes, si]);
  const curChunk = scene?.chunks.find((c) => t - scene.start >= c.s && t - scene.start < c.e) ?? scene?.chunks.at(-1);
  const card2On = scene?.card2 && t - scene.start >= (scene.card2.at ?? 0.5) * scene.dur;
  const liveCard = card2On ? scene?.card2 : scene?.card;

  // ---- 상태 변경(히스토리) ----
  const commit = useCallback((fn: (d: EditData) => void) => {
    setData((d) => { const nd = structuredClone(d); fn(nd); hist.current.past.push(d); if (hist.current.past.length > 80) hist.current.past.shift(); hist.current.future = []; return nd; });
    setDirty(true);
  }, []);
  /** 드래그 중 연속 갱신(히스토리 1회만) */
  const liveSet = useCallback((fn: (d: EditData) => void) => { setData((d) => { const nd = structuredClone(d); fn(nd); return nd; }); setDirty(true); }, []);
  const undo = () => { const p = hist.current.past.pop(); if (!p) return; setData((d) => { hist.current.future.push(d); return p; }); };
  const redo = () => { const f = hist.current.future.pop(); if (!f) return; setData((d) => { hist.current.past.push(d); return f; }); };
  const setP = (k: string, v: unknown) => commit((d) => { d.preset[k] = v; });

  // ---- Player ----
  useEffect(() => {
    const p = player.current; if (!p) return;
    const onF = (e: { detail: { frame: number } }) => setFrame(e.detail.frame);
    const onPlay = () => setPlaying(true), onPause = () => setPlaying(false);
    p.addEventListener("frameupdate", onF); p.addEventListener("play", onPlay); p.addEventListener("pause", onPause); p.addEventListener("ended", onPause);
    return () => { p.removeEventListener("frameupdate", onF); p.removeEventListener("play", onPlay); p.removeEventListener("pause", onPause); p.removeEventListener("ended", onPause); };
  }, []);
  const seek = useCallback((sec: number) => player.current?.seekTo(Math.max(0, Math.min(durF - 1, Math.round(sec * fps)))), [durF, fps]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName; if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (e.code === "Space") { e.preventDefault(); player.current?.toggle(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "z") { e.preventDefault(); if (e.shiftKey) redo(); else undo(); }
      if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); saveRef.current?.(); }
    };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });
  useEffect(() => { const h = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); }; window.addEventListener("beforeunload", h); return () => window.removeEventListener("beforeunload", h); }, [dirty]);

  // ---- 파형 ----
  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const buf = await (await fetch(data.audio)).arrayBuffer();
        const ctx = new AudioContext(); const ab = await ctx.decodeAudioData(buf); ctx.close();
        const ch = ab.getChannelData(0); const N = Math.ceil(ab.duration * 50); const out = new Float32Array(N); const step = Math.floor(ch.length / N);
        for (let i = 0; i < N; i++) { let m = 0; for (let j = i * step; j < (i + 1) * step; j += 4) { const v = Math.abs(ch[j] ?? 0); if (v > m) m = v; } out[i] = m; }
        if (!dead) setPeaks(out);
      } catch { /* 파형 없이 진행 */ }
    })();
    return () => { dead = true; };
  }, [data.audio]);
  useEffect(() => {
    const cv = waveRef.current; if (!cv || !peaks) return;
    const w = Math.ceil(total * zoom), h = 56; cv.width = w; cv.height = h;
    const g = cv.getContext("2d")!; g.clearRect(0, 0, w, h); g.fillStyle = "rgba(120,130,255,0.55)";
    for (let i = 0; i < peaks.length; i++) { const x = (i / 50) * zoom; const a = peaks[i] * h * 0.95; g.fillRect(x, h / 2 - a / 2, Math.max(1, zoom / 50 - 0.5), a); }
  }, [peaks, total, zoom]);

  // ---- 캔버스 요소 박스: Player 안에 실제로 그려진 DOM(data-el) 을 측정 → 글자와 정확히 일치 ----
  type Box = { id: ElemId; x: number; y: number; w: number; h: number; sizeKey?: string; posKeys?: [string, string] };
  const KEYS: Record<ElemId, { sizeKey?: string; posKeys?: [string, string] }> = {
    label: { sizeKey: "label_size", posKeys: ["label_cx", "label_cy"] }, note: { sizeKey: "note_size", posKeys: ["note_cx", "note_cy"] },
    card: { sizeKey: "card_h", posKeys: ["card_cx", "card_cy"] }, sub: { sizeKey: "sub_size", posKeys: ["sub_cx", "sub_cy"] },
    cta: { sizeKey: "cta_size", posKeys: ["", "cta_cy"] }, intro: { sizeKey: "intro_size", posKeys: ["intro_x", "intro_y"] }, bg: {},
  };
  const [boxes, setBoxes] = useState<Box[]>([]);
  const measure = useCallback(() => {
    const cv = canvasRef.current; if (!cv) return;
    const R = cv.getBoundingClientRect(); if (!R.width) return;
    const out: Box[] = [];
    if (!scene?.ending) out.push({ id: "bg", x: 0.5, y: 0.5, w: 1, h: 1 });
    cv.querySelectorAll<HTMLElement>("[data-el]").forEach((el) => {
      const id = el.dataset.el as ElemId; const b = el.getBoundingClientRect(); if (!b.width) return;
      const k = { ...KEYS[id] };
      if (id === "sub" && scene?.hookFire) { k.sizeKey = "fire_size"; k.posKeys = ["fire_cx", "fire_cy"]; }
      const px = 3 / R.width, py = 3 / R.height;   // 살짝 여유(3px)
      out.push({ id, x: (b.left + b.width / 2 - R.left) / R.width, y: (b.top + b.height / 2 - R.top) / R.height, w: b.width / R.width + px * 2, h: b.height / R.height + py * 2, ...k });
    });
    setBoxes((prev) => (JSON.stringify(prev) === JSON.stringify(out) ? prev : out));
  }, [scene]);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const id = requestAnimationFrame(measure); return () => cancelAnimationFrame(id); }, [measure, frame, data]);
  useEffect(() => { const id = setInterval(measure, 250); window.addEventListener("resize", measure); return () => { clearInterval(id); window.removeEventListener("resize", measure); }; }, [measure]);

  const [sel, setSel] = useState<ElemId | null>(null);
  // 더블클릭 인라인 텍스트 편집: 어떤 요소의 어떤 텍스트를 고치는지 결정
  type Inline = { id: ElemId; box: Box; value: string; apply: (d: EditData, v: string) => void };
  const [inline, setInline] = useState<Inline | null>(null);
  const definingScene = (key: "label" | "note") => { for (let i = si; i >= 0; i--) { if (data.scenes[i][key] !== undefined) return i; if (data.scenes[i].intro || data.scenes[i].ending) break; } return si; };
  const startInline = (box: Box) => {
    if (!scene) return;
    let value = "", apply: Inline["apply"] | null = null;
    if (box.id === "sub") { const ci = scene.chunks.findIndex((c) => c === curChunk); if (ci < 0) return; value = curChunk!.t; apply = (d, v) => { d.scenes[si].chunks[ci].t = v; }; }
    else if (box.id === "label") { const di = definingScene("label"); value = live.label ?? ""; apply = (d, v) => { d.scenes[di].label = v; }; }
    else if (box.id === "note") { const di = definingScene("note"); value = live.note ?? ""; apply = (d, v) => { d.scenes[di].note = v; }; }
    else if (box.id === "cta") { value = data.cta ?? ""; apply = (d, v) => { d.cta = v; }; }
    else if (box.id === "intro" && scene.intro) { value = scene.intro.lines.join("\n"); apply = (d, v) => { d.scenes[si].intro!.lines = v.split("\n"); }; }
    if (!apply) return;
    player.current?.pause();
    setInline({ id: box.id, box, value, apply });
  };
  /** 선택 요소 삭제: 요소(이미지)는 이 씬에서 제거, 라벨/메모는 이 씬부터 끔, 자막은 현재 청크 삭제, CTA 는 비움 */
  const deleteSelected = () => {
    if (!sel || !scene) return;
    const ck: "card" | "card2" = card2On ? "card2" : "card";
    if (sel === "card") commit((d) => { delete d.scenes[si][ck]; });
    else if (sel === "label") commit((d) => { if (d.scenes[si].label !== undefined) delete d.scenes[si].label; else d.scenes[si].label = ""; if (d.scenes[si].label === undefined && si > 0) d.scenes[si].label = ""; });
    else if (sel === "note") commit((d) => { for (let i = si; i >= 0; i--) { if (d.scenes[i].note !== undefined) { delete d.scenes[i].note; break; } if (d.scenes[i].label !== undefined) break; } });
    else if (sel === "sub") { const ci = scene.chunks.findIndex((c) => c === curChunk); if (ci < 0) return; commit((d) => { const ch = d.scenes[si].chunks; if (ch.length <= 1) { ch[0].t = ""; return; } const cc = ch[ci]; if (ch[ci + 1]) ch[ci + 1].s = cc.s; else if (ch[ci - 1]) ch[ci - 1].e = cc.e; ch.splice(ci, 1); }); }
    else if (sel === "cta") commit((d) => { d.cta = ""; });
    else if (sel === "intro") commit((d) => { if (d.scenes[si].intro) d.scenes[si].intro!.lines = []; });
    setSel(null); setMsg("삭제됨 (⌘Z 로 되돌리기)");
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => { const tag = (e.target as HTMLElement)?.tagName; if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return; if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); deleteSelected(); } };
    window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k);
  });
  const finishInline = (commitIt: boolean) => { if (!inline) return; const { apply, value } = inline; setInline(null); if (commitIt) commit((d) => apply(d, value)); };
  const [guides, setGuides] = useState<{ x: number[]; y: number[] }>({ x: [], y: [] });
  const SNAP = 0.012;   // 스냅 거리(화면 비율)
  /** 마그넷: 캔버스 중앙·3등분·안전 여백 + 다른 요소의 중심/가장자리에 붙인다 */
  const snapTo = useCallback((box: Box, nx: number, ny: number, others: Box[], off: boolean) => {
    if (off) return { x: nx, y: ny, gx: [] as number[], gy: [] as number[] };
    const tx: number[] = [0.5, 1 / 3, 2 / 3, 0.05 + box.w / 2, 0.95 - box.w / 2];
    const ty: number[] = [0.5, 1 / 3, 2 / 3, 0.05 + box.h / 2, 0.95 - box.h / 2];
    for (const o of others) {
      if (o.id === box.id || o.id === "bg") continue;
      tx.push(o.x, o.x - o.w / 2 + box.w / 2, o.x + o.w / 2 - box.w / 2);
      ty.push(o.y, o.y - o.h / 2 + box.h / 2, o.y + o.h / 2 - box.h / 2, o.y + o.h / 2 + box.h / 2 + 0.01, o.y - o.h / 2 - box.h / 2 - 0.01);
    }
    let bx = nx, by = ny, dx = SNAP, dy = SNAP; const gx: number[] = [], gy: number[] = [];
    for (const t of tx) { const d = Math.abs(t - nx); if (d < dx) { dx = d; bx = t; } }
    for (const t of ty) { const d = Math.abs(t - ny); if (d < dy) { dy = d; by = t; } }
    if (bx !== nx) gx.push(bx); if (by !== ny) gy.push(by);
    return { x: bx, y: by, gx, gy };
  }, []);
  const dragRef = useRef<{ box: Box; mode: "move" | "size"; x0: number; y0: number; v0: [number, number]; s0: number; snap: EditData } | null>(null);
  const lastDown = useRef<{ id: ElemId; at: number }>({ id: "bg", at: 0 });
  const onBoxDown = (box: Box, mode: "move" | "size") => (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    // 더블클릭 직접 감지(브라우저 dblclick 에 의존하지 않음): 같은 요소를 350ms 안에 두 번 누르면 인라인 글자 편집
    const now = Date.now();
    if (mode === "move" && lastDown.current.id === box.id && now - lastDown.current.at < 350) { lastDown.current = { id: box.id, at: 0 }; startInline(box); return; }
    lastDown.current = { id: box.id, at: now };
    setSel(box.id); setTab(box.id);
    const rect = canvasRef.current!.getBoundingClientRect();
    const ck: "card" | "card2" = card2On ? "card2" : "card";
    const cardNow = scene?.[ck];
    const v0: [number, number] = box.id === "bg" ? [num("bg_x"), num("bg_y")] : box.id === "card" ? [cardNow?.x ?? num("card_cx"), cardNow?.y ?? num("card_cy")] : box.posKeys ? [num(box.posKeys[0]), num(box.posKeys[1])] : [0, 0];
    const s0 = box.id === "bg" ? num("bg_scale") : box.id === "card" ? box.w : box.sizeKey ? num(box.sizeKey) : 0;
    dragRef.current = { box, mode, x0: e.clientX, y0: e.clientY, v0, s0, snap: data };
    const move = (ev: MouseEvent) => {
      const d = dragRef.current; if (!d) return;
      const dx = (ev.clientX - d.x0) / rect.width, dy = (ev.clientY - d.y0) / rect.height;
      liveSet((nd) => {
        if (d.mode === "move") {
          if (d.box.id === "bg") { nd.preset.bg_x = +(d.v0[0] + dx).toFixed(3); nd.preset.bg_y = +(d.v0[1] + dy).toFixed(3); }
          else if (d.box.id === "card") {   // 날것 요소: 그 씬의 카드 위치를 직접
            const nx = Math.min(0.98, Math.max(0.02, d.v0[0] + dx)), ny = Math.min(0.98, Math.max(0.02, d.v0[1] + dy));
            const sn = snapTo(d.box, nx, ny, boxesRef.current, ev.altKey);
            const c = nd.scenes[si][ck]; if (c) { c.x = +sn.x.toFixed(3); c.y = +sn.y.toFixed(3); }
            setGuides({ x: sn.gx, y: sn.gy });
          }
          else if (d.box.posKeys) {
            const nx = Math.min(0.98, Math.max(0.02, d.v0[0] + dx)), ny = Math.min(0.98, Math.max(0.02, d.v0[1] + dy));
            const sn = snapTo(d.box, nx, ny, boxesRef.current, ev.altKey);
            if (d.box.posKeys[0]) nd.preset[d.box.posKeys[0]] = +sn.x.toFixed(3);
            nd.preset[d.box.posKeys[1]] = +sn.y.toFixed(3);
            setGuides({ x: d.box.posKeys[0] ? sn.gx : [], y: sn.gy });
          }
          requestAnimationFrame(measure);
        } else {
          if (d.box.id === "bg") nd.preset.bg_scale = +Math.max(0.5, Math.min(3, d.s0 * (1 + dy * 2))).toFixed(3);
          else if (d.box.id === "card") { const c = nd.scenes[si][ck]; if (c) c.w = +Math.max(0.05, Math.min(1, d.s0 * (1 + dx * 2))).toFixed(3); }   // 폭 기준, 비율 유지
          else if (d.box.sizeKey) nd.preset[d.box.sizeKey] = +Math.max(0.01, Math.min(0.6, d.s0 * (1 + dy * 3))).toFixed(4);
        }
      });
    };
    const up = () => { const d = dragRef.current; if (d) { hist.current.past.push(d.snap); hist.current.future = []; } dragRef.current = null; setGuides({ x: [], y: [] }); window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
  };
  const boxesRef = useRef<Box[]>([]); useEffect(() => { boxesRef.current = boxes; }, [boxes]);

  // ---- 타임라인 청크 드래그 ----
  const cdrag = useRef<{ si: number; ci: number; edge: "s" | "e"; x0: number; s0: number; e0: number; snap: EditData } | null>(null);
  const onEdgeDown = (sIdx: number, ci: number, edge: "s" | "e") => (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    const c = data.scenes[sIdx].chunks[ci]; cdrag.current = { si: sIdx, ci, edge, x0: e.clientX, s0: c.s, e0: c.e, snap: data }; setSelChunk(ci); setTab("scene");
    const move = (ev: MouseEvent) => {
      const d = cdrag.current; if (!d) return; const dt = (ev.clientX - d.x0) / zoom;
      liveSet((nd) => {
        const sc = nd.scenes[d.si], ch = sc.chunks, cc = ch[d.ci];
        if (d.edge === "e") { const nv = Math.max(d.s0 + 0.1, Math.min(sc.dur, d.e0 + dt)); cc.e = +nv.toFixed(2); if (ch[d.ci + 1]) ch[d.ci + 1].s = cc.e; }
        else { const prev = ch[d.ci - 1]; const lo = prev ? prev.s + 0.1 : 0; const nv = Math.max(lo, Math.min(d.e0 - 0.1, d.s0 + dt)); cc.s = +nv.toFixed(2); if (prev) prev.e = cc.s; }
      });
    };
    const up = () => { const d = cdrag.current; if (d) { hist.current.past.push(d.snap); hist.current.future = []; } cdrag.current = null; window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
  };

  // ---- 저장 ----
  const save = () => start(async () => { const r = await saveProjectEdit(edit.id, data); setMsg(r.ok ? "임시 저장됨" : r.error); if (r.ok) setDirty(false); });
  useEffect(() => { saveRef.current = save; });
  const finalSave = () => start(async () => { const r = await saveProjectEdit(edit.id, data); if (!r.ok) { setMsg(r.error); return; } setDirty(false); const r2 = await requestRender(edit.id); setMsg(r2.ok ? "최종 저장 · 렌더 요청됨" : r2.error); });
  const reset = () => { if (!confirm("모든 편집을 버리고 머신이 올린 원본으로 되돌릴까요?")) return; start(async () => { const r = await resetProjectEdit(edit.id); if (r.ok && r.data) { setData(r.data); setDirty(false); hist.current = { past: [], future: [] }; } setMsg(r.ok ? r.message ?? null : r.error); }); };
  useEffect(() => { if (!msg) return; const id = setTimeout(() => setMsg(null), 2500); return () => clearTimeout(id); }, [msg]);

  if (!Comp) return <div className="vx"><div className="vx-top">편집기가 지원하지 않는 컴포지션: {edit.composition}</div></div>;

  const C: Ctl = { num, str, setP };

  const TABS: [Tab, string][] = [["scene", "씬·자막 내용"], ["label", "라벨"], ["note", "메모"], ["card", "요소"], ["sub", "자막"], ["bg", "배경"], ["cta", "엔딩"]];
  const chunkTotal = data.scenes.reduce((a, s) => a + s.chunks.length, 0);

  return (
    <div className="vx" onMouseDown={() => setSel(null)}>
      {/* 상단 바 */}
      <div className="vx-top" onMouseDown={(e) => e.stopPropagation()}>
        <button type="button" className="vx-back" onClick={() => { if (!dirty || confirm("저장하지 않은 편집이 있습니다. 나갈까요?")) router.push(`/app/presets/${projectId}`); }}><ChevronLeft className="ico" aria-hidden /> 뒤로가기</button>
        <div className="vx-title"><b>{edit.name}</b><span>{projectName} · {edit.preset_key} · {fmt(total)} · {data.scenes.length}씬 {chunkTotal}청크</span></div>
        <div className="vx-actions">
          {msg && <span className="vx-msg">{msg}</span>}
          <button type="button" className="vx-btn" onClick={undo} title="실행 취소 ⌘Z"><Undo2 className="ico" aria-hidden /></button>
          <button type="button" className="vx-btn" onClick={redo} title="다시 실행 ⇧⌘Z"><Redo2 className="ico" aria-hidden /></button>
          <button type="button" className="vx-btn" onClick={reset} disabled={pending}><RotateCcw className="ico" aria-hidden /> 원본</button>
          <button type="button" className="vx-btn" onClick={save} disabled={pending || !dirty}>임시 저장{dirty ? " *" : ""}</button>
          <button type="button" className="vx-btn primary" onClick={finalSave} disabled={pending}>최종 저장</button>
        </div>
      </div>

      <div className="vx-mid">
        {/* 캔버스 */}
        <div className="vx-stage">
          <div className="vx-canvas" ref={canvasRef} onMouseDown={(e) => e.stopPropagation()}>
            <Player ref={player} component={Comp} inputProps={inputProps} durationInFrames={durF} fps={fps} compositionWidth={data.width} compositionHeight={data.height}
              style={{ width: "100%", height: "100%" }} controls={false} clickToPlay={false} doubleClickToFullscreen={false} spaceKeyToPlayOrPause={false} acknowledgeRemotionLicense />
            <div className="vx-overlay" onMouseDown={() => setSel(null)}>
              {guides.x.map((g) => <div key={`gx${g}`} className="vx-snap v" style={{ left: `${g * 100}%` }} />)}
              {guides.y.map((g) => <div key={`gy${g}`} className="vx-snap h" style={{ top: `${g * 100}%` }} />)}
              {inline && (
                <textarea className="vx-inline-edit" autoFocus value={inline.value} spellCheck={false} onFocus={(e) => e.target.select()}
                  style={{ left: `${(inline.box.x - inline.box.w / 2) * 100}%`, top: `${(inline.box.y - inline.box.h / 2) * 100}%`, minWidth: `${inline.box.w * 100}%`, minHeight: `${inline.box.h * 100}%`, fontSize: `${(inline.box.h / (inline.value.split("\n").length || 1)) * 0.55 * 100}cqh` }}
                  onChange={(e) => setInline((s) => (s ? { ...s, value: e.target.value } : s))}
                  onMouseDown={(e) => e.stopPropagation()}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && inline.id !== "intro") { e.preventDefault(); finishInline(true); } if (e.key === "Escape") finishInline(false); }}
                  onBlur={() => finishInline(true)} />
              )}
              {boxes.filter((b) => !inline || b.id !== inline.id).map((b) => (
                <div key={b.id} className={`vx-box ${b.id} ${sel === b.id || tab === b.id ? "sel" : ""}`} style={{ left: `${(b.x - b.w / 2) * 100}%`, top: `${(b.y - b.h / 2) * 100}%`, width: `${b.w * 100}%`, height: `${b.h * 100}%` }} onMouseDown={onBoxDown(b, "move")} onDoubleClick={(e) => { e.stopPropagation(); startInline(b); }} title={`${TABS.find(([id]) => id === b.id)?.[1]} · 더블클릭으로 글자 수정`}>
                  {(b.sizeKey || b.id === "bg") && <i className="vx-handle" onMouseDown={onBoxDown(b, "size")} />}
                  {b.id !== "bg" && (sel === b.id || tab === b.id) && <button type="button" className="vx-del" title="삭제 (Delete)" onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); }} onClick={(e) => { e.stopPropagation(); setSel(b.id); deleteSelected(); }}>✕</button>}
                  <em>{TABS.find(([id]) => id === b.id)?.[1]}</em>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 오른쪽 패널 */}
        <aside className="vx-panel" onMouseDown={(e) => e.stopPropagation()}>
          <div className="vx-tabs">{TABS.map(([id, l]) => <button key={id} type="button" className={tab === id ? "on" : ""} onClick={() => setTab(id)}>{l}</button>)}</div>
          <div className="vx-panel-body">
            {tab === "scene" && scene && (
              <>
                <h3>씬 {scene.idx} <small>{fmt(scene.start)} ~ {fmt(scene.start + scene.dur)}</small></h3>
                <p className="vx-hint">{scene.text}</p>
                {!scene.intro && !scene.ending && (
                  <>
                    <Row label="섹션 라벨"><input className="vx-in" value={scene.label ?? ""} placeholder="(이전 라벨 유지) · '-' 입력하면 라벨 끔" onChange={(e) => commit((d) => { const v = e.target.value; if (v === "") delete d.scenes[si].label; else d.scenes[si].label = v === "-" ? "" : v; })} /></Row>
                    <Row label="보조 메모"><input className="vx-in" value={scene.note ?? ""} onChange={(e) => commit((d) => { const v = e.target.value; if (v === "") delete d.scenes[si].note; else d.scenes[si].note = v; })} /></Row>
                    <Row label="훅 불글자"><label className="vx-chk"><input type="checkbox" checked={!!scene.hookFire} onChange={(e) => commit((d) => { d.scenes[si].hookFire = e.target.checked || undefined; })} /> 첫 훅 문장을 불타는 글자로</label></Row>
                    {(["card", "card2"] as const).map((ck) => (
                      <Row key={ck} label={ck === "card" ? "요소" : "요소 2 (중간 교체)"}>
                        <div className="vx-cards">
                          <button type="button" className={`vx-cardpick ${!scene[ck] ? "on" : ""}`} onClick={() => commit((d) => { delete d.scenes[si][ck]; })}>없음</button>
                          {edit.assets.map((a: EditAsset) => <button type="button" key={a.url} className={`vx-cardpick ${scene[ck]?.file === a.url ? "on" : ""}`} title={a.label ?? ""} onClick={() => commit((d) => { const cur = (d.scenes[si][ck] ?? {}) as Partial<CardSpec>; d.scenes[si][ck] = { ...cur, file: a.url, aspect: a.aspect, ...(ck === "card2" && cur.at == null ? { at: 0.5 } : {}) }; })}><img src={a.url} alt="" /></button>)}
                        </div>
                        {scene[ck] && <div className="vx-inline"><small>폭</small><input type="range" min={0.2} max={0.95} step={0.01} value={scene[ck]!.w ?? num("card_w")} onChange={(e) => liveSet((d) => { d.scenes[si][ck]!.w = Number(e.target.value); })} />{ck === "card2" && <><small>시점</small><input type="range" min={0.1} max={0.9} step={0.05} value={scene.card2!.at ?? 0.5} onChange={(e) => liveSet((d) => { d.scenes[si].card2!.at = Number(e.target.value); })} /></>}</div>}
                      </Row>
                    ))}
                  </>
                )}
                {scene.intro && <Row label="인트로 3줄">{scene.intro.lines.map((l, i) => <input key={i} className="vx-in" value={l} onChange={(e) => commit((d) => { d.scenes[si].intro!.lines[i] = e.target.value; })} />)}</Row>}
                {scene.ending && <Row label="엔딩 CTA"><textarea className="vx-in" rows={2} value={data.cta ?? ""} onChange={(e) => commit((d) => { d.cta = e.target.value; })} /></Row>}
                <h3>자막 청크 <small>{scene.chunks.length}개 · 블록 가장자리를 끌어 시각 조절</small></h3>
                <div className="vx-chunks">
                  {scene.chunks.map((c, ci) => (
                    <div key={ci} className={`vx-chunk ${selChunk === ci ? "sel" : ""} ${curChunk === c ? "cur" : ""}`} onClick={() => { setSelChunk(ci); seek(scene.start + c.s + 0.01); }}>
                      <input value={c.t} onChange={(e) => commit((d) => { d.scenes[si].chunks[ci].t = e.target.value; })} />
                      <small>{c.s.toFixed(2)}–{c.e.toFixed(2)}s</small>
                      <button type="button" title="둘로 나누기" onClick={(e) => { e.stopPropagation(); commit((d) => { const ch = d.scenes[si].chunks, cc = ch[ci]; const mid = +((cc.s + cc.e) / 2).toFixed(2); const w = cc.t.split(" "); const a = w.slice(0, Math.ceil(w.length / 2)).join(" "), b = w.slice(Math.ceil(w.length / 2)).join(" ") || "…"; ch.splice(ci, 1, { t: a, s: cc.s, e: mid }, { t: b, s: mid, e: cc.e }); }); }}>⫶</button>
                      {scene.chunks.length > 1 && <button type="button" title="삭제" className="del" onClick={(e) => { e.stopPropagation(); commit((d) => { const ch = d.scenes[si].chunks, cc = ch[ci]; if (ch[ci + 1]) ch[ci + 1].s = cc.s; else if (ch[ci - 1]) ch[ci - 1].e = cc.e; ch.splice(ci, 1); }); setSelChunk(null); }}><Trash2 className="ico" aria-hidden /></button>}
                    </div>
                  ))}
                </div>
              </>
            )}
            {tab === "label" && <>
              <h3>섹션 라벨 <small>상단 제목 (예: 1. 부동산만 돌아요)</small></h3>
              <Row label="폰트"><FontField c={C} k="label_font" /></Row>
              <Row label="사이즈"><NumField c={C} k="label_size" scale={H_REF} step={1} unit="px" /></Row>
              <Row label="색상"><ColorField c={C} k="label_color" /></Row>
              <Row label="테두리"><NumField c={C} k="label_stroke" step={0.01} min={0} max={0.3} /><ColorField c={C} k="label_stroke_color" /></Row>
              <Row label="자간"><NumField c={C} k="label_ls" step={0.5} unit="px" /></Row>
              <PosField c={C} xk="label_cx" yk="label_cy" />
            </>}
            {tab === "note" && <>
              <h3>보조 메모 <small>⚠ 라벨 아래 작은 글</small></h3>
              <Row label="폰트"><FontField c={C} k="note_font" /></Row>
              <Row label="사이즈"><NumField c={C} k="note_size" scale={H_REF} step={1} unit="px" /></Row>
              <Row label="색상"><ColorField c={C} k="note_color" /></Row>
              <Row label="테두리"><NumField c={C} k="note_stroke" step={0.01} min={0} max={0.3} /></Row>
              <PosField c={C} xk="note_cx" yk="note_cy" />
            </>}
            {tab === "card" && <>
              <h3>요소 <small>캡처·로고를 날것 그대로 배치. 캔버스에서 끌어 위치, 모서리 핸들로 크기 (씬마다 따로)</small></h3>
              {liveCard ? (
                <>
                  <Row label="이 씬 폭"><input type="range" min={0.05} max={1} step={0.005} value={(liveCard as CardSpec).w ?? num("card_w")} onChange={(e) => liveSet((d) => { const c = d.scenes[si][card2On ? "card2" : "card"]; if (c) c.w = Number(e.target.value); })} /><code>{((liveCard as CardSpec).w ?? num("card_w")).toFixed(3)}</code></Row>
                  <Row label="이 씬 위치"><NumField c={{ num: (k) => Number((liveCard as CardSpec)[k === "x" ? "x" : "y"] ?? num(k === "x" ? "card_cx" : "card_cy")), str, setP: (k, v) => commit((d) => { const c = d.scenes[si][card2On ? "card2" : "card"]; if (c) (c as Record<string, unknown>)[k] = v; }) }} k="x" step={0.005} min={0} max={1} /><NumField c={{ num: (k) => Number((liveCard as CardSpec)[k === "x" ? "x" : "y"] ?? num(k === "x" ? "card_cx" : "card_cy")), str, setP: (k, v) => commit((d) => { const c = d.scenes[si][card2On ? "card2" : "card"]; if (c) (c as Record<string, unknown>)[k] = v; }) }} k="y" step={0.005} min={0} max={1} /><small className="vx-hint">X · Y</small></Row>
                  <Row label=""><button type="button" className="vx-btn" onClick={() => commit((d) => { const c = d.scenes[si][card2On ? "card2" : "card"]; if (c) { delete c.x; delete c.y; delete c.w; } })}>기본 크기·위치로</button></Row>
                </>
              ) : <p className="vx-hint">이 씬에는 요소가 없습니다. 씬·자막 내용 탭에서 넣으세요.</p>}
              <h3>기본값 <small>씬별 값이 없을 때</small></h3>
              <Row label="기본 높이"><NumField c={C} k="card_h" scale={H_REF} step={5} unit="px" /></Row>
              <Row label="기본 폭"><NumField c={C} k="card_w" step={0.01} min={0.1} max={1} /></Row>
              <Row label="모서리"><NumField c={C} k="card_radius" step={0.01} min={0} max={0.5} /></Row>
              <Row label="그림자"><label className="vx-chk"><input type="checkbox" checked={!!num("card_shadow")} onChange={(e) => setP("card_shadow", e.target.checked ? 1 : 0)} /> 표시</label></Row>
              <PosField c={C} xk="card_cx" yk="card_cy" />
            </>}
            {tab === "sub" && <>
              <h3>자막 <small>말하는 구절 박스</small></h3>
              <Row label="폰트"><FontField c={C} k="sub_font" /></Row>
              <Row label="굵기"><select className="vx-sel" value={num("sub_weight")} onChange={(e) => setP("sub_weight", Number(e.target.value))}><option value={400}>Regular</option><option value={500}>Medium</option><option value={800}>ExtraBold</option><option value={900}>Black</option></select></Row>
              <Row label="사이즈"><NumField c={C} k="sub_size" scale={H_REF} step={1} unit="px" /></Row>
              <Row label="글자색"><ColorField c={C} k="sub_color" /></Row>
              <Row label="배경색"><ColorField c={C} k="sub_bg" /></Row>
              <Row label="배경 불투명"><input type="range" min={0} max={1} step={0.05} value={num("sub_alpha")} onChange={(e) => liveSet((d) => { d.preset.sub_alpha = Number(e.target.value); })} /><code>{num("sub_alpha").toFixed(2)}</code></Row>
              <Row label="여백"><NumField c={C} k="sub_pad_y" step={0.02} min={0} max={1} /><NumField c={C} k="sub_pad_x" step={0.02} min={0} max={2} /><small className="vx-hint">상하 · 좌우 (글자 크기 배수)</small></Row>
              <Row label="모서리"><NumField c={C} k="sub_radius" step={0.02} min={0} max={1} /></Row>
              <Row label="테두리"><NumField c={C} k="sub_stroke" step={0.01} min={0} max={0.2} /></Row>
              <Row label="행간"><NumField c={C} k="sub_lh" step={0.05} min={0.8} max={2.5} /></Row>
              <Row label="자간"><NumField c={C} k="sub_ls" step={0.1} unit="px" /></Row>
              <PosField c={C} xk="sub_cx" yk="sub_cy" />
              <h3>훅 불글자</h3>
              <Row label="사이즈"><NumField c={C} k="fire_size" scale={H_REF} step={1} unit="px" /></Row>
              <Row label="기울기"><NumField c={C} k="fire_rot" step={1} unit="°" /></Row>
              <PosField c={C} xk="fire_cx" yk="fire_cy" />
            </>}
            {tab === "bg" && <>
              <h3>배경 영상 <small>캔버스에서 끌어 이동, 모서리로 확대</small></h3>
              <Row label="확대"><input type="range" min={0.5} max={3} step={0.01} value={num("bg_scale")} onChange={(e) => liveSet((d) => { d.preset.bg_scale = Number(e.target.value); })} /><code>{num("bg_scale").toFixed(2)}×</code></Row>
              <Row label="이동"><NumField c={C} k="bg_x" step={0.01} min={-1} max={1} /><NumField c={C} k="bg_y" step={0.01} min={-1} max={1} /><small className="vx-hint">X · Y (화면 비율)</small></Row>
              <Row label=""><button type="button" className="vx-btn" onClick={() => commit((d) => { d.preset.bg_x = 0; d.preset.bg_y = 0; d.preset.bg_scale = 1; })}>원위치</button></Row>
            </>}
            {tab === "cta" && <>
              <h3>엔딩 <small>검정 화면 + CTA</small></h3>
              <Row label="CTA 문구"><textarea className="vx-in" rows={2} value={data.cta ?? ""} onChange={(e) => commit((d) => { d.cta = e.target.value; })} /></Row>
              <Row label="폰트"><FontField c={C} k="cta_font" /></Row>
              <Row label="사이즈"><NumField c={C} k="cta_size" scale={H_REF} step={1} unit="px" /></Row>
              <Row label="색상"><ColorField c={C} k="cta_color" /></Row>
              <PosField c={C} yk="cta_cy" />
              <Row label="로고 크기"><NumField c={C} k="logo_w" step={0.01} min={0.05} max={0.6} /></Row>
            </>}
            {tab === "intro" && scene?.intro && <>
              <h3>인트로 카드</h3>
              <Row label="사이즈"><NumField c={C} k="intro_size" scale={H_REF} step={1} unit="px" /></Row>
              <PosField c={C} xk="intro_x" yk="intro_y" />
              <Row label="로고 위치"><NumField c={C} k="intro_logo_x" step={0.01} min={0} max={1} /><NumField c={C} k="intro_logo_y" step={0.01} min={0} max={1} /></Row>
              <Row label="로고 크기"><NumField c={C} k="intro_logo_w" step={0.01} min={0.05} max={0.5} /></Row>
            </>}
          </div>
        </aside>
      </div>

      {/* 하단: 컨트롤 + 타임라인 */}
      <div className="vx-bottom" onMouseDown={(e) => e.stopPropagation()}>
        <div className="vx-transport">
          <button type="button" className="vx-btn" onClick={() => seek(0)} title="처음으로"><SkipBack className="ico" aria-hidden /></button>
          <button type="button" className="vx-btn play" onClick={() => player.current?.toggle()}>{playing ? <><Pause className="ico" aria-hidden /> 정지</> : <><Play className="ico" aria-hidden /> 재생</>}</button>
          <button type="button" className="vx-btn" onClick={() => scene && seek(scene.start + 0.01)}>씬 시작으로</button>
          <span className="vx-time">{fmt(t)} <i>|</i> {fmt(total)}</span>
          <span className="vx-zoom"><ZoomOut className="ico" aria-hidden /><input type="range" min={30} max={240} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} /><ZoomIn className="ico" aria-hidden /></span>
        </div>
        <div className="vx-timeline" ref={tlRef} onClick={(e) => { const box = tlRef.current!.getBoundingClientRect(); seek((e.clientX - box.left + tlRef.current!.scrollLeft - 8) / zoom); }}>
          <div className="vx-track" style={{ width: total * zoom + 16 }}>
            <div className="vx-ruler">{Array.from({ length: Math.floor(total / 5) + 1 }).map((_, i) => <span key={i} style={{ left: i * 5 * zoom }}>{fmt(i * 5).slice(0, 5)}</span>)}</div>
            <canvas ref={waveRef} className="vx-wave" style={{ width: total * zoom, height: 56 }} />
            <div className="vx-scenes">
              {data.scenes.map((s, i) => (
                <div key={s.idx} className={`vx-scene ${i === si ? "cur" : ""}`} style={{ left: s.start * zoom, width: s.dur * zoom }} onClick={(e) => { e.stopPropagation(); seek(s.start + 0.01); setTab("scene"); setSelChunk(null); }}>
                  <span>{s.idx}{s.label ? ` · ${s.label}` : ""}{s.intro ? " · 인트로" : ""}{s.ending ? " · 엔딩" : ""}{s.hookFire ? " 🔥" : ""}{s.card ? " 🖼" : ""}</span>
                </div>
              ))}
            </div>
            <div className="vx-chunktrack">
              {data.scenes.map((s, i) => s.chunks.map((c, ci) => (
                <div key={`${i}-${ci}`} className={`vx-cblock ${i === si && selChunk === ci ? "sel" : ""} ${i === si && curChunk === c ? "cur" : ""}`} style={{ left: (s.start + c.s) * zoom, width: Math.max(6, (c.e - c.s) * zoom) }}
                  onClick={(e) => { e.stopPropagation(); setSelChunk(ci); setTab("scene"); seek(s.start + c.s + 0.01); }}>
                  <i className="h l" onMouseDown={onEdgeDown(i, ci, "s")} /><span>{c.t}</span><i className="h r" onMouseDown={onEdgeDown(i, ci, "e")} />
                </div>
              )))}
            </div>
            <div className="vx-playhead" style={{ left: t * zoom }} />
          </div>
        </div>
      </div>
    </div>
  );
}
