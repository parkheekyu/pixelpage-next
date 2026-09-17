/**
 * URL slug 유틸. 한글은 국어 로마자 표기법(간이)으로 변환해 ASCII slug 를 만든다.
 * 이유: Vercel(minimal mode)에서 Next.js 가 경로를 x-next-cache-tags 헤더에 넣는데, HTTP 헤더는 ASCII 만 허용해
 *       한글 경로의 온디맨드 렌더링이 ERR_INVALID_CHAR 로 500 이 난다. 경로를 ASCII 로 유지하면 원천 차단.
 */
const CHO = ["g", "kk", "n", "d", "tt", "r", "m", "b", "pp", "s", "ss", "", "j", "jj", "ch", "k", "t", "p", "h"];
const JUNG = ["a", "ae", "ya", "yae", "eo", "e", "yeo", "ye", "o", "wa", "wae", "oe", "yo", "u", "wo", "we", "wi", "yu", "eu", "ui", "i"];
const JONG = ["", "k", "k", "k", "n", "n", "n", "t", "l", "k", "m", "l", "l", "l", "p", "l", "m", "p", "p", "t", "t", "ng", "t", "t", "k", "t", "p", "t"];

export function romanizeKorean(input: string): string {
  let out = "";
  for (const ch of input) {
    const code = ch.charCodeAt(0);
    if (code >= 0xac00 && code <= 0xd7a3) {
      const i = code - 0xac00;
      out += CHO[Math.floor(i / 588)] + JUNG[Math.floor((i % 588) / 28)] + JONG[i % 28];
    } else out += ch;
  }
  return out;
}

export const isAscii = (s: string) => /^[\x00-\x7F]*$/.test(s);

/** 임의 문자열 → ASCII slug (소문자, 영숫자와 하이픈만). 이미 ASCII 면 정리만 한다. */
export function toAsciiSlug(raw: string): string {
  let s = raw.trim();
  try { s = decodeURIComponent(s); } catch {}
  s = romanizeKorean(s.normalize("NFC")).normalize("NFKD").replace(/[̀-ͯ]/g, "");
  s = s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").replace(/-{2,}/g, "-");
  return s.slice(0, 180);
}
