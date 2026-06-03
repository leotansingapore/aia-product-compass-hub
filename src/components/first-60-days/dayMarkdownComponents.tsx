import type { Components } from "react-markdown";
import { Link } from "react-router-dom";
import { markdownComponents } from "@/lib/markdown-config";
import { MermaidDiagram } from "./MermaidDiagram";

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
