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
  const prompt = `You are an expert sales coach and QA evaluator analyzing a roleplay conversation between a Seller and a Prospect. Your job is to score six core competencies and provide concise, evidence-backed coaching.

SCENARIO CONTEXT
- Title: ${session.scenario_title}
- Category: ${session.scenario_category}
- Difficulty: ${session.scenario_difficulty}

CONVERSATION TRANSCRIPT
${conversationText}

OUTPUT RULES (CRITICAL)
- Return ONLY a valid JSON object matching the structure below. No prose, no markdown, no comments.
- Use integers 1–5 for scores. If a competency is not demonstrated at all, set score to 0 and set status to "Missed".
- For nonzero scores, set status to "<score>/5" (e.g., "3/5").
- In each explanation, cite 1–3 specific, brief quotes from the transcript with turn indices (e.g., "S3: '…'" where S3 is Seller turn 3, or "P2: '…'" Prospect turn 2). If turns aren't labeled, use your best 1–N indexing from top to bottom and label as T1, T2, etc.
- "insights" must be 2–4 actionable bullet points, each including a strong alternative line the Seller could have used.
- Do not invent information not present in the transcript. If information is missing, state "Not evidenced in transcript."

SCORING RUBRIC (ANCHORS)
Score each competency independently using these anchors. Calibrate with the transcript's length and difficulty.

0 (Missed): Not attempted or no evidence.
1 (Poor): Attempts present but counterproductive or off-target; harms flow; major misses.
2 (Weak): Inconsistent or surface-level; occasional relevance; limited impact.
3 (Adequate): Meets baseline; generally correct; some missed opportunities.
4 (Strong): Consistently effective; minor gaps; advances the sale.
5 (Excellent): High mastery; precise, timely, and adaptive; materially improves outcomes.

COMPETENCY DEFINITIONS (WHAT TO LOOK FOR)
1) Small Talk (Rapport & Warmth)
   - Opens warmly, finds common ground, transitions smoothly to business.
   - Avoids overlong chit-chat; keeps relevance and pace.

2) Active Listening (Acknowledge & Build)
   - Reflects and labels ("Sounds like…", "What I'm hearing is…"), asks follow-ups that build on buyer's words, confirms understanding.

3) Pain Point Identification (Discovery Quality)
   - Uses layered, specific questions (problem → impact → root cause → priority → timeline), quantifies stakes, confirms success criteria.

4) Product Knowledge (Solution Clarity & Fit)
   - Explains how features map to stated pains, articulates benefits and proof, avoids inaccuracies or vague claims.

5) Objection Handling (Professionalism & Resolution)
   - Surfaces and normalizes concerns, isolates, addresses with evidence, checks for resolution, advances next step.

6) Communication (Clarity, Structure, Professional Tone)
   - Clear, concise, well-paced; avoids jargon unless defined; maintains confident, collaborative tone; good turn-taking.

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
  const prompt = `You are an expert sales coach generating Yoodli-style feedback on a Seller–Prospect roleplay.

SCENARIO CONTEXT
- Title: ${session.scenario_title}
- Category: ${session.scenario_category}
- Difficulty: ${session.scenario_difficulty}

CONVERSATION TRANSCRIPT
${conversationText}

OUTPUT RULES (CRITICAL)
- Return ONLY a valid JSON object matching the structure below. No prose, no markdown, no comments.
- Do not add, remove, or rename keys. Do not include trailing commas.
- Use exact conversation quotes with turn indices in square brackets (e.g., "[S3] …" for Seller turn 3, "[P2] …" for Prospect turn 2). If turns aren't labeled, index top-to-bottom as [T1], [T2], etc.
- If a point is not evidenced in the transcript, explicitly write: "Not evidenced in transcript."
- Keep a coaching tone (second person, concise, constructive). Avoid speculating about facts not present.

YOODLI-STYLE HALLMARKS TO REFLECT
- Evidence-based: short quotes + turn indices.
- Actionable: alternatives that are specific, role-play-ready, and context-tied.
- Balanced: strengths first, then growth with clear next steps.
- Conversational mechanics: note pacing, turn-taking, question depth, and objection handling when evidenced.

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
  const prompt = `You are an expert communication coach producing Yoodli-style feedback on advanced presentation skills from a Seller–Audience roleplay.

SCENARIO CONTEXT
- Title: ${session.scenario_title}
- Category: ${session.scenario_category}
- Difficulty: ${session.scenario_difficulty}

CONVERSATION TRANSCRIPT
${conversationText}

OUTPUT RULES (CRITICAL)
- Return ONLY a valid JSON object matching the structure below. No prose, no markdown, no comments.
- Do not add, remove, or rename keys. No trailing commas. Strings must be valid JSON strings.
- Use 3–6 descriptors in each "descriptors" array, chosen ONLY from the descriptor taxonomies below.
- Cite 2–4 verbatim quotes in each detailed analysis section, with turn indices in brackets:
  - If roles exist: "[S3] …" for Seller turn 3, "[A2] …" for Audience turn 2.
  - If roles aren't labeled: "[T1] …", "[T2] …" top-to-bottom.
- If timestamps exist (e.g., 00:01:23), append them after the index like "[S3 00:01:23]".
- If a signal (tone/visual/pronunciation) is not evidenced in a text-only transcript, write "Not evidenced in transcript (text-only)." and provide cautious, generalizable recommendations.
- Do not fabricate metrics or timestamps. If a metric (e.g., WPM) isn't derivable from text, state: "Not measurable from transcript."

DESCRIPTOR TAXONOMY (USE ONLY THESE)
- Tone descriptors: encouraging, confident, neutral, warm, empathetic, assertive, concise, rushed, tentative, verbose, defensive, dismissive, abrasive, condescending, collaborative, consultative, persuasive, skeptical, disengaged, enthusiastic, monotone.
- Visual presence descriptors: grounded, open, closed, animated, static, tense, relaxed, expansive, contained, purposeful, fidgety, upright, slouched, pacing, still, engaged, distracted, professional, casual.

CONTENT REQUIREMENTS & LENGTH TARGETS
- "toneAnalysis.detailedAnalysis" (120–200 words): Map tone evolution (opening → middle → close), explain audience impact, and alignment with scenario difficulty. Include 2–4 quotes with indices/timestamps if available. End with 1–2 actionable micro-techniques (e.g., "headline → reason → proof", "2-beat pause before the ask").
- "visualPresence.detailedAnalysis" (120–200 words): Infer body language ONLY from explicit cues (e.g., "(pauses)", "[laughs]", "camera off", "(sigh)"), meta-comments, or content implying delivery. If none present, write "Not evidenced in transcript (text-only)." Provide 2–3 precise recommendations (e.g., "anchor feet", "gesture framing at chest level", "eye contact 3–5s per participant").
- "pronunciationFeedback.summary" (1–2 sentences): Plain-language assessment of intelligibility and consistency; avoid accent judgements.
- "pronunciationFeedback.detailedAnalysis" (120–180 words): Cover clarity, pacing (WPM if measurable; else "Not measurable from transcript"), emphasis, and American English patterns (word stress, vowel reduction, linking, /θ/–/ð/, final consonant voicing, intonation contours). Include 2–3 concrete drills (e.g., minimal pairs, sentence-stress ladder, chunk-and-pause on numbers).

EVIDENCE & INFERENCE GUARDRAILS
- Quotes must be verbatim substrings from the transcript. Do not invent wording.
- Scale claims when the transcript is short or one-sided, and state constraints explicitly.
- Focus on observable, coachable behaviors; avoid personality attributions.

RETURN EXACTLY THIS JSON SHAPE
{
  "toneAnalysis": {
    "descriptors": ["disengaged", "abrasive", "condescending"],
    "detailedAnalysis": "Multi-paragraph analysis explaining tone evolution throughout conversation with specific quotes and timestamps where possible. Explain how tone changed and its impact."
  },
  "visualPresence": {
    "descriptors": ["focused", "reserved", "tense", "static"],
    "detailedAnalysis": "Multi-paragraph analysis of body language and presence with specific behavioral observations. Include recommendations for improvement."
  },
  "pronunciationFeedback": {
    "summary": "Brief assessment of speech clarity",
    "detailedAnalysis": "Comprehensive paragraph with specific recommendations for speech clarity, pacing, emphasis, and American English pronunciation patterns with examples."
  }
}

VALIDATION CHECKS
- If no evidence for a section due to text-only input, explicitly state: "Not evidenced in transcript (text-only)."
- Use only descriptors from the taxonomies. If nothing is evidenced, set descriptors to ["Not evidenced in transcript"].
- Keep tone second-person, balanced, and Yoodli-style: evidence-based + actionable.`;

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