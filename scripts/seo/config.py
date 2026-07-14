"""
SEO 파이프라인 공통 설정.
"""

from pathlib import Path

# ── 사이트 정보 ──
SITE_DOMAIN = "pixelpage.co.kr"
SITE_URL = f"https://{SITE_DOMAIN}"
SITEMAP_URL = f"{SITE_URL}/sitemap.xml"

# ── 시드 키워드 (픽셀페이지 서비스 기반) ──
SEED_KEYWORDS = [
    # 광고/마케팅 전반
    "메타광고", "구글광고", "페이스북광고", "인스타광고",
    # 퍼널·상세페이지
    "상세페이지", "랜딩페이지", "퍼널마케팅",
    # DB/리드 마케팅
    "DB마케팅", "리드마케팅",
    # CRM
    "CRM자동화", "카카오알림톡",
    # 대행/에이전시
    "광고대행사", "마케팅대행",
    # 업종별 (독자 폭 넓히기)
    "병원마케팅", "학원마케팅", "인테리어마케팅",
]

# ── 선별 파라미터 ──
MIN_MONTHLY_SEARCHES = 100      # 월간 검색량 하한
MAX_COMPETITION_DOCS = 500_000  # 문서수 상한 (레드오션 컷)
DAILY_QUEUE_SIZE = 3            # 하루 발행 편수

# 상업형 키워드 가중치 (기회점수 곱셈)
COMMERCIAL_TERMS = ["대행", "비용", "가격", "추천", "업체", "잘하는곳"]
COMMERCIAL_BOOST = 1.5

# ── 경로 ──
BASE_DIR = Path(__file__).parent
CRED_DIR = BASE_DIR / ".credentials"
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

DISCOVERED_FILE = DATA_DIR / "discovered.json"    # 발굴 원본
VERIFIED_FILE = DATA_DIR / "verified.json"        # 검증 결과 (검색량+문서수)
QUEUE_FILE = DATA_DIR / "queue.json"              # 오늘의 큐 (점수 상위)
USED_FILE = DATA_DIR / "used.json"                # 사용된 키워드 (중복 방지)
