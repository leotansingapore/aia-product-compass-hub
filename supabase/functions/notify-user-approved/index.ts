import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { UserApprovedEmail } from './_templates/user-approved.tsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;
    const resend = new Resend(resendApiKey);

    const { email, firstName, lastName, passwordResetLink }: { email: string; firstName?: string; lastName?: string; passwordResetLink?: string } = await req.json();

    if (!email) {
      throw new Error('Email is required');
    }

    console.log('Sending approval notification to:', email);

    const userName = firstName && lastName 
      ? `${firstName} ${lastName}` 
      : firstName || 'User';

    // Render email template
    const html = await renderAsync(
      React.createElement(UserApprovedEmail, {
        userName,
        email,
        loginUrl: 'https://academy.finternship.com/auth',
        passwordResetLink,
      })
    );

    // Send approval email
    const { data, error } = await resend.emails.send({
      from: 'FINternship <noreply@mail.themoneybees.co>',
      to: [email],
      subject: '✅ Your FINternship Account Has Been Approved!',
      html,
    });

    if (error) {
      throw new Error(`Failed to send email: ${error.message}`);
    }

    console.log('Approval email sent successfully to:', email);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Approval notification sent',
        emailId: data?.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Error in notify-user-approved:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
