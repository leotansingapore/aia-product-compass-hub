/**
 * One-off ADDITIVE insert: push GPP study + exam questions to question_bank_questions.
 * Unlike seed-question-bank.ts this does NOT delete existing rows — safe to run on
 * a populated table. Skips if GPP questions already present.
 *
 * Run with: SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/insert-gpp-questions.ts
 */
import { createClient } from '@supabase/supabase-js';
import { guaranteedProtectPlusStudyBank } from '../src/data/guaranteedProtectPlusStudyBank';
import { guaranteedProtectPlusExamQuestions } from '../src/data/guaranteedProtectPlusExamQuestions';

const SUPABASE_URL = 'https://hgdbflprrficdoyxmdxe.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY env var');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const PRODUCT_SLUG = 'guaranteed-protect-plus';

async function run() {
  // Refuse to insert if GPP rows already exist (idempotent guard).
  const { count, error: countError } = await supabase
    .from('question_bank_questions')
    .select('id', { count: 'exact', head: true })
    .eq('product_slug', PRODUCT_SLUG);
  if (countError) {
    console.error('Count error:', countError);
    process.exit(1);
  }
  if ((count ?? 0) > 0) {
    console.log(`GPP already has ${count} rows. Aborting to avoid duplicates.`);
    process.exit(0);
  }

  const banks = [
    { type: 'study' as const, data: guaranteedProtectPlusStudyBank },
    { type: 'exam' as const, data: guaranteedProtectPlusExamQuestions },
  ];

  let totalInserted = 0;
  for (const bank of banks) {
    const rows = bank.data.map((q, idx) => ({
      product_slug: PRODUCT_SLUG,
      bank_type: bank.type,
      category: q.category,
      question: q.question,
      options: q.options,
      correct_answer: q.correct,
      explanation: q.explanation,
      sort_order: idx,
    }));
    const batchSize = 100;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { error } = await supabase.from('question_bank_questions').insert(batch);
      if (error) {
        console.error(`Insert error for ${bank.type} batch ${i}:`, error);
        process.exit(1);
      }
    }
    console.log(`Inserted ${rows.length} ${bank.type} questions for ${PRODUCT_SLUG}`);
    totalInserted += rows.length;
  }

  console.log(`\nDone. ${totalInserted} GPP questions inserted.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
