"""
키워드 발굴 — Google Suggest API로 자동완성·관련어 확장.

사용 이유: Apify 대신 Google Suggest 직접 호출.
- 무료, API 키 불필요
- Apify와 동일하게 Google 자동완성 결과를 반환
- 시드마다 알파벳/자모 확장으로 수백 개 롱테일 발굴

실행: python3 scripts/seo/discover.py
결과: data/discovered.json
"""

import json
import string
import sys
import time
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent))
from config import SEED_KEYWORDS, DISCOVERED_FILE

# 확장 접미어 (한글 자음 + 조사·의문어)
KOREAN_SUFFIXES = [
    "", " ", "가", "나", "다", "라", "마", "바", "사", "아",
    " 방법", " 이유", " 뜻", " 사례", " 후기", " 비용",
    " 잘", " 어떻게", " 팁", " 실패",
]


def fetch_suggestions(query: str) -> list[str]:
    """Google Suggest API 호출. 한국어(hl=ko), 한국 지역(gl=kr)."""
    params = urlencode({
        "client": "chrome",
        "q": query,
        "hl": "ko",
        "gl": "kr",
    })
    url = f"https://suggestqueries.google.com/complete/search?{params}"
    req = Request(url, headers={"User-Agent": "Mozilla/5.0 pixelpage-seo/1.0"})

    try:
        with urlopen(req, timeout=8) as resp:
            data = json.loads(resp.read().decode("utf-8", errors="ignore"))
    except Exception as e:
        print(f"  ⚠ {query}: {e}")
        return []

    # Chrome client returns: [query, [suggestions], ...]
    if not isinstance(data, list) or len(data) < 2:
        return []
    return [s for s in data[1] if isinstance(s, str)]


def expand_seed(seed: str) -> set[str]:
    """시드 하나를 자동완성 접미어로 확장."""
    found: set[str] = set()
    for sfx in KOREAN_SUFFIXES:
        q = f"{seed}{sfx}"
        for sug in fetch_suggestions(q):
            sug = sug.strip()
            if not sug or len(sug) > 40:
                continue
            found.add(sug)
        time.sleep(0.15)  # Google 부담 완화
    return found


def main():
    all_keywords: set[str] = set()
    print(f"── 시드 {len(SEED_KEYWORDS)}개 확장 시작 ──\n")
    for seed in SEED_KEYWORDS:
        found = expand_seed(seed)
        print(f"  {seed:20s} → {len(found)}개")
        all_keywords.update(found)

    # 시드 자체도 포함
    all_keywords.update(SEED_KEYWORDS)

    result = sorted(all_keywords)
    DISCOVERED_FILE.write_text(
        json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\n총 {len(result)}개 → {DISCOVERED_FILE}")


if __name__ == "__main__":
    main()
