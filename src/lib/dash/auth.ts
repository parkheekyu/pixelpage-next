import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile, Project } from "./types";

/** 로그인 사용자 + 프로필. 요청 단위로 캐시. */
export const getSession = cache(async () => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (!profile) return null;
  return { user, profile: profile as Profile, supabase };
});

export async function requireSession() {
  const s = await getSession();
  if (!s) redirect("/app/login");
  return s;
}

export async function requireStaff() {
  const s = await requireSession();
  if (s.profile.role !== "staff") redirect("/app");
  return s;
}

/** 사용자가 볼 수 있는 프로젝트 목록 (RLS가 걸러준다) */
export const getMyProjects = cache(async (): Promise<Project[]> => {
  const s = await getSession();
  if (!s) return [];
  const { data } = await s.supabase.from("projects").select("*").eq("active", true).order("is_own", { ascending: false }).order("name");
  return (data ?? []) as Project[];
});

/** 프로젝트 접근 검증 — RLS로 안 보이면 not found 처리 */
export async function requireProject(id: string) {
  const s = await requireSession();
  const { data } = await s.supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (!data) redirect("/app");
  return { ...s, project: data as Project };
}
