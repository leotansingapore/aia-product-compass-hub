import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Identify the caller of an edge function from its Authorization header.
 *
 * Functions that hold the service-role key bypass RLS entirely, so any such
 * function that writes data MUST gate on this — otherwise the endpoint is a
 * public write API (the anon key ships in the browser bundle, so `verify_jwt`
 * alone proves nothing about who is calling).
 */
export interface CallerInfo {
  userId: string | null;
  /** From the verified token — never trust an email supplied in the body. */
  email: string | null;
  isAdmin: boolean;
  /**
   * True when the admin-role lookup itself failed, so `isAdmin: false` means
   * "unknown", not "no". Callers should return 503 rather than 403 — telling a
   * real admin they lack permission sends them chasing the wrong problem.
   */
  roleLookupFailed?: boolean;
}

export async function identifyCaller(req: Request): Promise<CallerInfo> {
  const authHeader = req.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return { userId: null, email: null, isAdmin: false };

  const url = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(url, serviceKey);

  // The anon key is itself a valid JWT, so this correctly yields no user for it.
  const { data, error } = await admin.auth.getUser(token);
  const userId = error ? null : data?.user?.id ?? null;
  const email = error ? null : data?.user?.email ?? null;
  if (!userId) return { userId: null, email: null, isAdmin: false };

  const { data: roles, error: rolesError } = await admin
    .from("user_admin_roles")
    .select("admin_role")
    .eq("user_id", userId);

  // Distinguish "not an admin" from "we could not find out". Swallowing the
  // error meant a transient hiccup demoted a real admin to a flat 403 across
  // ~18 functions, indistinguishable from a genuine refusal.
  if (rolesError) {
    console.error("identifyCaller: admin-role lookup failed", rolesError);
    return { userId, email, isAdmin: false, roleLookupFailed: true };
  }

  const isAdmin = (roles || []).some(
    (r: { admin_role: string }) => r.admin_role === "admin" || r.admin_role === "master_admin",
  );
  // `email` was computed above and then dropped from this return, so every
  // caller that trusted the token for identity (notably the feedback email)
  // reported the reporter as "Unknown".
  return { userId, email, isAdmin };
}

export function denied(corsHeaders: Record<string, string>, message: string, status = 403) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
