"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Building2, Clapperboard, FolderKanban, Handshake, LayoutDashboard, ListChecks, Users, Wallet, type LucideIcon } from "lucide-react";
import logoDark from "@/assets/logo-dark.png";
import { useEffect, useRef, useState } from "react";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { Profile, Project } from "@/lib/dash/types";
import type { UnreadMap } from "@/lib/dash/auth";

type SeenKindKey = "leads" | "research" | "ads" | "landing";
const SECTIONS = ["overview", "projects", "research", "ads", "landing", "settings"] as const;
/** 관리 메뉴. 순서는 끌어서 바꿀 수 있고, 여기 순서가 기본값이다. */
const ADMIN: { key: string; href: string; label: string; Icon: LucideIcon; exact?: boolean }[] = [
  { key: "overview", href: "/app/admin", label: "전체 개요", Icon: LayoutDashboard, exact: true },
  { key: "clients", href: "/app/admin/clients", label: "클라이언트", Icon: Handshake },
  { key: "tasks", href: "/app/admin/tasks", label: "업무 관리", Icon: ListChecks },
  { key: "work", href: "/app/admin/work", label: "프로젝트 관리", Icon: FolderKanban },
  { key: "finance", href: "/app/admin/finance", label: "매출·지출", Icon: Wallet },
  { key: "users", href: "/app/admin/users", label: "회원 · 권한", Icon: Users },
];
export const ORDER_KEY = "pp-side-order";
/** 메뉴 순서가 바뀌면 이 이름의 이벤트를 window 에 쏜다 (같은 순서로 보여 주는 화면이 따라 바뀌게) */
export const ORDER_EVENT = "pp-side-order";
type Order = Record<string, string[]>;
/** 저장된 순서대로 늘어놓는다. 저장된 뒤에 새로 생긴 항목은 원래 자리(앞 항목 바로 뒤)에 끼운다. */
export function sorted<T>(items: T[], keyOf: (t: T) => string, saved?: string[]): T[] {
  if (!saved?.length) return items;
  const out = saved.map((k) => items.find((i) => keyOf(i) === k)).filter((i): i is T => !!i);
  items.forEach((it, idx) => { if (out.includes(it)) return; const prev = idx > 0 ? out.indexOf(items[idx - 1]) : -1; out.splice(prev + 1, 0, it); });
  return out;
}

/** 왼쪽: 고객사 목록. 고객사를 고르면 위쪽 탭(리드·리서치·광고·랜딩·설정)으로 이동. 안 본 항목은 빨간 배지. */
export default function Sidebar({ profile, projects, unread, logos = {}, categories = {} }: { profile: Profile; projects: Project[]; unread: UnreadMap; logos?: Record<string, string>; categories?: Record<string, "db" | "sales"> }) {
  const pathname = usePathname() ?? "";
  const isStaff = profile.role === "staff";
  // 현재 보고 있는 프로젝트·종류는 배지에서 제외 (열면 확인 처리됨)
  const m = pathname.match(/^\/app\/(overview|projects|research|ads|landing|settings)\/([^/]+)/);
  const curProject = m?.[2], curKind = m?.[1] === "projects" ? "leads" : m?.[1];
  const total = (id: string, own: boolean) => { const u = unread[id] ?? {}; return ((own ? ["leads", "research", "ads", "landing"] : ["research", "ads", "landing"]) as SeenKindKey[]).reduce((a, k) => a + (curProject === id && curKind === k ? 0 : (u[k] ?? 0)), 0); };
  // 처음 열 때는 개요, 그 뒤로는 보던 탭을 유지
  const hrefFor = (p: Project) => { const cur = m?.[1] && (SECTIONS as readonly string[]).includes(m[1]) ? m[1] : null; const sec = !cur || (cur === "projects" && !p.is_own && !p.has_lead_sheet) ? "overview" : cur; return `/app/${sec}/${p.id}`; };

  // 접기/펴기: 저장된 값은 마운트 후 DOM 에 바로 적용 (서버 렌더와 어긋나지 않게)
  const ref = useRef<HTMLElement | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => { try { if (localStorage.getItem("pp-side-collapsed") === "1") { ref.current?.classList.add("collapsed"); ref.current?.parentElement?.classList.add("side-collapsed"); } } catch {} }, []);
  const toggle = () => { const next = !ref.current?.classList.contains("collapsed"); ref.current?.classList.toggle("collapsed", next); ref.current?.parentElement?.classList.toggle("side-collapsed", next); setCollapsed(next); try { localStorage.setItem("pp-side-collapsed", next ? "1" : "0"); } catch {} };

  // 메뉴 순서: 끌어다 놓으면 바뀌고, 이 브라우저에 기억된다
  const [order, setOrder] = useState<Order>({});
  const [drag, setDrag] = useState<{ group: string; key: string } | null>(null);
  const [over, setOver] = useState<{ key: string; after: boolean } | null>(null);
  useEffect(() => { try { const v = JSON.parse(localStorage.getItem(ORDER_KEY) ?? "{}"); if (v && typeof v === "object") setOrder(v as Order); } catch {} }, []);
  const adminItems = sorted(ADMIN, (a) => a.key, order.admin);
  const projectItems = sorted(projects, (p) => p.id, order.projects);
  /** 항목 하나에 붙이는 끌기 속성 */
  const dnd = (group: string, key: string, keys: string[]) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => { e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", key); setDrag({ group, key }); },
    onDragOver: (e: React.DragEvent) => {
      if (!drag || drag.group !== group) return;
      e.preventDefault(); e.dataTransfer.dropEffect = "move";
      const r = e.currentTarget.getBoundingClientRect(), after = e.clientY > r.top + r.height / 2;
      if (over?.key !== key || over.after !== after) setOver({ key, after });
    },
    onDrop: (e: React.DragEvent) => {
      if (!drag || drag.group !== group) return;
      e.preventDefault();
      if (drag.key !== key) {
        const rest = keys.filter((k) => k !== drag.key);
        rest.splice(rest.indexOf(key) + (over?.after ? 1 : 0), 0, drag.key);
        const next = { ...order, [group]: rest };
        setOrder(next); try { localStorage.setItem(ORDER_KEY, JSON.stringify(next)); window.dispatchEvent(new Event(ORDER_EVENT)); } catch {}
      }
      setDrag(null); setOver(null);
    },
    onDragEnd: () => { setDrag(null); setOver(null); },
  });
  const dndClass = (group: string, key: string) => (drag?.group === group ? (drag.key === key ? " dragging" : over?.key === key ? (over.after ? " drop-after" : " drop-before") : "") : "");

  return (
    <aside className="pp-side" ref={ref}>
      <div className="brand">
        <Image src={logoDark} alt="픽셀페이지" width={120} height={24} className="brand-logo" priority />
        <small>{isStaff ? "내부 관리자" : "고객사 대시보드"}</small>
        <button type="button" className="side-toggle" onClick={toggle} title={collapsed ? "메뉴 펴기" : "메뉴 접기"} aria-label={collapsed ? "메뉴 펴기" : "메뉴 접기"}>{collapsed ? <PanelLeftOpen className="ico" aria-hidden /> : <PanelLeftClose className="ico" aria-hidden />}</button>
      </div>
      {isStaff && (
        <>
          <h4>관리</h4>
          <nav>
            {adminItems.map(({ key, href, label, Icon, exact }) => (
              <Link key={key} className={`item ${(exact ? pathname === href : pathname.startsWith(href)) ? "on" : ""}${dndClass("admin", key)}`} href={href} title={label} {...dnd("admin", key, adminItems.map((a) => a.key))}><Icon className="ico" aria-hidden /> <span className="lbl">{label}</span></Link>
            ))}
          </nav>
        </>
      )}
      <h4>고객사</h4>
      <nav>
        {projects.length === 0 && <div className="hint" style={{ padding: "0 10px" }}>표시할 프로젝트가 없습니다</div>}
        {projectItems.map((p) => {
          const n = total(p.id, p.is_own);
          return (
            <Link key={p.id} className={`item ${curProject === p.id ? "on" : ""}${dndClass("projects", p.id)}`} href={hrefFor(p)} title={p.name} {...dnd("projects", p.id, projectItems.map((x) => x.id))}>
              {logos[p.id]
                ? <img className="c-logo" src={logos[p.id]} alt="" />
                : <><Building2 className="ico" aria-hidden /><span className="initial" aria-hidden>{p.name.slice(0, 1)}</span></>}
              <span className="lbl" style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
              {n > 0 ? <span className="badge-red" aria-label={`안 본 항목 ${n}`}>{n > 99 ? "99+" : n}</span> : p.is_own ? <small>자사</small> : categories[p.id] ? <small>{categories[p.id] === "sales" ? "판매" : "DB"}</small> : null}
            </Link>
          );
        })}
      </nav>
      {isStaff && (
        <>
          <h4>제작</h4>
          <nav>
            <Link className={`item ${pathname.startsWith("/app/presets") ? "on" : ""}`} href="/app/presets" title="소재 프리셋"><Clapperboard className="ico" aria-hidden /> <span className="lbl">소재 프리셋</span></Link>
          </nav>
        </>
      )}
      <div className="foot">© {new Date().getFullYear()} PixelPage</div>
    </aside>
  );
}
