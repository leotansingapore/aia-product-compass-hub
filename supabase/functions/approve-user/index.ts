import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ApproveUserRequest {
  request_id: string
  temp_password?: string
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
const { request_id, temp_password }: ApproveUserRequest = await req.json()

if (!request_id) {
  return new Response(
    JSON.stringify({ error: 'Missing request_id' }),
    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  )
}

// Validate temp password if provided
const tempPassword = (temp_password && typeof temp_password === 'string') ? temp_password.trim() : ''
if (tempPassword && tempPassword.length < 6) {
  return new Response(
    JSON.stringify({ error: 'temp_password must be at least 6 characters' }),
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
    const { data: existingUser, error: userLookupError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1,
      filter: `email.eq.${requestData.email}`
    })
    
    let newUser = null
    
    if (userLookupError) {
      console.error('User lookup error:', userLookupError)
      return new Response(
        JSON.stringify({ error: 'Error checking existing user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Check if user exists in the list
    const userExists = existingUser && existingUser.users && existingUser.users.length > 0
    
    if (!userExists) {
      console.log('User account will be created when they sign in with their chosen password');
    } else {
      // User already exists, use the existing user
      newUser = { user: existingUser.users[0] }
      console.log('User already exists:', newUser.user.id)

      // If a temp password is provided, update the user's password
      if (tempPassword) {
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          newUser.user.id,
          { password: tempPassword }
        )
        if (updateError) {
          console.error('Failed to update existing user password:', updateError)
          return new Response(
            JSON.stringify({ error: 'Failed to set temporary password for existing user' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        console.log('Temporary password set for existing user')
      }
    }

    // Just mark the approval request as approved - user account will be created when they sign in
    const { error: approvalError } = await supabaseAdmin
      .from('user_approval_requests')
      .update({
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id
      })
      .eq('id', request_id)

    if (approvalError) {
      console.error('Approval update error:', approvalError)
      return new Response(
        JSON.stringify({ error: 'Failed to update approval status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User approval completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User approved successfully',
        email: requestData.email,
        instructions: 'User can now sign in with their chosen password'
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