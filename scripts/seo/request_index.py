"""
새 URL을 구글 색인 요청 (Indexing API).

칼럼 발행 직후 호출: python3 scripts/seo/request_index.py https://pixelpage.co.kr/columns/new-slug
여러 URL: python3 scripts/seo/request_index.py url1 url2 url3

주의: Indexing API는 원래 JobPosting/BroadcastEvent 대상이지만
     일반 웹페이지도 요청 가능하며 크롤링 우선순위가 올라간다.

또한 sitemap.xml을 서치콘솔에 제출한 상태라면 자연 색인도 잘 됨.
이 스크립트는 '즉시 크롤링 요청'용.
"""

import json
import sys
from pathlib import Path

from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request as GRequest
from googleapiclient.discovery import build

BASE = Path(__file__).parent / ".credentials"
TOKEN = BASE / "token.json"

SCOPES = [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/indexing",
]


def get_service():
    if not TOKEN.exists():
        print("token.json이 없습니다. check_search_console.py를 먼저 실행하세요.")
        sys.exit(1)
    creds = Credentials.from_authorized_user_file(str(TOKEN), SCOPES)
    if creds.expired and creds.refresh_token:
        creds.refresh(GRequest())
        TOKEN.write_text(creds.to_json())
    return build("indexing", "v3", credentials=creds)


def request_url(service, url: str, action: str = "URL_UPDATED"):
    body = {"url": url, "type": action}
    try:
        resp = service.urlNotifications().publish(body=body).execute()
        print(f"  ✓ {url}")
        print(f"    → {json.dumps(resp, ensure_ascii=False)}")
    except Exception as e:
        print(f"  ✗ {url}\n    → {e}")


def main():
    urls = sys.argv[1:]
    if not urls:
        print("사용: python3 request_index.py <URL> [URL ...]")
        sys.exit(1)

    service = get_service()
    print(f"── 색인 요청 {len(urls)}개 ──")
    for url in urls:
        request_url(service, url)


if __name__ == "__main__":
    main()
