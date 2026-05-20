import { Metadata } from "next";
import BridgeClient from "./BridgeClient";

export const metadata: Metadata = {
  title: "PIXELPAGE — 마케팅 대행의 새로운 기준 (Preview)",
  description: "내부 검토용 데모 페이지.",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function Page() {
  return <BridgeClient />;
}
