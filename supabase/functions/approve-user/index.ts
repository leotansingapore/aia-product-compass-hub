import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ApproveUserRequest {
  request_id: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Verify this is a POST request
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Create regular client for auth operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the user is authenticated and has admin permissions
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user has admin role
    const { data: hasRole, error: roleError } = await supabaseAdmin
      .rpc('has_role', { _user_id: user.id, _role: 'master_admin' })

    if (roleError) {
      console.error('Role check error:', roleError)
      return new Response(
        JSON.stringify({ error: 'Error checking permissions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!hasRole) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { request_id }: ApproveUserRequest = await req.json()

    if (!request_id) {
      return new Response(
        JSON.stringify({ error: 'Missing request_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get the approval request details
    const { data: requestData, error: requestError } = await supabaseAdmin
      .from('user_approval_requests')
      .select('*')
      .eq('id', request_id)
      .eq('status', 'pending')
      .single()

    if (requestError || !requestData) {
      console.error('Request fetch error:', requestError)
      return new Response(
        JSON.stringify({ error: 'Request not found or already processed' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Processing approval for:', requestData.email)

    // Check if user already exists
    const { data: existingUser, error: userLookupError } = await supabaseAdmin.auth.admin.getUserByEmail(requestData.email)
    
    let newUser = existingUser
    
    if (userLookupError && userLookupError.message.includes('User not found')) {
      // Create user using Supabase Auth Admin API
      const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: requestData.email,
        password: 'temppass123', // User will need to reset this
        email_confirm: true,
        user_metadata: {
          first_name: requestData.first_name,
          last_name: requestData.last_name
        }
      })

      if (createError || !createdUser.user) {
        console.error('User creation error:', createError)
        return new Response(
          JSON.stringify({ error: 'Failed to create user account' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
      
      newUser = createdUser
      console.log('User created successfully:', newUser.user.id)
    } else if (userLookupError) {
      console.error('User lookup error:', userLookupError)
      return new Response(
        JSON.stringify({ error: 'Error checking existing user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      console.log('User already exists:', newUser.user.id)
    }

    // Call our database function to create profile and assign role
    const { error: approvalError } = await supabaseAdmin
      .rpc('approve_user_request_simple', {
        request_id: request_id,
        new_user_id: newUser.user.id,
        approving_user_id: user.id
      })

    if (approvalError) {
      console.error('Approval function error:', approvalError)
      // If profile creation fails, we should delete the user account
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id)
      return new Response(
        JSON.stringify({ error: 'Failed to complete user approval process' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send password reset email so user can set their own password
    const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: requestData.email,
    })

    if (resetError) {
      console.warn('Password reset email error:', resetError)
      // Don't fail the whole process for this
    }

    console.log('User approval completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User approved successfully',
        user_id: newUser.user.id 
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})