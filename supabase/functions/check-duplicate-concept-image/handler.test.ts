// deno test --allow-env --allow-read supabase/functions/check-duplicate-concept-image/handler.test.ts
// Fake card table; fetch answers only OpenAI (anything else throws).
import { assert, assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { handle } from "./handler.ts";

Deno.env.set("OPENAI_API_KEY", "test-key");

const cards = (n: number) =>
  Array.from({ length: n }, (_, i) => ({ id: `c${i}`, title: `Card ${i}`, image_url: `https://img/${i}.png` }));

// The model answers "duplicate of <id>" when that card's image is in its batch, else "unique".
function setup(n: number, opts: { duplicateOf?: string; failBatch?: number; badId?: boolean } = {}) {
  let limit = Infinity;
  const supabase = {
    from: () => {
      // deno-lint-ignore no-explicit-any
      const b: any = {
        select: () => b, not: () => b, order: () => b,
        limit: (k: number) => ((limit = k), b),
        then: (ok: (v: unknown) => unknown) => Promise.resolve({ data: cards(n).slice(0, limit), error: null }).then(ok),
      };
      return b;
    },
  };
  const batches: string[][] = [];
  globalThis.fetch = ((url: string, init: RequestInit) => {
    if (url !== "https://api.openai.com/v1/chat/completions") throw new Error(`unexpected fetch ${url}`);
    const parts = JSON.parse(String(init.body)).messages[0].content as { type: string; image_url?: { url: string } }[];
    const shown = parts.filter((p) => p.type === "image_url").slice(1).map((p) => `c${p.image_url!.url.match(/(\d+)\.png/)![1]}`);
    const batch = batches.push(shown) - 1;
    if (batch === opts.failBatch) return Promise.resolve(new Response("rate limited", { status: 429 }));
    const hit = opts.duplicateOf && shown.includes(opts.duplicateOf);
    const args = hit
      ? { isDuplicate: true, isSimilar: false, similarity: 95, matchedCardId: opts.badId ? "c999" : opts.duplicateOf, matchedCardTitle: "x", reason: "same" }
      : { isDuplicate: false, isSimilar: false, similarity: 10, matchedCardId: "", matchedCardTitle: "", reason: "different" };
    return Promise.resolve(Response.json({
      model: "m",
      choices: [{ message: { content: null, tool_calls: [{ function: { arguments: JSON.stringify(args) } }] } }],
    }));
  }) as typeof fetch;
  const call = () =>
    handle(new Request("https://x", { method: "POST", body: JSON.stringify({ imageBase64: "data:image/png;base64,AAAA" }) }), { supabase });
  return { call, batches };
}

Deno.test("a duplicate of a card past the first eight is found", async () => {
  const t = setup(40, { duplicateOf: "c37" });
  const res = await t.call();
  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals([body.isDuplicate, body.matchedCardId], [true, "c37"]);
});

Deno.test("every card is compared once, in batches, up to the bound", async () => {
  const small = setup(40);
  await small.call();
  assertEquals(small.batches.flat().sort(), cards(40).map((c) => c.id).sort());
  assert(small.batches.every((b) => b.length <= 16), "a batch is too big");

  const large = setup(500);
  await large.call();
  assertEquals(large.batches.flat().length, 160);
});

Deno.test("one failed batch is an error, not a 'not a duplicate'", async () => {
  const t = setup(40, { failBatch: 1 });
  const res = await t.call();
  assertEquals(res.status, 502);
  const body = await res.json();
  assertEquals(body.isDuplicate, undefined);
  assert(String(body.error).includes("429"), body.error);
});

Deno.test("a match on a card the model was not shown is an error", async () => {
  const t = setup(20, { duplicateOf: "c3", badId: true });
  assertEquals((await t.call()).status, 502);
});

Deno.test("an empty library is honestly not a duplicate", async () => {
  const t = setup(0);
  const body = await (await t.call()).json();
  assertEquals([body.isDuplicate, t.batches.length], [false, 0]);
});
