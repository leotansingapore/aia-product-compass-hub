// deno test --allow-env supabase/functions/_shared/openaiChat_test.ts
// The new model first; one retry on the caller's own body when refused or empty.
import { openaiChat, openaiFetch, OPENAI_MODEL } from "./openaiChat.ts";

const sent: Record<string, unknown>[] = [];
const urls: string[] = [];
let script: Response[] = [];
globalThis.fetch = ((u: string, init: RequestInit) => {
  urls.push(u);
  sent.push(JSON.parse(String(init.body)));
  return Promise.resolve(script.shift()!);
}) as typeof fetch;
const ok = (content: string) => Response.json({ model: "x", choices: [{ message: { content }, finish_reason: content ? "stop" : "length" }] });
const old = { model: "gpt-4o-mini", temperature: 0.2, max_tokens: 900, messages: [] };
const eq = (a: unknown, b: unknown, m: string) => {
  if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${m}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`);
};
const run = async (replies: Response[], body: Record<string, unknown> = old, opts = {}) => {
  sent.length = 0;
  script = replies;
  return await openaiChat(body, { key: "k", ...opts });
};

Deno.test("answers on the new model with reasoning parameters", async () => {
  const r = await run([ok("hi")]);
  eq((await r.json()).choices[0].message.content, "hi", "answer");
  eq(sent, [{ model: OPENAI_MODEL, messages: [], reasoning_effort: "low", max_completion_tokens: 4900 }], "body");
});

Deno.test("a refused model is retried once on the caller's body", async () => {
  const r = await run([new Response("model_not_found", { status: 404 }), ok("old")]);
  eq(sent[1], old, "retry body");
  eq((await r.json()).choices[0].message.content, "old", "answer");
});

Deno.test("an empty answer is retried once on the caller's body", async () => {
  await run([ok(""), ok("old")]);
  eq(sent.length, 2, "calls");
  eq(sent[1], old, "retry body");
});

Deno.test("a rate limit is not retried", async () => {
  const r = await run([new Response("slow down", { status: 429 })]);
  eq([sent.length, r.status], [1, 429], "one call, status kept");
});

Deno.test("a stream passes straight through", async () => {
  await run([new Response("data: x\n\n")], { ...old, stream: true }, { effort: "high" });
  eq([sent.length, sent[0].reasoning_effort, sent[0].stream], [1, "high", true], "stream");
});

Deno.test("a stream reaches the caller in whole lines, however the network cut it", async () => {
  const enc = new TextEncoder();
  const cut = new ReadableStream<Uint8Array>({
    start(c) {
      for (const part of ['data: {"a":', '1}\ndata: {"b"', ':2}\n', 'data: [DONE]\n']) c.enqueue(enc.encode(part));
      c.close();
    },
  });
  const r = await run([new Response(cut)], { ...old, stream: true });
  const reader = r.body!.getReader();
  const dec = new TextDecoder();
  const reads: string[] = [];
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    reads.push(dec.decode(value));
  }
  eq(reads.every((x) => x.endsWith("\n")), true, "every read ends on a line");
  eq(reads.join(""), 'data: {"a":1}\ndata: {"b":2}\ndata: [DONE]\n', "nothing lost");
});

Deno.test("a forced tool call is an answer, not an empty reply", async () => {
  const call = Response.json({ model: "x", choices: [{ message: { content: null, tool_calls: [{ id: "t" }] }, finish_reason: "stop" }] });
  await run([call], { ...old, tools: [{ type: "function" }], tool_choice: "auto" });
  eq([sent.length, sent[0].reasoning_effort], [1, "none"], "one call, tools on effort none");
});

Deno.test("openaiFetch sends the Lovable gateway as written and OpenAI through openaiChat", async () => {
  sent.length = 0;
  urls.length = 0;
  script = [ok("gw"), ok("oa")];
  const init = (model: string) => ({ method: "POST", headers: { Authorization: "Bearer k" }, body: JSON.stringify({ model, temperature: 0.3, messages: [] }) });
  await openaiFetch("https://ai.gateway.lovable.dev/v1/chat/completions", init("google/gemini-2.5-flash"));
  await openaiFetch("https://api.openai.com/v1/chat/completions", init("gpt-4o-mini"));
  eq(sent[0], { model: "google/gemini-2.5-flash", temperature: 0.3, messages: [] }, "gateway body untouched");
  eq(sent[1], { model: OPENAI_MODEL, messages: [], reasoning_effort: "low" }, "openai body on the new model");
});
