import { useEffect, useState } from "react";

type Props = {
  code: string;
};

const LIGHT_THEME_VARS = {
  background: "transparent",
  primaryColor: "#eef3fb",
  primaryTextColor: "#1a1f2b",
  primaryBorderColor: "#1b4fa4",
  secondaryColor: "#fff5d6",
  secondaryTextColor: "#1a1f2b",
  secondaryBorderColor: "#c99a2a",
  tertiaryColor: "#f4f1ea",
  tertiaryTextColor: "#1a1f2b",
  tertiaryBorderColor: "#cbd1e0",
  mainBkg: "#eef3fb",
  secondBkg: "#fff5d6",
  lineColor: "#6c7386",
  edgeLabelBackground: "#faf8f5",
  nodeBorder: "#1b4fa4",
  clusterBkg: "#f7f8fc",
  clusterBorder: "#cbd1e0",
  titleColor: "#1a1f2b",
  labelBackground: "#faf8f5",
  fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif",
  fontSize: "14px",
};

const DARK_THEME_VARS = {
  background: "transparent",
  primaryColor: "#1e2a42",
  primaryTextColor: "#e7ebf3",
  primaryBorderColor: "#5c8dff",
  secondaryColor: "#3a2d1a",
  secondaryTextColor: "#e7ebf3",
  secondaryBorderColor: "#e0b94f",
  tertiaryColor: "#252a36",
  tertiaryTextColor: "#e7ebf3",
  tertiaryBorderColor: "#3a4050",
  mainBkg: "#1e2a42",
  secondBkg: "#2a2135",
  lineColor: "#8892a8",
  edgeLabelBackground: "#141821",
  nodeBorder: "#5c8dff",
  clusterBkg: "#1a1f2b",
  clusterBorder: "#3a4050",
  titleColor: "#e7ebf3",
  labelBackground: "#141821",
  fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif",
  fontSize: "14px",
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
            padding: 16,
            nodeSpacing: 50,
            rankSpacing: 60,
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
      <div className="absolute left-4 top-3 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/70 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground backdrop-blur-sm">
        <span className="inline-block h-1 w-1 rounded-full bg-primary" />
        Diagram
      </div>
      <div
        className="relative flex min-h-[160px] justify-center overflow-x-auto px-4 pb-6 pt-10 sm:px-6 sm:pt-12 [&_svg]:h-auto [&_svg]:max-w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </figure>
  );
}
