/** 광고제작/remotion/src/types.ts 의 최소 복제 — 편집기에서 쓰는 컴포지션이 import 하는 타입만 */
export type Scene = {
  idx: number;
  text: string;
  start: number;
  dur: number;
  [k: string]: unknown;
};

export type ProjectData = {
  fps: number;
  width: number;
  height: number;
  total: number;
  audio: string;
  scenes: Scene[];
  preset: Record<string, unknown>;
};
