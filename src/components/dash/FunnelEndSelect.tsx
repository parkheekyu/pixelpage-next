"use client";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setFunnelEnd } from "@/app/app/actions";
import { FUNNEL_ENDS, type FunnelEnd } from "@/lib/dash/types";

/** 개요 퍼널을 어느 단계까지 볼지 브랜드별로 고른다 (직원 전용). */
export default function FunnelEndSelect({ projectId, value, labels }: { projectId: string; value: FunnelEnd; labels: Record<FunnelEnd, string> }) {
  const router = useRouter();
  const [busy, start] = useTransition();
  return (
    <label className="fn-end">
      퍼널 끝 단계
      <select
        value={value}
        disabled={busy}
        onChange={(e) => {
          const v = e.target.value;
          start(async () => {
            const r = await setFunnelEnd(projectId, v);
            if (!r.ok) alert(r.error ?? "저장하지 못했습니다.");
            router.refresh();
          });
        }}
      >
        {FUNNEL_ENDS.map((k) => <option key={k} value={k}>{labels[k]}까지</option>)}
      </select>
    </label>
  );
}
