"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Save } from "lucide-react";
import { saveClientPresetParams, saveSharedPresetParams } from "@/app/app/preset-settings-actions";

type Scalar = number | string | boolean;
type Params = Record<string, Scalar>;
export type EditorScope = { kind: "shared"; presetKey: string } | { kind: "client"; presetKey: string; clientPresetId: string; projectId: string; projectName: string };

/** 파라미터 이름 → 한글 라벨·설명 (없는 키는 키 이름 그대로) */
const LABEL: Record<string, [string, string?]> = {
  sub_cy: ["자막 세로 위치", "0 = 맨 위, 1 = 맨 아래 (화면 높이 비율)"], sub_size: ["자막 글자 크기", "화면 높이 비율"], sub_alpha: ["자막 박스 불투명도", "0 투명 ~ 1 불투명"], sub_font: ["자막 폰트"],
  label_cy: ["상단 라벨 위치"], label_size: ["상단 라벨 크기"], note_cy: ["보조 메모 위치"],
  card_cy: ["요소 카드 중심 위치"], card_h: ["요소 카드 최대 높이"], card_w: ["요소 카드 최대 폭", "화면 폭 비율"],
  speed: ["말 속도 배수"], gap: ["문장 간격(초)"], sil_min: ["이 길이 이상 묵음만 압축(초)"], sil_keep: ["압축 후 남길 묵음(초)"],
  chunk_words: ["자막 청크 단어 수"], strip_punct: ["자막 구두점 제거"], align: ["whisper 자막 싱크"], sub_source: ["자막 출처"],
  bgm_volume: ["BGM 볼륨"], bgm: ["BGM 파일"], voice_id: ["TTS 목소리 ID"], font: ["라벨 폰트"],
  copy_y: ["상단 카피 위치"], cta_y: ["CTA 위치"], top: ["상단 검정 띠 높이"], bottom: ["하단 검정 띠 높이"],
};
const isRatio = (k: string, v: number) => v >= 0 && v <= 1 && /(_cy|_y|_x|_h|_w|_alpha|_size|_volume|^top$|^bottom$)/.test(k);

function BgTalkPreview({ p, bg }: { p: Params; bg: string }) {
  const n = (k: string, d: number) => Number(p[k] ?? d);
  const subFont = String(p.sub_font ?? "Pretendard") .includes("Pretendard") ? "Pretendard, 'Apple SD Gothic Neo', sans-serif" : String(p.sub_font);
  return (
    <div className="pe-canvas" style={{ backgroundImage: `url(${bg})` }}>
      <div className="pe-label" style={{ top: `${n("label_cy", 0.26) * 100}%`, fontSize: `${n("label_size", 0.048) * 100}cqh` }}>1. 부동산만 돌아요</div>
      <div className="pe-note" style={{ top: `${n("note_cy", 0.335) * 100}%`, fontSize: `${n("label_size", 0.048) * 62}cqh` }}>⚠ 보조 메모</div>
      <div className="pe-card" style={{ top: `${n("card_cy", 0.44) * 100}%`, height: `${n("card_h", 0.13) * 100}%`, width: `${Math.min(n("card_w", 0.6), 0.95) * 100}%` }}>요소 카드</div>
      <div className="pe-sub" style={{ top: `${n("sub_cy", 0.6) * 100}%` }}>
        <span style={{ fontSize: `${n("sub_size", 0.031) * 100}cqh`, background: `rgba(0,0,0,${n("sub_alpha", 0.8)})`, fontFamily: subFont }}>자막 박스 예시</span>
      </div>
    </div>
  );
}

function GuidePreview({ p, bg }: { p: Params; bg: string }) {
  const lines = Object.entries(p).filter(([k, v]) => typeof v === "number" && /(_cy|_y|^top$|^bottom$|copy_y|cta_y)/.test(k) && v >= 0 && v <= 1) as [string, number][];
  return (
    <div className="pe-canvas" style={{ backgroundImage: `url(${bg})` }}>
      {lines.map(([k, v]) => <div key={k} className="pe-guide" style={{ top: `${v * 100}%` }}><span>{LABEL[k]?.[0] ?? k} {v}</span></div>)}
      {lines.length === 0 && <div className="pe-noguide">이 프리셋은 위치 미리보기가 없습니다. 오른쪽 값만 조정됩니다.</div>}
    </div>
  );
}

/** 프리셋 설정 편집기: 왼쪽 9:16 미리보기, 오른쪽 파라미터. 공용(shared) 또는 고객사(client) 범위로 저장. */
export default function PresetEditor({ scope, name, defaults, shared, current, sampleBase, bgUrl }: { scope: EditorScope; name: string; defaults: Params; shared: Params; current: Params; sampleBase: string; bgUrl?: string | null }) {
  // base = 이 범위에서 "기본값"으로 간주할 값: 공용 편집이면 프리셋 JSON, 고객사 편집이면 공용 설정이 덮인 값
  const base = useMemo(() => (scope.kind === "shared" ? defaults : { ...defaults, ...shared }), [scope.kind, defaults, shared]);
  const [vals, setVals] = useState<Params>({ ...base, ...current });
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const bg = bgUrl || `${sampleBase}/${scope.presetKey}.jpg`;
  const set = (k: string, v: Scalar) => setVals((s) => ({ ...s, [k]: v }));
  const changed = Object.keys(vals).filter((k) => vals[k] !== base[k]);

  const save = () => start(async () => {
    const r = scope.kind === "shared" ? await saveSharedPresetParams(scope.presetKey, vals) : await saveClientPresetParams(scope.clientPresetId, vals);
    setMsg(r.ok ? `저장됨 · ${r.message ?? ""}` : r.error);
  });

  const groups: [string, string[]][] = [
    ["위치·크기", Object.keys(base).filter((k) => typeof base[k] === "number" && isRatio(k, base[k] as number))],
    ["소리·속도", Object.keys(base).filter((k) => /^(speed|gap|sil_|bgm|voice|tts)/.test(k))],
    ["자막", Object.keys(base).filter((k) => /^(chunk|strip|align|sub_source|sub_font|font)/.test(k))],
  ];
  const used = new Set(groups.flatMap(([, ks]) => ks));
  groups.push(["기타", Object.keys(base).filter((k) => !used.has(k))]);

  return (
    <section className="pe">
      <div className="cpz-head">
        <div className="pa-title">
          <Link href={scope.kind === "shared" ? "/app/presets" : `/app/presets/${scope.projectId}/${scope.clientPresetId}`} className="btn" title="뒤로"><ArrowLeft className="ico" aria-hidden /></Link>
          <div>
            <h2>{name} <code>{scope.presetKey}</code> <span className="pe-scope">{scope.kind === "shared" ? "공용 설정" : `${scope.projectName} 전용 설정`}</span></h2>
            <div className="hint">{scope.kind === "shared" ? "모든 고객사 소재의 기본값이 됩니다. 광고제작 머신이 렌더할 때 presets/<key>.json 위에 이 값을 덮어씁니다." : "이 고객사에서만 공용 설정 위에 덮어씁니다."}</div>
          </div>
        </div>
        <div className="controls">
          <button type="button" className="btn" onClick={() => setVals({ ...base })} disabled={pending}><RotateCcw className="ico" aria-hidden /> 기본값</button>
          <button type="button" className="btn primary" onClick={save} disabled={pending}><Save className="ico" aria-hidden /> 저장{changed.length ? ` (${changed.length})` : ""}</button>
        </div>
      </div>
      {msg && <div className={`cpz-err ${msg.startsWith("저장됨") ? "ok" : ""}`}>{msg}</div>}
      <div className="pe-body">
        <div className="pe-preview">
          {scope.presetKey === "bg_talk" ? <BgTalkPreview p={vals} bg={bg} /> : <GuidePreview p={vals} bg={bg} />}
          <div className="hint">미리보기는 위치·크기 가늠용 단순 렌더입니다. 실제 결과는 프레임 컨펌 또는 렌더로 확인합니다.</div>
          <video className="pe-sample" src={`${sampleBase}/${scope.presetKey}.mp4`} poster={`${sampleBase}/${scope.presetKey}.jpg`} controls muted playsInline preload="none" />
        </div>
        <div className="pe-fields">
          {groups.filter(([, ks]) => ks.length).map(([g, ks]) => (
            <fieldset key={g} className="pe-group"><legend>{g}</legend>
              {ks.map((k) => {
                const d = base[k], v = vals[k]; const [lab, help] = LABEL[k] ?? [k];
                const dirty = v !== d;
                return (
                  <div key={k} className={`pe-field ${dirty ? "dirty" : ""}`}>
                    <label><b>{lab}</b> <code>{k}</code>{help && <small>{help}</small>}</label>
                    {typeof d === "boolean" ? (
                      <input type="checkbox" checked={Boolean(v)} onChange={(e) => set(k, e.target.checked)} />
                    ) : typeof d === "number" ? (
                      isRatio(k, d) ? (
                        <div className="pe-slider"><input type="range" min={0} max={1} step={0.005} value={Number(v)} onChange={(e) => set(k, Number(e.target.value))} /><input type="number" step={0.005} value={Number(v)} onChange={(e) => set(k, Number(e.target.value))} /></div>
                      ) : (
                        <input type="number" step={Number.isInteger(d) ? 1 : 0.01} value={Number(v)} onChange={(e) => set(k, Number(e.target.value))} />
                      )
                    ) : (
                      <input type="text" value={String(v)} onChange={(e) => set(k, e.target.value)} />
                    )}
                    {dirty && <button type="button" className="pe-reset" title={`기본값 ${String(d)}`} onClick={() => set(k, d)}>↺ {String(d)}</button>}
                  </div>
                );
              })}
            </fieldset>
          ))}
        </div>
      </div>
    </section>
  );
}
