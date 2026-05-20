import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import DOMPurify from "dompurify";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";
import { Maximize2, Minus, Plus, RotateCcw } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AppointmentFlow, FlowBranch } from "@/data/appointmentFlows";

type MermaidApi = {
  initialize: (config: Record<string, unknown>) => void;
  render: (id: string, code: string) => Promise<{ svg: string }>;
};

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

function getMermaid(): Promise<MermaidApi> {
  if (mermaidPromise) return mermaidPromise;
  mermaidPromise = import("mermaid/dist/mermaid.core.mjs").then(
    (mod) => (mod as unknown as { default: MermaidApi }).default,
  );
  return mermaidPromise;
}

function applyTheme(mermaid: MermaidApi, dark: boolean) {
  const desired = dark ? "dark" : "light";
  if (mermaidCurrentTheme === desired) return;
  mermaidCurrentTheme = desired;
  const themeVars = dark
    ? {
        background: "transparent",
        primaryColor: "#2e3d5c",
        primaryTextColor: "#f1f5fb",
        primaryBorderColor: "#7ea8ff",
        mainBkg: "#2e3d5c",
        lineColor: "#94a3b8",
        edgeLabelBackground: "#2e3d5c",
        nodeBorder: "#7ea8ff",
        fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif",
        fontSize: "14px",
      }
    : {
        background: "transparent",
        primaryColor: "#ffffff",
        primaryTextColor: "#0b1220",
        primaryBorderColor: "#1e40af",
        mainBkg: "#ffffff",
        lineColor: "#64748b",
        edgeLabelBackground: "#ffffff",
        nodeBorder: "#1e40af",
        fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif",
        fontSize: "14px",
      };
  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    securityLevel: "loose",
    themeVariables: themeVars,
    flowchart: {
      htmlLabels: true,
      curve: "basis",
      padding: 14,
      nodeSpacing: 44,
      rankSpacing: 56,
      useMaxWidth: true,
      wrappingWidth: 220,
    },
  });
}

function esc(s: string): string {
  return s.replace(/"/g, "'").replace(/\n+/g, " ").trim();
}

function flowToMermaid(flow: AppointmentFlow): string {
  const lines: string[] = ["flowchart TD"];
  lines.push(`  ANCHOR["${esc(flow.anchorFrame)}"]:::anchorNode`);
  lines.push(`  DISC[/"Discovery (${flow.discoveryQuestions.length} questions)"/]:::discNode`);
  lines.push(`  DECIDE{{"Decide branch"}}:::decideNode`);
  lines.push(`  ANCHOR --> DISC`);
  lines.push(`  DISC --> DECIDE`);
  for (const b of flow.branches) {
    const nodeId = b.id.replace(/[^a-zA-Z0-9_]/g, "_");
    const summary = b.receiptPattern.slice(0, 90);
    lines.push(`  ${nodeId}["<b>${esc(b.label)}</b><br/>${esc(summary)}…"]:::branchNode`);
    lines.push(`  DECIDE -- "${esc(b.condition)}" --> ${nodeId}`);
  }
  lines.push(`  classDef anchorNode fill:#fef3c7,stroke:#d97706,color:#78350f,stroke-width:2px`);
  lines.push(`  classDef discNode fill:#dbeafe,stroke:#2563eb,color:#1e3a8a,stroke-width:2px`);
  lines.push(`  classDef decideNode fill:#fae8ff,stroke:#a21caf,color:#581c87,stroke-width:2px`);
  lines.push(`  classDef branchNode fill:#dcfce7,stroke:#16a34a,color:#14532d,stroke-width:2px`);
  return lines.join("\n");
}

// SVG sanitizer config — preserves SVG semantics while stripping script/event handlers.
const SVG_PURIFY_CONFIG = {
  USE_PROFILES: { svg: true, svgFilters: true, html: true },
  ADD_TAGS: ["foreignObject"],
  ADD_ATTR: ["target"],
};

const DIAGRAM_CLASSES = [
  "[&_svg]:!h-auto [&_svg]:!block [&_svg]:!mx-auto [&_svg]:!max-w-full",
  "[&_.node_rect]:![stroke-width:2] [&_.node_rect]:![rx:12] [&_.node_rect]:![ry:12]",
  "[&_.node_polygon]:![stroke-width:2]",
  "[&_.node]:[filter:drop-shadow(0_2px_4px_rgba(15,23,42,0.10))]",
  "dark:[&_.node]:[filter:drop-shadow(0_2px_6px_rgba(0,0,0,0.5))]",
  "[&_.nodeLabel]:!leading-snug [&_.nodeLabel]:!font-medium",
  "[&_.edgeLabel]:!text-[12px] [&_.edgeLabel]:!font-medium",
  "[&_.flowchart-link]:![stroke-width:2]",
  "[&_.marker]:![fill:currentColor]",
].join(" ");

type Props = {
  flow: AppointmentFlow;
};

export function FlowDiagram({ flow }: Props) {
  const [svg, setSvg] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(() => detectDark());
  const [openBranch, setOpenBranch] = useState<FlowBranch | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ensureDarkListener();
    const cb = (d: boolean) => setIsDark(d);
    darkSubscribers.add(cb);
    return () => {
      darkSubscribers.delete(cb);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mermaid = await getMermaid();
      applyTheme(mermaid, isDark);
      const id = `flow-${flow.id}-${Math.random().toString(36).slice(2, 8)}`;
      const code = flowToMermaid(flow);
      try {
        const { svg: rendered } = await mermaid.render(id, code);
        const safe = DOMPurify.sanitize(rendered, SVG_PURIFY_CONFIG);
        if (!cancelled) setSvg(safe);
      } catch {
        if (!cancelled) setSvg(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [flow, isDark]);

  // Wire click handlers to branch nodes after render.
  useEffect(() => {
    if (!svg) return;
    const wire = (root: HTMLElement | null) => {
      if (!root) return;
      const branchNodes = Array.from(root.querySelectorAll(".branchNode")) as HTMLElement[];
      branchNodes.forEach((node) => {
        const flowchartId = node.id;
        const match = flow.branches.find((b) =>
          flowchartId.includes(b.id.replace(/[^a-zA-Z0-9_]/g, "_")),
        );
        if (!match) return;
        node.style.cursor = "pointer";
        node.setAttribute("role", "button");
        node.setAttribute("tabindex", "0");
        node.setAttribute("aria-label", `Open branch ${match.label}`);
        const handler = (ev: Event) => {
          ev.stopPropagation();
          setOpenBranch(match);
        };
        node.addEventListener("click", handler);
        node.addEventListener("keydown", (e) => {
          if ((e as KeyboardEvent).key === "Enter") {
            (e as KeyboardEvent).preventDefault();
            setOpenBranch(match);
          }
        });
      });
    };
    wire(containerRef.current);
    wire(modalRef.current);
  }, [svg, flow]);

  if (!svg) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-border/60 bg-muted/20 py-12 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-2">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-primary/60" />
          Rendering diagram…
        </span>
      </div>
    );
  }

  return (
    <>
      <figure className="group relative my-2 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          aria-label="Enlarge diagram"
          className="relative block w-full cursor-zoom-in text-left"
        >
          <div
            ref={containerRef}
            className={cn(
              "relative flex w-full justify-center px-3 pb-5 pt-5 sm:px-6 sm:pt-8 sm:pb-6",
              "[&_svg]:!max-h-[55vh] sm:[&_svg]:!max-h-[50vh]",
              DIAGRAM_CLASSES,
            )}
            // svg is DOMPurify-sanitized output from mermaid.render
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        </button>
        <span className="pointer-events-none absolute right-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground shadow-sm backdrop-blur-sm">
          <Maximize2 className="h-3 w-3" />
          <span>Click a branch · pinch to zoom</span>
        </span>
      </figure>

      {/* Fullscreen modal with pan/zoom */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
        >
          <TransformWrapper
            initialScale={1}
            minScale={0.4}
            maxScale={4}
            centerOnInit
            doubleClick={{ mode: "reset" }}
            wheel={{ step: 0.2 }}
            limitToBounds={false}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <TransformComponent
                  wrapperClass="!w-full !h-full"
                  contentClass="!w-full !h-full !flex !items-center !justify-center"
                >
                  <div
                    ref={modalRef}
                    className={cn(
                      "flex w-full max-w-full items-center justify-center p-4 sm:p-8",
                      DIAGRAM_CLASSES,
                    )}
                    // svg is DOMPurify-sanitized output from mermaid.render
                    dangerouslySetInnerHTML={{ __html: svg }}
                  />
                </TransformComponent>

                <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-1 rounded-full border border-border bg-background/95 p-1 shadow-lg backdrop-blur-sm">
                  <button
                    onClick={() => zoomOut()}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent"
                    aria-label="Zoom out"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => resetTransform()}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent"
                    aria-label="Reset zoom"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => zoomIn()}
                    className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-accent"
                    aria-label="Zoom in"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="mx-1 h-5 w-px bg-border" />
                  <button
                    onClick={() => setModalOpen(false)}
                    className="rounded-full px-3 text-xs font-medium hover:bg-accent"
                    aria-label="Close"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </TransformWrapper>
        </div>
      )}

      {/* Branch detail sheet — opens when a branch node is clicked */}
      <Sheet open={!!openBranch} onOpenChange={(o) => !o && setOpenBranch(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {openBranch && (
            <>
              <SheetHeader>
                <SheetTitle className="text-left">{openBranch.label}</SheetTitle>
                <SheetDescription className="text-left">
                  When: {openBranch.condition}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-5 space-y-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                    Product stack
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {openBranch.productStack.map((p) => (
                      <Badge
                        key={p}
                        variant="outline"
                        className="text-[11px] px-2 py-0.5 font-mono"
                      >
                        {p}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 px-3 py-2.5">
                  <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-1">
                    Receipt pattern
                  </div>
                  <div className="text-sm text-emerald-900 dark:text-emerald-200 leading-snug">
                    {openBranch.receiptPattern}
                  </div>
                </div>

                {openBranch.body && (
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                      Canonical script
                    </div>
                    <div className="text-sm whitespace-pre-line">{openBranch.body}</div>
                  </div>
                )}

                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                    Example cases ({openBranch.exampleCaseIds.length})
                  </div>
                  {openBranch.exampleCaseIds.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      No example cases tagged yet.
                    </p>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {openBranch.exampleCaseIds.map((cid) => (
                        <Link
                          key={cid}
                          to={`/case-vault/${cid}`}
                          className="text-[11px] px-2 py-0.5 rounded-md border bg-muted/40 hover:bg-muted hover:border-primary/40 transition-colors font-mono"
                          onClick={() => setOpenBranch(null)}
                        >
                          {cid}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
