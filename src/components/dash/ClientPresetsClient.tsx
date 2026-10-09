"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Layers, X, Clapperboard } from "lucide-react";
import type { EditRow } from "@/lib/dash/editor-types";
import { deleteProjectEdit } from "@/app/app/editor-actions";
import type { Project } from "@/lib/dash/types";
import type { ClientPreset } from "@/lib/dash/preset-types";
import { createClientPreset, deleteClientPreset } from "@/app/app/preset-actions";

type CatalogItem = { key: string; name: string; tag: string; desc: string; fit: string; cost: string; clients: string[] };

/** 고객사 프리셋 목록 + "새 프리셋"(공용 프리셋에서 선택) 모달 */
export default function ClientPresetsClient({ project, list, counts, catalog, base, edits = [] }: { project: Project; list: ClientPreset[]; counts: Record<string, number>; catalog: CatalogItem[]; base: string; edits?: EditRow[] }) {
  const router = useRouter();
  const [pick, setPick] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const thumb = (k: string) => `${base}/${k}.jpg`;
  const video = (k: string) => `${base}/${k}.mp4`;

  const add = (key: string) => start(async () => {
    setErr(null);
    const r = await createClientPreset(project.id, key);
    if (!r.ok) { setErr(r.error); return; }
    setPick(false);
    router.push(`/app/presets/${project.id}/${r.id}`);
  });
  const remove = (cp: ClientPreset) => {
    if (!confirm(`"${cp.name}" 프리셋과 에셋 ${counts[cp.id] ?? 0}개를 삭제할까요?`)) return;
    start(async () => { const r = await deleteClientPreset(cp.id); if (!r.ok) setErr(r.error); else router.refresh(); });
  };

  return (
    <section className="cpz">
      <div className="cpz-head">
        <div><h2>프리셋 <span className="hint">{list.length}개</span></h2><div className="hint">공용 프리셋을 이 고객사로 가져와 배경 영상·카드·로고 같은 에셋을 지정합니다. 광고제작 머신이 생성한 에셋도 여기에 쌓입니다.</div></div>
        <button type="button" className="btn primary" onClick={() => setPick(true)} disabled={pending}><Plus className="ico" aria-hidden /> 새 프리셋</button>
      </div>
      {err && <div className="cpz-err">{err}</div>}
      {list.length === 0 ? (
        <div className="cpz-empty"><Layers className="ico" aria-hidden /><p>아직 프리셋이 없습니다. <b>새 프리셋</b>을 눌러 공용 프리셋에서 골라 오세요.</p></div>
      ) : (
        <div className="cpz-grid">
          {list.map((cp) => {
            const c = catalog.find((i) => i.key === cp.preset_key);
            return (
              <article key={cp.id} className="cpz-card">
                <Link href={`/app/presets/${project.id}/${cp.id}`} className="cpz-thumb" style={{ backgroundImage: `url(${thumb(cp.preset_key)})` }}>
                  <span className="preset-tag">{c?.tag ?? cp.preset_key}</span>
                </Link>
                <div className="cpz-body">
                  <Link href={`/app/presets/${project.id}/${cp.id}`}><h3>{cp.name} <code>{cp.preset_key}</code></h3></Link>
                  <div className="cpz-meta"><span>에셋 {counts[cp.id] ?? 0}개</span><span>{new Date(cp.created_at).toLocaleDateString("ko-KR")}</span></div>
                  {cp.notes && <p className="hint">{cp.notes}</p>}
                </div>
                <button type="button" className="btn danger cpz-del" title="프리셋 삭제" onClick={() => remove(cp)} disabled={pending}><Trash2 className="ico" aria-hidden /></button>
              </article>
            );
          })}
        </div>
      )}

      <div className="cpz-head" style={{ marginTop: 8 }}>
        <div><h2>소재 편집기 <span className="hint">{edits.length}개</span></h2><div className="hint">광고제작 머신이 올린 소재를 캡컷처럼 직접 편집합니다(자막 텍스트·타이밍, 요소 위치, 카드 교체). 저장 후 "렌더 요청"을 누르면 머신이 반영해 렌더합니다.</div></div>
      </div>
      {edits.length === 0 ? <div className="cpz-empty"><Clapperboard className="ico" aria-hidden /><p>아직 편집기에 올라온 소재가 없습니다. 머신이 <code>editor_publish.py</code> 로 올리면 여기 나타납니다.</p></div> : (
        <div className="ve-list">
          {edits.map((e) => (
            <article key={e.id} className="ve-item">
              <Link href={`/app/presets/${project.id}/editor/${e.id}`}><b>{e.name}</b> <code>{e.preset_key}</code></Link>
              <div className="cpz-meta"><span>{Number(e.total ?? 0).toFixed(1)}s</span><span>{e.edited_at ? `편집 ${new Date(e.edited_at).toLocaleString("ko-KR")}` : "편집 없음"}</span><span>{e.render_requested_at && (!e.rendered_at || e.render_requested_at > e.rendered_at) ? "렌더 대기" : e.rendered_at ? "렌더됨" : ""}</span></div>
              <button type="button" className="btn danger cpz-del" title="편집기에서 제거" disabled={pending} onClick={() => { if (confirm(`"${e.name}" 을 편집기에서 제거할까요? (렌더된 파일은 남습니다)`)) start(async () => { const r = await deleteProjectEdit(e.id); if (!r.ok) setErr(r.error); else router.refresh(); }); }}><Trash2 className="ico" aria-hidden /></button>
            </article>
          ))}
        </div>
      )}

      {pick && (
        <div className="preset-modal" onClick={() => setPick(false)}>
          <div className="cpz-pick" onClick={(e) => e.stopPropagation()}>
            <div className="cpz-pick-head"><h2>공용 프리셋에서 선택</h2><button type="button" className="btn" onClick={() => setPick(false)}><X className="ico" aria-hidden /></button></div>
            <div className="cpz-pick-grid">
              {catalog.map((it) => (
                <button type="button" key={it.key} className="cpz-pick-card" onClick={() => add(it.key)} disabled={pending}>
                  <div className="preset-video">
                    <video src={video(it.key)} poster={thumb(it.key)} muted loop playsInline preload="none"
                      onMouseEnter={(e) => { e.currentTarget.play().catch(() => {}); }} onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }} />
                    <span className="preset-tag">{it.tag}</span>
                  </div>
                  <h3>{it.name} <code>{it.key}</code></h3>
                  <p>{it.desc}</p>
                  <small>{it.cost}</small>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
