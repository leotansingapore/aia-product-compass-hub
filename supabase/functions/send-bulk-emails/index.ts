import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@4.0.0";
import { renderAsync } from "npm:@react-email/components@0.0.22";
import React from "npm:react@18.3.1";
import { UserEmail } from "../send-user-email/_templates/user-email.tsx";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BulkEmailPayload {
  userIds: string[];
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
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

  try {
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const { userIds, subject, message, emailType = 'general' }: BulkEmailPayload = await req.json();
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return new Response(JSON.stringify({ error: "userIds array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!subject || !message) {
      return new Response(JSON.stringify({ error: "subject and message are required" }), {
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

    // Get user emails from profiles
    const serviceClient = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: profiles, error: profilesError } = await serviceClient
      .from('profiles')
      .select('user_id, email, display_name')
      .in('user_id', userIds)
      .not('email', 'is', null);

    if (profilesError) {
      return new Response(JSON.stringify({ error: "Failed to fetch user emails" }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ error: "No valid email addresses found for the specified users" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Initialize Resend
    const resend = new Resend(RESEND_API_KEY);
    
    // Send emails to all users
    const results = [];
    let successCount = 0;
    let errorCount = 0;

    for (const profile of profiles) {
      try {
        if (!profile.email) {
          results.push({
            userId: profile.user_id,
            email: null,
            success: false,
            error: "No email address"
          });
          errorCount++;
          continue;
        }

        // Render the React email template
        const html = await renderAsync(
          React.createElement(UserEmail, {
            subject,
            message,
            emailType,
            recipientEmail: profile.email,
          })
        );
        
        // Send email
        const { data, error: emailError } = await resend.emails.send({
          from: "FINternship <no-reply@resend.dev>",
          to: [profile.email],
          subject,
          html,
        });
        
        if (emailError) {
          console.error(`Failed to send email to ${profile.email}:`, emailError);
          results.push({
            userId: profile.user_id,
            email: profile.email,
            success: false,
            error: emailError.message || "Failed to send email"
          });
          errorCount++;
        } else {
          console.log(`Email sent successfully to ${profile.email}`);
          results.push({
            userId: profile.user_id,
            email: profile.email,
            success: true,
            messageId: data?.id
          });
          successCount++;
        }
      } catch (e: any) {
        console.error(`Error processing email for user ${profile.user_id}:`, e);
        results.push({
          userId: profile.user_id,
          email: profile.email,
          success: false,
          error: e.message || "Unexpected error"
        });
        errorCount++;
      }
    }
    
    return new Response(JSON.stringify({ 
      success: true,
      totalSent: successCount,
      totalFailed: errorCount,
      results
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
    
  } catch (e: any) {
    console.error('Bulk email error:', e);
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});