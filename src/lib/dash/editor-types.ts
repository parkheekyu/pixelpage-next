/** 소재 편집기 데이터 (dash.project_edits) — 광고제작 data.json 과 같은 구조 */
export type Chunk = { t: string; s: number; e: number };
export type CardSpec = { file: string; aspect?: number; w?: number; y?: number; at?: number };
export type EditScene = {
  idx: number; text?: string; start: number; dur: number; chunks: Chunk[];
  label?: string; note?: string; card?: CardSpec; card2?: CardSpec;
  hookFire?: boolean; intro?: { lines: string[]; logos?: string[]; bg?: string; bgDur?: number }; ending?: boolean; cta?: string;
  [k: string]: unknown;
};
export type EditData = {
  fps: number; width: number; height: number; total: number; audio: string;
  scenes: EditScene[]; preset: Record<string, unknown>;
  bg?: string; bgDur?: number; bgStill?: string; cta?: string; logo?: string;
  [k: string]: unknown;
};
export type EditAsset = { label: string | null; url: string; kind: string; aspect: number };
export interface ProjectEdit {
  id: string; project_id: string; name: string; preset_key: string; composition: string;
  data: EditData; original: EditData; media_base: string | null; assets: EditAsset[];
  edited_at: string | null; render_requested_at: string | null; rendered_at: string | null;
  created_at: string; updated_at: string;
}

export type EditRow = Pick<ProjectEdit, "id" | "name" | "preset_key" | "composition" | "edited_at" | "render_requested_at" | "rendered_at" | "updated_at"> & { total: number };
