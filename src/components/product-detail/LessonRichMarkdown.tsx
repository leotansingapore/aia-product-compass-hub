/**
 * LessonRichMarkdown
 *
 * Heavy markdown surface used by ProductModuleCourseLayout and
 * VideoLearningInterface for the per-lesson `rich_content` field. Bundles
 * react-markdown + remarkGfm + rehypeRaw + rehypeSanitize + markdownComponents
 * + VideoEmbed + the embed-dedup helpers into ONE chunk that's only fetched
 * when a lesson actually has rich_content to render.
 *
 * Before extracting this: those deps were imported at the top of both parent
 * components, bundled into the ProductDetail chunk (~72KB), and shipped on
 * every video page paint even when no rich_content exists for the current
 * lesson. Now they ride in a sibling chunk that loads only on demand.
 *
 * Parents use `<Suspense fallback={...}>` around `<LessonRichMarkdown />` —
 * the fallback should match the height of expected content so there's no
 * layout shift when the chunk arrives.
 */
import type { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { markdownSanitizeSchema } from "@/lib/markdown-sanitize";
import { markdownComponents } from "@/lib/markdown-config";
import { areSameVideoEmbedSource, detectVideoEmbed } from "@/lib/video-embed-utils";
import { VideoEmbed } from "@/lib/video-embed";

// Module-level so react-markdown's parse cache stays valid across re-renders
// (same fix as ProductMasteryDay's REMARK_PLUGINS).
const REMARK_PLUGINS = [remarkGfm];
const REHYPE_PLUGINS = [rehypeRaw, [rehypeSanitize, markdownSanitizeSchema]] as const;

interface LessonRichMarkdownProps {
  /** Raw rich_content markdown string. */
  content: string;
  /** If a markdown link embeds a video equal to this URL, render a
   * "same as the lesson video above" hint instead of duplicating the
   * embed. Pass the URL that's playing in the parent's hero player.
   * Used by both call sites to dedup against the standalone player. */
  dedupHeroUrl?: string;
  /** When true, append `autoplay=1` to video embed URLs. Parent decides
   * based on its own play state. */
  shouldAutoplay?: boolean;
  /** Override the "same video" hint text — the two parents word it
   * differently ("lecture notes continue below" vs "notes continue
   * below"). */
  sameVideoHintText?: string;
}

export function LessonRichMarkdown({
  content,
  dedupHeroUrl,
  shouldAutoplay,
  sameVideoHintText = "Same as the lesson video above — notes continue below.",
}: LessonRichMarkdownProps) {
  return (
    <ReactMarkdown
      components={{
        ...markdownComponents,
        // Prevent invalid <div> (VideoEmbed) inside <p>: if any child is a
        // block-level element (div, or anything className-tagged with `my-4`
        // for spacing), promote the paragraph wrapper to a div.
        p: ({ children }: { children?: ReactNode }) => {
          const childArray = Array.isArray(children) ? children : [children];
          const hasBlock = childArray.some(
            (c: unknown) =>
              typeof c === "object" &&
              c !== null &&
              "type" in (c as { type?: string }) &&
              ((c as { type?: string }).type === "div" ||
                (typeof c === "object" &&
                  c !== null &&
                  "props" in c &&
                  typeof (c as { props?: { className?: string } }).props?.className === "string" &&
                  (c as { props: { className?: string } }).props.className?.includes("my-4"))),
          );
          if (hasBlock) return <div className="mb-3 last:mb-0">{children}</div>;
          return (
            <p className="mb-3 last:mb-0 leading-relaxed text-foreground">{children}</p>
          );
        },
        a: ({ children, href }: { children?: ReactNode; href?: string }) => {
          const embedInfo = detectVideoEmbed(href ?? "");
          if (embedInfo.isVideo && embedInfo.embedUrl) {
            if (dedupHeroUrl && areSameVideoEmbedSource(href ?? "", dedupHeroUrl)) {
              return (
                <span className="my-2 block rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                  {sameVideoHintText}
                </span>
              );
            }
            const autoplayUrl = shouldAutoplay
              ? `${embedInfo.embedUrl}${embedInfo.embedUrl.includes("?") ? "&" : "?"}autoplay=1`
              : embedInfo.embedUrl;
            return <VideoEmbed embedUrl={autoplayUrl} platform={embedInfo.platform || "video"} />;
          }
          return (
            <a
              href={href}
              className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          );
        },
      }}
      remarkPlugins={REMARK_PLUGINS}
      rehypePlugins={REHYPE_PLUGINS as unknown as never}
    >
      {content}
    </ReactMarkdown>
  );
}

export default LessonRichMarkdown;
