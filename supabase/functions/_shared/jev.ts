// Jev, TypeSafe's judgment model (docs.typesafe.ai). It answers typed
// questions about a text (a yes/no probability, one pick from a list, a place
// on a rubric) and never writes words. Leo's rule (2026-09-21): anything in
// these apps that DECIDES (classify, detect, score, rank, route, pick) asks
// Jev, never an LLM prompt and never a keyword list; the LLM still writes the
// words. Leo switched it on for Content Studio on 2026-10-08.
//
// Raw fetch, so nothing joins the dependency list. Every caller must work
// when this returns null: no key on the deployment, a timeout, an outage.
// Jev reads English best; callers keep their own fallback for other text.
// Ported from ActivityTracker's _shared/jev.ts (same owner).

export type JevQuestion =
  | { type: "noul"; instructions: unknown; criteria?: { true?: unknown; false?: unknown } }
  | { type: "choice"; instructions: unknown; criteria: Record<string, unknown> }
  | { type: "score"; instructions: unknown; criteria: unknown[] };

export interface JevAnswer {
  type: "noul" | "choice" | "score";
  /** A Noul: the probability the answer is yes. */
  noul?: number;
  /** A Choice: the likeliest option. */
  choice?: string;
  /** A Score: the probability-weighted level. */
  score?: number;
  probabilities?: Record<string, number>;
  confidence?: number;
}

export const JEV_ENDPOINT = "https://api.typesafe.ai/v1/systemone";

/** Pinned: thresholds are read off this version's answers, and an alias would move them. */
export const JEV_MODEL = "jev-1.13.0";

/** About three times the slowest call ActivityTracker measured (1.5s over ~2,600 calls). */
export const JEV_TIMEOUT_MS = 5000;

type Env = { get(name: string): string | undefined };
declare const Deno: { env: Env } | undefined;

/**
 * The answers, or null when there are none to be had. `deps` exists for
 * tests; edge functions call it with questions only.
 */
export async function askJev(
  state: unknown,
  questions: Record<string, JevQuestion>,
  opts: { timeoutMs?: number; who?: string } = {},
  deps: { env?: Env; fetch?: typeof fetch } = {},
): Promise<Record<string, JevAnswer> | null> {
  const env = deps.env ?? (typeof Deno !== "undefined" ? Deno.env : undefined);
  const key = env?.get("TYPESAFE_API_KEY");
  const count = Object.keys(questions).length;
  if (!key || !count) return null;
  const who = opts.who ?? "unnamed";
  const started = Date.now();
  const failed = (reason: string): null => {
    console.warn(`jev: ${who}: ${reason} after ${Date.now() - started}ms (${count} questions); answered without Jev`);
    return null;
  };
  try {
    const res = await (deps.fetch ?? fetch)(JEV_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({ model: JEV_MODEL, state, questions }),
      signal: AbortSignal.timeout(opts.timeoutMs ?? JEV_TIMEOUT_MS),
    });
    if (!res.ok) return failed(`${res.status} ${(await res.text().catch(() => "")).slice(0, 120)}`.trim());
    const json = (await res.json().catch(() => null)) as { answers?: Record<string, JevAnswer> } | null;
    if (json?.answers && typeof json.answers === "object") return json.answers;
    return failed("a reply with no answers");
  } catch (e) {
    const timedOut = e instanceof Error && (e.name === "TimeoutError" || e.name === "AbortError");
    return failed(timedOut ? "timed out" : (e instanceof Error ? e.message : String(e)).slice(0, 120));
  }
}

const finite = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

/** A Noul's probability, or null when it did not come back as a number. */
export const noulOf = (answers: Record<string, JevAnswer> | null, id: string): number | null =>
  finite(answers?.[id]?.noul);

/** A Choice's pick, only when it is one of the offered options. */
export const choiceOf = <T extends string>(
  answers: Record<string, JevAnswer> | null,
  id: string,
  options: readonly T[],
): T | null => {
  const v = answers?.[id]?.choice;
  return typeof v === "string" && (options as readonly string[]).includes(v) ? (v as T) : null;
};

/** A Score's level, or null. */
export const scoreOf = (answers: Record<string, JevAnswer> | null, id: string): number | null =>
  finite(answers?.[id]?.score);

/**
 * Jev reads English best, so text written mostly in another script (Chinese,
 * Tamil, ...) keeps the caller's own path. shortcut: Malay or other Latin-script
 * languages pass this check; add a language check if they start showing up.
 */
export function mostlyLatin(text: string): boolean {
  const letters = text.match(/\p{L}/gu) ?? [];
  if (letters.length === 0) return false;
  const latin = text.match(/\p{Script=Latin}/gu) ?? [];
  return latin.length / letters.length >= 0.8;
}
