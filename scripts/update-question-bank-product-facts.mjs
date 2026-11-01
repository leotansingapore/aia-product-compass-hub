#!/usr/bin/env node
// Push the 2026-11-01 product-fact corrections into the live quiz table.
//
// The study and exam pages read `question_bank_questions`, not src/data/*StudyBank.ts and
// *ExamQuestions.ts. Those rows were seeded from the TS files (scripts/seed-question-bank.ts),
// so the TS corrections reach learners only through this script.
//
// What it changes: the questions listed in scripts/question-bank-product-facts-2026-11-01.json,
// a frozen diff of every bank question between d2b8ec41 (before the corrections) and the commit
// named in the file's `head`, matched by array index (index = seed sort_order).
//
// Matching, per change: same product_slug and bank_type, and the row still holds the OLD
// question, options, correct_answer and explanation exactly. A row already holding the new text
// is skipped. Anything else is listed as unmatched and left alone. The UPDATE repeats the same
// old-text guard, so a row edited between the dry run and the apply is not overwritten.
// Updates happen in place (ids kept), so learner progress rows still point at their questions.
//
// Run (Supabase Management API SQL endpoint, token at ~/.local/state/va-watchdog/token; never
// the service-role key):
//   node scripts/update-question-bank-product-facts.mjs --self-test   # offline check of the matcher
//   node scripts/update-question-bank-product-facts.mjs --dry-run     # read-only: select and print
//   node scripts/update-question-bank-product-facts.mjs --apply       # update matched rows

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA = join(ROOT, "scripts/question-bank-product-facts-2026-11-01.json");
const BATCH = 25;

const q = (s) => `'${String(s).replace(/'/g, "''")}'`;
const opts = (o) => (typeof o === "string" ? JSON.parse(o) : o); // jsonb may arrive as text
const same = (row, side) =>
  row.question === side.question &&
  JSON.stringify(opts(row.options)) === JSON.stringify(side.options) &&
  Number(row.correct_answer) === side.correct_answer &&
  row.explanation === side.explanation;

/** Decide what to do with one change, given all live rows of its product and bank. */
export function classify(change, rows) {
  const pool = rows.filter((r) => r.product_slug === change.product_slug && r.bank_type === change.bank_type);
  const old = pool.filter((r) => same(r, change.old));
  if (old.length) return { status: "match", ids: old.map((r) => r.id), sortOk: old.some((r) => r.sort_order === change.index) };
  if (pool.some((r) => same(r, change.new))) return { status: "already", ids: [] };
  const near =
    pool.find((r) => r.question === change.old.question || r.question === change.new.question) ||
    pool.find((r) => r.sort_order === change.index);
  const differs = near
    ? ["question", "options", "correct_answer", "explanation"].filter((k) =>
        k === "options"
          ? JSON.stringify(opts(near.options)) !== JSON.stringify(change.old.options)
          : k === "correct_answer"
            ? Number(near.correct_answer) !== change.old.correct_answer
            : near[k] !== change.old[k],
      )
    : [];
  return { status: "unmatched", ids: [], near: near?.id, differs };
}

/** One guarded UPDATE for a batch of [id, change] pairs. */
export function updateSql(pairs) {
  const values = pairs
    .map(
      ([id, c]) =>
        `(${q(id)}::uuid, ${q(c.old.question)}, ${q(JSON.stringify(c.old.options))}::jsonb, ${c.old.correct_answer}, ${q(c.old.explanation)}, ` +
        `${q(c.new.question)}, ${q(JSON.stringify(c.new.options))}::jsonb, ${c.new.correct_answer}, ${q(c.new.explanation)})`,
    )
    .join(",\n");
  return (
    `update public.question_bank_questions t set question = v.nq, options = v.nop, correct_answer = v.nc, explanation = v.ne, updated_at = now()\n` +
    `from (values\n${values}\n) as v(id, oq, oo, oc, oe, nq, nop, nc, ne)\n` +
    `where t.id = v.id and t.question = v.oq and t.options = v.oo and t.correct_answer = v.oc and t.explanation = v.oe\n` +
    `returning t.id;`
  );
}

function selfTest() {
  const c = {
    product_slug: "p", bank_type: "study", index: 2,
    old: { question: "Q old", options: ["a", "b"], correct_answer: 1, explanation: "it's old" },
    new: { question: "Q new", options: ["a", "c"], correct_answer: 0, explanation: "new" },
  };
  const row = (id, side, extra = {}) => ({ id, product_slug: "p", bank_type: "study", sort_order: 2, ...side, ...extra });
  const t = (rows, want) => {
    const got = classify(c, rows).status;
    if (got !== want) throw new Error(`self-test: expected ${want}, got ${got}`);
  };
  t([row("1", c.old)], "match");
  t([row("1", c.old), row("2", c.old, { sort_order: 9 })], "match");
  t([row("1", c.new)], "already");
  t([row("1", { ...c.old, explanation: "edited by an admin" })], "unmatched");
  t([row("1", c.old, { product_slug: "other" })], "unmatched");
  t([row("1", c.old, { correct_answer: "1", options: JSON.stringify(c.old.options) })], "match"); // text-typed values from the API still match
  if (classify(c, [row("1", c.old), row("2", c.old)]).ids.length !== 2) throw new Error("self-test: duplicates not both matched");
  const sql = updateSql([["00000000-0000-0000-0000-000000000001", c]]);
  if (!sql.includes("'it''s old'") || !sql.includes("t.explanation = v.oe")) throw new Error("self-test: SQL quoting or guard missing");
  console.log("self-test passed");
}

async function main() {
  const mode = process.argv.find((a) => ["--dry-run", "--apply", "--self-test"].includes(a));
  if (!mode) {
    console.log("Usage: node scripts/update-question-bank-product-facts.mjs --self-test | --dry-run | --apply");
    process.exit(1);
  }
  if (mode === "--self-test") return selfTest();

  const { changes, base, head } = JSON.parse(readFileSync(DATA, "utf8"));
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

  const slugs = [...new Set(changes.map((c) => c.product_slug))];
  const rows = await runSql(
    `select id, product_slug, bank_type, sort_order, question, options, correct_answer, explanation from public.question_bank_questions ` +
      `where product_slug in (${slugs.map(q).join(", ")}) and bank_type in ('study', 'exam');`,
  );
  console.log(`Read ${rows.length} live rows for ${slugs.length} products. Changes ${base}..${head}: ${changes.length}.\n`);

  const todo = [];
  const tally = { match: 0, already: 0, unmatched: 0 };
  for (const c of changes) {
    const r = classify(c, rows);
    tally[r.status]++;
    const tag = `${c.product_slug}/${c.bank_type} #${c.index}`;
    if (r.status === "already") { console.log(`ALREADY  ${tag}`); continue; }
    if (r.status === "unmatched") {
      console.log(`UNMATCHED ${tag}: ${c.old.question.slice(0, 100)}`);
      console.log(r.near ? `  nearest row ${r.near} differs from the old text in: ${r.differs.join(", ") || "nothing"}` : "  no row with that question or sort_order");
      continue;
    }
    console.log(`MATCH    ${tag} -> ${r.ids.join(", ")}${r.sortOk ? "" : " (sort_order differs from index)"}${r.ids.length > 1 ? " (duplicate rows, all updated)" : ""}`);
    for (const k of c.fields) {
      console.log(`  ${k}\n    old: ${JSON.stringify(c.old[k])}\n    new: ${JSON.stringify(c.new[k])}`);
    }
    for (const id of r.ids) todo.push([id, c]);
  }
  console.log(`\n${tally.match} to update (${todo.length} rows), ${tally.already} already updated, ${tally.unmatched} unmatched.`);

  if (mode === "--dry-run") return console.log("Dry run: nothing written.");

  const updated = new Set();
  for (let i = 0; i < todo.length; i += BATCH) {
    for (const r of await runSql(updateSql(todo.slice(i, i + BATCH)))) updated.add(r.id);
  }
  const missed = todo.filter(([id]) => !updated.has(id));
  console.log(`Updated ${updated.size} of ${todo.length} rows.`);
  for (const [id, c] of missed) console.log(`NOT UPDATED (changed since the select) ${id} ${c.product_slug}/${c.bank_type} #${c.index}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
