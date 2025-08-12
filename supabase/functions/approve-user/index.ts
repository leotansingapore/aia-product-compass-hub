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
      // Create user using Supabase Auth Admin API
      const { data: createdUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: requestData.email,
        password: tempPassword || 'temppass123', // Use provided temp password if available
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

// If no temp password was provided, send a password reset email so user can set their own password
if (!tempPassword) {
  const origin = new URL(req.url).origin
  const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email: requestData.email,
    options: { redirectTo: `${origin}/force-password` }
  })

  if (resetError) {
    console.warn('Password reset email error:', resetError)
    // Don't fail the whole process for this
  }
}

    console.log('User approval completed successfully')

    // Verify the approval was successful by checking the profile creation
    const { data: verifyProfile, error: verifyError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, email')
      .eq('user_id', newUser.user.id)
      .single()

    if (verifyError) {
      console.warn('Profile verification failed:', verifyError)
    } else {
      console.log('Profile verification successful:', verifyProfile)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User approved successfully',
        user_id: newUser.user.id,
        profile_created: !verifyError,
        email: requestData.email
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