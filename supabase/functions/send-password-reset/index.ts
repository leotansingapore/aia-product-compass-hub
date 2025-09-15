import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import * as React from 'npm:react@18.3.1';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
}

// React Email Template Component
const PasswordResetEmail = ({ resetUrl, appName = "Knowledge Portal" }: { resetUrl: string; appName?: string }) => {
  return React.createElement('div', { style: { fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto' } },
    React.createElement('h1', { style: { color: '#333', textAlign: 'center' } }, `Reset Your ${appName} Password`),
    React.createElement('p', { style: { color: '#666', fontSize: '16px' } }, 
      'You requested a password reset for your account. Click the button below to create a new password:'
    ),
    React.createElement('div', { style: { textAlign: 'center', margin: '30px 0' } },
      React.createElement('a', {
        href: resetUrl,
        style: {
          backgroundColor: '#4F46E5',
          color: 'white',
          padding: '12px 24px',
          textDecoration: 'none',
          borderRadius: '6px',
          display: 'inline-block',
          fontWeight: 'bold'
        }
      }, 'Reset Password')
    ),
    React.createElement('p', { style: { color: '#888', fontSize: '14px' } },
      'Or copy and paste this link into your browser:'
    ),
    React.createElement('p', { style: { color: '#4F46E5', fontSize: '14px', wordBreak: 'break-all' } },
      resetUrl
    ),
    React.createElement('hr', { style: { margin: '30px 0', border: 'none', borderTop: '1px solid #eee' } }),
    React.createElement('p', { style: { color: '#888', fontSize: '12px' } },
      'If you didn\'t request this password reset, please ignore this email. This link will expire in 1 hour.'
    )
  );
};

const handler = async (req: Request): Promise<Response> => {
  console.log('🔐 Password reset request received');

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  try {
    const { email }: PasswordResetRequest = await req.json();
    console.log('📧 Processing password reset for:', email);

    if (!email?.trim()) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user exists in auth system first
    const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(email.trim());
    
    if (userError || !userData.user) {
      console.log('⚠️ User not found in auth system:', email.trim());
      // Always return success to prevent email enumeration attacks
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "If an account with this email exists, a password reset link has been sent."
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    // Also check if user has been approved (optional additional check)
    const { data: approvalData } = await supabase
      .from('user_approval_requests')
      .select('status')
      .eq('email', email.trim())
      .eq('status', 'approved')
      .single();

    if (!approvalData) {
      console.log('⚠️ User exists but not approved:', email.trim());
      // Still return success to prevent enumeration
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "If an account with this email exists, a password reset link has been sent."
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders }
        }
      );
    }

    console.log('✅ User verified, generating reset link for:', email.trim());

    // Generate password reset link using Supabase Admin API
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email.trim(),
      options: {
        redirectTo: `${req.headers.get('origin') || 'https://56051a92-562c-4d7b-ae59-82204f8b4c20.lovableproject.com'}/reset-password`
      }
    });

    if (error) {
      console.error('❌ Error generating reset link:', error);
      return new Response(
        JSON.stringify({ error: "Failed to generate reset link" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('✅ Reset link generated successfully');

    // Render the email template
    const emailHtml = await renderAsync(
      React.createElement(PasswordResetEmail, {
        resetUrl: data.properties?.action_link || '',
        appName: 'Knowledge Portal'
      })
    );

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "Knowledge Portal <noreply@mail.themoneybees.co>",
      to: [email.trim()],
      subject: "Reset Your Password - Knowledge Portal",
      html: emailHtml,
    });

    if (emailResponse.error) {
      console.error('❌ Error sending email:', emailResponse.error);
      
      // Handle Resend domain verification errors
      if (emailResponse.error.message?.includes('verify a domain')) {
        return new Response(
          JSON.stringify({ 
            error: "Email domain not verified. Please contact support or verify your domain at resend.com/domains",
            details: emailResponse.error.message 
          }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to send reset email", 
          details: emailResponse.error.message 
        }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('📬 Password reset email sent successfully:', emailResponse.data?.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Password reset email sent successfully",
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('💥 Unexpected error in password reset:', error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      }
    );
  }
};

serve(handler);