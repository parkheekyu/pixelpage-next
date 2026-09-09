import { Client } from "@notionhq/client";

const notionApiKey = process.env.NOTION_API_KEY;
const databaseId = process.env.NOTION_DATABASE_ID;

const notion = notionApiKey ? new Client({ auth: notionApiKey }) : null;

/* ─────────────────────── Rich text ─────────────────────── */

type RichTextItem = {
  type: "text";
  text: { content: string };
  annotations?: { bold?: boolean };
};

/** `<b>...</b>` 인라인 볼드 파서 */
export function toRichText(text: string): RichTextItem[] {
  const out: RichTextItem[] = [];
  let rest = text;
  while (rest) {
    const i = rest.indexOf("<b>");
    if (i < 0) {
      out.push({ type: "text", text: { content: rest } });
      break;
    }
    if (i > 0) out.push({ type: "text", text: { content: rest.slice(0, i) } });
    const j = rest.indexOf("</b>", i);
    if (j < 0) {
      out.push({ type: "text", text: { content: rest.slice(i) } });
      break;
    }
    out.push({
      type: "text",
      text: { content: rest.slice(i + 3, j) },
      annotations: { bold: true },
    });
    rest = rest.slice(j + 4);
  }
  return out;
}

/* ─────────────────────── Compact block spec ─────────────────────── */

/**
 * 요청 본문에 넣는 축약형 블록:
 *  ["h2", "제목"]
 *  ["h3", "소제목"]
 *  ["p",  "본문 <b>강조</b> ..."]
 *  ["quote", "인용문"]
 *  ["bul", "리스트 항목"]
 *  ["num", "번호 항목"]
 *  ["img", "https://url.png", "선택 캡션"]
 *  ["divider"]
 */
export type CompactBlock =
  | ["h2", string]
  | ["h3", string]
  | ["p", string]
  | ["quote", string]
  | ["bul", string]
  | ["num", string]
  | ["img", string, string?]
  | ["divider"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toNotionBlock(b: CompactBlock): any {
  switch (b[0]) {
    case "h2":
      return { type: "heading_2", heading_2: { rich_text: toRichText(b[1]) } };
    case "h3":
      return { type: "heading_3", heading_3: { rich_text: toRichText(b[1]) } };
    case "p":
      return { type: "paragraph", paragraph: { rich_text: toRichText(b[1]) } };
    case "quote":
      return { type: "quote", quote: { rich_text: toRichText(b[1]) } };
    case "bul":
      return {
        type: "bulleted_list_item",
        bulleted_list_item: { rich_text: toRichText(b[1]) },
      };
    case "num":
      return {
        type: "numbered_list_item",
        numbered_list_item: { rich_text: toRichText(b[1]) },
      };
    case "img": {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const image: any = { type: "external", external: { url: b[1] } };
      if (b[2]) image.caption = toRichText(b[2]);
      return { type: "image", image };
    }
    case "divider":
      return { type: "divider", divider: {} };
  }
}

/* ─────────────────────── Publish ─────────────────────── */

export type PublishInput = {
  title: string;
  slug: string;
  description: string;
  blocks: CompactBlock[];
  category?: string;
  status?: "Draft" | "진행 중" | "Published";
  date?: string;
  cover_url?: string;
  replace_existing?: boolean;
};

export type PublishResult = {
  id: string;
  url: string;
  slug: string;
  site_url: string;
  archived_previous: number;
};

/** 같은 slug 페이지 아카이브. 개수 반환. */
async function archiveExistingBySlug(slug: string): Promise<number> {
  if (!notion || !databaseId) return 0;
  const resp = await notion.databases.query({
    database_id: databaseId,
    filter: { property: "Slug", rich_text: { equals: slug } },
  });
  let n = 0;
  for (const pg of resp.results) {
    await notion.pages.update({ page_id: pg.id, archived: true });
    n++;
  }
  return n;
}

export async function publishColumn(input: PublishInput): Promise<PublishResult> {
  if (!notion || !databaseId) {
    throw new Error("NOTION_API_KEY 또는 NOTION_DATABASE_ID 미설정");
  }

  const {
    title,
    slug,
    description,
    blocks,
    category = "칼럼",
    status = "Published",
    date,
    cover_url,
    replace_existing = true,
  } = input;

  let archived = 0;
  if (replace_existing) archived = await archiveExistingBySlug(slug);

  const pubDate = date ?? new Date().toISOString().slice(0, 10);
  const notionBlocks = blocks.map(toNotionBlock);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const properties: any = {
    이름: { title: toRichText(title) },
    Slug: { rich_text: toRichText(slug) },
    Description: { rich_text: toRichText(description) },
    Category: { multi_select: [{ name: category }] },
    Date: { date: { start: pubDate } },
    Status: { status: { name: status } },
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: any = {
    parent: { database_id: databaseId },
    properties,
    children: notionBlocks.slice(0, 100),
  };
  if (cover_url) payload.cover = { type: "external", external: { url: cover_url } };

  const page = await notion.pages.create(payload);

  // 100 초과분 append
  if (notionBlocks.length > 100) {
    for (let i = 100; i < notionBlocks.length; i += 100) {
      await notion.blocks.children.append({
        block_id: page.id,
        children: notionBlocks.slice(i, i + 100),
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const url = (page as any).url as string;

  return {
    id: page.id,
    url,
    slug,
    site_url: `https://pixelpage.co.kr/columns/${slug}`,
    archived_previous: archived,
  };
}
