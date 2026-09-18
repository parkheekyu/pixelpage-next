/**
 * 퍼플렉시티 웹 로그인 (1회). API 키 없이 리서치 기능을 쓰기 위해, 이 컴퓨터 전용 브라우저 프로필에 로그인 세션을 저장한다.
 *   node scripts/perplexity-login.mjs
 * 창이 뜨면 평소처럼 로그인하세요. 로그인이 확인되면 창이 자동으로 닫힙니다. (프로필: ~/.pixelpage/perplexity-profile)
 */
import { chromium } from "playwright";
import { homedir } from "node:os";
import path from "node:path";

const PROFILE = path.join(homedir(), ".pixelpage", "perplexity-profile");
const ctx = await chromium.launchPersistentContext(PROFILE, { headless: false, channel: undefined, viewport: { width: 1200, height: 860 }, locale: "ko-KR", args: ["--disable-blink-features=AutomationControlled"] });
const page = ctx.pages()[0] ?? (await ctx.newPage());
await page.goto("https://www.perplexity.ai/", { waitUntil: "domcontentloaded" });
console.log("브라우저 창에서 퍼플렉시티에 로그인하세요. 로그인이 확인되면 자동으로 닫힙니다. (최대 10분)");
const t0 = Date.now();
let ok = false;
while (Date.now() - t0 < 10 * 60 * 1000) {
  await page.waitForTimeout(3000);
  try {
    const cookies = await ctx.cookies("https://www.perplexity.ai");
    const hasSession = cookies.some((c) => /session|auth/i.test(c.name) && c.value.length > 20);
    const hasProfile = (await page.locator('a[href*="/settings"], [data-testid*="sidebar"] img[alt*="avatar" i], button:has-text("계정"), a:has-text("Account")').count()) > 0;
    const signIn = (await page.locator('button:has-text("Sign in"), button:has-text("로그인"), a:has-text("Sign in")').count()) > 0;
    if (hasSession && (hasProfile || !signIn)) { ok = true; break; }
  } catch { /* 페이지 이동 중 */ }
  if (ctx.pages().length === 0) break;
}
console.log(ok ? "로그인 확인됨. 세션이 저장되었습니다." : "로그인이 확인되지 않았습니다. 다시 실행해 주세요.");
await ctx.close();
process.exit(ok ? 0 : 1);
