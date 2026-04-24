import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Input validation
    const formData = await req.json();
    
    if (!formData || typeof formData !== "object") {
      return new Response(
        JSON.stringify({ error: "Invalid request body - must be an object" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formDataStr = JSON.stringify(formData);
    if (formDataStr.length > 50000) {
      return new Response(
        JSON.stringify({ error: "Form data is too large (maximum 50,000 characters)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('Received form data for brand template generation');

    const prompt = `
You are an expert financial advisor brand consultant. Based on the following advisor profile data, generate a comprehensive personal brand template. Make it professional, specific, and actionable.

ADVISOR PROFILE DATA:
${JSON.stringify(formData, null, 2)}

Please generate a comprehensive personal brand template with the following sections:

1. EXECUTIVE SUMMARY
   - A 2-3 sentence professional bio
   - Core value proposition
   - Unique differentiator

2. BRAND POSITIONING
   - Target audience summary
   - Market positioning statement
   - Competitive advantages

3. MESSAGING FRAMEWORK
   - Mission statement
   - Value propositions (3-5 key points)
   - Elevator pitch (30-second version)
   - Key messages for different audiences

4. CONTENT THEMES
   - 5-7 content pillars for marketing
   - Sample social media posts
   - Blog post ideas

5. CLIENT COMMUNICATION GUIDE
   - Tone of voice guidelines
   - Key phrases to use
   - Communication preferences by audience

6. IMPLEMENTATION ROADMAP
   - 30-day action plan
   - 90-day milestones
   - Key metrics to track

7. MARKETING ASSETS NEEDED
   - Professional headshots requirements
   - Website content outline
   - Social media profile optimization
   - Business card messaging

Format the response as clean, professional content that can be easily copied and used. Use clear headings and bullet points. Be specific and actionable rather than generic.

Make sure to incorporate the advisor's specific personality traits, experience, target audiences, and chosen framework into every section.
`;

    console.log('Calling OpenAI API for brand template generation');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert financial advisor brand consultant specializing in creating comprehensive personal brand templates. Generate professional, specific, and actionable content.' 
          },
          { role: 'user', content: prompt }
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error details:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Successfully generated brand template');

    const brandTemplate = data.choices[0].message.content;

    return new Response(JSON.stringify({ brandTemplate }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-brand-template function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate brand template' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});