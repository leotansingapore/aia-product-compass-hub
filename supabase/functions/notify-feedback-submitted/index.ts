import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { FeedbackNotificationEmail } from './_templates/feedback-notification.tsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAIL = 'tanjunsing@gmail.com';

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

    const { type, title, description, userEmail, userName, pageUrl } = await req.json();

    if (!title || !description) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const resend = new Resend(resendApiKey);

    const html = await renderAsync(
      React.createElement(FeedbackNotificationEmail, {
        type: type || 'feedback',
        title,
        description,
        userEmail: userEmail || 'Unknown',
        userName: userName || 'Unknown User',
        pageUrl: pageUrl || '/',
      })
    );

    const typeLabel = type === 'bug' ? '🐛 Bug Report' : type === 'feature' ? '💡 Feature Request' : '📝 Feedback';

    const { data, error: emailError } = await resend.emails.send({
      from: 'FINternship <noreply@mail.themoneybees.co>',
      to: [ADMIN_EMAIL],
      subject: `${typeLabel}: ${title}`,
      html,
    });

    if (emailError) {
      console.error('Resend error:', emailError);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: emailError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Feedback notification sent to ${ADMIN_EMAIL} for: ${title}`);

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in notify-feedback-submitted:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
