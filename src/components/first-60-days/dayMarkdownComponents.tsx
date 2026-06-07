import type { Components } from "react-markdown";
import { Link } from "react-router-dom";
import { markdownComponents } from "@/lib/markdown-config";
import { MermaidDiagram } from "./MermaidDiagram";

// Targets that have no web route — other learning tracks and Obsidian-only
// source folders. Relative links to these render as plain text, not dead links.
const NON_SHIPPED_DOC =
  /(?:next-60-days|first-14-days|first-30-days|product-mastery|pre-retiree|_source-|product-sales|appointment-setting|warm-market-flow|basic-cpf|behavioural-competency|-ingest|weekly-recaps)/i;

/**
 * Resolves a relative markdown link authored for Obsidian (e.g.
 * `../week-9/day-52.md`, `../assignments/assignment-02.md`, `day-37.md`) into a
 * SPA route. Returns `{ to }` for a routable target, `{ plain: true }` for a doc
 * that ships nowhere on the web (so it renders as plain text instead of a dead
 * relative URL), or `null` when the href is not a relative doc link at all
 * (absolute, external, anchor) and should fall through to the normal handlers.
 */
function resolveRelativeDocLink(url: string): { to?: string; plain?: boolean } | null {
  // Only relative hrefs are our concern — absolute routes, externals, anchors,
  // and protocols fall through to the normal handlers.
  if (!url || /^(https?:|mailto:|tel:|#|\/)/i.test(url)) return null;
  const path = url.split("#")[0].split("?")[0];
  if (!NON_SHIPPED_DOC.test(path)) {
    let m: RegExpMatchArray | null;
    if ((m = path.match(/(?:^|\/)(?:week-\d+\/)?day-0*(\d+)(?:\.md)?$/)))
      return { to: `/learning-track/first-60-days/day/${Number(m[1])}` };
    if ((m = path.match(/(?:^|\/)assignment-0*(\d+)(?:\.md)?$/)))
      return { to: `/learning-track/pre-rnf/assignments/assignment-${String(m[1]).padStart(2, "0")}` };
  }
  // Any other relative link (other tracks, source folders, sibling docs,
  // directory links like `../week-1/`) has no SPA route and would render as a
  // dead relative URL — keep the text, drop the link.
  return { plain: true };
}

export const dayMarkdownComponents: Components = {
  ...markdownComponents,
  a: ({ children, href, ...rest }: any) => {
    const url = typeof href === "string" ? href : "";
    // `[label](#t=NNN)` jumps the on-page <video> to NNN seconds. Used by the
    // Day 6 lecture-notes section to make the recording navigable from prose.
    const seekMatch = url.match(/^#t=(\d+)$/);
    if (seekMatch) {
      const seconds = Number(seekMatch[1]);
      return (
        <button
          type="button"
          className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors font-mono text-[0.95em]"
          onClick={(e) => {
            e.preventDefault();
            const video = document.querySelector("video");
            if (video instanceof HTMLVideoElement) {
              video.currentTime = seconds;
              video.play().catch(() => {
                /* autoplay block — user just sees the seeked frame */
              });
              video.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }}
        >
          {children}
        </button>
      );
    }
    const isInternal = url.startsWith("/") && !url.startsWith("//");
    if (isInternal) {
      // Absolute links to a static file in /public (e.g. /slides/x.html, a PDF)
      // must be a real anchor — a React Router <Link> navigates client-side and
      // 404s instead of serving the file.
      if (/\.(html?|pdf|zip|csv|xlsx?|pptx?|docx?|txt|mp4|mov|webp|png|jpe?g|svg)(\?|#|$)/i.test(url)) {
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
    // Obsidian-style relative doc links (`../week-9/day-52.md`, `assignment-02.md`).
    const rel = resolveRelativeDocLink(url);
    if (rel?.to) {
      return (
        <Link
          to={rel.to}
          className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
          {...rest}
        >
          {children}
        </Link>
      );
    }
    if (rel?.plain) {
      // Target ships nowhere on the web — keep the text, drop the dead link.
      return <span {...rest}>{children}</span>;
    }
    const Fallback = markdownComponents.a as any;
    return <Fallback href={url} {...rest}>{children}</Fallback>;
  },
  code: ({ className, children, ...rest }: any) => {
    const lang = typeof className === "string" ? className.replace("language-", "") : "";
    if (lang === "mermaid") {
      const code = Array.isArray(children) ? children.join("") : String(children ?? "");
      return <MermaidDiagram code={code.trim()} />;
    }
    const Fallback = markdownComponents.code as any;
    return <Fallback className={className} {...rest}>{children}</Fallback>;
  },
  pre: ({ children, ...rest }: any) => {
    const child: any = Array.isArray(children) ? children[0] : children;
    const lang: string | undefined = child?.props?.className?.replace?.("language-", "");
    if (lang === "mermaid") {
      return <>{children}</>;
    }
    const Fallback = markdownComponents.pre as any;
    return <Fallback {...rest}>{children}</Fallback>;
  },
  // Day-page tables: let cells WRAP to fit the viewport instead of forcing the
  // table to its max-content width. The shared base uses `min-w-max`, which is
  // right for short numeric tables but makes any table with sentence-length
  // cells (the bulk of curriculum content) overflow a 390px phone and clip the
  // rightmost columns behind a horizontal scroll. `w-full` + auto layout wraps
  // long cells (taller, but fully readable) and still fills the width on
  // desktop. Zebra striping is added on rows for scan-ability across wide rows.
  table: ({ children }: any) => (
    <div className="-mx-3 mb-4 overflow-x-auto rounded-lg border border-border [-webkit-overflow-scrolling:touch] sm:mx-0">
      {/* First column holds the row's label term (often a single long word like
          "generation"); give it a floor width so it wraps on word boundaries
          instead of breaking mid-word in a squeezed phone column. */}
      <table className="w-full divide-y divide-border text-sm [&_td:first-child]:min-w-[5.5rem] [&_th:first-child]:min-w-[5.5rem]">
        {children}
      </table>
    </div>
  ),
  tr: ({ children }: any) => (
    <tr className="transition-colors even:bg-muted/30 hover:bg-muted/50">{children}</tr>
  ),
  // Tighter horizontal padding on phones reclaims width for wrapping text;
  // restores the comfortable base padding from the sm breakpoint up.
  th: ({ children }: any) => (
    <th className="px-2.5 py-2 text-left align-top text-[11px] font-semibold uppercase tracking-wider text-foreground sm:px-4">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-2.5 py-2 align-top text-sm text-foreground sm:px-4">{children}</td>
  ),
};
