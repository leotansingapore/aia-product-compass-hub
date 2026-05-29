import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { AssignmentNotificationEmail } from './_templates/assignment-notification.tsx';
import { StudentConfirmationEmail } from './_templates/student-confirmation.tsx';

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

const TRACK_LEARNER_URLS: Record<string, string> = {
  'first-60-days-assignments': 'https://aia-product-compass-hub.lovable.app/learning-track/pre-rnf/assignments',
  'next-60-days-assignments': 'https://aia-product-compass-hub.lovable.app/learning-track/post-rnf/next-60-days',
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

    const adminHtml = await renderAsync(
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

    const { data: adminData, error: adminError } = await resend.emails.send({
      from: 'FINternship <noreply@mail.themoneybees.co>',
      to: [ADMIN_EMAIL],
      subject: `📥 ${trackLabel} submission: ${assignment_title || item_id}`,
      html: adminHtml,
    });

    if (adminError) {
      console.error('Resend (admin) error:', adminError);
      return new Response(
        JSON.stringify({ error: 'Failed to send admin email', details: adminError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(
      `Assignment notification sent to ${ADMIN_EMAIL} for ${product_id}/${item_id} from ${userEmail}`
    );

    // Best-effort confirmation email back to the student. Fall through silently
    // if the user lookup couldn't resolve a real email — the admin notification
    // already succeeded and we don't want to fail the whole request because
    // the learner email is missing.
    let studentMessageId: string | null = null;
    const hasRealStudentEmail = userEmail && userEmail !== 'unknown@example.com';
    if (hasRealStudentEmail) {
      try {
        const firstName = (userName || userEmail.split('@')[0] || 'there').split(/\s+/)[0];
        const studentHtml = await renderAsync(
          React.createElement(StudentConfirmationEmail, {
            firstName,
            trackLabel,
            assignmentTitle: assignment_title || item_id,
            submissionExcerpt: excerpt,
            fileName: file_name ?? null,
            dashboardUrl: TRACK_LEARNER_URLS[product_id] ?? ADMIN_URL,
          })
        );

        const { data: studentData, error: studentError } = await resend.emails.send({
          from: 'FINternship <noreply@mail.themoneybees.co>',
          to: [userEmail],
          subject: `✓ Submission received: ${assignment_title || item_id}`,
          html: studentHtml,
        });

        if (studentError) {
          console.warn('Resend (student) error:', studentError);
        } else {
          studentMessageId = studentData?.id ?? null;
          console.log(`Student confirmation sent to ${userEmail}`);
        }
      } catch (studentErr) {
        console.warn('Student confirmation send threw:', studentErr);
      }
    } else {
      console.warn(
        `Skipping student confirmation: no real email resolved for user_id=${user_id}`
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        adminMessageId: adminData?.id,
        studentMessageId,
      }),
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
