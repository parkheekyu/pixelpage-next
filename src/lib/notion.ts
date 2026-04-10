import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";

const notionApiKey = process.env.NOTION_API_KEY;
const databaseId = process.env.NOTION_DATABASE_ID;

const notion = notionApiKey
  ? new Client({ auth: notionApiKey })
  : null;

const n2m = notion ? new NotionToMarkdown({ notionClient: notion }) : null;

export interface Article {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: string;
  date: string;
  coverImage: string | null;
}

function extractPlainText(richText: { plain_text: string }[]): string {
  return richText.map((t) => t.plain_text).join("");
}

function extractCover(property: { type: string; files?: { file?: { url: string }; external?: { url: string }; name: string }[]; url?: string }): string | null {
  if (property.type === "files" && property.files && property.files.length > 0) {
    const file = property.files[0];
    return file.file?.url || file.external?.url || null;
  }
  if (property.type === "url" && property.url) {
    return property.url;
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pageToArticle(page: any): Article {
  const props = page.properties;
  return {
    id: page.id,
    title: (props.Title?.title ? extractPlainText(props.Title.title) : "") || (props["이름"]?.title ? extractPlainText(props["이름"].title) : ""),
    slug: props.Slug?.rich_text ? extractPlainText(props.Slug.rich_text) : "",
    description: props.Description?.rich_text
      ? extractPlainText(props.Description.rich_text)
      : "",
    category: props.Category?.select?.name || "",
    date: props.Date?.date?.start || "",
    coverImage: props.Cover ? extractCover(props.Cover) : null,
  };
}

export async function getPublishedArticles(): Promise<Article[]> {
  if (!notion || !databaseId) return [];

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "Status",
        select: { equals: "Published" },
      },
      sorts: [{ property: "Date", direction: "descending" }],
    });

    return response.results.map(pageToArticle);
  } catch {
    console.error("Failed to fetch articles from Notion");
    return [];
  }
}

export async function getArticleBySlug(
  slug: string
): Promise<Article | null> {
  if (!notion || !databaseId) return null;

  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          { property: "Slug", rich_text: { equals: slug } },
          { property: "Status", select: { equals: "Published" } },
        ],
      },
    });

    if (response.results.length === 0) return null;
    return pageToArticle(response.results[0]);
  } catch {
    console.error("Failed to fetch article by slug from Notion");
    return null;
  }
}

export async function getArticleContent(pageId: string): Promise<string> {
  if (!n2m) return "";

  try {
    const mdBlocks = await n2m.pageToMarkdown(pageId);
    const mdString = n2m.toMarkdownString(mdBlocks);
    return mdString.parent;
  } catch {
    console.error("Failed to fetch article content from Notion");
    return "";
  }
}
