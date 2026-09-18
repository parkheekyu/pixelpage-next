"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical, Globe, Megaphone, Settings, Table2, type LucideIcon } from "lucide-react";
import type { Project } from "@/lib/dash/types";
import type { SeenKind } from "@/lib/dash/auth";

const TABS: { key: SeenKind | "settings"; label: string; base: string; icon: LucideIcon; staffOnly?: boolean }[] = [
  { key: "leads", label: "리드", base: "/app/projects", icon: Table2 },
  { key: "research", label: "리서치", base: "/app/research", icon: FlaskConical },
  { key: "ads", label: "광고", base: "/app/ads", icon: Megaphone },
  { key: "landing", label: "랜딩페이지", base: "/app/landing", icon: Globe },
  { key: "settings", label: "설정", base: "/app/settings", icon: Settings, staffOnly: true },
];

/** 프로젝트 헤더: 이름 + 탭(리드·리서치·광고·랜딩·설정). 현재 탭 외 안 본 항목은 배지 */
export default function ProjectNav({ project, isStaff, unread, right }: { project: Project; isStaff: boolean; unread: Partial<Record<SeenKind, number>>; right?: React.ReactNode }) {
  const pathname = usePathname() ?? "";
  return (
    <header className="ph pnav">
      <div className="pnav-title"><h1>{project.name}{project.is_own && <small>자사</small>}</h1></div>
      <nav className="ptabs">
        {TABS.filter((t) => !t.staffOnly || isStaff).map((t) => {
          const href = `${t.base}/${project.id}`;
          const on = pathname === href || pathname.startsWith(href + "/");
          const n = t.key === "settings" || on ? 0 : (unread[t.key] ?? 0);
          return (
            <Link key={t.key} href={href} className={`ptab ${on ? "on" : ""}`} title={t.label}>
              <t.icon className="ico" aria-hidden />
              <span className="ptab-label">{t.label}</span>
              {n > 0 && <span className="badge-red">{n > 99 ? "99+" : n}</span>}
            </Link>
          );
        })}
      </nav>
      {right && <div className="controls">{right}</div>}
    </header>
  );
}
