/**
 * Fills `ai_summary` on plans_catalog rows that don't have one yet, by
 * calling the `claude` CLI (Sonnet) — NOT the API. Cheap via Max plan,
 * one row per call, ~2-3 sentences each. Run-once, write-back, idempotent
 * (skips rows that already have a summary).
 *
 * Why CLI instead of API: per the global CLAUDE.md, Max subscription means
 * `claude -p` is effectively free. The API would meter per call.
 *
 * Voice: factual SG-context, no marketing fluff. State plan type, who it's
 * for, and the one positioning detail an FC needs to recognise it on a
 * client's policy summary. No writer-tic phrases.
 *
 * Run:
 *   SUPABASE_URL=https://hgdbflprrficdoyxmdxe.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   node_modules/.bin/tsx scripts/fill-plan-summaries.ts [--limit=N] [--dry-run]
 */
/* eslint-disable no-console */
import { createClient } from "@supabase/supabase-js";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

// No shell — prompt is passed as a single argv element, so shell
// metacharacters inside it are not interpreted.
const execFileAsync = promisify(execFile);

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const args = process.argv.slice(2);
const limitArg = args.find(a => a.startsWith("--limit="));
const LIMIT = limitArg ? Number(limitArg.split("=")[1]) : 1000;
const DRY_RUN = args.includes("--dry-run");

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

type PlanRow = {
  id: string;
  company_name: string;
  plan_name: string;
  brochure_url: string | null;
  official_url: string | null;
  is_aia: boolean;
};

const PROMPT_TEMPLATE = `You are summarising a Singapore retail insurance/investment plan for a financial consultant scanning a client's existing portfolio. Output exactly 2-3 sentences, plain text, no markdown, no bullet points, no preamble like "This plan...".

Cover:
1. Plan type in one phrase (e.g. "Whole-life CI cover with multi-claim", "Endowment with retirement income payouts", "Term life with disability income rider").
2. The single positioning detail an FC needs to recognise it (e.g. "AIA's flagship lifetime CI plan", "Singlife's bridging endowment after Aviva merger", "DPI variant — no advice attached").
3. Optional: who it's typically for or one notable feature.

Plan: {{PLAN_NAME}}
Insurer: {{COMPANY_NAME}}
Brochure: {{BROCHURE_URL}}
Official page: {{OFFICIAL_URL}}

Constraints:
- Singapore context only
- No marketing language ("comprehensive protection", "peace of mind", "leading provider")
- If you genuinely don't recognise the plan, respond with exactly: UNKNOWN
- 2-3 sentences max, total under 350 characters`;

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

async function callClaude(prompt: string): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync("claude", ["-p", "--model", "sonnet", prompt], {
      timeout: 90_000,
      maxBuffer: 1024 * 1024,
    });
    const text = stdout.trim();
    return text || null;
  } catch (e) {
    console.error(`  claude CLI error: ${e instanceof Error ? e.message : e}`);
    return null;
  }
}

async function generateSummary(row: PlanRow): Promise<string | null> {
  const prompt = PROMPT_TEMPLATE
    .replace("{{PLAN_NAME}}", row.plan_name)
    .replace("{{COMPANY_NAME}}", row.company_name)
    .replace("{{BROCHURE_URL}}", row.brochure_url ?? "(none)")
    .replace("{{OFFICIAL_URL}}", row.official_url ?? "(none)");

  // First attempt
  let text = await callClaude(prompt);

  // On UNKNOWN or empty, wait and retry once — the first batch run showed
  // that whole consecutive insurers came back UNKNOWN, suggesting transient
  // rate limit / session degradation rather than genuine no-knowledge.
  if (!text || text === "UNKNOWN") {
    await sleep(8000);
    text = await callClaude(prompt);
  }

  if (!text || text === "UNKNOWN") return null;
  return text;
}

async function main() {
  const { data: rows, error } = await sb
    .from("plans_catalog")
    .select("id, company_name, plan_name, brochure_url, official_url, is_aia")
    .is("ai_summary", null)
    .order("is_aia", { ascending: false }) // AIA plans first
    .order("company_name", { ascending: true })
    .order("plan_name", { ascending: true })
    .limit(LIMIT);

  if (error) {
    console.error("Failed to fetch rows:", error);
    process.exit(1);
  }

  if (!rows || rows.length === 0) {
    console.log("No rows need summarising. plans_catalog is fully filled.");
    return;
  }

  console.log(`Processing ${rows.length} plan(s)${DRY_RUN ? " (dry run)" : ""}…`);

  let filled = 0;
  let unknown = 0;
  let failed = 0;

  for (const [idx, row] of rows.entries()) {
    const tag = `[${idx + 1}/${rows.length}] ${row.company_name} - ${row.plan_name}`;
    process.stdout.write(`${tag} … `);
    const summary = await generateSummary(row as PlanRow);

    if (!summary) {
      console.log("UNKNOWN or claude failed (skipped)");
      unknown++;
      continue;
    }

    if (DRY_RUN) {
      console.log(`\n  → ${summary}`);
      filled++;
      continue;
    }

    const { error: updErr } = await sb
      .from("plans_catalog")
      .update({ ai_summary: summary })
      .eq("id", row.id);
    if (updErr) {
      console.log(`UPDATE failed: ${updErr.message}`);
      failed++;
    } else {
      console.log(`OK (${summary.length} chars)`);
      filled++;
    }

    // Inter-call breather to dodge rate limits.
    await sleep(1500);
  }

  console.log(`\nDone. Filled: ${filled}, Unknown/skipped: ${unknown}, Failed: ${failed}`);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
