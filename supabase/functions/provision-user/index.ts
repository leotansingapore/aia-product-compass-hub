import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProvisionUserPayload {
  request_id: string;
  temp_password: string;
  initial_tier?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Parse request body
    const { request_id, temp_password, initial_tier }: ProvisionUserPayload = await req.json();

    if (!request_id || !temp_password) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: request_id and temp_password' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase clients
    const supabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      auth: { persistSession: false }
    });

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    });

    // Authenticate the requesting user
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has permission to provision accounts
    const { data: hasPermission } = await supabaseAdmin.rpc('has_role', {
      _user_id: user.id,
      _role: 'admin'
    });

    const { data: isMasterAdmin } = await supabaseAdmin.rpc('has_role', {
      _user_id: user.id,
      _role: 'master_admin'
    });

    if (!hasPermission && !isMasterAdmin) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions to provision users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the approval request
    const { data: approvalRequest, error: requestError } = await supabaseAdmin
      .from('user_approval_requests')
      .select('*')
      .eq('id', request_id)
      .eq('status', 'approved')
      .single();

    if (requestError || !approvalRequest) {
      return new Response(
        JSON.stringify({ error: 'Approval request not found or not approved' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user already exists in auth
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === approvalRequest.email);

    let userId: string;

    if (existingUser) {
      // User already exists, update their password
      userId = existingUser.id;
      
      const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        { password: temp_password }
      );

      if (passwordError) {
        throw passwordError;
      }
    } else {
      // Create new user account
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: approvalRequest.email,
        password: temp_password,
        email_confirm: true,
        user_metadata: {
          first_name: approvalRequest.first_name,
          last_name: approvalRequest.last_name,
        }
      });

      if (createError || !newUser.user) {
        throw createError;
      }

      userId = newUser.user.id;
    }

    // Create or update profile
    await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: userId,
        email: approvalRequest.email,
        first_name: approvalRequest.first_name,
        last_name: approvalRequest.last_name,
        display_name: `${approvalRequest.first_name || ''} ${approvalRequest.last_name || ''}`.trim() || 'User',
        first_login: true,
      }, { onConflict: 'user_id' });

    // Assign roles - first remove any existing roles
    await supabaseAdmin
      .from('user_roles')
      .delete()
      .eq('user_id', userId);

    // Add default user role
    const rolesToAdd = ['user'];
    
    // Add tier role if specified
    if (initial_tier && initial_tier !== 'user') {
      rolesToAdd.push(initial_tier);
    }

    const roleInserts = rolesToAdd.map(role => ({
      user_id: userId,
      role: role,
    }));

    await supabaseAdmin
      .from('user_roles')
      .insert(roleInserts);

    // Mark the approval request as provisioned (you might want to add a status for this)
    await supabaseAdmin
      .from('user_approval_requests')
      .update({
        notes: `Account provisioned on ${new Date().toISOString()} with ${initial_tier || 'standard'} access`
      })
      .eq('id', request_id);

    console.log(`Successfully provisioned user: ${approvalRequest.email} with ${initial_tier || 'standard'} access`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User account provisioned successfully',
        user_id: userId,
        email: approvalRequest.email,
        roles: rolesToAdd
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error provisioning user:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});