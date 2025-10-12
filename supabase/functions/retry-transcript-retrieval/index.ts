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
    const tavusApiKey = Deno.env.get('TAVUS_API_KEY')!;

    if (!tavusApiKey) {
      throw new Error('TAVUS_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { sessionId } = await req.json();

    console.log('🔄 Manual transcript retrieval requested for session:', sessionId);

    // Get session details
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

    if (!session.tavus_conversation_id) {
      return new Response(JSON.stringify({
        error: 'No Tavus conversation ID found for this session'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('📡 Fetching transcript from Tavus API for conversation:', session.tavus_conversation_id);

    // Fetch conversation data from Tavus
    const tavusResponse = await fetch(
      `https://tavusapi.com/v2/conversations/${session.tavus_conversation_id}`,
      {
        headers: {
          'x-api-key': tavusApiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!tavusResponse.ok) {
      const errorText = await tavusResponse.text();
      console.error('Tavus API error:', tavusResponse.status, errorText);
      return new Response(JSON.stringify({
        error: 'Failed to fetch conversation from Tavus',
        details: `HTTP ${tavusResponse.status}: ${errorText}`
      }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const conversationData = await tavusResponse.json();
    console.log('📥 Received Tavus conversation data:', {
      hasConversation: !!conversationData.conversation,
      hasTranscript: !!conversationData.conversation?.transcript,
      transcriptLength: conversationData.conversation?.transcript?.length || 0
    });

    // Extract transcript from various possible locations
    let transcript = null;

    if (conversationData.transcript && Array.isArray(conversationData.transcript)) {
      transcript = conversationData.transcript;
    } else if (conversationData.conversation?.transcript && Array.isArray(conversationData.conversation.transcript)) {
      transcript = conversationData.conversation.transcript;
    } else if (conversationData.messages && Array.isArray(conversationData.messages)) {
      transcript = conversationData.messages;
    }

    if (!transcript || transcript.length === 0) {
      console.warn('❌ No transcript found in Tavus response');
      return new Response(JSON.stringify({
        error: 'Transcript not available yet',
        message: 'The conversation transcript is not ready. Please wait a few minutes and try again.',
        tavusData: conversationData // Return for debugging
      }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`✅ Found transcript with ${transcript.length} messages`);

    // Filter to user and assistant messages only
    const conversationMessages = transcript.filter((msg: any) =>
      msg.role === 'user' || msg.role === 'assistant'
    );

    console.log(`💬 Filtered to ${conversationMessages.length} conversation messages`);

    if (conversationMessages.length === 0) {
      return new Response(JSON.stringify({
        error: 'No valid conversation messages found',
        message: 'The transcript exists but contains no user or assistant messages.'
      }), {
        status: 422,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Insert transcript entries into conversation_transcripts table
    const transcriptEntries = conversationMessages.map((msg: any, index: number) => ({
      session_id: sessionId,
      timestamp_offset: index * 1000,
      speaker: msg.role === 'user' ? 'user' : 'ai_trainer',
      text: msg.content || msg.text || '',
      confidence: 1.0,
      filler_words: null
    }));

    const { error: insertError } = await supabase
      .from('conversation_transcripts')
      .insert(transcriptEntries);

    if (insertError) {
      console.error('Error inserting transcript entries:', insertError);
      // Continue anyway - transcript field update is more important
    } else {
      console.log(`📝 Inserted ${transcriptEntries.length} transcript entries`);
    }

    // Update session with transcript and mark as completed
    const { error: updateError } = await supabase
      .from('roleplay_sessions')
      .update({
        transcript: transcript,
        recording_status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Error updating session transcript:', updateError);
      return new Response(JSON.stringify({
        error: 'Failed to save transcript to database',
        details: updateError.message
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('✅ Transcript saved successfully');

    // Trigger feedback generation
    console.log('🤖 Triggering feedback generation');
    const { error: feedbackError } = await supabase.functions.invoke('generate-roleplay-feedback', {
      body: { sessionId }
    });

    if (feedbackError) {
      console.error('Error triggering feedback generation:', feedbackError);
      // Don't fail the request - transcript was saved successfully
    } else {
      console.log('✅ Feedback generation triggered');
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Transcript retrieved and feedback generation started',
      transcriptMessageCount: conversationMessages.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in retry-transcript-retrieval function:', error);
    return new Response(JSON.stringify({
      error: error.message,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
