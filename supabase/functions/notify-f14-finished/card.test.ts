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
  alertedAt: null,
};

Deno.test("a fresh Explorer finish is alerted, with or without a tier row", () => {
  assertEquals(skipReason(base, now), null);
  assertEquals(skipReason({ ...base, tier: null }, now), null);
});

Deno.test("everything else is skipped", () => {
  assertEquals(skipReason({ ...base, alertedAt: "2026-10-06T01:59:00Z" }, now), "already alerted");
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

Deno.test("learner text is never markdown and cannot ping the group", () => {
  const name = '<at user_id="all"></at>[Claim](https://evil.example)\n# Eve*';
  const { card, text } = buildMessages({ ...base, name }, "https://x");
  const els = card.body.elements as Array<{ tag: string; content?: string; text?: { content: string } }>;
  const markdown = els.filter((e) => e.tag === "markdown").map((e) => e.content).join("\n");
  const plain = els.filter((e) => e.tag === "div").map((e) => e.text!.content).join("\n");
  assert(!markdown.includes("evil") && !markdown.includes("gmail"), markdown);
  assert(plain.includes("[Claim](https://evil.example) # Eve*"), plain);
  assert(plain.includes("a_b@gmail.com"));
  assert(!JSON.stringify(card).includes("<at") && !text.includes("<at"));
  assert(text.includes("6 Oct") && text.includes("SGT"), text);
});
