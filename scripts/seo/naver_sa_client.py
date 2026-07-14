"""
네이버 검색광고 API — 키워드 월간 검색량·경쟁정도 조회.

문서: https://naver.github.io/searchad-apidoc/
엔드포인트: GET /keywordstool  (hintKeywords로 최대 5개씩 조회 가능)

응답 필드:
- relKeyword: 관련 키워드
- monthlyPcQcCnt: 월간 PC 검색수
- monthlyMobileQcCnt: 월간 모바일 검색수
- monthlyAvePcClkCnt: PC 클릭수
- monthlyAveMobileClkCnt: 모바일 클릭수
- plAvgDepth: 광고 노출 평균순위
- compIdx: 경쟁정도 ("높음"/"중간"/"낮음")

주의: 검색량이 매우 낮으면 "< 10" 문자열로 옴 → int 변환 시 처리 필요
"""

import base64
import hashlib
import hmac
import json
import os
import time
from urllib.parse import urlencode
from urllib.request import Request, urlopen

BASE_URL = "https://api.searchad.naver.com"


def _get_env(name: str) -> str:
    val = os.environ.get(name, "").strip()
    if not val:
        raise RuntimeError(
            f"{name} 환경변수가 없습니다. .env.local의 {name}을 확인하세요."
        )
    return val


def _signature(timestamp: str, method: str, uri: str, secret: str) -> str:
    msg = f"{timestamp}.{method}.{uri}"
    digest = hmac.new(
        secret.encode("utf-8"), msg.encode("utf-8"), hashlib.sha256
    ).digest()
    return base64.b64encode(digest).decode("utf-8")


def _headers(method: str, uri: str) -> dict[str, str]:
    ts = str(int(time.time() * 1000))
    api_key = _get_env("NAVER_SA_API_KEY")
    secret = _get_env("NAVER_SA_SECRET_KEY")
    customer_id = _get_env("NAVER_SA_CUSTOMER_ID")
    return {
        "Content-Type": "application/json; charset=UTF-8",
        "X-Timestamp": ts,
        "X-API-KEY": api_key,
        "X-Customer": customer_id,
        "X-Signature": _signature(ts, method, uri, secret),
    }


def _parse_qc(v) -> int:
    """monthlyPcQcCnt는 정수 또는 '< 10' 문자열로 옴."""
    if isinstance(v, int):
        return v
    if isinstance(v, str):
        if "<" in v:
            return 5  # '< 10' → 대략 5로 취급
        try:
            return int(v.replace(",", ""))
        except ValueError:
            return 0
    return 0


def get_related_keywords(hint_keywords: list[str]) -> list[dict]:
    """
    hint_keywords로 관련 키워드 조회. 최대 5개까지 넣을 수 있음.
    반환: [{keyword, monthly_searches, competition, ...}, ...]
    """
    if not hint_keywords:
        return []
    if len(hint_keywords) > 5:
        hint_keywords = hint_keywords[:5]

    uri_base = "/keywordstool"
    query = urlencode({
        "hintKeywords": ",".join(hint_keywords),
        "showDetail": "1",
    })
    uri_full = f"{uri_base}?{query}"

    req = Request(
        f"{BASE_URL}{uri_full}",
        headers=_headers("GET", uri_base),
        method="GET",
    )
    try:
        with urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"  ⚠ naver SA API 오류 ({hint_keywords}): {e}")
        return []

    items = data.get("keywordList", [])
    result = []
    for it in items:
        pc = _parse_qc(it.get("monthlyPcQcCnt", 0))
        mo = _parse_qc(it.get("monthlyMobileQcCnt", 0))
        result.append({
            "keyword": it.get("relKeyword", ""),
            "monthly_pc": pc,
            "monthly_mo": mo,
            "monthly_total": pc + mo,
            "competition": it.get("compIdx", ""),
        })
    return result


if __name__ == "__main__":
    # 테스트: 시드 하나 조회
    from dotenv import load_dotenv  # optional
    try:
        load_dotenv(".env.local")
    except ImportError:
        pass

    r = get_related_keywords(["메타광고"])
    for row in r[:20]:
        print(row)
