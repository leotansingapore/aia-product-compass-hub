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
        console.log('🔚 Conversation ended, attempting transcript retrieval');
        
        // Update session end time and recording status
        const { error: updateError } = await supabase
          .from('roleplay_sessions')
          .update({ 
            ended_at: new Date().toISOString(),
            recording_status: 'processing',
            updated_at: new Date().toISOString()
          })
          .eq('id', session.id)
          .is('ended_at', null);

        if (updateError) {
          console.error('Error updating session end time:', updateError);
        }

        // Attempt to retrieve transcript directly from Tavus if webhook missed it
        try {
          await retrieveTranscriptFromTavus(conversation_id, session, supabase);
        } catch (error) {
          console.error('Failed to retrieve transcript from Tavus:', error);
          // Update status to completed anyway so user doesn't get stuck
          await supabase
            .from('roleplay_sessions')
            .update({ recording_status: 'completed' })
            .eq('id', session.id);
        }
        break;

      case 'application.transcription_ready':
        console.log('📝 Processing final transcript');
        console.log('📦 Webhook payload structure:', {
          hasProperties: !!properties,
          propertiesKeys: properties ? Object.keys(properties) : [],
          hasTranscript: !!properties?.transcript,
          transcriptType: properties?.transcript ? typeof properties.transcript : 'undefined'
        });

        // Try multiple possible transcript locations in payload
        let transcript = properties?.transcript ||
                        properties?.messages ||
                        properties?.conversation?.transcript ||
                        webhookData?.transcript;

        if (!transcript || !Array.isArray(transcript)) {
          console.error('❌ Invalid transcript data structure:', {
            hasTranscript: !!transcript,
            isArray: Array.isArray(transcript),
            type: typeof transcript,
            fullPayload: JSON.stringify(webhookData).substring(0, 500)
          });

          // Try to retrieve transcript directly from Tavus API as fallback
          console.log('🔄 Attempting fallback transcript retrieval from Tavus API');
          try {
            await retrieveTranscriptFromTavus(conversation_id, session, supabase);
          } catch (error) {
            console.error('Fallback transcript retrieval failed:', error);
          }
          break;
        }

        console.log(`✅ Found valid transcript with ${transcript.length} messages`);

        // Filter out system messages and process user/assistant messages
        const conversationMessages = transcript.filter(msg =>
          msg.role === 'user' || msg.role === 'assistant'
        );

        console.log(`💬 Filtered to ${conversationMessages.length} conversation messages (user/assistant only)`);

        // Insert transcript entries
        const transcriptEntries = conversationMessages.map((msg, index) => ({
          session_id: session.id,
          timestamp_offset: msg.timestamp || (index * 1000), // Use actual timestamp if available
          speaker: msg.role === 'user' ? 'user' : 'ai_trainer',
          text: msg.content || msg.text || '', // Handle different field names
          confidence: msg.confidence || 1.0,
          filler_words: null
        }));

        if (transcriptEntries.length > 0) {
          const { error: insertError } = await supabase
            .from('conversation_transcripts')
            .insert(transcriptEntries);

          if (insertError) {
            console.error('❌ Error inserting transcript entries:', insertError);
          } else {
            console.log(`✅ Inserted ${transcriptEntries.length} transcript entries`);
          }
        } else {
          console.warn('⚠️ No valid conversation messages to insert');
        }

        // Update session with full transcript and mark as completed
        const { error: transcriptUpdateError } = await supabase
          .from('roleplay_sessions')
          .update({
            transcript: transcript,
            recording_status: 'completed',
            recording_completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', session.id);

        if (transcriptUpdateError) {
          console.error('❌ Error updating session transcript:', transcriptUpdateError);
        } else {
          console.log('✅ Session transcript updated successfully');

          // Trigger comprehensive feedback generation
          try {
            console.log('🤖 Triggering feedback generation for session:', session.id);
            const { error: feedbackError } = await supabase.functions.invoke('generate-roleplay-feedback', {
              body: { sessionId: session.id }
            });

            if (feedbackError) {
              console.error('❌ Error triggering feedback generation:', feedbackError);
            } else {
              console.log('✅ Feedback generation triggered successfully');
            }
          } catch (error) {
            console.error('❌ Failed to trigger feedback generation:', error);
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

// Helper function to retrieve transcript directly from Tavus API with retry logic
async function retrieveTranscriptFromTavus(conversationId: string, session: any, supabase: any) {
  const tavusApiKey = Deno.env.get('TAVUS_API_KEY');
  if (!tavusApiKey) {
    throw new Error('TAVUS_API_KEY not found');
  }

  console.log('Attempting to retrieve transcript from Tavus API for conversation:', conversationId);

  // Retry logic with exponential backoff
  const maxRetries = 3;
  const baseDelay = 2000;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const delay = baseDelay * Math.pow(2, attempt);
    console.log(`📡 Attempt ${attempt + 1}/${maxRetries} - waiting ${delay}ms before fetching...`);
    await new Promise(resolve => setTimeout(resolve, delay));

    try {
      const response = await fetch(`https://tavusapi.com/v2/conversations/${conversationId}`, {
        headers: {
          'x-api-key': tavusApiKey,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Tavus API error (attempt ${attempt + 1}):`, response.status, errorText);

        if (attempt === maxRetries - 1) {
          throw new Error(`Tavus API error: ${response.status} - ${errorText}`);
        }
        continue; // Retry
      }

      const data = await response.json();
      console.log('📥 Tavus conversation data structure:', {
        hasConversation: !!data.conversation,
        hasTranscript: !!data.conversation?.transcript,
        hasMessages: !!data.messages,
        topLevelKeys: Object.keys(data),
        attempt: attempt + 1
      });

      // Try multiple possible transcript locations with better logging
      let transcript = null;
      const possiblePaths = [
        { path: 'data.transcript', value: data.transcript },
        { path: 'data.conversation.transcript', value: data.conversation?.transcript },
        { path: 'data.messages', value: data.messages },
        { path: 'data.conversation.messages', value: data.conversation?.messages },
        { path: 'data.recording.transcript', value: data.recording?.transcript }
      ];

      for (const { path, value } of possiblePaths) {
        if (value && Array.isArray(value) && value.length > 0) {
          transcript = value;
          console.log(`✅ Found transcript at ${path} with ${value.length} messages`);
          break;
        }
      }

      if (!transcript || transcript.length === 0) {
        if (attempt === maxRetries - 1) {
          console.log('❌ No transcript available after all retries, marking as completed anyway');
          await supabase
            .from('roleplay_sessions')
            .update({ recording_status: 'completed' })
            .eq('id', session.id);
          return;
        } else {
          console.log('⚠️ No transcript yet, will retry...');
          continue; // Retry
        }
      }

      console.log(`📝 Processing transcript with ${transcript.length} messages (attempt ${attempt + 1})`);

      // Filter out system messages and process user/assistant messages
      const conversationMessages = transcript.filter((msg: any) =>
        msg.role === 'user' || msg.role === 'assistant'
      );

      console.log(`💬 Filtered to ${conversationMessages.length} conversation messages`);

      // Insert transcript entries
      const transcriptEntries = conversationMessages.map((msg: any, index: number) => ({
        session_id: session.id,
        timestamp_offset: msg.timestamp || (index * 1000),
        speaker: msg.role === 'user' ? 'user' : 'ai_trainer',
        text: msg.content || msg.text || '',
        confidence: msg.confidence || 1.0,
        filler_words: null
      }));

      if (transcriptEntries.length > 0) {
        const { error: insertError } = await supabase
          .from('conversation_transcripts')
          .insert(transcriptEntries);

        if (insertError) {
          console.error('❌ Error inserting transcript entries:', insertError);
        } else {
          console.log(`✅ Inserted ${transcriptEntries.length} transcript entries`);
        }
      }

      // Update session with full transcript
      const { error: transcriptUpdateError } = await supabase
        .from('roleplay_sessions')
        .update({
          transcript: transcript,
          recording_status: 'completed',
          recording_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id);

      if (transcriptUpdateError) {
        console.error('❌ Error updating session transcript:', transcriptUpdateError);
      } else {
        console.log('✅ Session transcript updated via fallback retrieval');

        // Trigger feedback generation
        try {
          console.log('🤖 Triggering feedback generation for session:', session.id);
          const { error: feedbackError } = await supabase.functions.invoke('generate-roleplay-feedback', {
            body: { sessionId: session.id }
          });

          if (feedbackError) {
            console.error('❌ Error generating feedback:', feedbackError);
          } else {
            console.log('✅ Feedback generation triggered successfully');
          }
        } catch (error) {
          console.error('❌ Failed to trigger feedback generation:', error);
        }
      }

      // Success - break retry loop
      return;

    } catch (error) {
      console.error(`❌ Error on attempt ${attempt + 1}:`, error);

      if (attempt === maxRetries - 1) {
        console.error('❌ All retry attempts failed, marking as completed anyway');
        await supabase
          .from('roleplay_sessions')
          .update({ recording_status: 'completed' })
          .eq('id', session.id);
        throw error;
      }
    }
  }
}