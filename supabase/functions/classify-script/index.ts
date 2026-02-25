import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CATEGORIES = [
  "cold-calling", "initial-text", "post-call-text", "callback", "follow-up", "ad-campaign",
  "referral", "confirmation", "faq", "tips"
];

const TARGET_AUDIENCES = [
  "general", "warm-market", "young-adult", "nsf", "working-adult",
  "parent", "pre-retiree", "hnw", "referral", "cold-lead"
];

const SCRIPT_ROLES = ["consultant", "va", "telemarketer"];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, content, context, existingCategories } = await req.json();
    if (!content?.trim()) {
      return new Response(JSON.stringify({ error: "Content is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // ── Servicing context: specialized classification ──────────────────────────
    const isServicing = context === "servicing";

    const existingCatList: string[] = Array.isArray(existingCategories) ? existingCategories : [];

    const systemPrompt = isServicing
      ? `You are a classifier for a financial advisory CLIENT SERVICING scripts database. These are templates used to communicate with existing clients — NOT for prospecting new ones.

Given a servicing script's title and content, determine:

1. **servicing_category** — A lowercase kebab-case slug for the servicing subcategory.

   PRIORITY ORDER — follow strictly:
   a) FIRST, check if any of these existing categories fit the script: ${existingCatList.length > 0 ? existingCatList.join(", ") : "(none yet)"}. If any of them fit even loosely, USE THAT ONE. Do NOT create a new category when an existing one fits.
   b) SECOND, check these standard categories if none of the existing ones fit: premium-payments, policy-services, new-business, claims, travel-insurance, annual-reviews, festive-greetings, referrals, general-education, texting-campaigns
   c) ONLY create a brand-new slug if the script clearly does not fit ANY of the above. New slugs should be specific (e.g. "surrender-policy", "nomination-update", "medical-card-replacement").
   
   A script about paying premiums, outstanding amounts, or payment reminders → use "premium-payments".
   A script about changing servicing agent, policy transfers, or admin changes → use "policy-services".
   A script about new policy applications or new business → use "new-business".

2. **script_role** — one of: consultant, va
   - consultant: the financial advisor sends/says this directly
   - va: a virtual assistant or admin sends this on behalf of the consultant

3. **tags** — 2-5 relevant lowercase tags describing the content. Good tags: authentication, cosa, transfer, healthshield, whatsapp, sms, phone-call, policy-transfer, owner-change, cpf, claims, premium, renewal, appointment, annual-review, referral-ask, birthday, festive, lapse, reinstatement, nomination, beneficiary, medical-card. Add 1-2 custom tags if strongly relevant.

4. **suggested_title** — A clear, concise title for this template (e.g. "Change of Servicing Agent (COSA)", "Premium Lapse Reminder"). If the title is already good, return it as-is.`

      : `You are a classifier for a financial advisory scripts database. Given a script's title and content, determine:

1. **category** — one of: ${CATEGORIES.join(", ")}
   - cold-calling: phone scripts or initial outreach messages for cold or warm contacts
   - initial-text: first contact text messages sent to new leads (e.g. after Facebook opt-in, voucher claim, or first outreach — NOT phone calls)
   - post-call-text: text/WhatsApp messages sent AFTER a phone call (e.g. post-call summaries, meeting confirmations, resources sent after speaking)
   - callback: actual phone call scripts for calling leads back (e.g. consultant callback after telemarketer sets appointment)
   - follow-up: ongoing follow-up messages (reminders, nudges, drip sequences) — NOT post-call texts or initial first-contact texts
   - ad-campaign: Facebook/Instagram ad scripts, lead gen campaigns
   - referral: asking for or handling referrals
   - confirmation: appointment confirmations
   - faq: FAQ answers, objection handling
   - tips: best practices, general advice

2. **target_audience** — one of: ${TARGET_AUDIENCES.join(", ")}
   - warm-market: people you already know — friends, family, acquaintances, ex-classmates
   - nsf: National Servicemen (18-20)
   - young-adult: 18-25 year olds
   - working-adult: 25-50 professionals
   - pre-retiree: 50-65, CPF/retirement focused
   - parent: families with children
   - hnw: high net worth individuals
   - referral: warm referral leads
   - cold-lead: unknown/cold leads
   - general: if none specifically applies

3. **script_role** — one of: ${SCRIPT_ROLES.join(", ")}
   - consultant: financial advisor speaks directly
   - va: virtual assistant / admin making calls
   - telemarketer: telemarketing team member

4. **tags** — 2-5 relevant lowercase tags from: voucher, ebook, recruitment, facebook-ad, instagram, whatsapp, sms, phone-call, cpf, retirement, savings, investment, insurance, passive-income, seminar, event, referral-ask, follow-up, appointment, objection, rebuttal, closing, opening, rapport, qualifying. You may add 1-2 custom tags if strongly relevant.

5. **suggested_title** — if the provided title is empty or generic, suggest a clear descriptive title (e.g. "Cold Calling — CPF Retirement Changes"). If the title is already good, return it as-is.`;

    // ── Tool schema (branched by context) ─────────────────────────────────────
    const toolParameters = isServicing
      ? {
          type: "object",
          properties: {
            servicing_category: { type: "string" },
            script_role: { type: "string", enum: ["consultant", "va"] },
            tags: { type: "array", items: { type: "string" } },
            suggested_title: { type: "string" },
          },
          required: ["servicing_category", "script_role", "tags", "suggested_title"],
          additionalProperties: false,
        }
      : {
          type: "object",
          properties: {
            category: { type: "string", enum: CATEGORIES },
            target_audience: { type: "string", enum: TARGET_AUDIENCES },
            script_role: { type: "string", enum: SCRIPT_ROLES },
            tags: { type: "array", items: { type: "string" } },
            suggested_title: { type: "string" },
          },
          required: ["category", "target_audience", "script_role", "tags", "suggested_title"],
          additionalProperties: false,
        };

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Title: ${title || "(none)"}\n\nScript content:\n${content.slice(0, 3000)}` },
        ],
        tools: [{
          type: "function",
          function: {
            name: "classify_script",
            description: "Classify a financial advisory script.",
            parameters: toolParameters,
          },
        }],
        tool_choice: { type: "function", function: { name: "classify_script" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI classification failed");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) throw new Error("No classification result");

    const result = JSON.parse(toolCall.function.arguments);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("classify-script error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
