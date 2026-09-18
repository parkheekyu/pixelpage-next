/**
 * 퍼플렉시티 웹 자동화 (API 키 없이). ~/.pixelpage/perplexity-profile 에 저장된 로그인 세션을 사용한다.
 * ask(query, { mode: "research" | "search" }) → { text, sources, url }
 */
import { chromium } from "playwright";
import { homedir } from "node:os";
import path from "node:path";
import { existsSync } from "node:fs";

export const PROFILE = path.join(homedir(), ".pixelpage", "perplexity-profile");
export const hasProfile = () => existsSync(path.join(PROFILE, "Default")) || existsSync(path.join(PROFILE, "Cookies"));

const HEADLESS = process.env.PERPLEXITY_HEADLESS !== "0";

async function withPage(fn) {
  const ctx = await chromium.launchPersistentContext(PROFILE, { headless: HEADLESS, viewport: { width: 1280, height: 900 }, locale: "ko-KR", args: ["--disable-blink-features=AutomationControlled"] });
  try { const page = ctx.pages()[0] ?? (await ctx.newPage()); return await fn(page); } finally { await ctx.close(); }
}

/** 답변 텍스트가 일정 시간 변하지 않고, 생성 중 표시가 사라지면 완료로 본다 */
async function waitForAnswer(page, { maxMs }) {
  const t0 = Date.now(); let last = "", stableSince = Date.now();
  while (Date.now() - t0 < maxMs) {
    await page.waitForTimeout(2500);
    const state = await page.evaluate(() => {
      const busy = !!document.querySelector('button[aria-label*="Stop" i], button[aria-label*="중지"], [class*="animate-pulse"], [data-testid*="loading"]');
      const main = document.querySelector("main") ?? document.body;
      const prose = [...main.querySelectorAll('[class*="prose"], .markdown, [data-testid*="answer"]')];
      const text = (prose.length ? prose.map((e) => e.innerText).join("\n\n") : main.innerText).trim();
      return { busy, text };
    });
    if (state.text !== last) { last = state.text; stableSince = Date.now(); }
    if (!state.busy && last.length > 200 && Date.now() - stableSince > 8000) return last;
  }
  return last;
}

export async function ask(query, { mode = "research", maxMs = 8 * 60 * 1000 } = {}) {
  return withPage(async (page) => {
    await page.goto("https://www.perplexity.ai/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);
    if (await page.locator('button:has-text("Sign in"), button:has-text("로그인")').first().isVisible().catch(() => false)) throw new Error("퍼플렉시티 로그인 필요: node scripts/perplexity-login.mjs");
    // 모드 선택 (Research/리서치). 버튼 구조가 바뀌면 검색 모드로 진행
    if (mode === "research") {
      try {
        const modeBtn = page.locator('button:has-text("Research"), button:has-text("리서치"), button[aria-label*="mode" i]').first();
        if (await modeBtn.isVisible({ timeout: 3000 })) { await modeBtn.click(); await page.waitForTimeout(600); const opt = page.locator('[role="menuitem"]:has-text("Research"), [role="option"]:has-text("Research"), [role="menuitem"]:has-text("리서치"), div:has-text("Research") >> nth=-1').first(); if (await opt.isVisible({ timeout: 2000 }).catch(() => false)) await opt.click(); }
      } catch { /* 모드 선택 실패 → 기본 모드 */ }
    }
    const input = page.locator('textarea, [contenteditable="true"][role="textbox"], [contenteditable="true"]').first();
    await input.waitFor({ timeout: 15000 });
    await input.click(); await input.fill(query).catch(async () => { await page.keyboard.type(query); });
    await page.waitForTimeout(500); await page.keyboard.press("Enter");
    await page.waitForURL(/perplexity\.ai\/search\//, { timeout: 30000 }).catch(() => {});
    const text = await waitForAnswer(page, { maxMs });
    const sources = await page.evaluate(() => {
      const out = new Map();
      for (const a of document.querySelectorAll('main a[href^="http"]')) { const u = a.href; if (/perplexity\.ai/.test(u)) continue; const t = (a.innerText || a.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 80); if (!out.has(u)) out.set(u, t); }
      return [...out.entries()].slice(0, 40).map(([url, title]) => ({ url, title }));
    });
    return { text, sources, url: page.url() };
  });
}

/** 리서치용 3갈래 사전 조사 (순차 실행, 각 최대 8분) */
export async function preResearchWeb({ name, product, target, competitors }) {
  const base = `고객사: ${name}\n상품/서비스: ${product}\n타깃 고객: ${target}${competitors ? `\n알려진 경쟁사/대안: ${competitors}` : ""}`;
  const qs = [
    ["타깃 목소리", `${base}\n\n이 타깃이 실제로 모이는 한국 커뮤니티(네이버 카페·지식iN·블로그, 유튜브 댓글, 인스타·스레드, 디시·클리앙·블라인드 등)와 후기·Q&A를 최대한 찾아 정리해줘. 1) 페인포인트와 원하는 결과(니즈)를 빈도 순으로 2) 실제로 쓰는 표현·단어·검색어를 원문 그대로 인용(최소 15개, 출처) 3) 이 상품군을 살 때 걱정·의심·거절 이유(원문 인용) 4) 이미 시도해 본 대안과 불만.`],
    ["경쟁사·시장", `${base}\n\n한국 시장에서 같은 문제를 푸는 경쟁사·대안 상위 5~8곳(알려진 곳 포함)을 찾아 각각 가격/오퍼, 메인 헤드라인과 CTA 카피(원문), 내세우는 증거, 광고 포맷·채널, 최근 6개월 변화를 정리하고, 시장 전체의 최근 변화(규제·트렌드·뉴스)도 정리해줘. 항목마다 출처.`],
    ["키워드·광고", `${base}\n\n1) 이 타깃이 정보 탐색→비교→구매 단계에서 쓰는 검색 키워드 20개 이상(네이버·유튜브·구글) 2) 지금 이 시장에서 돌고 있는 광고·콘텐츠 메시지 패턴과 실제 카피 예시(원문 인용) 3) 잘 되는 콘텐츠(조회수·댓글 근거)와 이유. 출처 표시.`],
  ];
  const parts = [];
  for (const [label, q] of qs) {
    try {
      const r = await ask(q, { mode: "research" });
      parts.push(`### ${label}\n${r.text}\n\n출처:\n${r.sources.map((s, i) => `[${i + 1}] ${s.title ? s.title + " — " : ""}${s.url}`).join("\n")}\n(퍼플렉시티 스레드: ${r.url})`);
    } catch (e) { parts.push(`### ${label}\n(조사 실패: ${e.message})`); }
  }
  return parts.join("\n\n");
}
