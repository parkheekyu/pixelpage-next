"use client";

import { useState } from "react";
import Link from "next/link";

type Item = { key: string; name: string; tag: string; desc: string; fit: string; cost: string; clients: string[] };

/** 9:16 프리셋 카드 그리드. hover 시 음소거 재생, 클릭 시 큰 플레이어(소리 켜짐). */
export default function PresetGallery({ items, base }: { items: Item[]; base: string }) {
  const [open, setOpen] = useState<Item | null>(null);
  const src = (k: string, ext: string) => `${base}/${k}.${ext}`;
  return (
    <>
      <div className="preset-grid">
        {items.map((it) => (
          <article key={it.key} className="preset-card" onClick={() => setOpen(it)}>
            <div className="preset-video">
              <video src={src(it.key, "mp4")} poster={src(it.key, "jpg")} muted loop playsInline preload="metadata"
                onMouseEnter={(e) => { e.currentTarget.play().catch(() => {}); }} onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }} />
              <span className="preset-tag">{it.tag}</span>
            </div>
            <div className="preset-body">
              <h3>{it.name} <code>{it.key}</code></h3>
              <p>{it.desc}</p>
              <div className="preset-meta"><span>{it.cost}</span><span>{it.clients.join(" · ")}</span></div>
            </div>
          </article>
        ))}
      </div>
      {open && (
        <div className="preset-modal" onClick={() => setOpen(null)}>
          <div className="preset-modal-box" onClick={(e) => e.stopPropagation()}>
            <video src={src(open.key, "mp4")} poster={src(open.key, "jpg")} controls autoPlay playsInline />
            <div className="preset-modal-side">
              <h2>{open.name} <code>{open.key}</code></h2>
              <p>{open.desc}</p>
              <h4>어울리는 곳</h4><p>{open.fit}</p>
              <h4>비용 · 시간</h4><p>{open.cost}</p>
              <h4>써본 고객사</h4><p>{open.clients.join(", ")}</p>
              <p className="hint">광고제작/presets/{open.key}.json · 실행법은 CLAUDE.md 프리셋 항목</p>
              <div className="controls"><Link href={`/app/presets/edit/${open.key}`} className="btn primary">설정 편집</Link><button type="button" className="btn" onClick={() => setOpen(null)}>닫기</button></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
