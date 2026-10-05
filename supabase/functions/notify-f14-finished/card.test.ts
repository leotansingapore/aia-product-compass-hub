// deno test supabase/functions/notify-f14-finished/card.test.ts
import { assert, assertEquals } from "https://deno.land/std@0.190.0/testing/asserts.ts";
import { buildMessages, FRESH_MS, skipReason } from "./card.ts";

const now = Date.parse("2026-10-06T02:00:00Z");
const base = {
  name: "Tan Ah Kow",
  email: "a_b@gmail.com",
  tier: "explorer",
  isAdmin: false,
  finishedAt: new Date(now - 30_000).toISOString(),
};

Deno.test("a fresh Explorer finish is alerted, with or without a tier row", () => {
  assertEquals(skipReason(base, now), null);
  assertEquals(skipReason({ ...base, tier: null }, now), null);
});

Deno.test("everything else is skipped", () => {
  assertEquals(skipReason({ ...base, finishedAt: null }, now), "day 14 not complete");
  assertEquals(
    skipReason({ ...base, finishedAt: new Date(now - FRESH_MS - 1).toISOString() }, now),
    "not a fresh finish",
  );
  assertEquals(skipReason({ ...base, tier: "papers_taker" }, now), "not an explorer");
  assertEquals(skipReason({ ...base, tier: "level_2" }, now), "not an explorer");
  assertEquals(skipReason({ ...base, isAdmin: true }, now), "admin");
  assertEquals(skipReason({ ...base, email: "user@DEMO.com" }, now), "demo account");
});

Deno.test("learner text cannot ping the group, and survives Lark markdown", () => {
  const { card, text } = buildMessages({ ...base, name: '<at user_id="all"></at>Eve*' }, "https://x");
  const body = card.body.elements.map((e) => e.content).join("\n");
  assert(!body.includes("<at") && !text.includes("<at"));
  assert(body.includes("Eve\\*"));
  assert(body.includes("a\\_b@gmail.com"));
  assert(text.includes("a_b@gmail.com"));
  assert(text.includes("6 Oct") && text.includes("SGT"), text);
});
