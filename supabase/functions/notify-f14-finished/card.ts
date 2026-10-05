// Pure parts of notify-f14-finished, kept apart so card.test.ts can run them.

// The client calls right after the Day 14 write confirms; anything older is a replay.
export const FRESH_MS = 2 * 60 * 1000;

// Mirrors normalizeTier in src/lib/tiers.ts: no row or an unknown value is an Explorer.
const COMMITTED_TIERS = ["papers_taker", "post_rnf", "level_1", "level_2"];

export type Learner = {
  name: string;
  email: string | null;
  tier: string | null;
  isAdmin: boolean;
  finishedAt: string | null;
  /** Server-only mark (auth app_metadata) that this learner's card was sent. */
  alertedAt: string | null;
};

/** Why this finish is not alerted, or null when it should be. */
export function skipReason(l: Learner, now: number): string | null {
  if (l.alertedAt) return "already alerted";
  if (!l.finishedAt) return "day 14 not complete";
  if (now - Date.parse(l.finishedAt) > FRESH_MS) return "not a fresh finish";
  if (COMMITTED_TIERS.includes(l.tier ?? "")) return "not an explorer";
  if (l.isAdmin) return "admin";
  if (l.email?.toLowerCase().endsWith("@demo.com")) return "demo account";
  return null;
}

// Learner-typed text goes only into plain_text, never markdown, so a name like
// [Claim](https://...) stays words. Tags go too: in the text fallback an <at>
// pings the whole group.
const clean = (s: string) => s.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 120);
const plain = (content: string) => ({ tag: "div", text: { tag: "plain_text", content } });

export function sgTime(iso: string): string {
  return new Date(iso).toLocaleString("en-SG", {
    timeZone: "Asia/Singapore",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Card in the lark-notify shape, plus the plain-text fallback. */
export function buildMessages(l: Learner, adminUrl: string) {
  const name = clean(l.name) || "A learner";
  const email = l.email ? clean(l.email) : "no email on file";
  const when = `${sgTime(l.finishedAt!)} SGT`;
  const head = "FINternship - finished First 14 Days";
  const next = "Next: check whether they booked an onboarding call, and follow up if not.";
  const card = {
    schema: "2.0",
    config: { summary: { content: `${head}: ${name}` } },
    header: {
      title: { tag: "plain_text", content: head },
      subtitle: { tag: "plain_text", content: "academy.finternship.com" },
      template: "green",
      text_tag_list: [
        { tag: "text_tag", color: "yellow", text: { tag: "plain_text", content: "Follow up" } },
      ],
    },
    body: {
      direction: "vertical",
      padding: "12px 12px 20px 12px",
      vertical_spacing: "12px",
      elements: [
        plain(`${name} finished Day 14 on ${when}.`),
        plain(email),
        { tag: "markdown", content: next },
        { tag: "markdown", text_size: "notation", content: `[First 14 Days progress](${adminUrl})` },
      ],
    },
  };
  const text = [head, `${name} (${email}) finished Day 14 on ${when}.`, next, `First 14 Days progress: ${adminUrl}`].join("\n");
  return { card, text };
}
