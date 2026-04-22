import { useEffect, useState } from "react";

type Props = {
  code: string;
};

const LIGHT_THEME_VARS = {
  background: "transparent",
  // White node bodies with a strong navy border — each box pops against the
  // soft-blue cluster tint behind it.
  primaryColor: "#ffffff",
  primaryTextColor: "#0f172a",
  primaryBorderColor: "#1b4fa4",
  secondaryColor: "#fff5d6",
  secondaryTextColor: "#0f172a",
  secondaryBorderColor: "#c99a2a",
  tertiaryColor: "#f4f1ea",
  tertiaryTextColor: "#0f172a",
  tertiaryBorderColor: "#cbd1e0",
  mainBkg: "#ffffff",
  secondBkg: "#fff5d6",
  lineColor: "#94a3b8",
  // Edge labels on white so they match nodes instead of looking like dark pills.
  edgeLabelBackground: "#ffffff",
  nodeBorder: "#1b4fa4",
  // Clusters get a soft blue tint that sits underneath the white nodes.
  clusterBkg: "#eef3fb",
  clusterBorder: "#c7d2fe",
  titleColor: "#0f172a",
  labelBackground: "#ffffff",
  fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif",
  fontSize: "15px",
};

const DARK_THEME_VARS = {
  background: "transparent",
  // Nodes sit clearly above the cluster: elevated slate, bright blue border.
  primaryColor: "#2a3a58",
  primaryTextColor: "#e7ebf3",
  primaryBorderColor: "#6b9bff",
  secondaryColor: "#3a2d1a",
  secondaryTextColor: "#e7ebf3",
  secondaryBorderColor: "#e0b94f",
  tertiaryColor: "#1e2533",
  tertiaryTextColor: "#e7ebf3",
  tertiaryBorderColor: "#3a4050",
  mainBkg: "#2a3a58",
  secondBkg: "#3a2d1a",
  lineColor: "#8892a8",
  // Match edge label to node body — no more near-black pills.
  edgeLabelBackground: "#2a3a58",
  nodeBorder: "#6b9bff",
  // Clusters drop deeper than nodes to read as containers, not siblings.
  clusterBkg: "#161b29",
  clusterBorder: "#3a4258",
  titleColor: "#e7ebf3",
  labelBackground: "#2a3a58",
  fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif",
  fontSize: "15px",
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
          // Node polish: softer corners, subtle elevation so boxes feel lifted.
          "[&_.node_rect]:![stroke-width:1.5] [&_.node_rect]:![rx:10] [&_.node_rect]:![ry:10]",
          "[&_.node]:[filter:drop-shadow(0_1px_2px_rgba(15,23,42,0.12))]",
          "dark:[&_.node]:[filter:drop-shadow(0_1px_3px_rgba(0,0,0,0.45))]",
          // Cluster (subgraph) polish: rounded + subtly dashed border so the
          // container reads as a group without competing with the nodes.
          "[&_.cluster_rect]:![rx:14] [&_.cluster_rect]:![ry:14]",
          "[&_.cluster_rect]:![stroke-width:1] [&_.cluster_rect]:![stroke-dasharray:4_4]",
          // Subgraph title: small-caps and lighter weight so it reads as a header.
          "[&_.cluster-label_.nodeLabel]:!font-semibold [&_.cluster-label_.nodeLabel]:!tracking-wider",
          "[&_.cluster-label_.nodeLabel]:!text-[12px] [&_.cluster-label_.nodeLabel]:!uppercase",
          "[&_.cluster-label_.nodeLabel]:!opacity-75",
          // Edge labels: snug pill with matching bg.
          "[&_.edgeLabel]:!text-[13px] [&_.edgeLabel]:!font-medium",
          "[&_.edgeLabel_rect]:![rx:6] [&_.edgeLabel_rect]:![ry:6]",
          "[&_.edgeLabel_foreignObject_div]:!px-2 [&_.edgeLabel_foreignObject_div]:!py-[1px]",
          // Edges: thicker rounded strokes feel less wiry.
          "[&_.flowchart-link]:![stroke-width:1.75] [&_.flowchart-link]:![stroke-linecap:round] [&_.flowchart-link]:![stroke-linejoin:round]",
        ].join(" ")}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </figure>
  );
}
