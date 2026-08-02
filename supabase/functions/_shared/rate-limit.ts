import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Throttle for PUBLIC pre-session endpoints (the login form calls them before
 * a session exists, so authentication is not an option and rate limiting is
 * the control).
 *
 * Fails CLOSED: if the limiter itself errors we deny rather than wave the
 * caller through, because these endpoints are an enumeration oracle and a
 * password-guessing proxy respectively.
 */
export interface RateLimitRule {
  endpoint: string;
  /** Max attempts allowed inside the window, per identifier. */
  max: number;
  windowMinutes: number;
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function callerIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    (req.headers.get("x-forwarded-for") || "").split(",")[0].trim() ||
    "unknown"
  );
}

/**
 * Records the attempt and returns whether the caller is over any limit.
 * Check both the email and the IP so neither a single account nor a single
 * host can be hammered.
 */
export async function isRateLimited(
  req: Request,
  rule: RateLimitRule,
  email: string | null | undefined,
): Promise<boolean> {
  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    await admin.rpc("prune_auth_endpoint_rate_limits");

    const since = new Date(Date.now() - rule.windowMinutes * 60_000).toISOString();
    const identifiers: Array<{ kind: "email" | "ip"; value: string }> = [
      { kind: "ip", value: callerIp(req) },
    ];
    if (email) identifiers.push({ kind: "email", value: email });

    for (const { kind, value } of identifiers) {
      const hash = await sha256(value);
      const { count, error } = await admin
        .from("auth_endpoint_rate_limits")
        .select("id", { count: "exact", head: true })
        .eq("endpoint", rule.endpoint)
        .eq("identifier_kind", kind)
        .eq("identifier_hash", hash)
        .gte("attempted_at", since);

      // Fail closed — a broken limiter must not reopen the oracle.
      if (error) {
        console.error("rate-limit check failed", error);
        return true;
      }
      if ((count ?? 0) >= rule.max) return true;

      await admin.from("auth_endpoint_rate_limits").insert({
        endpoint: rule.endpoint,
        identifier_kind: kind,
        identifier_hash: hash,
      });
    }

    return false;
  } catch (e) {
    console.error("rate-limit exception", e);
    return true;
  }
}

export function tooManyRequests(corsHeaders: Record<string, string>) {
  return new Response(
    JSON.stringify({ error: "Too many attempts. Please wait a few minutes and try again." }),
    { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}
