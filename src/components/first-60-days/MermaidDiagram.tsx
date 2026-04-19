import { useEffect, useState } from "react";
import DOMPurify from "dompurify";

type Props = {
  code: string;
};

let mermaidInitialized = false;

export function MermaidDiagram({ code }: Props) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        if (!mermaidInitialized) {
          const isDark =
            document.documentElement.classList.contains("dark") ||
            window.matchMedia("(prefers-color-scheme: dark)").matches;
          mermaid.initialize({
            startOnLoad: false,
            theme: isDark ? "dark" : "default",
            securityLevel: "strict",
            flowchart: { htmlLabels: true, curve: "basis" },
          });
          mermaidInitialized = true;
        }
        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg: rendered } = await mermaid.render(id, code);
        const clean = DOMPurify.sanitize(rendered, {
          USE_PROFILES: { svg: true, svgFilters: true },
        });
        if (!cancelled) setSvg(clean);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Render failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  if (error) {
    return (
      <div className="my-4 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
        Diagram failed to render: {error}
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-4 flex items-center justify-center rounded-md border bg-muted/30 py-10 text-xs text-muted-foreground">
        Rendering diagram…
      </div>
    );
  }

  return (
    <div
      className="my-4 flex justify-center overflow-x-auto rounded-md border bg-background p-4 [&_svg]:max-w-full [&_svg]:h-auto"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
