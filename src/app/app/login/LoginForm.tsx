"use client";

import { useActionState } from "react";
import { signIn, type ActionResult } from "../actions";

export default function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState<ActionResult | null, FormData>(signIn, null);
  return (
    <form action={action}>
      <input type="hidden" name="next" value={next} />
      <label htmlFor="email">이메일</label>
      <input id="email" name="email" type="email" autoComplete="email" required />
      <label htmlFor="password">비밀번호</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required />
      {state && !state.ok && <div className="msg err">{state.error}</div>}
      <button className="btn primary" type="submit" disabled={pending}>{pending ? "확인 중…" : "로그인"}</button>
    </form>
  );
}
