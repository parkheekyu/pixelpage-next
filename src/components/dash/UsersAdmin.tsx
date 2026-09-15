"use client";

import { useActionState, useState, useTransition } from "react";
import { deleteUser, inviteUser, setMembership, setUserRole, type ActionResult } from "@/app/app/actions";
import type { Profile, Project } from "@/lib/dash/types";

interface Props {
  meId: string;
  profiles: Profile[];
  projects: Project[];
  members: { project_id: string; user_id: string }[];
  canInvite: boolean;
}

export default function UsersAdmin({ meId, profiles, projects, members, canInvite }: Props) {
  const [inviteState, inviteAction, invitePending] = useActionState<ActionResult | null, FormData>(inviteUser, null);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const run = (fn: () => Promise<ActionResult>) => start(async () => { setErr(null); const r = await fn(); if (!r.ok) setErr(r.error); });
  const isMember = (u: string, p: string) => members.some((m) => m.user_id === u && m.project_id === p);

  return (
    <>
      <header className="ph"><h1>회원 · 권한 <small>{profiles.length}명</small></h1></header>

      <div className="card" style={{ marginBottom: 12 }}>
        <h2>회원 추가</h2>
        <div className="sub">비밀번호를 지정하면 바로 로그인 가능한 계정이 만들어지고, 비워두면 초대 메일이 발송됩니다.</div>
        {!canInvite && <div className="msg err">SUPABASE_SERVICE_ROLE_KEY 가 설정되지 않아 회원 추가를 할 수 없습니다.</div>}
        <form action={inviteAction} className="form-row">
          <label className="f">이메일<input name="email" type="email" required /></label>
          <label className="f">이름<input name="name" type="text" /></label>
          <label className="f">역할
            <select name="role" defaultValue="client"><option value="client">고객사</option><option value="staff">직원</option></select>
          </label>
          <label className="f">배정 프로젝트 (고객사)
            <select name="project_id" defaultValue=""><option value="">없음</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
          </label>
          <label className="f">비밀번호 (선택)<input name="password" type="password" autoComplete="new-password" minLength={8} /></label>
          <button className="btn primary" type="submit" disabled={invitePending || !canInvite} style={{ alignSelf: "flex-end" }}>{invitePending ? "처리 중…" : "추가"}</button>
          {inviteState && <div className={`msg ${inviteState.ok ? "ok" : "err"}`} style={{ width: "100%" }}>{inviteState.ok ? inviteState.message : inviteState.error}</div>}
        </form>
      </div>

      {err && <div className="msg err">{err}</div>}

      <div className="card">
        <h2>회원 목록</h2>
        <div className="sub">직원은 모든 프로젝트를 볼 수 있고, 고객사는 체크된 프로젝트만 볼 수 있습니다.</div>
        <div className="tbl-wrap">
          <table className="tbl left">
            <thead>
              <tr><th>이름</th><th>이메일</th><th>역할</th>{projects.map((p) => <th key={p.id} style={{ textAlign: "center" }}>{p.name}</th>)}<th></th></tr>
            </thead>
            <tbody>
              {profiles.map((u) => (
                <tr key={u.id} style={{ opacity: pending ? 0.6 : 1 }}>
                  <td>{u.name || <span style={{ color: "var(--muted)" }}>–</span>}{u.id === meId && <span className="pill" style={{ marginLeft: 6, fontSize: 11 }}>나</span>}</td>
                  <td>{u.email}</td>
                  <td>
                    <select value={u.role} disabled={u.id === meId} onChange={(e) => run(() => setUserRole(u.id, e.target.value as "staff" | "client"))}>
                      <option value="client">고객사</option><option value="staff">직원</option>
                    </select>
                  </td>
                  {projects.map((p) => (
                    <td key={p.id} style={{ textAlign: "center" }}>
                      {u.role === "staff"
                        ? <span style={{ color: "var(--muted)" }}>전체</span>
                        : <input type="checkbox" checked={isMember(u.id, p.id)} onChange={(e) => run(() => setMembership(u.id, p.id, e.target.checked))} />}
                    </td>
                  ))}
                  <td>
                    {u.id !== meId && (
                      <button className="btn danger" onClick={() => { if (confirm(`${u.email} 계정을 삭제할까요?`)) run(() => deleteUser(u.id)); }}>삭제</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
