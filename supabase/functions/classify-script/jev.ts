// Jev picks the script's category (and a servicing script's category); the LLM still
// writes the title and tags and keeps target_audience and script_role, where Jev
// lost the side-by-side on 158 production scripts (2026-10-09: role 55% vs 88%,
// audience no better). A Jev pick replaces the LLM's only at or above its bar, so a
// null (no key, timeout, outage) or a non-English script keeps the LLM answer.
import { askJev, choiceOf, mostlyLatin, type JevAnswer, type JevQuestion } from "../_shared/jev.ts";

export const CATEGORIES = [
  "cold-calling", "initial-text", "post-call-text", "callback", "follow-up", "ad-campaign",
  "referral", "confirmation", "faq", "tips",
] as const;

export const STANDARD_SERVICING = [
  "premium-payments", "policy-services", "new-business", "claims", "travel-insurance",
  "texting-campaigns", "festive-greetings", "referrals", "annual-reviews", "general-education",
] as const;

// From the side-by-side: below 0.5 Jev's category picks were wrong more often than the LLM's.
// Servicing picks run low (up to ~200 options) yet beat the LLM at every bar, so any pick counts.
export const BARS = { category: 0.5, servicing_category: 0 };

const SERVICING_DESCRIPTIONS: Record<string, string> = {
  "premium-payments": "Paying premiums, outstanding amounts, payment methods, payment reminders",
  "policy-services": "Admin changes to a policy: change of servicing agent, policy transfers, owner changes",
  "new-business": "New policy applications, a policy that has just gone in force",
  "claims": "Making or following up on an insurance claim",
  "travel-insurance": "Travel insurance",
  "texting-campaigns": "A broadcast texting campaign sent to many existing clients",
  "festive-greetings": "Festive or seasonal greetings and gifts to clients",
  "referrals": "Asking existing clients for referrals",
  "annual-reviews": "Annual or periodic policy review with an existing client",
  "general-education": "General financial education or market updates for clients",
};

const servicingOptions = (existing: string[]) => [...new Set([...existing, ...STANDARD_SERVICING])];

export function scriptQuestions(isServicing: boolean, existingCategories: string[]): Record<string, JevQuestion> {
  if (isServicing) {
    return {
      servicing_category: {
        type: "choice",
        instructions:
          "`script` is a template a financial advisor uses with EXISTING clients. Which servicing category does it belong to? Prefer an existing category whenever one fits even loosely.",
        criteria: {
          ...Object.fromEntries(servicingOptions(existingCategories).map((o) => [o, SERVICING_DESCRIPTIONS[o] ?? null])),
          "none-fits": "None of the other categories fits; this script needs a new, more specific category",
        },
      },
    };
  }
  return {
    category: {
      type: "choice",
      instructions: "`script` is from a financial advisor's prospecting scripts library. What kind of script is it?",
      criteria: {
        "cold-calling": "A phone script or first outreach message for cold or warm contacts",
        "initial-text": "The first text message sent to a new lead, e.g. after a Facebook opt-in or voucher claim; not a phone call",
        "post-call-text": "A text or WhatsApp message sent AFTER a phone call: call summary, meeting confirmation, resources sent after speaking",
        "callback": "A phone call script for calling a lead back, e.g. the consultant's callback after a telemarketer set the appointment",
        "follow-up": "Ongoing follow-up messages: reminders, nudges, drip sequences; not a post-call text and not a first text",
        "ad-campaign": "A Facebook or Instagram ad script or lead-generation campaign",
        "referral": "Asking for or handling referrals",
        "confirmation": "An appointment confirmation",
        "faq": "Answers to frequent questions or objections",
        "tips": "Best practices or general advice for the advisor, not words to send to a client",
      },
    },
  };
}

/** Jev's answers for this script, or null when Jev should not or could not answer. */
export function askScriptJev(
  title: string,
  content: string,
  isServicing: boolean,
  existingCategories: string[],
): Promise<Record<string, JevAnswer> | null> {
  if (!mostlyLatin(content)) return Promise.resolve(null);
  return askJev(
    { title: title || "(none)", script: content.slice(0, 3000) },
    scriptQuestions(isServicing, existingCategories),
    { who: "classify-script" },
  );
}

/** The LLM result with a confident Jev category swapped in; same keys, same value sets. */
export function applyJev(
  result: Record<string, unknown>,
  answers: Record<string, JevAnswer> | null,
  isServicing: boolean,
  existingCategories: string[],
): Record<string, unknown> {
  const id = isServicing ? "servicing_category" : "category";
  // "none-fits" is not offered here, so that pick keeps the LLM's new slug.
  const options = isServicing ? servicingOptions(existingCategories) : CATEGORIES;
  const pick = choiceOf(answers, id, options);
  const confidence = answers?.[id]?.confidence ?? 0;
  if (!pick || confidence < BARS[id]) return result;
  if (pick !== result[id]) console.log(`jev: classify-script ${id} ${result[id]} -> ${pick} (${confidence.toFixed(2)})`);
  return { ...result, [id]: pick };
}
