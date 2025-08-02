import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RoleplayAnalysisRequest {
  sessionId: string;
  scenario: {
    title: string;
    category: string;
    difficulty: string;
    objectives: string[];
  };
  transcript?: any;
  durationSeconds: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { sessionId, scenario, transcript, durationSeconds }: RoleplayAnalysisRequest = await req.json();

    console.log('Processing roleplay feedback for session:', sessionId);

    // Create AI prompt for analysis
    const analysisPrompt = `
You are an expert sales coaching AI analyzing a roleplay session. 

Scenario Details:
- Title: ${scenario.title}
- Category: ${scenario.category}
- Difficulty: ${scenario.difficulty}
- Objectives: ${scenario.objectives.join(', ')}
- Duration: ${Math.floor(durationSeconds / 60)} minutes

Please analyze this roleplay session and provide detailed feedback in the following JSON format:
{
  "overall_score": number (0-100),
  "communication_score": number (0-100),
  "listening_score": number (0-100),
  "objection_handling_score": number (0-100),
  "product_knowledge_score": number (0-100),
  "strengths": ["specific strength 1", "specific strength 2", ...],
  "improvement_areas": ["specific area 1", "specific area 2", ...],
  "specific_feedback": "detailed paragraph of feedback",
  "coaching_points": ["actionable coaching point 1", "actionable coaching point 2", ...],
  "follow_up_questions": ["reflection question 1", "reflection question 2", ...]
}

Focus on:
1. Communication clarity and professionalism
2. Active listening and responsiveness
3. Handling objections and concerns
4. Product knowledge demonstration
5. Overall sales technique

Provide constructive, specific, and actionable feedback. Be encouraging while identifying clear areas for improvement.

${transcript ? `Session transcript/data: ${JSON.stringify(transcript)}` : 'Note: This analysis is based on session metadata as transcript is not available.'}
`;

    // Call OpenAI for analysis
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert sales coach providing detailed roleplay feedback. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const feedbackContent = aiResponse.choices[0].message.content;

    console.log('AI feedback generated:', feedbackContent);

    // Parse the JSON response
    let feedback;
    try {
      feedback = JSON.parse(feedbackContent);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback feedback if AI response is not valid JSON
      feedback = {
        overall_score: 75,
        communication_score: 75,
        listening_score: 75,
        objection_handling_score: 75,
        product_knowledge_score: 75,
        strengths: ['Completed the roleplay session', 'Engaged with the scenario'],
        improvement_areas: ['Continue practicing', 'Focus on key objectives'],
        specific_feedback: 'Good effort in completing this roleplay session. Continue practicing to improve your skills.',
        coaching_points: ['Practice active listening', 'Prepare responses to common objections'],
        follow_up_questions: ['What would you do differently next time?', 'Which part felt most challenging?']
      };
    }

    // Store feedback in database
    const { data: feedbackData, error: feedbackError } = await supabase
      .from('roleplay_feedback')
      .insert({
        session_id: sessionId,
        overall_score: feedback.overall_score,
        communication_score: feedback.communication_score,
        listening_score: feedback.listening_score,
        objection_handling_score: feedback.objection_handling_score,
        product_knowledge_score: feedback.product_knowledge_score,
        strengths: feedback.strengths,
        improvement_areas: feedback.improvement_areas,
        specific_feedback: feedback.specific_feedback,
        coaching_points: feedback.coaching_points,
        follow_up_questions: feedback.follow_up_questions
      })
      .select()
      .single();

    if (feedbackError) {
      console.error('Error storing feedback:', feedbackError);
      throw new Error('Failed to store feedback');
    }

    // Store performance metrics
    const metrics = [
      { metric_name: 'Communication', metric_value: feedback.communication_score, metric_description: 'Communication clarity and professionalism' },
      { metric_name: 'Active Listening', metric_value: feedback.listening_score, metric_description: 'Listening skills and responsiveness' },
      { metric_name: 'Objection Handling', metric_value: feedback.objection_handling_score, metric_description: 'Ability to handle objections and concerns' },
      { metric_name: 'Product Knowledge', metric_value: feedback.product_knowledge_score, metric_description: 'Demonstration of product expertise' }
    ];

    const { error: metricsError } = await supabase
      .from('roleplay_performance_metrics')
      .insert(
        metrics.map(metric => ({
          session_id: sessionId,
          ...metric
        }))
      );

    if (metricsError) {
      console.error('Error storing metrics:', metricsError);
    }

    console.log('Feedback stored successfully');

    return new Response(
      JSON.stringify({ feedback: feedbackData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in roleplay-feedback function:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate feedback', details: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
        status: 500 
      }
    );
  }
});