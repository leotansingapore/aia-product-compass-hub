import { createClient } from '@supabase/supabase-js';

const url = 'https://hgdbflprrficdoyxmdxe.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZGJmbHBycmZpY2RveXhtZHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjY0NDAsImV4cCI6MjA2NzM0MjQ0MH0.2qwUbh0nkFyOLzzZgXk7bedINzHSf2ULMBUECOqWmIw';

const client = createClient(url, anonKey);

async function main() {
  // Sign in as master admin
  const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
    email: 'master_admin@demo.com',
    password: 'demo123456'
  });

  if (signInError) {
    console.error('Sign in error:', signInError.message);
    process.exit(1);
  }

  const accessToken = signInData.session.access_token;
  const supabaseAuth = createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } }
  });

  // 1. Check for orphaned profile with old user_id
  const oldUserId = '93c9aa6c-c534-4156-a50f-a450a33e3ff8';
  const { data: oldProfile } = await supabaseAuth
    .from('profiles')
    .select('id, user_id, email, created_at')
    .eq('user_id', oldUserId);
  
  console.log('Old profile found:', oldProfile?.length ?? 0);
  if (oldProfile?.length > 0) {
    console.log('  - id:', oldProfile[0].id, '| user_id:', oldProfile[0].user_id, '| created_at:', oldProfile[0].created_at);
  }

  // 2. Check next_60_days_progress for the kept user
  const keptUserId = '38c43109-3f3f-467b-8cb9-7c8304d61513';
  const { data: nextProgress, error: nextErr } = await supabaseAuth
    .from('next_60_days_progress')
    .select('day_number, quiz_passed_at, read_at')
    .eq('user_id', keptUserId)
    .order('day_number');

  if (nextErr) {
    console.error('next_60 query error:', nextErr.message);
  } else {
    console.log('\nnext_60_days_progress rows:', nextProgress?.length ?? 0);
    if (nextProgress?.length > 0) {
      console.log('  First 3 rows:', nextProgress.slice(0, 3));
      console.log('  Last 3 rows:', nextProgress.slice(-3));
    }
  }

  // 3. Also check first_60 for completeness
  const { data: firstProgress } = await supabaseAuth
    .from('first_60_days_progress')
    .select('day_number, quiz_passed_at')
    .eq('user_id', keptUserId)
    .order('day_number');
  
  console.log('\nfirst_60_days_progress rows:', firstProgress?.length ?? 0);
}

main().catch(e => { console.error(e); process.exit(1); });
