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
