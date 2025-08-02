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
      message_type,
      conversation_id,
      properties,
      timestamp 
    } = webhookData;

    console.log(`Processing Tavus webhook: ${event_type} (${message_type}) for conversation ${conversation_id}`);

    // Handle different webhook events based on Tavus API documentation
    switch (event_type) {
      case 'system.replica_joined':
        console.log(`✅ Replica joined conversation ${conversation_id}`);
        
        // Update session to mark as active
        const { error: joinError } = await supabase
          .from('roleplay_sessions')
          .update({ 
            started_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('tavus_conversation_id', conversation_id);

        if (joinError) {
          console.error('Failed to update session on replica join:', joinError);
        }
        break;

      case 'system.shutdown':
        const shutdownReason = properties?.shutdown_reason || 'unknown';
        console.log(`🔚 Conversation ${conversation_id} shut down: ${shutdownReason}`);
        
        // Mark session as ended
        const { error: shutdownError } = await supabase
          .from('roleplay_sessions')
          .update({ 
            ended_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('tavus_conversation_id', conversation_id);

        if (shutdownError) {
          console.error('Failed to update session on shutdown:', shutdownError);
        }
        break;

      case 'application.transcription_ready':
        console.log(`📝 Transcript ready for conversation ${conversation_id}`);
        
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

        if (session && properties?.transcript) {
          const transcript = properties.transcript;
          
          // Store the full transcript in the session
          const { error: updateError } = await supabase
            .from('roleplay_sessions')
            .update({
              transcript: transcript,
              ended_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', session.id);

          if (updateError) {
            console.error('Failed to update session with transcript:', updateError);
          }

          // Convert Tavus transcript format to our database format and store individual entries
          if (Array.isArray(transcript)) {
            const transcriptEntries = transcript
              .filter(entry => entry.role !== 'system') // Skip system messages
              .map((entry, index) => ({
                session_id: session.id,
                speaker: entry.role === 'user' ? 'human' : 'assistant',
                text: entry.content || '',
                timestamp_offset: index * 1000, // Approximate timestamps
                confidence: 0.95,
                filler_words: []
              }));

            if (transcriptEntries.length > 0) {
              const { error: transcriptError } = await supabase
                .from('conversation_transcripts')
                .insert(transcriptEntries);

              if (transcriptError) {
                console.error('Failed to insert transcript entries:', transcriptError);
              } else {
                console.log(`✅ Inserted ${transcriptEntries.length} transcript entries for session ${session.id}`);
              }
            }
          }

          // Trigger AI feedback generation
          try {
            const { data: feedbackResult, error: feedbackError } = await supabase.functions.invoke('roleplay-feedback', {
              body: {
                sessionId: session.id,
                transcript: transcript,
                scenario: {
                  title: session.scenario_title,
                  category: session.scenario_category,
                  difficulty: session.scenario_difficulty
                }
              }
            });

            if (feedbackError) {
              console.error('Failed to generate AI feedback:', feedbackError);
            } else {
              console.log('✅ AI feedback generated successfully:', feedbackResult);
            }
          } catch (error) {
            console.error('Error calling roleplay feedback function:', error);
          }
        }
        break;

      case 'application.recording_ready':
        const s3Key = properties?.s3_key;
        console.log(`🎥 Recording ready for conversation ${conversation_id}: ${s3Key}`);
        
        // Could store recording URL in session if needed
        if (s3Key) {
          const { error: recordingError } = await supabase
            .from('roleplay_sessions')
            .update({ 
              updated_at: new Date().toISOString()
              // Could add recording_url field if needed
            })
            .eq('tavus_conversation_id', conversation_id);

          if (recordingError) {
            console.error('Failed to update session with recording info:', recordingError);
          }
        }
        break;

      case 'application.perception_analysis':
        const analysis = properties?.analysis;
        console.log(`🧠 Perception analysis ready for conversation ${conversation_id}:`, analysis);
        break;

      default:
        console.log(`❓ Unhandled Tavus webhook event: ${event_type}`);
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