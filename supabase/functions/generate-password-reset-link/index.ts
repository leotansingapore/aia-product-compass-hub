import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@4.0.0";

function renderPasswordResetEmail(resetUrl: string, userEmail: string): string {
  return `<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f5f5f5;margin:0;padding:40px 20px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:8px;padding:40px;">
    <h1 style="color:#1a1a2e;font-size:24px;margin:0 0 16px;">Reset Your Password</h1>
    <p style="color:#444;font-size:16px;line-height:1.5;">Hi,</p>
    <p style="color:#444;font-size:16px;line-height:1.5;">We received a request to reset the password for your FINternship account (${userEmail}). Click the button below to set a new password:</p>
    <div style="text-align:center;margin:32px 0;">
      <a href="${resetUrl}" style="background:#1a1a2e;color:#fff;text-decoration:none;padding:14px 28px;border-radius:6px;font-weight:600;display:inline-block;">Reset Password</a>
    </div>
    <p style="color:#666;font-size:14px;line-height:1.5;">Or copy this link into your browser:<br/><a href="${resetUrl}" style="color:#1a1a2e;word-break:break-all;">${resetUrl}</a></p>
    <p style="color:#999;font-size:13px;margin-top:32px;">If you didn't request this, you can safely ignore this email.</p>
  </div>
</body></html>`;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-app-origin",
};

interface Payload {
  email: string;
  send?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  try {
    const { email, send }: Payload = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
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
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }
    const uid = userRes.user.id;
    const { data: roleCheck } = await authClient.rpc('has_role', { _user_id: uid, _role: 'admin' });
    const { data: masterCheck } = await authClient.rpc('has_role', { _user_id: uid, _role: 'master_admin' });
    if (!roleCheck && !masterCheck) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const serviceClient = createClient(SUPABASE_URL, SERVICE_KEY);
    
    // Always use the production domain for password reset
    const appOrigin = "https://academy.finternship.com";

    // Check if user exists in auth, if not create them using profile data
    let { data: linkData, error: linkErr } = await serviceClient.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: `${appOrigin}/reset-password` },
    });

    // If user doesn't exist in auth but exists in profiles, create the auth user
    if (linkErr?.message?.includes('User not found') || linkErr?.message?.includes('not found')) {
      console.log(`User ${email} not found in auth, checking profiles table...`);
      
      // Query profiles table to get user data
      const { data: profileData, error: profileErr } = await serviceClient
        .from('profiles')
        .select('user_id, email, first_name, last_name, display_name')
        .eq('email', email)
        .single();

      if (profileErr || !profileData) {
        console.log(`No profile found for ${email}, proceeding to create minimal auth user...`);
      }
      const metaFirst = profileData?.first_name || '';
      const metaLast = profileData?.last_name || '';
      const metaDisplay = profileData?.display_name || email.split('@')[0];

      console.log(`Creating auth user for ${email} with metadata from ${profileData ? 'profile' : 'defaults'}...`);
      
      // Create auth user with available metadata
      const { data: createUserData, error: createUserErr } = await serviceClient.auth.admin.createUser({
        email: email,
        password: 'temporary-password-will-be-reset',
        email_confirm: true,
        user_metadata: {
          first_name: metaFirst,
          last_name: metaLast,
          display_name: metaDisplay
        }
      });

      if (createUserErr) {
        console.error('Failed to create auth user:', createUserErr);
        return new Response(JSON.stringify({ error: 'Failed to create auth user: ' + createUserErr.message }), { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        });
      }

      console.log(`Auth user created for ${email}, generating reset link...`);
      
      // Now generate the reset link for the newly created user
      const { data: newLinkData, error: newLinkErr } = await serviceClient.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: { redirectTo: "https://academy.finternship.com/reset-password" },
      });

      if (newLinkErr || !newLinkData) {
        return new Response(JSON.stringify({ error: newLinkErr?.message || 'Failed to generate reset link after user creation' }), { 
          status: 500, 
          headers: { "Content-Type": "application/json", ...corsHeaders } 
        });
      }

      linkData = newLinkData;
    } else if (linkErr || !linkData) {
      return new Response(JSON.stringify({ error: linkErr?.message || 'Failed to generate link' }), { 
        status: 500, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      });
    }

    // Force the redirect_to parameter to use production domain
    const rawActionLink = (linkData.properties?.action_link || linkData.action_link) as string;
    const verifyUrl = new URL(rawActionLink);
    verifyUrl.searchParams.set('redirect_to', 'https://academy.finternship.com/reset-password');
    const resetUrl = verifyUrl.toString();
    
    console.log('📍 Enforced reset URL:', resetUrl);

    // Send email via Resend with custom template if send flag is true
    if (send) {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      if (!RESEND_API_KEY) {
        return new Response(JSON.stringify({ error: "Email sending not configured (missing RESEND_API_KEY)", resetUrl }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
      }
      
      try {
        const resend = new Resend(RESEND_API_KEY);
        
        const html = renderPasswordResetEmail(resetUrl, email);

        
        const { error: emailError } = await resend.emails.send({
          from: "FINternship <no-reply@mail.themoneybees.co>",
          to: [email],
          subject: "Reset Your FINternship Account Password",
          html,
        });
        
        if (emailError) {
          console.error('Resend error:', emailError);
          // Return success with resetUrl so admins can copy the link even if email fails
          return new Response(
            JSON.stringify({ success: true, emailSent: false, resetUrl }),
            { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
        
        console.log(`Password reset email sent successfully to ${email}`);
      } catch (e) {
        console.error('Email send error:', e);
        const fallbackUrl = (linkData.properties?.action_link || linkData.action_link) as string;
        // Return success with resetUrl so admins can copy the link even if email fails
        return new Response(
          JSON.stringify({ success: true, emailSent: false, resetUrl: fallbackUrl }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      resetUrl: resetUrl,
      emailSent: !!send 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (e: any) {
    console.error('Password reset error:', e);
    return new Response(JSON.stringify({ 
      success: false, 
      error: e?.message || 'Unexpected error',
      details: e?.stack || 'No stack trace available'
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
