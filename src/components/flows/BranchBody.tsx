import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { markdownComponents } from "@/lib/markdown-config";

/**
 * Renders an appointment-flow branch `body` as formatted markdown.
 *
 * The body strings use markdown (`**bold**` sub-heads, numbered + bulleted
 * lists, quoted objection lines). They were previously dropped into a
 * `whitespace-pre-line` div, so the raw `**`, `1.` and `-` characters showed
 * on screen. Shared here so Flows.tsx and FlowDiagram.tsx render them the same.
 */
export function BranchBody({ body }: { body: string }) {
  return (
    <div className="text-sm leading-relaxed text-muted-foreground [&_strong]:text-foreground">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {body}
      </ReactMarkdown>
    </div>
  );
}
