#!/usr/bin/env node
// Apply the 2026-11-01 product-fact corrections to the live quiz table.
//
// The study and exam pages read `question_bank_questions`, not src/data/*StudyBank.ts and
// *ExamQuestions.ts. The live rows were edited directly in June/July 2026, so the corrections were
// written against each row's CURRENT wording: scripts/quiz-live-fixes-2026-11-01.json holds, per row,
// the live snapshot (question, options, correct_answer, explanation) read on 2026-11-01 and the
// minimal edits that carry the corrected fact. docs/quiz-live-fixes-2026-11-01.md lists them old -> new.
//
// Guard: a row is updated only while all four fields still equal its snapshot, so a row edited
// since the snapshot is left alone and reported. Updates happen in place (ids kept).
//
// Run (Supabase Management API SQL endpoint, token at ~/.local/state/va-watchdog/token; never
// the service-role key):
//   node scripts/update-question-bank-product-facts.mjs --self-test   # offline check of the guard and SQL
//   node scripts/update-question-bank-product-facts.mjs --dry-run     # read-only: compare live rows with the snapshot
//   node scripts/update-question-bank-product-facts.mjs --apply       # update rows that still match

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "scripts/quiz-live-fixes-2026-11-01.json");
const FIELDS = ["question", "options", "correct_answer", "explanation"];
const BATCH = 25;

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const opts = (o) => (typeof o === "string" ? JSON.parse(o) : o); // jsonb may arrive as text
const norm = (row) => ({
  question: row.question,
  options: opts(row.options),
  correct_answer: Number(row.correct_answer),
  explanation: row.explanation,
});
const eq = (a, b) => JSON.stringify(norm(a)) === JSON.stringify(norm(b));

/** The row's values after its edits. */
export function finalValues(fix) {
  const out = { ...fix.live };
  for (const e of fix.edits) out[e.field] = e.new;
  return out;
}

/** match: still equals the snapshot; already: already holds the new values; changed: anything else. */
export function classify(fix, liveRow) {
  if (!liveRow) return "missing";
  if (eq(liveRow, fix.live)) return "match";
  if (eq(liveRow, finalValues(fix))) return "already";
  return "changed";
}

/** One guarded UPDATE for a batch of fixes; returns the ids it changed. */
export function updateSql(fixes) {
  const values = fixes
    .map((f) => {
      const o = f.live;
      const n = finalValues(f);
      return (
        `(${q(f.id)}::uuid, ${q(o.question)}, ${q(JSON.stringify(o.options))}::jsonb, ${Number(o.correct_answer)}, ${q(o.explanation)}, ` +
        `${q(n.question)}, ${q(JSON.stringify(n.options))}::jsonb, ${Number(n.correct_answer)}, ${q(n.explanation)})`
      );
    })
    .join(",\n");
  return (
    `update public.question_bank_questions t set question = v.nq, options = v.nopt, correct_answer = v.nc, explanation = v.ne, updated_at = now()\n` +
    `from (values\n${values}\n) as v(id, oq, oopt, oc, oe, nq, nopt, nc, ne)\n` +
    `where t.id = v.id and t.question = v.oq and t.options = v.oopt and t.correct_answer = v.oc and t.explanation = v.oe\n` +
    `returning t.id;`
  );
}

function selfTest() {
  const fix = {
    id: "00000000-0000-0000-0000-000000000001",
    live: { question: "Q", options: ["a", "it's b"], correct_answer: 1, explanation: "old" },
    edits: [{ field: "explanation", old: "old", new: "new" }, { field: "correct_answer", old: 1, new: 0 }],
  };
  const t = (row, want) => {
    const got = classify(fix, row);
    if (got !== want) throw new Error(`self-test: expected ${want}, got ${got}`);
  };
  t({ ...fix.live }, "match");
  t({ ...fix.live, options: JSON.stringify(fix.live.options), correct_answer: "1" }, "match"); // text-typed API values
  t({ ...fix.live, explanation: "new", correct_answer: 0 }, "already");
  t({ ...fix.live, explanation: "edited by an admin" }, "changed");
  t(undefined, "missing");
  const sql = updateSql([fix]);
  if (!sql.includes(`'["a","it''s b"]'::jsonb`) || !sql.includes("t.explanation = v.oe") || !sql.includes(", 0, 'new')"))
    throw new Error("self-test: SQL quoting, guard or new values wrong");
  console.log("self-test passed");
}

async function main() {
  const mode = process.argv.find((a) => ["--dry-run", "--apply", "--self-test"].includes(a));
  if (!mode) {
    console.log("Usage: node scripts/update-question-bank-product-facts.mjs --self-test | --dry-run | --apply");
    process.exit(1);
  }
  if (mode === "--self-test") return selfTest();

  const { rows: fixes } = JSON.parse(readFileSync(DATA, "utf8"));
  for (const f of fixes) {
    for (const e of f.edits) {
      if (!FIELDS.includes(e.field) || JSON.stringify(e.old) !== JSON.stringify(f.live[e.field]))
        throw new Error(`change file: edit ${f.id}/${e.field} does not start from the snapshot`);
    }
  }
  const ref = (readFileSync(join(ROOT, ".env"), "utf8").match(/VITE_SUPABASE_PROJECT_ID="?([^"\n]+)/) || [])[1];
  const token = readFileSync(join(homedir(), ".local/state/va-watchdog/token"), "utf8").trim();
  const runSql = async (query) => {
    const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
      method: "POST",
      // Cloudflare rejects the default fetch User-Agent on this endpoint.
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "User-Agent": "Mozilla/5.0" },
      body: JSON.stringify({ query }),
    });
    const text = await res.text();
    if (!res.ok) throw new Error(`${res.status}: ${text.slice(0, 400)}`);
    return JSON.parse(text);
  };

  const live = await runSql(
    `select id, question, options, correct_answer, explanation from public.question_bank_questions where id in (${fixes.map((f) => `${q(f.id)}::uuid`).join(", ")});`,
  );
  const byId = new Map(live.map((r) => [r.id, r]));
  const tally = { match: 0, already: 0, changed: 0, missing: 0 };
  const todo = [];
  for (const f of fixes) {
    const s = classify(f, byId.get(f.id));
    tally[s]++;
    const tag = `${f.product_slug}/${f.bank_type} sort ${f.sort_order} ${f.id}`;
    if (s === "match") {
      todo.push(f);
      console.log(`UPDATE   ${tag}: ${f.edits.map((e) => e.field).join(", ")}`);
    } else if (s === "already") console.log(`ALREADY  ${tag}`);
    else if (s === "changed") console.log(`SKIP     ${tag}: edited since the 2026-11-01 snapshot`);
    else console.log(`MISSING  ${tag}: no live row with this id`);
  }
  console.log(`\n${fixes.length} rows in the change file: ${tally.match} to update, ${tally.already} already updated, ${tally.changed} edited since the snapshot, ${tally.missing} missing.`);
  if (mode === "--dry-run") return console.log("Dry run: nothing written.");

  const updated = new Set();
  for (let i = 0; i < todo.length; i += BATCH) {
    for (const r of await runSql(updateSql(todo.slice(i, i + BATCH)))) updated.add(r.id);
  }
  console.log(`Updated ${updated.size} of ${todo.length} rows.`);
  for (const f of todo.filter((f) => !updated.has(f.id))) console.log(`NOT UPDATED (changed during the run) ${f.id}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
