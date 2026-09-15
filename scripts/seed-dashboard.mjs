/**
 * 고객사 대시보드 시드 스크립트
 *  - 직원 계정 1개 생성 (이미 있으면 role만 staff로)
 *  - 샘플 프로젝트 5개 + 소재 + 일별 광고비 + 리드 (프로토타입 shared.js 의 생성 로직 이식)
 *
 * 사용법:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
 *   node scripts/seed-dashboard.mjs --staff-email you@pixelpage.co.kr --staff-password 'password123' [--no-sample]
 *   (.env.local 이 있으면 자동으로 읽습니다)
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";

if (existsSync(".env.local")) {
  for (const line of readFileSync(".env.local", "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
const args = Object.fromEntries(process.argv.slice(2).map((a, i, arr) => a.startsWith("--") ? [a.slice(2), arr[i + 1]?.startsWith("--") || arr[i + 1] == null ? true : arr[i + 1]] : []).filter((x) => x.length));

const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) { console.error("NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 필요"); process.exit(1); }
const db = createClient(url, key, { db: { schema: "dash" }, auth: { autoRefreshToken: false, persistSession: false } });

// ---------- 직원 계정 ----------
if (args["staff-email"]) {
  const email = String(args["staff-email"]), password = String(args["staff-password"] ?? "");
  const { data: list } = await db.auth.admin.listUsers({ perPage: 1000 });
  let user = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (!user) {
    if (password.length < 8) { console.error("--staff-password 는 8자 이상"); process.exit(1); }
    const r = await db.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { role: "staff", name: "관리자" } });
    if (r.error) { console.error(r.error.message); process.exit(1); }
    user = r.data.user; console.log("직원 계정 생성:", email);
  } else {
    if (password) await db.auth.admin.updateUserById(user.id, { password });
    console.log("직원 계정 존재:", email);
  }
  await db.from("profiles").upsert({ id: user.id, email, role: "staff", name: user.user_metadata?.name ?? "관리자" });
}

if (args["no-sample"]) { console.log("샘플 데이터 생략"); process.exit(0); }

// ---------- 샘플 데이터 ----------
const NOW = Date.now(), DAY = 86400000;
const CLIENTS = [
  { slug: "pixelpage", name: "픽셀페이지", own: true, empty: true, tm: ["희규", "인바운드"], scale: 0.9, quality: 1.1, creatives: [
    { id: "vidA_case", src: "meta", medium: "cpc", campaign: "2609_lead_pixelpage", term: "int_marketing", landing: "lp-main", cpc: 1200, ctr: 0.017, lpRate: 0.10, q: 1.2 },
    { id: "txtC_kw", src: "google", medium: "cpc", campaign: "2609_lead_pixelpage", term: "kw_leadgen", landing: "lp-main", cpc: 2400, ctr: 0.052, lpRate: 0.12, q: 1.3 },
  ], prices: [1500000, 3000000, 5000000] },
  { slug: "speech", name: "스피치 아카데미", tm: ["김민지", "박준호", "이서연"], scale: 1.0, quality: 1.0, creatives: [
    { id: "vidA_hook1", src: "meta", medium: "cpc", campaign: "2609_lead_speech", term: "la_3pct", landing: "lp-a", cpc: 620, ctr: 0.021, lpRate: 0.11, q: 1.0 },
    { id: "vidA_hook3", src: "meta", medium: "cpc", campaign: "2609_lead_speech", term: "retarget_30d", landing: "lp-a", cpc: 540, ctr: 0.034, lpRate: 0.16, q: 1.25 },
    { id: "imgB_price1", src: "meta", medium: "cpm", campaign: "2609_lead_speech", term: "la_3pct", landing: "lp-b", cpc: 480, ctr: 0.018, lpRate: 0.19, q: 0.6 },
    { id: "vidC_review", src: "google", medium: "cpc", campaign: "2609_lead_speech", term: "int_speech", landing: "lp-a", cpc: 890, ctr: 0.041, lpRate: 0.09, q: 1.1 },
    { id: "txtD_brand", src: "google", medium: "cpc", campaign: "2609_brand", term: "brand_kw", landing: "lp-b", cpc: 310, ctr: 0.065, lpRate: 0.24, q: 1.5 },
    { id: "imgE_local", src: "daangn", medium: "feed", campaign: "2609_lead_speech", term: "local_gangnam", landing: "lp-a-daangn", cpc: 260, ctr: 0.012, lpRate: 0.07, q: 0.8 },
  ], prices: [490000, 890000, 1290000] },
  { slug: "airbnb", name: "공간수익 클래스", tm: ["최유진", "정도현"], scale: 1.6, quality: 0.85, creatives: [
    { id: "vidA_story", src: "meta", medium: "cpc", campaign: "2609_lead_airbnb", term: "int_realestate", landing: "lp-main", cpc: 410, ctr: 0.028, lpRate: 0.14, q: 1.0 },
    { id: "vidB_income", src: "meta", medium: "cpc", campaign: "2609_lead_airbnb", term: "la_5pct", landing: "lp-main", cpc: 380, ctr: 0.031, lpRate: 0.18, q: 0.7 },
    { id: "imgC_host", src: "youtube", medium: "video", campaign: "2609_lead_airbnb", term: "yt_inmarket", landing: "lp-yt", cpc: 720, ctr: 0.009, lpRate: 0.10, q: 1.3 },
    { id: "txtD_search", src: "naver", medium: "cpc", campaign: "2609_brand", term: "brand_kw", landing: "lp-main", cpc: 950, ctr: 0.052, lpRate: 0.21, q: 1.4 },
  ], prices: [390000, 690000] },
  { slug: "kids", name: "더조은맘 육아코칭", tm: ["김민지", "한소라"], scale: 0.7, quality: 1.2, creatives: [
    { id: "vidA_mom", src: "meta", medium: "cpc", campaign: "2609_lead_kids", term: "int_parenting", landing: "lp-a", cpc: 350, ctr: 0.025, lpRate: 0.20, q: 1.1 },
    { id: "imgB_free", src: "meta", medium: "cpm", campaign: "2609_lead_kids", term: "la_3pct", landing: "lp-a", cpc: 290, ctr: 0.019, lpRate: 0.26, q: 0.75 },
    { id: "imgC_local", src: "daangn", medium: "feed", campaign: "2609_lead_kids", term: "local_mapo", landing: "lp-a-daangn", cpc: 210, ctr: 0.014, lpRate: 0.12, q: 0.9 },
  ], prices: [290000, 590000] },
  { slug: "auction", name: "청년경매 스쿨", tm: ["박준호", "이서연", "정도현"], scale: 1.2, quality: 0.9, creatives: [
    { id: "vidA_case", src: "meta", medium: "cpc", campaign: "2609_lead_auction", term: "int_invest", landing: "lp-a", cpc: 680, ctr: 0.019, lpRate: 0.09, q: 1.0 },
    { id: "vidB_faq", src: "meta", medium: "cpc", campaign: "2609_lead_auction", term: "retarget_14d", landing: "lp-b", cpc: 520, ctr: 0.037, lpRate: 0.15, q: 1.3 },
    { id: "txtC_kw", src: "google", medium: "cpc", campaign: "2609_lead_auction", term: "int_auction", landing: "lp-a", cpc: 1100, ctr: 0.048, lpRate: 0.11, q: 1.2 },
    { id: "imgD_yt", src: "youtube", medium: "video", campaign: "2609_lead_auction", term: "yt_affinity", landing: "lp-b", cpc: 640, ctr: 0.008, lpRate: 0.08, q: 0.8 },
  ], prices: [790000, 1490000, 2490000] },
];
const DROPS = ["부재", "노쇼", "가격", "타상품", "자격미달", "관심없음", "허위정보"];
const TM_SKILL = { "김민지": 1.2, "박준호": 0.9, "이서연": 1.0, "최유진": 1.1, "정도현": 0.85, "한소라": 1.05, "희규": 1.3, "인바운드": 1.0 };
const makeRng = (seed) => { let s = seed; return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296; };
const iso = (t) => new Date(t).toISOString();

function gen(c, idx, projectId) {
  const spend = [], leads = [];
  if (c.empty) return { spend, leads };
  const rnd = makeRng(20260912 + idx * 7919);
  const pick = (a, w) => { let r = rnd() * w.reduce((x, y) => x + y, 0); for (let i = 0; i < a.length; i++) { r -= w[i]; if (r < 0) return a[i]; } return a[a.length - 1]; };
  let n = 1;
  for (let d = 55; d >= 0; d--) {
    const dayEnd = NOW - d * DAY, date = new Date(dayEnd), dateStr = date.toISOString().slice(0, 10);
    const weekend = [0, 6].includes(date.getDay()) ? 0.7 : 1;
    for (const cr of c.creatives) {
      const cost = Math.round((40000 + rnd() * 60000) * weekend * c.scale);
      const clicks = Math.round(cost / cr.cpc), imps = Math.round(clicks / cr.ctr);
      spend.push({ project_id: projectId, date: dateStr, creative_id: cr.id, source: cr.src, impressions: imps, clicks, cost });
      const cnt = Math.round(clicks * cr.lpRate * 0.3 * (0.8 + rnd() * 0.4));
      for (let i = 0; i < cnt; i++) {
        const ts = dayEnd - rnd() * DAY, age = (NOW - ts) / DAY;
        const tm = c.tm[Math.floor(rnd() * c.tm.length)], skill = TM_SKILL[tm] ?? 1;
        let status, drop = null, contactH = null, consultH = null, revenue = 0, pay = null;
        if (!(rnd() < Math.min(0.92, 0.5 + age * 0.15))) status = age > 1 && rnd() < 0.7 ? "연락중" : "신규";
        else {
          contactH = Math.round(2 + rnd() * (skill < 0.95 ? 30 : 12));
          if (!(rnd() < 0.62 * Math.min(1, 0.4 + age * 0.12))) { status = "드랍"; drop = pick(DROPS, [40, 10, 5, 5, 10, 20, 10]); }
          else {
            consultH = contactH + Math.round(rnd() * 48);
            if (rnd() < 0.13 * cr.q * c.quality * skill * Math.min(1, 0.3 + age * 0.08)) { status = "전환"; revenue = rnd() < 0.15 ? 0 : pick(c.prices, c.prices.map((_, i) => 5 - i * 2)); pay = rnd() < 0.85 ? "결제확정" : "예약금"; }
            else if (rnd() < 0.55) { status = "드랍"; drop = pick(DROPS, [5, 25, 35, 20, 5, 10, 0]); }
            else status = "상담완료";
          }
        }
        const phoneTail = String(1000 + Math.floor(rnd() * 9000));
        leads.push({
          project_id: projectId, submitted_at: iso(ts), name: `리드${String(n++).padStart(4, "0")}`, phone: `010-0000-${phoneTail}`, phone_norm: `0100000${phoneTail}`,
          email: null, message: rnd() < 0.5 ? "상담 희망 시간: 저녁" : null,
          utm_source: cr.src, utm_medium: cr.medium, utm_campaign: cr.campaign, utm_content: cr.id, utm_term: cr.term, landing_id: cr.landing,
          status, drop_reason: drop, assignee: tm,
          first_contact_at: contactH != null ? iso(ts + contactH * 3600000) : null,
          consulted_at: consultH != null ? iso(ts + consultH * 3600000) : null,
          converted_on: status === "전환" ? new Date(ts + (consultH ?? 24) * 3600000).toISOString().slice(0, 10) : null,
          revenue, pay_type: pay, is_duplicate: rnd() < 0.05,
        });
      }
    }
  }
  return { spend, leads };
}

async function chunked(table, rows, size = 500) {
  for (let i = 0; i < rows.length; i += size) {
    const { error } = await db.from(table).insert(rows.slice(i, i + size));
    if (error) { console.error(`${table} insert 실패:`, error.message); process.exit(1); }
  }
}

for (const [idx, c] of CLIENTS.entries()) {
  const { data: existing } = await db.from("projects").select("id").eq("slug", c.slug).maybeSingle();
  if (existing) { console.log(`프로젝트 존재, 건너뜀: ${c.slug}`); continue; }
  const { data: p, error } = await db.from("projects").insert({ slug: c.slug, name: c.name, is_own: !!c.own }).select("id").single();
  if (error) { console.error(error.message); process.exit(1); }
  await chunked("creatives", c.creatives.map((cr) => ({ project_id: p.id, creative_id: cr.id, source: cr.src, medium: cr.medium, campaign: cr.campaign, term: cr.term, landing_id: cr.landing })));
  const { spend, leads } = gen(c, idx, p.id);
  await chunked("ad_spend", spend);
  await chunked("leads", leads);
  console.log(`${c.name}: 소재 ${c.creatives.length} · 광고비 ${spend.length}행 · 리드 ${leads.length}건`);
}
console.log("완료");
