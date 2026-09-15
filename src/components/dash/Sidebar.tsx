"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/app/actions";
import type { Profile, Project } from "@/lib/dash/types";

export default function Sidebar({ profile, projects }: { profile: Profile; projects: Project[] }) {
  const pathname = usePathname() ?? "";
  const isStaff = profile.role === "staff";
  const on = (href: string) => pathname === href || pathname.startsWith(href + "/");
  return (
    <aside className="pp-side">
      <div className="brand">
        <div className="logo">P</div>
        <div>픽셀페이지<small>{isStaff ? "내부 관리자" : "고객사 대시보드"}</small></div>
      </div>
      {isStaff && (
        <>
          <h4>관리</h4>
          <nav>
            <Link className={`item ${pathname === "/app/admin" ? "on" : ""}`} href="/app/admin">전체 고객사 개요</Link>
            <Link className={`item ${on("/app/admin/users") ? "on" : ""}`} href="/app/admin/users">회원 · 권한</Link>
          </nav>
        </>
      )}
      <h4>프로젝트</h4>
      <nav>
        {projects.length === 0 && <div className="hint" style={{ padding: "0 10px" }}>표시할 프로젝트가 없습니다</div>}
        {projects.map((p) => (
          <Link key={p.id} className={`item ${on(`/app/projects/${p.id}`) ? "on" : ""}`} href={`/app/projects/${p.id}`}>
            <span className={`dot ${p.is_own ? "own" : ""}`} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
            {p.is_own && <small>자사</small>}
          </Link>
        ))}
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
