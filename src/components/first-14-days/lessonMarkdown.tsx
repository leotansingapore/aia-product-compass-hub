import { Children, isValidElement, lazy, Suspense } from "react";
import type { Components } from "react-markdown";
import { ZoomIn } from "lucide-react";
import { dayMarkdownComponents } from "@/components/first-60-days/dayMarkdownComponents";
import { DIAGRAM_KINDS, LayersDiagram, type DiagramKind } from "./LayersDiagram";

// Leo's Pick a Time page, where a candidate books the review call (every 2 weeks).
// The constant and the onboarding_call_clicked event keep their old names so the counts stay comparable.
export const ONBOARDING_CALL_URL = "https://www.pick-a-time.app/book/withleo";

// Autocapture keeps no link text or targets (see lib/posthog.ts), so a booking
// is invisible without a named event. Lazy import: the SDK stays out of this
// chunk, and capture is a no-op off the production host where it never inits.
export function trackOnboardingCallClick(source: "button" | "link") {
  void import("posthog-js")
    .then(({ default: posthog }) => posthog.capture("onboarding_call_clicked", { source }))
    .catch(() => {});
}

const BaseImg = dayMarkdownComponents.img as any;
const BaseLink = dayMarkdownComponents.a as any;
const BaseCode = dayMarkdownComponents.code as any;
const BasePre = dayMarkdownComponents.pre as any;
const fenceLang = (className: unknown) => (typeof className === "string" ? className.replace("language-", "") : "");
const isDiagram = (lang: string): lang is DiagramKind => (DIAGRAM_KINDS as readonly string[]).includes(lang);
// Lazy: recharts only loads on the day that uses the calculator (Day 6).
const IncomeCalculator = lazy(() => import("./IncomeCalculator"));
const isBlock = (lang: string) => isDiagram(lang) || lang === "income-calculator";

// Day markdown for the First 14 Days: ```layers, ```pyramid, ```steps, ```stats,
// ```compare, ```press and ```house fences draw diagrams (LayersDiagram), ```income-calculator embeds the
// income calculator, an image opens full size in a new tab, where a
// phone can pinch-zoom a dense slide, and booking links are counted.
export const lessonMarkdownComponents: Components = {
  ...dayMarkdownComponents,
  img: (props: any) => (
    <a
      href={props.src}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open full size: ${props.alt || "image"}`}
      // A portrait photo at natural size ran ~960px tall on desktop.
      className="relative block cursor-zoom-in [&_img]:max-h-[70vh] [&_img]:max-w-full [&_img]:!w-auto"
    >
      <BaseImg {...props} />
      {/* A dense slide is unreadable at phone width; say it opens full size. */}
      <span
        aria-hidden
        className="absolute bottom-4 right-2 grid h-8 w-8 place-items-center rounded-full bg-background/90 text-foreground shadow sm:hidden"
      >
        <ZoomIn className="h-4 w-4" />
      </span>
    </a>
  ),
  code: (props) => {
    const lang = fenceLang(props.className);
    if (lang === "income-calculator")
      return (
        <Suspense fallback={<div className="my-8 h-[40rem] animate-pulse rounded-2xl bg-muted" />}>
          <IncomeCalculator />
        </Suspense>
      );
    if (!isDiagram(lang)) return <BaseCode {...props} />;
    return <LayersDiagram code={[props.children].flat().join("")} kind={lang} />;
  },
  pre: (props) => {
    const child = Children.toArray(props.children)[0];
    const lang = isValidElement<{ className?: string }>(child) ? fenceLang(child.props.className) : "";
    return isBlock(lang) ? <>{props.children}</> : <BasePre {...props} />;
  },
  // The shared li is text-sm, a size below the lesson's paragraphs.
  li: ({ children }) => <li className="pl-1 leading-relaxed text-foreground">{children}</li>,
  a: (props: any) =>
    props.href === ONBOARDING_CALL_URL ? (
      <span onClick={() => trackOnboardingCallClick("link")}>
        <BaseLink {...props} />
      </span>
    ) : (
      <BaseLink {...props} />
    ),
};
