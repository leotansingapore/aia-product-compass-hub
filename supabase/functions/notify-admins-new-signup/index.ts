import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import React from 'npm:react@18.3.1';
import { AdminNotificationEmail } from './_templates/admin-notification.tsx';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const resend = new Resend(resendApiKey);

    const { email, firstName, lastName } = await req.json();

    console.log('New signup request from:', email);

    // Fetch all master admin emails
    const { data: masterAdmins, error: adminError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'master_admin');

    if (adminError) {
      throw new Error(`Failed to fetch master admins: ${adminError.message}`);
    }

    if (!masterAdmins || masterAdmins.length === 0) {
      console.log('No master admins found');
      return new Response(
        JSON.stringify({ success: true, message: 'No master admins to notify' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Get profile emails for master admins
    const adminUserIds = masterAdmins.map(admin => admin.user_id);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('email, display_name')
      .in('user_id', adminUserIds);

    if (profileError) {
      throw new Error(`Failed to fetch admin profiles: ${profileError.message}`);
    }

    const adminEmails = profiles?.filter(p => p.email).map(p => p.email) || [];

    if (adminEmails.length === 0) {
      console.log('No admin emails found');
      return new Response(
        JSON.stringify({ success: true, message: 'No admin emails to send to' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    console.log(`Sending notifications to ${adminEmails.length} master admins`);

    // Render email template
    const html = await renderAsync(
      React.createElement(AdminNotificationEmail, {
        userEmail: email,
        firstName: firstName || '',
        lastName: lastName || '',
        dashboardUrl: `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app')}/admin`
      })
    );

    // Send email to each admin
    const emailPromises = adminEmails.map(adminEmail =>
      resend.emails.send({
        from: 'FINternship <noreply@resend.dev>',
        to: [adminEmail],
        subject: '🔔 New User Registration Request',
        html,
      })
    );

    const results = await Promise.allSettled(emailPromises);
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`Email results: ${successful} successful, ${failed} failed`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Notified ${successful} master admins`,
        adminCount: adminEmails.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error: any) {
    console.error('Error in notify-admins-new-signup:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
