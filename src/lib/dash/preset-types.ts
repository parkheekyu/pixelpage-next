/** 고객사별 소재 프리셋 + 에셋 (dash.client_presets / dash.preset_assets) */

export const ASSET_KINDS = ["bg", "card", "logo", "photo", "audio", "font", "other"] as const;
export type AssetKind = (typeof ASSET_KINDS)[number];

export const KIND_LABEL: Record<AssetKind, { label: string; hint: string; accept: string }> = {
  bg: { label: "배경 영상", hint: "컷 없는 한 장면 영상(mp4). 프리셋 bg 로 깔림", accept: "video/*" },
  card: { label: "요소 카드", hint: "캡처를 필요한 부분만 자른 PNG/JPG. 문장마다 띄우는 카드", accept: "image/*" },
  logo: { label: "로고", hint: "앱·브랜드 로고, 프로필 사진 (PNG 투명 권장)", accept: "image/*" },
  photo: { label: "사진·B롤", hint: "실사 사진, 짧은 B롤 클립", accept: "image/*,video/*" },
  audio: { label: "BGM·효과음", hint: "mp3/wav", accept: "audio/*" },
  font: { label: "폰트", hint: "ttf/otf", accept: ".ttf,.otf,.woff,.woff2" },
  other: { label: "기타", hint: "그 밖의 참고 파일", accept: "*/*" },
};

export interface ClientPreset {
  id: string;
  project_id: string;
  preset_key: string;
  name: string;
  notes: string | null;
  params: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PresetAsset {
  id: string;
  client_preset_id: string;
  kind: AssetKind;
  label: string | null;
  path: string;
  url: string;
  mime: string | null;
  size: number | null;
  source: "upload" | "generated";
  meta: Record<string, unknown>;
  sort: number;
  created_by: string | null;
  created_at: string;
}

export const PRESET_ASSET_BUCKET = "preset-assets";
