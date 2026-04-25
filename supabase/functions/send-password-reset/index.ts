import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/render@0.0.17';
import * as React from 'npm:react@18.3.1';
import { PasswordResetEmail } from './_templates/password-reset.tsx';

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

    // Validate email format
    if (!email?.trim()) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    // Get client IP for rate limiting
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    
    console.log('🌐 Client IP:', clientIp);

    // Clean up old rate limit records (older than 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabase
      .from('password_reset_rate_limits')
      .delete()
      .lt('attempted_at', twentyFourHoursAgo);

    // Check rate limits - Email based (3 per 24 hours)
    const { data: emailAttempts, error: emailRateLimitError } = await supabase
      .from('password_reset_rate_limits')
      .select('*')
      .eq('email', trimmedEmail)
      .gte('attempted_at', twentyFourHoursAgo);

    if (emailRateLimitError) {
      console.error('❌ Error checking email rate limit:', emailRateLimitError);
    }

    if (emailAttempts && emailAttempts.length >= 3) {
      console.log('⚠️ Rate limit exceeded for email:', trimmedEmail);
      return new Response(
        JSON.stringify({ 
          error: "Too many password reset attempts. Please try again in 24 hours.",
          rateLimitExceeded: true
        }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check rate limits - IP based (10 per 24 hours)
    if (clientIp !== 'unknown') {
      const { data: ipAttempts, error: ipRateLimitError } = await supabase
        .from('password_reset_rate_limits')
        .select('*')
        .eq('ip_address', clientIp)
        .gte('attempted_at', twentyFourHoursAgo);

      if (ipRateLimitError) {
        console.error('❌ Error checking IP rate limit:', ipRateLimitError);
      }

      if (ipAttempts && ipAttempts.length >= 10) {
        console.log('⚠️ Rate limit exceeded for IP:', clientIp);
        return new Response(
          JSON.stringify({ 
            error: "Too many password reset attempts from this network. Please try again in 24 hours.",
            rateLimitExceeded: true
          }),
          { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Record this attempt for rate limiting
    await supabase
      .from('password_reset_rate_limits')
      .insert({
        email: trimmedEmail,
        ip_address: clientIp
      });

    console.log('✅ Rate limit check passed');

    // Quick check: verify user exists in auth before proceeding with email send
    const { data: authUsers } = await supabase.auth.admin.listUsers();
    const authUser = authUsers?.users?.find(u => u.email?.toLowerCase() === trimmedEmail);
    
    if (!authUser) {
      console.log('⚠️ No auth user found for email:', trimmedEmail);
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

    console.log('✅ Auth user found, proceeding with password reset');

    // Always use the production domain for password reset
    const redirectTo = 'https://academy.finternship.com/reset-password';
    console.log('📍 Using redirect URL:', redirectTo);

    // Generate password reset link using Supabase Admin API
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email.trim(),
      options: {
        redirectTo
      }
    });

    if (error) {
      console.error('❌ Error generating reset link:', error);
      const msg = (error as any)?.message || '';
      if (msg.toLowerCase().includes('not found')) {
        // Hide existence details to avoid enumeration
        return new Response(
          JSON.stringify({ 
            success: true,
            message: "If an account with this email exists, a password reset link has been sent."
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
      return new Response(
        JSON.stringify({ error: "Failed to generate reset link" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log('✅ Reset link generated successfully');

    // Force the redirect_to parameter to use production domain
    const rawActionLink = data.properties?.action_link || data.action_link || '';
    const verifyUrl = new URL(rawActionLink);
    verifyUrl.searchParams.set('redirect_to', 'https://academy.finternship.com/reset-password');
    const resetUrl = verifyUrl.toString();
    
    console.log('📍 Enforced reset URL:', resetUrl);

    // Render the email template with React Email
    const emailHtml = await renderAsync(
      React.createElement(PasswordResetEmail, {
        resetUrl: resetUrl,
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