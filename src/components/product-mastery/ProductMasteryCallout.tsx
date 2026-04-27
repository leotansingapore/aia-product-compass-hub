import { Link } from "react-router-dom";
import { Sparkles, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// slug → week number in the Product Mastery Track
// Accepts both legacy slugs ("pro-achiever") and the "core-" prefixed twins.
const SLUG_TO_WEEK: Record<string, number> = {
  "pro-achiever": 1,
  "core-pro-achiever": 1,
  "pro-lifetime-protector": 2,
  "core-pro-lifetime-protector": 2,
  "guaranteed-protect-plus": 3,
  "core-guaranteed-protect-plus": 3,
  "ultimate-critical-cover": 4,
  "core-ultimate-critical-cover": 4,
  "healthshield-gold-max": 5,
  "core-healthshield-gold-max": 5,
  "solitaire-pa": 6,
  "core-solitaire-pa": 6,
  "platinum-wealth-venture": 7,
  "core-platinum-wealth-venture": 7,
};

export function getProductMasteryWeek(slug: string | undefined | null): number | undefined {
  if (!slug) return undefined;
  return SLUG_TO_WEEK[slug];
}

type Props = {
  /** Pass a product slug to deep-link directly into that product's week. Omit
   * for the generic "browse the whole track" call-to-action. */
  productSlug?: string;
  className?: string;
};

export function ProductMasteryCallout({ productSlug, className }: Props) {
  const week = getProductMasteryWeek(productSlug);
  const entryDay = week !== undefined ? (week - 1) * 5 + 1 : undefined;
  const href =
    entryDay !== undefined
      ? `/learning-track/product-mastery/day/${entryDay}`
      : "/learning-track/product-mastery";

  const headline = week !== undefined
    ? `Week ${week} of the Product Mastery Track`
    : "Product Mastery Track";
  const subline = week !== undefined
    ? "Five days of curriculum + a 10-question quiz per day, drawn from the canonical Product Summary."
    : "7 weeks, one core product per week. Five days each, with a 10-question quiz drawn from the canonical Product Summary.";
  const cta = week !== undefined ? "Open this week" : "Browse the track";

  return (
    <Link
      to={href}
      className={cn(
        "group relative flex items-center gap-4 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 transition-all hover:border-primary/40 hover:shadow-md",
        className,
      )}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
        <Sparkles className="h-6 w-6" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Optional</p>
        <h3 className="text-base font-bold font-serif leading-snug">{headline}</h3>
        <p className="text-xs text-muted-foreground line-clamp-1">{subline}</p>
      </div>
      <span className="hidden shrink-0 items-center gap-1 text-xs font-semibold uppercase tracking-wider text-primary group-hover:underline sm:inline-flex">
        {cta}
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}
