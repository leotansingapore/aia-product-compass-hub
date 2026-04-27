import { createClient } from '@supabase/supabase-js';

const url = 'https://hgdbflprrficdoyxmdxe.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZGJmbHBycmZpY2RveXhtZHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjY0NDAsImV4cCI6MjA2NzM0MjQ0MH0.2qwUbh0nkFyOLzzZgXk7bedINzHSf2ULMBUECOqWmIw';

const client = createClient(url, anonKey);

const targetId = '93c9aa6c-c534-4156-a50f-a450a33e3ff8';

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

  console.log('Signed in as master_admin');
  const accessToken = signInData.session.access_token;

  // Call admin-delete-users edge function
  const { data: deleteResult, error: deleteError } = await client.functions.invoke('admin-delete-users', {
    body: { user_ids: [targetId] },
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  if (deleteError) {
    console.error('Delete error:', deleteError.message);
  } else {
    console.log('Delete result:', JSON.stringify(deleteResult, null, 2));
  }

  // Verify only one profile remains
  const { data: profiles, error: profErr } = await client
    .from('profiles')
    .select('id, user_id, email, created_at')
    .eq('email', 'avyltest@gmail.com');

  if (profErr) {
    console.error('Profile query error:', profErr.message);
  } else {
    console.log('\nProfiles remaining:', profiles.length);
    profiles.forEach(p => {
      console.log('  - id:', p.id, '| user_id:', p.user_id, '| created_at:', p.created_at);
    });
  }

  // Verify completion data on the kept user
  const keptUserId = profiles?.[0]?.user_id;
  if (keptUserId) {
    const { data: firstData } = await client
      .from('first_60_days_progress')
      .select('*', { count: 'exact' })
      .eq('user_id', keptUserId);
    const { data: firstPassed } = await client
      .from('first_60_days_progress')
      .select('*', { count: 'exact' })
      .eq('user_id', keptUserId)
      .not('quiz_passed_at', 'is', null);

    const { data: nextData } = await client
      .from('next_60_days_progress')
      .select('*', { count: 'exact' })
      .eq('user_id', keptUserId);
    const { data: nextPassed } = await client
      .from('next_60_days_progress')
      .select('*', { count: 'exact' })
      .eq('user_id', keptUserId)
      .not('quiz_passed_at', 'is', null);

    console.log('\nCompletion verification:');
    console.log('  first_60_days_progress: rows=', firstData?.length ?? 0, 'passed=', firstPassed?.length ?? 0);
    console.log('  next_60_days_progress:  rows=', nextData?.length ?? 0, 'passed=', nextPassed?.length ?? 0);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
