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
    const tavusApiKey = Deno.env.get('TAVUS_API_KEY');
    
    console.log('Tavus API Key status:', {
      hasKey: !!tavusApiKey,
      keyLength: tavusApiKey?.length || 0,
      keyPrefix: tavusApiKey?.substring(0, 8) + '...' || 'none'
    });
    
    if (!tavusApiKey) {
      throw new Error('Tavus API key not configured');
    }

    const { action, ...params } = await req.json();

    console.log('Tavus session request:', { action, params });

    switch (action) {
      case 'create_conversation': {
        const { replica_id, persona_id, conversation_name, enable_recording } = params;
        
        const requestBody: any = {
          replica_id,
          conversation_name: conversation_name || 'Roleplay Session',
          callback_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/tavus-webhook`,
          properties: {
            max_call_duration: 600, // 10 minutes
            participant_left_timeout: 30,
            participant_absent_timeout: 60,
          }
        };

        // Add persona_id if provided
        if (persona_id) {
          requestBody.persona_id = persona_id;
        }

        // Enable recording if requested
        if (enable_recording) {
          requestBody.properties.enable_recording = true;
        }
        
        const response = await fetch('https://tavusapi.com/v2/conversations', {
          method: 'POST',
          headers: {
            'x-api-key': tavusApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error(`Tavus API error: ${response.status} - ${errorData}`);
          throw new Error(`Tavus API error: ${response.status} - ${errorData}`);
        }

        const conversationData = await response.json();
        console.log('Conversation created:', conversationData);

        return new Response(JSON.stringify(conversationData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get_conversation': {
        const { conversation_id } = params;
        
        const response = await fetch(`https://tavusapi.com/v2/conversations/${conversation_id}`, {
          method: 'GET',
          headers: {
            'x-api-key': tavusApiKey,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Tavus API error: ${response.status} - ${errorData}`);
        }

        const conversationData = await response.json();
        return new Response(JSON.stringify(conversationData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'end_conversation': {
        const { conversation_id } = params;
        
        const response = await fetch(`https://tavusapi.com/v2/conversations/${conversation_id}`, {
          method: 'DELETE',
          headers: {
            'x-api-key': tavusApiKey,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Tavus API error: ${response.status} - ${errorData}`);
        }

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'list_replicas': {
        const response = await fetch('https://tavusapi.com/v2/replicas', {
          method: 'GET',
          headers: {
            'x-api-key': tavusApiKey,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`Tavus API error: ${response.status} - ${errorData}`);
        }

        const replicasData = await response.json();
        return new Response(JSON.stringify(replicasData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

  } catch (error) {
    console.error('Error in tavus-session function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Check function logs for more information'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});