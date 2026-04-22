import { useEffect, useState } from "react";

type Props = {
  code: string;
};

const LIGHT_THEME_VARS = {
  background: "transparent",
  // Crisp white nodes with deep navy borders — high contrast, premium feel.
  primaryColor: "#ffffff",
  primaryTextColor: "#0b1220",
  primaryBorderColor: "#1e40af",
  secondaryColor: "#fffaeb",
  secondaryTextColor: "#0b1220",
  secondaryBorderColor: "#b8860b",
  tertiaryColor: "#f8fafc",
  tertiaryTextColor: "#0b1220",
  tertiaryBorderColor: "#cbd5e1",
  mainBkg: "#ffffff",
  secondBkg: "#fffaeb",
  // Edges: warmer grey, more visible against the soft background.
  lineColor: "#64748b",
  edgeLabelBackground: "#ffffff",
  nodeBorder: "#1e40af",
  // Clusters: distinctly recessed so the white nodes lift above them.
  clusterBkg: "#eef4ff",
  clusterBorder: "#bfd0f5",
  titleColor: "#0b1220",
  labelBackground: "#ffffff",
  fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif",
  fontSize: "15px",
  // Quadrant chart specifics
  quadrant1Fill: "#dcfce7",
  quadrant2Fill: "#dbeafe",
  quadrant3Fill: "#fef3c7",
  quadrant4Fill: "#fee2e2",
  quadrant1TextFill: "#14532d",
  quadrant2TextFill: "#1e3a8a",
  quadrant3TextFill: "#78350f",
  quadrant4TextFill: "#7f1d1d",
  quadrantPointFill: "#0b1220",
  quadrantPointTextFill: "#0b1220",
  quadrantXAxisTextFill: "#475569",
  quadrantYAxisTextFill: "#475569",
  quadrantInternalBorderStrokeFill: "#94a3b8",
  quadrantExternalBorderStrokeFill: "#1e40af",
  quadrantTitleFill: "#0b1220",
  // Pie chart
  pie1: "#3b82f6",
  pie2: "#10b981",
  pie3: "#f59e0b",
  pie4: "#ef4444",
  pie5: "#8b5cf6",
  pie6: "#ec4899",
  pieTitleTextSize: "18px",
  pieTitleTextColor: "#0b1220",
  pieSectionTextColor: "#ffffff",
  pieLegendTextColor: "#0b1220",
  pieStrokeColor: "#ffffff",
  pieStrokeWidth: "2px",
};

const DARK_THEME_VARS = {
  background: "transparent",
  // Nodes read as elevated cards on a deep slate canvas.
  primaryColor: "#2e3d5c",
  primaryTextColor: "#f1f5fb",
  primaryBorderColor: "#7ea8ff",
  secondaryColor: "#3d2f1d",
  secondaryTextColor: "#f1f5fb",
  secondaryBorderColor: "#f0c95f",
  tertiaryColor: "#1f2737",
  tertiaryTextColor: "#f1f5fb",
  tertiaryBorderColor: "#3a4258",
  mainBkg: "#2e3d5c",
  secondBkg: "#3d2f1d",
  lineColor: "#94a3b8",
  edgeLabelBackground: "#2e3d5c",
  nodeBorder: "#7ea8ff",
  clusterBkg: "#141a28",
  clusterBorder: "#3a4258",
  titleColor: "#f1f5fb",
  labelBackground: "#2e3d5c",
  fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif",
  fontSize: "15px",
  // Quadrant chart specifics — translucent washes that read on slate canvas
  quadrant1Fill: "#14532d",
  quadrant2Fill: "#1e3a8a",
  quadrant3Fill: "#78350f",
  quadrant4Fill: "#7f1d1d",
  quadrant1TextFill: "#bbf7d0",
  quadrant2TextFill: "#bfdbfe",
  quadrant3TextFill: "#fde68a",
  quadrant4TextFill: "#fecaca",
  quadrantPointFill: "#f1f5fb",
  quadrantPointTextFill: "#f1f5fb",
  quadrantXAxisTextFill: "#cbd5e1",
  quadrantYAxisTextFill: "#cbd5e1",
  quadrantInternalBorderStrokeFill: "#475569",
  quadrantExternalBorderStrokeFill: "#7ea8ff",
  quadrantTitleFill: "#f1f5fb",
  // Pie chart
  pie1: "#60a5fa",
  pie2: "#34d399",
  pie3: "#fbbf24",
  pie4: "#f87171",
  pie5: "#a78bfa",
  pie6: "#f472b6",
  pieTitleTextSize: "18px",
  pieTitleTextColor: "#f1f5fb",
  pieSectionTextColor: "#0b1220",
  pieLegendTextColor: "#f1f5fb",
  pieStrokeColor: "#1f2737",
  pieStrokeWidth: "2px",
};

function detectDark() {
  if (typeof document === "undefined") return false;
  return (
    document.documentElement.classList.contains("dark") ||
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
  );
}

export function MermaidDiagram({ code }: Props) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(() => detectDark());

  useEffect(() => {
    if (typeof document === "undefined") return;
    const obs = new MutationObserver(() => setIsDark(detectDark()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    const onMq = () => setIsDark(detectDark());
    mq?.addEventListener?.("change", onMq);
    return () => {
      obs.disconnect();
      mq?.removeEventListener?.("change", onMq);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: "base",
          securityLevel: "loose",
          themeVariables: isDark ? DARK_THEME_VARS : LIGHT_THEME_VARS,
          flowchart: {
            htmlLabels: true,
            curve: "basis",
            padding: 24,
            nodeSpacing: 64,
            rankSpacing: 72,
            useMaxWidth: true,
          },
          sequence: { useMaxWidth: true },
          gantt: { useMaxWidth: true },
        });
        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}`;
        const { svg: rendered } = await mermaid.render(id, code);
        if (!cancelled) {
          setSvg(rendered);
          setError(null);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Render failed");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code, isDark]);

  if (error) {
    return (
      <div className="my-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-xs text-destructive">
        Diagram failed to render: {error}
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-6 flex items-center justify-center rounded-xl border border-border/60 bg-muted/20 py-12 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary/60" />
          Rendering diagram…
        </span>
      </div>
    );
  }

  return (
    <figure className="relative my-6 overflow-hidden rounded-2xl border border-border/60 bg-gradient-card shadow-card">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse at top right, hsl(var(--primary) / 0.10), transparent 55%), radial-gradient(ellipse at bottom left, hsl(var(--accent) / 0.08), transparent 55%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06] [mask-image:radial-gradient(ellipse_at_center,black,transparent_85%)]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        className={[
          "relative flex min-h-[160px] justify-center overflow-x-auto px-4 pb-6 pt-6 sm:px-6 sm:pt-8",
          "[&_svg]:h-auto [&_svg]:max-w-full",
          // Node polish: rounded corners, crisp 2px borders, layered shadow for depth.
          "[&_.node_rect]:![stroke-width:2] [&_.node_rect]:![rx:12] [&_.node_rect]:![ry:12]",
          "[&_.node_polygon]:![stroke-width:2]",
          "[&_.node_circle]:![stroke-width:2]",
          "[&_.node]:[filter:drop-shadow(0_2px_4px_rgba(15,23,42,0.10))_drop-shadow(0_1px_2px_rgba(15,23,42,0.06))]",
          "dark:[&_.node]:[filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.50))_drop-shadow(0_1px_2px_rgba(0,0,0,0.30))]",
          // Node labels: tighter leading, slightly heavier weight for legibility.
          "[&_.nodeLabel]:!leading-snug [&_.nodeLabel]:!font-medium",
          "[&_.node_.nodeLabel_strong]:!font-semibold",
          // Cluster (subgraph) polish: pillowy rounded container with dashed border.
          "[&_.cluster_rect]:![rx:16] [&_.cluster_rect]:![ry:16]",
          "[&_.cluster_rect]:![stroke-width:1] [&_.cluster_rect]:![stroke-dasharray:5_4]",
          // Subgraph title: small-caps header.
          "[&_.cluster-label_.nodeLabel]:!font-semibold [&_.cluster-label_.nodeLabel]:!tracking-[0.08em]",
          "[&_.cluster-label_.nodeLabel]:!text-[11px] [&_.cluster-label_.nodeLabel]:!uppercase",
          "[&_.cluster-label_.nodeLabel]:!opacity-70",
          // Edge labels: snug pill with matching bg.
          "[&_.edgeLabel]:!text-[12.5px] [&_.edgeLabel]:!font-medium",
          "[&_.edgeLabel_rect]:![rx:6] [&_.edgeLabel_rect]:![ry:6]",
          "[&_.edgeLabel_foreignObject_div]:!px-2 [&_.edgeLabel_foreignObject_div]:!py-[2px]",
          // Edges: thicker rounded strokes, calm but present.
          "[&_.flowchart-link]:![stroke-width:2] [&_.flowchart-link]:![stroke-linecap:round] [&_.flowchart-link]:![stroke-linejoin:round]",
          // Arrowheads: match line color, slightly larger.
          "[&_.marker]:![fill:currentColor]",
        ].join(" ")}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </figure>
  );
}
