import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * POST /api/uploads — 이미지 업로드 (칼럼 본문·커버용). Supabase Storage 공개 버킷 `uploads`.
 * Header: Authorization: Bearer <COLUMN_PUBLISH_SECRET>
 *
 * 세 가지 입력 방식 (하나만):
 *  1) multipart/form-data: file=<이미지>  [folder=columns]
 *  2) JSON: { "filename": "cover.png", "content_base64": "...", "folder": "columns" }
 *  3) JSON: { "url": "https://외부/이미지.png", "folder": "columns" }   ← 외부 이미지를 받아 재호스팅
 *
 * 응답: { ok, url, path, size, type }
 * 제한: 10MB, 이미지 MIME 만. Vercel 요청 본문 한도(4.5MB)를 넘는 파일은 3) url 방식으로.
 */
const BUCKET = "uploads";
const MAX = 10 * 1024 * 1024;
const TYPES: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/svg+xml": "svg", "image/avif": "avif" };

function sniff(buf: Buffer, hint?: string | null): string | null {
  if (buf.length > 8 && buf[0] === 0x89 && buf[1] === 0x50) return "image/png";
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8) return "image/jpeg";
  if (buf.length > 12 && buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "image/webp";
  if (buf.length > 6 && buf.subarray(0, 6).toString() === "GIF89a") return "image/gif";
  if (buf.length > 12 && buf.subarray(4, 12).toString() === "ftypavif") return "image/avif";
  const head = buf.subarray(0, 300).toString("utf8").trimStart();
  if (head.startsWith("<svg") || (head.startsWith("<?xml") && head.includes("<svg"))) return "image/svg+xml";
  return hint && TYPES[hint] ? hint : null;
}

export async function POST(req: NextRequest) {
  const secret = process.env.COLUMN_PUBLISH_SECRET;
  if (!secret) return NextResponse.json({ ok: false, error: "COLUMN_PUBLISH_SECRET 미설정" }, { status: 500 });
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token || token !== secret) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  let buf: Buffer | null = null, name = "", folder = "columns", hint: string | null = null;
  const ct = req.headers.get("content-type") || "";
  try {
    if (ct.includes("multipart/form-data")) {
      const fd = await req.formData();
      const f = fd.get("file");
      if (!(f instanceof File)) return NextResponse.json({ ok: false, error: "file 필드가 없습니다" }, { status: 400 });
      buf = Buffer.from(await f.arrayBuffer()); name = f.name; hint = f.type || null;
      folder = String(fd.get("folder") || folder);
    } else {
      const b = (await req.json()) as { filename?: string; content_base64?: string; url?: string; folder?: string };
      folder = String(b.folder || folder);
      if (b.url) {
        if (!/^https?:\/\//i.test(b.url)) return NextResponse.json({ ok: false, error: "url 형식 오류" }, { status: 400 });
        const r = await fetch(b.url, { redirect: "follow", signal: AbortSignal.timeout(20000) });
        if (!r.ok) return NextResponse.json({ ok: false, error: `원본 다운로드 실패 (${r.status})` }, { status: 400 });
        buf = Buffer.from(await r.arrayBuffer()); hint = r.headers.get("content-type")?.split(";")[0] ?? null;
        name = b.filename || new URL(b.url).pathname.split("/").pop() || "image";
      } else if (b.content_base64) {
        buf = Buffer.from(b.content_base64.replace(/^data:[^;]+;base64,/, ""), "base64"); name = b.filename || "image";
      } else return NextResponse.json({ ok: false, error: "file, content_base64, url 중 하나가 필요합니다" }, { status: 400 });
    }
  } catch (e) {
    return NextResponse.json({ ok: false, error: `요청 파싱 실패: ${(e as Error).message}` }, { status: 400 });
  }

  if (!buf || buf.length === 0) return NextResponse.json({ ok: false, error: "빈 파일" }, { status: 400 });
  if (buf.length > MAX) return NextResponse.json({ ok: false, error: "10MB 초과" }, { status: 413 });
  const type = sniff(buf, hint);
  if (!type) return NextResponse.json({ ok: false, error: "이미지 파일만 업로드할 수 있습니다 (png, jpg, webp, gif, svg, avif)" }, { status: 415 });

  const base = name.replace(/\.[a-z0-9]+$/i, "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "image";
  const hash = createHash("sha1").update(buf).digest("hex").slice(0, 8);
  const d = new Date();
  const safeFolder = folder.toLowerCase().replace(/[^a-z0-9/_-]/g, "").replace(/^\/+|\/+$/g, "") || "columns";
  const path = `${safeFolder}/${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${base}-${hash}-${randomBytes(2).toString("hex")}.${TYPES[type]}`;

  const admin = createAdminClient();
  const { error } = await admin.storage.from(BUCKET).upload(path, buf, { contentType: type, cacheControl: "31536000", upsert: false });
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ ok: true, url: data.publicUrl, path, size: buf.length, type });
}
