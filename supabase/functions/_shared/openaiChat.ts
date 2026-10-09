// One OpenAI Chat Completions call on the current model, with a single retry on
// the body exactly as the caller wrote it (its older `model`, `temperature` and
// `max_tokens`) when this project's key refuses the new model or a parameter.
// A bad model id is a logged warning and the old answer, never an outage.
// Roll back or move on without a deploy: `supabase secrets set OPENAI_MODEL=<id>`
// (hgdbflprrficdoyxmdxe is shared with content-studio; the secret moves both repos).

export const OPENAI_MODEL = Deno.env.get("OPENAI_MODEL") || "gpt-6-luna";

const URL = "https://api.openai.com/v1/chat/completions";

// Reasoning tokens are spent out of max_completion_tokens, and a reasoning model
// that uses the whole budget thinking returns EMPTY text, so the old cap gets this on top.
const REASONING_HEADROOM = 4000;

// The chatbots split each network read on "\n" and parse every piece, so an SSE frame
// cut across two reads was silently dropped (words missing mid-answer). Hand them whole lines.
function wholeLines(res: Response): Response {
  if (!res.ok || !res.body) return res;
  const dec = new TextDecoder();
  const enc = new TextEncoder();
  let buf = "";
  const body = res.body.pipeThrough(new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, ctl) {
      buf += dec.decode(chunk, { stream: true });
      const cut = buf.lastIndexOf("\n") + 1;
      if (cut) {
        ctl.enqueue(enc.encode(buf.slice(0, cut)));
        buf = buf.slice(cut);
      }
    },
    flush(ctl) {
      if (buf) ctl.enqueue(enc.encode(buf));
    },
  }));
  return new Response(body, { status: res.status, headers: res.headers });
}

export async function openaiChat(
  body: Record<string, unknown>,
  opts: { effort?: "none" | "low" | "medium" | "high"; signal?: AbortSignal; key?: string } = {},
): Promise<Response> {
  const key = opts.key ?? Deno.env.get("OPENAI_API_KEY");
  const post = (b: Record<string, unknown>) =>
    fetch(URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(b),
      signal: opts.signal,
    });
  // Reasoning models reject `temperature` and `max_tokens`.
  const { temperature: _t, max_tokens, ...rest } = body;
  const res = await post({
    ...rest,
    model: OPENAI_MODEL,
    // Chat Completions refuses function tools with any effort but "none" on gpt-6-luna.
    reasoning_effort: body.tools ? "none" : opts.effort ?? "low",
    ...(typeof max_tokens === "number" ? { max_completion_tokens: max_tokens + REASONING_HEADROOM } : {}),
  });
  if (res.ok && body.stream) {
    console.log(`openai: streaming from ${OPENAI_MODEL}`);
    return wholeLines(res);
  }
  if (res.ok) {
    const data = await res.json();
    const choice = data?.choices?.[0];
    // A forced tool call answers in tool_calls with null content; that is an answer too.
    if (choice?.message?.content || choice?.message?.tool_calls?.length) {
      console.log(`openai: answered by ${data.model}`);
      return Response.json(data);
    }
    console.warn(`openai: ${OPENAI_MODEL} returned no text (finish_reason ${choice?.finish_reason}); retrying once on ${body.model}`);
    return await post(body);
  }
  if (![400, 403, 404].includes(res.status)) return res;
  console.warn(`openai: ${OPENAI_MODEL} refused (${res.status} ${(await res.text()).slice(0, 300)}); retrying once on ${body.model}`);
  return body.stream ? wholeLines(await post(body)) : await post(body);
}

// Drop-in for fetch(): a Chat Completions request goes through openaiChat with the key
// the caller put in its header; any other URL (the Lovable gateway) is sent as before.
export function openaiFetch(url: string, init: RequestInit & { body: string }): Promise<Response> {
  if (url !== URL) return fetch(url, init);
  const key = new Headers(init.headers).get("Authorization")?.replace(/^Bearer\s+/i, "");
  return openaiChat(JSON.parse(init.body), { key, signal: init.signal ?? undefined });
}
