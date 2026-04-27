import { useCallback, useEffect, useRef, useState } from "react";
import { Code2, Image as ImageIcon, Maximize2, Minus, Plus, RotateCcw } from "lucide-react";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type Props = {
  code: string;
};

type MermaidApi = {
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string, code: string) => Promise<{ svg: string }>;
};

// Shared module-level state — pay the cost once per session, not per diagram.
let mermaidPromise: Promise<MermaidApi> | null = null;
let mermaidCurrentTheme: "light" | "dark" | null = null;

const darkSubscribers = new Set<(dark: boolean) => void>();
let darkListenerInstalled = false;

function detectDark() {
  if (typeof document === "undefined") return false;
  return (
    document.documentElement.classList.contains("dark") ||
    window.matchMedia?.("(prefers-color-scheme: dark)").matches
  );
}

function ensureDarkListener() {
  if (darkListenerInstalled || typeof document === "undefined") return;
  darkListenerInstalled = true;
  const broadcast = () => {
    const dark = detectDark();
    darkSubscribers.forEach((cb) => cb(dark));
  };
  const obs = new MutationObserver(broadcast);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  window.matchMedia?.("(prefers-color-scheme: dark)").addEventListener?.("change", broadcast);
}

function applyTheme(mermaid: MermaidApi, dark: boolean) {
  const desired = dark ? "dark" : "light";
  if (mermaidCurrentTheme === desired) return;
  mermaidCurrentTheme = desired;
  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    securityLevel: "loose",
    themeVariables: dark ? DARK_THEME_VARS : LIGHT_THEME_VARS,
    flowchart: {
      htmlLabels: true,
      curve: "basis",
      padding: 14,
      nodeSpacing: 44,
      rankSpacing: 56,
      useMaxWidth: true,
      wrappingWidth: 200,
    },
    sequence: { useMaxWidth: true },
    gantt: { useMaxWidth: true },
  });
}

function getMermaid(): Promise<MermaidApi> {
  if (mermaidPromise) return mermaidPromise;
  // mermaid.core ships only the built-in diagrams (flowchart, sequence, pie,
  // class, state, ER, gantt, journey, gitGraph, requirement, c4, info) and
  // omits the heavy externals (wardley, cytoscape, katex, marked) — saves
  // ~1.5MB on first paint of any day with a diagram.
  mermaidPromise = import("mermaid/dist/mermaid.core.mjs").then(
    (mod) => (mod as unknown as { default: MermaidApi }).default,
  );
  return mermaidPromise;
}

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
  fontSize: "14px",
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
  fontSize: "14px",
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

// All the per-element diagram styling — applied to both the inline preview and
// the fullscreen modal so both surfaces look identical.
const DIAGRAM_STYLE_CLASSES = [
  // Sizing: always fit to container width on every viewport. The previous
  // mobile-only "natural size + horizontal pan" mode forced users to side-
  // scroll just to see what a chart was about; tap-to-enlarge replaces that.
  "[&_svg]:!h-auto [&_svg]:!block [&_svg]:!mx-auto [&_svg]:!max-w-full",

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
  // Quadrant chart polish — premium typography, rounded edges, breathing point labels
  "[&_.quadrant-title]:!text-[18px] [&_.quadrant-title]:!font-bold [&_.quadrant-title]:!tracking-tight",
  "[&_.quadrant-bg-quadrant]:![rx:14] [&_.quadrant-bg-quadrant]:![ry:14]",
  "[&_.quadrant-bg-quadrant]:[filter:drop-shadow(0_4px_10px_rgba(15,23,42,0.10))]",
  "dark:[&_.quadrant-bg-quadrant]:[filter:drop-shadow(0_4px_12px_rgba(0,0,0,0.4))]",
  "[&_.quadrant-quadrant-text]:!text-[15px] [&_.quadrant-quadrant-text]:!font-bold [&_.quadrant-quadrant-text]:!tracking-wide [&_.quadrant-quadrant-text]:!uppercase",
  "[&_.quadrant-x-axis-text-top]:!text-[12px] [&_.quadrant-x-axis-text-top]:!font-semibold [&_.quadrant-x-axis-text-top]:!uppercase [&_.quadrant-x-axis-text-top]:!tracking-[0.12em]",
  "[&_.quadrant-y-axis-text-left]:!text-[12px] [&_.quadrant-y-axis-text-left]:!font-semibold [&_.quadrant-y-axis-text-left]:!uppercase [&_.quadrant-y-axis-text-left]:!tracking-[0.12em]",
  "[&_.quadrant-point]:![r:7] [&_.quadrant-point]:![stroke:white] [&_.quadrant-point]:![stroke-width:2]",
  "dark:[&_.quadrant-point]:![stroke:#1f2737]",
  "[&_.quadrant-point-text]:!text-[12px] [&_.quadrant-point-text]:!font-semibold",
  // Pie chart polish
  "[&_.pieTitleText]:!font-bold [&_.pieTitleText]:!tracking-tight",
  "[&_.slice]:!stroke-2",
  "[&_.legend-text]:!text-[13px] [&_.legend-text]:!font-medium",
  // Mindmap polish — rounded nodes with shadow, distinctive root
  "[&_.mindmap-node_rect]:![rx:12] [&_.mindmap-node_rect]:![ry:12] [&_.mindmap-node_rect]:![stroke-width:2]",
  "[&_.mindmap-node]:[filter:drop-shadow(0_2px_6px_rgba(15,23,42,0.10))]",
  "dark:[&_.mindmap-node]:[filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.5))]",
  "[&_.mindmap-edge]:![stroke-width:2.5] [&_.mindmap-edge]:![opacity:0.7]",
  "[&_.section-root_rect]:![stroke-width:3]",
].join(" ");

export function MermaidDiagram({ code }: Props) {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(() => detectDark());
  const [shouldRender, setShouldRender] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSvg, setModalSvg] = useState<string | null>(null);
  const [showSource, setShowSource] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  // Subscribe to the shared dark-mode broadcaster (one listener for the whole
  // app, not one per diagram).
  useEffect(() => {
    ensureDarkListener();
    const cb = (d: boolean) => setIsDark(d);
    darkSubscribers.add(cb);
    return () => {
      darkSubscribers.delete(cb);
    };
  }, []);

  // Defer rendering until the diagram scrolls into view. Pages with 5+
  // diagrams used to render them all on mount; now they render as the user
  // approaches each one.
  useEffect(() => {
    if (shouldRender) return;
    if (typeof IntersectionObserver === "undefined") {
      setShouldRender(true);
      return;
    }
    const node = containerRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldRender(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [shouldRender]);

  useEffect(() => {
    if (!shouldRender) return;
    let cancelled = false;
    (async () => {
      try {
        const mermaid = await getMermaid();
        applyTheme(mermaid, isDark);
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
  }, [code, isDark, shouldRender]);

  // Re-render a separate copy of the SVG for the fullscreen modal. Using a
  // distinct DOM-id avoids id collisions with the inline preview SVG, and
  // re-rendering keeps it crisp at any zoom (vector, not bitmap).
  useEffect(() => {
    if (!modalOpen || modalSvg) return;
    let cancelled = false;
    (async () => {
      try {
        const mermaid = await getMermaid();
        applyTheme(mermaid, isDark);
        const id = `mermaid-modal-${Math.random().toString(36).slice(2, 9)}`;
        const { svg: rendered } = await mermaid.render(id, code);
        if (!cancelled) setModalSvg(rendered);
      } catch {
        // Fall back to the inline-preview SVG if re-render fails for any reason.
        if (!cancelled && svg) setModalSvg(svg);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [modalOpen, modalSvg, code, isDark, svg]);

  // Invalidate the modal SVG when source or theme changes, so it re-renders
  // next time the user opens it.
  useEffect(() => {
    setModalSvg(null);
  }, [code, isDark]);

  const handleOpenChange = useCallback((open: boolean) => {
    setModalOpen(open);
    if (!open) setShowSource(false);
  }, []);

  if (error) {
    return (
      <div
        ref={containerRef}
        className="my-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-xs text-destructive"
      >
        Diagram failed to render: {error}
      </div>
    );
  }

  if (!svg) {
    return (
      <div
        ref={containerRef}
        className="my-6 flex items-center justify-center rounded-xl border border-border/60 bg-muted/20 py-12 text-xs text-muted-foreground"
      >
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary/60" />
          {shouldRender ? "Rendering diagram…" : "Diagram"}
        </span>
      </div>
    );
  }

  return (
    <>
      <figure
        ref={containerRef}
        className="group relative my-6 overflow-hidden rounded-2xl border border-border/60 bg-gradient-card shadow-card"
      >
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

        <button
          ref={triggerRef}
          type="button"
          onClick={() => setModalOpen(true)}
          aria-label="Open diagram fullscreen"
          className="relative block w-full cursor-zoom-in text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <div
            className={cn(
              "relative flex w-full justify-center px-3 pb-5 pt-5 sm:px-6 sm:pt-8 sm:pb-6",
              DIAGRAM_STYLE_CLASSES,
            )}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </button>

        <span
          className={cn(
            "pointer-events-none absolute right-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full",
            "border border-border/60 bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
            "text-muted-foreground shadow-sm backdrop-blur-sm",
            "sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100",
          )}
        >
          <Maximize2 className="h-3 w-3" aria-hidden />
          <span className="hidden sm:inline">Click to enlarge</span>
          <span className="sm:hidden">Tap to enlarge</span>
        </span>
      </figure>

      <Dialog open={modalOpen} onOpenChange={handleOpenChange}>
        <DialogContent
          className={cn(
            "h-[100dvh] max-h-[100dvh] w-screen max-w-[100vw] gap-0 rounded-none border-0 p-0",
            "sm:h-[90vh] sm:max-h-[90vh] sm:w-[95vw] sm:max-w-[95vw] sm:rounded-2xl sm:border",
          )}
        >
          <DialogTitle className="sr-only">Diagram fullscreen view</DialogTitle>
          <DialogDescription className="sr-only">
            Pinch or scroll-wheel to zoom; drag to pan; double-tap to reset. Press escape to close.
          </DialogDescription>

          <div className="relative h-full w-full overflow-hidden bg-background">
            {showSource ? (
              <pre className="h-full w-full overflow-auto bg-muted/40 p-6 font-mono text-xs leading-relaxed text-foreground">
                <code>{code}</code>
              </pre>
            ) : modalSvg ? (
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                centerOnInit
                doubleClick={{ mode: "reset" }}
                wheel={{ step: 0.2 }}
                pinch={{ step: 5 }}
                limitToBounds={false}
              >
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <>
                    <TransformComponent
                      wrapperClass="!w-full !h-full"
                      contentClass="!w-full !h-full !flex !items-center !justify-center"
                    >
                      <div
                        className={cn(
                          "flex w-full max-w-full items-center justify-center p-4 sm:p-8",
                          DIAGRAM_STYLE_CLASSES,
                        )}
                        dangerouslySetInnerHTML={{ __html: modalSvg }}
                      />
                    </TransformComponent>

                    <div
                      className={cn(
                        "absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1",
                        "rounded-full border border-border bg-background/95 p-1 shadow-lg backdrop-blur-sm",
                      )}
                    >
                      <ToolbarButton onClick={() => zoomOut()} ariaLabel="Zoom out">
                        <Minus className="h-4 w-4" aria-hidden />
                      </ToolbarButton>
                      <ToolbarButton onClick={() => resetTransform()} ariaLabel="Reset zoom">
                        <RotateCcw className="h-4 w-4" aria-hidden />
                      </ToolbarButton>
                      <ToolbarButton onClick={() => zoomIn()} ariaLabel="Zoom in">
                        <Plus className="h-4 w-4" aria-hidden />
                      </ToolbarButton>
                      <span className="mx-1 h-5 w-px bg-border" aria-hidden />
                      <ToolbarButton onClick={() => setShowSource(true)} ariaLabel="View source">
                        <Code2 className="h-4 w-4" aria-hidden />
                      </ToolbarButton>
                    </div>
                  </>
                )}
              </TransformWrapper>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary/60" />
                  Rendering…
                </span>
              </div>
            )}

            {showSource && (
              <button
                type="button"
                onClick={() => setShowSource(false)}
                className={cn(
                  "absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2",
                  "rounded-full border border-border bg-background/95 px-4 py-2 text-xs font-medium shadow-lg backdrop-blur-sm",
                  "hover:bg-accent",
                )}
              >
                <ImageIcon className="h-3.5 w-3.5" aria-hidden />
                View diagram
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ToolbarButton({
  onClick,
  ariaLabel,
  children,
}: {
  onClick: () => void;
  ariaLabel: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      {children}
    </button>
  );
}
