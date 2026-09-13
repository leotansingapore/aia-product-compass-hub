// feedbackDoors: the assistant's two doors to the maker. A public post on the academy's
// feedback board, or a private message to the team.
//
// The model writes them as directives at the end of an answer:
//
//   [[feedback:feature|Add a timer to the CMFAS mock exams|I lose track of time in the M9 mock]]
//   [[support:I paid for the post-RNF tier yesterday but the Sales Playbooks are still locked]]
//
// They are drafted by the model and confirmed by the learner's click, under the learner's
// own name. The card shows exactly the text that will leave the app before they click.
// Nothing here is trusted: the text is capped, the category allowlisted, and a
// half-streamed directive is hidden instead of rendered as `[[feedb`.

import { FEEDBACK_API, FEEDBACK_BOARD_KEY } from "@/components/feedback/config";

export type DoorCategory = "feature" | "improvement" | "bug" | "question";
const CATEGORIES: readonly DoorCategory[] = ["feature", "improvement", "bug", "question"];

export type Door =
  | { kind: "feedback"; category: DoorCategory; title: string; body: string }
  | { kind: "support"; message: string };

export const DOOR_TITLE_MAX = 120;
export const DOOR_BODY_MAX = 4000;
export const DOOR_MESSAGE_MAX = 2000;

const DIRECTIVE = /\[\[(feedback|support):([^\]\n\r]*)\]\]/gi;

/** The prose without its directives, whole or half-typed. */
export function stripDoors(text: string): string {
  return text
    .replace(DIRECTIVE, "")
    .replace(/\[\[(?:feedback|support):[^\]\n\r]*$/i, "")
    .replace(/\[\[(?:f(?:e(?:e(?:d(?:b(?:a(?:c(?:k)?)?)?)?)?)?)?|s(?:u(?:p(?:p(?:o(?:r(?:t)?)?)?)?)?)?)?$/i, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** The doors an answer offers, validated and deduped, at most two. */
export function parseDoors(text: string): Door[] {
  const out: Door[] = [];
  const seen = new Set<string>();
  for (const m of text.matchAll(DIRECTIVE)) {
    const kind = m[1].toLowerCase();
    const parts = (m[2] ?? "").split("|").map((x) => x.trim());
    if (kind === "feedback") {
      const cat = (parts[0] ?? "").toLowerCase();
      const category = (CATEGORIES as readonly string[]).includes(cat) ? (cat as DoorCategory) : "feature";
      const title = (parts[1] ?? "").slice(0, DOOR_TITLE_MAX);
      const body = parts.slice(2).join(" | ").slice(0, DOOR_BODY_MAX);
      if (title.length < 4 || !/[a-z]/i.test(title)) continue;
      const key = `feedback:${title.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ kind: "feedback", category, title, body });
    } else {
      const message = parts.join(" | ").slice(0, DOOR_MESSAGE_MAX);
      if (message.length < 4 || !/[a-z]/i.test(message)) continue;
      const key = `support:${message.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ kind: "support", message });
    }
  }
  return out.slice(0, 2);
}

export interface DoorIdentity {
  id: string;
  name: string | null;
  email: string | null;
}

const headers = (identity: DoorIdentity) => ({
  "Content-Type": "application/json",
  "X-Board-Key": FEEDBACK_BOARD_KEY,
  "X-Voter": identity.id,
});

async function reason(res: Response, fallback: string): Promise<string> {
  try {
    const j = await res.json();
    return (j?.error as string) || fallback;
  } catch {
    return fallback;
  }
}

/** Post on the public board under the learner's name. Resolves to the post number. */
export async function postFeedback(identity: DoorIdentity, door: Extract<Door, { kind: "feedback" }>): Promise<number> {
  const res = await fetch(`${FEEDBACK_API}/posts`, {
    method: "POST",
    headers: headers(identity),
    body: JSON.stringify({ title: door.title, body: door.body, category: door.category, name: identity.name ?? "", email: identity.email ?? "", website: "" }),
  });
  if (!res.ok) throw new Error(await reason(res, "Could not post to the board"));
  const post = await res.json();
  return Number(post.number);
}

/** A private message to the team. The reply comes to the learner's email. */
export async function sendSupport(identity: DoorIdentity, message: string): Promise<{ emailed: boolean }> {
  const res = await fetch(`${FEEDBACK_API}/support`, {
    method: "POST",
    headers: headers(identity),
    body: JSON.stringify({ message, name: identity.name ?? "", email: identity.email ?? "", page: typeof window === "undefined" ? "" : window.location.pathname, website: "" }),
  });
  if (!res.ok) throw new Error(await reason(res, "Could not send the message"));
  const j = await res.json();
  return { emailed: Boolean(j.emailed) };
}
