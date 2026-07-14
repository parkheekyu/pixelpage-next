# 픽셀페이지 SEO 마스터플랜 & 키워드 자동화 설계서

> 원본 문서(사용자 제공). 이 파일을 기준으로 STEP 1~5를 순차 구현합니다.

## 요약

SEO는 3층으로 나뉜다.
- **1층 (테크니컬)**: 검색엔진이 사이트를 읽을 수 있게 — sitemap, robots, HTTPS, 속도, JSON-LD 등. 한 번 세팅.
- **2층 (온페이지)**: 각 페이지가 이해되게 — 이미 `prompts/column-writing.md`가 처리.
- **3층 (콘텐츠+오프페이지)**: 좋은 키워드로 좋은 글 꾸준히 — 이 마스터플랜의 파이프라인이 담당.

## STEP 1 — 기반 세팅 (1회)

- [ ] 구글 서치콘솔 + 네이버 서치어드바이저 등록
- [ ] sitemap.xml 자동 생성 (칼럼 발행 시 자동 추가)
- [ ] robots.txt에 sitemap 위치 명시
- [ ] HTTPS·모바일·속도 점검
- [ ] 각 칼럼에 JSON-LD (Article 스키마), canonical, OG 태그 자동 삽입
- [ ] 발행 시 sitemap 재생성 + lastmod 갱신 + 색인 요청(핑)

## STEP 2 — API 키 발급 (완료)

`.env.local`에 저장 (gitignore됨):
- `NAVER_SEARCH_CLIENT_ID` / `NAVER_SEARCH_CLIENT_SECRET` — 문서수(경쟁) 조회
- `NAVER_SA_API_KEY` / `NAVER_SA_SECRET_KEY` — 월간 검색량 조회 (CUSTOMER_ID는 아직 미입력)
- `APIFY_API_TOKEN` — 키워드 발굴

## STEP 3 — 키워드 파이프라인

**흐름**: 시드 → Apify 발굴 → 네이버SA 검색량 검증 → 네이버 검색 문서수 검증 → 점수 계산 → 큐

**점수식 시작점**: `(월간검색수) / (문서수 + 1)`
- 검색량 <100 제외
- 상업형 키워드(대행/비용/추천)에 가중치
- 중복·유사 키워드는 DB로 제외

## STEP 4 — 발행 자동화

`오늘의 키워드 큐 → 칼럼 프롬프트 실행 → 본문+메타+이미지 생성 → 홈페이지 발행 → sitemap 갱신 → 색인 요청 → used 표시`

초기 몇 주는 반자동(사람 승인), 안정 후 완전 자동.

## STEP 5 — 모니터링·개선 (매주)

- 서치콘솔 노출·클릭·순위
- 점수 로직·시드 키워드 조정
- 잘 되는 글은 내부 링크 보강, 안 되는 글은 리라이팅

## 관련 파일

- 칼럼 프롬프트: [`prompts/column-writing.md`](column-writing.md)
- 자동화 스크립트 (예정): `scripts/seo/`
- Notion 파이프라인 (기존): [`src/lib/notion.ts`](../src/lib/notion.ts)
