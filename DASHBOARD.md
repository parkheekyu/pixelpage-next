# 고객사 대시보드 (/app)

픽셀페이지 도메인 아래 `pixelpage.co.kr/app` 으로 제공하는 고객사 리드 대시보드.
`고객사 대시보드/dashboard` 프로토타입(admin.html / client.html)을 Next.js + Supabase 로 옮긴 것.

## 구조

| 경로 | 대상 | 내용 |
|---|---|---|
| `/app/login` | 전체 | 이메일·비밀번호 로그인 |
| `/app` | 전체 | 직원 → `/app/admin`, 고객사 → 자기 첫 프로젝트 시트로 이동 |
| `/app/admin` | 직원 | 전체 고객사 요약 타일 + 고객사별 성과 표 + 새 프로젝트 생성 |
| `/app/admin/users` | 직원 | 회원 추가(즉시 생성 또는 초대 메일), 역할 변경, 프로젝트 배정, 삭제 |
| `/app/projects/[id]` | 직원·배정된 고객사 | 리드 시트. 상태·매출액·결제구분·전환일·드랍사유·메모 인라인 편집. 행 추가(직원·고객사), 행 삭제(직원), 열 숨기기·사용자 정의 열 추가/삭제(직원), 열 너비 드래그, 날짜 범위 |
| `/app/projects/[id]/report` | 직원·배정된 고객사 | 성과 리포트. 직원에게만 소재별 CPL·4단계 전환율·드랍 사유·랜딩·TM 담당자 패널 노출 |
| `/app/research/[id]` | 직원·배정된 고객사 | 리서치: 상품·타깃 입력 → AI '본능분석·반박제거' 문서. 고객사는 리포트만 열람 |
| `/app/ads/[id]` | 직원·배정된 고객사 | 광고: Meta 계정 실시간 현황(직원), 위너·캠페인 구조, AI 분석(카피·소재·구조·개선안) |
| `/app/landing/[id]` | 직원·배정된 고객사 | 랜딩페이지: 페이지 구조·카피 + GA4 + Clarity → AI 개선 리포트 |
| `POST /api/leads/webhook` | Make/n8n | 리드 적재 (Bearer 토큰) |

권한 모델
- `profiles.role = 'staff'` : 모든 프로젝트·회원 관리. 리드의 담당자·소재 컬럼도 봄.
- `profiles.role = 'client'` : `project_members` 에 배정된 프로젝트만. DB 트리거가 상태·매출·메모 외 컬럼 수정을 막는다.
- 모든 테이블에 RLS 적용. 서버 액션은 로그인 사용자 쿠키 기반 클라이언트로 실행되므로 URL 을 알아도 남의 데이터는 조회/수정 불가.

## 1. Supabase 프로젝트 준비

1. https://supabase.com 에서 프로젝트 생성 (리전: Northeast Asia 권장).
2. SQL Editor 에 `supabase/migrations/` 의 SQL 을 번호 순서대로 실행 (0001 → 0005). 테이블은 전용 `dash` 스키마에 만들어진다 (같은 프로젝트의 다른 앱 테이블과 충돌 방지).
   실행 후 Settings → API → **Exposed schemas** 에 `dash` 를 추가한다. 코드의 Supabase 클라이언트는 모두 `db.schema = "dash"` 로 고정되어 있다.
3. Authentication → Providers → Email 에서 **Confirm email 끄기** (직원이 계정을 만들어 주는 방식이라 필요 없음).
4. Settings → API 에서 URL, anon key, service_role key 복사.

## 2. 환경 변수

`.env.local` (`.env.example` 참고):

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...      # 서버 전용
LEAD_WEBHOOK_SECRET=아무-긴-랜덤문자열
NEXT_PUBLIC_SITE_URL=https://pixelpage.co.kr
```

Vercel 에도 같은 4개 + SITE_URL 을 등록한다.

## 3. 첫 직원 계정 + 샘플 데이터

```bash
node scripts/seed-dashboard.mjs --staff-email you@pixelpage.co.kr --staff-password 'your-password'
```

- 직원 계정 생성 + 프로토타입과 같은 샘플 고객사 5개(픽셀페이지·스피치·공간수익·더조은맘·청년경매)의 소재·광고비·리드를 넣는다.
- 샘플 없이 직원 계정만 만들려면 `--no-sample` 추가.
- 이미 있는 슬러그는 건너뛰므로 여러 번 실행해도 안전.

## 4. 실행

```bash
npm run dev
# http://localhost:3000/app/login
```

> 로컬 폴더 경로에 한글(`픽셀페이지`)이 있으면 Turbopack 이 panic 을 낸다.
> `npm run build` 대신 `npx next build --webpack` 으로 빌드하거나 폴더를 영문 경로로 옮길 것. Vercel 에서는 문제 없음.

## 5. 고객사 온보딩 순서

1. `/app/admin` 하단에서 프로젝트 생성 (슬러그 = 웹훅의 `client` 값).
2. `/app/admin/users` 에서 고객사 담당자 이메일 추가, 역할 = 고객사, 배정 프로젝트 선택.
3. 고객사에 `https://pixelpage.co.kr/app/login` 과 계정을 전달.

## 6. 웹훅 연결 (Make / n8n)

기존 `고객사 대시보드/webhook/payload_spec.md` 의 표준 페이로드 그대로:

```bash
curl -X POST https://pixelpage.co.kr/api/leads/webhook \
  -H "Authorization: Bearer $LEAD_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"client":"speech","landing_id":"lp-a","name":"홍길동","phone":"010-1234-5678",
       "utm_source":"meta","utm_medium":"cpc","utm_campaign":"2609_lead_speech","utm_content":"vidA_hook3","utm_term":"retarget_30d"}'
```

- 같은 프로젝트 안에서 연락처(숫자만)가 같으면 `is_duplicate=true`, 상태 `드랍`/사유 `중복`, `original_lead_id` 연결. 버리지 않는다.
- 응답: `{ ok, id, duplicate, original_lead_id }`

## 7. 리서치 · 광고 · 랜딩 분석 (AI)

환경 변수 (Vercel + .env.local):
- AI 실행 방식 두 가지:
  1. `ANTHROPIC_API_KEY` 가 있으면 서버(Vercel)에서 바로 실행 (모델 `claude-opus-5`, 버튼 누르면 1~3분 뒤 완료).
  2. 키가 없으면 **대기열**(`dash.analysis_jobs`)에 쌓이고, 로컬에서 Claude Code 구독으로 처리한다:
     ```bash
     node scripts/analysis-worker.mjs --watch   # 터미널을 켜 둔 동안 15초마다 대기열 처리 (claude -p 사용)
     node scripts/analysis-worker.mjs --once    # 한 번만 처리
     ```
     워커가 꺼져 있으면 화면에 "대기열에 있습니다"로 표시되고, 켜면 자동 처리된다. 건당 3~5분.
- `PERPLEXITY_API_KEY` (선택) — 리서치 실행 시 Perplexity Sonar 로 타깃 목소리(커뮤니티 원문)·경쟁사·키워드를 먼저 긁어 Claude 에 넘긴다. 없으면 Claude 웹 검색만. `PERPLEXITY_MODEL` 기본 sonar-pro.
- `META_ACCESS_TOKEN` — Meta 마케팅 API 토큰 (`ads_read`). 시스템 사용자 토큰(만료 없음) 권장. 광고 계정 ID는 프로젝트별로 광고 화면에서 저장.
- `GA4_SERVICE_ACCOUNT_JSON` — Google 서비스 계정 키 JSON 전체(한 줄). 각 GA4 속성에 그 서비스 계정 이메일을 '뷰어'로 추가. 속성 ID는 랜딩 화면에서 프로젝트별 저장.
- Clarity — 프로젝트별 API 토큰을 랜딩 화면에서 저장 (Clarity → Settings → Data Export). 최근 1~3일 데이터만 제공.

분석 결과는 `dash.analyses` 에 저장되고, 고객사 계정도 자기 프로젝트의 리포트를 볼 수 있다. 실행은 직원만. 페이지 `maxDuration = 300`.

## 8. 광고비 · 소재

- `creatives` : 소재 마스터. `creative_id` = utm_content. 리포트의 소재별 패널은 여기 등록된 소재만 집계한다.
- `ad_spend` : 일별·소재별 광고비. `(project_id, creative_id, date)` 유니크라 업서트로 적재. (Meta/Google API 연동은 다음 단계)

## 현재 연결된 프로젝트 (2026-09-15)

- Supabase 프로젝트 ref `xsauwnhouvphsfsynprb` (parkheekyu's Project, ap-northeast-2). 스키마 실행·이메일 자동확인·`dash` 노출 완료.
- 직원 계정과 초기 비밀번호는 `.env.local` 의 `STAFF_EMAIL` / `STAFF_INITIAL_PASSWORD`. 테스트용 고객사 계정 `client-test@pixelpage.co.kr` (스피치 아카데미 배정) 도 있음. 운영 전 삭제 권장.
- Vercel 프로젝트 `pixelpage-next` 에 환경 변수 5개 등록 완료.

## 파일

- `supabase/migrations/0001~0008` — 스키마·RLS·집계·실시간·분석 테이블 (번호 순서대로 실행)
- `src/lib/integrations/{meta,ga4,clarity,landing}.ts` — 외부 데이터 연동 · `src/lib/ai/{claude,framework}.ts` — AI 분석과 프레임워크 프롬프트 · `src/app/app/analysis-actions.ts` — 설정·실행 액션
- `src/lib/dash/leads-query.ts` — 시트 서버 페이지네이션/필터 · `src/lib/dash/report.ts` — 리포트 서버 집계
- `vercel.json` — 함수 리전 icn1(서울). Supabase 리전과 맞춰야 응답이 빠르다
- `src/proxy.ts` — `/app/*` 세션 갱신 + 미로그인 리다이렉트
- `src/lib/supabase/{server,client,admin}.ts` — Supabase 클라이언트 3종
- `src/lib/dash/{types,agg,data,auth}.ts` — 타입, 집계(프로토타입 shared.js 이식), 로더, 권한 헬퍼
- `src/app/app/actions.ts` — 서버 액션 (로그인, 리드 수정, 프로젝트/회원 관리)
- `src/app/app/(shell)/...` — 사이드바 셸 아래 페이지들
- `src/components/dash/*` — 사이드바, 차트, 시트, 리포트, 관리 화면
- `scripts/seed-dashboard.mjs` — 직원 계정 + 샘플 데이터
