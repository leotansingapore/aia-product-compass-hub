import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeleteUsersPayload {
  user_ids?: string[];
  approval_request_ids?: string[];
  emails?: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const payload: DeleteUsersPayload = await req.json();
    const user_ids = Array.isArray(payload.user_ids) ? payload.user_ids : [];
    const approval_request_ids = Array.isArray(payload.approval_request_ids) ? payload.approval_request_ids : [];
    const emailsParam = Array.isArray(payload.emails) ? payload.emails : [];

    if (user_ids.length === 0 && approval_request_ids.length === 0 && emailsParam.length === 0) {
      return new Response(JSON.stringify({ error: "Provide user_ids and/or approval_request_ids or emails" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Authenticate requester
    const authClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: req.headers.get("Authorization") || "" } },
    });
    const { data: userRes, error: userErr } = await authClient.auth.getUser();
    if (userErr || !userRes.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    // Only master admins can delete users
    const { data: isMaster } = await authClient.rpc('has_role', { _user_id: userRes.user.id, _role: 'master_admin' });
    if (!isMaster) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      });
    }

    const serviceClient = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    // Clean related tables first (profiles, user_roles)
    const { error: rolesError } = await serviceClient.from('user_roles').delete().in('user_id', user_ids);
    if (rolesError) {
      console.log('user_roles delete error', rolesError);
    }
    const { error: profilesError } = await serviceClient.from('profiles').delete().in('user_id', user_ids);
    if (profilesError) {
      console.log('profiles delete error', profilesError);
    }

    // Delete from Auth
    const results: { id: string; success: boolean; error?: string }[] = [];
    for (const id of user_ids) {
      try {
        const { error } = await serviceClient.auth.admin.deleteUser(id);
        if (error) {
          results.push({ id, success: false, error: error.message });
        } else {
          results.push({ id, success: true });
        }
      } catch (e: any) {
        results.push({ id, success: false, error: e?.message || 'Unknown error' });
      }
    }

    const failed = results.filter(r => !r.success);
    const succeeded = results.filter(r => r.success);

    // Also remove any approval requests for these users (by id or email)
    let deletedRequests = 0;

    // Emails from profiles of deleted users
    const emailsFromProfiles: string[] = [];
    if (user_ids.length > 0) {
      const { data: profs } = await serviceClient
        .from('profiles')
        .select('email')
        .in('user_id', user_ids);
      const profEmails = (profs || []).map((p: any) => p.email).filter(Boolean);
      emailsFromProfiles.push(...(profEmails as string[]));
    }

    const uniqueEmails = Array.from(new Set([...(emailsParam || []), ...emailsFromProfiles].filter(Boolean)));

    if (approval_request_ids.length > 0) {
      const { data: delById } = await serviceClient
        .from('user_approval_requests')
        .delete()
        .in('id', approval_request_ids)
        .select('id');
      deletedRequests += delById?.length || 0;
    }

    if (uniqueEmails.length > 0) {
      const { data: delByEmail } = await serviceClient
        .from('user_approval_requests')
        .delete()
        .in('email', uniqueEmails)
        .select('id');
      deletedRequests += delByEmail?.length || 0;
    }

    return new Response(
      JSON.stringify({
        success: failed.length === 0,
        deleted: succeeded.map(s => s.id),
        failed,
        deleted_requests: deletedRequests,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (e: any) {
    console.error('admin-delete-users error', e);
    return new Response(JSON.stringify({ error: e?.message || 'Unexpected error' }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
});
