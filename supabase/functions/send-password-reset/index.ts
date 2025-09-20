import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import { Resend } from "npm:resend@2.0.0";
import { renderAsync } from 'npm:@react-email/components@0.0.22';
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

    if (!email?.trim()) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if user exists via profiles (auth lookup by email not available)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', email.trim())
      .single();

    if (profileError || !profile?.user_id) {
      console.log('⚠️ No profile found for email (treat as non-existent account):', email.trim());
      console.log('EARLY_EXIT: not sending email (no profile)');
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

    // Optional: previously we blocked unapproved users. Now we proceed to send reset if account exists.
    console.log('ℹ️ Proceeding to send reset email regardless of approval status for:', email.trim());
    console.log('✅ User verified, generating reset link for:', email.trim());

    // Generate password reset link using Supabase Admin API
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email.trim(),
      options: {
        redirectTo: 'https://56051a92-562c-4d7b-ae59-82204f8b4c20.lovableproject.com/reset-password'
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

    // Render the email template with React Email
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