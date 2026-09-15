import "server-only";
import { createClient } from "@supabase/supabase-js";

/** service role 클라이언트 — RLS 우회. 회원 초대·웹훅 적재 등 서버 전용 작업에만 사용. */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_SERVICE_ROLE_KEY 미설정");
  return createClient(url, key, { db: { schema: "dash" }, auth: { autoRefreshToken: false, persistSession: false } });
}
