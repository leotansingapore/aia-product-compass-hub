// The LLM splits the pasted text into objections and writes each title, description,
// tags and response; Jev picks each objection's category. A Jev pick replaces the
// LLM's only above the bar below, so a null (no key, timeout, outage) or a
// non-English paste keeps the LLM answer. Bar from the side-by-side on the 34
// production objections (2026-10-09).
import { askJev, choiceOf, mostlyLatin, type JevAnswer, type JevQuestion } from "../_shared/jev.ts";

export const CATEGORIES = ["generic", "tactical", "product", "pricing", "trust", "timing"] as const;

// Below 0.5 Jev's picks were wrong more often than the LLM's in the side-by-side.
export const CATEGORY_BAR = 0.5;

const MAX_ITEMS = 20;

type Objection = { title?: string; description?: string; category?: string };

export function objectionQuestions(count: number): Record<string, JevQuestion> {
  const qs: Record<string, JevQuestion> = {};
  for (let i = 0; i < Math.min(count, MAX_ITEMS); i++) {
    qs[`category_${i}`] = {
      type: "choice",
      instructions:
        `\`objections[${i}]\` is a prospect's objection to a financial advisor, taken from \`pasted_text\`. Which kind of objection is it?`,
      criteria: {
        generic: "A general objection with no specific reason: not interested, no time",
        tactical: "A stalling tactic: checking with my spouse, I need to think about it",
        product: "About a specific product's features or suitability",
        pricing: "About cost, fees or affordability",
        trust: "A credibility concern, e.g. I don't trust insurance companies",
        timing: "Putting it off to later: maybe next year, not the right time",
      },
    };
  }
  return qs;
}

export function askObjectionJev(
  content: string,
  objections: Objection[],
): Promise<Record<string, JevAnswer> | null> {
  if (!objections.length || !mostlyLatin(content)) return Promise.resolve(null);
  return askJev(
    {
      pasted_text: content.slice(0, 4000),
      objections: objections.slice(0, MAX_ITEMS).map((o) => ({ title: o.title ?? "", description: o.description ?? "" })),
    },
    objectionQuestions(objections.length),
    { who: "classify-objection" },
  );
}

/** Each objection with a confident Jev category swapped in; nothing else changes. */
export function applyJev<T extends Objection>(objections: T[], answers: Record<string, JevAnswer> | null): T[] {
  if (!answers) return objections;
  return objections.map((o, i) => {
    const id = `category_${i}`;
    const pick = choiceOf(answers, id, CATEGORIES);
    if (!pick || (answers[id]?.confidence ?? 0) < CATEGORY_BAR) return o;
    if (pick !== o.category) console.log(`jev: classify-objection category ${o.category} -> ${pick} (${answers[id].confidence?.toFixed(2)})`);
    return { ...o, category: pick };
  });
}
