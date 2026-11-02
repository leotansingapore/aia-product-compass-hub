import { denied, type CallerInfo } from '../_shared/caller-auth.ts';
import { openaiChat } from '../_shared/openaiChat.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Each of the three calls gets this long, primary model and fallback together.
const MODEL_TIMEOUT_MS = 60_000;

const SCORE_KEYS = [
  'smallTalk', 'activeListening', 'painPointIdentification',
  'productKnowledge', 'objectionHandling', 'communication',
] as const;

export interface Deps {
  // deno-lint-ignore no-explicit-any
  supabase: any;
  identifyCaller: (req: Request) => Promise<CallerInfo>;
  internalSecret?: string;
  // Keeps the isolate alive for work that finishes after the response (EdgeRuntime.waitUntil).
  waitUntil: (work: Promise<unknown>) => void;
  // "Feedback ready" email to the session owner; only called once a row is completed.
  // deno-lint-ignore no-explicit-any
  emailOwner: (session: any, feedback: Record<string, any>) => Promise<void>;
}

export async function handle(req: Request, deps: Deps): Promise<Response> {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { supabase } = deps;
    const { sessionId } = await req.json();

    // Each invocation costs 3 OpenAI calls and emails the session owner, so an
    // anonymous caller must not be able to trigger it for an arbitrary session.
    // Two legitimate callers: the tavus-webhook (server-to-server, presents the
    // internal secret) and the session's own owner (user JWT).
    const internalSecret = deps.internalSecret;
    const presentedSecret = req.headers.get('x-internal-secret') ?? '';
    const isInternalCall = !!internalSecret && presentedSecret === internalSecret;

    if (!isInternalCall) {
      const caller = await deps.identifyCaller(req);
      if (!caller.userId) {
        return denied(corsHeaders, 'Sign in to generate feedback', 401);
      }
      const { data: owned, error: ownerErr } = await supabase
        .from('roleplay_sessions')
        .select('user_id')
        .eq('id', sessionId)
        .maybeSingle();
      // Fail closed, and do not distinguish "not yours" from "not found" —
      // that difference is itself a session-id oracle.
      if (ownerErr || !owned || (owned.user_id !== caller.userId && !caller.isAdmin)) {
        return denied(corsHeaders, 'Roleplay session not found', 404);
      }
    }

    console.log('Generating feedback for session:', sessionId);

    // Check if feedback already exists. A failed attempt is retried in place;
    // a completed or in-progress one is left alone.
    const { data: existingFeedback } = await supabase
      .from('roleplay_feedback')
      .select('id, generation_status')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (existingFeedback && existingFeedback.generation_status !== 'failed') {
      console.log('Feedback already exists for session:', sessionId);
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'Feedback already generated',
        existing: true
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

    if (!session.transcript || !Array.isArray(session.transcript) || session.transcript.length === 0) {
      console.error('❌ No transcript available for session:', sessionId, {
        hasTranscript: !!session.transcript,
        isArray: Array.isArray(session.transcript),
        length: session.transcript?.length || 0,
        recordingStatus: session.recording_status,
        conversationId: session.tavus_conversation_id
      });

      // Attempt to fetch transcript from Tavus API as fallback
      if (session.tavus_conversation_id) {
        console.log('🔄 Attempting fallback transcript retrieval from Tavus API');

        try {
          const tavusApiKey = Deno.env.get('TAVUS_API_KEY');
          if (tavusApiKey) {
            console.log('📡 Fetching from Tavus API:', session.tavus_conversation_id);

            const tavusResponse = await fetch(
              `https://tavusapi.com/v2/conversations/${session.tavus_conversation_id}`,
              {
                headers: {
                  'x-api-key': tavusApiKey,
                  'Content-Type': 'application/json'
                }
              }
            );

            if (tavusResponse.ok) {
              const data = await tavusResponse.json();
              console.log('📥 Tavus API response structure:', Object.keys(data));

              // Try multiple possible transcript locations
              let transcript = data.transcript ||
                              data.conversation?.transcript ||
                              data.messages ||
                              data.conversation?.messages ||
                              data.recording?.transcript;

              if (transcript && Array.isArray(transcript) && transcript.length > 0) {
                console.log('✅ Successfully retrieved transcript from Tavus API:', transcript.length, 'messages');

                // Update session with retrieved transcript
                const { error: updateError } = await supabase
                  .from('roleplay_sessions')
                  .update({
                    transcript: transcript,
                    recording_status: 'completed',
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', sessionId);

                if (updateError) {
                  console.error('❌ Failed to update session with fallback transcript:', updateError);
                } else {
                  console.log('✅ Session updated with fallback transcript, proceeding with feedback generation');
                  // Update session object to continue with feedback generation
                  session.transcript = transcript;
                }
              } else {
                console.log('⚠️ Tavus API returned data but no valid transcript found');
              }
            } else {
              console.error('❌ Tavus API request failed:', tavusResponse.status);
            }
          }
        } catch (fallbackError) {
          console.error('❌ Fallback transcript retrieval failed:', fallbackError);
        }
      }

      // Check again after fallback attempt
      if (!session.transcript || !Array.isArray(session.transcript) || session.transcript.length === 0) {
        // Check if session is still recording or processing
        const status = session.recording_status || 'unknown';

        let message = '';
        let suggestion = '';

        if (status === 'recording' || status === 'processing') {
          message = 'Your conversation is still being processed. This usually takes 1-2 minutes after the session ends.';
          suggestion = 'Please wait a moment and try the "Retry Transcript Retrieval" button.';
        } else if (!session.tavus_conversation_id) {
          message = 'The conversation was not properly initialized. This may happen if the session started incorrectly.';
          suggestion = 'Please try starting a new roleplay session.';
        } else {
          message = 'The conversation transcript is not available. This can happen if the connection was interrupted.';
          suggestion = 'Click "Retry Transcript Retrieval" to attempt to fetch the transcript from the recording service.';
        }

        return new Response(
          JSON.stringify({
            error: 'Transcript not ready',
            message: message,
            suggestion: suggestion,
            status: status,
            session_id: sessionId,
            has_conversation_id: !!session.tavus_conversation_id
          }),
          {
            status: 422,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Progress record with 'generating' status (a failed row is reused for the retry).
    const progress = {
      session_id: sessionId,
      overall_score: 0,
      communication_score: 0,
      active_listening_score: 0,
      objection_handling_score: 0,
      product_knowledge_score: 0,
      small_talk_score: 0,
      pain_point_identification_score: 0,
      specific_feedback: 'Generating feedback...',
      practice_score: null,
      generation_status: 'generating'
    };
    // Two calls at once (the Tavus webhook and the retry button, a double click) must not
    // both pay for the model calls and both email the learner: only the call that claims
    // the row goes on.
    const claim = await claimFeedbackRow(supabase, sessionId, !!existingFeedback, progress);
    if (claim === 'error') {
      return new Response(JSON.stringify({ error: 'Could not start feedback generation' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (claim === 'busy') {
      return new Response(JSON.stringify({
        success: true,
        message: 'Feedback is already being generated',
        status: 'processing'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Format transcript for analysis
    const conversationText = (session.transcript as any[])
      .filter((msg: any) => msg.role === 'user' || msg.role === 'assistant')
      .map((msg: any) => `${msg.role === 'user' ? 'USER' : 'AI_TRAINER'}: ${msg.content}`)
      .join('\n');

    console.log('Starting feedback generation for session:', sessionId);
    deps.waitUntil(generateAndStore(deps, session, sessionId, conversationText));

    // Return immediate response - processing continues in background
    return new Response(JSON.stringify({
      success: true,
      message: 'Feedback generation started',
      status: 'processing'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-roleplay-feedback function:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : String(error),
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// A failed row is claimed by an update that only matches while it is still 'failed'.
// A new row is claimed by its insert: a unique-key conflict (23505) means another call got
// there first. Until migration 20261102030000 adds that key, both inserts succeed, so the
// call whose row is not the oldest for the session deletes its own row and stands down.
// shortcut: without the key, a race where the later insert commits before the earlier
// one's check can still let both run; apply the migration to close it.
async function claimFeedbackRow(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  sessionId: string,
  retryFailed: boolean,
  progress: Record<string, unknown>,
): Promise<'claimed' | 'busy' | 'error'> {
  if (retryFailed) {
    const { data, error } = await supabase
      .from('roleplay_feedback')
      .update(progress)
      .eq('session_id', sessionId)
      .eq('generation_status', 'failed')
      .select('id');
    if (error) {
      console.error('Could not claim the failed feedback record:', error);
      return 'error';
    }
    return data?.length ? 'claimed' : 'busy';
  }

  const { data: mine, error } = await supabase
    .from('roleplay_feedback')
    .insert(progress)
    .select('id')
    .single();
  if (error?.code === '23505') return 'busy';
  if (error || !mine) {
    console.error('Could not create the feedback record:', error);
    return 'error';
  }
  const { data: first, error: firstError } = await supabase
    .from('roleplay_feedback')
    .select('id')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .order('id', { ascending: true })
    .limit(1);
  if (firstError) {
    console.error('Could not check for a concurrent feedback record:', firstError);
    return 'error';
  }
  if (first?.[0]?.id === mine.id) return 'claimed';
  const { error: dropError } = await supabase.from('roleplay_feedback').delete().eq('id', mine.id);
  if (dropError) console.error('Could not remove a duplicate feedback record:', mine.id, dropError);
  return 'busy';
}

// The three calls run in parallel. The scores are what the page shows, so without them
// the row is marked failed (the page offers a retry) and no email goes out. A failed
// qualitative or advanced call leaves only its own sections empty, which the page hides.
// deno-lint-ignore no-explicit-any
async function generateAndStore(deps: Deps, session: any, sessionId: string, conversationText: string) {
  const { supabase } = deps;
  try {
    const [metricsResult, qualitativeResult, advancedResult] = await Promise.allSettled([
      generateMetricsFeedback(conversationText, session),
      generateQualitativeFeedback(conversationText, session),
      generateAdvancedFeedback(conversationText, session),
    ]);
    for (const [name, r] of [['metrics', metricsResult], ['qualitative', qualitativeResult], ['advanced', advancedResult]] as const) {
      if (r.status === 'rejected') console.error(`Feedback ${name} call failed:`, r.reason);
    }
    if (metricsResult.status === 'rejected') throw metricsResult.reason;

    const metrics = metricsResult.value;
    const scores = readScores(metrics);
    const qualitative = qualitativeResult.status === 'fulfilled' ? qualitativeResult.value : null;
    const advanced = advancedResult.status === 'fulfilled' ? advancedResult.value : null;

    const comprehensiveFeedback = {
      // Core metrics (1-5 scores)
      overall_score: Math.round(SCORE_KEYS.reduce((sum, k) => sum + scores[k], 0) / SCORE_KEYS.length),
      communication_score: scores.communication,
      active_listening_score: scores.activeListening,
      objection_handling_score: scores.objectionHandling,
      product_knowledge_score: scores.productKnowledge,
      small_talk_score: scores.smallTalk,
      pain_point_identification_score: scores.painPointIdentification,

      // Enhanced fields
      practice_score: parseInt(qualitative?.practiceScore) || null,
      detailed_rubric_feedback: metrics.rubricFeedback || {},
      conversation_flow_summary: qualitative?.conversationFlowSummary || [],
      body_language_analysis: advanced?.visualPresence?.detailedAnalysis || null,
      tone_detailed_analysis: advanced?.toneAnalysis?.detailedAnalysis || null,

      // Original qualitative analysis (restructured)
      strengths: qualitative?.strengths ? [qualitative.strengths.content] : [],
      improvement_areas: qualitative?.growthAreas?.map((area: any) => area.title + ': ' + area.content) || [],
      // NOT NULL column; empty hides the section.
      specific_feedback: qualitative?.specificFeedback || '',
      coaching_points: qualitative?.coachingPoints ?? null,
      follow_up_questions: qualitative?.followUpQuestions ?? null,
      conversation_summary: qualitative?.conversationFlowSummary?.join(' ') || null,

      // Advanced analytics (simplified for compatibility)
      tone_analysis: advanced?.toneAnalysis?.descriptors || [],
      visual_presence_analysis: advanced?.visualPresence?.descriptors || [],
      pronunciation_feedback: advanced?.pronunciationFeedback?.detailedAnalysis || null,

      // Generation status
      generation_status: 'completed'
    };

    const { error: updateError } = await supabase
      .from('roleplay_feedback')
      .update(comprehensiveFeedback)
      .eq('session_id', sessionId);
    if (updateError) throw updateError;
    console.log('Successfully generated and stored comprehensive feedback for session:', sessionId);

    try {
      await deps.emailOwner(session, comprehensiveFeedback);
    } catch (emailErr) {
      // Non-fatal: the feedback is saved.
      console.error('Failed to send roleplay feedback email:', emailErr);
    }
  } catch (error) {
    console.error('Feedback generation failed for session:', sessionId, error);
    const { error: failError } = await supabase
      .from('roleplay_feedback')
      .update({
        specific_feedback: 'Feedback could not be generated. Please try again.',
        generation_status: 'failed'
      })
      .eq('session_id', sessionId);
    if (failError) console.error('Could not mark feedback as failed:', failError);
  }
}

// deno-lint-ignore no-explicit-any
function readScores(metrics: any): Record<typeof SCORE_KEYS[number], number> {
  const out = {} as Record<typeof SCORE_KEYS[number], number>;
  for (const k of SCORE_KEYS) {
    const v = metrics?.scores?.[k];
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > 5) {
      throw new Error(`Metrics answer has no usable ${k} score: ${JSON.stringify(v)}`);
    }
    out[k] = Math.round(v);
  }
  return out;
}

// One call on the current model through the shared helper (gpt-4o-mini is its fallback),
// answered as a JSON object.
async function askJson(prompt: string, temperature: number, maxTokens: number) {
  const response = await openaiChat({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' },
  }, { signal: AbortSignal.timeout(MODEL_TIMEOUT_MS) });
  if (!response.ok) {
    throw new Error(`OpenAI ${response.status}: ${(await response.text()).slice(0, 300)}`);
  }
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenAI returned no text');
  return JSON.parse(content);
}

async function generateMetricsFeedback(conversationText: string, session: any) {
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

  return askJson(prompt, 0.3, 2000);
}

async function generateQualitativeFeedback(conversationText: string, session: any) {
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

  return askJson(prompt, 0.4, 2000);
}

async function generateAdvancedFeedback(conversationText: string, session: any) {
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

  return askJson(prompt, 0.2, 1500);
}