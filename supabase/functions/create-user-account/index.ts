import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateUserRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Create user account function called');

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

    const supabaseAnon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get the current user making the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user has admin privileges
    const { data: roles, error: rolesError } = await supabaseAnon
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    if (rolesError) {
      throw new Error('Failed to check user roles');
    }

    const hasAdminRole = roles?.some(r => r.role === 'admin' || r.role === 'master_admin');
    if (!hasAdminRole) {
      throw new Error('Insufficient permissions. Admin role required.');
    }

    // Parse request body
    const { email, password, firstName, lastName, displayName }: CreateUserRequest = await req.json();

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Invalid email format');
    }

    // Validate password strength
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    console.log('Creating user account for:', email);

    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabaseServiceRole.auth.admin.listUsers();
    if (checkError) {
      console.error('Error checking existing users:', checkError);
      throw new Error('Failed to check existing users');
    }

    const userExists = existingUsers.users.some(u => u.email === email);
    if (userExists) {
      throw new Error('User with this email already exists');
    }

    // Create the user using admin API
    const { data: newUser, error: createError } = await supabaseServiceRole.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: firstName || '',
        last_name: lastName || '',
        display_name: displayName || `${firstName || ''} ${lastName || ''}`.trim() || 'User'
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
        first_name: firstName || '',
        last_name: lastName || '',
        display_name: displayName || `${firstName || ''} ${lastName || ''}`.trim() || 'User'
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Don't throw here, just log - the user account is created
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
      // Don't throw here, just log - the user account is created
    }

    console.log('User account creation complete');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'User account created successfully',
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
    console.error('Error in create-user-account function:', error);
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