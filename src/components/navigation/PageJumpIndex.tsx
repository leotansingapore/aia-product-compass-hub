import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, X, List } from "lucide-react";
import { Input } from "@/components/ui/input";

interface JumpHeading {
  id: string;
  text: string;
  level: number;
  /** The nearest preceding top-level heading, for context in the list. */
  section: string | null;
}

interface PageJumpIndexProps {
  /**
   * CSS selector for the element containing the rendered headings. Headings are
   * read from the DOM rather than derived from source, because `rehype-slug`
   * owns the ids — recomputing them here would be a second implementation of
   * its slug algorithm that could silently drift and leave every link dead.
   */
  containerSelector: string;
  /** Flip true once the content has rendered, so the headings exist to read. */
  ready: boolean;
  /** Placeholder noun, e.g. "a section" → "Jump to a section — 24 sections". */
  label?: string;
  /** Sticky offset below the app header: 57px mobile, 48px (h-12) from md up. */
  className?: string;
}

/**
 * "On this page" jump index for long markdown documents.
 *
 * The curriculum day pages run 14–30 phone screens with 20–44 headings and had
 * no search, contents list or in-page navigation at all — the same gap the
 * Drawings Playbook had. Extracted here rather than copied so the six day-page
 * renderers share one implementation.
 */
export function PageJumpIndex({
  containerSelector,
  ready,
  label = "a section",
  className = "",
}: PageJumpIndexProps) {
  const [headings, setHeadings] = useState<JumpHeading[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ready) return;

    const read = () => {
      const root = document.querySelector(containerSelector);
      if (!root) return;
      const els = Array.from(root.querySelectorAll<HTMLElement>("h1, h2, h3"));
      let section: string | null = null;
      const next: JumpHeading[] = [];
      for (const el of els) {
        const text = (el.textContent || "").trim();
        if (!el.id || !text) continue;
        const level = Number(el.tagName.slice(1));
        if (level === 1) section = text;
        next.push({ id: el.id, text, level, section: level === 1 ? null : section });
      }
      setHeadings((prev) =>
        prev.length === next.length && prev.every((p, i) => p.id === next[i].id) ? prev : next,
      );
    };

    read();

    // Re-read as the body renders. The six day pages each signal "content is
    // ready" differently (async rehype plugin loads, lazy markdown fetches,
    // tab switches), so rather than wire a bespoke flag per page — and get one
    // of them wrong — watch the container and pick the headings up whenever
    // they appear. The identity check above keeps this from looping.
    const root = document.querySelector(containerSelector);
    if (!root) return;
    const observer = new MutationObserver(read);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [ready, containerSelector]);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return headings;
    return headings.filter(
      (h) => h.text.toLowerCase().includes(q) || (h.section || "").toLowerCase().includes(q),
    );
  }, [headings, query]);

  // Close on outside tap so the list never covers what was just jumped to.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const jumpTo = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    setOpen(false);
    setQuery("");

    // Name the section in the address bar so it can be sent to someone, and so
    // the browser's own anchor handling has something to restore.
    try {
      window.history.replaceState(null, "", `#${id}`);
    } catch {
      /* non-critical */
    }

    // Measure the chrome that is actually pinned right now (app header + this
    // bar) rather than hard-coding a number that breaks at the other breakpoint.
    const desiredTop = () => {
      const header = document.querySelector("header");
      const headerH =
        header && getComputedStyle(header).position === "sticky"
          ? header.getBoundingClientRect().height
          : 0;
      return headerH + (barRef.current?.getBoundingClientRect().height ?? 0) + 12;
    };

    // Scroll, then re-measure and correct. Long documents contain lazily-loaded
    // images; a big jump reveals ones ABOVE the target which then load and grow
    // the document under the in-flight scroll, leaving the heading off-screen.
    let attempt = 0;
    const settle = () => {
      const target = document.getElementById(id);
      if (!target) return;
      const delta = target.getBoundingClientRect().top - desiredTop();
      if (Math.abs(delta) <= 4 || attempt > 8) return;
      window.scrollTo({
        top: Math.max(0, window.scrollY + delta),
        behavior: attempt === 0 ? "smooth" : "auto",
      });
      attempt += 1;
      setTimeout(settle, attempt === 1 ? 420 : 110);
    };
    settle();
  }, []);

  if (!ready || headings.length === 0) return null;

  const sectionCount = headings.filter((h) => h.level <= 2).length;

  return (
    <div
      ref={containerRef}
      className={`sticky top-[57px] md:top-12 z-30 -mx-3 md:-mx-6 px-3 md:px-6 pt-2 pb-2 bg-background ${className}`}
    >
      <div ref={barRef} className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          type="search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={`Jump to ${label} — ${sectionCount} sections`}
          aria-label={`Search this page and jump to ${label}`}
          aria-expanded={open}
          aria-controls="page-jump-list"
          className="pl-10 pr-10 h-11"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setOpen(true);
            }}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? "Hide the contents list" : "Show the contents list"}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground"
          >
            <List className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <div
          id="page-jump-list"
          role="listbox"
          className="absolute left-3 right-3 md:left-6 md:right-6 mt-1 max-h-[60vh] overflow-y-auto rounded-lg border bg-popover shadow-lg z-50"
        >
          {matches.length === 0 ? (
            <p className="px-3 py-4 text-sm text-muted-foreground">
              Nothing on this page matches “{query.trim()}”.
            </p>
          ) : (
            matches.map((h) => (
              <button
                key={h.id}
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => jumpTo(h.id)}
                className={`w-full text-left px-3 py-2.5 hover:bg-accent transition-colors border-b border-border/40 last:border-0 ${
                  h.level === 1 ? "bg-muted/40" : ""
                }`}
              >
                <span
                  className={
                    h.level === 1
                      ? "text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                      : h.level === 2
                        ? "text-sm font-medium"
                        : "text-sm text-muted-foreground pl-3 block"
                  }
                >
                  {h.text}
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
