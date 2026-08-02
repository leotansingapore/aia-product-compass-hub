import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { identifyCaller, denied } from "../_shared/caller-auth.ts";

/**
 * Real user suspension.
 *
 * "Suspend user" used to write `user_approval_requests.status = 'suspended'`
 * and nothing else — and it was skipped entirely for accounts with no approval
 * request (everyone an admin created directly). Nothing in the sign-in path
 * ever read that column, so a "suspended" learner kept full access.
 *
 * Suspension now goes through GoTrue's ban, which makes
 * `signInWithPassword` fail and invalidates the refresh token, so an already
 * signed-in session dies at its next refresh.
 *
 * Actions:
 *   set  (default) — { userId, suspended }  ban / unban one account
 *   list           — returns the ids of every currently-banned account, so the
 *                    admin directory can show the TRUE state instead of the
 *                    approval-request record.
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/** GoTrue takes a duration string; ~100 years is the conventional "forever". */
const BAN_FOREVER = "876000h";
const UNBAN = "none";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    const caller = await identifyCaller(req);
    if (!caller.userId) return denied(corsHeaders, "Unauthorized", 401);
    if (!caller.isAdmin) return denied(corsHeaders, "Admin role required", 403);

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    const body = await req.json().catch(() => ({}));
    const action: string = body?.action ?? "set";

    if (action === "list") {
      const suspended: string[] = [];
      const now = Date.now();
      for (let page = 1; page <= 50; page++) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
        if (error) return json({ error: error.message }, 500);
        for (const u of data.users) {
          const bannedUntil = (u as { banned_until?: string | null }).banned_until;
          if (bannedUntil && Date.parse(bannedUntil) > now) suspended.push(u.id);
        }
        if (data.users.length < 200) break;
      }
      return json({ success: true, suspended_user_ids: suspended });
    }

    const userId: string = body?.userId;
    const suspended: boolean = body?.suspended === true;
    if (!userId || typeof userId !== "string") {
      return json({ error: "userId is required" }, 400);
    }

    // An admin locking themselves out is never the intent, and it would take
    // the ability to undo it away with the same call.
    if (userId === caller.userId) {
      return denied(corsHeaders, "You cannot suspend your own account", 400);
    }

    const { data: targetRoles, error: rolesError } = await admin
      .from("user_admin_roles")
      .select("admin_role")
      .eq("user_id", userId);
    if (rolesError) return json({ error: "Failed to check target roles" }, 500);

    if ((targetRoles || []).some((r: { admin_role: string }) => r.admin_role === "master_admin")) {
      return denied(corsHeaders, "Master administrators cannot be suspended", 403);
    }

    const { data: updated, error: updateError } = await admin.auth.admin.updateUserById(userId, {
      ban_duration: suspended ? BAN_FOREVER : UNBAN,
    });
    if (updateError) return json({ error: updateError.message }, 400);

    // Keep the directory's recorded status in step when there is a row to
    // record it on. Accounts created directly have none — the ban above is the
    // real state either way, so this is a mirror, not the mechanism.
    const email = updated.user?.email;
    if (email) {
      const { data: request } = await admin
        .from("user_approval_requests")
        .select("id, status")
        .eq("email", email)
        .maybeSingle();

      if (request) {
        const nextStatus = suspended
          ? "suspended"
          : request.status === "suspended"
            ? "active"
            : request.status;
        if (nextStatus !== request.status) {
          await admin.from("user_approval_requests").update({ status: nextStatus }).eq("id", request.id);
        }
      }
    }

    console.log(
      `${suspended ? "Suspended" : "Restored"} ${userId} (${email ?? "no email"}) by admin ${caller.userId}`,
    );

    return json({
      success: true,
      userId,
      suspended,
      banned_until: (updated.user as { banned_until?: string | null } | null)?.banned_until ?? null,
    });
  } catch (e) {
    console.error("admin-set-user-suspension error", e);
    return json({ error: (e as Error)?.message || "Unexpected error" }, 500);
  }
});
