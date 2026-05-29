import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { AssignmentNotificationEmail } from './_templates/assignment-notification.tsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAIL = 'tanjunsing@gmail.com';
const ADMIN_URL = 'https://aia-product-compass-hub.lovable.app/learning-track/admin/first-60-days';

const TRACK_LABELS: Record<string, string> = {
  'first-60-days-assignments': 'First 60 Days',
  'next-60-days-assignments': 'Next 60 Days',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const { user_id, product_id, item_id, assignment_title, submission_excerpt, file_name } =
      await req.json();

    if (!user_id || !product_id || !item_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Look up the submitter's email + display name. Service role required because
    // auth.users is not exposed via PostgREST.
    const serviceClient = createClient(SUPABASE_URL, SERVICE_KEY);
    let userEmail = 'unknown@example.com';
    let userName = 'Unknown FC';
    try {
      const { data: authUser } = await serviceClient.auth.admin.getUserById(user_id);
      if (authUser?.user) {
        userEmail = authUser.user.email ?? userEmail;
        const meta = (authUser.user.user_metadata ?? {}) as Record<string, unknown>;
        userName =
          (meta.display_name as string) ||
          (meta.full_name as string) ||
          (meta.name as string) ||
          userEmail.split('@')[0];
      }
    } catch (lookupErr) {
      console.warn('notify-assignment-submitted: user lookup failed', lookupErr);
    }

    const trackLabel = TRACK_LABELS[product_id] ?? product_id;
    const excerpt =
      typeof submission_excerpt === 'string' && submission_excerpt.length > 600
        ? submission_excerpt.slice(0, 600) + '…'
        : (submission_excerpt ?? '');

    const resend = new Resend(resendApiKey);

    const html = await renderAsync(
      React.createElement(AssignmentNotificationEmail, {
        trackLabel,
        assignmentTitle: assignment_title || item_id,
        userName,
        userEmail,
        submissionExcerpt: excerpt,
        fileName: file_name ?? null,
        adminUrl: ADMIN_URL,
      })
    );

    const { data, error: emailError } = await resend.emails.send({
      from: 'FINternship <noreply@mail.themoneybees.co>',
      to: [ADMIN_EMAIL],
      subject: `📥 ${trackLabel} submission: ${assignment_title || item_id}`,
      html,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: emailError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(
      `Assignment notification sent to ${ADMIN_EMAIL} for ${product_id}/${item_id} from ${userEmail}`
    );

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in notify-assignment-submitted:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
