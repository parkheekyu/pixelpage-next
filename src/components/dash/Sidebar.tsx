"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Building2, LayoutDashboard, Users } from "lucide-react";
import logoDark from "@/assets/logo-dark.png";
import type { Profile, Project } from "@/lib/dash/types";
import type { UnreadMap } from "@/lib/dash/auth";

const SECTIONS = ["projects", "research", "ads", "landing", "settings"] as const;

/** 왼쪽: 고객사 목록. 고객사를 고르면 위쪽 탭(리드·리서치·광고·랜딩·설정)으로 이동. 안 본 항목은 빨간 배지. */
export default function Sidebar({ profile, projects, unread }: { profile: Profile; projects: Project[]; unread: UnreadMap }) {
  const pathname = usePathname() ?? "";
  const isStaff = profile.role === "staff";
  // 현재 보고 있는 프로젝트·종류는 배지에서 제외 (열면 확인 처리됨)
  const m = pathname.match(/^\/app\/(projects|research|ads|landing|settings)\/([^/]+)/);
  const curProject = m?.[2], curKind = m?.[1] === "projects" ? "leads" : m?.[1];
  const total = (id: string) => { const u = unread[id] ?? {}; return (["leads", "research", "ads", "landing"] as const).reduce((a, k) => a + (curProject === id && curKind === k ? 0 : (u[k] ?? 0)), 0); };
  const hrefFor = (id: string) => { const sec = m?.[1] && (SECTIONS as readonly string[]).includes(m[1]) ? m[1] : "projects"; return `/app/${sec}/${id}`; };

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
            <Link className={`item ${pathname === "/app/admin" ? "on" : ""}`} href="/app/admin"><LayoutDashboard className="ico" aria-hidden /> 전체 개요</Link>
            <Link className={`item ${pathname.startsWith("/app/admin/users") ? "on" : ""}`} href="/app/admin/users"><Users className="ico" aria-hidden /> 회원 · 권한</Link>
          </nav>
        </>
      )}
      <h4>고객사</h4>
      <nav>
        {projects.length === 0 && <div className="hint" style={{ padding: "0 10px" }}>표시할 프로젝트가 없습니다</div>}
        {projects.map((p) => {
          const n = total(p.id);
          return (
            <Link key={p.id} className={`item ${curProject === p.id ? "on" : ""}`} href={hrefFor(p.id)}>
              <Building2 className="ico" aria-hidden />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
              {n > 0 ? <span className="badge-red" aria-label={`안 본 항목 ${n}`}>{n > 99 ? "99+" : n}</span> : p.is_own ? <small>자사</small> : null}
            </Link>
          );
        })}
      </nav>
      <div className="foot">© {new Date().getFullYear()} PixelPage</div>
    </aside>
  );
}
