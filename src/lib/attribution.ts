"use client";

/** URL의 utm_* / fbclid / gclid 를 읽어 세션에 보관(최초 유입 우선). 문의 폼 제출 시 함께 보낸다. */
const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "fbclid", "gclid"] as const;
const STORE = "lead_attribution";

export type Attribution = Record<(typeof KEYS)[number] | "landing_id" | "landing_url", string>;

export function captureAttribution(): Attribution {
  const empty = Object.fromEntries([...KEYS, "landing_id", "landing_url"].map((k) => [k, ""])) as Attribution;
  if (typeof window === "undefined") return empty;
  let saved: Partial<Attribution> = {};
  try { saved = JSON.parse(sessionStorage.getItem(STORE) || "{}"); } catch {}
  const params = new URLSearchParams(window.location.search);
  const data = { ...empty };
  for (const k of KEYS) {
    const v = params.get(k);
    data[k] = v && v.trim() ? v.trim().toLowerCase() : (saved[k] ?? "");
  }
  data.landing_url = saved.landing_url || window.location.href;
  data.landing_id = saved.landing_id || (window.location.pathname.replace(/\/+$/, "").split("/").pop() || "root");
  try { sessionStorage.setItem(STORE, JSON.stringify(data)); } catch {}
  return data;
}

/** 문의 폼 공용 제출. 실패해도 throw 하지 않고 ok=false 반환. */
export async function submitInquiry(payload: Record<string, unknown>): Promise<{ ok: boolean; error?: string }> {
  try {
    const r = await fetch("/api/inquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...captureAttribution(), ...payload }) });
    const j = await r.json().catch(() => ({}));
    if (r.ok) {
      // GA4 전환 이벤트 (gtag 미로드 시 무시)
      try { (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag?.("event", "generate_lead", { form: String(payload.form ?? ""), method: "website_form" }); } catch {}
    }
    return r.ok ? { ok: true } : { ok: false, error: j.error || `HTTP ${r.status}` };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}
