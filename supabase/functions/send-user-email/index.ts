import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { UserEmail } from "./_templates/user-email.tsx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
  to: string;
  subject: string;
  message: string;
  emailType?: 'notification' | 'welcome' | 'general';
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

  try {
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { to, subject, message, emailType = 'general' }: EmailPayload = await req.json();
    
    if (!to || !subject || !message) {
      return new Response(JSON.stringify({ error: "Missing required fields: to, subject, message" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Verify requester (must be admin or master_admin)
    const authClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });
    
    const { data: userRes, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userRes.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { 
        status: 401, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      });
    }
    
    const uid = userRes.user.id;
    const { data: roleCheck } = await authClient.rpc('has_role', { _user_id: uid, _role: 'admin' });
    const { data: masterCheck } = await authClient.rpc('has_role', { _user_id: uid, _role: 'master_admin' });
    
    if (!roleCheck && !masterCheck) {
      return new Response(JSON.stringify({ error: "Forbidden - Admin access required" }), { 
        status: 403, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      });
    }

    // Initialize Resend
    const resend = new Resend(RESEND_API_KEY);
    
    // Render the React email template
    const html = await renderAsync(
      React.createElement(UserEmail, {
        subject,
        message,
        emailType,
        recipientEmail: to,
      })
    );
    
    // Send email
    const { data, error: emailError } = await resend.emails.send({
      from: "FINternship <no-reply@resend.dev>",
      to: [to],
      subject,
      html,
    });
    
    if (emailError) {
      console.error('Resend error:', emailError);
      return new Response(JSON.stringify({ error: "Failed to send email", details: emailError }), { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      });
    }
    
    console.log(`Email sent successfully to ${to} with subject: ${subject}`);
    
    return new Response(JSON.stringify({ 
      success: true, 
      messageId: data?.id,
      message: "Email sent successfully" 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
    
  } catch (e: any) {
    console.error('Send email error:', e);
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});