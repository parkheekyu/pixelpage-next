"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { Player, type PlayerRef } from "@remotion/player";
import { ArrowLeft, Clapperboard, Pause, Play, RotateCcw, Save, SkipBack, Trash2 } from "lucide-react";
import { COMPOSITIONS } from "@/remotion/registry";
import type { ProjectData } from "@/remotion/compositions/types";
import type { CardSpec, EditAsset, EditData, EditScene, ProjectEdit } from "@/lib/dash/editor-types";
import { requestRender, resetProjectEdit, saveProjectEdit } from "@/app/app/editor-actions";

/**
 * 소재 편집기 (캡컷식): 실제 Remotion 컴포지션을 Player 로 재생하며
 *  - 타임라인: 씬 → 자막 청크 블록. 클릭 선택, 가장자리 드래그로 청크 시각 조절, 클릭으로 탐색
 *  - 캔버스: 자막·라벨·카드 세로 위치를 드래그로 이동(프리셋 값 수정)
 *  - 인스펙터: 청크 텍스트, 씬 라벨·메모·훅·카드(교체/폭/삭제), 전역 크기·투명도
 * 저장 → dash.project_edits.data. 렌더는 광고제작 머신이 editor_pull.py 로 받아 수행.
 */

const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, "0")}`;
const PX_PER_SEC = 90;

type Sel = { scene: number; chunk?: number } | null;

export default function VideoEditor({ edit, projectId, projectName }: { edit: ProjectEdit; projectId: string; projectName: string }) {
  const Comp = COMPOSITIONS[edit.composition];
  const [data, setData] = useState<EditData>(edit.data);
  const [sel, setSel] = useState<Sel>(null);
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();
  const player = useRef<PlayerRef>(null);
  const tl = useRef<HTMLDivElement>(null);
  const fps = data.fps, total = data.total, durF = Math.ceil(total * fps);

  // Player 이벤트
  useEffect(() => {
    const p = player.current; if (!p) return;
    const onF = (e: { detail: { frame: number } }) => setFrame(e.detail.frame);
    const onPlay = () => setPlaying(true), onPause = () => setPlaying(false);
    p.addEventListener("frameupdate", onF); p.addEventListener("play", onPlay); p.addEventListener("pause", onPause); p.addEventListener("ended", onPause);
    return () => { p.removeEventListener("frameupdate", onF); p.removeEventListener("play", onPlay); p.removeEventListener("pause", onPause); p.removeEventListener("ended", onPause); };
  }, []);
  const seek = useCallback((sec: number) => { player.current?.seekTo(Math.max(0, Math.min(durF - 1, Math.round(sec * fps)))); }, [durF, fps]);
  const t = frame / fps;

  // 재생 위치에 따라 선택 자동 추적(드래그 중 아님)
  const curScene = useMemo(() => data.scenes.findIndex((s) => t >= s.start && t < s.start + s.dur), [data.scenes, t]);

  const update = (fn: (d: EditData) => void) => { setData((d) => { const n = structuredClone(d); fn(n); return n; }); setDirty(true); };
  const setParam = (k: string, v: unknown) => update((d) => { d.preset[k] = v; });
  const num = (k: string, dflt: number) => Number(data.preset[k] ?? dflt);

  // ---- 타임라인 드래그(청크 경계) ----
  const drag = useRef<{ si: number; ci: number; edge: "s" | "e"; x0: number; s0: number; e0: number } | null>(null);
  const onEdgeDown = (si: number, ci: number, edge: "s" | "e") => (e: React.MouseEvent) => {
    e.stopPropagation(); e.preventDefault();
    const c = data.scenes[si].chunks[ci]; drag.current = { si, ci, edge, x0: e.clientX, s0: c.s, e0: c.e }; setSel({ scene: si, chunk: ci });
    const move = (ev: MouseEvent) => {
      const d = drag.current; if (!d) return;
      const dt = (ev.clientX - d.x0) / PX_PER_SEC;
      update((nd) => {
        const sc = nd.scenes[d.si], ch = sc.chunks, c = ch[d.ci];
        if (d.edge === "e") { const nv = Math.max(d.s0 + 0.1, Math.min(sc.dur, d.e0 + dt)); c.e = +nv.toFixed(2); if (ch[d.ci + 1]) ch[d.ci + 1].s = c.e; }
        else { const prev = ch[d.ci - 1]; const lo = prev ? prev.s + 0.1 : 0; const nv = Math.max(lo, Math.min(d.e0 - 0.1, d.s0 + dt)); c.s = +nv.toFixed(2); if (prev) prev.e = c.s; }
      });
    };
    const up = () => { drag.current = null; window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
  };

  // ---- 캔버스 드래그(세로 위치) ----
  const canvas = useRef<HTMLDivElement>(null);
  const cdrag = useRef<{ key: string; y0: number; v0: number; h: number } | null>(null);
  const onCanvasDown = (e: React.MouseEvent) => {
    const box = canvas.current?.getBoundingClientRect(); if (!box) return;
    const y = (e.clientY - box.top) / box.height;
    const cands: [string, number][] = [["sub_cy", num("sub_cy", 0.6)], ["label_cy", num("label_cy", 0.26)], ["note_cy", num("note_cy", 0.335)], ["card_cy", num("card_cy", 0.44)]];
    const [key, v0] = cands.reduce((a, b) => (Math.abs(b[1] - y) < Math.abs(a[1] - y) ? b : a));
    if (Math.abs(v0 - y) > 0.08) return;
    e.preventDefault(); cdrag.current = { key, y0: e.clientY, v0, h: box.height }; setMsg(`${LABELS[key] ?? key} 이동 중`);
    const move = (ev: MouseEvent) => { const d = cdrag.current; if (!d) return; const nv = Math.max(0.02, Math.min(0.98, d.v0 + (ev.clientY - d.y0) / d.h)); setParam(d.key, +nv.toFixed(3)); };
    const up = () => { cdrag.current = null; setMsg(null); window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
    window.addEventListener("mousemove", move); window.addEventListener("mouseup", up);
  };

  // ---- 저장/렌더 ----
  const save = () => start(async () => { const r = await saveProjectEdit(edit.id, data); setMsg(r.ok ? "저장됨" : r.error); if (r.ok) setDirty(false); });
  const reset = () => { if (!confirm("모든 편집을 버리고 원본으로 되돌릴까요?")) return; start(async () => { const r = await resetProjectEdit(edit.id); if (r.ok && r.data) { setData(r.data); setDirty(false); } setMsg(r.ok ? r.message ?? null : r.error); }); };
  const render = () => start(async () => { if (dirty) { const r = await saveProjectEdit(edit.id, data); if (!r.ok) { setMsg(r.error); return; } setDirty(false); } const r = await requestRender(edit.id); setMsg(r.ok ? r.message ?? null : r.error); });

  useEffect(() => { const h = (e: BeforeUnloadEvent) => { if (dirty) e.preventDefault(); }; window.addEventListener("beforeunload", h); return () => window.removeEventListener("beforeunload", h); }, [dirty]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if ((e.target as HTMLElement)?.tagName === "INPUT" || (e.target as HTMLElement)?.tagName === "TEXTAREA") return; if (e.code === "Space") { e.preventDefault(); player.current?.toggle(); } }; window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, []);

  if (!Comp) return <div className="cpz-err">편집기가 아직 지원하지 않는 컴포지션: {edit.composition}</div>;
  const selScene: EditScene | undefined = sel ? data.scenes[sel.scene] : undefined;
  const selChunk = sel && sel.chunk != null ? selScene?.chunks[sel.chunk] : undefined;

  return (
    <section className="ve">
      <div className="cpz-head">
        <div className="pa-title">
          <Link href={`/app/presets/${projectId}`} className="btn" title="프리셋 목록"><ArrowLeft className="ico" aria-hidden /></Link>
          <div><h2>{edit.name} <code>{edit.preset_key} · {edit.composition}</code></h2><div className="hint">{projectName} · {fmt(total)} · {data.scenes.length}씬 · 스페이스 = 재생/정지 · 캔버스에서 자막·라벨·카드를 위아래로 끌어 위치 조정</div></div>
        </div>
        <div className="controls">
          <button type="button" className="btn" onClick={reset} disabled={pending}><RotateCcw className="ico" aria-hidden /> 원본</button>
          <button type="button" className="btn" onClick={save} disabled={pending || !dirty}><Save className="ico" aria-hidden /> 저장{dirty ? " *" : ""}</button>
          <button type="button" className="btn primary" onClick={render} disabled={pending}><Clapperboard className="ico" aria-hidden /> 렌더 요청</button>
        </div>
      </div>
      {msg && <div className={`cpz-err ${/저장됨|요청됨|되돌림|이동 중/.test(msg) ? "ok" : ""}`}>{msg}</div>}

      <div className="ve-body">
        <div className="ve-stage">
          <div className="ve-canvas" ref={canvas} onMouseDown={onCanvasDown}>
            <Player ref={player} component={Comp} inputProps={{ data: data as unknown as ProjectData }} durationInFrames={durF} fps={fps} compositionWidth={data.width} compositionHeight={data.height}
              style={{ width: "100%", height: "100%" }} controls={false} clickToPlay={false} doubleClickToFullscreen={false} spaceKeyToPlayOrPause={false} />
            <div className="ve-guide" style={{ top: `${num("label_cy", 0.26) * 100}%` }} data-k="라벨" />
            <div className="ve-guide" style={{ top: `${num("card_cy", 0.44) * 100}%` }} data-k="카드" />
            <div className="ve-guide" style={{ top: `${num("sub_cy", 0.6) * 100}%` }} data-k="자막" />
          </div>
          <div className="ve-transport">
            <button type="button" className="btn" onClick={() => seek(0)} title="처음"><SkipBack className="ico" aria-hidden /></button>
            <button type="button" className="btn primary" onClick={() => player.current?.toggle()}>{playing ? <Pause className="ico" aria-hidden /> : <Play className="ico" aria-hidden />}</button>
            <span className="ve-time">{fmt(t)} / {fmt(total)}</span>
            <input type="range" min={0} max={durF - 1} value={frame} onChange={(e) => player.current?.seekTo(Number(e.target.value))} />
          </div>
        </div>

        <aside className="ve-inspector">
          {selScene ? (
            <>
              <h3>씬 {selScene.idx} <small>{fmt(selScene.start)} ~ {fmt(selScene.start + selScene.dur)}</small></h3>
              <p className="hint">{selScene.text}</p>
              {selChunk && (
                <label className="ve-f"><b>자막 청크</b>
                  <input value={selChunk.t} onChange={(e) => update((d) => { d.scenes[sel!.scene].chunks[sel!.chunk!].t = e.target.value; })} />
                  <small>{selChunk.s.toFixed(2)}s ~ {selChunk.e.toFixed(2)}s · 타임라인 블록 가장자리를 끌어 시각 조절</small>
                  <div className="controls">
                    <button type="button" className="btn" onClick={() => update((d) => { const ch = d.scenes[sel!.scene].chunks, c = ch[sel!.chunk!]; const mid = +((c.s + c.e) / 2).toFixed(2); const words = c.t.split(" "); const a = words.slice(0, Math.ceil(words.length / 2)).join(" "), b = words.slice(Math.ceil(words.length / 2)).join(" ") || "…"; ch.splice(sel!.chunk!, 1, { t: a, s: c.s, e: mid }, { t: b, s: mid, e: c.e }); })}>둘로 나누기</button>
                    {selScene.chunks.length > 1 && <button type="button" className="btn danger" onClick={() => update((d) => { const ch = d.scenes[sel!.scene].chunks, i = sel!.chunk!; const c = ch[i]; if (ch[i + 1]) ch[i + 1].s = c.s; else if (ch[i - 1]) ch[i - 1].e = c.e; ch.splice(i, 1); setSel({ scene: sel!.scene }); })}><Trash2 className="ico" aria-hidden /> 청크 삭제</button>}
                  </div>
                </label>
              )}
              {!selScene.intro && !selScene.ending && (
                <>
                  <label className="ve-f"><b>섹션 라벨</b><input value={selScene.label ?? ""} placeholder="(이전 라벨 유지) · 빈 문자열로 해제하려면 '-' 입력" onChange={(e) => update((d) => { const v = e.target.value; if (v === "") delete d.scenes[sel!.scene].label; else d.scenes[sel!.scene].label = v === "-" ? "" : v; })} /></label>
                  <label className="ve-f"><b>보조 메모</b><input value={selScene.note ?? ""} onChange={(e) => update((d) => { const v = e.target.value; if (v === "") delete d.scenes[sel!.scene].note; else d.scenes[sel!.scene].note = v; })} /></label>
                  <label className="ve-f ve-row"><input type="checkbox" checked={!!selScene.hookFire} onChange={(e) => update((d) => { d.scenes[sel!.scene].hookFire = e.target.checked || undefined; })} /> <b>훅 불글자</b></label>
                  {(["card", "card2"] as const).map((ck) => (
                    <div key={ck} className="ve-f">
                      <b>{ck === "card" ? "요소 카드" : "카드 2 (문장 중간 교체)"}</b>
                      <div className="ve-cards">
                        <button type="button" className={`ve-cardpick ${!selScene[ck] ? "on" : ""}`} onClick={() => update((d) => { delete d.scenes[sel!.scene][ck]; })}>없음</button>
                        {edit.assets.map((a: EditAsset) => (
                          <button type="button" key={a.url} className={`ve-cardpick ${selScene[ck]?.file === a.url ? "on" : ""}`} title={a.label ?? ""} onClick={() => update((d) => { const cur = (d.scenes[sel!.scene][ck] ?? {}) as Partial<CardSpec>; d.scenes[sel!.scene][ck] = { ...cur, file: a.url, aspect: a.aspect, ...(ck === "card2" && cur.at == null ? { at: 0.5 } : {}) }; })}>
                            <img src={a.url} alt={a.label ?? ""} />
                          </button>
                        ))}
                      </div>
                      {selScene[ck] && (
                        <div className="ve-row">
                          <small>폭</small><input type="range" min={0.2} max={0.95} step={0.01} value={selScene[ck]!.w ?? num("card_w", 0.6)} onChange={(e) => update((d) => { d.scenes[sel!.scene][ck]!.w = Number(e.target.value); })} />
                          {ck === "card2" && <><small>시점</small><input type="range" min={0.1} max={0.9} step={0.05} value={selScene.card2!.at ?? 0.5} onChange={(e) => update((d) => { d.scenes[sel!.scene].card2!.at = Number(e.target.value); })} /></>}
                        </div>
                      )}
                    </div>
                  ))}
                </>
              )}
              {selScene.ending && <label className="ve-f"><b>엔딩 CTA</b><textarea rows={2} value={data.cta ?? ""} onChange={(e) => update((d) => { d.cta = e.target.value; })} /></label>}
            </>
          ) : <p className="hint">타임라인에서 씬이나 자막 청크를 선택하세요.</p>}

          <h3>전역</h3>
          {([["sub_cy", 0.6], ["sub_size", 0.031], ["sub_alpha", 0.8], ["label_cy", 0.26], ["label_size", 0.048], ["note_cy", 0.335], ["card_cy", 0.44], ["card_h", 0.13], ["card_w", 0.6]] as [string, number][]).map(([k, d]) => (
            <label key={k} className="ve-f ve-row"><small className="ve-k">{LABELS[k] ?? k}</small><input type="range" min={0} max={1} step={0.005} value={num(k, d)} onChange={(e) => setParam(k, Number(e.target.value))} /><code>{num(k, d).toFixed(3)}</code></label>
          ))}
        </aside>
      </div>

      <div className="ve-timeline" ref={tl} onClick={(e) => { const box = tl.current!.getBoundingClientRect(); seek((e.clientX - box.left + tl.current!.scrollLeft) / PX_PER_SEC); }}>
        <div className="ve-track" style={{ width: total * PX_PER_SEC }}>
          {data.scenes.map((s, si) => (
            <div key={s.idx} className={`ve-scene ${si === curScene ? "cur" : ""} ${sel?.scene === si && sel.chunk == null ? "sel" : ""}`} style={{ left: s.start * PX_PER_SEC, width: s.dur * PX_PER_SEC }}
              onClick={(e) => { e.stopPropagation(); setSel({ scene: si }); seek(s.start); }}>
              <div className="ve-scene-head">{s.idx}{s.label ? ` · ${s.label}` : ""}{s.intro ? " · 인트로" : ""}{s.ending ? " · 엔딩" : ""}{s.card ? " 🖼" : ""}</div>
              <div className="ve-chunks">
                {s.chunks.map((c, ci) => (
                  <div key={ci} className={`ve-chunk ${sel?.scene === si && sel.chunk === ci ? "sel" : ""} ${t >= s.start + c.s && t < s.start + c.e ? "cur" : ""}`} style={{ left: c.s * PX_PER_SEC, width: Math.max(4, (c.e - c.s) * PX_PER_SEC) }}
                    onClick={(e) => { e.stopPropagation(); setSel({ scene: si, chunk: ci }); seek(s.start + c.s + 0.01); }}>
                    <i className="h l" onMouseDown={onEdgeDown(si, ci, "s")} /><span>{c.t}</span><i className="h r" onMouseDown={onEdgeDown(si, ci, "e")} />
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="ve-playhead" style={{ left: t * PX_PER_SEC }} />
        </div>
      </div>
    </section>
  );
}

const LABELS: Record<string, string> = { sub_cy: "자막 위치", sub_size: "자막 크기", sub_alpha: "자막 박스 불투명", label_cy: "라벨 위치", label_size: "라벨 크기", note_cy: "메모 위치", card_cy: "카드 위치", card_h: "카드 높이", card_w: "카드 폭" };
