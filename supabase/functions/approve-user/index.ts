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

    // Check if user already exists in auth.users
    const { data: existingUser, error: userLookupError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1,
      filter: `email.eq.${requestData.email}`
    })
    
    if (userLookupError) {
      console.error('User lookup error:', userLookupError)
      return new Response(
        JSON.stringify({ error: 'Error checking existing user' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    let userId = null
    
    // Check if user exists in auth.users
    const userExists = existingUser && existingUser.users && existingUser.users.length > 0
    
    if (!userExists) {
      // Get the stored password from the approval request (stored during signup)
      const storedPassword = requestData.stored_password
      if (!storedPassword) {
        return new Response(
          JSON.stringify({ error: 'No stored password found for user. User must sign up again.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create the user account with their original password
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: requestData.email,
        password: storedPassword,
        email_confirm: true, // Auto-confirm email since admin is approving
        user_metadata: {
          first_name: requestData.first_name || '',
          last_name: requestData.last_name || ''
        }
      })

      if (createError) {
        console.error('User creation error:', createError)
        return new Response(
          JSON.stringify({ error: 'Failed to create user account' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      userId = newUser.user.id
      console.log('Created new user account:', userId)
    } else {
      // User already exists
      userId = existingUser.users[0].id
      console.log('User already exists:', userId)
    }

    // Create profile if it doesn't exist
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: userId,
        email: requestData.email,
        first_name: requestData.first_name,
        last_name: requestData.last_name,
        display_name: `${requestData.first_name || ''} ${requestData.last_name || ''}`.trim() || 'User'
      }, { onConflict: 'user_id' })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // Don't fail the approval for profile errors, just log
    }

    // Assign default user role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: 'user'
      }, { onConflict: 'user_id,role' })

    if (roleError) {
      console.error('Role assignment error:', roleError)
      // Don't fail the approval for role errors, just log
    }

    // Mark the approval request as approved
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
        message: 'User approved and account created successfully',
        email: requestData.email,
        user_id: userId,
        instructions: 'User can now sign in immediately with their original password'
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