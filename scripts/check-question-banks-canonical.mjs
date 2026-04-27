#!/usr/bin/env node
// Guards against regression on canonical Product Summary values in
// the in-app question banks. If any pattern below appears in a bank
// file, the script exits 1 — fail the build.
//
// Patterns are anchored to the audits in
// /Users/leo/Documents/Obsidian Vault/Content/product-sales/_audit/
// To add a new guard, append a row under the relevant product.

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(__dirname, '..', 'src', 'data');

const checks = [
  {
    product: 'Pro Achiever',
    files: ['proAchieverStudyBank.ts', 'proAchieverExamQuestions.ts'],
    badPatterns: [
      { pattern: /101%\s*(of\s*)?(net\s*)?(total\s*)?premiums/i, reason: 'capital guarantee is 100% of net premiums in, not 101%' },
      { pattern: /\$1\/month\s+(distribution|charge)/i, reason: 'distribution cost ~ S$11/month, not S$1/month' },
      { pattern: /distribution\s+cost.*\$1\s+per\s+month/i, reason: 'distribution cost ~ S$11/month, not S$1/month' },
      { pattern: /welcome\s+bonus.*(?:only|exclusively|just)\s+(?:paid\s+|credited\s+)?in\s+year\s+1\b/i, reason: 'welcome bonus pays years 1-3, not year 1 only' },
      { pattern: /10[-\s]year\s+lock[-\s]?in/i, reason: 'no separate 10-year lock-in; use IIP charge framing' },
    ],
  },
  {
    product: 'Guaranteed Protect Plus',
    files: ['guaranteedProtectPlusStudyBank.ts', 'guaranteedProtectPlusExamQuestions.ts'],
    badPatterns: [
      { pattern: /special\s+conditions.*(cease|end|stop).*age\s*21\b/i, reason: 'Special Conditions cut-off is age 85, not 21' },
      { pattern: /vitality\s+platinum.*\+\s*\$?500\s*\/?\s*(yr|year|annum)/i, reason: 'Vitality Platinum is +5% of Base PUD, not +$500/yr' },
    ],
  },
  {
    product: 'HealthShield Gold Max',
    files: ['healthshieldGoldMaxStudyBank.ts', 'healthshieldGoldMaxExamQuestions.ts'],
    badPatterns: [
      { pattern: /S?\$\s*3,?000\s+co-?(insurance|payment|pay)\s+cap/i, reason: 'co-insurance cap is S$6,000, not S$3,000' },
      { pattern: /co-?(insurance|payment|pay)\s+cap.*S?\$\s*3,?000/i, reason: 'co-insurance cap is S$6,000, not S$3,000' },
      { pattern: /waiver\s+pass/i, reason: 'fictitious "Waiver Pass" mechanism — does not exist in canonical sources' },
      { pattern: /plan\s+b\s+lite.*S?\$\s*500,?000/i, reason: 'Plan B Lite annual limit is S$300K, not S$500K' },
      { pattern: /S?\$\s*500,?000.*plan\s+b\s+lite/i, reason: 'Plan B Lite annual limit is S$300K, not S$500K' },
      { pattern: /vitalhealth\s+a\s+value/i, reason: 'fictitious "VitalHealth A Value" tier' },
      { pattern: /AQHP.*panel.*500\+/i, reason: 'AQHP panel is over 600, not 500+' },
    ],
  },
  {
    product: 'Ultimate Critical Cover',
    files: ['ultimateCriticalCoverStudyBank.ts', 'ultimateCriticalCoverExamQuestions.ts'],
    badPatterns: [
      { pattern: /covers?\s+150\s+illnesses?/i, reason: 'UCC covers 73 CIs across 150 condition-stage entries' },
      { pattern: /150\s+critical\s+illnesses/i, reason: 'UCC covers 73 CIs across 150 condition-stage entries' },
      { pattern: /53[-\s]illness(es)?/i, reason: '53-illness framing is a competitor (GE) figure — flag as illustrative' },
    ],
  },
  {
    product: 'Pro Lifetime Protector',
    files: ['proLifetimeProtectorStudyBank.ts', 'proLifetimeProtectorExamQuestions.ts'],
    badPatterns: [
      { pattern: /matur(es|ity)\s+(at\s+)?age\s+99\b/i, reason: 'PLP maturity age is 100, not 99' },
      { pattern: /LCC.*S?\$\s*350,?000/i, reason: 'LCC cap is 300% of Insured Amount, not S$350K flat' },
      { pattern: /S?\$\s*350,?000.*LCC/i, reason: 'LCC cap is 300% of Insured Amount, not S$350K flat' },
      { pattern: /Mercer.*US?\$\s*16\s*[Tt](rillion)?/i, reason: 'Mercer AUA is US$12.9T, not US$16T' },
      { pattern: /Mercer.*\$\s*267\s*[Bb](illion)?/i, reason: 'Mercer figure is US$12.9T AUA / 40+ years; $267B is stale' },
    ],
  },
  {
    product: 'Solitaire PA',
    files: ['solitairePaStudyBank.ts', 'solitairePaExamQuestions.ts'],
    badPatterns: [
      { pattern: /disability\s+income\s+benefit/i, reason: 'rider is "Monthly Disability Care Benefit"' },
      { pattern: /extended\s+medical\s+reimbursement/i, reason: 'fictitious "Extended Medical Reimbursement" rider' },
      { pattern: /burns?\s*\/\s*scalds?/i, reason: 'Benefit 4 is "Accidental Dismemberment and Burns"' },
    ],
  },
  {
    product: 'Platinum Wealth Venture',
    files: ['platinumWealthVentureStudyBank.ts', 'platinumWealthVentureExamQuestions.ts'],
    badPatterns: [
      { pattern: /3\.6\s*%\s*p\.?a\.?\s*(deducted\s+monthly\s+)?for\s+(the\s+)?first\s+7\s+(policy\s+)?years/i, reason: 'supplementary charge runs 10 years, not 7' },
      { pattern: /supplementary\s+charge.*7\s+(policy\s+)?years/i, reason: 'supplementary charge runs 10 years, not 7' },
      { pattern: /minimum\s+annual\s+premium\s+(is\s+)?S?\$\s*18,?000/i, reason: 'minimum annual premium is S$7,800, not S$18,000' },
      { pattern: /S?\$\s*18,?000.*minimum\s+(annual\s+)?premium/i, reason: 'minimum annual premium is S$7,800, not S$18,000' },
      { pattern: /investment\s+bonus.*7\s*%.*one[-\s]?time.*year\s+8/i, reason: 'Investment Bonus is 2.5% x 4 (Y9-Y12), not 7% one-time at Y8' },
      { pattern: /7\s*%\s+(of\s+annualized?\s+(regular\s+)?premium\s+)?(paid\s+)?(once\s+)?at.*year\s+8/i, reason: 'Investment Bonus is 2.5% x 4 (Y9-Y12), not 7% one-time at Y8' },
      { pattern: /performance\s+bonus.*0\.50?\s*%.*year\s+8/i, reason: 'Performance Bonus is 0.30% from Year 9, not 0.50% from Year 8' },
      { pattern: /secondary\s+insured.*(cannot\s+exceed|max(imum)?).*age\s+70\b/i, reason: 'Secondary Insured max age at appointment is 75, not 70' },
      { pattern: /age\s+70.*secondary\s+insured.*appointment/i, reason: 'Secondary Insured max age at appointment is 75, not 70' },
      { pattern: /partial\s+withdrawals?\s+(are\s+)?not\s+allowed\s+in\s+years?\s+1\s*[-\u2013]\s*2/i, reason: 'partial withdrawals allowed from Year 1 with declining charge factor' },
    ],
  },
];

// Extract spans of affirmed-correct text from a TS bank file:
// every explanation: "..." literal, plus the option string at index
// `correct` in each options array. Distractor options (wrong-answer
// MCQ options) are intentionally false and excluded from checking.
function extractAffirmedSpans(content) {
  const spans = [];

  for (const m of content.matchAll(/explanation:\s*"((?:[^"\\]|\\.)*)"/g)) {
    const lineNumber = content.slice(0, m.index ?? 0).split('\n').length;
    spans.push({ kind: 'explanation', text: m[1], line: lineNumber });
  }

  for (const m of content.matchAll(/options:\s*\[([\s\S]*?)\],\s*correct:\s*(\d+)/g)) {
    const optionsBlob = m[1];
    const correctIdx = parseInt(m[2], 10);
    const optStrings = [...optionsBlob.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1]);
    if (Number.isFinite(correctIdx) && optStrings[correctIdx] !== undefined) {
      const lineNumber = content.slice(0, m.index ?? 0).split('\n').length;
      spans.push({ kind: 'correct-option', text: optStrings[correctIdx], line: lineNumber });
    }
  }

  return spans;
}

let totalFailures = 0;
const failures = [];

for (const check of checks) {
  for (const file of check.files) {
    const fullPath = resolve(dataDir, file);
    let content;
    try {
      content = readFileSync(fullPath, 'utf8');
    } catch (err) {
      console.error(`ERROR: cannot read ${file} - ${err.message}`);
      totalFailures++;
      continue;
    }

    const spans = extractAffirmedSpans(content);

    for (const { pattern, reason } of check.badPatterns) {
      for (const span of spans) {
        const match = span.text.match(pattern);
        if (!match) continue;
        if (isRefutation(span.text, match)) continue;

        failures.push({
          product: check.product,
          file,
          line: span.line,
          kind: span.kind,
          match: match[0],
          pattern: pattern.source,
          reason,
        });
        totalFailures++;
      }
    }
  }
}

// A match is a refutation (false positive) when the bad value is being
// explicitly denied, contrasted, or flagged as illustrative — not asserted as truth.
// Examples: "no separate 10-year lock-in", "ceases at age 85 (NOT age 21)",
// "the GE 53-illness figure is illustrative", "Neither X nor Y contains 'Waiver Pass'".
function isRefutation(text, match) {
  const matched = match[0];
  const start = match.index ?? 0;
  const end = start + matched.length;

  // The matched text itself contains an explicit "NOT" (capitalised emphasis or "(NOT")
  // \bnot\b matches "NOT" / "(NOT" but not "cannot" (no word boundary).
  if (/\bnot\b/i.test(matched)) return true;

  // Find the enclosing sentence (split on `. ` or `; ` or newline).
  const sentenceStart = Math.max(
    text.lastIndexOf('. ', start),
    text.lastIndexOf('; ', start),
    text.lastIndexOf('\n', start),
    -1
  );
  let sentenceEnd = text.indexOf('. ', end);
  if (sentenceEnd === -1) sentenceEnd = text.length;
  const sentence = text.slice(sentenceStart + 1, sentenceEnd);

  // Sentence-level refutation: any clear denial, contrast, or illustrative-flag.
  if (/\b(?:not|no|nor|neither|isn't|aren't|wasn't|doesn't|don't|won't|never|without)\b/i.test(sentence)) return true;
  if (/\b(?:illustrative|Great\s+Eastern|competitor|time-?bound|fictitious|removed|stale|obsolete)\b/i.test(sentence)) return true;
  if (/\bGE\b/.test(sentence)) return true; // case-sensitive: company name, not "ge" within other words
  if (/\b(?:do(?:es)?\s+not\s+(?:appear|exist|mention|contain))\b/i.test(sentence)) return true;

  return false;
}

if (totalFailures === 0) {
  console.log(`\u2713 question-bank canonical-values guard: all 14 bank files clean across ${checks.length} products`);
  process.exit(0);
}

console.error(`\u2717 question-bank canonical-values guard: ${totalFailures} forbidden pattern(s) found in affirmed-correct text\n`);
for (const f of failures) {
  console.error(`  [${f.product}] ${f.file}:${f.line} (${f.kind})`);
  console.error(`    matched: "${f.match}"`);
  console.error(`    pattern: /${f.pattern}/i`);
  console.error(`    reason:  ${f.reason}\n`);
}
console.error(`See /Users/leo/Documents/Obsidian Vault/Content/product-sales/_audit/ for the full audits.`);
process.exit(1);
