import type { Components } from "react-markdown";
import { Link } from "react-router-dom";
import { dayMarkdownComponents } from "./dayMarkdownComponents";
import { markdownComponents } from "@/lib/markdown-config";
import { detectVideoEmbed } from "@/lib/video-embed-utils";

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
    // A standalone link to a video (Loom / YouTube) gets embedded as an inline
    // player, matching day-page behaviour — assignment instructions sometimes
    // walk through a tutorial video and want it playable in place. We only do
    // this for links whose visible text equals the href (i.e. a bare URL on its
    // own line), so inline links inside a sentence or a table cell stay plain
    // clickable anchors and never blow a table column out with an iframe.
    const childText = Array.isArray(children) ? children.join("") : String(children ?? "");
    const isBareUrl = childText.trim() === url.trim();
    if (isBareUrl && detectVideoEmbed(url).isVideo) {
      const Base = markdownComponents.a as any;
      return <Base href={url} {...rest}>{children}</Base>;
    }
    // External link (YouTube, Loom, docs.google, etc.) — render as a plain clickable
    // anchor for inline / table contexts where an iframe would break the layout.
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
