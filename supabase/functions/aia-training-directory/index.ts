// aia-training-directory: AIA's 2026 L&D catalogue for the Post-RNF track.
//
// AIA marks the catalogue internal use only. Anything under src/ ships in a
// public JS chunk that anyone can download, and RequireTier is client-side
// only, so the catalogue lives here and is handed out after a server-side
// check of the same rule the route uses: post-rnf-track access or an admin.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { denied, identifyCaller } from "../_shared/caller-auth.ts";
import { directory } from "./directory.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FEATURE = "post-rnf-track";

/** Mirrors normalizeTier in src/lib/tiers.ts, including the legacy names. */
function normalizeTier(raw: string | null | undefined): string {
  if (raw === "level_1") return "papers_taker";
  if (raw === "level_2") return "post_rnf";
  return raw || "explorer";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const caller = await identifyCaller(req);
  if (!caller.userId) return denied(corsHeaders, "Sign in to view the training directory", 401);
  if (caller.roleLookupFailed) return denied(corsHeaders, "Could not check your access, try again", 503);

  if (!caller.isAdmin) {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { persistSession: false },
    });
    const { data: tierRow, error: tierError } = await admin
      .from("user_access_tiers")
      .select("tier_level")
      .eq("user_id", caller.userId)
      .maybeSingle();
    if (tierError) return denied(corsHeaders, "Could not check your access, try again", 503);

    const tier = normalizeTier(tierRow?.tier_level);
    if (tier !== "post_rnf") {
      // The static matrix grants the track to post_rnf only; tier_permissions
      // rows can widen it, exactly as useFeatureAccess unions them.
      const { data: grant, error: grantError } = await admin
        .from("tier_permissions")
        .select("tier_level")
        .eq("tier_level", tier)
        .eq("resource_id", FEATURE)
        .limit(1);
      if (grantError) return denied(corsHeaders, "Could not check your access, try again", 503);
      if (!grant?.length) return denied(corsHeaders, "The training directory is part of Post-RNF Training");
    }
  }

  return new Response(JSON.stringify(directory), {
    headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "private, max-age=300" },
  });
});
