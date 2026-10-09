import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/dash/auth";
import presets from "@/lib/dash/presets.json";
import params from "@/lib/dash/preset-params.json";
import PresetEditor from "@/components/dash/PresetEditor";

export const dynamic = "force-dynamic";

type Scalar = number | string | boolean;
const PARAMS = params as Record<string, { defaults: Record<string, Scalar> }>;

/** 공용 프리셋 설정 편집(직원 전용) */
export default async function PresetEditPage({ params: p }: { params: Promise<{ key: string }> }) {
  const { key } = await p;
  const { supabase } = await requireStaff();
  const item = presets.items.find((i) => i.key === key);
  if (!item || !PARAMS[key]) redirect("/app/presets");
  const { data } = await supabase.from("preset_settings").select("params").eq("preset_key", key).maybeSingle();
  const shared = ((data?.params as Record<string, Scalar>) ?? {});
  return <PresetEditor scope={{ kind: "shared", presetKey: key }} name={item.name} defaults={PARAMS[key].defaults} shared={shared} current={shared} sampleBase={presets.base} />;
}
