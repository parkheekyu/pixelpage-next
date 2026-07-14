"""
발굴된 키워드 검증 & 점수 랭킹.

흐름:
1. discovered.json 로드
2. 네이버 SA API로 월간 검색량 조회 (5개씩 배치)
3. 네이버 검색 API로 문서수 조회
4. 점수 계산: (월간검색수 + 1) / (문서수 + 100)  * 상업형 가중치
5. used.json에 있는 키워드 제외
6. 상위 N개를 queue.json에 저장

실행: python3 scripts/seo/verify_and_rank.py
"""

import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent.parent.parent / ".env.local")
except ImportError:
    pass

from config import (
    DISCOVERED_FILE, VERIFIED_FILE, QUEUE_FILE, USED_FILE,
    MIN_MONTHLY_SEARCHES, MAX_COMPETITION_DOCS,
    COMMERCIAL_TERMS, COMMERCIAL_BOOST, DAILY_QUEUE_SIZE,
)
from naver_sa_client import get_related_keywords
from naver_search_client import get_doc_count


def load_used() -> set[str]:
    if USED_FILE.exists():
        return set(json.loads(USED_FILE.read_text(encoding="utf-8")))
    return set()


def batch(lst: list, size: int):
    for i in range(0, len(lst), size):
        yield lst[i : i + size]


def score(monthly: int, doc_count: int, keyword: str) -> float:
    """
    기회 점수 = (검색량 + 1) / (문서수 + 100) * 상업형 가중치
    - 검색량 크면 ↑, 문서수 크면 ↓
    - +100은 문서수가 0일 때 튀는 걸 완화
    """
    base = (monthly + 1) / (doc_count + 100)
    if any(term in keyword for term in COMMERCIAL_TERMS):
        base *= COMMERCIAL_BOOST
    return round(base, 4)


def main():
    if not DISCOVERED_FILE.exists():
        print("먼저 discover.py를 실행해 discovered.json을 만드세요.")
        sys.exit(1)

    used = load_used()
    discovered = json.loads(DISCOVERED_FILE.read_text(encoding="utf-8"))
    print(f"발굴 {len(discovered)}개 / 이미 사용 {len(used)}개")

    # 1. 검색량 조회 (5개씩 배치)
    verified: dict[str, dict] = {}
    print("\n── 검색량 조회 (네이버 SA API) ──")
    for i, chunk in enumerate(batch(discovered, 5)):
        rows = get_related_keywords(chunk)
        # rows에는 관련어까지 포함돼 오므로 원래 후보만 뽑아쓰거나 전체 활용
        for r in rows:
            kw = r["keyword"]
            if not kw or kw in verified:
                continue
            verified[kw] = {
                "keyword": kw,
                "monthly": r["monthly_total"],
                "competition": r["competition"],
            }
        if (i + 1) % 10 == 0:
            print(f"  진행 {i * 5}/{len(discovered)} · 누적 {len(verified)}개")
        time.sleep(0.3)  # API 부담

    # 2. 검색량 필터
    filtered = {
        kw: v for kw, v in verified.items()
        if v["monthly"] >= MIN_MONTHLY_SEARCHES and kw not in used
    }
    print(f"\n검색량 필터 후: {len(filtered)}개 (하한 {MIN_MONTHLY_SEARCHES})")

    # 3. 문서수 조회
    print("\n── 문서수 조회 (네이버 검색 API) ──")
    for i, (kw, v) in enumerate(list(filtered.items())):
        doc_count = get_doc_count(kw)
        v["doc_count"] = doc_count
        v["score"] = score(v["monthly"], doc_count, kw)
        if (i + 1) % 30 == 0:
            print(f"  진행 {i + 1}/{len(filtered)}")
        time.sleep(0.1)

    # 4. 경쟁 필터 + 점수 랭킹
    ranked = sorted(
        [v for v in filtered.values() if 0 <= v["doc_count"] <= MAX_COMPETITION_DOCS],
        key=lambda x: x["score"],
        reverse=True,
    )

    VERIFIED_FILE.write_text(
        json.dumps(ranked, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\n검증 완료 → {VERIFIED_FILE} ({len(ranked)}개)")

    # 5. 오늘의 큐 (상위 N)
    today_queue = ranked[:DAILY_QUEUE_SIZE]
    QUEUE_FILE.write_text(
        json.dumps(today_queue, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print(f"\n── 오늘의 큐 (상위 {DAILY_QUEUE_SIZE}) → {QUEUE_FILE} ──")
    for i, kw in enumerate(today_queue, 1):
        print(f"  {i}. {kw['keyword']:25s} "
              f"검색량 {kw['monthly']:>6,} · 문서 {kw['doc_count']:>10,} · 점수 {kw['score']}")


if __name__ == "__main__":
    main()
