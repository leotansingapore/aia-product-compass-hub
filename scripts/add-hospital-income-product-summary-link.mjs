/**
 * Append the AIA Hospital Income Product Summary PDF to the product's
 * useful_links in Supabase (Resources tab).
 *
 * Idempotent: skips if the same URL or a "Product Summary" title is present.
 *
 * Usage: node scripts/add-hospital-income-product-summary-link.mjs
 */

const SUPABASE_URL = "https://hgdbflprrficdoyxmdxe.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnZGJmbHBycmZpY2RveXhtZHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NjY0NDAsImV4cCI6MjA2NzM0MjQ0MH0.2qwUbh0nkFyOLzzZgXk7bedINzHSf2ULMBUECOqWmIw";
const PRODUCT_ID = "hospital-income";
const REST = `${SUPABASE_URL}/rest/v1/products?id=eq.${PRODUCT_ID}`;

const SUMMARY_LINK = {
  url: "https://www.aia.com.sg/content/dam/sg-wise/en/docs/aiaformlibrary/application-and-product-summary-booklet-hospital-income.pdf",
  type: "pdf",
  title: "Product Summary",
};

async function ensureDemoAccount() {
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/ensure-demo-account`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
      body: "{}",
    });
  } catch {}
}

let access_token = null;
console.log("Authenticating as admin ...");
let authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({ email: "master_admin@demo.com", password: "demo123456" }),
});
if (!authRes.ok) {
  console.log("  First auth failed; calling ensure-demo-account and retrying ...");
  await ensureDemoAccount();
  authRes = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ email: "master_admin@demo.com", password: "demo123456" }),
  });
}
if (authRes.ok) {
  access_token = (await authRes.json()).access_token;
  console.log("  Authenticated as admin.");
} else {
  console.log("  Admin auth failed; falling back to anon key.");
}

const authHeaders = {
  apikey: SUPABASE_KEY,
  "Content-Type": "application/json",
  ...(access_token ? { Authorization: `Bearer ${access_token}` } : {}),
};

console.log("Fetching existing useful_links ...");
const getRes = await fetch(`${REST}&select=useful_links`, { headers: authHeaders });
if (!getRes.ok) throw new Error(`GET failed: ${getRes.status} ${await getRes.text()}`);
const [product] = await getRes.json();
const existing = Array.isArray(product.useful_links) ? product.useful_links : [];
console.log(`  Existing ${existing.length} links:`);
for (const l of existing) console.log(`    - ${l.title} (${l.type}) -> ${l.url}`);

const alreadyHas = existing.some(
  (l) => l.url === SUMMARY_LINK.url || (l.title || "").toLowerCase() === "product summary"
);
if (alreadyHas) {
  console.log("Product Summary link already present. Skipping update.");
  process.exit(0);
}

const merged = [...existing, SUMMARY_LINK];
console.log("PATCHing product ...");
const patchRes = await fetch(REST, {
  method: "PATCH",
  headers: { ...authHeaders, Prefer: "return=representation" },
  body: JSON.stringify({ useful_links: merged }),
});
if (!patchRes.ok) throw new Error(`PATCH failed: ${patchRes.status} ${await patchRes.text()}`);
const patchBody = await patchRes.json();
const updated = Array.isArray(patchBody) ? patchBody[0] : patchBody;
console.log(`  PATCH successful. Final count: ${updated?.useful_links?.length ?? "?"}`);

console.log("\nVerification:");
const verifyRes = await fetch(`${REST}&select=useful_links`, { headers: authHeaders });
const [verified] = await verifyRes.json();
for (const l of verified.useful_links) console.log(`    - ${l.title} (${l.type}) -> ${l.url}`);
console.log("\nDone.");
