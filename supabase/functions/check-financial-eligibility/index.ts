import { isRateLimited, tooManyRequests } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FINANCIAL_APP_ENDPOINT = "https://dmvbzkushldwfxuipjxe.supabase.co/functions/v1/verify-academy-eligibility";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // This relays a credential check to the Financial app using OUR server-side
    // API key, so upstream sees a single trusted caller and cannot throttle the
    // real attacker. Without this limit the endpoint is a free, unauthenticated
    // brute-force front-end for that password database.
    if (await isRateLimited(req, { endpoint: "check-financial-eligibility", max: 8, ipMax: 200, windowMinutes: 15 }, email)) {
      return tooManyRequests(corsHeaders);
    }

    const financialApiKey = Deno.env.get("FINANCIAL_APP_API_KEY");
    
    if (!financialApiKey) {
      console.error("FINANCIAL_APP_API_KEY not configured");
      return new Response(
        JSON.stringify({ eligible: false, reason: "Service not configured" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Checking Financial app eligibility for:", email);

    const response = await fetch(FINANCIAL_APP_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": financialApiKey,
      },
      body: JSON.stringify({ 
        email: email.trim().toLowerCase(),
        password: password  // Forward password for verification
      }),
    });

    const result = await response.json();
    console.log("Financial app response:", { status: response.status, result });

    return new Response(
      JSON.stringify(result),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error checking eligibility:", error);
    return new Response(
      JSON.stringify({ eligible: false, reason: "Failed to check eligibility" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
