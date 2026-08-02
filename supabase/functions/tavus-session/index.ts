import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';
import { identifyCaller, denied } from '../_shared/caller-auth.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Every conversation created here is BILLED. Without a per-user cap any signed-in
 * learner could loop create_conversation and mint unlimited 10-minute recorded
 * sessions on the account.
 */
const MAX_CONVERSATIONS_PER_DAY = 20;

/** Only replicas/personas the product actually uses may be spun up. */
const ALLOWED_REPLICA_IDS = new Set(['r9d30b0e55ac']);
const ALLOWED_PERSONA_IDS = new Set(['p74cc7de032d']);

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

    console.log('Tavus session request:', { 
      action, 
      params: JSON.stringify(params).substring(0, 200) + '...' 
    });

    switch (action) {
      case 'create_conversation': {
        const { replica_id, persona_id, conversation_name, enable_recording } = params;

        // Cost gate: identify the caller, cap their daily conversations, and
        // refuse replicas/personas outside the product's own scenarios.
        const caller = await identifyCaller(req);
        if (!caller.userId) return denied(corsHeaders, 'Sign in to start a roleplay session', 401);

        if (replica_id && !ALLOWED_REPLICA_IDS.has(replica_id)) {
          return denied(corsHeaders, 'Unknown roleplay avatar');
        }
        if (persona_id && !ALLOWED_PERSONA_IDS.has(persona_id)) {
          return denied(corsHeaders, 'Unknown roleplay persona');
        }

        if (!caller.isAdmin) {
          const admin = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
          );
          const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          const { count, error: countErr } = await admin
            .from('roleplay_sessions')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', caller.userId)
            .gte('created_at', since);

          // Fail closed — an unmeasurable quota must not mean an unlimited one.
          if (countErr) {
            console.error('roleplay quota check failed', countErr);
            return denied(corsHeaders, 'Could not verify your session quota. Please try again.', 503);
          }
          if ((count ?? 0) >= MAX_CONVERSATIONS_PER_DAY) {
            return denied(
              corsHeaders,
              `You have reached the daily limit of ${MAX_CONVERSATIONS_PER_DAY} roleplay sessions. Please try again tomorrow.`,
              429,
            );
          }
        }
        
        // The webhook is necessarily public (Tavus calls it server-to-server),
        // so it authenticates callers by this unguessable token rather than by
        // a JWT. Without it anyone could forge transcripts and trigger paid
        // feedback generation for another user's session.
        const webhookSecret = Deno.env.get('TAVUS_WEBHOOK_SECRET') ?? '';
        const callbackUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/tavus-webhook`
          + (webhookSecret ? `?token=${encodeURIComponent(webhookSecret)}` : '');

        const requestBody: any = {
          replica_id,
          conversation_name: conversation_name || 'Roleplay Session',
          callback_url: callbackUrl,
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
        console.log('Conversation created successfully:', {
          conversation_id: conversationData.conversation_id,
          has_conversation_url: !!conversationData.conversation_url,
          has_web_url: !!conversationData.web_url,
          has_room_url: !!conversationData.room_url,
          all_fields: Object.keys(conversationData)
        });

        // Normalize the response to always include conversation_url
        const normalizedResponse = {
          conversation_id: conversationData.conversation_id,
          conversation_url: conversationData.conversation_url || 
                           conversationData.web_url || 
                           conversationData.room_url || 
                           conversationData.url,
          ...conversationData
        };

        return new Response(JSON.stringify(normalizedResponse), {
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