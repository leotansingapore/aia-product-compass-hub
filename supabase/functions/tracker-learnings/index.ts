// tracker-learnings — learner progress for Activity Tracker's Team CRM.
//
// The tracker (a different Supabase project) shows an advisor's academy
// progress on the Learnings tab of their CRM dossier. Its users have no
// session here, so this is the seam: one shared secret, one read-only RPC, no
// write path, no user input that reaches SQL.
//
// The caller is the tracker's own `academy-learnings` edge function — never a
// browser. That function is the one that checks the manager is a manager; this
// one only checks the secret, so the secret must never reach client code.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type, x-tracker-secret",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

/** Constant-time compare so a wrong secret leaks nothing through timing. */
function secretMatches(given: string, expected: string): boolean {
  if (given.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < given.length; i++) diff |= given.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST" && req.method !== "GET") {
    return json({ error: "Method not allowed" }, 405);
  }

  const expected = Deno.env.get("TRACKER_LEARNINGS_SECRET");
  if (!expected) {
    console.error("TRACKER_LEARNINGS_SECRET is not set");
    return json({ error: "Service configuration error" }, 500);
  }

  const given = req.headers.get("x-tracker-secret") ?? "";
  if (!secretMatches(given, expected)) {
    console.warn("tracker-learnings: rejected a call with a bad or missing secret");
    return json({ error: "Unauthorized" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    console.error("Missing Supabase configuration");
    return json({ error: "Service configuration error" }, 500);
  }

  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });
  const { data, error } = await admin.rpc("get_tracker_learnings");
  if (error) {
    console.error("get_tracker_learnings failed:", error.message);
    return json({ error: "Failed to load learner progress" }, 502);
  }

  return json(data ?? { rows: [], totals: null });
});
