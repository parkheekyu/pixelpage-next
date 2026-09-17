"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight, FlaskConical, Globe, Megaphone, Table2, type LucideIcon } from "lucide-react";
import logoDark from "@/assets/logo-dark.png";
import { signOut } from "@/app/app/actions";
import type { Profile, Project } from "@/lib/dash/types";

/** 사이드바 메뉴 그룹: 각 그룹 아래에 고객사(프로젝트) 목록. 토글로 접고 펼침. */
const GROUPS: { key: string; label: string; base: string; icon: LucideIcon }[] = [
  { key: "leads", label: "리드", base: "/app/projects", icon: Table2 },
  { key: "research", label: "리서치", base: "/app/research", icon: FlaskConical },
  { key: "ads", label: "광고", base: "/app/ads", icon: Megaphone },
  { key: "landing", label: "랜딩페이지", base: "/app/landing", icon: Globe },
];
const OPEN_KEY = "sidebarOpenGroups";

export default function Sidebar({ profile, projects }: { profile: Profile; projects: Project[] }) {
  const pathname = usePathname() ?? "";
  const isStaff = profile.role === "staff";
  const activeGroup = GROUPS.find((g) => pathname.startsWith(g.base + "/"))?.key ?? "leads";
  const [open, setOpen] = useState<Record<string, boolean>>({ leads: true });
  useEffect(() => {
    const t = setTimeout(() => { try { const v = JSON.parse(localStorage.getItem(OPEN_KEY) || "null"); if (v && typeof v === "object") setOpen((o) => ({ ...o, ...v, [activeGroup]: true })); else setOpen((o) => ({ ...o, [activeGroup]: true })); } catch {} }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => { setOpen((o) => (o[activeGroup] ? o : { ...o, [activeGroup]: true })); }, [activeGroup]);
  const toggle = (k: string) => setOpen((o) => { const n = { ...o, [k]: !o[k] }; try { localStorage.setItem(OPEN_KEY, JSON.stringify(n)); } catch {} return n; });

  return (
    <aside className="pp-side">
      <div className="brand">
        <Image src={logoDark} alt="픽셀페이지" width={120} height={24} className="brand-logo" priority />
        <small>{isStaff ? "내부 관리자" : "고객사 대시보드"}</small>
      </div>
      {isStaff && (
        <>
          <h4>관리</h4>
          <nav>
            <Link className={`item ${pathname === "/app/admin" ? "on" : ""}`} href="/app/admin">전체 고객사 개요</Link>
            <Link className={`item ${pathname.startsWith("/app/admin/users") ? "on" : ""}`} href="/app/admin/users">회원 · 권한</Link>
          </nav>
        </>
      )}
      <h4>메뉴</h4>
      <nav className="groups">
        {GROUPS.map((g) => {
          const isOpen = !!open[g.key];
          return (
            <div key={g.key} className={`group ${activeGroup === g.key ? "active" : ""}`}>
              <button type="button" className="group-head" onClick={() => toggle(g.key)} aria-expanded={isOpen}>
                {isOpen ? <ChevronDown className="ico" aria-hidden /> : <ChevronRight className="ico" aria-hidden />}
                <g.icon className="ico" aria-hidden />
                <span>{g.label}</span>
                <small>{projects.length}</small>
              </button>
              {isOpen && (
                <div className="group-body">
                  {projects.length === 0 && <div className="hint" style={{ padding: "2px 10px 6px" }}>프로젝트 없음</div>}
                  {projects.map((p) => {
                    const href = `${g.base}/${p.id}`;
                    const on = pathname === href || pathname.startsWith(href + "/");
                    return (
                      <Link key={p.id} className={`item sub ${on ? "on" : ""}`} href={href}>
                        <span className={`dot ${p.is_own ? "own" : ""}`} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
                        {p.is_own && <small>자사</small>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <div className="me">
        <div>
          <b>{profile.name || profile.email}</b>
          <span className={`role ${profile.role}`}>{isStaff ? "직원" : "고객사"}</span>
        </div>
        <form action={signOut}><button className="btn" type="submit">로그아웃</button></form>
      </div>
    </aside>
  );
}
