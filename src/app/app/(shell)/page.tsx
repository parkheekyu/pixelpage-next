import { redirect } from "next/navigation";
import { requireSession, getMyProjects } from "@/lib/dash/auth";

/** /app 진입: 직원은 관리자 개요, 고객사는 자기 첫 프로젝트 시트로 */
export default async function AppIndex() {
  const { profile } = await requireSession();
  if (profile.role === "staff") redirect("/app/admin");
  const projects = await getMyProjects();
  if (projects[0]) redirect(`/app/projects/${projects[0].id}`);
  return (
    <div className="card" style={{ maxWidth: 520 }}>
      <h2>배정된 프로젝트가 없습니다</h2>
      <div className="sub">픽셀페이지 담당자에게 프로젝트 연결을 요청해 주세요.</div>
    </div>
  );
}
