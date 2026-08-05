import { toast } from "sonner";

export type AiChatRole = "user" | "assistant";

export type AiChatMessage = {
  role: AiChatRole;
  content: string;
};

type StreamArgs = {
  /** Edge function name, e.g. "scripts-chat" or "product-knowledge-chat". */
  fn: string;
  messages: AiChatMessage[];
  /** Extra body fields the specific function needs (mode, productId, ...). */
  body?: Record<string, unknown>;
  onDelta: (text: string) => void;
  signal?: AbortSignal;
};

/**
 * Reads an OpenAI-compatible SSE stream from a Supabase edge function.
 *
 * The framing is the fiddly part: a network chunk can split a `data:` line in
 * half, so a partial line has to be pushed back onto the buffer rather than
 * dropped, and whatever is left after the reader closes still has to be
 * drained. This mirrors the parser proven in ScriptsChatWidget.
 *
 * Returns false when the caller already saw a toast (rate limit / no credits)
 * so callers can bail quietly instead of double-reporting.
 */
export async function streamAiChat({
  fn,
  messages,
  body = {},
  onDelta,
  signal,
}: StreamArgs): Promise<boolean> {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${fn}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages, ...body }),
    signal,
  });

  if (!resp.ok || !resp.body) {
    if (resp.status === 429) {
      toast.error("Rate limit reached. Try again shortly.");
      return false;
    }
    if (resp.status === 402) {
      toast.error("AI credits exhausted. Please top up.");
      return false;
    }
    throw new Error(`Assistant request failed (${resp.status})`);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let done = false;

  const emit = (line: string): "done" | "retry" | "ok" => {
    if (line.startsWith(":") || line.trim() === "") return "ok";
    if (!line.startsWith("data: ")) return "ok";
    const json = line.slice(6).trim();
    if (json === "[DONE]") return "done";
    try {
      const parsed = JSON.parse(json);
      const content = parsed.choices?.[0]?.delta?.content as string | undefined;
      if (content) onDelta(content);
      return "ok";
    } catch {
      return "retry";
    }
  };

  while (!done) {
    const { done: streamDone, value } = await reader.read();
    if (streamDone) break;
    buffer += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buffer.indexOf("\n")) !== -1) {
      let line = buffer.slice(0, idx);
      const rest = buffer.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      const r = emit(line);
      if (r === "retry") {
        // Incomplete JSON: put the line back and wait for more bytes.
        break;
      }
      buffer = rest;
      if (r === "done") {
        done = true;
        break;
      }
    }
  }

  for (let raw of buffer.split("\n")) {
    if (raw.endsWith("\r")) raw = raw.slice(0, -1);
    emit(raw);
  }

  return true;
}
