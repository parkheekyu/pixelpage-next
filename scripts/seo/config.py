"""
SEO 파이프라인 공통 설정.
"""

from pathlib import Path

# ── 사이트 정보 ──
SITE_DOMAIN = "pixelpage.co.kr"
SITE_URL = f"https://{SITE_DOMAIN}"
SITEMAP_URL = f"{SITE_URL}/sitemap.xml"

# ── 시드 키워드 (모객 목적 — 상업 의도 강한 것만) ──
# 참고: 네이버 SA API 힌트는 공백 없이 붙여 씀
SEED_KEYWORDS = [
    # 대행·제작 (핵심 상업 시드)
    "메타광고대행", "메타광고대행사", "DB마케팅대행", "DB광고대행",
    "상세페이지제작", "랜딩페이지제작",
    "광고대행사추천", "마케팅대행사", "종합광고대행사",
    # 업종별 대행
    "학원마케팅대행", "병원마케팅대행", "인테리어광고대행",
    "부동산광고대행", "법률광고대행",
    # 홈페이지·웹 빌드
    "홈페이지제작업체", "기업홈페이지제작",
    # 광고 비용·견적 (상업 의도)
    "인스타광고비용", "메타광고비용", "네이버광고비용",
]

# ── 선별 파라미터 ──
MIN_MONTHLY_SEARCHES = 80       # 월간 검색량 하한
MAX_COMPETITION_DOCS = 5_000_000  # 문서수 상한 (레드오션 컷) — 상업 키워드는 문서 많아도 OK
DAILY_QUEUE_SIZE = 3            # 하루 발행 편수
REQUIRE_COMMERCIAL = True       # 상업 마커 없는 키워드는 큐에서 제외

# 상업형 마커 (필수: 이 중 하나 포함해야 큐 진입)
COMMERCIAL_TERMS = [
    "대행", "제작", "견적", "비용", "가격", "추천",
    "업체", "회사", "맡기", "외주", "잘하는", "순위",
]
COMMERCIAL_BOOST = 1.8  # 강화

# 필드 마커 (픽셀페이지 서비스 범위)
FIELD_TERMS = [
    "광고", "마케팅", "랜딩", "상세페이지", "홈페이지",
    "DB", "리드", "CRM", "숏폼", "영상", "메타", "구글",
    "네이버", "인스타", "브랜드", "퍼포먼스",
]

# ── 경로 ──
BASE_DIR = Path(__file__).parent
CRED_DIR = BASE_DIR / ".credentials"
DATA_DIR = BASE_DIR / "data"
DATA_DIR.mkdir(exist_ok=True)

DISCOVERED_FILE = DATA_DIR / "discovered.json"    # 발굴 원본
VERIFIED_FILE = DATA_DIR / "verified.json"        # 검증 결과 (검색량+문서수)
QUEUE_FILE = DATA_DIR / "queue.json"              # 오늘의 큐 (점수 상위)
USED_FILE = DATA_DIR / "used.json"                # 사용된 키워드 (중복 방지)
