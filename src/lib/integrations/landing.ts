import "server-only";

/** 랜딩페이지 HTML 을 가져와 AI 분석용 구조로 정리 (제목, 헤드라인, CTA, 폼, 본문 텍스트) */
export interface LandingExtract {
  url: string; final_url: string; status: number; fetched_at: string;
  title: string; description: string; og_image?: string;
  h1: string[]; h2: string[]; h3: string[];
  ctas: string[]; forms: { fields: string[]; submit?: string }[];
  images: number; images_without_alt: number; videos: number; words: number;
  text: string; // 본문 텍스트 (앞 12,000자)
  has_price: boolean; has_reviews: boolean; has_faq: boolean; has_guarantee: boolean;
}

const strip = (s: string) => s.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<noscript[\s\S]*?<\/noscript>|<svg[\s\S]*?<\/svg>/gi, " ");
const untag = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&#x27;/g, "'").replace(/\s+/g, " ").trim();
const all = (html: string, re: RegExp) => { const out: string[] = []; let m; while ((m = re.exec(html))) { const t = untag(m[1]); if (t && !out.includes(t)) out.push(t); } return out; };

export async function extractLanding(url: string): Promise<LandingExtract> {
  const r = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 (compatible; PixelPageBot/1.0; +https://pixelpage.co.kr)", accept: "text/html" }, redirect: "follow", signal: AbortSignal.timeout(20000) });
  const raw = await r.text();
  const html = strip(raw);
  const meta = (name: string) => { const m = raw.match(new RegExp(`<meta[^>]+(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']`, "i")) ?? raw.match(new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`, "i")); return m ? untag(m[1]) : ""; };
  const text = untag(html.replace(/<(header|nav|footer)[\s\S]*?<\/\1>/gi, " "));
  const ctas = [...all(html, /<button[^>]*>([\s\S]*?)<\/button>/gi), ...all(html, /<a[^>]+(?:class|role)=["'][^"']*(?:btn|button|cta)[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi), ...all(html, /<input[^>]+type=["']submit["'][^>]*value=["']([^"']*)["']/gi)].filter((t) => t.length <= 40).slice(0, 20);
  const forms = [...html.matchAll(/<form[\s\S]*?<\/form>/gi)].map((f) => ({ fields: [...f[0].matchAll(/<(?:input|select|textarea)[^>]*(?:placeholder|name|aria-label)=["']([^"']*)["'][^>]*>/gi)].map((m) => m[1]).filter((v) => !/hidden|csrf|utm_|website/i.test(v)).slice(0, 12), submit: all(f[0], /<button[^>]*type=["']submit["'][^>]*>([\s\S]*?)<\/button>/gi)[0] }));
  const imgs = raw.match(/<img\b[^>]*>/gi) ?? [];
  const lower = text.toLowerCase();
  return {
    url, final_url: r.url, status: r.status, fetched_at: new Date().toISOString(),
    title: untag(raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ""), description: meta("description") || meta("og:description"), og_image: meta("og:image") || undefined,
    h1: all(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).slice(0, 5), h2: all(html, /<h2[^>]*>([\s\S]*?)<\/h2>/gi).slice(0, 30), h3: all(html, /<h3[^>]*>([\s\S]*?)<\/h3>/gi).slice(0, 30),
    ctas, forms, images: imgs.length, images_without_alt: imgs.filter((i) => !/alt=["'][^"']+["']/i.test(i)).length, videos: (raw.match(/<video\b|youtube\.com\/embed|player\.vimeo/gi) ?? []).length,
    words: text.split(/\s+/).length, text: text.slice(0, 12000),
    has_price: /₩|\d{1,3}(,\d{3})+원|만\s?원|가격|비용/.test(text), has_reviews: /후기|리뷰|고객\s?사례|testimonial|★/i.test(text), has_faq: /faq|자주\s?묻는|질문/i.test(lower + text), has_guarantee: /환불|보장|무료\s?체험|계약\s?없이|위험\s?없/i.test(text),
  };
}

export function landingToText(x: LandingExtract): string {
  return [
    `URL: ${x.final_url} (HTTP ${x.status})`, `제목: ${x.title}`, `설명: ${x.description}`,
    `H1: ${x.h1.join(" | ")}`, `H2: ${x.h2.join(" | ")}`, x.h3.length ? `H3: ${x.h3.join(" | ")}` : "",
    `CTA 버튼: ${x.ctas.join(" | ") || "(없음)"}`, `폼: ${x.forms.length ? x.forms.map((f) => `[${f.fields.join(", ")}] → ${f.submit ?? "?"}`).join(" ; ") : "(없음)"}`,
    `이미지 ${x.images}개(alt 없음 ${x.images_without_alt}) · 영상 ${x.videos}개 · 단어 ${x.words}`, `가격 표시 ${x.has_price ? "O" : "X"} · 후기/사례 ${x.has_reviews ? "O" : "X"} · FAQ ${x.has_faq ? "O" : "X"} · 보장/환불 ${x.has_guarantee ? "O" : "X"}`,
    "", "--- 본문 텍스트 ---", x.text,
  ].filter(Boolean).join("\n");
}
