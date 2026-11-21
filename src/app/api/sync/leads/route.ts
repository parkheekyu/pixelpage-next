import { NextResponse } from "next/server";

/** 예전의 시트·에어테이블 양방향 동기화 주소. 리드는 이제 구글 시트가 원본이고 대시보드는 읽기만 하므로 아무 일도 하지 않는다. (예전 워커가 호출해도 오류가 나지 않게 남겨 둔다) */
export function POST() { return NextResponse.json({ ok: true, results: [], note: "lead sync retired" }); }
