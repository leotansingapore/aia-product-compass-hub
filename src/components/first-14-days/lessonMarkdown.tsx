import type { Components } from "react-markdown";
import { dayMarkdownComponents } from "@/components/first-60-days/dayMarkdownComponents";

// Leo's Pick a Time page, where a candidate books the onboarding call.
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

// Day markdown for the First 14 Days: an image opens full size in a new tab,
// where a phone can pinch-zoom a dense slide; booking links are counted.
export const lessonMarkdownComponents: Components = {
  ...dayMarkdownComponents,
  img: (props: any) => (
    <a
      href={props.src}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open full size: ${props.alt || "image"}`}
      className="block cursor-zoom-in"
    >
      <BaseImg {...props} />
    </a>
  ),
  a: (props: any) =>
    props.href === ONBOARDING_CALL_URL ? (
      <span onClick={() => trackOnboardingCallClick("link")}>
        <BaseLink {...props} />
      </span>
    ) : (
      <BaseLink {...props} />
    ),
};
