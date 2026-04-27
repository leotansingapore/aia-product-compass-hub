import { createClient } from '@supabase/supabase-js';

const url = 'https://hgdbflprrficdoyxmdxe.supabase.co';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!serviceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY not set');
  process.exit(1);
}

const client = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const targetId = '93c9aa6c-0e5a-4a7a-9a0b-9e8b7c6d5e4f';

async function main() {
  // 1. Delete auth user (this cascades to profiles via ON DELETE CASCADE if set)
  const { error: authErr } = await client.auth.admin.deleteUser(targetId);
  if (authErr) {
    console.error('Auth delete error:', authErr.message);
  } else {
    console.log('Auth user deleted:', targetId);
  }

  // 2. Verify only one profile remains
  const { data: profiles, error: profErr } = await client
    .from('profiles')
    .select('id, user_id, email, created_at')
    .eq('email', 'avyltest@gmail.com');

  if (profErr) {
    console.error('Profile query error:', profErr.message);
  } else {
    console.log('Profiles remaining:', profiles.length);
    profiles.forEach(p => {
      console.log('  - id:', p.id, '| user_id:', p.user_id, '| created_at:', p.created_at);
    });
  }

  // 3. Verify completion data on the kept user
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
