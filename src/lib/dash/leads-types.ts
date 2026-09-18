import type { Lead } from "./types";
import { presetRange } from "./dates";

export type SheetView = "all" | "todo" | "conv" | "need" | "drop" | "dup";
export type SheetSort = "ts_desc" | "ts_asc" | "status" | "rev_desc" | "manual";

export interface LeadQuery {
  from: string; // YYYY-MM-DD (KST, inclusive)
  to: string;
  view: SheetView;
  status: string;
  src: string;
  q: string;
  sort: SheetSort;
  offset: number;
  limit: number;
}

export interface LeadSummary {
  all: number; todo: number; conv: number; need: number; drop: number; dup: number; revenue: number;
}

export interface LeadPage {
  rows: Lead[];
  total: number;
  summary: LeadSummary;
  sources: string[];
}

export const defaultQuery = (now = Date.now()): LeadQuery => ({ ...presetRange("30d", now), view: "all", status: "", src: "", q: "", sort: "ts_desc", offset: 0, limit: 150 });
export const PAGE_LIMIT = 150;
