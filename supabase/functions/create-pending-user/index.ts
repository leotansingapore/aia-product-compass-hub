import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreatePendingUserRequest {
  email: string;
  firstName: string;
  lastName: string;
  reason?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Create pending user function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }

  try {
    // Initialize Supabase client with service role
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Parse request body
    const { email, firstName, lastName, reason }: CreatePendingUserRequest = await req.json();

    if (!email || !firstName) {
      throw new Error('Email and first name are required');
    }

    const trimmedEmail = email.trim().toLowerCase();

    console.log('Creating pending user for:', trimmedEmail);

    // Check if there's already a pending approval request
    const { data: existingRequest, error: requestError } = await supabaseServiceRole
      .from('user_approval_requests')
      .select('id, status, auth_user_id')
      .eq('email', trimmedEmail)
      .maybeSingle();

    if (requestError) {
      console.error('Error checking approval request:', requestError);
      throw new Error('Failed to check existing registration');
    }

    // If there's a pending approval request, inform the user
    if (existingRequest && existingRequest.status === 'pending') {
      return new Response(
        JSON.stringify({ 
          error: 'A registration request with this email is already pending approval. Please wait for admin approval or contact support.'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // If there's an active/approved request, check if they just need to login
    if (existingRequest && existingRequest.status === 'active') {
      return new Response(
        JSON.stringify({ 
          error: 'An account with this email already exists. Please try logging in. If you forgot your password, use the "Forgot password?" link.'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // Check if user already exists in auth.users
    const { data: existingUsers, error: checkError } = await supabaseServiceRole.auth.admin.listUsers();
    if (checkError) {
      console.error('Error checking existing users:', checkError);
      throw new Error('Failed to check existing users');
    }

    const existingUser = existingUsers.users.find(u => u.email?.toLowerCase() === trimmedEmail);
    
    // If user exists and email is confirmed, they should just login
    if (existingUser && existingUser.email_confirmed_at) {
      return new Response(
        JSON.stringify({ 
          error: 'An account with this email already exists. Please try logging in. If you forgot your password, use the "Forgot password?" link.'
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        }
      );
    }

    // If user exists but email NOT confirmed, this is an inactive/pending account
    // Check if we should reuse it or create a new one
    let authUserId = existingUser?.id;

    if (!authUserId) {
      // No existing auth account, create a new one

      // Generate secure random password (user won't use this - they'll set password via reset link)
      const tempPassword = crypto.randomUUID() + crypto.randomUUID();

      // Create auth account (INACTIVE - email_confirm: false blocks login)
      const { data: newUser, error: createError } = await supabaseServiceRole.auth.admin.createUser({
        email: trimmedEmail,
        password: tempPassword,
        email_confirm: false, // CRITICAL: Blocks login until admin approval
        user_metadata: {
          first_name: firstName,
          last_name: lastName || '',
          display_name: `${firstName} ${lastName || ''}`.trim()
        }
      });

      if (createError) {
        console.error('Error creating auth user:', createError);
        throw new Error(`Failed to create user account: ${createError.message}`);
      }

      if (!newUser.user) {
        throw new Error('User creation failed - no user returned');
      }

      authUserId = newUser.user.id;
      console.log('Auth account created (inactive):', authUserId);
    } else {
      // Reusing existing inactive auth account
      console.log('Reusing existing inactive auth account:', authUserId);
      
      // Update the metadata in case name changed
      await supabaseServiceRole.auth.admin.updateUserById(authUserId, {
        user_metadata: {
          first_name: firstName,
          last_name: lastName || '',
          display_name: `${firstName} ${lastName || ''}`.trim()
        }
      });
    }

    // Create or update approval request linked to auth account
    if (existingRequest && existingRequest.status === 'rejected') {
      // Update existing rejected request to pending
      const { error: updateError } = await supabaseServiceRole
        .from('user_approval_requests')
        .update({
          first_name: firstName,
          last_name: lastName || '',
          reason: reason || 'User registration request (resubmitted)',
          status: 'pending',
          auth_user_id: authUserId,
          requested_at: new Date().toISOString(),
          reviewed_at: null,
          reviewed_by: null
        })
        .eq('id', existingRequest.id);

      if (updateError) {
        console.error('Error updating approval request:', updateError);
        throw new Error('Failed to update approval request');
      }
      
      console.log('Approval request updated (resubmitted)');
    } else {
      // Create new approval request
      const { error: approvalError } = await supabaseServiceRole
        .from('user_approval_requests')
        .insert({
          email: trimmedEmail,
          first_name: firstName,
          last_name: lastName || '',
          reason: reason || 'User registration request',
          status: 'pending',
          auth_user_id: authUserId // Link to auth account
        });

      if (approvalError) {
        console.error('Error creating approval request:', approvalError);
        // Try to clean up the auth account if we just created it
        if (!existingUser) {
          try {
            await supabaseServiceRole.auth.admin.deleteUser(authUserId);
          } catch (cleanupError) {
            console.error('Failed to cleanup auth account:', cleanupError);
          }
        }
        throw new Error('Failed to create approval request');
      }

      console.log('Approval request created successfully');
    }


    // Notify admins about new signup
    try {
      await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/notify-admins-new-signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          },
          body: JSON.stringify({
            email: trimmedEmail,
            firstName: firstName,
            lastName: lastName || '',
          }),
        }
      );
      console.log('Admin notification sent');
    } catch (notifyError) {
      console.error('Failed to send admin notification:', notifyError);
      // Don't fail the request if notification fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Registration submitted successfully. Your account is pending admin approval.',
        needsApproval: true
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('Error in create-pending-user function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred during registration' 
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);
