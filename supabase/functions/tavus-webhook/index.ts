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
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const webhookData = await req.json();
    const { event_type, conversation_id, properties, timestamp } = webhookData;

    console.log('Tavus webhook received:', { event_type, conversation_id, timestamp });

    // Find the session by tavus_conversation_id
    const { data: session, error: sessionError } = await supabase
      .from('roleplay_sessions')
      .select('id, user_id')
      .eq('tavus_conversation_id', conversation_id)
      .single();

    if (sessionError || !session) {
      console.error('Session not found for conversation:', conversation_id, sessionError);
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    switch (event_type) {
      case 'system.replica_joined':
        console.log('✅ Replica has joined the conversation');
        break;

      case 'system.shutdown':
        console.log('🔚 Conversation ended');
        
        // Update session end time if not already set
        const { error: updateError } = await supabase
          .from('roleplay_sessions')
          .update({ 
            ended_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', session.id)
          .is('ended_at', null);

        if (updateError) {
          console.error('Error updating session end time:', updateError);
        }
        break;

      case 'application.transcription_ready':
        console.log('📝 Processing final transcript');
        
        const transcript = properties.transcript;
        if (!transcript || !Array.isArray(transcript)) {
          console.error('Invalid transcript data');
          break;
        }

        // Filter out system messages and process user/assistant messages
        const conversationMessages = transcript.filter(msg => 
          msg.role === 'user' || msg.role === 'assistant'
        );

        // Insert transcript entries
        const transcriptEntries = conversationMessages.map((msg, index) => ({
          session_id: session.id,
          timestamp_offset: index * 1000, // Simple offset based on message order
          speaker: msg.role === 'user' ? 'user' : 'ai_trainer',
          text: msg.content,
          confidence: 1.0, // Tavus doesn't provide confidence, so we use 1.0
          filler_words: null
        }));

        if (transcriptEntries.length > 0) {
          const { error: insertError } = await supabase
            .from('conversation_transcripts')
            .insert(transcriptEntries);

          if (insertError) {
            console.error('Error inserting transcript entries:', insertError);
          } else {
            console.log(`Inserted ${transcriptEntries.length} transcript entries`);
          }
        }

        // Update session with full transcript
        const { error: transcriptUpdateError } = await supabase
          .from('roleplay_sessions')
          .update({ 
            transcript: transcript,
            updated_at: new Date().toISOString()
          })
          .eq('id', session.id);

        if (transcriptUpdateError) {
          console.error('Error updating session transcript:', transcriptUpdateError);
        } else {
          // Trigger comprehensive feedback generation
          try {
            console.log('Triggering feedback generation for session:', session.id);
            const { error: feedbackError } = await supabase.functions.invoke('generate-roleplay-feedback', {
              body: { sessionId: session.id }
            });
            
            if (feedbackError) {
              console.error('Error generating feedback:', feedbackError);
            } else {
              console.log('Feedback generation triggered successfully');
            }
          } catch (error) {
            console.error('Failed to trigger feedback generation:', error);
          }
        }
        break;

      default:
        console.log('Unhandled event type:', event_type);
    }

    return new Response(JSON.stringify({ status: 'success' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in tavus-webhook function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});