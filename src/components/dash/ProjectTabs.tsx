"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProjectTabs({ id, isStaff }: { id: string; isStaff: boolean }) {
  const pathname = usePathname() ?? "";
  const base = `/app/projects/${id}`;
  const isReport = pathname.startsWith(base + "/report");
  return (
    <div className="controls">
      <div className="tabs">
        <Link href={base} className={!isReport ? "on" : ""}>리드 시트</Link>
        <Link href={`${base}/report`} className={isReport ? "on" : ""}>{isStaff ? "성과 리포트 (내부)" : "성과 리포트"}</Link>
      </div>
    </div>
  );
}
