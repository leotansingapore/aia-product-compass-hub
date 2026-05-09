/**
 * One-off: apply audit fixes A.5 + A.6 to live GPP rows.
 * Re-reads the corrected TS files and UPDATEs the matching rows by
 * (product_slug, bank_type, sort_order). Does NOT delete or insert.
 *
 * Run with: SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/update-gpp-audit-fixes.ts
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

// (bank_type, sort_order in DB = TS array index)
const TARGETS: Array<{ bank: 'study' | 'exam'; sort_order: number }> = [
  { bank: 'exam', sort_order: 10 },  // Q11: waiting/exclusions/free-look
  { bank: 'study', sort_order: 28 }, // Q29: CI rider waiting periods
  { bank: 'study', sort_order: 31 }, // Q32: 25-yr entry-age cap
  { bank: 'study', sort_order: 32 }, // Q33: 20-yr entry-age cap
  { bank: 'study', sort_order: 33 }, // Q34: 15-yr entry-age cap
];

async function run() {
  let updated = 0;
  for (const t of TARGETS) {
    const arr = t.bank === 'study' ? guaranteedProtectPlusStudyBank : guaranteedProtectPlusExamQuestions;
    const q = arr[t.sort_order];
    if (!q) {
      console.error(`Missing array entry: ${t.bank} #${t.sort_order}`);
      continue;
    }
    const { error } = await supabase
      .from('question_bank_questions')
      .update({
        question: q.question,
        options: q.options,
        correct_answer: q.correct,
        explanation: q.explanation,
        category: q.category,
      })
      .eq('product_slug', PRODUCT_SLUG)
      .eq('bank_type', t.bank)
      .eq('sort_order', t.sort_order);
    if (error) {
      console.error(`Update failed for ${t.bank} #${t.sort_order}:`, error);
      process.exit(1);
    }
    console.log(`Updated ${t.bank} #${t.sort_order}: ${q.question.slice(0, 70)}...`);
    updated++;
  }
  console.log(`\nDone. ${updated} rows patched.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
