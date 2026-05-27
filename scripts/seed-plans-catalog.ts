/**
 * Seeds public.plans_catalog with the static competitor inventory from
 * src/data/competitorProductLinks.ts. Idempotent — uses upsert on the
 * (company_name, plan_name) unique constraint.
 *
 * The plans_catalog table is consumed by growing-age-calculator policy
 * autocomplete. FCs add new plans live via the app; this script only
 * lays down the initial 267 retail SG plans.
 *
 * Run:
 *   SUPABASE_URL=https://hgdbflprrficdoyxmdxe.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=... \
 *   node_modules/.bin/tsx scripts/seed-plans-catalog.ts
 */
/* eslint-disable no-console */
import { createClient } from "@supabase/supabase-js";
import { COMPETITOR_PRODUCT_LINKS } from "../src/data/competitorProductLinks";

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const INSURER_DISPLAY: Record<string, string> = {
  aia: "AIA",
  "great-eastern": "Great Eastern",
  prudential: "Prudential",
  singlife: "Singlife",
  "income-insurance": "Income Insurance",
  manulife: "Manulife",
  "hsbc-life": "HSBC Life",
  "raffles-health-insurance": "Raffles Health Insurance",
};

type Row = {
  company_name: string;
  plan_name: string;
  brochure_url: string | null;
  official_url: string | null;
  is_aia: boolean;
};

const rows: Row[] = [];
for (const [slug, products] of Object.entries(COMPETITOR_PRODUCT_LINKS)) {
  const company = INSURER_DISPLAY[slug] ?? slug;
  for (const [planName, links] of Object.entries(products)) {
    rows.push({
      company_name: company,
      plan_name: planName,
      brochure_url: links.brochure ?? null,
      official_url: links.website ?? null,
      is_aia: slug === "aia",
    });
  }
}

console.log(`Prepared ${rows.length} rows across ${Object.keys(COMPETITOR_PRODUCT_LINKS).length} insurers`);

const CHUNK = 100;
let total = 0;
for (let i = 0; i < rows.length; i += CHUNK) {
  const batch = rows.slice(i, i + CHUNK);
  const { error, count } = await sb
    .from("plans_catalog")
    .upsert(batch, { onConflict: "company_name,plan_name", ignoreDuplicates: false, count: "exact" });
  if (error) {
    console.error(`Batch ${i / CHUNK + 1} failed:`, error);
    process.exit(1);
  }
  total += count ?? batch.length;
  console.log(`Upserted batch ${i / CHUNK + 1}: ${batch.length} rows (running total: ${total})`);
}

const { count } = await sb.from("plans_catalog").select("*", { count: "exact", head: true });
console.log(`Done. plans_catalog now has ${count} rows.`);
