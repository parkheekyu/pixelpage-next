import type { ComponentType } from "react";
import { BgTalk } from "./compositions/BgTalk";
import { MotionCard } from "./compositions/MotionCard";
import type { ProjectData } from "./compositions/types";

/** 편집기가 지원하는 Remotion 컴포지션. 소스는 pipeline/editor_publish.py 가 광고제작/remotion/src 에서 복사한다. */
export const COMPOSITIONS: Record<string, ComponentType<{ data: ProjectData }>> = { BgTalk, MotionCard };
