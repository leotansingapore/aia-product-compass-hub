import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DemoAccountRequest {
  email: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders })
    }

    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { email } = await req.json() as DemoAccountRequest

    if (!email) {
      return new Response('Email is required', { status: 400, headers: corsHeaders })
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseServiceRole.auth.admin.listUsers()
    const userExists = existingUser.users.some(user => user.email === email)

    if (userExists) {
      console.log(`Demo user ${email} already exists`)
      return new Response(JSON.stringify({ message: 'User already exists' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create the demo user
    const { data: newUser, error: createError } = await supabaseServiceRole.auth.admin.createUser({
      email,
      password: 'demo123456',
      email_confirm: true,
      user_metadata: {
        display_name: email === 'master_admin@demo.com' ? 'Master Admin Demo' :
                     email === 'admin@demo.com' ? 'Admin Demo' : 'User Demo'
      }
    })

    if (createError) {
      console.error('Error creating demo user:', createError)
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (!newUser.user) {
      return new Response('Failed to create user', { status: 500, headers: corsHeaders })
    }

    // Create profile
    const { error: profileError } = await supabaseServiceRole
      .from('profiles')
      .insert({
        user_id: newUser.user.id,
        email,
        display_name: email === 'master_admin@demo.com' ? 'Master Admin Demo' :
                     email === 'admin@demo.com' ? 'Admin Demo' : 'User Demo',
        first_name: email === 'master_admin@demo.com' ? 'Master Admin' :
                   email === 'admin@demo.com' ? 'Admin' : 'User',
        last_name: 'Demo'
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // Don't fail the whole process for profile creation
    }

    // Assign role
    const role = email === 'master_admin@demo.com' ? 'master_admin' :
                email === 'admin@demo.com' ? 'admin' : 'user'

    const { error: roleError } = await supabaseServiceRole
      .from('user_roles')
      .insert({
        user_id: newUser.user.id,
        role
      })

    if (roleError) {
      console.error('Error assigning role:', roleError)
      // Don't fail the whole process for role assignment
    }

    console.log(`Demo account created successfully: ${email} with role: ${role}`)

    return new Response(JSON.stringify({ 
      message: 'Demo account created successfully',
      user_id: newUser.user.id,
      role 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})