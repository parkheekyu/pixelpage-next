"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bot, Check, Copy, Download, Pencil, Trash2, Upload } from "lucide-react";
import type { Project } from "@/lib/dash/types";
import { ASSET_KINDS, KIND_LABEL, type AssetKind, type ClientPreset, type PresetAsset } from "@/lib/dash/preset-types";
import { deleteAsset, getUploadUrl, registerAsset, relabelAsset, renameClientPreset } from "@/app/app/preset-actions";

type CatalogItem = { key: string; name: string; tag: string; desc: string; fit: string; cost: string; clients: string[] } | null;
type Up = { id: string; name: string; kind: AssetKind; pct: number; err?: string };

const MAX = 50 * 1024 * 1024;
const fmt = (n: number | null) => (n == null ? "" : n > 1e6 ? `${(n / 1e6).toFixed(1)}MB` : `${Math.round(n / 1e3)}KB`);

function putWithProgress(url: string, file: File, onPct: (p: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("content-type", file.type || "application/octet-stream");
    xhr.setRequestHeader("x-upsert", "true");
    xhr.upload.onprogress = (e) => { if (e.lengthComputable) onPct(Math.round((e.loaded / e.total) * 100)); };
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`업로드 실패 (${xhr.status}) ${xhr.responseText.slice(0, 120)}`)));
    xhr.onerror = () => reject(new Error("네트워크 오류"));
    xhr.send(file);
  });
}

function Preview({ a }: { a: PresetAsset }) {
  const m = a.mime ?? "";
  if (m.startsWith("video/")) return <video src={a.url} muted loop playsInline preload="metadata" onMouseEnter={(e) => { e.currentTarget.play().catch(() => {}); }} onMouseLeave={(e) => { e.currentTarget.pause(); }} />;
  if (m.startsWith("image/")) return <img src={a.url} alt={a.label ?? ""} loading="lazy" />;
  if (m.startsWith("audio/")) return <audio src={a.url} controls preload="none" />;
  return <div className="pa-file">{a.path.split(".").pop()?.toUpperCase()}</div>;
}

/** 프리셋 에셋 매니저: 종류별 드롭존 + 썸네일 그리드 + 즉시 삭제 */
export default function PresetAssetsClient({ project, preset, assets, catalog, base }: { project: Project; preset: ClientPreset; assets: PresetAsset[]; catalog: CatalogItem; base: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [items, setItems] = useState<PresetAsset[]>(assets);
  const [ups, setUps] = useState<Up[]>([]);
  const [over, setOver] = useState<AssetKind | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(preset.name);
  const [notes, setNotes] = useState(preset.notes ?? "");
  const [copied, setCopied] = useState<string | null>(null);
  const inputs = useRef<Partial<Record<AssetKind, HTMLInputElement | null>>>({});

  const upload = useCallback(async (kind: AssetKind, files: FileList | File[]) => {
    setErr(null);
    for (const f of Array.from(files)) {
      if (f.size > MAX) { setErr(`${f.name}: 50MB 초과. 영상은 720p 로 줄여 주세요.`); continue; }
      const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setUps((u) => [...u, { id: uid, name: f.name, kind, pct: 0 }]);
      try {
        const s = await getUploadUrl(preset.id, kind, f.name, f.type);
        if (!s.ok) throw new Error(s.error);
        await putWithProgress(s.signedUrl, f, (pct) => setUps((u) => u.map((x) => (x.id === uid ? { ...x, pct } : x))));
        const meta: Record<string, unknown> = {};
        if (f.type.startsWith("image/")) {
          const dim = await new Promise<{ w: number; h: number } | null>((res) => { const im = new Image(); im.onload = () => res({ w: im.naturalWidth, h: im.naturalHeight }); im.onerror = () => res(null); im.src = URL.createObjectURL(f); });
          if (dim) Object.assign(meta, dim);
        }
        const r = await registerAsset(preset.id, { kind, label: f.name.replace(/\.[a-z0-9]+$/i, ""), path: s.path, url: s.publicUrl, mime: f.type, size: f.size, meta });
        if (!r.ok || !r.asset) throw new Error(r.ok ? "등록 실패" : r.error);
        setItems((it) => [...it, r.asset!]);
        setUps((u) => u.filter((x) => x.id !== uid));
      } catch (e) {
        setUps((u) => u.map((x) => (x.id === uid ? { ...x, err: (e as Error).message } : x)));
      }
    }
  }, [preset.id]);

  const remove = (a: PresetAsset) => {
    setItems((it) => it.filter((x) => x.id !== a.id));
    start(async () => { const r = await deleteAsset(a.id); if (!r.ok) { setErr(r.error); setItems((it) => [...it, a]); } });
  };
  const relabel = (a: PresetAsset) => {
    const v = prompt("라벨", a.label ?? ""); if (v == null) return;
    setItems((it) => it.map((x) => (x.id === a.id ? { ...x, label: v } : x)));
    start(async () => { await relabelAsset(a.id, v); });
  };
  const copy = (a: PresetAsset) => { navigator.clipboard.writeText(a.url).then(() => { setCopied(a.id); setTimeout(() => setCopied(null), 1200); }); };
  const saveHead = () => start(async () => { const r = await renameClientPreset(preset.id, name, notes || null); if (!r.ok) setErr(r.error); else { setEditing(false); router.refresh(); } });

  const onDrop = (kind: AssetKind) => (e: React.DragEvent) => { e.preventDefault(); setOver(null); if (e.dataTransfer.files?.length) upload(kind, e.dataTransfer.files); };

  return (
    <section className="cpz pa">
      <div className="cpz-head">
        <div className="pa-title">
          <Link href={`/app/presets/${project.id}`} className="btn" title="프리셋 목록"><ArrowLeft className="ico" aria-hidden /></Link>
          {editing ? (
            <div className="pa-edit">
              <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="프리셋 이름" />
              <input className="input" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="메모 (타겟·톤·주의사항)" />
              <button type="button" className="btn primary" onClick={saveHead} disabled={pending}>저장</button>
              <button type="button" className="btn" onClick={() => setEditing(false)}>취소</button>
            </div>
          ) : (
            <div>
              <h2>{preset.name} <code>{preset.preset_key}</code> <button type="button" className="btn pa-pencil" onClick={() => setEditing(true)} title="이름·메모 수정"><Pencil className="ico" aria-hidden /></button></h2>
              <div className="hint">{preset.notes || catalog?.desc}</div>
            </div>
          )}
        </div>
        <a className="btn" href={`${base}/${preset.preset_key}.mp4`} target="_blank" rel="noreferrer">프리셋 샘플 보기</a>
      </div>
      {err && <div className="cpz-err">{err}</div>}
      <p className="hint pa-help">파일을 아래 칸에 끌어다 놓거나 칸을 눌러 고릅니다. <Bot className="ico" aria-hidden /> 표시는 광고제작 머신이 생성해 넣은 에셋입니다. 소재 제작 시 이 프리셋의 에셋을 우선 씁니다. (파일당 50MB)</p>

      <div className="pa-zones">
        {ASSET_KINDS.map((kind) => {
          const K = KIND_LABEL[kind];
          const list = items.filter((a) => a.kind === kind);
          const uploading = ups.filter((u) => u.kind === kind);
          return (
            <div key={kind} className={`pa-zone ${over === kind ? "over" : ""} ${kind}`}
              onDragOver={(e) => { e.preventDefault(); setOver(kind); }} onDragLeave={() => setOver(null)} onDrop={onDrop(kind)}>
              <div className="pa-zone-head">
                <div><b>{K.label}</b> <span className="hint">{list.length}개 · {K.hint}</span></div>
                <button type="button" className="btn" onClick={() => inputs.current[kind]?.click()}><Upload className="ico" aria-hidden /> 올리기</button>
                <input ref={(el) => { inputs.current[kind] = el; }} type="file" multiple accept={K.accept} hidden onChange={(e) => { if (e.target.files?.length) upload(kind, e.target.files); e.target.value = ""; }} />
              </div>
              <div className="pa-grid">
                {list.map((a) => (
                  <figure key={a.id} className={`pa-item ${kind === "bg" || kind === "photo" ? "tall" : ""}`}>
                    <div className="pa-media"><Preview a={a} />{a.source === "generated" && <span className="pa-bot" title="광고제작 머신 생성"><Bot className="ico" aria-hidden /></span>}</div>
                    <figcaption>
                      <span className="pa-label" title={a.label ?? ""}>{a.label ?? a.path.split("/").pop()}</span>
                      <span className="pa-dim">{a.meta && typeof a.meta.w === "number" ? `${a.meta.w}×${a.meta.h} · ` : ""}{fmt(a.size)}</span>
                    </figcaption>
                    <div className="pa-act">
                      <button type="button" title="라벨" onClick={() => relabel(a)}><Pencil className="ico" aria-hidden /></button>
                      <button type="button" title="URL 복사" onClick={() => copy(a)}>{copied === a.id ? <Check className="ico" aria-hidden /> : <Copy className="ico" aria-hidden />}</button>
                      <a title="다운로드" href={a.url} download target="_blank" rel="noreferrer"><Download className="ico" aria-hidden /></a>
                      <button type="button" title="삭제" className="del" onClick={() => remove(a)}><Trash2 className="ico" aria-hidden /></button>
                    </div>
                  </figure>
                ))}
                {uploading.map((u) => (
                  <figure key={u.id} className={`pa-item up ${u.err ? "bad" : ""}`}>
                    <div className="pa-media"><div className="pa-prog"><i style={{ width: `${u.pct}%` }} /></div><span>{u.err ? u.err : `${u.pct}%`}</span></div>
                    <figcaption><span className="pa-label">{u.name}</span></figcaption>
                    {u.err && <div className="pa-act"><button type="button" title="지우기" className="del" onClick={() => setUps((x) => x.filter((y) => y.id !== u.id))}><Trash2 className="ico" aria-hidden /></button></div>}
                  </figure>
                ))}
                {list.length === 0 && uploading.length === 0 && <div className="pa-drop-hint">여기에 끌어다 놓기</div>}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
