/**
 * `supabase.functions.invoke()` does NOT hand back a ReadableStream for a
 * `text/event-stream` response — it returns the whole `Response` object
 * (see @supabase/functions-js: `data = response` for that content type).
 *
 * Call sites that checked `data instanceof ReadableStream` therefore matched
 * nothing, took no branch, threw no error, and left the assistant bubble
 * permanently empty while the upstream model call was still billed.
 */
export function toReadableStream(data: unknown): ReadableStream<Uint8Array> | null {
  if (data instanceof ReadableStream) return data;
  if (typeof Response !== "undefined" && data instanceof Response) return data.body;
  // Some transports hand back an object that merely carries a body stream.
  const body = (data as { body?: unknown } | null)?.body;
  if (body instanceof ReadableStream) return body;
  return null;
}

/**
 * Reads an OpenAI-style SSE stream, invoking `onDelta` with each new token.
 * Returns the accumulated text. Tolerates chunk boundaries splitting a line.
 */
export async function readSseDeltas(
  stream: ReadableStream<Uint8Array>,
  onDelta: (fullText: string) => void,
): Promise<string> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    // Keep the trailing partial line in the buffer for the next chunk.
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const rawLine of lines) {
      const line = rawLine.replace(/\r$/, "");
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6);
      if (payload === "[DONE]") continue;
      try {
        const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content;
        if (delta) {
          full += delta;
          onDelta(full);
        }
      } catch {
        // Partial or non-JSON keepalive line — ignore.
      }
    }
  }

  return full;
}

/**
 * supabase-js wraps non-2xx edge responses in a FunctionsHttpError whose
 * `message` is the generic "Edge Function returned a non-2xx status code",
 * hiding the specific 402 "credits exhausted" / 429 "rate limited" body the
 * function took care to send. Pull the real message out when present.
 */
export async function edgeErrorMessage(error: unknown, fallback: string): Promise<string> {
  const context = (error as { context?: { json?: () => Promise<unknown> } } | null)?.context;
  try {
    const body = (await context?.json?.()) as { error?: string } | undefined;
    if (body?.error) return body.error;
  } catch {
    // Body already consumed or not JSON — fall through.
  }
  const message = (error as { message?: string } | null)?.message;
  return message && !message.includes("non-2xx") ? message : fallback;
}
