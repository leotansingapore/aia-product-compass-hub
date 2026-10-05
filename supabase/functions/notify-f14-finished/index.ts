// Posts a card to the recruiting team's Lark group when an Explorer finishes
// First 14 Days. The learner's page calls this right after the Day 14 write;
// everything about who counts is decided here, from the database.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { buildMessages, skipReason } from "./card.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const ADMIN_URL = "https://academy.finternship.com/learning-track/admin/first-14-days";
const LAST_DAY = 14;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

// Lark answers HTTP 200 with a non-zero code when it refuses a message.
async function post(hook: string, payload: unknown): Promise<boolean> {
  try {
    const res = await fetch(hook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const out = await res.json().catch(() => ({}));
    const code = out.code ?? out.StatusCode ?? 0;
    if (!res.ok || code !== 0) {
      console.error("lark refused", res.status, JSON.stringify(out));
      return false;
    }
    return true;
  } catch (e) {
    console.error("lark post error", e);
    return false;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const hook = Deno.env.get("LARK_F14_WEBHOOK");
  if (!hook) return json({ sent: false, reason: "LARK_F14_WEBHOOK not set" });

  const url = Deno.env.get("SUPABASE_URL")!;
  const authClient = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: userRes, error: userErr } = await authClient.auth.getUser();
  if (userErr || !userRes.user) return json({ error: "Unauthorized" }, 401);
  const uid = userRes.user.id;

  const db = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const [progress, tier, profile, isAdmin, isMaster] = await Promise.all([
    db.from("first_14_days_progress").select("quiz_passed_at").eq("user_id", uid).eq("day_number", LAST_DAY).maybeSingle(),
    db.from("user_access_tiers").select("tier_level").eq("user_id", uid).maybeSingle(),
    db.from("profiles").select("display_name, first_name, last_name, email").eq("user_id", uid).maybeSingle(),
    authClient.rpc("has_role", { _user_id: uid, _role: "admin" }),
    authClient.rpc("has_role", { _user_id: uid, _role: "master_admin" }),
  ]);
  const failed = [progress, tier, profile].find((r) => r.error);
  if (failed) {
    console.error("lookup failed", failed.error);
    return json({ error: "lookup failed" }, 500);
  }

  const p = profile.data;
  const learner = {
    name: [p?.first_name, p?.last_name].filter(Boolean).join(" ") || p?.display_name || "",
    email: p?.email ?? userRes.user.email ?? null,
    tier: tier.data?.tier_level ?? null,
    isAdmin: Boolean(isAdmin.data || isMaster.data),
    finishedAt: progress.data?.quiz_passed_at ?? null,
  };
  // ponytail: a learner can re-call this inside the 2-minute window and repost
  // their own card; add a notified_at column if that ever happens.
  const reason = skipReason(learner, Date.now());
  if (reason) return json({ sent: false, reason });

  const { card, text } = buildMessages(learner, ADMIN_URL);
  const sent =
    (await post(hook, { msg_type: "interactive", card })) ||
    (await post(hook, { msg_type: "text", content: { text } }));
  return json({ sent }, sent ? 200 : 502);
});
