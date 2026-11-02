// deno test --allow-env --allow-read supabase/functions/generate-roleplay-feedback/handler.test.ts
// Fake database, fake email, and a fetch that answers only OpenAI (any other URL throws).
import { assert, assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { OPENAI_MODEL } from "../_shared/openaiChat.ts";
import { type Deps, handle } from "./handler.ts";

type Row = Record<string, unknown>;
const SECRET = "internal-test-secret";

function fakeDb(tables: Record<string, Row[]>) {
  const writes: { table: string; op: string; row: Row }[] = [];
  const from = (table: string) => {
    let op = "select";
    let row: Row = {};
    const where: [string, unknown][] = [];
    const rows = () => (tables[table] ??= []).filter((r) => where.every(([k, v]) => r[k] === v));
    const run = () => {
      if (op === "insert") tables[table].push({ ...row });
      if (op === "update") for (const r of rows()) Object.assign(r, row);
      if (op !== "select") writes.push({ table, op, row });
      return { data: op === "select" ? rows() : null, error: null };
    };
    // deno-lint-ignore no-explicit-any
    const b: any = {
      select: () => b,
      eq: (k: string, v: unknown) => (where.push([k, v]), b),
      insert: (r: Row) => ((op = "insert"), (row = r), b),
      update: (r: Row) => ((op = "update"), (row = r), b),
      maybeSingle: () => Promise.resolve({ data: rows()[0] ?? null, error: null }),
      single: () => Promise.resolve(rows()[0] ? { data: rows()[0], error: null } : { data: null, error: { message: "none" } }),
      then: (ok: (v: unknown) => unknown, bad: (e: unknown) => unknown) => Promise.resolve(run()).then(ok, bad),
    };
    return b;
  };
  return { from, writes, tables };
}

const session = {
  id: "s1",
  user_id: "u1",
  scenario_title: "Retirement gap",
  scenario_category: "discovery",
  scenario_difficulty: "medium",
  transcript: [{ role: "user", content: "Hi, I want to retire at 55." }, { role: "assistant", content: "What worries you most?" }],
};

const METRICS = {
  scores: { smallTalk: 4, activeListening: 3, painPointIdentification: 2, productKnowledge: 3, objectionHandling: 4, communication: 2 },
  rubricFeedback: { smallTalk: { score: 4, explanation: "x", status: "4/5", insights: "- y" } },
};
const QUALITATIVE = {
  strengths: { title: "Warm opener", content: "You opened well." },
  growthAreas: [{ title: "Quantify the gap", content: "Ask for numbers." }],
  specificFeedback: "Solid discovery.",
  coachingPoints: ["Ask about cashflow"],
  followUpQuestions: ["What did they fear?"],
  conversationFlowSummary: ["Opened", "Asked goal"],
  practiceScore: "2",
};
const ADVANCED = {
  toneAnalysis: { descriptors: ["warm", "confident", "concise"], detailedAnalysis: "Tone held." },
  visualPresence: { descriptors: ["still", "open", "engaged"], detailedAnalysis: "Not evidenced in transcript (text-only)." },
  pronunciationFeedback: { summary: "Clear.", detailedAnalysis: "Chunk numbers." },
};

type Mode = "ok" | "fail" | Row;
const kindOf = (prompt: string) =>
  prompt.includes("FINANCE-SPECIFIC RUBRIC") ? "metrics" : prompt.includes("Yoodli-style") ? "qualitative" : "advanced";
const answers = { metrics: METRICS, qualitative: QUALITATIVE, advanced: ADVANCED };

function setup(modes: Partial<Record<"metrics" | "qualitative" | "advanced", Mode>> = {}, existing?: Row, gate?: Promise<void>) {
  const db = fakeDb({
    roleplay_sessions: [{ ...session }],
    roleplay_feedback: existing ? [{ session_id: "s1", ...existing }] : [],
  });
  const calls: { model: string; kind: string; body: Row; signal: unknown }[] = [];
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    if (url !== "https://api.openai.com/v1/chat/completions") throw new Error(`unexpected fetch ${url}`);
    const body = JSON.parse(String(init.body));
    const kind = kindOf(body.messages[0].content) as keyof typeof answers;
    calls.push({ model: body.model, kind, body, signal: init.signal });
    if (gate) await gate;
    const mode = modes[kind] ?? "ok";
    if (mode === "fail") return new Response("upstream down", { status: 500 });
    const content = JSON.stringify(mode === "ok" ? answers[kind] : mode);
    return Response.json({ model: body.model, choices: [{ message: { content }, finish_reason: "stop" }] });
  }) as typeof fetch;
  const work: Promise<unknown>[] = [];
  const emails: Row[] = [];
  const deps: Deps = {
    supabase: db,
    identifyCaller: () => Promise.resolve({ userId: null, email: null, isAdmin: false }),
    internalSecret: SECRET,
    waitUntil: (p) => work.push(p),
    emailOwner: (_s, fb) => (emails.push(fb), Promise.resolve()),
  };
  const call = (headers: Record<string, string> = { "x-internal-secret": SECRET }) =>
    handle(new Request("https://x/generate-roleplay-feedback", { method: "POST", headers, body: JSON.stringify({ sessionId: "s1" }) }), deps);
  const feedback = () => db.tables.roleplay_feedback[0];
  return { db, calls, work, emails, call, feedback };
}

Deno.test("answers before the model does and hands the work to waitUntil", async () => {
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  const t = setup({}, undefined, gate);
  const res = await Promise.race([t.call(), new Promise<"hung">((r) => setTimeout(() => r("hung"), 1000))]);
  assert(res !== "hung", "the response waited for the model");
  assertEquals((await (res as Response).json()).status, "processing");
  assertEquals(t.work.length, 1);
  assertEquals(t.feedback().generation_status, "generating");
  release();
  await Promise.all(t.work);
  assertEquals(t.feedback().generation_status, "completed");
});

Deno.test("all three calls go through the shared helper: current model, JSON mode, a timeout", async () => {
  const t = setup();
  await t.call();
  await Promise.all(t.work);
  assertEquals(t.calls.map((c) => c.kind).sort(), ["advanced", "metrics", "qualitative"]);
  for (const c of t.calls) {
    assertEquals(c.model, OPENAI_MODEL);
    assertEquals(c.body.response_format, { type: "json_object" });
    assert(c.signal instanceof AbortSignal, "no timeout signal");
  }
});

Deno.test("a full success stores the real scores and emails the owner once", async () => {
  const t = setup();
  await t.call();
  await Promise.all(t.work);
  const fb = t.feedback();
  assertEquals(fb.generation_status, "completed");
  assertEquals([fb.small_talk_score, fb.communication_score, fb.overall_score, fb.practice_score], [4, 2, 3, 2]);
  assertEquals(fb.specific_feedback, "Solid discovery.");
  assertEquals(t.emails.length, 1);
});

Deno.test("all three calls failing marks the row failed, with no placeholder scores and no email", async () => {
  const t = setup({ metrics: "fail", qualitative: "fail", advanced: "fail" });
  await t.call();
  await Promise.all(t.work);
  const fb = t.feedback();
  assertEquals(fb.generation_status, "failed");
  assertEquals([fb.overall_score, fb.communication_score, fb.practice_score], [0, 0, null]);
  assertEquals(t.emails.length, 0);
});

Deno.test("the scores call failing alone still fails the row: the page cannot show feedback without scores", async () => {
  const t = setup({ metrics: "fail" });
  await t.call();
  await Promise.all(t.work);
  assertEquals(t.feedback().generation_status, "failed");
  assertEquals(t.emails.length, 0);
});

Deno.test("a scores answer with a missing or out-of-range score fails the row", async () => {
  const t = setup({ metrics: { scores: { ...METRICS.scores, communication: 9 } } });
  await t.call();
  await Promise.all(t.work);
  assertEquals(t.feedback().generation_status, "failed");
});

Deno.test("qualitative and advanced failing keep the real scores and leave only their sections empty", async () => {
  const t = setup({ qualitative: "fail", advanced: "fail" });
  await t.call();
  await Promise.all(t.work);
  const fb = t.feedback();
  assertEquals(fb.generation_status, "completed");
  assertEquals([fb.small_talk_score, fb.overall_score], [4, 3]);
  assertEquals([fb.specific_feedback, fb.practice_score, fb.coaching_points, fb.pronunciation_feedback], ["", null, null, null]);
  assertEquals([fb.strengths, fb.improvement_areas, fb.tone_analysis, fb.visual_presence_analysis], [[], [], [], []]);
  assertEquals(t.emails.length, 1);
});

Deno.test("a failed row is retried in place", async () => {
  const t = setup({}, { id: "f1", generation_status: "failed", overall_score: 0 });
  await t.call();
  await Promise.all(t.work);
  assertEquals(t.db.tables.roleplay_feedback.length, 1);
  assertEquals(t.db.writes.filter((w) => w.op === "insert").length, 0);
  assertEquals(t.feedback().generation_status, "completed");
});

Deno.test("a completed row is left alone", async () => {
  const t = setup({}, { id: "f1", generation_status: "completed", overall_score: 4 });
  const body = await (await t.call()).json();
  assertEquals(body.existing, true);
  assertEquals([t.work.length, t.calls.length, t.db.writes.length], [0, 0, 0]);
});

Deno.test("an anonymous caller without the internal secret is still refused", async () => {
  const t = setup();
  const res = await t.call({});
  assertEquals(res.status, 401);
  assertEquals([t.work.length, t.calls.length], [0, 0]);
});
