/**
 * One-off ADDITIVE insert: GPP exam parity rows (sort_order 36-55) and study
 * suitability deepening rows (sort_order 139-142). Idempotent — skips rows
 * that already exist by (bank_type, sort_order).
 *
 * Run with: SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/insert-gpp-parity.ts
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

const TARGETS: Array<{ bank: 'study' | 'exam'; range: number[] }> = [
  { bank: 'exam', range: Array.from({ length: 20 }, (_, i) => 36 + i) }, // 36..55
  { bank: 'study', range: [139, 140, 141, 142] },
];

async function run() {
  let totalInserted = 0;
  for (const t of TARGETS) {
    const arr = t.bank === 'study' ? guaranteedProtectPlusStudyBank : guaranteedProtectPlusExamQuestions;
    const { data: existing, error: fetchErr } = await supabase
      .from('question_bank_questions')
      .select('sort_order')
      .eq('product_slug', PRODUCT_SLUG)
      .eq('bank_type', t.bank)
      .in('sort_order', t.range);
    if (fetchErr) {
      console.error('Fetch error:', fetchErr);
      process.exit(1);
    }
    const present = new Set((existing ?? []).map((r: { sort_order: number }) => r.sort_order));
    const toInsert = t.range.filter((i) => !present.has(i));
    if (toInsert.length === 0) {
      console.log(`${t.bank}: all rows already present`);
      continue;
    }
    const rows = toInsert.map((idx) => {
      const q = arr[idx];
      if (!q) throw new Error(`Missing array entry: ${t.bank} #${idx}`);
      return {
        product_slug: PRODUCT_SLUG,
        bank_type: t.bank,
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
      console.error(`Insert error (${t.bank}):`, error);
      process.exit(1);
    }
    console.log(`Inserted ${rows.length} ${t.bank} rows: #${toInsert.join(', #')}`);
    totalInserted += rows.length;
  }
  console.log(`\nDone. ${totalInserted} rows inserted.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
