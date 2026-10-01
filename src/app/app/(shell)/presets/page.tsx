import { requireSession } from "@/lib/dash/auth";
import { redirect } from "next/navigation";
import presets from "@/lib/dash/presets.json";
import PresetGallery from "@/components/dash/PresetGallery";

export const dynamic = "force-dynamic";

/** 소재 프리셋 갤러리(직원 전용): 광고제작 머신의 프리셋을 9:16 샘플로 한눈에. 데이터는 광고제작/pipeline/publish_presets.py 가 갱신. */
export default async function PresetsPage() {
  const { profile } = await requireSession();
  if (profile.role !== "staff") redirect("/app");
  return (
    <>
      <header className="ph">
        <div><h1>소재 프리셋</h1><div className="hint">광고제작 머신 프리셋 {presets.items.length}종 · 갱신 {presets.updated}. 카드에 마우스를 올리면 재생됩니다.</div></div>
      </header>
      <PresetGallery items={presets.items} base={presets.base} />
    </>
  );
}
