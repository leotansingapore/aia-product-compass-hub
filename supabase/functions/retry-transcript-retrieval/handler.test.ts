// deno test --allow-env --allow-read supabase/functions/retry-transcript-retrieval/handler.test.ts
// Fake database and function client; fetch answers only the Tavus conversation URL (anything else throws).
import { assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { handle } from "./handler.ts";

type Row = Record<string, unknown>;
const TRANSCRIPT = [
  { role: "system", content: "persona" },
  { role: "user", content: "I want to retire at 55." },
  { role: "assistant", content: "What worries you most?" },
];

function setup(opts: { savedEntries?: number; feedbackError?: string } = {}) {
  const inserts: Row[][] = [];
  const invokes: { name: string; body: unknown; headers: Record<string, string> }[] = [];
  const supabase = {
    from: (table: string) => {
      // deno-lint-ignore no-explicit-any
      const b: any = {
        select: () => b,
        eq: () => b,
        update: () => b,
        single: () => Promise.resolve({ data: { id: "s1", tavus_conversation_id: "c123" }, error: null }),
        insert: (rows: Row[]) => (inserts.push(rows), Promise.resolve({ error: null })),
        then: (ok: (v: unknown) => unknown) =>
          Promise.resolve(table === "conversation_transcripts" ? { count: opts.savedEntries ?? 0, error: null } : { error: null }).then(ok),
      };
      return b;
    },
    functions: {
      invoke: (name: string, o: { body: unknown; headers: Record<string, string> }) => {
        invokes.push({ name, ...o });
        return Promise.resolve({ data: null, error: opts.feedbackError ? { message: opts.feedbackError } : null });
      },
    },
  };
  globalThis.fetch = ((url: string) => {
    if (url !== "https://tavusapi.com/v2/conversations/c123") throw new Error(`unexpected fetch ${url}`);
    return Promise.resolve(Response.json({ transcript: TRANSCRIPT }));
  }) as typeof fetch;
  const call = () =>
    handle(new Request("https://x/retry-transcript-retrieval", {
      method: "POST",
      headers: { Authorization: "Bearer learner-jwt" },
      body: JSON.stringify({ sessionId: "s1" }),
    }), { supabase, tavusApiKey: "tavus-test-key" });
  return { call, inserts, invokes };
}

Deno.test("the retry starts feedback as the learner who pressed it", async () => {
  const t = setup();
  const res = await t.call();
  assertEquals(res.status, 200);
  assertEquals(t.invokes.length, 1);
  assertEquals(t.invokes[0].name, "generate-roleplay-feedback");
  assertEquals(t.invokes[0].headers.Authorization, "Bearer learner-jwt");
  assertEquals("x-internal-secret" in t.invokes[0].headers, false);
});

Deno.test("transcript rows are written once: a session that already has them gets no copies", async () => {
  const fresh = setup();
  await fresh.call();
  assertEquals(fresh.inserts.map((rows) => rows.length), [2]);

  const saved = setup({ savedEntries: 2 });
  await saved.call();
  assertEquals(saved.inserts.length, 0);
});

Deno.test("feedback that cannot be started is an error, not a success", async () => {
  const t = setup({ feedbackError: "Edge Function returned a non-2xx status code" });
  const res = await t.call();
  assertEquals(res.status, 502);
});
