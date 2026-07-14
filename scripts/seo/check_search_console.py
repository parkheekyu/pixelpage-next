"""
구글 서치콘솔 인증 & 등록 사이트 확인.

최초 1회: 브라우저가 열리며 구글 로그인 → 동의 → token.json 생성
이후: token.json으로 자동 로그인

실행: python3 scripts/seo/check_search_console.py
"""

import os
import sys
from pathlib import Path

try:
    from google.oauth2.credentials import Credentials
    from google_auth_oauthlib.flow import InstalledAppFlow
    from google.auth.transport.requests import Request
    from googleapiclient.discovery import build
except ImportError:
    print("의존성이 없습니다. 설치:")
    print("  pip3 install --user --break-system-packages google-api-python-client google-auth-httplib2 google-auth-oauthlib")
    sys.exit(1)

BASE = Path(__file__).parent / ".credentials"
CLIENT_SECRET = BASE / "client_secret.json"
TOKEN = BASE / "token.json"

# webmasters: 사이트 목록·검색 성과 조회
# indexing: 새 URL 색인 요청 (칼럼 발행 후 핑용)
SCOPES = [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/indexing",
]


def get_credentials():
    creds = None
    if TOKEN.exists():
        creds = Credentials.from_authorized_user_file(str(TOKEN), SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(str(CLIENT_SECRET), SCOPES)
            creds = flow.run_local_server(port=0)  # 브라우저 열림
        TOKEN.write_text(creds.to_json())
        print(f"토큰 저장 완료: {TOKEN}")
    return creds


def main():
    if not CLIENT_SECRET.exists():
        print(f"client_secret.json이 없습니다: {CLIENT_SECRET}")
        sys.exit(1)

    creds = get_credentials()
    service = build("searchconsole", "v1", credentials=creds)

    print("\n── 등록된 사이트 목록 ──")
    resp = service.sites().list().execute()
    sites = resp.get("siteEntry", [])
    if not sites:
        print("(등록된 사이트가 없습니다)")
        print("서치콘솔에서 pixelpage.co.kr을 먼저 등록하세요.")
        return

    for s in sites:
        print(f"  {s['siteUrl']:50s}  [{s['permissionLevel']}]")

    target = "pixelpage.co.kr"
    matched = [s for s in sites if target in s["siteUrl"]]
    if matched:
        print(f"\n{target} 확인됨: {[m['siteUrl'] for m in matched]}")
    else:
        print(f"\n{target}가 목록에 없습니다. 서치콘솔에 등록해 주세요.")


if __name__ == "__main__":
    main()
