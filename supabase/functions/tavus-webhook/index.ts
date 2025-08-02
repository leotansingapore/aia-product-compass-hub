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
    console.log('Tavus webhook received:', JSON.stringify(webhookData, null, 2));

    const { 
      event_type, 
      conversation_id,
      participant_id,
      recording_url,
      transcript,
      duration_seconds,
      status,
      metadata 
    } = webhookData;

    // Handle different webhook events
    switch (event_type) {
      case 'conversation_started':
        console.log(`Conversation ${conversation_id} started`);
        break;

      case 'conversation_ended':
      case 'recording_ready':
        console.log(`Conversation ${conversation_id} ended with recording: ${recording_url}`);
        
        // Find the corresponding roleplay session
        const { data: session, error: sessionError } = await supabase
          .from('roleplay_sessions')
          .select('*')
          .eq('tavus_conversation_id', conversation_id)
          .single();

        if (sessionError) {
          console.error('Failed to find roleplay session:', sessionError);
          break;
        }

        if (session) {
          // Update session with final data
          const updateData: any = {
            ended_at: new Date().toISOString(),
          };

          if (duration_seconds) {
            updateData.duration_seconds = duration_seconds;
          }

          // Store transcript if available
          if (transcript) {
            updateData.transcript = transcript;
            
            // Also store individual transcript entries
            if (Array.isArray(transcript)) {
              for (const entry of transcript) {
                await supabase
                  .from('conversation_transcripts')
                  .insert({
                    session_id: session.id,
                    speaker: entry.speaker || 'unknown',
                    text: entry.text || entry.content || '',
                    timestamp_offset: entry.timestamp || 0,
                    confidence: entry.confidence || 0.9,
                    filler_words: entry.filler_words || []
                  });
              }
            } else if (typeof transcript === 'string') {
              // Simple string transcript
              await supabase
                .from('conversation_transcripts')
                .insert({
                  session_id: session.id,
                  speaker: 'system',
                  text: transcript,
                  timestamp_offset: 0,
                  confidence: 0.9,
                  filler_words: []
                });
            }
          }

          const { error: updateError } = await supabase
            .from('roleplay_sessions')
            .update(updateData)
            .eq('id', session.id);

          if (updateError) {
            console.error('Failed to update roleplay session:', updateError);
          } else {
            console.log(`Updated roleplay session ${session.id} with final data`);
          }

          // Trigger speech analysis finalization if we have recording URL
          if (recording_url) {
            try {
              const { data: analysisResult, error: analysisError } = await supabase.functions.invoke('speech-analysis', {
                body: {
                  action: 'finalize_session',
                  conversationId: conversation_id,
                  recordingUrl: recording_url,
                  finalTranscript: transcript,
                  durationSeconds: duration_seconds,
                  meta: metadata
                }
              });

              if (analysisError) {
                console.error('Failed to finalize speech analysis:', analysisError);
              } else {
                console.log('Speech analysis finalized:', analysisResult);
              }
            } catch (error) {
              console.error('Error calling speech analysis finalization:', error);
            }
          }
        }
        break;

      case 'participant_joined':
        console.log(`Participant ${participant_id} joined conversation ${conversation_id}`);
        break;

      case 'participant_left':
        console.log(`Participant ${participant_id} left conversation ${conversation_id}`);
        break;

      default:
        console.log(`Unhandled webhook event: ${event_type}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing Tavus webhook:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});