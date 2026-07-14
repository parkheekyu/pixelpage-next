"""
네이버 검색 API — 특정 키워드로 이미 발행된 문서수(경쟁도) 조회.

문서: https://developers.naver.com/docs/serviceapi/search/
엔드포인트: GET https://openapi.naver.com/v1/search/webkr.json?query=...

응답: { total, start, display, items: [...] }
- total = 해당 키워드로 네이버가 색인한 웹문서 수 (경쟁 강도 지표)
"""

import json
import os
from urllib.parse import urlencode
from urllib.request import Request, urlopen


def _get_env(name: str) -> str:
    val = os.environ.get(name, "").strip()
    if not val:
        raise RuntimeError(f"{name} 환경변수가 없습니다.")
    return val


def get_doc_count(keyword: str, source: str = "webkr") -> int:
    """
    source: 'webkr' (웹문서), 'blog' (블로그) 중 택
    """
    client_id = _get_env("NAVER_SEARCH_CLIENT_ID")
    client_secret = _get_env("NAVER_SEARCH_CLIENT_SECRET")

    url = f"https://openapi.naver.com/v1/search/{source}.json?" + urlencode({
        "query": keyword,
        "display": 1,
    })
    req = Request(url, headers={
        "X-Naver-Client-Id": client_id,
        "X-Naver-Client-Secret": client_secret,
    })
    try:
        with urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except Exception as e:
        print(f"  ⚠ naver 검색 API 오류 ({keyword}): {e}")
        return -1
    return int(data.get("total", 0))


if __name__ == "__main__":
    try:
        from dotenv import load_dotenv
        load_dotenv(".env.local")
    except ImportError:
        pass

    for k in ["메타광고", "상세페이지", "DB마케팅"]:
        n = get_doc_count(k)
        print(f"  {k:20s} → 웹문서 {n:,}건")
