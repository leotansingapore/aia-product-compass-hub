/**
 * Extract a human-readable message from a `supabase.functions.invoke` error.
 *
 * When an edge function returns a non-2xx status (e.g. 402 credits exhausted,
 * 429 rate limited), the client throws a FunctionsHttpError whose `message` is
 * the generic "Edge Function returned a non-2xx status code" — the real reason
 * lives in the JSON body of `error.context` (a Response). Read it defensively
 * so those messages actually reach the user.
 */
export async function functionsErrorMessage(error: unknown, fallback: string): Promise<string> {
  try {
    const ctx = (error as { context?: Response } | null | undefined)?.context;
    if (ctx && typeof ctx.json === 'function') {
      // Clone so a body already being read elsewhere doesn't throw.
      const body = typeof ctx.clone === 'function' ? await ctx.clone().json() : await ctx.json();
      const msg = body?.error ?? body?.message;
      if (typeof msg === 'string' && msg.trim()) return msg;
    }
  } catch {
    // Body missing or not JSON — fall through to the fallback.
  }
  return fallback;
}
