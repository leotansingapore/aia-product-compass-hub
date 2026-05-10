/**
 * One-off cross-product audit fixes — applies the 3 still-valid factual
 * errors flagged in the 2026-04-27 product-bank audits:
 *  - HSGM study Q73: "500+ AQHP doctors" -> "600+ AQHP specialists" per Brochure p.5
 *  - Solitaire PA exam roleplay Q (hawker hot oil): "burns and scalds" ->
 *    canonical "Accidental Dismemberment and Burns Benefit" per PS p.6
 *  - UCC study Q120 (final summary roleplay): "150 illnesses" framing ->
 *    canonical "73 illnesses across 150 condition-stages" per Brochure p.13,
 *    plus the major-stage-only unlimited caveat per Brochure footnote 1 p.14
 *
 * Looks up rows by partial question-text match (no sort_order coupling).
 * Run with: SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/update-cross-product-audit-fixes.ts
 */
import { createClient } from '@supabase/supabase-js';
import { healthshieldGoldMaxStudyBank } from '../src/data/healthshieldGoldMaxStudyBank';
import { solitairePaExamQuestions } from '../src/data/solitairePaExamQuestions';
import { ultimateCriticalCoverStudyBank } from '../src/data/ultimateCriticalCoverStudyBank';

const SUPABASE_URL = 'https://hgdbflprrficdoyxmdxe.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY env var');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

interface QShape {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: string;
}

const TARGETS: Array<{
  product_slug: string;
  bank_type: 'study' | 'exam';
  match_question_substring: string;
  source_array: QShape[];
  label: string;
}> = [
  {
    product_slug: 'healthshield-gold-max',
    bank_type: 'study',
    match_question_substring: 'best response when a prospect asks why AIA premiums are higher',
    source_array: healthshieldGoldMaxStudyBank as QShape[],
    label: 'HSGM Q73 AQHP 500->600',
  },
  {
    product_slug: 'solitaire-pa',
    bank_type: 'exam',
    match_question_substring: 'hawker stall owner who works with hot oil',
    source_array: solitairePaExamQuestions as QShape[],
    label: 'Solitaire PA roleplay (burns & scalds)',
  },
  {
    product_slug: 'ultimate-critical-cover',
    bank_type: 'study',
    match_question_substring: 'final summary before signing',
    source_array: ultimateCriticalCoverStudyBank as QShape[],
    label: 'UCC Q120 final summary (150 illnesses)',
  },
];

async function run() {
  let updated = 0;
  for (const t of TARGETS) {
    const tsRow = t.source_array.find((q) =>
      q.question.includes(t.match_question_substring),
    );
    if (!tsRow) {
      console.error(`No TS match for ${t.label}: substring "${t.match_question_substring}"`);
      continue;
    }
    const { data, error: fetchErr } = await supabase
      .from('question_bank_questions')
      .select('id,question,sort_order')
      .eq('product_slug', t.product_slug)
      .eq('bank_type', t.bank_type)
      .ilike('question', `%${t.match_question_substring}%`);
    if (fetchErr) {
      console.error(`Fetch error for ${t.label}:`, fetchErr);
      continue;
    }
    if (!data || data.length === 0) {
      console.error(`No DB row found for ${t.label}`);
      continue;
    }
    if (data.length > 1) {
      console.error(`Ambiguous DB match for ${t.label}: ${data.length} rows`);
      continue;
    }
    const dbRow = data[0];
    const { error: updErr } = await supabase
      .from('question_bank_questions')
      .update({
        question: tsRow.question,
        options: tsRow.options,
        correct_answer: tsRow.correct,
        explanation: tsRow.explanation,
        category: tsRow.category,
      })
      .eq('id', dbRow.id);
    if (updErr) {
      console.error(`Update error for ${t.label}:`, updErr);
      continue;
    }
    console.log(`Updated ${t.label} (sort_order ${dbRow.sort_order})`);
    updated++;
  }
  console.log(`\nDone. ${updated} rows patched.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
