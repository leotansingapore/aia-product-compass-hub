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
  const prompt = `You are an expert sales coach analyzing a roleplay conversation. Score the following 6 core competencies and provide detailed explanations for each.

SCENARIO CONTEXT:
- Title: ${session.scenario_title}
- Category: ${session.scenario_category}
- Difficulty: ${session.scenario_difficulty}

CONVERSATION TRANSCRIPT:
${conversationText}

For each competency, provide a score (1-5 or "Missed" for 0) and detailed feedback with specific examples from the conversation.

Return ONLY a JSON object with this structure:
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
      "explanation": "Detailed explanation with specific examples",
      "status": "Missed" | "1/5" | "2/5" | "3/5" | "4/5" | "5/5",
      "insights": "Specific improvement suggestions with alternative responses"
    },
    "activeListening": {
      "score": number,
      "explanation": "Detailed explanation with specific examples",
      "status": "Missed" | "1/5" | "2/5" | "3/5" | "4/5" | "5/5",
      "insights": "Specific improvement suggestions with alternative responses"
    },
    "painPointIdentification": {
      "score": number,
      "explanation": "Detailed explanation with specific examples",
      "status": "Missed" | "1/5" | "2/5" | "3/5" | "4/5" | "5/5",
      "insights": "Specific improvement suggestions with alternative responses"
    },
    "productKnowledge": {
      "score": number,
      "explanation": "Detailed explanation with specific examples",
      "status": "Missed" | "1/5" | "2/5" | "3/5" | "4/5" | "5/5",
      "insights": "Specific improvement suggestions with alternative responses"
    },
    "objectionHandling": {
      "score": number,
      "explanation": "Detailed explanation with specific examples",
      "status": "Missed" | "1/5" | "2/5" | "3/5" | "4/5" | "5/5",
      "insights": "Specific improvement suggestions with alternative responses"
    },
    "communication": {
      "score": number,
      "explanation": "Detailed explanation with specific examples",
      "status": "Missed" | "1/5" | "2/5" | "3/5" | "4/5" | "5/5",
      "insights": "Specific improvement suggestions with alternative responses"
    }
  }
}

SCORING CRITERIA:
- Small Talk: Rapport building and conversation starters
- Active Listening: Acknowledgment and building on responses  
- Pain Point Identification: Discovery of client needs through questions
- Product Knowledge: Understanding and articulation of solutions
- Objection Handling: Professional responses to concerns
- Communication: Clarity, tone, and professionalism

Provide specific examples from the conversation and actionable improvement suggestions.`;

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
  const prompt = `You are an expert sales coach providing detailed feedback on a roleplay conversation in the style of Yoodli feedback.

SCENARIO CONTEXT:
- Title: ${session.scenario_title}
- Category: ${session.scenario_category}
- Difficulty: ${session.scenario_difficulty}

CONVERSATION TRANSCRIPT:
${conversationText}

Provide comprehensive Yoodli-style feedback with specific examples and structured insights.

Return ONLY a JSON object with this structure:
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
}

Guidelines:
- Use the exact conversation quotes where possible
- Provide specific alternative responses
- Structure growth areas with clear titles and actionable advice
- Include bullet-point conversation flow summary
- Reference specific moments with quotes when relevant`;

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
  const prompt = `You are an expert communication coach analyzing advanced presentation skills from a roleplay conversation in Yoodli style.

SCENARIO CONTEXT:
- Title: ${session.scenario_title}
- Category: ${session.scenario_category}
- Difficulty: ${session.scenario_difficulty}

CONVERSATION TRANSCRIPT:
${conversationText}

Analyze advanced communication elements and provide detailed Yoodli-style insights.

Return ONLY a JSON object with this structure:
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

Guidelines:
- Infer detailed behavioral patterns from conversation flow and content
- Provide specific quotes and examples where possible
- Use Yoodli-style detailed analysis with actionable recommendations
- Focus on observable communication patterns that can be improved
- Include specific technique suggestions for enhancement`;

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