import type { Lead } from "./types";

export type SheetView = "all" | "todo" | "conv" | "need" | "drop" | "dup";
export type SheetSort = "ts_desc" | "ts_asc" | "status" | "rev_desc";

export interface LeadQuery {
  days: number;
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

export const DEFAULT_QUERY: LeadQuery = { days: 28, view: "all", status: "", src: "", q: "", sort: "ts_desc", offset: 0, limit: 150 };
