import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ActivateAccountRequest {
  email: string;
  password: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Activate account function called');

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
    // Initialize Supabase clients
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
    const { email, password }: ActivateAccountRequest = await req.json();

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    console.log('Checking approval request for:', email);

    // Check if there's an approved request for this email
    const { data: approvedRequest, error: requestError } = await supabaseServiceRole
      .from('user_approval_requests')
      .select('*')
      .eq('email', email)
      .eq('status', 'approved')
      .single();

    if (requestError || !approvedRequest) {
      throw new Error('No approved account request found for this email');
    }

  console.log('Found approved request, validating password');

  // Get the stored password from the approval request
  const storedPassword = approvedRequest.password_hash;
  if (!storedPassword) {
    throw new Error('No password found for this approved request. User may need to use password reset.');
  }

  // Validate that the provided password matches the stored signup password
  if (password !== storedPassword) {
    throw new Error('Invalid password. Please use the password you set during registration.');
  }

  // Check if user already exists in auth.users
  const { data: existingUsers, error: checkError } = await supabaseServiceRole.auth.admin.listUsers();
  if (checkError) {
    console.error('Error checking existing users:', checkError);
    throw new Error('Failed to check existing users');
  }

  const userExists = existingUsers.users.some(u => u.email === email);
  if (userExists) {
    throw new Error('User account already exists. Try signing in directly.');
  }

  console.log('Password validated, creating user account');

  // Use the password they originally set during signup
  const { data: newUser, error: createError } = await supabaseServiceRole.auth.admin.createUser({
    email,
    password: storedPassword, // Use their original password
    email_confirm: true, // Auto-confirm email
    user_metadata: {
      first_name: approvedRequest.first_name || '',
      last_name: approvedRequest.last_name || '',
      display_name: `${approvedRequest.first_name || ''} ${approvedRequest.last_name || ''}`.trim() || 'User'
    }
  });

    if (createError) {
      console.error('Error creating user:', createError);
      throw new Error(`Failed to create user: ${createError.message}`);
    }

    if (!newUser.user) {
      throw new Error('User creation failed - no user returned');
    }

    console.log('User created successfully:', newUser.user.id);

    // Create profile for the new user
    const { error: profileError } = await supabaseServiceRole
      .from('profiles')
      .insert({
        user_id: newUser.user.id,
        email: email,
        first_name: approvedRequest.first_name || '',
        last_name: approvedRequest.last_name || '',
        display_name: `${approvedRequest.first_name || ''} ${approvedRequest.last_name || ''}`.trim() || 'User'
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
    }

    // Assign default user role
    const { error: roleError } = await supabaseServiceRole
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role: 'user'
      });

    if (roleError) {
      console.error('Error assigning role:', roleError);
    }

    // Mark the request as completed
    const { error: updateError } = await supabaseServiceRole
      .from('user_approval_requests')
      .update({ status: 'completed' })
      .eq('id', approvedRequest.id);

    if (updateError) {
      console.error('Error updating request status:', updateError);
    }

    console.log('Account activation complete');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Account activated successfully',
        user: {
          id: newUser.user.id,
          email: newUser.user.email,
          created_at: newUser.user.created_at
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );

  } catch (error: any) {
    console.error('Error in activate-account function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred' 
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      }
    );
  }
};

serve(handler);