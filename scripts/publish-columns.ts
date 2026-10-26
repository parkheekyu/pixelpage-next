/* 사용: npx tsx --env-file=.env.local scripts/publish-columns.ts <json 파일...> */
import { readFileSync } from "node:fs";
import { publishColumn, type PublishInput } from "../src/lib/notion-publish";

async function main() {
  const files = process.argv.slice(2);
  if (!files.length) { console.error("json 파일 경로를 넘겨 주세요"); process.exit(1); }
  for (const f of files) {
    const input = JSON.parse(readFileSync(f, "utf8")) as PublishInput;
    const r = await publishColumn(input);
    console.log(`${input.date}  ${r.site_url}  (archived ${r.archived_previous})`);
  }
}
main().catch((e) => { console.error(e); process.exit(1); });
