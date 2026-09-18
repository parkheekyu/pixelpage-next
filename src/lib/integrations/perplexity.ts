import "server-only";

/**
 * Perplexity Sonar API — 커뮤니티·블로그·뉴스까지 넓게 긁어 출처를 붙여 주는 사전 심층 조사.
 * PERPLEXITY_API_KEY 가 없으면 건너뛴다(Claude 자체 웹 검색만 사용). 모델은 PERPLEXITY_MODEL (기본 sonar-pro; sonar-deep-research 는 수 분 소요).
 */
export interface SonarResult { text: string; citations: string[] }

export const hasPerplexity = () => !!process.env.PERPLEXITY_API_KEY;

export async function sonar(query: string, opts?: { system?: string; model?: string; recency?: "day" | "week" | "month" | "year" }): Promise<SonarResult> {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) throw new Error("PERPLEXITY_API_KEY 미설정");
  const model = opts?.model ?? process.env.PERPLEXITY_MODEL ?? "sonar-pro";
  const r = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST", headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: opts?.system ?? "You are a meticulous Korean market researcher. Answer in Korean. Quote real phrases from communities verbatim when available. Always cite sources." }, { role: "user", content: query }],
      ...(opts?.recency ? { search_recency_filter: opts.recency } : {}),
      max_tokens: 4000,
    }),
    signal: AbortSignal.timeout(model.includes("deep") ? 280000 : 120000),
  });
  const j = (await r.json()) as { choices?: { message?: { content?: string } }[]; citations?: string[]; search_results?: { url: string }[]; error?: { message?: string } };
  if (!r.ok || j.error) throw new Error(`Perplexity: ${j.error?.message ?? r.status}`);
  return { text: j.choices?.[0]?.message?.content ?? "", citations: j.citations ?? j.search_results?.map((s) => s.url) ?? [] };
}

export interface PreResearchInput { name: string; product: string; target: string; competitors?: string; landing_url?: string | null }

/** 3갈래 사전 조사(타깃 목소리 / 경쟁사·시장 / 키워드·광고 레퍼런스)를 병렬로 돌려 마크다운으로 합친다 */
export async function preResearch(i: PreResearchInput): Promise<string> {
  const base = `고객사: ${i.name}\n상품/서비스: ${i.product}\n타깃 고객: ${i.target}${i.competitors ? `\n알려진 경쟁사/대안: ${i.competitors}` : ""}`;
  const qs: [string, string][] = [
    ["타깃 목소리", `${base}\n\n이 타깃이 실제로 모이는 한국 커뮤니티(네이버 카페·지식iN·블로그, 유튜브 댓글, 인스타·스레드, 디시·에펨·클리앙·블라인드 등)와 후기·Q&A를 최대한 찾아서 정리해 줘.\n1) 이들이 겪는 페인포인트와 원하는 결과(니즈)를 빈도 순으로.\n2) 이들이 실제로 쓰는 표현·단어·검색어를 원문 그대로 인용(최소 15개, 출처 표시).\n3) 이 상품군을 살 때 걱정·의심·거절 이유로 나오는 말들(원문 인용).\n4) 이미 시도해 본 대안과 그에 대한 불만.`],
    ["경쟁사·시장", `${base}\n\n한국 시장에서 이 타깃에게 같은 문제를 푸는 경쟁사·대안을 상위 5~8곳 찾아서(알려진 경쟁사 포함) 각각: 가격/오퍼(무료·보장·체험), 메인 헤드라인과 CTA 카피(원문), 내세우는 증거(후기·수치·자격·미디어), 광고 포맷과 채널, 최근 6개월 변화(신규 진입·가격·메시지 변경·이슈). 그리고 시장 전체의 최근 변화(규제, 트렌드, 뉴스)를 정리해 줘. 출처를 항목마다 표시.`],
    ["키워드·광고", `${base}\n\n1) 이 타깃이 정보 탐색→비교→구매 단계에서 쓰는 검색 키워드를 단계별로 20개 이상 (네이버·유튜브·구글 기준, 가능하면 검색량·경쟁 정도 언급).\n2) 지금 이 시장에서 돌고 있는 광고·콘텐츠의 메시지 패턴(문제제기형/비교형/후기형/권위형 등)과 실제 카피 예시(원문 인용).\n3) 잘 되는 것으로 보이는 콘텐츠(조회수·댓글 반응 근거)와 그 이유. 출처 표시.`],
  ];
  const results = await Promise.allSettled(qs.map(([, q]) => sonar(q, { recency: "year" })));
  const parts = results.map((r, k) => {
    const [label] = qs[k];
    if (r.status === "rejected") return `### ${label}\n(조사 실패: ${(r.reason as Error).message})`;
    const cites = r.value.citations.length ? `\n\n출처:\n${r.value.citations.map((c, n) => `[${n + 1}] ${c}`).join("\n")}` : "";
    return `### ${label}\n${r.value.text}${cites}`;
  });
  return parts.join("\n\n");
}
