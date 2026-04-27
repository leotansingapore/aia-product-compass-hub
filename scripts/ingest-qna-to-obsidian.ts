// Ingest study bank + exam questions for all 6 core products into Obsidian.
// Usage: bun scripts/ingest-qna-to-obsidian.ts

import { guaranteedProtectPlusStudyBank } from '../src/data/guaranteedProtectPlusStudyBank';
import { guaranteedProtectPlusExamQuestions } from '../src/data/guaranteedProtectPlusExamQuestions';
import { healthshieldGoldMaxStudyBank } from '../src/data/healthshieldGoldMaxStudyBank';
import { healthshieldGoldMaxExamQuestions } from '../src/data/healthshieldGoldMaxExamQuestions';
import { platinumWealthVentureStudyBank } from '../src/data/platinumWealthVentureStudyBank';
import { platinumWealthVentureExamQuestions } from '../src/data/platinumWealthVentureExamQuestions';
import { proAchieverStudyBank } from '../src/data/proAchieverStudyBank';
import { proAchieverExamQuestions } from '../src/data/proAchieverExamQuestions';
import { proLifetimeProtectorStudyBank } from '../src/data/proLifetimeProtectorStudyBank';
import { proLifetimeProtectorExamQuestions } from '../src/data/proLifetimeProtectorExamQuestions';
import { solitairePaStudyBank } from '../src/data/solitairePaStudyBank';
import { solitairePaExamQuestions } from '../src/data/solitairePaExamQuestions';
import { ultimateCriticalCoverStudyBank } from '../src/data/ultimateCriticalCoverStudyBank';
import { ultimateCriticalCoverExamQuestions } from '../src/data/ultimateCriticalCoverExamQuestions';

import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

type Question = {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  category?: string;
};

const OBSIDIAN_BASE = '/Users/leo/Documents/Obsidian Vault/Content/product-sales';

const PRODUCTS: Array<{
  slug: string;
  name: string;
  studyBank: Question[];
  exam: Question[];
}> = [
  { slug: 'guaranteed-protect-plus', name: 'Guaranteed Protect Plus', studyBank: guaranteedProtectPlusStudyBank, exam: guaranteedProtectPlusExamQuestions },
  { slug: 'healthshield-gold-max', name: 'HealthShield Gold Max', studyBank: healthshieldGoldMaxStudyBank, exam: healthshieldGoldMaxExamQuestions },
  { slug: 'platinum-wealth-venture', name: 'Platinum Wealth Venture', studyBank: platinumWealthVentureStudyBank, exam: platinumWealthVentureExamQuestions },
  { slug: 'pro-achiever', name: 'Pro Achiever', studyBank: proAchieverStudyBank, exam: proAchieverExamQuestions },
  { slug: 'pro-lifetime-protector', name: 'Pro Lifetime Protector', studyBank: proLifetimeProtectorStudyBank, exam: proLifetimeProtectorExamQuestions },
  { slug: 'solitaire-pa', name: 'Solitaire PA', studyBank: solitairePaStudyBank, exam: solitairePaExamQuestions },
  { slug: 'ultimate-critical-cover', name: 'Ultimate Critical Cover', studyBank: ultimateCriticalCoverStudyBank, exam: ultimateCriticalCoverExamQuestions },
];

const LETTER = ['A', 'B', 'C', 'D', 'E', 'F'];

function prettyCategory(cat?: string): string {
  if (!cat) return 'Uncategorised';
  return cat
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function groupByCategory(questions: Question[]): Map<string, Question[]> {
  const groups = new Map<string, Question[]>();
  for (const q of questions) {
    const key = q.category ?? 'uncategorised';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(q);
  }
  return groups;
}

function renderQuestion(q: Question, idx: number): string {
  const lines: string[] = [];
  lines.push(`### Q${idx + 1}. ${q.question}`);
  lines.push('');
  q.options.forEach((opt, i) => {
    const correct = i === q.correct ? ' ✅' : '';
    lines.push(`- ${LETTER[i]}) ${opt}${correct}`);
  });
  lines.push('');
  lines.push(`**Explanation:** ${q.explanation}`);
  lines.push('');
  return lines.join('\n');
}

function renderBank(title: string, productName: string, questions: Question[], kind: 'study' | 'exam'): string {
  const groups = groupByCategory(questions);
  const totalCats = groups.size;

  const out: string[] = [];
  out.push(`# ${productName} — ${title}`);
  out.push('');
  out.push(`Source: \`src/data/\` in aia-product-compass-hub. ${questions.length} ${kind === 'study' ? 'study' : 'exam'} questions across ${totalCats} categories.`);
  out.push('');
  out.push('Use as supplementary material when writing or improving sales/training content for this product. If a question reveals a gap in the day-by-day notes, fix the notes. If a question itself is unclear or outdated, fix the question bank in code.');
  out.push('');
  out.push('---');
  out.push('');

  let runningIdx = 0;
  for (const [cat, qs] of groups) {
    out.push(`## ${prettyCategory(cat)} (${qs.length})`);
    out.push('');
    for (const q of qs) {
      out.push(renderQuestion(q, runningIdx));
      runningIdx += 1;
    }
    out.push('---');
    out.push('');
  }

  return out.join('\n');
}

function renderIndex(productName: string, studyCount: number, examCount: number): string {
  return [
    `# ${productName} — Q&A Index`,
    '',
    `Supplementary Q&A material ingested from the Product Compass Hub library.`,
    '',
    `- [[study-bank|Study Bank]] — ${studyCount} questions (full coverage, learning-oriented)`,
    `- [[exam-questions|Exam Questions]] — ${examCount} questions (test-oriented, scenario-heavy)`,
    '',
    '## How to use',
    '',
    '1. **Improve content from Q&A:** read the day-by-day notes in this product folder; if a Q&A reveals a fact, ratio, or scenario the notes don\'t cover well, update the notes.',
    '2. **Improve Q&A from content:** if a question is ambiguous, outdated, or reflects an old product spec, update the source file in `src/data/<product>StudyBank.ts` or `src/data/<product>ExamQuestions.ts` in aia-product-compass-hub.',
    '3. **Use as flashcards:** explanations are written as one-line teaching beats — good source material for talking points and objection handling.',
    '',
  ].join('\n');
}

let totalStudy = 0;
let totalExam = 0;

for (const p of PRODUCTS) {
  const dir = join(OBSIDIAN_BASE, p.slug);
  mkdirSync(dir, { recursive: true });

  const studyMd = renderBank('Study Bank', p.name, p.studyBank, 'study');
  const examMd = renderBank('Exam Questions', p.name, p.exam, 'exam');
  const indexMd = renderIndex(p.name, p.studyBank.length, p.exam.length);

  writeFileSync(join(dir, 'study-bank.md'), studyMd);
  writeFileSync(join(dir, 'exam-questions.md'), examMd);
  writeFileSync(join(dir, 'qna-index.md'), indexMd);

  totalStudy += p.studyBank.length;
  totalExam += p.exam.length;

  console.log(`${p.name.padEnd(28)} study=${p.studyBank.length.toString().padStart(3)}  exam=${p.exam.length.toString().padStart(3)}  -> ${dir}`);
}

console.log(`\nTotal: ${totalStudy} study + ${totalExam} exam = ${totalStudy + totalExam} questions across ${PRODUCTS.length} products.`);
