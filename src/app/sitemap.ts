import { MetadataRoute } from "next";
import { getPublishedArticles } from "@/lib/notion";

const BASE = "https://pixelpage.co.kr";

type Route = {
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
};

const STATIC_ROUTES: Route[] = [
  { path: "/", changeFrequency: "weekly", priority: 1.0 },
  { path: "/services/agency", changeFrequency: "monthly", priority: 0.9 },
  { path: "/services/consulting", changeFrequency: "monthly", priority: 0.9 },
  { path: "/services/performance", changeFrequency: "monthly", priority: 0.8 },
  { path: "/services/branded", changeFrequency: "monthly", priority: 0.8 },
  { path: "/services/seo", changeFrequency: "monthly", priority: 0.8 },
  { path: "/services/crm", changeFrequency: "monthly", priority: 0.8 },
  { path: "/services/webbuild", changeFrequency: "monthly", priority: 0.8 },
  { path: "/products/glue", changeFrequency: "monthly", priority: 0.7 },
  { path: "/cases", changeFrequency: "monthly", priority: 0.7 },
  { path: "/columns", changeFrequency: "daily", priority: 0.9 },
  { path: "/consult", changeFrequency: "monthly", priority: 0.7 },
  { path: "/demo", changeFrequency: "monthly", priority: 0.4 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${BASE}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  const articles = await getPublishedArticles();
  const articleEntries: MetadataRoute.Sitemap = articles
    .filter((a) => a.slug)
    .map((a) => ({
      url: `${BASE}/columns/${a.slug}`,
      lastModified: a.date ? new Date(a.date) : now,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  return [...staticEntries, ...articleEntries];
}
