import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type TierLevel = 'explorer' | 'papers_taker' | 'post_rnf';

interface CreateUserRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  tier?: TierLevel;
  syncToGrowingAge?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  try {
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const supabaseAnon = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');

    const { data: { user }, error: authError } = await supabaseAnon.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    if (authError || !user) throw new Error('Unauthorized');

    const { data: roles, error: rolesError } = await supabaseServiceRole
      .from('user_admin_roles')
      .select('admin_role')
      .eq('user_id', user.id);
    if (rolesError) throw new Error('Failed to check user roles');

    const hasAdminRole = roles?.some(r => r.admin_role === 'admin' || r.admin_role === 'master_admin');
    if (!hasAdminRole) throw new Error('Insufficient permissions. Admin role required.');

    const body: CreateUserRequest = await req.json();
    const email = body.email?.trim().toLowerCase();
    const password = body.password;
    const firstName = body.firstName ?? '';
    const lastName = body.lastName ?? '';
    const displayName = body.displayName || `${firstName} ${lastName}`.trim() || 'User';
    const tier: TierLevel = body.tier ?? 'explorer';
    const syncToGrowingAge = body.syncToGrowingAge !== false;
    const fullName = `${firstName} ${lastName}`.trim() || displayName;

    if (!email || !password) throw new Error('Email and password are required');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) throw new Error('Invalid email format');
    if (password.length < 6) throw new Error('Password must be at least 6 characters long');

    const validTiers: TierLevel[] = ['explorer', 'papers_taker', 'post_rnf'];
    if (!validTiers.includes(tier)) throw new Error(`Invalid tier. Must be one of: ${validTiers.join(', ')}`);

    console.log('Creating user account for:', email, 'tier:', tier);

    const { data: existingUsers, error: checkError } = await supabaseServiceRole.auth.admin.listUsers();
    if (checkError) throw new Error('Failed to check existing users');
    const userExists = existingUsers.users.some(u => u.email === email);
    if (userExists) throw new Error('User with this email already exists');

    const { data: newUser, error: createError } = await supabaseServiceRole.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName, display_name: displayName }
    });
    if (createError) throw new Error(`Failed to create user: ${createError.message}`);
    if (!newUser.user) throw new Error('User creation failed - no user returned');

    const newUserId = newUser.user.id;
    console.log('Compass-hub user created:', newUserId);

    const { error: profileError } = await supabaseServiceRole
      .from('profiles')
      .insert({
        user_id: newUserId,
        email,
        first_name: firstName,
        last_name: lastName,
        display_name: displayName
      });
    if (profileError) console.error('profiles insert error:', profileError);

    const { error: roleError } = await supabaseServiceRole
      .from('user_roles')
      .insert({ user_id: newUserId, role: 'user' });
    if (roleError) console.error('user_roles insert error:', roleError);

    const { error: tierError } = await supabaseServiceRole
      .from('user_access_tiers')
      .upsert(
        { user_id: newUserId, tier_level: tier, granted_by: user.id },
        { onConflict: 'user_id' }
      );
    if (tierError) console.error('user_access_tiers upsert error:', tierError);

    let growingAgeResult: { success: boolean; userId?: string; error?: string } = { success: false };

    if (syncToGrowingAge) {
      const growingAgeUrl = Deno.env.get('GROWING_AGE_SUPABASE_URL');
      const growingAgeKey = Deno.env.get('GROWING_AGE_SUPABASE_SERVICE_ROLE_KEY');

      if (!growingAgeUrl || !growingAgeKey) {
        growingAgeResult = { success: false, error: 'GROWING_AGE_SUPABASE_* secrets not configured' };
        console.error(growingAgeResult.error);
      } else {
        try {
          const growingAgeClient = createClient(growingAgeUrl, growingAgeKey, {
            auth: { autoRefreshToken: false, persistSession: false }
          });

          const { data: gaUser, error: gaCreateError } = await growingAgeClient.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
          });

          let gaUserId: string | null = null;

          if (gaCreateError) {
            if (gaCreateError.code === 'email_exists') {
              console.warn('Growing-age user already exists, updating password');
              const { data: gaList } = await growingAgeClient.auth.admin.listUsers();
              const existing = gaList.users.find(u => u.email === email);
              if (!existing) throw new Error('email_exists reported but user not found');
              await growingAgeClient.auth.admin.updateUserById(existing.id, {
                password,
                email_confirm: true,
                user_metadata: { full_name: fullName }
              });
              gaUserId = existing.id;
            } else {
              throw gaCreateError;
            }
          } else {
            gaUserId = gaUser.user!.id;
          }

          const { error: gaProfileError } = await growingAgeClient
            .from('profiles')
            .upsert(
              {
                id: gaUserId,
                user_id: gaUserId,
                email,
                full_name: fullName,
                is_approved: true,
                requires_password_change: false,
              },
              { onConflict: 'user_id' }
            );
          if (gaProfileError) console.error('growing-age profiles upsert error:', gaProfileError);

          await growingAgeClient.from('user_roles').delete().eq('user_id', gaUserId);
          const { error: gaRoleError } = await growingAgeClient
            .from('user_roles')
            .insert({ user_id: gaUserId, role: 'consultant' });
          if (gaRoleError && !gaRoleError.message.includes('duplicate')) {
            console.error('growing-age user_roles insert error:', gaRoleError);
          }

          growingAgeResult = { success: true, userId: gaUserId! };
          console.log('Growing-age user synced:', gaUserId);
        } catch (gaErr: any) {
          console.error('Growing-age sync failed:', gaErr);
          growingAgeResult = { success: false, error: gaErr.message || String(gaErr) };
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: growingAgeResult.success
          ? 'User created on compass-hub and growing-age-calculator'
          : `User created on compass-hub. Growing-age sync: ${growingAgeResult.error ?? 'skipped'}`,
        user: { id: newUserId, email: newUser.user.email, created_at: newUser.user.created_at },
        tier,
        growingAge: growingAgeResult,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );

  } catch (error: any) {
    console.error('Error in create-user-account function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'An unexpected error occurred' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

serve(handler);
