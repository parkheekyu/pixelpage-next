# SEO 파이프라인

픽셀페이지 하루 3편 칼럼 자동 발행 파이프라인.

## 구성

```
scripts/seo/
├── config.py                # 시드 키워드·필터 파라미터
├── discover.py              # 발굴: Google Suggest → discovered.json
├── naver_sa_client.py       # 네이버 검색광고 API (검색량)
├── naver_search_client.py   # 네이버 검색 API (문서수)
├── verify_and_rank.py       # 검증·점수 → queue.json
├── request_index.py         # Google Indexing API (색인 요청)
├── check_search_console.py  # 서치콘솔 사이트 목록 확인 (초기 인증)
├── .credentials/            # gitignored — client_secret.json, token.json
└── data/                    # gitignored — discovered/verified/queue/used.json
```

## 최초 1회 세팅

```bash
# 1. Python 의존성 설치
pip3 install --user --break-system-packages \
  google-api-python-client google-auth-httplib2 google-auth-oauthlib \
  python-dotenv

# 2. 구글 서치콘솔 OAuth (브라우저로 로그인)
python3 scripts/seo/check_search_console.py
# → token.json 생성, 이후 자동 로그인

# 3. .env.local에 아래 4종 세팅 (env.local.example 참고)
#   NAVER_SEARCH_CLIENT_ID / _SECRET
#   NAVER_SA_CUSTOMER_ID / _API_KEY / _SECRET_KEY
```

## 매일 실행 (cron 예정)

```bash
# 1. 키워드 발굴
python3 scripts/seo/discover.py
# → data/discovered.json (수백 개)

# 2. 검증·랭킹
python3 scripts/seo/verify_and_rank.py
# → data/verified.json (전체)
# → data/queue.json (오늘의 상위 3개)

# 3. 큐에서 꺼내 칼럼 프롬프트에 넣어 발행 (별도 파이프라인)

# 4. 발행 후 색인 요청
python3 scripts/seo/request_index.py https://pixelpage.co.kr/columns/새슬러그
```

## 점수 로직

```
기회 점수 = (월간검색수 + 1) / (문서수 + 100)
- 검색량 크고 문서수 적으면 ↑
- 상업형 키워드(대행/비용/추천 등)는 × 1.5 가중
- 검색량 < 100 제외
- 문서수 > 500,000 제외 (레드오션 컷)
```

## 튜닝 포인트

- `config.py`
  - `SEED_KEYWORDS` — 픽셀페이지 서비스에 맞게 추가·삭제
  - `MIN_MONTHLY_SEARCHES` — 하한
  - `MAX_COMPETITION_DOCS` — 상한
  - `COMMERCIAL_BOOST` — 상업 키워드 가중치
  - `DAILY_QUEUE_SIZE` — 하루 발행 편수

몇 주 돌린 뒤 서치콘솔 노출·클릭 데이터를 보고 조정.
