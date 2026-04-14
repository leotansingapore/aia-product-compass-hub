/**
 * One-time seed script: migrate hardcoded questions to Supabase question_bank_questions table.
 * Run with: npx tsx scripts/seed-question-bank.ts
 * Uses service role key to bypass RLS for bulk insert.
 */
import { createClient } from '@supabase/supabase-js';

// Import all 12 question files
import { proAchieverExamQuestions } from '../src/data/proAchieverExamQuestions';
import { proAchieverStudyBank } from '../src/data/proAchieverStudyBank';
import { platinumWealthVentureExamQuestions } from '../src/data/platinumWealthVentureExamQuestions';
import { platinumWealthVentureStudyBank } from '../src/data/platinumWealthVentureStudyBank';
import { healthshieldGoldMaxExamQuestions } from '../src/data/healthshieldGoldMaxExamQuestions';
import { healthshieldGoldMaxStudyBank } from '../src/data/healthshieldGoldMaxStudyBank';
import { proLifetimeProtectorExamQuestions } from '../src/data/proLifetimeProtectorExamQuestions';
import { proLifetimeProtectorStudyBank } from '../src/data/proLifetimeProtectorStudyBank';
import { solitairePaExamQuestions } from '../src/data/solitairePaExamQuestions';
import { solitairePaStudyBank } from '../src/data/solitairePaStudyBank';
import { ultimateCriticalCoverExamQuestions } from '../src/data/ultimateCriticalCoverExamQuestions';
import { ultimateCriticalCoverStudyBank } from '../src/data/ultimateCriticalCoverStudyBank';

const SUPABASE_URL = 'https://hgdbflprrficdoyxmdxe.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_SERVICE_ROLE_KEY env var');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

interface SourceQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category: 'product-facts' | 'sales-angles' | 'objection-handling' | 'roleplay';
}

interface DbRow {
  product_slug: string;
  bank_type: 'study' | 'exam';
  category: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
  sort_order: number;
}

const banks: Array<{ slug: string; type: 'study' | 'exam'; data: SourceQuestion[] }> = [
  { slug: 'pro-achiever', type: 'exam', data: proAchieverExamQuestions },
  { slug: 'pro-achiever', type: 'study', data: proAchieverStudyBank },
  { slug: 'platinum-wealth-venture', type: 'exam', data: platinumWealthVentureExamQuestions },
  { slug: 'platinum-wealth-venture', type: 'study', data: platinumWealthVentureStudyBank },
  { slug: 'healthshield-gold-max', type: 'exam', data: healthshieldGoldMaxExamQuestions },
  { slug: 'healthshield-gold-max', type: 'study', data: healthshieldGoldMaxStudyBank },
  { slug: 'pro-lifetime-protector', type: 'exam', data: proLifetimeProtectorExamQuestions },
  { slug: 'pro-lifetime-protector', type: 'study', data: proLifetimeProtectorStudyBank },
  { slug: 'solitaire-pa', type: 'exam', data: solitairePaExamQuestions },
  { slug: 'solitaire-pa', type: 'study', data: solitairePaStudyBank },
  { slug: 'ultimate-critical-cover', type: 'exam', data: ultimateCriticalCoverExamQuestions },
  { slug: 'ultimate-critical-cover', type: 'study', data: ultimateCriticalCoverStudyBank },
];

async function seed() {
  // Clear existing data (idempotent re-runs)
  console.log('Clearing existing question_bank_questions...');
  const { error: deleteError } = await supabase
    .from('question_bank_questions')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) {
    console.error('Delete error:', deleteError);
    process.exit(1);
  }

  let totalInserted = 0;
  for (const bank of banks) {
    const rows: DbRow[] = bank.data.map((q, idx) => ({
      product_slug: bank.slug,
      bank_type: bank.type,
      category: q.category,
      question: q.question,
      options: q.options,
      correct_answer: q.correct,
      explanation: q.explanation,
      sort_order: idx,
    }));

    // Insert in batches of 100
    const batchSize = 100;
    for (let i = 0; i < rows.length; i += batchSize) {
      const batch = rows.slice(i, i + batchSize);
      const { error } = await supabase.from('question_bank_questions').insert(batch);
      if (error) {
        console.error(`Insert error for ${bank.slug}/${bank.type} batch ${i}:`, error);
        process.exit(1);
      }
    }
    console.log(`Inserted ${rows.length} questions for ${bank.slug}/${bank.type}`);
    totalInserted += rows.length;
  }

  console.log(`\nDone. Total questions inserted: ${totalInserted}`);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
