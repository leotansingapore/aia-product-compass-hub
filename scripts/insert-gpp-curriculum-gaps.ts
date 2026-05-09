/**
 * One-off ADDITIVE insert: push GPP study rows #131-#139 (curriculum-gap closures
 * from audit Section C, 2026-04-27) to question_bank_questions.
 *
 * Skips if the rows already exist by sort_order to keep this idempotent.
 *
 * Run with: SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/insert-gpp-curriculum-gaps.ts
 */
import { createClient } from '@supabase/supabase-js';
import { guaranteedProtectPlusStudyBank } from '../src/data/guaranteedProtectPlusStudyBank';

const SUPABASE_URL = 'https://hgdbflprrficdoyxmdxe.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY env var');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const PRODUCT_SLUG = 'guaranteed-protect-plus';
const NEW_INDEXES = [130, 131, 132, 133, 134, 135, 136, 137, 138]; // sort_order = TS array index

async function run() {
  // Find which indexes already exist (idempotency).
  const { data: existing, error: fetchErr } = await supabase
    .from('question_bank_questions')
    .select('sort_order')
    .eq('product_slug', PRODUCT_SLUG)
    .eq('bank_type', 'study')
    .in('sort_order', NEW_INDEXES);
  if (fetchErr) {
    console.error('Fetch error:', fetchErr);
    process.exit(1);
  }
  const present = new Set((existing ?? []).map((r: { sort_order: number }) => r.sort_order));
  const toInsert = NEW_INDEXES.filter((i) => !present.has(i));
  if (toInsert.length === 0) {
    console.log('All curriculum-gap rows already present. Nothing to do.');
    return;
  }

  const rows = toInsert.map((idx) => {
    const q = guaranteedProtectPlusStudyBank[idx];
    if (!q) throw new Error(`Missing array entry: study #${idx}`);
    return {
      product_slug: PRODUCT_SLUG,
      bank_type: 'study' as const,
      category: q.category,
      question: q.question,
      options: q.options,
      correct_answer: q.correct,
      explanation: q.explanation,
      sort_order: idx,
    };
  });
  const { error } = await supabase.from('question_bank_questions').insert(rows);
  if (error) {
    console.error('Insert error:', error);
    process.exit(1);
  }
  console.log(`Inserted ${rows.length} curriculum-gap rows: study #${toInsert.join(', #')}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
