/**
 * 유튜브 채널 모니터링 (워커에서 하루 두 번 호출).
 * 새 롱폼(라이브·쇼츠 제외)이 올라오면 담당 직원 봇이 고객사 채널에서 대표에게 "광고로 만들까요?" 라고 묻는다.
 * 대표가 스레드에서 승인하면(employees.mjs 에서 감지) video_ad 작업이 등록되고 광고제작 프로젝트가 실행된다.
 */
import { spawn } from "node:child_process";

const KST = (d = new Date()) => new Date(d.getTime() + 9 * 3600 * 1000);
export const SLOTS = ["08:30", "18:30"]; // KST

async function slackApi(method, body, token) {
  const r = await fetch(`https://slack.com/api/${method}`, { method: "POST", headers: { authorization: `Bearer ${token}`, "content-type": "application/json; charset=utf-8" }, body: JSON.stringify(body), signal: AbortSignal.timeout(15000) });
  return r.json();
}
async function resolveChannel(handle) {
  const r = await fetch(`https://www.youtube.com/@${encodeURIComponent(handle)}`, { headers: { "accept-language": "ko,en;q=0.8", "user-agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(20000) });
  const html = await r.text();
  const id = html.match(/"channelId":"(UC[\w-]{20,})"/)?.[1] ?? html.match(/<meta itemprop="identifier" content="(UC[\w-]+)"/)?.[1];
  const title = html.match(/<meta property="og:title" content="([^"]+)"/)?.[1] ?? handle;
  return { id, title };
}
async function feed(channelId) {
  const r = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`, { signal: AbortSignal.timeout(20000) });
  const xml = await r.text();
  const out = [];
  for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
    const e = m[1];
    const id = e.match(/<yt:videoId>([^<]+)</)?.[1]; const title = e.match(/<title>([^<]*)</)?.[1] ?? ""; const published = e.match(/<published>([^<]+)</)?.[1];
    if (id) out.push({ id, title: title.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'"), published });
  }
  return out;
}
/** 쇼츠/라이브 판별: yt-dlp 메타(길이, live_status) + /shorts/ URL 응답 */
async function classify(videoId) {
  const meta = await new Promise((resolve) => {
    const p = spawn("yt-dlp", ["--dump-single-json", "--no-download", "--no-warnings", `https://www.youtube.com/watch?v=${videoId}`], { stdio: ["ignore", "pipe", "pipe"] });
    let out = ""; p.stdout.on("data", (d) => (out += d)); p.on("error", () => resolve(null)); p.on("close", () => { try { resolve(JSON.parse(out)); } catch { resolve(null); } });
    setTimeout(() => { p.kill("SIGKILL"); resolve(null); }, 60000);
  });
  let isShort = false;
  try { const r = await fetch(`https://www.youtube.com/shorts/${videoId}`, { redirect: "manual", signal: AbortSignal.timeout(15000) }); isShort = r.status === 200; } catch {}
  const duration = meta?.duration ?? null; const live = meta?.live_status && meta.live_status !== "not_live";
  const kind = live ? "live" : isShort || (duration != null && duration <= 60 && (meta?.width ?? 0) < (meta?.height ?? 0)) ? "short" : duration == null ? "unknown" : "long";
  return { kind, duration, title: meta?.title, channel_title: meta?.channel ?? meta?.uploader };
}

/** 슬롯 시각이 지났고 그 슬롯 이후 확인한 적이 없으면 실행 */
export function dueNow(lastCheckedAt) {
  const now = KST(); const hm = now.toISOString().slice(11, 16); const today = now.toISOString().slice(0, 10);
  const passed = SLOTS.filter((s) => hm >= s); if (!passed.length) return false;
  const slot = passed[passed.length - 1]; const slotAt = new Date(`${today}T${slot}:00+09:00`).getTime();
  return !lastCheckedAt || new Date(lastCheckedAt).getTime() < slotAt;
}

export async function checkYoutube(db, { log, bots, force = false }) {
  const { data: watches } = await db.from("yt_watch").select("*").eq("enabled", true);
  for (const w of watches ?? []) {
    if (!force && !dueNow(w.last_checked_at)) continue;
    try {
      let { channel_id, channel_title } = w;
      if (!channel_id) { const c = await resolveChannel(w.handle); if (!c.id) { log(`유튜브 ${w.handle}: 채널 ID 못 찾음`); continue; } channel_id = c.id; channel_title = c.title; await db.from("yt_watch").update({ channel_id, channel_title }).eq("id", w.id); }
      const entries = await feed(channel_id);
      const { data: known } = await db.from("yt_videos").select("video_id").in("video_id", entries.map((e) => e.id));
      const knownIds = new Set((known ?? []).map((k) => k.video_id));
      const fresh = entries.filter((e) => !knownIds.has(e.id));
      const firstRun = !w.last_checked_at;
      for (const e of fresh) {
        const url = `https://www.youtube.com/watch?v=${e.id}`;
        if (firstRun) { await db.from("yt_videos").upsert({ video_id: e.id, project_id: w.project_id, watch_id: w.id, handle: w.handle, channel_title, title: e.title, url, published_at: e.published, status: "seen", kind: "unknown" }); continue; }
        const c = await classify(e.id);
        const row = { video_id: e.id, project_id: w.project_id, watch_id: w.id, handle: w.handle, channel_title: c.channel_title ?? channel_title, title: c.title ?? e.title, url, published_at: e.published, duration_s: c.duration, kind: c.kind, status: "seen" };
        if (c.kind !== "long") { await db.from("yt_videos").upsert(row); log(`유튜브 ${w.handle}: ${c.kind} 건너뜀 · ${e.title}`); continue; }
        const bot = bots[w.employee_id];
        if (!bot?.bot_token) { await db.from("yt_videos").upsert(row); log(`유튜브 ${w.handle}: 봇 토큰 없음(${w.employee_id})`); continue; }
        const mins = c.duration ? `${Math.round(c.duration / 60)}분` : "";
        const text = `대표님, ${row.channel_title} 채널에 새 영상 올라왔어요. ${mins ? `(${mins}) ` : ""}광고로 만들까요?\n${e.title}\n${url}`;
        const j = await slackApi("chat.postMessage", { channel: w.slack_channel, text, unfurl_links: true }, bot.bot_token);
        if (!j.ok) { await db.from("yt_videos").upsert(row); log(`유튜브 ${w.handle}: 슬랙 게시 실패 ${j.error}`); continue; }
        await db.from("yt_videos").upsert({ ...row, status: "asked", slack_channel: w.slack_channel, slack_ts: j.ts });
        await db.from("agent_messages").upsert({ channel: w.slack_channel, thread_ts: null, ts: j.ts, employee_id: w.employee_id, user_name: w.employee_id, project_id: w.project_id, text }, { onConflict: "channel,ts" });
        log(`유튜브 ${w.handle}: 새 롱폼 → 슬랙에 물음 · ${e.title}`);
      }
      await db.from("yt_watch").update({ last_checked_at: new Date().toISOString() }).eq("id", w.id);
      if (firstRun) log(`유튜브 ${w.handle}(${channel_title}): 기존 영상 ${fresh.length}개 기록(질문 안 함), 다음부터 새 영상만`);
    } catch (e) { log(`유튜브 ${w.handle} 확인 실패: ${e.message}`); }
  }
}

/** 승인/거절 판별 (대표가 질문 스레드에 남긴 답) */
export const YES = /^(네|넵|예|응|어|ㅇㅇ|ㅇㅋ|오케이|오키|ok|okay|좋아|좋지|가자|고|ㄱㄱ|진행|해줘|해주세요|만들어|만들자|만들어줘|콜|ㅇ)/i;
export const NO = /^(아니|아냐|노|no|패스|보류|스킵|하지 ?마|안 ?해|나중에|건너뛰|ㄴ)/i;
