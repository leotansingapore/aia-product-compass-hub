import type { Components } from "react-markdown";
import { Link } from "react-router-dom";
import { dayMarkdownComponents } from "./dayMarkdownComponents";

const DAY_HREF_RE = /(?:\.\.\/)*first-60-days\/week-\d+\/day-(\d+)\.md/;

export const assignmentMarkdownComponents: Components = {
  ...dayMarkdownComponents,
  a: ({ children, href, ...rest }: any) => {
    const url = typeof href === "string" ? href : "";
    const isInternal = url.startsWith("/") && !url.startsWith("//");
    // Absolute link to a static file in /public (e.g. the Market Survey PDF, a
    // slide deck) must be a real anchor — a React Router <Link> navigates
    // client-side and 404s instead of serving the file.
    if (
      isInternal &&
      /\.(html?|pdf|zip|csv|xlsx?|pptx?|docx?|txt|mp4|mov|webp|png|jpe?g|svg)(\?|#|$)/i.test(url)
    ) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
          {...rest}
        >
          {children}
        </a>
      );
    }
    // Internal app route (e.g. /learning-track/...) → SPA Link
    if (isInternal) {
      return (
        <Link
          to={url}
          className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
          {...rest}
        >
          {children}
        </Link>
      );
    }
    // Day reference like ../../first-60-days/week-9/day-53.md → SPA Link to day page
    const dayMatch = url.match(DAY_HREF_RE);
    if (dayMatch) {
      const dayNumber = Number(dayMatch[1]);
      return (
        <Link
          to={`/learning-track/first-60-days/day/${dayNumber}`}
          className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
          {...rest}
        >
          {children}
        </Link>
      );
    }
    // External link (YouTube, Loom, docs.google, etc.) — render as a plain clickable
    // anchor. Intentionally NOT delegating to the auto-video-embed fallback because
    // the auto-embed replaces links with iframes, which breaks in tables and inline
    // contexts where learners need a clickable link instead of an inline player.
    return (
      <a
        href={url}
        className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {children}
      </a>
    );
  },
};
