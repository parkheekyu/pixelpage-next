/**
 * 픽셀페이지 대시보드 MCP 의 도구와 JSON-RPC 처리. 두 곳에서 같이 쓴다.
 *   - scripts/dash-mcp.mjs: 이 맥의 Claude Code 용 (stdio)
 *   - src/app/api/mcp/[token]/route.ts: ChatGPT 등 외부 AI 용 (HTTPS)
 * service role 로 dash 스키마에 직접 접근하므로 권한 제한이 없다(삭제 포함). 광고 계정 조작은 일부러 넣지 않았다.
 */
const READ_ONLY = ["overview", "dash_report", "db_select", "lead_sheet_inspect", "lead_sheet_read"];

export function createMcp({ db, site, secret, sheets = null }) {
  const today = () => new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
  const isUuid = (v) => /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(v ?? "");
  const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v ?? "");
  const must = ({ data, error }) => { if (error) throw new Error(error.message); return data; };

  /** 이름(일부만 맞아도 됨)이나 id 로 한 줄을 찾는다. 여러 개가 걸리면 후보를 알려 주고 멈춘다. */
  async function find(table, key, col = "name", scope = {}) {
    if (!key) return null;
    if (isUuid(key)) { const r = must(await db.from(table).select("*").eq("id", key).maybeSingle()); if (!r) throw new Error(`${table} 에 id ${key} 가 없습니다.`); return r; }
    let q = db.from(table).select("*");
    for (const [k, v] of Object.entries(scope)) q = q.eq(k, v);
    const rows = must(await q);
    const s = String(key).trim().toLowerCase();
    const exact = rows.filter((r) => String(r[col] ?? "").toLowerCase() === s);
    const hit = exact.length ? exact : rows.filter((r) => String(r[col] ?? "").toLowerCase().includes(s));
    if (hit.length === 1) return hit[0];
    if (!hit.length) throw new Error(`"${key}" 와 맞는 ${table} 항목이 없습니다. 있는 것: ${rows.map((r) => r[col]).slice(0, 30).join(", ") || "없음"}`);
    throw new Error(`"${key}" 와 맞는 ${table} 항목이 ${hit.length}개입니다. id 로 지정하세요: ${hit.map((r) => `${r[col]} (${r.id})`).join(", ")}`);
  }

  const pct = (tasks) => { const base = tasks.filter((t) => t.status !== "hold").length; const done = tasks.filter((t) => t.status === "done").length; return { done, base, pct: base ? Math.round((done / base) * 100) : 0 }; };

  function taskFields(a) {
    const o = {};
    if (a.title !== undefined) { o.title = String(a.title).trim().slice(0, 200); if (!o.title) throw new Error("할 일 제목이 비었습니다."); }
    if (a.deadline !== undefined) { if (a.deadline && !isDate(a.deadline)) throw new Error("deadline 은 YYYY-MM-DD"); o.deadline = a.deadline || null; }
    if (a.priority !== undefined) { if (!["high", "mid", "low"].includes(a.priority)) throw new Error("priority 는 high|mid|low"); o.priority = a.priority; }
    if (a.status !== undefined) { if (!["todo", "done", "hold"].includes(a.status)) throw new Error("status 는 todo|done|hold"); o.status = a.status; }
    if (a.hold_reason !== undefined) o.hold_reason = String(a.hold_reason ?? "").trim().slice(0, 200) || null;
    return o;
  }
  async function taskLinks(a, o, cur) {
    if (a.project !== undefined) { const p = a.project ? await find("work_projects", a.project) : null; o.project_id = p?.id ?? null; if (p && a.client === undefined && !cur?.client_id) o.client_id = p.client_id ?? null; if (a.milestone === undefined) o.milestone_id = null; }
    if (a.client !== undefined) o.client_id = a.client ? (await find("clients", a.client)).id : null;
    if (a.milestone !== undefined) {
      const pid = o.project_id ?? cur?.project_id;
      if (a.milestone && !pid) throw new Error("마일스톤을 지정하려면 project 도 필요합니다.");
      o.milestone_id = a.milestone ? (await find("work_milestones", a.milestone, "title", { project_id: pid })).id : null;
    }
  }
  const slugify = (name) => name.replace(/\(주\)|주식회사/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

  function applyFilters(q, match) {
    for (const [k, v] of Object.entries(match ?? {})) {
      if (v === null) q = q.is(k, null);
      else if (Array.isArray(v)) q = q.in(k, v);
      else if (typeof v === "object") { const [[op, val]] = Object.entries(v); if (!["eq", "neq", "gt", "gte", "lt", "lte", "like", "ilike", "is", "in"].includes(op)) throw new Error(`지원하지 않는 조건: ${op}`); q = q[op](k, val); }
      else q = q.eq(k, v);
    }
    return q;
  }

  const str = { type: "string" }, obj = { type: "object" };
  const TOOLS = {
    overview: {
      description: "대시보드 전체 현황: 클라이언트 목록, 업무 프로젝트(진행률·마일스톤), 끝나지 않은 할 일. 무엇을 고치기 전에 먼저 불러 id 와 이름을 확인한다.",
      schema: { type: "object", properties: { include_done: { type: "boolean", description: "완료한 할 일도 포함" } } },
      async run({ include_done }) {
        const [clients, projects, ms, tasks] = await Promise.all([
          db.from("clients").select("id,name,category,contract_type,status,contract_date,end_date,revenue_model,memo,project_id").order("name"),
          db.from("work_projects").select("*").order("created_at"), db.from("work_milestones").select("*").order("position"),
          db.from("work_tasks").select("id,title,status,priority,deadline,hold_reason,client_id,project_id,milestone_id,done_at").order("deadline", { nullsFirst: false }),
        ].map(async (q) => must(await q)));
        const cn = Object.fromEntries(clients.map((c) => [c.id, c.name]));
        return {
          today: today(), clients,
          work_projects: projects.map((p) => ({ id: p.id, name: p.name, goal: p.goal, deadline: p.deadline, status: p.status, client: cn[p.client_id] ?? null, ...pct(tasks.filter((t) => t.project_id === p.id)), milestones: ms.filter((m) => m.project_id === p.id).map((m) => ({ id: m.id, title: m.title, ...pct(tasks.filter((t) => t.milestone_id === m.id)) })) })),
          tasks: tasks.filter((t) => include_done || t.status !== "done").map((t) => ({ id: t.id, title: t.title, status: t.status, priority: t.priority, deadline: t.deadline, hold_reason: t.hold_reason ?? undefined, client: cn[t.client_id] ?? null, project: projects.find((p) => p.id === t.project_id)?.name ?? null, milestone: ms.find((m) => m.id === t.milestone_id)?.title ?? null })),
        };
      },
    },
    task_add: {
      description: "할 일 추가. 여러 개면 tasks 배열로 한 번에. project·client·milestone 은 이름(일부) 또는 id.",
      schema: { type: "object", properties: { tasks: { type: "array", items: { type: "object", properties: { title: str, project: str, milestone: str, client: str, deadline: { ...str, description: "YYYY-MM-DD" }, priority: { enum: ["high", "mid", "low"] }, status: { enum: ["todo", "done", "hold"] }, hold_reason: str }, required: ["title"] } } }, required: ["tasks"] },
      async run({ tasks }) {
        const rows = [];
        for (const a of tasks) { const o = taskFields(a); await taskLinks(a, o, null); if (o.status === "done") o.done_at = new Date().toISOString(); rows.push(o); }
        return must(await db.from("work_tasks").insert(rows).select("id,title,deadline,priority,status"));
      },
    },
    task_update: {
      description: "할 일 수정·완료·보류·이동. task 는 id 또는 제목(일부). 완료는 status:'done', 보류는 status:'hold' 와 hold_reason.",
      schema: { type: "object", properties: { task: str, title: str, project: str, milestone: str, client: str, deadline: str, priority: { enum: ["high", "mid", "low"] }, status: { enum: ["todo", "done", "hold"] }, hold_reason: str }, required: ["task"] },
      async run(a) {
        const cur = await find("work_tasks", a.task, "title");
        const o = taskFields(a); await taskLinks(a, o, cur);
        if (o.status) { o.done_at = o.status === "done" ? new Date().toISOString() : null; if (o.status !== "hold") o.hold_reason = null; }
        return must(await db.from("work_tasks").update({ ...o, updated_at: new Date().toISOString() }).eq("id", cur.id).select().single());
      },
    },
    work_project_save: {
      description: "업무 프로젝트 만들기 또는 수정. project(이름·id)를 주면 수정, 없으면 name 으로 새로 만든다. milestones 를 주면 그 제목들을 순서대로 끝에 추가한다.",
      schema: { type: "object", properties: { project: str, name: str, goal: str, deadline: str, client: str, status: { enum: ["active", "done"] }, milestones: { type: "array", items: str } } },
      async run(a) {
        const o = {};
        if (a.name !== undefined) o.name = String(a.name).trim().slice(0, 120);
        if (a.goal !== undefined) o.goal = String(a.goal ?? "").trim() || null;
        if (a.deadline !== undefined) { if (a.deadline && !isDate(a.deadline)) throw new Error("deadline 은 YYYY-MM-DD"); o.deadline = a.deadline || null; }
        if (a.status !== undefined) o.status = a.status;
        if (a.client !== undefined) o.client_id = a.client ? (await find("clients", a.client)).id : null;
        let p;
        if (a.project) { const cur = await find("work_projects", a.project); p = Object.keys(o).length ? must(await db.from("work_projects").update(o).eq("id", cur.id).select().single()) : cur; }
        else { if (!o.name) throw new Error("새 프로젝트는 name 이 필요합니다."); p = must(await db.from("work_projects").insert(o).select().single()); }
        let added = [];
        if (a.milestones?.length) {
          const last = must(await db.from("work_milestones").select("position").eq("project_id", p.id).order("position", { ascending: false }).limit(1))[0]?.position ?? 0;
          added = must(await db.from("work_milestones").insert(a.milestones.map((title, i) => ({ project_id: p.id, title: String(title).trim().slice(0, 120), position: last + i + 1 }))).select("id,title,position"));
        }
        return { project: p, milestones_added: added };
      },
    },
    client_save: {
      description: "클라이언트 추가 또는 수정. client(이름·id)를 주면 수정, 없으면 name 으로 새로 만들고 사이드바 고객사(대시보드 프로젝트)도 함께 만든다. contract_type: markup(마크업)|revshare(수익쉐어)|cpa|own(자사). category: db|sales(판매). status: active(진행중)|ended(종료).",
      schema: { type: "object", properties: { client: str, name: str, contract_type: { enum: ["markup", "revshare", "cpa", "own"] }, category: { enum: ["db", "sales"] }, status: { enum: ["active", "ended"] }, contract_date: str, end_date: str, revenue_model: str, memo: str, logo_url: str } },
      async run(a) {
        const o = {};
        for (const k of ["name", "contract_type", "category", "status", "logo_url"]) if (a[k] !== undefined) o[k] = a[k];
        for (const k of ["contract_date", "end_date"]) if (a[k] !== undefined) { if (a[k] && !isDate(a[k])) throw new Error(`${k} 는 YYYY-MM-DD`); o[k] = a[k] || null; }
        for (const k of ["revenue_model", "memo"]) if (a[k] !== undefined) o[k] = String(a[k] ?? "").trim() || null;
        if (o.status === "ended" && o.end_date === undefined) o.end_date = today();
        if (o.status === "active") o.end_date = null;
        if (o.contract_type === "own") o.category = null;
        if (a.client) {
          const cur = await find("clients", a.client);
          const row = must(await db.from("clients").update({ ...o, updated_at: new Date().toISOString() }).eq("id", cur.id).select().single());
          if (o.contract_type !== undefined && row.project_id) must(await db.from("projects").update({ is_own: o.contract_type === "own" }).eq("id", row.project_id));
          return row;
        }
        if (!o.name?.trim()) throw new Error("새 클라이언트는 name 이 필요합니다.");
        const base = slugify(o.name) || "client";
        let projectId = null;
        for (const slug of [base, `${base}-${Date.now().toString(36).slice(-4)}`]) {
          const { data, error } = await db.from("projects").insert({ name: o.name, slug, is_own: o.contract_type === "own" }).select("id").single();
          if (data) { projectId = data.id; break; }
          if (error?.code !== "23505") throw new Error(error?.message ?? "고객사 생성 실패");
        }
        return must(await db.from("clients").insert({ category: o.contract_type === "own" ? null : "db", ...o, project_id: projectId }).select().single());
      },
    },
    research_input_set: {
      description: "고객사 리서치 탭의 '고객사 정보' 채우기. 준 항목만 덮어쓰고 나머지는 그대로 둔다. 항목: product(상품/서비스), target(타깃 고객), price, offer, proof(증거), competitors, objections(반박·거절 이유), notes, pre_research(사전 조사 붙여넣기).",
      schema: { type: "object", properties: { project: { ...str, description: "고객사(사이드바 프로젝트) 이름 또는 id" }, fields: obj }, required: ["project", "fields"] },
      async run({ project, fields }) {
        const p = await find("projects", project);
        const ok = ["product", "target", "price", "offer", "proof", "competitors", "objections", "notes", "pre_research"];
        const bad = Object.keys(fields).filter((k) => !ok.includes(k)); if (bad.length) throw new Error(`모르는 항목: ${bad.join(", ")}`);
        const next = { ...(p.research_input ?? {}), ...fields };
        return must(await db.from("projects").update({ research_input: next }).eq("id", p.id).select("id,name,research_input").single());
      },
    },
    dash_report: {
      description: "고객사별 조회 리포트(글). op: projects(고객사 목록) | project(기본 정보) | leads(리드) | meta(광고 성과) | meta-objects(캠페인·세트 목록) | research | analyses(저장된 AI 리포트, params.kind=ads|landing|market) | landing(랜딩 수치) | proposals(소재 제안). params 예: {project:'비포레스트', preset:'last_7d'}. 조회 전용이다.",
      schema: { type: "object", properties: { op: { enum: ["projects", "project", "leads", "meta", "meta-objects", "research", "analyses", "landing", "proposals"] }, params: obj }, required: ["op"] },
      async run({ op, params }) {
        const q = new URLSearchParams({ op }); for (const [k, v] of Object.entries(params ?? {})) q.set(k, String(v));
        const r = await fetch(`${site}/api/agent/data?${q}`, { headers: { authorization: `Bearer ${secret ?? ""}` }, signal: AbortSignal.timeout(110000) });
        return await r.text();
      },
    },
    db_select: {
      description: "dash 스키마 표를 직접 읽는다. 주요 표: clients, projects, work_projects, work_milestones, work_tasks, leads, analyses, project_integrations, profiles. match 는 {컬럼: 값} (같음), {컬럼: null}, {컬럼: [값들]}, {컬럼: {gte: 값}} (eq|neq|gt|gte|lt|lte|like|ilike|in). 컬럼을 모르면 limit 1 로 먼저 읽어 확인한다.",
      schema: { type: "object", properties: { table: str, columns: { ...str, description: "쉼표로 구분, 기본 *" }, match: obj, order: { ...str, description: "컬럼 이름, 내림차순은 뒤에 .desc" }, limit: { type: "integer" } }, required: ["table"] },
      async run({ table, columns, match, order, limit }) {
        let q = applyFilters(db.from(table).select(columns || "*"), match);
        if (order) { const [c, d] = order.split("."); q = q.order(c, { ascending: d !== "desc" }); }
        return must(await q.limit(Math.min(limit ?? 50, 500)));
      },
    },
    db_insert: {
      description: "dash 스키마 표에 줄을 직접 넣는다. 할 일·클라이언트·프로젝트는 전용 도구(task_add, client_save, work_project_save)가 연결 관계까지 맞춰 주므로 그쪽을 먼저 쓴다.",
      schema: { type: "object", properties: { table: str, rows: { type: "array", items: obj } }, required: ["table", "rows"] },
      async run({ table, rows }) { return must(await db.from(table).insert(rows).select()); },
    },
    db_update: {
      description: "dash 스키마 표의 줄을 직접 고친다. match 조건에 맞는 모든 줄이 바뀌므로 조건은 반드시 준다.",
      schema: { type: "object", properties: { table: str, match: obj, patch: obj }, required: ["table", "match", "patch"] },
      async run({ table, match, patch }) { if (!Object.keys(match ?? {}).length) throw new Error("match 조건이 비었습니다."); return must(await applyFilters(db.from(table).update(patch), match).select()); },
    },
    db_delete: {
      description: "dash 스키마 표의 줄을 지운다. 되돌릴 수 없다. 조건에 맞는 줄 수를 먼저 세어, 그 수가 expect_count 와 같을 때만 지운다. 업무 프로젝트를 지우면 그 마일스톤과 할 일도 함께 지워진다.",
      schema: { type: "object", properties: { table: str, match: obj, expect_count: { type: "integer", description: "지워질 것으로 예상하는 줄 수. db_select 로 먼저 확인한 값." } }, required: ["table", "match", "expect_count"] },
      async run({ table, match, expect_count }) {
        if (!Object.keys(match ?? {}).length) throw new Error("match 조건이 비었습니다.");
        const { count, error } = await applyFilters(db.from(table).select("*", { count: "exact", head: true }), match);
        if (error) throw new Error(error.message);
        if (count !== expect_count) throw new Error(`조건에 맞는 줄은 ${count}개인데 expect_count 는 ${expect_count} 입니다. 지우지 않았습니다.`);
        return { deleted: must(await applyFilters(db.from(table).delete(), match).select()).length };
      },
    },
  };

  // ---------- 리드 구글 시트: 점검 · 읽기 · 고치기 · 연결 ----------
  if (sheets) {
    const sheetIdOf = (v) => { const m = String(v ?? "").match(/\/d\/([A-Za-z0-9_-]{20,})/); const id = m ? m[1] : String(v ?? "").trim(); if (!/^[A-Za-z0-9_-]{20,}$/.test(id)) throw new Error("sheet 는 구글 시트 주소나 시트 ID 여야 합니다."); return id; };
    const share = `시트를 서비스 계정(${sheets.email ?? "설정 확인 필요"})에 공유했는지 확인하세요. 읽기는 '링크가 있는 모든 사용자: 뷰어'로도 되고, 쓰기는 이 계정을 편집자로 추가해야 합니다.`;
    const g = async (fn) => { try { return await fn(); } catch (e) { throw new Error(`${e?.message ?? e} — ${share}`); } };
    const tabList = (v) => (Array.isArray(v) ? v : String(v ?? "").split(",")).map((t) => String(t).trim()).filter(Boolean);
    /** 프로젝트 이름을 주면 연결된 시트를, 아니면 sheet 값을 쓴다 */
    async function target({ project, sheet, tab }) {
      if (sheet) return { id: sheetIdOf(sheet), tab };
      if (!project) throw new Error("project(고객사 이름) 나 sheet(주소) 중 하나는 줘야 합니다.");
      const p = await find("projects", project);
      const i = must(await db.from("project_integrations").select("google_sheet_id,google_sheet_tab").eq("project_id", p.id).maybeSingle());
      if (!i?.google_sheet_id) throw new Error(`${p.name} 에 연결된 시트가 없습니다.`);
      return { id: i.google_sheet_id, tab: tab || tabList(i.google_sheet_tab)[0] };
    }
    /** 탭 하나를 대시보드가 어떻게 읽는지 요약한다. 행 내용(개인정보)은 내보내지 않는다. */
    async function inspectTab(id, tab) {
      const { header, rows: all } = await g(() => sheets.grid(id, tab));
      const rows = all.filter((r) => r.some((c) => (c ?? "").trim()));
      const cols = header.map((h, k) => ({ column: h, reads_as: sheets.matchHeader(h), filled: rows.filter((r) => (r[k] ?? "").trim()).length }));
      const at = (std) => cols.findIndex((c) => c.reads_as === std);
      const out = { tab, data_rows: rows.length, columns: cols.filter((c) => c.column.trim()) };
      const need = ["등록일시", "이름", "연락처", "상태", "매출액", "유입매체"];
      out.missing = need.filter((n) => at(n) < 0);
      const dc = at("등록일시");
      if (dc >= 0) {
        const ds = rows.map((r) => sheets.parseDate(r[dc] ?? "")); const good = ds.filter(Boolean).sort();
        out.dates = { readable: good.length, unreadable: rows.length - good.length, first: good[0]?.slice(0, 10) ?? null, last: good.at(-1)?.slice(0, 10) ?? null };
      }
      const sc = at("상태");
      if (sc >= 0) { const m = {}; for (const r of rows) { const raw = (r[sc] ?? "").trim(); const k = `${raw || "(빈칸)"} → ${sheets.mapStatus(raw) || "신규"}`; m[k] = (m[k] ?? 0) + 1; } out.status = Object.fromEntries(Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 15)); }
      const rc = at("매출액");
      if (rc >= 0) out.revenue_sum = rows.reduce((a, r) => a + (Number(String(r[rc] ?? "").replace(/[^0-9.]/g, "")) || 0), 0);
      out.notes = [
        dc < 0 ? "날짜 열을 못 찾았습니다. 머리글을 '등록일시'(또는 신청일시·결제일시 등)로 바꾸지 않으면 집계에 하나도 잡히지 않습니다." : null,
        sc < 0 ? "'상태' 열이 없어 모든 리드가 '신규'로 잡힙니다." : null,
        rc < 0 ? "'매출액' 열이 없어 매출이 0으로 나옵니다." : null,
        at("유입매체") < 0 ? "'유입매체' 열이 없어 매체가 모두 unknown 으로 나옵니다." : null,
      ].filter(Boolean);
      return out;
    }
    Object.assign(TOOLS, {
      lead_sheet_inspect: {
        description: "리드 구글 시트를 점검한다(읽기 전용, 행 내용은 내보내지 않음). 탭 목록, 각 열을 대시보드가 무엇으로 읽는지(reads_as: 등록일시·이름·연락처·상태·매출액 등, null 이면 그냥 보여 주기만 함), 날짜를 읽을 수 있는 행 수, 상태 값이 어떻게 바뀌는지, 빠진 열을 알려 준다. 연결 전에 먼저 부른다. sheet(주소/ID) 나 project(이미 연결된 고객사) 중 하나를 준다. tab 을 안 주면 모든 탭을 본다.",
        schema: { type: "object", properties: { sheet: { ...str, description: "구글 시트 주소 또는 ID" }, project: { ...str, description: "이미 시트가 연결된 고객사 이름 또는 id" }, tab: { ...str, description: "탭 이름. 쉼표로 여러 개" } } },
        async run(a) {
          const t = await target({ ...a, tab: undefined });
          const meta = await g(() => sheets.tabs(t.id));
          const want = tabList(a.tab); const names = want.length ? want : meta.tabs.map((x) => x.name).slice(0, 8);
          const bad = names.filter((n) => !meta.tabs.some((x) => x.name === n)); if (bad.length) throw new Error(`없는 탭: ${bad.join(", ")}. 있는 탭: ${meta.tabs.map((x) => x.name).join(", ")}`);
          return { sheet_id: t.id, title: meta.title, service_account: sheets.email, all_tabs: meta.tabs.map((x) => x.name), tabs: await Promise.all(names.map((n) => inspectTab(t.id, n))) };
        },
      },
      lead_sheet_read: {
        description: "리드 구글 시트의 행을 그대로 읽는다(개인정보 포함). row 는 시트의 행 번호(머리글이 1행, 데이터는 2행부터). 한 번에 최대 200행.",
        schema: { type: "object", properties: { sheet: str, project: str, tab: str, from_row: { type: "integer", description: "기본 2" }, limit: { type: "integer", description: "기본 30, 최대 200" }, newest: { type: "boolean", description: "true 면 맨 아래 행부터 limit 개" } } },
        async run(a) {
          const t = await target(a); if (!t.tab) { const meta = await g(() => sheets.tabs(t.id)); t.tab = meta.tabs[0]?.name; }
          const { header, rows } = await g(() => sheets.grid(t.id, t.tab));
          const n = Math.min(Math.max(a.limit ?? 30, 1), 200); const start = a.newest ? Math.max(0, rows.length - n) : Math.max(0, (a.from_row ?? 2) - 2);
          return { sheet_id: t.id, tab: t.tab, header, total_rows: rows.length, rows: rows.slice(start, start + n).map((r, i) => ({ row: start + i + 2, values: r })) };
        },
      },
      lead_sheet_write: {
        description: "리드 구글 시트의 칸을 고친다(머리글 이름 바꾸기, 상태·매출액 열 추가, 값 수정 등). range 는 A1 표기(예: 'J1', 'A2:C3'), values 는 행들의 배열(예: [['상태','매출액']]). 덮어쓰면 되돌릴 수 없으니 lead_sheet_read 로 먼저 확인한다. 서비스 계정이 시트의 편집자여야 한다. 대시보드에는 2분 안에 반영된다.",
        schema: { type: "object", properties: { sheet: str, project: str, tab: str, range: { ...str, description: "A1 표기, 탭 이름은 빼고" }, values: { type: "array", items: { type: "array", items: {} } } }, required: ["range", "values"] },
        async run(a) {
          const t = await target(a); if (!t.tab) throw new Error("tab(탭 이름)을 줘야 합니다.");
          if (!/^[A-Za-z]{1,3}\d{0,7}(:[A-Za-z]{1,3}\d{0,7})?$/.test(a.range ?? "")) throw new Error("range 는 A1 표기여야 합니다 (예: J1, A2:C3).");
          const values = (a.values ?? []).map((r) => (Array.isArray(r) ? r : [r]).map((c) => (c == null ? "" : String(c))));
          const cells = values.reduce((n, r) => n + r.length, 0); if (!cells) throw new Error("values 가 비었습니다."); if (cells > 5000) throw new Error("한 번에 5,000칸까지만 씁니다.");
          return { sheet_id: t.id, tab: t.tab, range: a.range, updated_cells: await g(() => sheets.write(t.id, t.tab, a.range, values)) };
        },
      },
      lead_sheet_append: {
        description: "리드 구글 시트 맨 아래에 행을 덧붙인다. rows 는 행들의 배열이고 칸 순서는 시트 머리글 순서와 같아야 한다(lead_sheet_read 의 header 참고). 서비스 계정이 편집자여야 한다.",
        schema: { type: "object", properties: { sheet: str, project: str, tab: str, rows: { type: "array", items: { type: "array", items: {} } } }, required: ["rows"] },
        async run(a) {
          const t = await target(a); if (!t.tab) throw new Error("tab(탭 이름)을 줘야 합니다.");
          const rows = (a.rows ?? []).map((r) => (Array.isArray(r) ? r : [r]).map((c) => (c == null ? "" : String(c)))); if (!rows.length) throw new Error("rows 가 비었습니다."); if (rows.length > 500) throw new Error("한 번에 500행까지만 넣습니다.");
          return { sheet_id: t.id, tab: t.tab, appended: rows.length, range: await g(() => sheets.append(t.id, t.tab, rows)) };
        },
      },
      lead_sheet_link: {
        description: "고객사에 리드 구글 시트를 연결한다(이미 있으면 바꾼다). 연결하면 그 고객사의 리드 탭과 집계가 이 시트를 읽는다. tabs 는 읽을 탭 이름(쉼표나 배열로 여러 개면 한 표로 합친다, 생략하면 첫 탭). 탭이 없거나 날짜 열을 못 읽으면 연결하지 않고 이유를 알려 준다(그래도 연결하려면 force:true). unlink:true 면 연결을 끊는다(시트는 그대로 둔다).",
        schema: { type: "object", properties: { project: { ...str, description: "고객사(사이드바 프로젝트) 이름 또는 id" }, sheet: { ...str, description: "구글 시트 주소 또는 ID" }, tabs: { description: "탭 이름. 쉼표 문자열이나 배열" }, force: { type: "boolean" }, unlink: { type: "boolean" } }, required: ["project"] },
        async run({ project, sheet, tabs, force, unlink }) {
          const p = await find("projects", project);
          const cur = must(await db.from("project_integrations").select("project_id,google_sheet_id,google_sheet_tab").eq("project_id", p.id).maybeSingle());
          const save = async (patch) => must(cur ? await db.from("project_integrations").update(patch).eq("project_id", p.id).select("project_id") : await db.from("project_integrations").insert({ project_id: p.id, ...patch }).select("project_id"));
          if (unlink) {
            if (!cur?.google_sheet_id) return { project: p.name, linked: false, note: "연결된 시트가 없었습니다." };
            await save({ google_sheet_id: null }); must(await db.from("projects").update({ has_lead_sheet: false }).eq("id", p.id).select("id"));
            return { project: p.name, linked: false, was: { sheet_id: cur.google_sheet_id, tabs: cur.google_sheet_tab } };
          }
          if (!sheet) throw new Error("sheet(구글 시트 주소)를 줘야 합니다.");
          const id = sheetIdOf(sheet); const meta = await g(() => sheets.tabs(id));
          const names = tabList(tabs).length ? tabList(tabs) : [meta.tabs[0]?.name].filter(Boolean);
          const bad = names.filter((n) => !meta.tabs.some((x) => x.name === n)); if (bad.length || !names.length) throw new Error(`없는 탭: ${bad.join(", ") || "(탭 없음)"}. 있는 탭: ${meta.tabs.map((x) => x.name).join(", ")}`);
          if (names.some((n) => n.includes(","))) throw new Error("탭 이름에 쉼표가 있으면 연결할 수 없습니다. 탭 이름을 바꿔 주세요.");
          const checked = await Promise.all(names.map((n) => inspectTab(id, n)));
          const blockers = checked.flatMap((c) => (!c.dates ? [`${c.tab}: 날짜 열을 못 찾음`] : c.dates.readable === 0 && c.data_rows > 0 ? [`${c.tab}: 날짜를 읽을 수 있는 행이 없음`] : []));
          if (blockers.length && !force) return { linked: false, reason: blockers, hint: "lead_sheet_write 로 머리글을 '등록일시' 등으로 고친 뒤 다시 연결하거나, 그대로 연결하려면 force:true.", tabs: checked };
          await save({ google_sheet_id: id, google_sheet_tab: names.join(", ") }); must(await db.from("projects").update({ has_lead_sheet: true }).eq("id", p.id).select("id"));
          return { project: p.name, linked: true, sheet_id: id, title: meta.title, tabs: checked, was: cur?.google_sheet_id ? { sheet_id: cur.google_sheet_id, tabs: cur.google_sheet_tab } : null, view: `${site}/app/projects/${p.id}` };
        },
      },
    });
  }

  /** JSON-RPC 메시지 하나를 처리한다. 알림(id 없음)은 null 을 돌려준다. */
  return async function handle(msg) {
    const { id, method, params } = msg ?? {};
    if (id === undefined || id === null) return null;
    const ok = (result) => ({ jsonrpc: "2.0", id, result });
    try {
      if (method === "initialize") return ok({ protocolVersion: params?.protocolVersion ?? "2025-06-18", capabilities: { tools: {} }, serverInfo: { name: "pixelpage-dash", version: "1.2.0" }, instructions: "픽셀페이지 대시보드(pixelpage.co.kr/app)의 클라이언트, 업무 관리, 고객사 정보를 읽고 고친다. 먼저 overview 로 현황과 id 를 확인한다. 날짜는 한국 시간 YYYY-MM-DD. 리드 구글 시트는 lead_sheet_inspect 로 점검하고 lead_sheet_link 로 연결한다." });
      if (method === "ping") return ok({});
      if (method === "tools/list") return ok({ tools: Object.entries(TOOLS).map(([name, t]) => ({ name, description: t.description, inputSchema: t.schema, annotations: { readOnlyHint: READ_ONLY.includes(name), destructiveHint: name === "db_delete", openWorldHint: false } })) });
      if (method === "tools/call") {
        const t = TOOLS[params?.name];
        if (!t) return { jsonrpc: "2.0", id, error: { code: -32602, message: `모르는 도구: ${params?.name}` } };
        try { const out = await t.run(params.arguments ?? {}); return ok({ content: [{ type: "text", text: typeof out === "string" ? out : JSON.stringify(out, null, 1) }] }); }
        catch (e) { return ok({ isError: true, content: [{ type: "text", text: `오류: ${e?.message ?? e}` }] }); }
      }
      return { jsonrpc: "2.0", id, error: { code: -32601, message: `지원하지 않는 요청: ${method}` } };
    } catch (e) { return { jsonrpc: "2.0", id, error: { code: -32603, message: String(e?.message ?? e) } }; }
  };
}
