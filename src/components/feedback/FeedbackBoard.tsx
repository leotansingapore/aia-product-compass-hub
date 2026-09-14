"use client";

/**
 * FeedbackBoard - the public roadmap page every product mounts at /roadmap.
 *
 * One page, three tabs: Roadmap (what is coming), Feedback (ask and vote) and Changelog
 * (what shipped). Layout and navigation follow the reference portal at
 * roadmap.respond.io; the colours come from the shadcn tokens each app already defines,
 * so the same file works in a light app and a dark one.
 *
 *   <FeedbackBoard apiUrl="https://leotan-feedback.vercel.app/api/v1"
 *                  boardKey="fb_..." appName="ActivityTracker"
 *                  identity={{ id: user.id, name, email }} homeUrl="/" />
 *
 * It is deliberately self-contained: React + Tailwind, no imports from the host app, no
 * router coupling, no component library. Tab and post state live in the query string.
 *
 * Source of truth: github.com/leotansingapore/feedback-board/client/FeedbackBoard.tsx
 * Every app's copy is an exact copy. Change it there, then run scripts/sync-dock.mjs.
 */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

// ---------- types ----------

export type FeedbackIdentity = { id: string; name?: string | null; email?: string | null };

type Category = "feature" | "bug" | "improvement" | "question";
type Status = "open" | "under_review" | "planned" | "in_progress" | "shipped" | "declined";
type ListStatus = Status | "all" | "complete";
type Sort = "trending" | "top" | "new";
type ChangeType = "new" | "improved" | "fixed" | "removed";

type Post = {
  id: string;
  number: number;
  title: string;
  body: string;
  category: Category;
  status: Status;
  author_name: string | null;
  is_official: boolean;
  pinned: boolean;
  vote_count: number;
  comment_count: number;
  created_at: string;
  shipped_at: string | null;
  voted: boolean;
};

type Comment = {
  id: string;
  body: string;
  author_name: string | null;
  is_official: boolean;
  created_at: string;
};

type StatusEvent = { id: string; to_status: Status; created_at: string };

type Duplicate = { id: string; number: number; title: string; body: string; author_name: string | null; created_at: string };

type ChangelogItem = {
  id: string;
  slug: string | null;
  date: string;
  type: ChangeType;
  title: string;
  body: string;
  image: { url: string; alt: string } | null;
  docs: { url: string; title: string | null } | null;
  postNumber: number | null;
  likes: number;
  liked: boolean;
  source: "entry" | "post";
};

type BoardInfo = {
  name: string;
  slug: string;
  tagline: string | null;
  intro: string | null;
  appUrl: string | null;
  notifies: boolean;
  assistant: boolean;
  support: boolean;
};

type Summary = { counts: Record<Category, number>; byStatus: Record<string, number>; total: number };

type Tab = "roadmap" | "feedback" | "changelog";
type View = { kind: Tab } | { kind: "post"; number: number };

const CATEGORIES: { value: Category; label: string; plural: string; hint: string }[] = [
  { value: "feature", label: "Feature request", plural: "Feature requests", hint: "Something new you want to exist" },
  { value: "improvement", label: "Improvement", plural: "Improvements", hint: "Something that exists but could be better" },
  { value: "bug", label: "Bug", plural: "Bugs", hint: "Something is broken or wrong" },
  { value: "question", label: "Question", plural: "Questions", hint: "You want to know how something works" },
];

const STATUS_LABEL: Record<Status, string> = {
  open: "Open",
  under_review: "Under review",
  planned: "Planned",
  in_progress: "In progress",
  shipped: "Complete",
  declined: "Not planned",
};

// Dot and pill colours read from the reference portal. They hold up on a light or a dark
// background, which the shadcn tokens alone cannot promise for a status.
const STATUS_TONE: Record<Status, { dot: string; pill: string }> = {
  open: { dot: "#9a9a9a", pill: "bg-muted text-muted-foreground" },
  under_review: { dot: "#85b5b5", pill: "bg-teal-500/15 text-teal-700 dark:text-teal-300" },
  planned: { dot: "#1fa0ff", pill: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  in_progress: { dot: "#c17aff", pill: "bg-violet-500/15 text-violet-700 dark:text-violet-300" },
  shipped: { dot: "#34c759", pill: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  declined: { dot: "#9a9a9a", pill: "bg-muted text-muted-foreground" },
};

const ROADMAP_COLUMNS: { status: Status; blurb: string }[] = [
  { status: "under_review", blurb: "Being looked at" },
  { status: "planned", blurb: "Agreed and queued up" },
  { status: "in_progress", blurb: "Being built right now" },
];

// The filter menu on the feedback list, in the reference portal's order.
const LIST_FILTERS: { value: ListStatus; label: string }[] = [
  { value: "all", label: "All posts" },
  { value: "under_review", label: "Under review" },
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In progress" },
  { value: "complete", label: "Complete" },
  { value: "declined", label: "Not planned" },
];

const CHANGE_TYPES: { value: ChangeType; label: string; pill: string }[] = [
  { value: "new", label: "New", pill: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300" },
  { value: "improved", label: "Improved", pill: "bg-sky-500/15 text-sky-700 dark:text-sky-300" },
  { value: "fixed", label: "Fixed", pill: "bg-amber-500/15 text-amber-700 dark:text-amber-300" },
  { value: "removed", label: "Removed", pill: "bg-red-500/15 text-red-700 dark:text-red-300" },
];

const PAGE = 20;

// ---------- small helpers ----------

function shortDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
}

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/** "September 3, 2026", the heading each changelog entry carries. */
function longDate(date: string) {
  const [y, m, d] = date.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return date;
  return `${MONTHS[m - 1]} ${d}, ${y}`;
}

type Block = { kind: "p"; text: string } | { kind: "ul"; items: string[] };

/** Entry bodies are plain sentences with the odd "- " bullet list. */
function paragraphs(body: string): Block[] {
  const blocks: Block[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length) {
      blocks.push({ kind: "ul", items: bullets });
      bullets = [];
    }
  };
  for (const raw of (body ?? "").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) {
      flush();
      continue;
    }
    const bullet = line.match(/^[-*]\s+(.*)$/);
    if (bullet) bullets.push(bullet[1].trim());
    else {
      flush();
      blocks.push({ kind: "p", text: line });
    }
  }
  flush();
  return blocks;
}

function initials(name: string | null) {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

function hue(seed: string | null) {
  let h = 0;
  for (const c of seed ?? "anon") h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

function storage(key: string, value?: string | null) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* blocked storage is not an error worth surfacing */
  }
  return null;
}

function voterId(identity?: FeedbackIdentity) {
  if (identity?.id) return identity.id;
  let t = storage("fb_voter");
  if (!t) {
    t = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    storage("fb_voter", t);
  }
  return t;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// The page can be server-rendered (one app runs Next.js), so the first render must not
// read the URL: that is a hydration mismatch. State starts at the defaults and the query
// string is applied in a layout effect, which runs before the browser paints.
const useBrowserLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

type UrlState = { view: View; status: ListStatus; category: Category | "all"; entryId: string | null; entrySlug: string | null };

function readUrl(): UrlState | null {
  if (typeof window === "undefined") return null;
  const sp = new URLSearchParams(window.location.search);
  const n = Number(sp.get("post"));
  const tab = sp.get("tab");
  const view: View =
    Number.isInteger(n) && n > 0
      ? { kind: "post", number: n }
      : tab === "feedback" || tab === "changelog" || tab === "roadmap"
        ? { kind: tab }
        : { kind: "roadmap" };
  const s = sp.get("status");
  const c = sp.get("category");
  return {
    view,
    status: (LIST_FILTERS.find((f) => f.value === s)?.value ?? "all") as ListStatus,
    category: (CATEGORIES.find((x) => x.value === c)?.value ?? "all") as Category | "all",
    entryId: window.location.hash.slice(1) || null,
    entrySlug: sp.get("entry"),
  };
}

const categoryLabel = (c: Category) => CATEGORIES.find((x) => x.value === c)?.label ?? c;

/** localStorage key set once the page has been opened; hosts read it to drop a "New" marker. */
export function feedbackSeenKey(boardKey: string) {
  return `fb_seen_${boardKey.slice(-8)}`;
}

/** True until the person has opened the page once in this browser. */
export function isFeedbackNew(boardKey: string): boolean {
  try {
    return typeof window !== "undefined" && !localStorage.getItem(feedbackSeenKey(boardKey));
  } catch {
    return false;
  }
}

// ---------- API client ----------

class Api {
  constructor(private base: string, private key: string, private voter: string) {}

  get rssUrl() {
    return `${this.base}/changelog.rss?key=${encodeURIComponent(this.key)}`;
  }

  private async call<T>(path: string, init?: RequestInit): Promise<T> {
    const res = await fetch(`${this.base}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "X-Board-Key": this.key,
        "X-Voter": this.voter,
        ...(init?.headers ?? {}),
      },
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string } & T;
    if (!res.ok) throw new Error(data.error || "Something went wrong. Try again.");
    return data;
  }

  board() {
    return this.call<{ board: BoardInfo } & Summary>("/board");
  }
  list(p: { sort: Sort; status: ListStatus; category: Category | "all"; q: string; offset: number }) {
    const sp = new URLSearchParams();
    if (p.sort !== "trending") sp.set("sort", p.sort);
    if (p.status !== "all") sp.set("status", p.status);
    if (p.category !== "all") sp.set("category", p.category);
    if (p.q.trim()) sp.set("q", p.q.trim());
    sp.set("limit", String(PAGE));
    if (p.offset) sp.set("offset", String(p.offset));
    return this.call<{ board: { name: string; notifies: boolean }; posts: Post[]; hasMore: boolean; total: number }>(`/posts?${sp}`);
  }
  detail(n: number) {
    return this.call<{
      post?: Post; comments?: Comment[]; events?: StatusEvent[]; duplicates?: Duplicate[];
      voters?: { votes: number; names: string[]; total: number }; redirect?: number;
    }>(`/posts/${n}`);
  }
  create(b: { title: string; body: string; category: Category; name: string; email: string; website: string }) {
    return this.call<{ number: number }>("/posts", { method: "POST", body: JSON.stringify(b) });
  }
  vote(n: number) {
    return this.call<{ voted: boolean; count: number }>(`/posts/${n}/vote`, { method: "POST" });
  }
  comment(n: number, b: { body: string; name: string; email: string; website: string }) {
    return this.call<{ comment: Comment }>(`/posts/${n}/comments`, { method: "POST", body: JSON.stringify(b) });
  }
  similar(title: string) {
    return this.call<{ posts: Post[] }>(`/similar?title=${encodeURIComponent(title)}`);
  }
  roadmap() {
    return this.call<{ posts: Post[] }>("/roadmap");
  }
  changelog(p: { type: ChangeType | "all"; q: string }) {
    const sp = new URLSearchParams();
    if (p.type !== "all") sp.set("type", p.type);
    if (p.q.trim()) sp.set("q", p.q.trim());
    const qs = sp.toString();
    return this.call<{ items: ChangelogItem[] }>(`/changelog${qs ? `?${qs}` : ""}`);
  }
  like(id: string) {
    return this.call<{ liked: boolean; count: number }>(`/changelog/${id}/like`, { method: "POST" });
  }
  subscribe(email: string, website: string) {
    return this.call<{ ok: boolean }>("/changelog/subscribe", { method: "POST", body: JSON.stringify({ email, website }) });
  }
  support(b: { message: string; name: string; email: string; page: string; website: string }) {
    return this.call<{ ok: boolean; emailed: boolean }>("/support", { method: "POST", body: JSON.stringify(b) });
  }
}

// ---------- primitives ----------

const btn = {
  primary:
    "inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50",
  outline:
    "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-background px-3.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
  ghost:
    "inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50",
};

const input =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

function Icon({ path, className = "h-4 w-4", filled = false }: { path: string; className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  map: "M9 4L3 7v13l6-3 6 3 6-3V4l-6 3-6-3z",
  bulb: "M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z",
  refresh: "M21 12a9 9 0 11-3-6.7M21 3v6h-6",
  search: "M11 4a7 7 0 100 14 7 7 0 000-14zM20 20l-3.5-3.5",
  filter: "M3 5h18l-7 8v6l-4 2v-8L3 5z",
  chevronUp: "M6 15l6-6 6 6",
  chevronDown: "M6 9l6 6 6-6",
  chevronLeft: "M15 18l-6-6 6-6",
  arrowRight: "M5 12h14M13 6l6 6-6 6",
  comment: "M21 15a2 2 0 01-2 2H8l-4 4V5a2 2 0 012-2h13a2 2 0 012 2z",
  heart: "M20.8 5.6a5 5 0 00-7.1 0L12 7.3l-1.7-1.7a5 5 0 00-7.1 7.1l8.8 8.8 8.8-8.8a5 5 0 000-7.1z",
  link: "M10 13a5 5 0 007.5.5l3-3a5 5 0 00-7-7l-1.7 1.7M14 11a5 5 0 00-7.5-.5l-3 3a5 5 0 007 7l1.7-1.7",
  close: "M18 6L6 18M6 6l12 12",
  check: "M20 6L9 17l-5-5",
  plus: "M12 5v14M5 12h14",
  mail: "M4 4h16v16H4zM4 6l8 6 8-6",
  arrowLeft: "M19 12H5M11 18l-6-6 6-6",
  facebook: "M14 8h2V5h-2.5C11 5 10 6.6 10 8.8V11H8v3h2v7h3v-7h2.4l.6-3H13V9c0-.6.4-1 1-1z",
  x: "M4 4l16 16M20 4L4 20",
};

function StatusPill({ status, size = "sm" }: { status: Status; size?: "sm" | "md" }) {
  if (status === "open") return null;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded font-medium ${STATUS_TONE[status].pill} ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

function TypePill({ type }: { type: ChangeType }) {
  const t = CHANGE_TYPES.find((x) => x.value === type) ?? CHANGE_TYPES[0];
  return <span className={`inline-flex shrink-0 items-center rounded px-2 py-0.5 text-[11px] font-medium ${t.pill}`}>{t.label}</span>;
}

function MakerBadge() {
  return <span className="rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">Maker</span>;
}

function Avatar({ name, size = 20 }: { name: string | null; size?: number }) {
  const h = hue(name);
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold"
      style={{ width: size, height: size, fontSize: size * 0.42, background: `hsl(${h} 45% 88%)`, color: `hsl(${h} 45% 30%)` }}
    >
      {initials(name)}
    </span>
  );
}

function Empty({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="px-6 py-12 text-center">
      <p className="text-[14px] font-medium">{title}</p>
      {body ? <p className="mx-auto mt-1.5 max-w-sm text-[13px] text-muted-foreground">{body}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

function Skeleton({ rows = 4 }: { rows?: number }) {
  return (
    <ul className="divide-y divide-border" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex gap-4 p-4">
          <div className="h-11 w-10 shrink-0 animate-pulse rounded-md bg-muted" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ErrorNote({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
      <span>{message}</span>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="ml-auto text-sm font-medium underline underline-offset-2">
          Try again
        </button>
      ) : null}
    </div>
  );
}

/** A menu anchored under its trigger. Closes on Escape, on a click outside, and on pick. */
function Menu({
  label,
  children,
  align = "right",
  trigger,
}: {
  label: string;
  children: (close: () => void) => React.ReactNode;
  align?: "left" | "right";
  trigger: (open: boolean) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={box}>
      <button type="button" aria-haspopup="menu" aria-expanded={open} aria-label={label} onClick={() => setOpen((o) => !o)}>
        {trigger(open)}
      </button>
      {open ? (
        <div
          role="menu"
          className={`absolute z-30 mt-1.5 min-w-[13rem] overflow-hidden rounded-lg border border-border bg-background py-1 shadow-lg ${
            align === "right" ? "right-0" : "left-0"
          }`}
        >
          {children(close)}
        </div>
      ) : null}
    </div>
  );
}

function MenuHeading({ children }: { children: React.ReactNode }) {
  return <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{children}</p>;
}

function MenuItem({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[13px] transition-colors hover:bg-accent hover:text-accent-foreground ${
        active ? "font-medium text-foreground" : "text-muted-foreground"
      }`}
    >
      {children}
      {active ? <Icon path={ICONS.check} className="h-3.5 w-3.5 text-primary" /> : null}
    </button>
  );
}

// ---------- vote pill ----------

function VotePill({
  api,
  post,
  size = "md",
  onChange,
}: {
  api: Api;
  post: Post;
  size?: "md" | "lg";
  onChange?: (next: { voted: boolean; count: number }) => void;
}) {
  const [state, setState] = useState({ voted: post.voted, count: post.vote_count });
  const [error, setError] = useState<string | null>(null);
  const [pop, setPop] = useState(false);
  // Fast clicks fire overlapping requests whose replies can land out of order; only the
  // newest click is allowed to write the server's answer into state.
  const seq = useRef(0);

  const [seen, setSeen] = useState({ voted: post.voted, count: post.vote_count });
  if (seen.voted !== post.voted || seen.count !== post.vote_count) {
    setSeen({ voted: post.voted, count: post.vote_count });
    setState({ voted: post.voted, count: post.vote_count });
  }

  async function click(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const previous = state;
    const next = { voted: !state.voted, count: state.count + (state.voted ? -1 : 1) };
    const ticket = ++seq.current;
    setState(next);
    setError(null);
    if (next.voted) {
      setPop(true);
      window.setTimeout(() => setPop(false), 260);
    }
    try {
      const res = await api.vote(post.number);
      if (ticket !== seq.current) return;
      setState(res);
      onChange?.(res);
    } catch (err) {
      if (ticket !== seq.current) return;
      setState(previous);
      setError(err instanceof Error ? err.message : "Could not vote.");
    }
  }

  const lg = size === "lg";
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={click}
        aria-pressed={state.voted}
        aria-label={`${state.voted ? "Remove your vote from" : "Vote for"} this post. ${state.count} ${state.count === 1 ? "vote" : "votes"} so far.`}
        title={state.voted ? "Remove your vote" : "Vote for this"}
        className={`flex flex-col items-center justify-center gap-0.5 rounded-md border transition-all active:scale-[0.96] ${
          lg ? "w-14 py-2" : "w-9 py-1"
        } ${
          state.voted
            ? "border-primary bg-primary/10 text-foreground"
            : "border-border bg-background text-muted-foreground hover:border-primary hover:text-foreground"
        }`}
      >
        <Icon path={ICONS.chevronUp} className={lg ? "h-4 w-4" : "h-3 w-3"} />
        <span
          className={`font-bold tabular-nums text-foreground ${lg ? "text-base" : "text-[13px]"}`}
          style={pop ? { transform: "scale(1.18)", transition: "transform 120ms" } : { transform: "scale(1)", transition: "transform 140ms" }}
        >
          {state.count}
        </span>
      </button>
      {error ? (
        <p className="absolute left-1/2 top-full z-10 mt-1 w-40 -translate-x-1/2 rounded-md bg-destructive/15 px-2 py-1 text-center text-[11px] text-destructive">{error}</p>
      ) : null}
    </div>
  );
}

// ---------- top bar ----------

function TopBar({
  appName,
  tab,
  identity,
  homeUrl,
  onTab,
  onSearch,
  onContact,
}: {
  appName: string;
  tab: Tab;
  identity?: FeedbackIdentity;
  homeUrl?: string;
  onTab: (t: Tab) => void;
  onSearch: () => void;
  onContact: () => void;
}) {
  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "roadmap", label: "Roadmap", icon: ICONS.map },
    { key: "feedback", label: "Feedback", icon: ICONS.bulb },
    { key: "changelog", label: "Changelog", icon: ICONS.refresh },
  ];
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-[960px] items-center gap-3 px-4 md:h-[59px] md:px-0 py-3 md:py-0">
        {(() => {
          const mark = (
            <>
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-primary text-[13px] font-bold text-primary-foreground">
                {appName.trim()[0]?.toUpperCase() ?? "A"}
              </span>
              <span className="truncate text-[19px] font-semibold tracking-tight">{appName}</span>
            </>
          );
          return homeUrl ? (
            <a href={homeUrl} className="flex min-w-0 items-center gap-2.5" aria-label={`Back to ${appName}`}>
              {mark}
            </a>
          ) : (
            <span className="flex min-w-0 items-center gap-2.5">{mark}</span>
          );
        })()}
        <div className="ml-auto flex items-center gap-2">
          {identity?.name || identity?.email ? (
            <span className="hidden items-center gap-2 text-[13px] text-muted-foreground sm:flex">
              <Avatar name={identity.name ?? identity.email ?? null} size={22} />
              <span className="max-w-[10rem] truncate">{identity.name || identity.email}</span>
            </span>
          ) : null}
          <button type="button" onClick={onContact} className={`${btn.outline} h-8 px-3`}>
            Contact us
          </button>
        </div>
      </div>
      <div className="mx-auto flex w-full max-w-[960px] items-center gap-1 px-2 sm:gap-5 sm:px-4 md:h-[42px] md:px-0">
        <nav aria-label="Sections" className="flex min-w-0 flex-1 items-center gap-1 sm:gap-5">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              aria-current={tab === t.key ? "page" : undefined}
              onClick={() => onTab(t.key)}
              className={`relative -mb-px flex h-full items-center gap-1.5 whitespace-nowrap px-2 py-2.5 text-[13px] font-medium transition-colors md:py-0 sm:text-[14px] ${
                tab === t.key ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon path={t.icon} className="h-4 w-4" />
              {t.label}
              {tab === t.key ? <span className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-primary" /> : null}
            </button>
          ))}
        </nav>
        <button
          type="button"
          onClick={onSearch}
          className="flex h-full shrink-0 items-center gap-1.5 px-2 py-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground md:py-0 sm:text-[14px]"
        >
          <Icon path={ICONS.search} className="h-4 w-4" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </div>
    </header>
  );
}

// ---------- roadmap tab ----------

function RoadmapTab({
  api,
  summary,
  onOpen,
  onCategory,
}: {
  api: Api;
  summary: Summary | null;
  onOpen: (n: number) => void;
  onCategory: (c: Category) => void;
}) {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [hidden, setHidden] = useState<Set<Category>>(new Set());

  useEffect(() => {
    let cancelled = false;
    api
      .roadmap()
      .then((r) => {
        if (!cancelled) setPosts(r.posts);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load the roadmap.");
      });
    return () => {
      cancelled = true;
    };
  }, [api, attempt]);

  const retry = useCallback(() => {
    setError(null);
    setAttempt((a) => a + 1);
  }, []);

  const toggle = (c: Category) =>
    setHidden((h) => {
      const next = new Set(h);
      if (next.has(c)) next.delete(c);
      else next.add(c);
      return next;
    });

  const shown = (posts ?? []).filter((p) => !hidden.has(p.category));
  const withPosts = CATEGORIES.filter((c) => (summary?.counts[c.value] ?? 0) > 0);
  // A full board wants columns that hold the fold, the way the reference has them. A
  // board with two cards in it does not: three tall empty boxes read as broken, where
  // three short ones read as early.
  const fullest = Math.max(0, ...ROADMAP_COLUMNS.map((c) => shown.filter((p) => p.status === c.status).length));
  const columnHeight = fullest >= 3 ? "min-h-[280px] md:min-h-[468px]" : "min-h-[180px]";

  return (
    <>
      {/* Only what people have actually asked for. A row of cards reading zero is the
          worst use of the top of the page, and the reference shows one card because it
          has one board, not because the row should stretch. */}
      {withPosts.length > 0 ? (
        <>
          <h1 className="text-[16px] font-bold">Boards</h1>
          <div className="mt-3 flex flex-wrap gap-4">
            {withPosts.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => onCategory(c.value)}
                className="flex h-12 w-full items-center justify-between gap-6 rounded-[10px] border border-border bg-background px-4 text-left text-[14px] transition-colors hover:border-primary sm:w-[307px]"
              >
                <span className="truncate text-[14px] font-medium">{c.plural}</span>
                <span className="shrink-0 text-[13px] tabular-nums text-muted-foreground">{summary?.counts[c.value] ?? 0}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}

      <div className={`${withPosts.length > 0 ? "mt-7" : ""} flex items-center justify-between gap-3`}>
        <h2 className="text-[16px] font-semibold">Roadmap</h2>
        <Menu
          label="Filter the roadmap"
          trigger={() => (
            <span className="inline-flex h-8 items-center justify-center gap-2 rounded-md border border-border bg-background px-3 text-[14px] font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
              <Icon path={ICONS.filter} className="h-4 w-4" />
              Filters
            </span>
          )}
        >
          {() => (
            <div className="w-60">
              <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
                <span className="text-[13px] font-semibold">Filters</span>
                <button type="button" onClick={() => setHidden(new Set())} className="text-[13px] font-medium text-primary hover:underline">
                  Select all
                </button>
              </div>
              {CATEGORIES.map((c) => (
                <label key={c.value} className="flex cursor-pointer items-center gap-2.5 px-3 py-2 text-[13px] hover:bg-accent hover:text-accent-foreground">
                  <input type="checkbox" checked={!hidden.has(c.value)} onChange={() => toggle(c.value)} className="h-4 w-4" />
                  {c.plural}
                </label>
              ))}
            </div>
          )}
        </Menu>
      </div>

      {error ? (
        <div className="mt-4">
          <ErrorNote message={error} onRetry={retry} />
        </div>
      ) : !posts ? (
        <div className="mt-4 grid gap-5 md:grid-cols-3">
          {ROADMAP_COLUMNS.map((c) => (
            <div key={c.status} className="rounded-[10px] border border-border">
              <Skeleton rows={2} />
            </div>
          ))}
        </div>
      ) : shown.length === 0 ? (
        <div className="mt-4 rounded-[10px] border border-border">
          <Empty
            title="Nothing is on the roadmap yet"
            body={`Once a request gets picked up it shows here, on its way from under review to being built. Ask for something and it starts in the Feedback tab.`}
            action={
              <button type="button" className={btn.primary} onClick={() => onCategory("feature")}>
                Ask for something
              </button>
            }
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-5 md:grid-cols-3">
          {ROADMAP_COLUMNS.map((col) => {
            const items = shown.filter((p) => p.status === col.status);
            return (
              <section
                key={col.status}
                aria-label={STATUS_LABEL[col.status]}
                className={`flex flex-col overflow-hidden rounded-[10px] border border-border ${columnHeight}`}
              >
                <header className="flex h-[45px] shrink-0 items-center gap-2 border-b border-border bg-muted/40 px-4">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: STATUS_TONE[col.status].dot }} />
                  <h3 className="text-[14px] font-semibold">{STATUS_LABEL[col.status]}</h3>
                  <span className="sr-only">{col.blurb}</span>
                </header>
                {items.length === 0 ? (
                  <p className="flex flex-1 items-center justify-center px-4 py-10 text-center text-[13px] text-muted-foreground">
                    Nothing here yet
                  </p>
                ) : (
                  <ul className="flex-1 space-y-4 overflow-y-auto p-4">
                    {items.map((p) => (
                      <li key={p.id} className="relative flex items-start gap-4">
                        <div className="relative z-10">
                          <VotePill api={api} post={p} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-[16px] leading-snug">
                            <button type="button" onClick={() => onOpen(p.number)} className="text-left after:absolute after:inset-0 hover:underline">
                              {p.title}
                            </button>
                          </h4>
                          <p className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{categoryLabel(p.category)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

// ---------- feedback tab ----------

type Draft = { title: string; body: string; category: Category; name: string; email: string };
const EMPTY_DRAFT: Draft = { title: "", body: "", category: "feature", name: "", email: "" };

function restoreDraft(draftKey: string, identity?: FeedbackIdentity): Draft {
  let base: Partial<Draft> = {};
  let restored: Partial<Draft> = {};
  try {
    base = JSON.parse(storage("fb_identity") ?? "{}");
  } catch {
    /* ignore */
  }
  try {
    restored = JSON.parse(storage(draftKey) ?? "{}");
  } catch {
    /* ignore */
  }
  return {
    ...EMPTY_DRAFT,
    ...base,
    ...restored,
    name: identity?.name ?? restored.name ?? base.name ?? "",
    email: identity?.email ?? restored.email ?? base.email ?? "",
  };
}

/** The create card at the top of the feedback list. Opens on focus, the way the
 *  reference portal does, so posting is one click from reading. */
function CreateCard({
  api,
  boardKey,
  appName,
  identity,
  notifies,
  category,
  onCreated,
  onOpenPost,
}: {
  api: Api;
  boardKey: string;
  appName: string;
  identity?: FeedbackIdentity;
  notifies: boolean;
  category: Category | "all";
  onCreated: (n: number) => void;
  onOpenPost: (n: number) => void;
}) {
  const draftKey = `fb_draft_${boardKey.slice(-8)}`;
  const [draft, setDraft] = useState<Draft>(() => restoreDraft(draftKey, identity));
  const [open, setOpen] = useState(false);
  const [similar, setSimilar] = useState<Post[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);
  const hasIdentity = !!identity?.id;

  // A typed draft survives a closed tab; nobody loses an idea to a stray click.
  useEffect(() => {
    if (draft.title || draft.body) storage(draftKey, JSON.stringify(draft));
  }, [draft, draftKey]);

  // Picking a category in the rail should pre-set the kind of post being written. React
  // calls this adjusting state while rendering; an effect here would cascade a render.
  const [seenCategory, setSeenCategory] = useState(category);
  if (seenCategory !== category) {
    setSeenCategory(category);
    if (category !== "all") setDraft((d) => ({ ...d, category }));
  }

  // Show what people already asked for while the title is still being typed. Voting on
  // an existing post beats filing the same idea twice.
  useEffect(() => {
    const title = draft.title.trim();
    const t = window.setTimeout(() => {
      if (title.length < 5) {
        setSimilar([]);
        return;
      }
      api.similar(title).then((r) => setSimilar(r.posts)).catch(() => setSimilar([]));
    }, 350);
    return () => window.clearTimeout(t);
  }, [draft.title, api]);

  function reset() {
    setDraft({ ...EMPTY_DRAFT, name: draft.name, email: draft.email, category: category === "all" ? "feature" : category });
    setSimilar([]);
    setOpen(false);
    setError(null);
    storage(draftKey, null);
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (draft.email && !EMAIL_RE.test(draft.email)) {
      setError("That email address does not look right.");
      return;
    }
    setBusy(true);
    setError(null);
    const website = String(new FormData(e.currentTarget).get("website") ?? "");
    try {
      const res = await api.create({ ...draft, website });
      storage(draftKey, null);
      storage("fb_identity", JSON.stringify({ name: draft.name, email: draft.email }));
      setDone(res.number);
      setDraft({ ...EMPTY_DRAFT, name: draft.name, email: draft.email });
      setSimilar([]);
      setOpen(false);
      onCreated(res.number);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that.");
    } finally {
      setBusy(false);
    }
  }

  if (done !== null) {
    return (
      <div className="rounded-[10px] border border-emerald-500/40 bg-emerald-500/5 p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
            <Icon path={ICONS.check} className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[14px] font-semibold">That is on the board</p>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Everyone using {appName} can see it and vote on it now. It carries your vote already.
              {draft.email && notifies ? " You will get an email when its status changes." : ""}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className={btn.primary} onClick={() => onOpenPost(done)}>
                See your post
              </button>
              <button type="button" className={btn.ghost} onClick={() => setDone(null)}>
                Post something else
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="overflow-hidden rounded-[10px] border border-border">
      <div className="space-y-3 p-4">
        <label htmlFor="fb-title" className="sr-only">
          Say it in one line
        </label>
        <input
          id="fb-title"
          value={draft.title}
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            setDraft({ ...draft, title: e.target.value });
            setOpen(true);
          }}
          maxLength={160}
          placeholder="Short, descriptive title"
          className="w-full bg-transparent text-[16px] placeholder:text-muted-foreground focus-visible:outline-none"
        />

        {open ? (
          <>
            {similar.length > 0 ? (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
                <p className="text-[12px] font-medium text-amber-800 dark:text-amber-200">Someone may have asked for this already</p>
                <p className="mt-0.5 text-[11px] text-amber-800/70 dark:text-amber-200/70">Voting on one of these counts for more than a second post.</p>
                <ul className="mt-2.5 space-y-1.5">
                  {similar.map((p) => (
                    <li key={p.id} className="flex items-center gap-2.5 rounded-md bg-background p-2">
                      <VotePill api={api} post={p} />
                      <button type="button" onClick={() => onOpenPost(p.number)} className="min-w-0 flex-1 truncate text-left text-[13px] hover:underline">
                        {p.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div>
              <p className="text-[14px] font-semibold">Details</p>
              <label htmlFor="fb-body" className="sr-only">
                Any additional details
              </label>
              <textarea
                id="fb-body"
                value={draft.body}
                onChange={(e) => setDraft({ ...draft, body: e.target.value })}
                rows={3}
                maxLength={4000}
                placeholder="Any additional details..."
                className="mt-1 w-full resize-y bg-transparent text-[14px] placeholder:text-muted-foreground focus-visible:outline-none"
              />
            </div>

            <fieldset>
              <legend className="sr-only">What kind of feedback is this?</legend>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((c) => (
                  <label
                    key={c.value}
                    title={c.hint}
                    className={`cursor-pointer rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors ${
                      draft.category === c.value ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={c.value}
                      checked={draft.category === c.value}
                      onChange={() => setDraft({ ...draft, category: c.value })}
                      className="sr-only"
                    />
                    {c.label}
                  </label>
                ))}
              </div>
            </fieldset>

            {hasIdentity ? (
              <p className="text-[12px] text-muted-foreground">
                Posting as <span className="font-medium text-foreground">{draft.name || draft.email || "you"}</span>. Your email is never shown
                {notifies ? ", and you will get one email when the status changes." : "."}
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  maxLength={60}
                  placeholder="Your name (optional)"
                  aria-label="Your name"
                  className={`${input} h-9`}
                />
                <input
                  type="email"
                  value={draft.email}
                  onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                  maxLength={120}
                  placeholder={notifies ? "Email, to hear when it ships" : "Email (optional)"}
                  aria-label="Your email"
                  className={`${input} h-9`}
                />
              </div>
            )}

            <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0" />
            {error ? <ErrorNote message={error} /> : null}
          </>
        ) : null}
      </div>

      {open ? (
        <footer className="flex items-center justify-end gap-2 border-t border-border bg-muted/40 px-4 py-3">
          <button type="button" onClick={reset} className={btn.ghost}>
            Cancel
          </button>
          <button type="submit" disabled={busy || draft.title.trim().length < 4} className={btn.primary}>
            {busy ? "Posting..." : "Create post"}
          </button>
        </footer>
      ) : null}
    </form>
  );
}

function FeedbackTab({
  api,
  boardKey,
  appName,
  board,
  summary,
  identity,
  sort,
  status,
  category,
  q,
  searchRef,
  onSort,
  onStatus,
  onCategory,
  onQ,
  onOpen,
  reloadKey,
  onReload,
}: {
  api: Api;
  boardKey: string;
  appName: string;
  board: BoardInfo | null;
  summary: Summary | null;
  identity?: FeedbackIdentity;
  sort: Sort;
  status: ListStatus;
  category: Category | "all";
  q: string;
  searchRef: React.RefObject<HTMLInputElement | null>;
  onSort: (s: Sort) => void;
  onStatus: (s: ListStatus) => void;
  onCategory: (c: Category | "all") => void;
  onQ: (q: string) => void;
  onOpen: (n: number) => void;
  reloadKey: number;
  onReload: () => void;
}) {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Any change to the query starts the list again from the top. Adjusting both pieces of
  // state here, while rendering, keeps the fetch effect below down to one run per query.
  const queryKey = `${sort}|${status}|${category}|${q}|${reloadKey}`;
  const [seenQuery, setSeenQuery] = useState(queryKey);
  if (seenQuery !== queryKey) {
    setSeenQuery(queryKey);
    setOffset(0);
    setPosts(null);
  }

  useEffect(() => {
    let cancelled = false;
    const first = offset === 0;
    const t = window.setTimeout(() => {
      api
        .list({ sort, status, category, q, offset })
        .then((r) => {
          if (cancelled) return;
          setPosts((prev) => (first ? r.posts : [...(prev ?? []), ...r.posts]));
          setHasMore(r.hasMore);
          setTotal(r.total);
          setError(null);
        })
        .catch((e) => {
          if (!cancelled) setError(e instanceof Error ? e.message : "Could not load the feedback.");
        })
        .finally(() => {
          if (!cancelled) setLoadingMore(false);
        });
    }, q && offset === 0 ? 300 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [api, sort, status, category, q, offset, reloadKey]);

  const sortLabel = sort === "trending" ? "Trending" : sort === "top" ? "Top" : "New";
  const statusLabel = LIST_FILTERS.find((f) => f.value === status)?.label ?? "All posts";
  const filtered = status !== "all" || category !== "all" || q.trim() !== "";

  return (
    <div className="md:grid md:grid-cols-[292px_1fr] md:gap-8">
      <aside className="mb-6 md:mb-0">
        <h2 className="px-3 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Boards</h2>
        <ul className="mt-2 space-y-0.5">
          <li>
            <button
              type="button"
              onClick={() => onCategory("all")}
              className={`flex h-9 w-full items-center justify-between gap-2 rounded-md px-3 text-left text-[13px] transition-colors ${
                category === "all" ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              All posts
              <span className="tabular-nums text-[12px] text-muted-foreground">{summary?.total ?? 0}</span>
            </button>
          </li>
          {CATEGORIES.map((c) => (
            <li key={c.value}>
              <button
                type="button"
                onClick={() => onCategory(c.value)}
                className={`flex h-9 w-full items-center justify-between gap-2 rounded-md px-3 text-left text-[13px] transition-colors ${
                  category === c.value ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <span className="truncate">{c.plural}</span>
                <span className="tabular-nums text-[12px] text-muted-foreground">{summary?.counts[c.value] ?? 0}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <div className="min-w-0">
        <h1 className="text-[16px] font-semibold">{category === "all" ? "Feedback" : CATEGORIES.find((c) => c.value === category)?.plural}</h1>
        <p className="mt-1 text-[14px] text-muted-foreground">
          {board?.tagline ?? `Ask for what you need in ${appName}, see what everyone else has asked for, and vote so the most wanted work goes first.`}
        </p>

        <div className="mt-4">
          <CreateCard
            api={api}
            boardKey={boardKey}
            appName={appName}
            identity={identity}
            notifies={!!board?.notifies}
            category={category}
            onCreated={onReload}
            onOpenPost={onOpen}
          />
        </div>

        <div className="mt-4 overflow-hidden rounded-[10px] border border-border">
          <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
            <div className="flex items-center gap-1.5 text-[14px] text-muted-foreground">
              <span>Showing</span>
              <Menu
                label="Sort and filter posts"
                align="left"
                trigger={(open) => (
                  <span className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-[14px] font-medium text-foreground hover:bg-accent">
                    {sortLabel}
                    {status === "all" ? "" : ` . ${statusLabel}`}
                    <Icon path={open ? ICONS.chevronUp : ICONS.chevronDown} className="h-3.5 w-3.5" />
                  </span>
                )}
              >
                {(close) => (
                  <div className="w-56">
                    <MenuHeading>Sort</MenuHeading>
                    {(["trending", "top", "new"] as Sort[]).map((s) => (
                      <MenuItem
                        key={s}
                        active={sort === s}
                        onClick={() => {
                          onSort(s);
                          close();
                        }}
                      >
                        {s === "trending" ? "Trending" : s === "top" ? "Top" : "New"}
                      </MenuItem>
                    ))}
                    <MenuHeading>Filter</MenuHeading>
                    {LIST_FILTERS.map((f) => (
                      <MenuItem
                        key={f.value}
                        active={status === f.value}
                        onClick={() => {
                          onStatus(f.value);
                          close();
                        }}
                      >
                        {f.label}
                      </MenuItem>
                    ))}
                  </div>
                )}
              </Menu>
              <span>posts</span>
            </div>
            <div className="relative ml-auto w-full sm:w-56">
              <Icon path={ICONS.search} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchRef}
                type="search"
                value={q}
                onChange={(e) => onQ(e.target.value)}
                placeholder="Search..."
                aria-label="Search posts"
                className={`${input} h-9 pl-9`}
              />
            </div>
          </div>

          {error ? (
            <div className="p-4">
              <ErrorNote message={error} onRetry={onReload} />
            </div>
          ) : !posts ? (
            <Skeleton />
          ) : posts.length === 0 ? (
            filtered ? (
              <Empty
                title="Nothing matches that"
                body="Try another filter or a different search term."
                action={
                  <button
                    type="button"
                    className={btn.outline}
                    onClick={() => {
                      onStatus("all");
                      onCategory("all");
                      onQ("");
                    }}
                  >
                    Clear the filters
                  </button>
                }
              />
            ) : (
              <Empty title="Nothing here yet" body={`Be the first to say what ${appName} should do next. It takes about twenty seconds.`} />
            )
          ) : (
            <>
              <ul className="divide-y divide-border">
                {posts.map((p) => (
                  <li key={p.id} className="relative flex items-start gap-4 px-4 py-4 transition-colors hover:bg-muted/30">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[14px] font-semibold leading-snug">
                        <button type="button" onClick={() => onOpen(p.number)} className="text-left after:absolute after:inset-0 hover:underline">
                          {p.pinned ? (
                            <span aria-label="Pinned" title="Pinned" className="mr-1.5 align-middle text-primary">
                              &#9679;
                            </span>
                          ) : null}
                          {p.title}
                        </button>
                      </h3>
                      {p.body ? <p className="mt-1 line-clamp-2 text-[14px] leading-relaxed text-muted-foreground">{p.body}</p> : null}
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Icon path={ICONS.comment} className="h-3.5 w-3.5" />
                          {p.comment_count}
                        </span>
                        {p.status !== "open" ? (
                          <>
                            <span aria-hidden>&middot;</span>
                            <StatusPill status={p.status} />
                          </>
                        ) : null}
                        {p.is_official ? (
                          <>
                            <span aria-hidden>&middot;</span>
                            <MakerBadge />
                          </>
                        ) : null}
                      </div>
                    </div>
                    <div className="relative z-10">
                      <VotePill api={api} post={p} />
                    </div>
                  </li>
                ))}
              </ul>
              <div className="flex items-center justify-between gap-3 px-4 py-3 text-[13px] text-muted-foreground">
                <span className="tabular-nums">
                  {posts.length} of {total} {total === 1 ? "post" : "posts"}
                </span>
                {hasMore ? (
                  <button
                    type="button"
                    disabled={loadingMore}
                    onClick={() => {
                      // Flip the label on the click, not when the request returns, so the
                      // press is acknowledged straight away.
                      setLoadingMore(true);
                      setOffset(posts.length);
                    }}
                    className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline disabled:opacity-60"
                  >
                    {loadingMore ? "Loading..." : "Load more"}
                    <Icon path={ICONS.arrowRight} className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- post view ----------

function PostView({
  api,
  appName,
  number,
  identity,
  onBack,
  onRedirect,
}: {
  api: Api;
  appName: string;
  number: number;
  identity?: FeedbackIdentity;
  onBack: () => void;
  onRedirect: (n: number) => void;
}) {
  const draftKey = `fb_comment_${number}`;
  const remembered = useMemo(() => {
    if (identity?.id) return { name: identity.name ?? "", email: identity.email ?? "" };
    try {
      const id = JSON.parse(storage("fb_identity") ?? "{}");
      return { name: String(id.name ?? ""), email: String(id.email ?? "") };
    } catch {
      return { name: "", email: "" };
    }
  }, [identity?.id, identity?.name, identity?.email]);

  const [data, setData] = useState<{
    post: Post; comments: Comment[]; events: StatusEvent[]; duplicates: Duplicate[]; voters: { votes: number; names: string[]; total: number };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState(() => storage(draftKey) ?? "");
  const [name, setName] = useState(remembered.name);
  const [email, setEmail] = useState(remembered.email);
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [newestFirst, setNewestFirst] = useState(true);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .detail(number)
      .then((r) => {
        if (cancelled) return;
        if (r.redirect) {
          onRedirect(r.redirect);
          return;
        }
        if (!r.post) throw new Error("That post is not here any more.");
        setData({
          post: r.post,
          comments: r.comments ?? [],
          events: r.events ?? [],
          duplicates: r.duplicates ?? [],
          voters: r.voters ?? { votes: r.post.vote_count, names: [], total: 0 },
        });
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load that post.");
      });
    window.scrollTo({ top: 0 });
    return () => {
      cancelled = true;
    };
  }, [api, number, onRedirect, attempt]);

  const retry = useCallback(() => {
    setError(null);
    setAttempt((a) => a + 1);
  }, []);

  useEffect(() => {
    storage(draftKey, body || null);
  }, [body, draftKey]);

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (email && !EMAIL_RE.test(email)) {
      setSendError("That email address does not look right.");
      return;
    }
    setBusy(true);
    setSendError(null);
    const website = String(new FormData(e.currentTarget).get("website") ?? "");
    try {
      const r = await api.comment(number, { body, name, email, website });
      setData((d) => (d ? { ...d, comments: [...d.comments, r.comment], post: { ...d.post, comment_count: d.post.comment_count + 1 } } : d));
      setBody("");
      storage(draftKey, null);
      if (!identity?.id) storage("fb_identity", JSON.stringify({ name, email }));
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Could not post that comment.");
    } finally {
      setBusy(false);
    }
  }

  function replyTo(who: string | null) {
    setBody((b) => (b ? b : `${who ? `${who} ` : ""}`));
    commentRef.current?.focus();
  }

  // Comments and status changes read as one story, in the order the reader picked.
  const feed = useMemo(() => {
    if (!data) return [] as { at: string; node: React.ReactNode; key: string }[];
    const rows: { at: string; node: React.ReactNode; key: string }[] = [];
    for (const c of data.comments) {
      rows.push({
        at: c.created_at,
        key: `c-${c.id}`,
        node: (
          <div className="flex gap-3">
            <Avatar name={c.author_name} size={24} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold">
                {c.author_name || "Anonymous"}
                {c.is_official ? <span className="ml-2 align-middle"><MakerBadge /></span> : null}
              </p>
              <p className="mt-1 whitespace-pre-wrap text-[14px] leading-relaxed">{c.body}</p>
              <p className="mt-1.5 flex items-center gap-2 text-[12px] text-muted-foreground">
                <time dateTime={c.created_at}>{shortDate(c.created_at)}</time>
                <span aria-hidden>&middot;</span>
                <button type="button" onClick={() => replyTo(c.author_name)} className="hover:underline">
                  Reply
                </button>
              </p>
            </div>
          </div>
        ),
      });
    }
    for (const ev of data.events) {
      rows.push({
        at: ev.created_at,
        key: `e-${ev.id}`,
        node: (
          <div className="flex items-center gap-3">
            <Avatar name={appName} size={24} />
            <p className="flex flex-wrap items-center gap-2 text-[13px] text-muted-foreground">
              <span className="font-semibold text-foreground">{appName}</span>
              <span>updated the status to</span>
              <StatusPill status={ev.to_status} />
              <span aria-hidden>&middot;</span>
              <time dateTime={ev.created_at}>{shortDate(ev.created_at)}</time>
            </p>
          </div>
        ),
      });
    }
    for (const d of data.duplicates) {
      rows.push({
        at: d.created_at,
        key: `d-${d.id}`,
        node: (
          <div className="flex gap-3">
            <Avatar name={appName} size={24} />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-muted-foreground">
                <span className="font-semibold text-foreground">{appName}</span> merged in a post:
              </p>
              <div className="mt-2 rounded-lg border border-border p-3">
                <p className="text-[14px] font-medium">{d.title}</p>
                {d.body ? <p className="mt-1 line-clamp-3 text-[13px] leading-relaxed text-muted-foreground">{d.body}</p> : null}
                <p className="mt-2 flex items-center gap-2 text-[12px] text-muted-foreground">
                  <Avatar name={d.author_name} size={18} />
                  {d.author_name || "Anonymous"}
                  <span aria-hidden>&middot;</span>
                  <time dateTime={d.created_at}>{shortDate(d.created_at)}</time>
                </p>
              </div>
            </div>
          </div>
        ),
      });
    }
    rows.sort((a, b) => (newestFirst ? +new Date(b.at) - +new Date(a.at) : +new Date(a.at) - +new Date(b.at)));
    return rows;
  }, [data, newestFirst, appName]);

  return (
    <div className="md:grid md:grid-cols-[220px_1fr] md:gap-8">
      <aside className="mb-6 md:mb-0">
        <button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground">
          <Icon path={ICONS.chevronLeft} className="h-3.5 w-3.5" />
          All feedback
        </button>
        {/* Votes are anonymous by design (the token is HMAC'd per board), so this cannot
            be the list of voters the reference portal shows. It gives the tally, and
            separately the people who put their name to something. */}
        {data ? (
          <div className="rounded-[10px] border border-border p-4">
            <p className="text-[20px] font-semibold tabular-nums">{data.voters.votes}</p>
            <p className="text-[13px] text-muted-foreground">{data.voters.votes === 1 ? "vote" : "votes"}</p>
            {data.voters.names.length > 0 ? (
              <>
                <h2 className="mt-4 border-t border-border pt-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Who spoke up
                </h2>
                <ul className="mt-3 space-y-2.5">
                  {data.voters.names.map((n) => (
                    <li key={n} className="flex items-center gap-2.5 text-[13px]">
                      <Avatar name={n} size={22} />
                      <span className="truncate">{n}</span>
                    </li>
                  ))}
                </ul>
                {data.voters.total > data.voters.names.length ? (
                  <p className="mt-3 text-[13px] text-muted-foreground">and {data.voters.total - data.voters.names.length} more...</p>
                ) : null}
              </>
            ) : null}
          </div>
        ) : null}
      </aside>

      <div className="min-w-0">
        {error ? (
          <ErrorNote message={error} onRetry={retry} />
        ) : !data ? (
          <Skeleton rows={1} />
        ) : (
          <>
            <article className="flex gap-4">
              <VotePill api={api} post={data.post} size="lg" />
              <div className="min-w-0 flex-1">
                <h1 className="text-[20px] font-semibold leading-snug tracking-tight">{data.post.title}</h1>
                <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px] font-semibold uppercase tracking-wide" style={{ color: STATUS_TONE[data.post.status].dot }}>
                  {STATUS_LABEL[data.post.status]}
                  <span className="font-normal normal-case tracking-normal text-muted-foreground">
                    {categoryLabel(data.post.category)} . #{data.post.number}
                  </span>
                </p>
                <div className="mt-4 flex items-center gap-2 text-[13px]">
                  <Avatar name={data.post.author_name} size={24} />
                  <span className="font-semibold">{data.post.author_name || "Anonymous"}</span>
                  {data.post.is_official ? <MakerBadge /> : null}
                </div>
                {data.post.body ? <div className="mt-3 whitespace-pre-wrap text-[15px] leading-7">{data.post.body}</div> : null}
                <p className="mt-4 text-[12px] text-muted-foreground">{shortDate(data.post.created_at)}</p>
              </div>
            </article>

            <form onSubmit={send} className="mt-8">
              <label htmlFor="fb-comment" className="sr-only">
                Leave a comment
              </label>
              <textarea
                id="fb-comment"
                ref={commentRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={body ? 4 : 2}
                maxLength={4000}
                placeholder="Leave a comment"
                className={input}
              />
              {body ? (
                <div className="mt-2.5 flex flex-col gap-2 sm:flex-row sm:items-center">
                  {identity?.id ? (
                    <p className="flex-1 text-[12px] text-muted-foreground">
                      Commenting as <span className="font-medium text-foreground">{name || email || "you"}</span>
                    </p>
                  ) : (
                    <>
                      <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Your name (optional)" aria-label="Your name" className={`${input} h-9 flex-1`} />
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} placeholder="Email (optional)" aria-label="Your email" className={`${input} h-9 flex-1`} />
                    </>
                  )}
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0" />
                  <button type="submit" disabled={busy || body.trim().length < 2} className={btn.primary}>
                    {busy ? "Posting..." : "Comment"}
                  </button>
                </div>
              ) : null}
              {sendError ? (
                <div className="mt-2">
                  <ErrorNote message={sendError} />
                </div>
              ) : null}
            </form>

            <section className="mt-8" aria-label="Activity feed">
              <div className="flex items-center justify-between gap-3 border-b border-border pb-2">
                <h2 className="text-[14px] text-muted-foreground">Activity feed</h2>
                <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
                  <span className="hidden sm:inline">Sort by</span>
                  <Menu
                    label="Sort the activity feed"
                    trigger={(open) => (
                      <span className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[13px] font-medium text-foreground">
                        {newestFirst ? "Newest first" : "Oldest first"}
                        <Icon path={open ? ICONS.chevronUp : ICONS.chevronDown} className="h-3.5 w-3.5" />
                      </span>
                    )}
                  >
                    {(close) => (
                      <div className="w-44">
                        <MenuItem
                          active={newestFirst}
                          onClick={() => {
                            setNewestFirst(true);
                            close();
                          }}
                        >
                          Newest first
                        </MenuItem>
                        <MenuItem
                          active={!newestFirst}
                          onClick={() => {
                            setNewestFirst(false);
                            close();
                          }}
                        >
                          Oldest first
                        </MenuItem>
                      </div>
                    )}
                  </Menu>
                </div>
              </div>
              {feed.length === 0 ? (
                <p className="py-8 text-center text-[13px] text-muted-foreground">Nothing has happened here yet. Say something and it will.</p>
              ) : (
                <ul className="mt-4 space-y-6">
                  {feed.map((row) => (
                    <li key={row.key}>{row.node}</li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

// ---------- changelog tab ----------

function ChangelogTab({
  api,
  appName,
  board,
  onOpen,
  entryId,
  openSlug,
  chrome,
  onOpenEntry,
}: {
  api: Api;
  appName: string;
  board: BoardInfo | null;
  onOpen: (n: number) => void;
  entryId: string | null;
  openSlug: string | null;
  chrome: boolean;
  onOpenEntry: (slug: string | null) => void;
}) {
  const [items, setItems] = useState<ChangelogItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [type, setType] = useState<ChangeType | "all">("all");
  const [q, setQ] = useState("");
  const [shown, setShown] = useState(PAGE);
  const [subscribeOpen, setSubscribeOpen] = useState(false);
  const [subEmail, setSubEmail] = useState("");
  const [subDone, setSubDone] = useState(false);
  const [subError, setSubError] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    const t = window.setTimeout(() => {
      api
        .changelog({ type, q })
        .then((r) => {
          if (!cancelled) {
            setItems(r.items);
            setShown(PAGE);
            setError(null);
          }
        })
        .catch((e) => {
          if (!cancelled) setError(e instanceof Error ? e.message : "Could not load the changelog.");
        });
    }, q ? 300 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [api, type, q, attempt]);

  // A link straight to one entry should land on it, not at the top of the list.
  useEffect(() => {
    if (!entryId || !items) return;
    const el = document.getElementById(entryId);
    if (el) el.scrollIntoView({ block: "center" });
  }, [entryId, items]);

  const retry = useCallback(() => {
    setError(null);
    setAttempt((a) => a + 1);
  }, []);

  async function subscribe(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!EMAIL_RE.test(subEmail)) {
      setSubError("That email address does not look right.");
      return;
    }
    const website = String(new FormData(e.currentTarget).get("website") ?? "");
    try {
      await api.subscribe(subEmail, website);
      setSubDone(true);
      setSubError(null);
    } catch (err) {
      setSubError(err instanceof Error ? err.message : "Could not sign you up.");
    }
  }

  async function like(item: ChangelogItem) {
    if (item.source !== "entry") return;
    setItems((list) =>
      (list ?? []).map((i) => (i.id === item.id ? { ...i, liked: !i.liked, likes: i.likes + (i.liked ? -1 : 1) } : i))
    );
    try {
      const r = await api.like(item.id);
      setItems((list) => (list ?? []).map((i) => (i.id === item.id ? { ...i, liked: r.liked, likes: r.count } : i)));
    } catch {
      setItems((list) => (list ?? []).map((i) => (i.id === item.id ? { ...i, liked: item.liked, likes: item.likes } : i)));
    }
  }



  const page = (items ?? []).slice(0, shown);
  const open = openSlug ? (items ?? []).find((i) => i.slug === openSlug) : null;

  // One entry, on its own, at its own address.
  if (openSlug) {
    if (!items) return <Skeleton rows={2} />;
    if (!open) {
      return (
        <Empty
          title="That entry is not here"
          body="It may have been taken down, or the link may be wrong."
          action={
            <button type="button" className={btn.outline} onClick={() => onOpenEntry(null)}>
              Back to changelog
            </button>
          }
        />
      );
    }
    return (
      <ChangelogArticle item={open} appName={appName} chrome={chrome} onBack={() => onOpenEntry(null)} onOpen={onOpen} onLike={like} />
    );
  }

  return (
    <div>
      <h1 className="text-[32px] font-bold tracking-tight">Changelog</h1>
      <p className="mt-1 text-[14px] text-muted-foreground">Follow up on the latest improvements and updates in {appName}.</p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a href={api.rssUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground">
          <Icon path={ICONS.link} className="h-3.5 w-3.5" />
          RSS
        </a>
        {/* Only where the product has a verified sender. Taking an email address and
            never writing is worse than not offering. */}
        {board?.notifies ? (
          <button
            type="button"
            onClick={() => setSubscribeOpen((o) => !o)}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground"
          >
            <Icon path={ICONS.mail} className="h-3.5 w-3.5" />
            Subscribe
          </button>
        ) : null}
        <div className="relative ml-auto w-full sm:w-52">
          <Icon path={ICONS.search} className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search entries..." aria-label="Search the changelog" className={`${input} h-9 pl-9`} />
        </div>
        <Menu
          label="Filter the changelog"
          trigger={() => (
            <span className={btn.outline}>
              <Icon path={ICONS.filter} className="h-4 w-4" />
              Filters
            </span>
          )}
        >
          {(close) => (
            <div className="w-48">
              <MenuItem
                active={type === "all"}
                onClick={() => {
                  setType("all");
                  close();
                }}
              >
                Everything
              </MenuItem>
              {CHANGE_TYPES.map((t) => (
                <MenuItem
                  key={t.value}
                  active={type === t.value}
                  onClick={() => {
                    setType(t.value);
                    close();
                  }}
                >
                  {t.label}
                </MenuItem>
              ))}
            </div>
          )}
        </Menu>
      </div>

      {subscribeOpen ? (
        <form onSubmit={subscribe} className="mt-3 rounded-[10px] border border-border p-4">
          {subDone ? (
            <p className="text-[13px] text-muted-foreground">You will get an email when something ships.</p>
          ) : (
            <>
              <p className="text-[13px] font-medium">Hear about it by email</p>
              <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  value={subEmail}
                  onChange={(e) => setSubEmail(e.target.value)}
                  placeholder="you@work.com"
                  aria-label="Your email"
                  className={`${input} h-9 flex-1`}
                />
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0" />
                <button type="submit" className={btn.primary}>
                  Subscribe
                </button>
              </div>
              {subError ? (
                <div className="mt-2">
                  <ErrorNote message={subError} />
                </div>
              ) : null}
            </>
          )}
        </form>
      ) : null}

      <div className="mt-6">
        {error ? (
          <ErrorNote message={error} onRetry={retry} />
        ) : !items ? (
          <Skeleton rows={3} />
        ) : page.length === 0 ? (
          <Empty
            title={q || type !== "all" ? "Nothing matches that" : "Nothing has shipped here yet"}
            body={q || type !== "all" ? "Try another filter or search term." : `When something changes in ${appName}, it lands here with the date.`}
          />
        ) : (
          <>
            <ul className="divide-y divide-border">
              {page.map((item) => {
                const isCollapsed = collapsed.has(item.id);
                return (
                  <li key={item.id} id={item.id} className="py-6 first:pt-0 sm:grid sm:grid-cols-[180px_1fr] sm:gap-6">
                    <p className="text-[14px] text-muted-foreground">{longDate(item.date)}</p>
                    <div className="mt-2 min-w-0 sm:mt-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <TypePill type={item.type} />
                          <h2 className="mt-2 text-[20px] font-semibold leading-snug">
                            {item.slug ? (
                              <button type="button" onClick={() => onOpenEntry(item.slug)} className="text-left hover:underline">
                                {item.title}
                              </button>
                            ) : (
                              item.title
                            )}
                          </h2>
                        </div>
                        <button
                          type="button"
                          aria-label={isCollapsed ? "Show the detail" : "Hide the detail"}
                          onClick={() =>
                            setCollapsed((c) => {
                              const next = new Set(c);
                              if (next.has(item.id)) next.delete(item.id);
                              else next.add(item.id);
                              return next;
                            })
                          }
                          className="shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                        >
                          <Icon path={isCollapsed ? ICONS.chevronDown : ICONS.chevronUp} className="h-4 w-4" />
                        </button>
                      </div>

                      {!isCollapsed && item.image ? (
                        <button type="button" onClick={() => onOpenEntry(item.slug)} className="mt-2 block w-full" aria-label={`Open ${item.title}`}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.image.url} alt={item.image.alt} loading="lazy" className="w-full object-cover" />
                        </button>
                      ) : null}

                      {!isCollapsed && (item.body || item.docs || item.postNumber) ? (
                        <div className="mt-4">
                          <EntryBody item={item} onOpen={onOpen} />
                        </div>
                      ) : null}

                      <div className="mt-6">
                        <EntryFooter item={item} onLike={like} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            {items.length > shown ? (
              <div className="pt-4 text-center">
                <button type="button" onClick={() => setShown((s) => s + PAGE)} className={btn.outline}>
                  Load more
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}

/** What the entry says, laid out the way the reference lays it out: the write-up, then
 *  "Learn more" to the product's own help article, then the request that asked for it. */
function EntryBody({ item, onOpen }: { item: ChangelogItem; onOpen: (n: number) => void }) {
  return (
    <div className="space-y-[15px] text-[14px] leading-[1.6]">
      {paragraphs(item.body).map((b, i) =>
        b.kind === "p" ? (
          <p key={i}>{b.text}</p>
        ) : (
          <ul key={i} className="list-disc space-y-1 pl-5">
            {b.items.map((li, j) => (
              <li key={j}>{li}</li>
            ))}
          </ul>
        )
      )}
      {item.docs ? (
        <p>
          <a href={item.docs.url} target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2 hover:opacity-80">
            Learn more
          </a>
        </p>
      ) : null}
      {item.postNumber ? (
        <p>
          <button type="button" onClick={() => onOpen(item.postNumber!)} className="text-primary underline underline-offset-2 hover:opacity-80">
            See the request that asked for this
          </button>
        </p>
      ) : null}
    </div>
  );
}

/** Likes on the left, the three share buttons on the right, as the reference draws them. */
function EntryFooter({ item, onLike }: { item: ChangelogItem; onLike: (i: ChangelogItem) => void }) {
  const [copied, setCopied] = useState(false);
  const square =
    // 6px stated outright: rounded-md follows each app's --radius, which is 10px in some.
    "inline-flex h-8 w-8 items-center justify-center rounded-[6px] border border-border bg-background text-muted-foreground transition-colors hover:text-foreground";

  const address = () => {
    const base = `${window.location.origin}${window.location.pathname}?tab=changelog`;
    return item.slug ? `${base}&entry=${item.slug}` : `${base}#${item.id}`;
  };

  function copyLink() {
    navigator.clipboard?.writeText(address()).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      },
      () => setCopied(false)
    );
  }

  function share(to: "facebook" | "x") {
    const u = encodeURIComponent(address());
    const url =
      to === "facebook"
        ? `https://www.facebook.com/sharer/sharer.php?u=${u}`
        : `https://twitter.com/intent/tweet?url=${u}&text=${encodeURIComponent(item.title)}`;
    window.open(url, "_blank", "noopener,noreferrer,width=600,height=520");
  }

  return (
    <div className="flex items-center justify-between gap-3">
      {item.source === "entry" ? (
        <button
          type="button"
          onClick={() => onLike(item)}
          aria-pressed={item.liked}
          aria-label={item.liked ? "Take back your like" : "Like this"}
          className="inline-flex items-center gap-2.5 text-[14px]"
        >
          <span className={`${square} ${item.liked ? "border-primary text-primary" : ""}`}>
            <Icon path={ICONS.heart} className="h-4 w-4" filled={item.liked} />
          </span>
          {item.likes} {item.likes === 1 ? "like" : "likes"}
        </button>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-2">
        <button type="button" onClick={copyLink} aria-label={copied ? "Link copied" : "Copy link"} title={copied ? "Link copied" : "Copy link"} className={`${square} ${copied ? "border-primary text-primary" : ""}`}>
          <Icon path={copied ? ICONS.check : ICONS.link} className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => share("facebook")} aria-label="Share on Facebook" title="Share on Facebook" className={square}>
          <Icon path={ICONS.facebook} className="h-4 w-4" filled />
        </button>
        <button type="button" onClick={() => share("x")} aria-label="Share on X" title="Share on X" className={square}>
          <Icon path={ICONS.x} className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

/** One entry on its own page: the rail, the grey back button, and the entry in the
 *  628px column, measured off the reference's own entry page. */
function ChangelogArticle({
  item,
  appName,
  chrome,
  onBack,
  onOpen,
  onLike,
}: {
  item: ChangelogItem;
  appName: string;
  chrome: boolean;
  onBack: () => void;
  onOpen: (n: number) => void;
  onLike: (i: ChangelogItem) => void;
}) {
  // This page has a name of its own, so the browser tab and a shared bookmark say what
  // the change was rather than repeating the section.
  useEffect(() => {
    if (!chrome || typeof document === "undefined") return;
    const before = document.title;
    document.title = `${item.title} - ${appName}`;
    return () => {
      document.title = before;
    };
  }, [chrome, appName, item.title]);

  return (
    <div className="md:grid md:grid-cols-[300px_1fr] md:gap-8">
      <aside className="mb-6 md:mb-0">
        <button
          type="button"
          onClick={onBack}
          className="flex h-[38px] w-full items-center gap-2 rounded-[6px] bg-muted px-3 text-left text-[14px] transition-colors hover:bg-muted/70"
        >
          <Icon path={ICONS.arrowLeft} className="h-4 w-4" />
          Back to changelog
        </button>
      </aside>

      <article className="min-w-0">
        <TypePill type={item.type} />
        <h1 className="mt-2 text-[20px] font-semibold leading-snug">{item.title}</h1>

        {item.image ? (
          // A plain img on purpose: this file is copied verbatim into seventeen Vite apps
          // where next/image does not exist.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image.url} alt={item.image.alt} loading="lazy" className="mt-2 w-full object-cover" />
        ) : null}

        {item.body || item.docs || item.postNumber ? (
          <div className="mt-4">
            <EntryBody item={item} onOpen={onOpen} />
          </div>
        ) : null}

        <div className="mt-8">
          <EntryFooter item={item} onLike={onLike} />
        </div>
      </article>
    </div>
  );
}

// ---------- contact ----------

function ContactDialog({
  api,
  appName,
  board,
  identity,
  onClose,
}: {
  api: Api;
  appName: string;
  board: BoardInfo | null;
  identity?: FeedbackIdentity;
  onClose: () => void;
}) {
  const remembered = useMemo(() => {
    if (identity?.id) return { name: identity.name ?? "", email: identity.email ?? "" };
    try {
      const id = JSON.parse(storage("fb_identity") ?? "{}");
      return { name: String(id.name ?? ""), email: String(id.email ?? "") };
    } catch {
      return { name: "", email: "" };
    }
  }, [identity?.id, identity?.name, identity?.email]);

  const [message, setMessage] = useState(() => storage("fb_support_draft") ?? "");
  const [name, setName] = useState(remembered.name);
  const [email, setEmail] = useState(remembered.email);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  useEffect(() => {
    storage("fb_support_draft", message || null);
  }, [message]);

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (email && !EMAIL_RE.test(email)) {
      setError("That email address does not look right.");
      return;
    }
    setBusy(true);
    setError(null);
    const website = String(new FormData(e.currentTarget).get("website") ?? "");
    try {
      await api.support({ message, name, email, page: typeof window === "undefined" ? "" : window.location.pathname, website });
      storage("fb_support_draft", null);
      if (!identity?.id) storage("fb_identity", JSON.stringify({ name, email }));
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send that.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div role="dialog" aria-modal="true" aria-label={`Contact the ${appName} team`} className="my-auto w-full max-w-lg rounded-xl border border-border bg-background text-foreground shadow-2xl">
        {done ? (
          <div className="p-6 text-center">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
              <Icon path={ICONS.check} className="h-5 w-5" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">Sent</h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
              A person reads every message.{email ? " We reply to the address you left." : " Leave an email next time and we can reply."}
            </p>
            <button type="button" onClick={onClose} className={`${btn.primary} mt-6`}>
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={send}>
            <header className="flex items-start justify-between gap-4 border-b border-border p-5">
              <div>
                <h2 className="text-[15px] font-semibold">Contact us</h2>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  Tell us what happened or what you need. A person reads every message.
                  {board?.assistant ? " The assistant in the app answers faster for anything it already knows." : ""}
                </p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="-m-1 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                <Icon path={ICONS.close} className="h-4 w-4" />
              </button>
            </header>
            <div className="space-y-3 p-5">
              <label htmlFor="fb-support" className="sr-only">
                Your message
              </label>
              <textarea
                id="fb-support"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                maxLength={4000}
                placeholder="What is going on?"
                className={input}
                autoFocus
              />
              {identity?.id ? (
                <p className="text-[12px] text-muted-foreground">
                  Sending as <span className="font-medium text-foreground">{name || email || "you"}</span>
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Your name (optional)" aria-label="Your name" className={`${input} h-9`} />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={120} placeholder="Email, so we can reply" aria-label="Your email" className={`${input} h-9`} />
                </div>
              )}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0" />
              {error ? <ErrorNote message={error} /> : null}
            </div>
            <footer className="flex items-center justify-end gap-2 border-t border-border p-4">
              <button type="button" onClick={onClose} className={btn.ghost}>
                Cancel
              </button>
              <button type="submit" disabled={busy || message.trim().length < 2} className={btn.primary}>
                {busy ? "Sending..." : "Send"}
              </button>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
}

// ---------- the page ----------

export function FeedbackBoard({
  apiUrl,
  boardKey,
  appName,
  identity,
  homeUrl,
  chrome = true,
  className = "",
}: {
  apiUrl: string;
  boardKey: string;
  appName: string;
  identity?: FeedbackIdentity;
  /** Where the product's own home is, for the logo link. */
  homeUrl?: string;
  /** False when the host app already draws a header around this. */
  chrome?: boolean;
  className?: string;
}) {
  const api = useMemo(() => new Api(apiUrl.replace(/\/$/, ""), boardKey, voterId(identity)), [apiUrl, boardKey, identity?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [view, setView] = useState<View>({ kind: "roadmap" });
  const [board, setBoard] = useState<BoardInfo | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [sort, setSort] = useState<Sort>("trending");
  const [status, setStatus] = useState<ListStatus>("all");
  const [category, setCategory] = useState<Category | "all">("all");
  const [q, setQ] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [contactOpen, setContactOpen] = useState(false);
  const [entryId, setEntryId] = useState<string | null>(null);
  const [entrySlug, setEntrySlug] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Take the tab, post, filters and entry anchor out of the URL once, before the first
  // paint, so a shared link opens on what it points at without a visible jump.
  useBrowserLayoutEffect(() => {
    const url = readUrl();
    if (url) {
      setView(url.view);
      setStatus(url.status);
      setCategory(url.category);
      setEntryId(url.entryId);
      setEntrySlug(url.entrySlug);
    }
    setReady(true);
  }, []);

  // Hosts can show a "New" marker on their nav entry until the page has been opened once.
  useEffect(() => {
    storage(feedbackSeenKey(boardKey), "1");
  }, [boardKey]);

  // Standalone, this IS the page, and it is one people are sent links to: give the tab
  // and the bookmark a name that says which product and which part. Embedded in an app's
  // own chrome (chrome={false}) the host owns the title, so leave it alone.
  useEffect(() => {
    if (!chrome || typeof document === "undefined") return;
    const before = document.title;
    const part = view.kind === "post" ? "Feedback" : view.kind === "roadmap" ? "Roadmap" : view.kind === "changelog" ? "Changelog" : "Feedback";
    // An open entry names the tab itself, from its real title.
    if (view.kind === "changelog" && entrySlug) return;
    document.title = `${part} - ${appName}`;
    return () => {
      document.title = before;
    };
  }, [chrome, appName, view.kind, entrySlug]);

  useEffect(() => {
    let cancelled = false;
    api
      .board()
      .then((r) => {
        if (cancelled) return;
        setBoard(r.board);
        setSummary({ counts: r.counts, byStatus: r.byStatus, total: r.total });
      })
      .catch(() => {
        /* the tabs still work without the summary */
      });
    return () => {
      cancelled = true;
    };
  }, [api, reloadKey]);

  // Mirror the view into the URL so a tab or a post can be shared, and the back button
  // behaves, without depending on the host's router.
  useEffect(() => {
    if (typeof window === "undefined" || !ready) return;
    const url = new URL(window.location.href);
    url.searchParams.delete("post");
    url.searchParams.delete("tab");
    url.searchParams.delete("status");
    url.searchParams.delete("category");
    url.searchParams.delete("entry");
    if (view.kind === "post") url.searchParams.set("post", String(view.number));
    else {
      url.searchParams.set("tab", view.kind);
      if (view.kind === "changelog" && entrySlug) url.searchParams.set("entry", entrySlug);
      if (view.kind === "feedback") {
        if (status !== "all") url.searchParams.set("status", status);
        if (category !== "all") url.searchParams.set("category", category);
      }
    }
    window.history.replaceState(window.history.state, "", url.toString());
  }, [view, status, category, entrySlug, ready]);

  const openPost = useCallback((n: number) => setView({ kind: "post", number: n }), []);
  const backToList = useCallback(() => {
    setView({ kind: "feedback" });
    setReloadKey((k) => k + 1);
  }, []);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  const goSearch = useCallback(() => {
    setView({ kind: "feedback" });
    window.setTimeout(() => searchRef.current?.focus(), 60);
  }, []);

  const pickCategory = useCallback((c: Category | "all") => {
    setCategory(c);
    setView({ kind: "feedback" });
  }, []);

  const tab: Tab = view.kind === "post" ? "feedback" : view.kind;

  return (
    <div className={`min-h-full bg-background text-foreground ${className}`}>
      {chrome ? (
        <TopBar
          appName={appName}
          tab={tab}
          identity={identity}
          homeUrl={homeUrl}
          onTab={(t) => setView({ kind: t })}
          onSearch={goSearch}
          onContact={() => setContactOpen(true)}
        />
      ) : null}

      <main className="mx-auto w-full max-w-[960px] px-4 py-8 md:px-0">
        {view.kind === "post" ? (
          <PostView key={view.number} api={api} appName={appName} number={view.number} identity={identity} onBack={backToList} onRedirect={openPost} />
        ) : view.kind === "roadmap" ? (
          <RoadmapTab api={api} summary={summary} onOpen={openPost} onCategory={pickCategory} />
        ) : view.kind === "changelog" ? (
          <ChangelogTab
            api={api}
            appName={appName}
            board={board}
            onOpen={openPost}
            entryId={entryId}
            openSlug={entrySlug}
            chrome={chrome}
            onOpenEntry={(slug) => {
              setEntrySlug(slug);
              window.scrollTo({ top: 0 });
            }}
          />
        ) : (
          <FeedbackTab
            api={api}
            boardKey={boardKey}
            appName={appName}
            board={board}
            summary={summary}
            identity={identity}
            sort={sort}
            status={status}
            category={category}
            q={q}
            searchRef={searchRef}
            onSort={setSort}
            onStatus={setStatus}
            onCategory={setCategory}
            onQ={setQ}
            onOpen={openPost}
            reloadKey={reloadKey}
            onReload={reload}
          />
        )}
      </main>

      {contactOpen ? <ContactDialog api={api} appName={appName} board={board} identity={identity} onClose={() => setContactOpen(false)} /> : null}
    </div>
  );
}

export default FeedbackBoard;
