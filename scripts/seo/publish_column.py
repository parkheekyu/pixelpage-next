"""
칼럼을 Notion DB에 발행.

사용: python3 scripts/seo/publish_column.py <파이썬모듈:칼럼정의>
예:   python3 scripts/seo/publish_column.py columns.google_analytics_first

또는 이 스크립트 내부에서 직접 임포트해 publish() 호출.

Notion 스키마:
- 이름 (title)
- Status (status) — "Published"
- Date (date)
- Slug (rich_text)
- Category (multi_select) — ["칼럼"]
- Description (rich_text)
"""

import json
import os
import sys
from datetime import date
from pathlib import Path
from urllib.request import Request, urlopen

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent.parent.parent / ".env.local")
except ImportError:
    pass

NOTION_API = "https://api.notion.com/v1"
API_KEY = os.environ.get("NOTION_API_KEY", "")
DB_ID = os.environ.get("NOTION_DATABASE_ID", "")


def _headers():
    return {
        "Authorization": f"Bearer {API_KEY}",
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
    }


# ── Notion 블록 헬퍼 ──
def h2(text: str) -> dict:
    return {"type": "heading_2", "heading_2": {"rich_text": _rt(text)}}


def h3(text: str) -> dict:
    return {"type": "heading_3", "heading_3": {"rich_text": _rt(text)}}


def p(text: str) -> dict:
    return {"type": "paragraph", "paragraph": {"rich_text": _rt(text)}}


def quote(text: str) -> dict:
    return {"type": "quote", "quote": {"rich_text": _rt(text)}}


def bul(text: str) -> dict:
    return {"type": "bulleted_list_item", "bulleted_list_item": {"rich_text": _rt(text)}}


def num(text: str) -> dict:
    return {"type": "numbered_list_item", "numbered_list_item": {"rich_text": _rt(text)}}


def divider() -> dict:
    return {"type": "divider", "divider": {}}


def img(url: str, caption: str = "") -> dict:
    """외부 URL 이미지 블록."""
    block = {
        "type": "image",
        "image": {
            "type": "external",
            "external": {"url": url},
        },
    }
    if caption:
        block["image"]["caption"] = _rt(caption)
    return block


def _rt(text: str) -> list[dict]:
    """rich_text with optional inline bold via <b>...</b> markers."""
    # 아주 단순한 <b> 볼드 파서
    parts: list[dict] = []
    remaining = text
    while remaining:
        i = remaining.find("<b>")
        if i < 0:
            parts.append({"type": "text", "text": {"content": remaining}})
            break
        if i > 0:
            parts.append({"type": "text", "text": {"content": remaining[:i]}})
        j = remaining.find("</b>", i)
        if j < 0:
            parts.append({"type": "text", "text": {"content": remaining[i:]}})
            break
        bold_text = remaining[i + 3 : j]
        parts.append({
            "type": "text",
            "text": {"content": bold_text},
            "annotations": {"bold": True},
        })
        remaining = remaining[j + 4 :]
    return parts


def archive_by_slug(slug: str) -> int:
    """해당 slug의 페이지를 archived=true 로 만듦. 개수 반환."""
    if not API_KEY or not DB_ID:
        raise RuntimeError("NOTION_API_KEY 또는 NOTION_DATABASE_ID 환경변수 없음")
    q = Request(
        f"{NOTION_API}/databases/{DB_ID}/query",
        data=json.dumps({
            "filter": {"property": "Slug", "rich_text": {"equals": slug}},
        }).encode(),
        headers=_headers(),
        method="POST",
    )
    with urlopen(q) as r:
        pages = json.loads(r.read()).get("results", [])
    count = 0
    for pg in pages:
        req = Request(
            f"{NOTION_API}/pages/{pg['id']}",
            data=json.dumps({"archived": True}).encode(),
            headers=_headers(),
            method="PATCH",
        )
        with urlopen(req) as _:
            count += 1
    return count


def publish(
    *,
    title: str,
    slug: str,
    description: str,
    blocks: list[dict],
    category: str = "칼럼",
    pub_date: str | None = None,
    status: str = "Published",
    cover_url: str | None = None,
    replace_existing: bool = True,
) -> dict:
    if not API_KEY or not DB_ID:
        raise RuntimeError("NOTION_API_KEY 또는 NOTION_DATABASE_ID 환경변수 없음")

    pub_date = pub_date or date.today().isoformat()

    if replace_existing:
        archived = archive_by_slug(slug)
        if archived:
            print(f"기존 슬러그 '{slug}' 페이지 {archived}개 archive 완료")

    body: dict = {
        "parent": {"database_id": DB_ID},
        "properties": {
            "이름": {"title": _rt(title)},
            "Slug": {"rich_text": _rt(slug)},
            "Description": {"rich_text": _rt(description)},
            "Category": {"multi_select": [{"name": category}]},
            "Date": {"date": {"start": pub_date}},
            "Status": {"status": {"name": status}},
        },
        "children": blocks[:100],  # Notion 초기 100 블록 제한
    }
    if cover_url:
        body["cover"] = {"type": "external", "external": {"url": cover_url}}

    req = Request(
        f"{NOTION_API}/pages",
        data=json.dumps(body).encode("utf-8"),
        headers=_headers(),
        method="POST",
    )
    with urlopen(req) as r:
        result = json.loads(r.read())

    # 100 초과분은 추가 append
    if len(blocks) > 100:
        page_id = result["id"]
        rest = blocks[100:]
        for chunk_start in range(0, len(rest), 100):
            chunk = rest[chunk_start : chunk_start + 100]
            append_req = Request(
                f"{NOTION_API}/blocks/{page_id}/children",
                data=json.dumps({"children": chunk}).encode("utf-8"),
                headers=_headers(),
                method="PATCH",
            )
            with urlopen(append_req) as _:
                pass

    return result


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("사용: python3 publish_column.py <module:variable>")
        sys.exit(1)
    module_var = sys.argv[1]
    module, var = module_var.rsplit(":", 1)
    __import__(module)
    column = getattr(sys.modules[module], var)
    result = publish(**column)
    print(f"발행 완료:")
    print(f"  URL: {result['url']}")
    print(f"  Slug: {result['properties']['Slug']['rich_text'][0]['plain_text']}")
    print(f"  사이트 URL: https://pixelpage.co.kr/columns/{result['properties']['Slug']['rich_text'][0]['plain_text']}")
