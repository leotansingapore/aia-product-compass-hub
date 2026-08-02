import { describe, it, expect } from "vitest";
import { toReadableStream, readSseDeltas, edgeErrorMessage } from "./sseStream";

/**
 * Locks E2 finding #4: the product AI chat rendered nothing because
 * `supabase.functions.invoke()` returns a Response (not a ReadableStream) for
 * text/event-stream, so the `data instanceof ReadableStream` branch never ran.
 * The model call was still billed; the user just watched an empty bubble spin.
 */

function sseStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const c of chunks) controller.enqueue(encoder.encode(c));
      controller.close();
    },
  });
}

const delta = (text: string) => `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n`;

describe("toReadableStream", () => {
  it("returns the stream unchanged when given a ReadableStream", () => {
    const s = sseStream([]);
    expect(toReadableStream(s)).toBe(s);
  });

  it("extracts .body when given a Response — the shape invoke() actually returns", () => {
    const body = sseStream([delta("hi")]);
    const res = new Response(body, { headers: { "Content-Type": "text/event-stream" } });
    expect(toReadableStream(res)).toBeInstanceOf(ReadableStream);
  });

  it("returns null for a plain JSON object so the caller can fall through", () => {
    expect(toReadableStream({ message: "done" })).toBeNull();
  });

  it("returns null for null/undefined rather than throwing", () => {
    expect(toReadableStream(null)).toBeNull();
    expect(toReadableStream(undefined)).toBeNull();
  });
});

describe("readSseDeltas", () => {
  it("accumulates deltas and reports progressive text", async () => {
    const seen: string[] = [];
    const full = await readSseDeltas(sseStream([delta("Hello"), delta(" world")]), (t) => seen.push(t));
    expect(full).toBe("Hello world");
    expect(seen).toEqual(["Hello", "Hello world"]);
  });

  it("survives a chunk boundary splitting a single SSE line", async () => {
    const line = delta("split");
    const cut = Math.floor(line.length / 2);
    const full = await readSseDeltas(sseStream([line.slice(0, cut), line.slice(cut)]), () => {});
    expect(full).toBe("split");
  });

  it("ignores [DONE] and keepalive noise", async () => {
    const full = await readSseDeltas(sseStream([delta("a"), "data: [DONE]\n", "\n", ": ping\n"]), () => {});
    expect(full).toBe("a");
  });

  it("tolerates CRLF line endings", async () => {
    const full = await readSseDeltas(sseStream([delta("x").replace("\n", "\r\n")]), () => {});
    expect(full).toBe("x");
  });

  it("returns empty string for a stream with no content deltas (caller treats as failure)", async () => {
    const full = await readSseDeltas(sseStream(["data: [DONE]\n"]), () => {});
    expect(full).toBe("");
  });
});

describe("edgeErrorMessage", () => {
  it("surfaces the edge function's real message instead of the generic wrapper", async () => {
    const err = {
      message: "Edge Function returned a non-2xx status code",
      context: { json: async () => ({ error: "AI credits exhausted. Please add funds." }) },
    };
    expect(await edgeErrorMessage(err, "fallback")).toBe("AI credits exhausted. Please add funds.");
  });

  it("falls back when the body has no error field", async () => {
    const err = { message: "Edge Function returned a non-2xx status code", context: { json: async () => ({}) } };
    expect(await edgeErrorMessage(err, "fallback")).toBe("fallback");
  });

  it("keeps a specific non-wrapper message when there is no context body", async () => {
    expect(await edgeErrorMessage({ message: "Network request failed" }, "fallback")).toBe("Network request failed");
  });

  it("falls back when the body cannot be parsed", async () => {
    const err = { message: "Edge Function returned a non-2xx status code", context: { json: async () => { throw new Error("consumed"); } } };
    expect(await edgeErrorMessage(err, "fallback")).toBe("fallback");
  });
});
