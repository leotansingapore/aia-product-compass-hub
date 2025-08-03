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
      
      // Qualitative analysis
      strengths: qualitativeResult.strengths,
      improvement_areas: qualitativeResult.improvementAreas,
      specific_feedback: qualitativeResult.specificFeedback,
      coaching_points: qualitativeResult.coachingPoints,
      follow_up_questions: qualitativeResult.followUpQuestions,
      conversation_summary: qualitativeResult.conversationSummary,
      
      // Advanced analytics
      tone_analysis: advancedResult.toneAnalysis,
      visual_presence_analysis: advancedResult.visualPresence,
      pronunciation_feedback: advancedResult.pronunciationFeedback
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
  const prompt = `You are an expert sales coach analyzing a roleplay conversation. Score the following 6 core competencies on a scale of 1-5 (1=Poor, 2=Below Average, 3=Average, 4=Good, 5=Excellent).

SCENARIO CONTEXT:
- Title: ${session.scenario_title}
- Category: ${session.scenario_category}
- Difficulty: ${session.scenario_difficulty}

CONVERSATION TRANSCRIPT:
${conversationText}

SCORING CRITERIA:

1. SMALL TALK (smallTalk): 
   - 5: Natural, engaging rapport building with smooth transitions
   - 4: Good conversation starters, builds some rapport
   - 3: Adequate small talk, somewhat mechanical
   - 2: Minimal attempt at rapport building
   - 1: Abrupt start, no rapport building

2. ACTIVE LISTENING (activeListening):
   - 5: Consistently acknowledges, asks clarifying questions, builds on responses
   - 4: Generally responsive, shows understanding
   - 3: Some evidence of listening, occasionally responds appropriately
   - 2: Limited engagement with partner's responses
   - 1: Fails to respond or acknowledge what partner says

3. PAIN POINT IDENTIFICATION (painPointIdentification):
   - 5: Skillfully uncovers multiple needs through probing questions
   - 4: Identifies key pain points effectively
   - 3: Some discovery of client needs
   - 2: Limited attempt to understand needs
   - 1: No evidence of needs discovery

4. PRODUCT KNOWLEDGE (productKnowledge):
   - 5: Demonstrates expert understanding, connects features to benefits
   - 4: Good product knowledge, mostly accurate information
   - 3: Basic understanding, some gaps
   - 2: Limited knowledge, some inaccuracies
   - 1: Poor understanding or incorrect information

5. OBJECTION HANDLING (objectionHandling):
   - 5: Addresses concerns professionally with empathy and solutions
   - 4: Handles objections well, provides good responses
   - 3: Adequate responses to concerns
   - 2: Defensive or incomplete objection handling
   - 1: Hostile, dismissive, or no attempt to address concerns

6. COMMUNICATION (communication):
   - 5: Clear, professional, engaging throughout
   - 4: Generally clear and professional
   - 3: Adequate communication, some clarity issues
   - 2: Unclear or unprofessional at times
   - 1: Poor communication, hostile or rude

Return ONLY a JSON object with this structure:
{
  "scores": {
    "smallTalk": number,
    "activeListening": number,
    "painPointIdentification": number,
    "productKnowledge": number,
    "objectionHandling": number,
    "communication": number
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
      temperature: 0.3,
    }),
  });

  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}

async function generateQualitativeFeedback(conversationText: string, session: any, openAIApiKey: string) {
  const prompt = `You are an expert sales coach providing detailed feedback on a roleplay conversation. Analyze the conversation and provide qualitative insights.

SCENARIO CONTEXT:
- Title: ${session.scenario_title}
- Category: ${session.scenario_category}
- Difficulty: ${session.scenario_difficulty}

CONVERSATION TRANSCRIPT:
${conversationText}

Provide comprehensive qualitative analysis with specific examples from the conversation.

Return ONLY a JSON object with this structure:
{
  "strengths": ["List 2-3 specific things done well with examples"],
  "improvementAreas": ["List 2-3 specific areas for improvement with actionable steps"],
  "specificFeedback": "Detailed paragraph about overall performance with specific examples",
  "coachingPoints": ["List 3-4 specific coaching recommendations"],
  "followUpQuestions": ["List 2-3 self-reflection questions for continued learning"],
  "conversationSummary": "2-3 sentence summary of key moments and outcomes"
}

Guidelines:
- Reference specific moments from the transcript
- Provide actionable, specific feedback
- Use professional sales coaching language
- Focus on behavior that can be improved
- Include positive reinforcement where appropriate`;

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
  const prompt = `You are an expert communication coach analyzing advanced presentation skills from a roleplay conversation.

SCENARIO CONTEXT:
- Title: ${session.scenario_title}
- Category: ${session.scenario_category}
- Difficulty: ${session.scenario_difficulty}

CONVERSATION TRANSCRIPT:
${conversationText}

Analyze advanced communication elements and provide insights.

Return ONLY a JSON object with this structure:
{
  "toneAnalysis": ["List 2-3 tone descriptors like 'professional', 'engaging', 'confident', 'hesitant', 'abrasive', etc."],
  "visualPresence": ["List 2-3 presence indicators based on conversation flow like 'focused', 'dynamic', 'static', 'engaged', etc."],
  "pronunciationFeedback": "Paragraph with specific recommendations for speech clarity, pacing, and emphasis based on conversation patterns"
}

Guidelines:
- Infer tone from conversation content and flow
- Base visual presence on engagement level and conversation dynamics
- Provide specific speech improvement recommendations
- Use professional communication coaching terminology
- Focus on observable patterns in the conversation`;

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