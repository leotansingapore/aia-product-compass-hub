import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { scripts, mode, targetId, newVersion } = body;

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Mode: append-version — add a version to an existing script
    if (mode === "append-version" && targetId && newVersion) {
      const { data: existing, error: fetchErr } = await supabase
        .from("scripts")
        .select("versions")
        .eq("id", targetId)
        .single();
      if (fetchErr || !existing) {
        return new Response(JSON.stringify({ error: fetchErr?.message || "Script not found" }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const versions = Array.isArray(existing.versions) ? existing.versions : [];
      versions.push(newVersion);
      const { error: updateErr } = await supabase
        .from("scripts")
        .update({ versions, updated_at: new Date().toISOString() })
        .eq("id", targetId);
      if (updateErr) {
        return new Response(JSON.stringify({ error: updateErr.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ message: "Version appended", scriptId: targetId, totalVersions: versions.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!scripts || !Array.isArray(scripts) || scripts.length === 0) {
      return new Response(JSON.stringify({ error: "No scripts provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If mode is "add", skip the existing data check and just insert
    if (mode !== "add") {
      const { count } = await supabase
        .from("scripts")
        .select("*", { count: "exact", head: true });

      if (count && count > 0) {
        return new Response(JSON.stringify({ message: "Scripts already seeded", count }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Insert scripts
    const rows = scripts.map((s: any) => ({
      stage: s.stage,
      category: s.category,
      target_audience: s.target_audience || "general",
      script_role: s.script_role || "consultant",
      tags: s.tags || [],
      versions: s.versions,
      sort_order: Math.round(s.sort_order || 0),
    }));

    const { error, data } = await supabase.from("scripts").insert(rows).select("id");
    if (error) {
      console.error("Seed error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "Scripts seeded", count: data?.length || 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seed-scripts error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
