import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { sessionId } = await req.json();

    console.log('Generating feedback for session:', sessionId);

    // Get session details with transcript
    const { data: session, error: sessionError } = await supabase
      .from('roleplay_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      console.error('Session not found:', sessionError);
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!session.transcript || !Array.isArray(session.transcript)) {
      console.error('No transcript available for session:', sessionId);
      return new Response(JSON.stringify({ error: 'No transcript available' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Format transcript for analysis
    const conversationText = session.transcript
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .map(msg => `${msg.role === 'user' ? 'USER' : 'AI_TRAINER'}: ${msg.content}`)
      .join('\n');

    // Generate feedback using three specialized prompts
    const [metricsResult, qualitativeResult, advancedResult] = await Promise.all([
      generateMetricsFeedback(conversationText, session, openAIApiKey),
      generateQualitativeFeedback(conversationText, session, openAIApiKey),
      generateAdvancedFeedback(conversationText, session, openAIApiKey)
    ]);

    // Combine all feedback
    const comprehensiveFeedback = {
      // Core metrics (1-5 scores)
      overall_score: Math.round(Object.values(metricsResult.scores).reduce((a, b) => a + b, 0) / Object.keys(metricsResult.scores).length),
      communication_score: metricsResult.scores.communication,
      active_listening_score: metricsResult.scores.activeListening,
      objection_handling_score: metricsResult.scores.objectionHandling,
      product_knowledge_score: metricsResult.scores.productKnowledge,
      small_talk_score: metricsResult.scores.smallTalk,
      pain_point_identification_score: metricsResult.scores.painPointIdentification,
      
      // Enhanced fields
      practice_score: parseInt(qualitativeResult.practiceScore) || 1,
      detailed_rubric_feedback: metricsResult.rubricFeedback || {},
      conversation_flow_summary: qualitativeResult.conversationFlowSummary || [],
      body_language_analysis: advancedResult.visualPresence?.detailedAnalysis || null,
      tone_detailed_analysis: advancedResult.toneAnalysis?.detailedAnalysis || null,
      
      // Original qualitative analysis (restructured)
      strengths: qualitativeResult.strengths ? [qualitativeResult.strengths.content] : [],
      improvement_areas: qualitativeResult.growthAreas?.map(area => area.title + ': ' + area.content) || [],
      specific_feedback: qualitativeResult.specificFeedback,
      coaching_points: qualitativeResult.coachingPoints,
      follow_up_questions: qualitativeResult.followUpQuestions,
      conversation_summary: qualitativeResult.conversationFlowSummary?.join(' ') || null,
      
      // Advanced analytics (simplified for compatibility)
      tone_analysis: advancedResult.toneAnalysis?.descriptors || [],
      visual_presence_analysis: advancedResult.visualPresence?.descriptors || [],
      pronunciation_feedback: advancedResult.pronunciationFeedback?.detailedAnalysis || null
    };

    // Store feedback in database
    const { error: insertError } = await supabase
      .from('roleplay_feedback')
      .insert({
        session_id: sessionId,
        ...comprehensiveFeedback
      });

    if (insertError) {
      console.error('Error storing feedback:', insertError);
      return new Response(JSON.stringify({ error: 'Failed to store feedback' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Successfully generated and stored comprehensive feedback for session:', sessionId);

    return new Response(JSON.stringify({ 
      success: true, 
      feedback: comprehensiveFeedback 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-roleplay-feedback function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateMetricsFeedback(conversationText: string, session: any, openAIApiKey: string) {
  const prompt = `You are an expert financial advisor coach evaluating a seller-prospect conversation using personal finance domain expertise. Use the 5-point rubric with finance-specific anchors.

CONTEXT
- Scenario: ${session.scenario_title}
- Category: ${session.scenario_category}  
- Difficulty: ${session.scenario_difficulty}

CONVERSATION TRANSCRIPT (apply redaction rules before quoting)
${conversationText}

OUTPUT RULES (CRITICAL)
- Return ONLY a valid JSON object matching the structure below. No prose, no markdown, no comments.
- Use integers 1–5 for scores. If a competency is not demonstrated at all, set score to 0 and set status to "Missed".
- For nonzero scores, set status to "<score>/5" (e.g., "3/5").
- In each explanation, cite 1–3 specific, brief quotes from the transcript with turn indices (e.g., "S3: '…'" where S3 is Seller turn 3, or "P2: '…'" Prospect turn 2). If turns aren't labeled, use your best 1–N indexing from top to bottom and label as T1, T2, etc.
- "insights" must be 2–4 actionable bullet points, each including a strong alternative line the Seller could have used.
- Do not invent information not present in the transcript. If information is missing, state "Not evidenced in transcript."

FINANCE-SPECIFIC RUBRIC (1-5 scale):

**Small Talk & Rapport Building**
1: No rapport, jumps to products
2: Basic pleasantries, feels scripted
3: Natural opener, shows interest in person vs portfolio
4: Builds trust through shared experiences/values about money
5: Authentic connection - client feels heard before any financial discussion

**Active Listening** 
1: Interrupts, doesn't acknowledge client concerns
2: Waits to speak but misses emotional cues about money
3: Reflects basic financial goals, asks follow-ups
4: Catches unstated concerns about risk/fees/liquidity
5: Deep empathy - addresses money fears and life-stage anxieties

**Pain Point Identification** (Finance Discovery Ladder)
2: Basic goal ("want to retire") without quantifying gap or timeline
3: Surfaces 2-3 specifics (savings rate, horizon, risk preference)
4: Quantifies gap with math (needs vs assets vs time); confirms success criteria
5: Multi-layer discovery: cashflow → protection → investing → timeline → tradeoffs; gains commitment

**Product Knowledge**
1: Factual errors about financial products/regulations
2: Basic product features, can't explain benefits
3: Good product knowledge, handles standard questions
4: Deep expertise - connects features to life-stage needs
5: Masters positioning - shows how product solves discovered financial gaps

**Objection Handling** (Finance-specific)
2: Generic responses to fees/performance concerns
3: Normalizes concern, provides evidence, partial resolution check
4: Isolates ("Other than fees..."), shows value math/risk framing, explicit check
5: Reframes to outcomes & constraints; contrasts alternatives (DIY/ETF/insurer) fairly

**Communication & Closing** (Compliance-aware)
Penalize: implied guarantees, fear-mongering, pushing complex products
Reward: disclaimers, plain analogies, numerical summaries, clear next steps
1: Poor communication, no next steps
2: Adequate explanation, vague follow-up
3: Clear communication with logical next steps
4: Persuasive with educational value and clear action plan
5: Builds conviction while maintaining compliance - client eager to proceed

CRITICAL INSTRUCTIONS:
- Use exactly 3 descriptors per section from the finance taxonomy
- Include 2-3 verbatim quotes with turn indices [S3], [P2] 
- Apply PII redaction: [NAME], [COMPANY], [ID••••], [EMAIL], [PHONE••••]
- Keep financial amounts and timelines (they're instructive)
- Score based on transcript evidence only

EVIDENCE & FEEDBACK REQUIREMENTS
- Explanations: 60–120 words each. Include 1–3 quotes with turn indices.
- Insights: 2–4 bullets with concrete "try this instead" lines (verbatim example sentences).
- If the transcript is short or incomplete, scale expectations and explicitly note constraints.

RETURN EXACTLY THIS JSON SHAPE
{
  "scores": {
    "smallTalk": number,
    "activeListening": number,
    "painPointIdentification": number,
    "productKnowledge": number,
    "objectionHandling": number,
    "communication": number
  },
  "rubricFeedback": {
    "smallTalk": {
      "score": number,
      "explanation": "Detailed explanation with specific examples and turn-indexed quotes",
      "status": "Missed" | "1/5" | "2/5" | "3/5" | "4/5" | "5/5",
      "insights": "- Bullet 1 with an alternative line\n- Bullet 2 with an alternative line"
    },
    "activeListening": {
      "score": number,
      "explanation": "…",
      "status": "Missed" | "1/5" | "2/5" | "3/5" | "4/5" | "5/5",
      "insights": "- …\n- …"
    },
    "painPointIdentification": {
      "score": number,
      "explanation": "…",
      "status": "Missed" | "1/5" | "2/5" | "3/5" | "4/5" | "5/5",
      "insights": "- …\n- …"
    },
    "productKnowledge": {
      "score": number,
      "explanation": "…",
      "status": "Missed" | "1/5" | "2/5" | "3/5" | "4/5" | "5/5",
      "insights": "- …\n- …"
    },
    "objectionHandling": {
      "score": number,
      "explanation": "…",
      "status": "Missed" | "1/5" | "2/5" | "3/5" | "4/5" | "5/5",
      "insights": "- …\n- …"
    },
    "communication": {
      "score": number,
      "explanation": "…",
      "status": "Missed" | "1/5" | "2/5" | "3/5" | "4/5" | "5/5",
      "insights": "- …\n- …"
    }
  }
}

VALIDATION GUARDRAILS
- No trailing commas. Keys must match exactly. All scores are integers.
- If a competency is 0, explanation must state why it was "Not evidenced in transcript."
- Do not output anything before or after the JSON object.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function generateQualitativeFeedback(conversationText: string, session: any, openAIApiKey: string) {
  const prompt = `You are a financial advisor communication coach providing Yoodli-style feedback. Focus on evidence-based observations with finance-specific coaching techniques.

SCENARIO CONTEXT
- Title: ${session.scenario_title}
- Category: ${session.scenario_category}
- Difficulty: ${session.scenario_difficulty}

CONVERSATION TRANSCRIPT (apply redaction before quoting)
${conversationText}

PERSONAL FINANCE COACHING FOCUS:
- Discovery Quality: Did they use the finance discovery ladder (cashflow → protection → goals → constraints)?
- Objection Mastery: Fee/value, liquidity/lock-in, DIY vs product, past experiences
- Compliance Awareness: Avoid guarantees, appropriate disclaimers, educational tone
- Micro-techniques: Quantify-the-gap, isolate & close, number chunking with pauses

OUTPUT RULES (CRITICAL)
- Return ONLY valid JSON - no prose, markdown, or comments
- Support observations with verbatim quotes using turn indices [S3], [P2]
- Apply PII redaction: [NAME], [COMPANY], [ID••••], [EMAIL], [PHONE••••]
- Keep financial amounts and timelines (instructive for coaching)
- Include 2-3 concrete drills per growth area
- Use second person ("You...")

ANALYSIS STRUCTURE:
1. **Strengths**: Quote-supported effective techniques
2. **Growth Areas**: Specific alternatives with finance micro-techniques
3. **Specific Feedback**: Evidence-based conversation flow observations
4. **Coaching Points**: 2-3 drills per area (behavioral, repeatable)
5. **Follow-up Questions**: Missed finance discovery opportunities
6. **Conversation Flow**: Phase analysis with finance-specific effectiveness

FIELD-BY-FIELD CONTENT GUIDELINES
- "strengths":
  - "title": 2–5 words summarizing the strongest theme (e.g., "Clear Problem Framing").
  - "content": 80–120 words. Include 1–2 quotes with indices (e.g., "[S4] '…'") showing what worked and why it mattered.
- "growthAreas":
  - Include 3–5 items.
  - Each "title": 3–7 words (imperative, e.g., "Go deeper on impact").
  - Each "content": 90–140 words with 1–2 quotes diagnosing the gap and a mini playbook (what to do next time).
  - "alternatives": Provide 1–3 Original/Alternative pairs as strings in alternating order, starting with "Original:" then "Alternative:". Example:
    [
      "Original: 'Can you share more?'",
      "Alternative: 'What breaks today when onboarding 10 reps next quarter?'"
    ]
- "specificFeedback":
  - 120–200 words synthesizing performance across opening → discovery → positioning → objections → close. Include 2–3 short quotes with indices.
- "coachingPoints":
  - 3–5 bullets. Each starts with a verb and ends with a concrete behavior or example line (no generic advice).
- "followUpQuestions":
  - 3–4 reflective questions that force recall of moments and intent (not yes/no).
- "conversationFlowSummary":
  - 3–6 bullets, each 6–12 words, capturing key beats chronologically. Reference indices when helpful (e.g., "[P5] budget concern surfaces").
- "practiceScore":
  - A string "1", "2", or "3" ONLY, using these anchors:
    - "1" = Limited practice value: short/incomplete flow, few coachable moments.
    - "2" = Moderate practice value: some depth, clear improvements identified.
    - "3" = High practice value: rich dialogue enabling targeted drills.

VALIDATION GUARDRAILS
- Quotes must be verbatim substrings from the transcript. If unavailable, write "Not evidenced in transcript."
- Do not invent metrics (e.g., talk ratio) unless explicitly calculable. If not calculable: "Not measurable from transcript."
- Keep alternatives context-specific to the scenario; avoid generic templates.
- If the transcript is very short, scale claims and state constraints in "specificFeedback".

RETURN EXACTLY THIS JSON SHAPE
{
  "strengths": {
    "title": "Strength",
    "content": "Detailed paragraph with specific examples of what was done well"
  },
  "growthAreas": [
    {
      "title": "Area title (e.g., 'Engage in small talk')",
      "content": "Detailed explanation with specific examples and actionable suggestions",
      "alternatives": [
        "Original: 'what was said'",
        "Alternative: 'better approach with specific example'"
      ]
    }
  ],
  "specificFeedback": "Comprehensive paragraph analyzing overall performance with specific conversation examples",
  "coachingPoints": [
    "• Specific actionable coaching recommendation with examples",
    "• Another coaching point with context"
  ],
  "followUpQuestions": [
    "Thought-provoking self-reflection question about performance",
    "Question about strategy and approach"
  ],
  "conversationFlowSummary": [
    "• First key moment or interaction",
    "• Second significant event", 
    "• Final outcome or conclusion"
  ],
  "practiceScore": "A score from 1-3 representing overall practice effectiveness"
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function generateAdvancedFeedback(conversationText: string, session: any, openAIApiKey: string) {
  const prompt = `You are an expert financial advisory communication coach producing advanced presentation skills feedback with personal finance domain expertise.

SCENARIO CONTEXT
- Title: ${session.scenario_title}
- Category: ${session.scenario_category}
- Difficulty: ${session.scenario_difficulty}

CONVERSATION TRANSCRIPT (apply redaction rules before quoting)
${conversationText}

PERSONAL FINANCE PRESENTATION FOCUS:
- Tone evolution through discovery → positioning → objections → close
- Compliance-aware communication (no guarantees, appropriate disclaimers)
- Numbers delivery (pause before/after amounts, confirm understanding)
- Trust-building through financial empathy and expertise demonstration

OUTPUT RULES (CRITICAL)
- Return ONLY valid JSON - no prose, markdown, or comments
- Use exactly 3 descriptors per section from taxonomies below
- Apply PII redaction: [NAME], [COMPANY], [ID••••], [EMAIL], [PHONE••••]
- Keep financial amounts and timelines (instructive)
- Include 2-3 verbatim quotes with turn indices [S3], [P2]
- If timestamps exist: [S3 00:01:23]
- State "Not evidenced in transcript (text-only)" if no evidence available

DESCRIPTOR TAXONOMY (EXACTLY 3 FROM THESE):
- Tone: encouraging, confident, neutral, warm, empathetic, assertive, concise, rushed, tentative, verbose, defensive, dismissive, abrasive, condescending, collaborative, consultative, persuasive, skeptical, disengaged, enthusiastic, monotone
- Visual presence: grounded, open, closed, animated, static, tense, relaxed, expansive, contained, purposeful, fidgety, upright, slouched, pacing, still, engaged, distracted, professional, casual

LENGTH TARGETS & FINANCE MICRO-TECHNIQUES:
- "toneAnalysis.detailedAnalysis" (120-200 words): Map tone evolution through financial conversation phases. Include quotes. End with 2 finance micro-techniques (e.g., "2-beat pause before numbers", "Quantify-the-gap worksheet", "Isolate & Close objection loop").
- "visualPresence.detailedAnalysis" (120-200 words): Infer from explicit cues only. If none: "Not evidenced in transcript (text-only)." Provide 2-3 finance-specific recommendations (e.g., "open posture during risk discussion", "gesture framing for number explanation").
- "pronunciationFeedback.summary" (1-2 sentences): Neutral English standard (intelligibility-first), no US-accent bias.
- "pronunciationFeedback.detailedAnalysis" (120-180 words): Include 2-3 finance-specific drills (e.g., "chunk-and-pause on policy numbers", "sentence stress on key financial terms", "clear articulation of percentage figures").

EVIDENCE & INFERENCE GUARDRAILS
- Quotes must be verbatim substrings from the transcript. Do not invent wording.
- Scale claims when the transcript is short or one-sided, and state constraints explicitly.
- Focus on observable, coachable behaviors; avoid personality attributions.

RETURN EXACTLY THIS JSON SHAPE:
{
  "toneAnalysis": {
    "descriptors": ["exactly", "three", "descriptors"],
    "detailedAnalysis": "Multi-paragraph analysis with financial context, quotes with turn indices, and 2 finance micro-techniques."
  },
  "visualPresence": {
    "descriptors": ["exactly", "three", "descriptors"], 
    "detailedAnalysis": "Evidence-based analysis or 'Not evidenced in transcript (text-only)' with finance-specific recommendations."
  },
  "pronunciationFeedback": {
    "summary": "Brief neutral English assessment",
    "detailedAnalysis": "Comprehensive analysis with finance-specific pronunciation drills and techniques."
  }
}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}