"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Search } from "lucide-react";
import { signOut } from "@/app/app/actions";
import type { Profile, Project } from "@/lib/dash/types";

/** 상단 바: 고객사 검색(⌘F), 알림 자리, 프로필 */
export default function TopBar({ profile, projects }: { profile: Profile; projects: Project[] }) {
  const router = useRouter();
  const [q, setQ] = useState(""); const [open, setOpen] = useState(false); const [sel, setSel] = useState(0);
  const ref = useRef<HTMLInputElement>(null);
  const hits = useMemo(() => (q.trim() ? projects.filter((p) => p.name.includes(q.trim()) || p.slug.includes(q.trim().toLowerCase())) : projects).slice(0, 8), [q, projects]);
  useEffect(() => { const h = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f") { e.preventDefault(); ref.current?.focus(); setOpen(true); } if (e.key === "Escape") setOpen(false); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); }, []);
  const initials = (profile.name || profile.email).slice(0, 1).toUpperCase();
  return (
    <div className="pp-topbar">
      <div className="search" style={{ position: "relative" }}>
        <Search className="ico" aria-hidden />
        <input ref={ref} value={q} placeholder="고객사 검색" onChange={(e) => { setQ(e.target.value); setOpen(true); setSel(0); }} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => { if (e.key === "ArrowDown") setSel((s) => Math.min(s + 1, hits.length - 1)); if (e.key === "ArrowUp") setSel((s) => Math.max(s - 1, 0)); if (e.key === "Enter" && hits[sel]) { router.push(`/app/projects/${hits[sel].id}`); setOpen(false); setQ(""); } }} />
        <kbd>⌘ + F</kbd>
        {open && hits.length > 0 && (
          <div className="search-pop">
            {hits.map((p, i) => <Link key={p.id} href={`/app/projects/${p.id}`} className={i === sel ? "sel" : ""} onMouseDown={(e) => e.preventDefault()} onClick={() => { setOpen(false); setQ(""); }}>{p.name}{p.is_own ? " · 자사" : ""}</Link>)}
          </div>
        )}
      </div>
      <div className="sp" />
      <button type="button" className="iconbtn" title="알림 (준비 중)" aria-label="알림"><Bell className="ico" aria-hidden /></button>
      <div className="me">
        <div className="avatar" aria-hidden>{initials}</div>
        <div><b>{profile.name || profile.email}</b><small>{profile.role === "staff" ? "픽셀페이지 직원" : "고객사"}</small></div>
        <form action={signOut}><button type="submit" className="iconbtn" title="로그아웃" aria-label="로그아웃"><LogOut className="ico" aria-hidden /></button></form>
      </div>
    </div>
  );
}
