import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

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
const { request_id }: { request_id: string } = await req.json()

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

    // Verify auth_user_id exists
    if (!requestData.auth_user_id) {
      console.error('No auth_user_id found in approval request')
      return new Response(
        JSON.stringify({ error: 'Invalid approval request - no auth account linked. User must re-register.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = requestData.auth_user_id
    console.log('Activating auth account:', userId)

    // Activate the existing auth account (enable login)
    const { error: activateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: true, // ENABLES LOGIN
      user_metadata: {
        first_name: requestData.first_name || '',
        last_name: requestData.last_name || '',
        display_name: `${requestData.first_name || ''} ${requestData.last_name || ''}`.trim() || 'User'
      }
    })

    if (activateError) {
      console.error('Error activating user account:', activateError)
      return new Response(
        JSON.stringify({ error: 'Failed to activate user account' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('User account activated successfully')

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

    // Assign default access tier and admin role in new system
    const { error: tierError } = await supabaseAdmin
      .from('user_access_tiers')
      .upsert({
        user_id: userId,
        tier_level: 'basic',
        granted_by: user.id
      }, { onConflict: 'user_id' })

    if (tierError) {
      console.error('Access tier assignment error:', tierError)
    }

    const { error: adminRoleError } = await supabaseAdmin
      .from('user_admin_roles')
      .upsert({
        user_id: userId,
        admin_role: 'user',
        granted_by: user.id
      }, { onConflict: 'user_id,admin_role' })

    if (adminRoleError) {
      console.error('Admin role assignment error:', adminRoleError)
    }

    console.log('Assigned default basic tier and user role to:', userId)

    // Mark the approval request as active (new status)
    const { error: approvalError } = await supabaseAdmin
      .from('user_approval_requests')
      .update({
        status: 'active',
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

    // Generate password reset link for the user to set their password
    let passwordResetLink = '';
    try {
      const { data: resetData, error: resetError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: requestData.email,
      });

      if (resetError) {
        console.error('Error generating password reset link:', resetError);
      } else if (resetData?.properties?.action_link) {
        passwordResetLink = resetData.properties.action_link;
        console.log('Password reset link generated');
      }
    } catch (resetLinkError) {
      console.error('Error generating reset link:', resetLinkError);
    }

    // Send approval notification email to the user with password reset link
    try {
      const notificationResponse = await fetch(
        `${supabaseUrl}/functions/v1/notify-user-approved`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseServiceKey}`,
          },
          body: JSON.stringify({
            email: requestData.email,
            firstName: requestData.first_name,
            lastName: requestData.last_name,
            passwordResetLink: passwordResetLink || undefined,
          }),
        }
      )

      if (!notificationResponse.ok) {
        console.error('Failed to send approval notification email')
      } else {
        console.log('Approval notification email sent to:', requestData.email)
      }
    } catch (emailError) {
      console.error('Error sending approval email:', emailError)
      // Don't fail the approval if email sending fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'User approved and account activated successfully',
        email: requestData.email,
        user_id: userId,
        instructions: 'User will receive an email with a link to set their password'
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