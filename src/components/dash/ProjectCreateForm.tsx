"use client";

import { useActionState } from "react";
import { createProject, type ActionResult } from "@/app/app/actions";

export default function ProjectCreateForm() {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(createProject, null);
  return (
    <form action={action} className="form-row">
      <label className="f">고객사 이름<input name="name" type="text" required placeholder="스피치 아카데미" /></label>
      <label className="f">슬러그<input name="slug" type="text" required placeholder="speech" pattern="[a-z0-9_-]+" /></label>
      <label className="f" style={{ flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-end", paddingBottom: 7 }}><input name="is_own" type="checkbox" /> 자사</label>
      <button className="btn primary" type="submit" disabled={pending} style={{ alignSelf: "flex-end" }}>{pending ? "생성 중…" : "만들기"}</button>
      {state && <div className={`msg ${state.ok ? "ok" : "err"}`} style={{ width: "100%" }}>{state.ok ? state.message : state.error}</div>}
    </form>
  );
}
