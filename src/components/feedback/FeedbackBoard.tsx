"use client";

/**
 * FeedbackBoard - the in-app feedback board.
 *
 * Drop this file into any app and render it on a /feedback route. It is deliberately
 * self-contained: React + Tailwind on the shadcn tokens every app already defines
 * (bg-background, text-foreground, border-border, bg-primary, ...). No imports from the
 * host app, no router coupling, no component-library dependency.
 *
 *   <FeedbackBoard apiUrl="https://leotan-feedback.vercel.app/api/v1"
 *                  boardKey="fb_..." appName="ActivityTracker"
 *                  identity={{ id: user.id, name, email }} />
 *
 * Source of truth: github.com/leotansingapore/feedback-board/client/FeedbackBoard.tsx
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// ---------- types ----------

export type FeedbackIdentity = { id: string; name?: string | null; email?: string | null };

type Category = "feature" | "bug" | "improvement" | "question";
type Status = "open" | "under_review" | "planned" | "in_progress" | "shipped" | "declined";
type Sort = "trending" | "top" | "new";

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

type View = { kind: "list" } | { kind: "roadmap" } | { kind: "changelog" } | { kind: "post"; number: number };

const CATEGORIES: { value: Category; label: string; hint: string }[] = [
  { value: "feature", label: "Feature", hint: "Something new you want to exist" },
  { value: "improvement", label: "Improvement", hint: "Something that exists but could be better" },
  { value: "bug", label: "Bug", hint: "Something is broken or wrong" },
  { value: "question", label: "Question", hint: "You want to know how something works" },
];

const STATUS_LABEL: Record<Status, string> = {
  open: "Open",
  under_review: "Under review",
  planned: "Planned",
  in_progress: "In progress",
  shipped: "Shipped",
  declined: "Not planned",
};

const STATUS_CLASS: Record<Status, string> = {
  open: "bg-muted text-muted-foreground",
  under_review: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  planned: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
  in_progress: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  shipped: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  declined: "bg-muted text-muted-foreground",
};

const ROADMAP: { status: Status; blurb: string }[] = [
  { status: "planned", blurb: "Agreed and queued up" },
  { status: "in_progress", blurb: "Being built right now" },
  { status: "shipped", blurb: "Live for everyone" },
];

// ---------- small helpers ----------

function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w ago`;
  const mo = Math.floor(d / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(d / 365)}y ago`;
}

function shortDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "";
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

/** localStorage key set once the board has been opened; hosts read it to drop a "New" marker. */
export function feedbackSeenKey(boardKey: string) {
  return `fb_seen_${boardKey.slice(-8)}`;
}

/** True until the person has opened the board once in this browser. Safe to call during render in a browser-only app. */
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

  list(p: { sort: Sort; status: Status | "all"; category: Category | "all"; q: string }) {
    const sp = new URLSearchParams();
    if (p.sort !== "trending") sp.set("sort", p.sort);
    if (p.status !== "all") sp.set("status", p.status);
    if (p.category !== "all") sp.set("category", p.category);
    if (p.q.trim()) sp.set("q", p.q.trim());
    const qs = sp.toString();
    return this.call<{ board: { name: string; slug: string; notifies: boolean }; posts: Post[] }>(`/posts${qs ? `?${qs}` : ""}`);
  }
  detail(n: number) {
    return this.call<{ post?: Post; comments?: Comment[]; events?: StatusEvent[]; duplicates?: number; redirect?: number }>(`/posts/${n}`);
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
  changelog() {
    return this.call<{ posts: Post[] }>("/changelog");
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

function StatusPill({ status, size = "sm" }: { status: Status; size?: "sm" | "md" }) {
  if (status === "open" && size === "sm") return null;
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full font-medium ${STATUS_CLASS[status]} ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {STATUS_LABEL[status]}
    </span>
  );
}

function MakerBadge() {
  return <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary">Maker</span>;
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

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex h-8 shrink-0 items-center whitespace-nowrap rounded-full px-3 text-[13px] font-medium transition-colors ${
        active ? "bg-secondary text-secondary-foreground ring-1 ring-inset ring-border" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      }`}
    >
      {children}
    </button>
  );
}

function Empty({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-border px-6 py-14 text-center">
      <p className="text-[15px] font-medium">{title}</p>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">{body}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

function Skeleton({ rows = 4 }: { rows?: number }) {
  return (
    <ul className="space-y-2" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <li key={i} className="flex gap-3 rounded-lg border border-border bg-card p-3 sm:p-4">
          <div className="h-14 w-[52px] shrink-0 animate-pulse rounded-md bg-muted" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-3.5 w-2/3 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
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

// ---------- vote button ----------

function VoteButton({
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

  // When the parent re-fetches, take the server's numbers; the render-time compare avoids
  // an effect that would set state synchronously.
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
          lg ? "w-16 py-3" : "w-[52px] py-2.5"
        } ${
          state.voted
            ? "border-primary bg-primary/10 text-foreground"
            : "border-border bg-card text-muted-foreground hover:border-primary hover:text-foreground"
        }`}
      >
        <svg viewBox="0 0 24 24" className={lg ? "h-4 w-4" : "h-3.5 w-3.5"} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M6 15l6-6 6 6" />
        </svg>
        <span
          className={`font-semibold tabular-nums ${lg ? "text-lg" : "text-sm"}`}
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

// ---------- post card ----------

function PostCard({ api, post, onOpen }: { api: Api; post: Post; onOpen: (n: number) => void }) {
  return (
    <li className="relative">
      <div className="flex gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-foreground/25 sm:gap-4 sm:p-4">
        {/* z-10 keeps the vote control above the title's stretched-link overlay. */}
        <div className="relative z-10">
          <VoteButton api={api} post={post} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 text-[15px] font-semibold leading-snug">
              <button
                type="button"
                onClick={() => onOpen(post.number)}
                className="text-left after:absolute after:inset-0 hover:underline"
              >
                {post.pinned ? <span aria-label="Pinned" title="Pinned" className="mr-1.5 align-middle text-primary">&#9679;</span> : null}
                {post.title}
              </button>
            </h3>
            <StatusPill status={post.status} />
          </div>
          {post.body ? <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{post.body}</p> : null}
          <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted-foreground">
            <Avatar name={post.author_name} size={18} />
            <span className="font-medium">{post.author_name || "Anonymous"}</span>
            {post.is_official ? <MakerBadge /> : null}
            <span aria-hidden>&middot;</span>
            <time dateTime={post.created_at}>{timeAgo(post.created_at)}</time>
            <span aria-hidden>&middot;</span>
            <span>{CATEGORIES.find((c) => c.value === post.category)?.label ?? post.category}</span>
            {post.comment_count > 0 ? (
              <>
                <span aria-hidden>&middot;</span>
                <span>{post.comment_count} {post.comment_count === 1 ? "comment" : "comments"}</span>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </li>
  );
}

// ---------- submit dialog ----------

type Draft = { title: string; body: string; category: Category; name: string; email: string };
const EMPTY: Draft = { title: "", body: "", category: "feature", name: "", email: "" };

type SubmitProps = {
  api: Api;
  boardKey: string;
  appName: string;
  identity?: FeedbackIdentity;
  notifies: boolean;
  onClose: () => void;
  onCreated: (n: number) => void;
  onOpenPost: (n: number) => void;
};

// Mounted only while open, so every opening starts from a fresh useState initialiser
// (which is where the saved draft is restored) instead of an effect.
function SubmitDialog({ open, ...props }: SubmitProps & { open: boolean }) {
  return open ? <SubmitDialogBody {...props} /> : null;
}

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
    ...EMPTY,
    ...base,
    ...restored,
    name: identity?.name ?? restored.name ?? base.name ?? "",
    email: identity?.email ?? restored.email ?? base.email ?? "",
  };
}

function SubmitDialogBody({ api, boardKey, appName, identity, notifies, onClose, onCreated, onOpenPost }: SubmitProps) {
  const draftKey = `fb_draft_${boardKey.slice(-8)}`;
  // Restore whatever was typed before, so a closed tab never costs someone their idea.
  const [draft, setDraft] = useState<Draft>(() => restoreDraft(draftKey, identity));
  const [similar, setSimilar] = useState<Post[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const hasIdentity = !!identity?.id;

  useEffect(() => {
    const t = window.setTimeout(() => titleRef.current?.focus(), 60);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (done !== null) return;
    if (draft.title || draft.body) storage(draftKey, JSON.stringify(draft));
  }, [draft, done, draftKey]);

  // Show what people already asked for while the title is still being typed. Voting on
  // an existing post beats filing the same idea twice.
  useEffect(() => {
    if (done !== null) return;
    const title = draft.title.trim();
    const t = window.setTimeout(() => {
      if (title.length < 5) {
        setSimilar([]);
        return;
      }
      api.similar(title).then((r) => setSimilar(r.posts)).catch(() => setSimilar([]));
    }, 350);
    return () => window.clearTimeout(t);
  }, [draft.title, done, api]);

  const close = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [close]);

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
      onCreated(res.number);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save that.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={done !== null ? "Feedback posted" : `Give feedback on ${appName}`}
        className="my-auto w-full max-w-xl rounded-xl border border-border bg-background text-foreground shadow-2xl"
      >
        {done !== null ? (
          <div className="p-6 text-center sm:p-8">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-300">
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-semibold">That is on the board</h2>
            <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
              Everyone using {appName} can see it and vote on it now. It carries your vote already.
              {draft.email && notifies ? " You will get an email when its status changes." : ""}
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <button
                type="button"
                className={btn.primary}
                onClick={() => {
                  close();
                  onOpenPost(done);
                }}
              >
                See your post
              </button>
              <button type="button" onClick={close} className={btn.outline}>
                Back to the board
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <header className="flex items-start justify-between gap-4 border-b border-border p-5">
              <div>
                <h2 className="text-[15px] font-semibold">Give feedback on {appName}</h2>
                <p className="mt-0.5 text-[13px] text-muted-foreground">Everyone using {appName} can see this, and the most-voted items get built first.</p>
              </div>
              <button type="button" onClick={close} aria-label="Close" className="-m-1 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </header>

            <div className="max-h-[60vh] space-y-5 overflow-y-auto p-5">
              <fieldset>
                <legend className="mb-2 text-[13px] font-medium text-muted-foreground">What kind of feedback is this?</legend>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((c) => (
                    <label
                      key={c.value}
                      className={`cursor-pointer rounded-md border px-3 py-2.5 transition-colors ${
                        draft.category === c.value ? "border-primary bg-primary/10" : "border-border bg-card hover:border-foreground/30"
                      }`}
                    >
                      <input type="radio" name="category" value={c.value} checked={draft.category === c.value} onChange={() => setDraft({ ...draft, category: c.value })} className="sr-only" />
                      <span className="block text-[13px] font-medium">{c.label}</span>
                      <span className="mt-0.5 block text-[11px] leading-snug text-muted-foreground">{c.hint}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <div>
                <label htmlFor="fb-title" className="mb-1.5 flex items-baseline justify-between">
                  <span className="text-[13px] font-medium text-muted-foreground">Say it in one line</span>
                  <span className={`text-[11px] tabular-nums ${draft.title.length > 140 ? "text-destructive" : "text-muted-foreground"}`}>{draft.title.length}/140</span>
                </label>
                <input id="fb-title" ref={titleRef} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} maxLength={160} required placeholder="Let me export the report as a PDF" className={input} />
              </div>

              {similar.length > 0 ? (
                <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3">
                  <p className="text-[12px] font-medium text-amber-800 dark:text-amber-200">Someone may have asked for this already</p>
                  <p className="mt-0.5 text-[11px] text-amber-800/70 dark:text-amber-200/70">Voting on one of these counts for more than a second post.</p>
                  <ul className="mt-2.5 space-y-1.5">
                    {similar.map((p) => (
                      <li key={p.id} className="flex items-center gap-2.5 rounded-md bg-background p-2">
                        <VoteButton api={api} post={p} />
                        <button
                          type="button"
                          onClick={() => {
                            close();
                            onOpenPost(p.number);
                          }}
                          className="min-w-0 flex-1 truncate text-left text-[13px] hover:underline"
                        >
                          {p.title}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div>
                <label htmlFor="fb-body" className="mb-1.5 block text-[13px] font-medium text-muted-foreground">
                  What are you trying to do, and what gets in the way? <span className="font-normal">Optional</span>
                </label>
                <textarea id="fb-body" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} rows={4} maxLength={4000} placeholder="The more specific, the more likely it gets built. Real examples help most." className={input} />
              </div>

              {hasIdentity ? (
                <p className="text-[12px] text-muted-foreground">
                  Posting as <span className="font-medium text-foreground">{draft.name || draft.email || "you"}</span>. Your email is never shown
                  {notifies ? ", and you will get one email when the status changes." : "."}
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="fb-name" className="mb-1.5 block text-[13px] font-medium text-muted-foreground">
                      Your name <span className="font-normal">Optional</span>
                    </label>
                    <input id="fb-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} maxLength={60} placeholder="Anonymous" className={input} />
                  </div>
                  <div>
                    <label htmlFor="fb-email" className="mb-1.5 block text-[13px] font-medium text-muted-foreground">
                      Email <span className="font-normal">Optional</span>
                    </label>
                    <input id="fb-email" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} maxLength={120} placeholder={notifies ? "To hear when it ships" : "Only used to follow up"} className={input} />
                  </div>
                </div>
              )}

              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] h-0 w-0" />

              {error ? <ErrorNote message={error} /> : null}
            </div>

            <footer className="flex items-center justify-between gap-3 border-t border-border p-4">
              <p className="text-[11px] text-muted-foreground">Posts are visible to everyone on {appName}. Emails are not.</p>
              <div className="flex gap-2">
                <button type="button" onClick={close} className={btn.ghost}>
                  Cancel
                </button>
                <button type="submit" disabled={busy || draft.title.trim().length < 4} className={btn.primary}>
                  {busy ? "Posting..." : "Post it"}
                </button>
              </div>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
}

// ---------- post detail ----------

function PostDetail({
  api,
  number,
  identity,
  onBack,
  onRedirect,
}: {
  api: Api;
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

  const [data, setData] = useState<{ post: Post; comments: Comment[]; events: StatusEvent[]; duplicates: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState(() => storage(draftKey) ?? "");
  const [name, setName] = useState(remembered.name);
  const [email, setEmail] = useState(remembered.email);
  const [busy, setBusy] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

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
        setData({ post: r.post, comments: r.comments ?? [], events: r.events ?? [], duplicates: r.duplicates ?? 0 });
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load that post.");
      });
    window.scrollTo({ top: 0 });
    return () => {
      cancelled = true;
    };
  }, [api, number, onRedirect, attempt]);

  const load = useCallback(() => {
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

  return (
    <div className="mx-auto w-full max-w-3xl">
      <button type="button" onClick={onBack} className="inline-flex items-center gap-1.5 text-[13px] text-muted-foreground transition-colors hover:text-foreground">
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M15 18l-6-6 6-6" />
        </svg>
        All feedback
      </button>

      {error ? (
        <div className="mt-4">
          <ErrorNote message={error} onRetry={load} />
        </div>
      ) : !data ? (
        <div className="mt-4">
          <Skeleton rows={1} />
        </div>
      ) : (
        <>
          <article className="mt-4 flex gap-4">
            <VoteButton api={api} post={data.post} size="lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-[12px] text-muted-foreground">
                <StatusPill status={data.post.status} size="md" />
                <span>{CATEGORIES.find((c) => c.value === data.post.category)?.label}</span>
                <span aria-hidden>&middot;</span>
                <span>#{data.post.number}</span>
              </div>
              <h1 className="mt-2.5 text-2xl font-semibold leading-tight tracking-tight">{data.post.title}</h1>
              <div className="mt-3 flex items-center gap-2 text-[12px] text-muted-foreground">
                <Avatar name={data.post.author_name} />
                <span className="font-medium">{data.post.author_name || "Anonymous"}</span>
                {data.post.is_official ? <MakerBadge /> : null}
                <span aria-hidden>&middot;</span>
                <time dateTime={data.post.created_at}>{timeAgo(data.post.created_at)}</time>
              </div>
              {data.post.body ? <div className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-muted-foreground">{data.post.body}</div> : null}
              {data.duplicates > 0 ? (
                <p className="mt-4 rounded-md border border-border bg-card px-3 py-2 text-[12px] text-muted-foreground">
                  {data.duplicates} other {data.duplicates === 1 ? "post" : "posts"} asking for the same thing {data.duplicates === 1 ? "was" : "were"} folded in here.
                </p>
              ) : null}
            </div>
          </article>

          {data.events.length > 0 ? (
            <section className="mt-8" aria-label="Status history">
              <h2 className="text-[13px] font-medium text-muted-foreground">Progress</h2>
              <ol className="mt-3 space-y-2.5 border-l border-border pl-4">
                {data.events.map((ev) => (
                  <li key={ev.id} className="relative text-[13px]">
                    <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                    Moved to <strong className="font-semibold">{STATUS_LABEL[ev.to_status]}</strong>
                    <span className="ml-2 text-[12px] text-muted-foreground">{shortDate(ev.created_at)}</span>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          <section className="mt-8" aria-label="Comments">
            <h2 className="text-[13px] font-medium text-muted-foreground">
              {data.comments.length === 0 ? "No comments yet" : `${data.comments.length} ${data.comments.length === 1 ? "comment" : "comments"}`}
            </h2>
            {data.comments.length > 0 ? (
              <ul className="mt-3 space-y-3">
                {data.comments.map((c) => (
                  <li key={c.id} className={`rounded-lg border p-3.5 ${c.is_official ? "border-primary/40 bg-primary/5" : "border-border bg-card"}`}>
                    <div className="flex items-center gap-2 text-[12px]">
                      <Avatar name={c.author_name} />
                      <span className="font-medium">{c.author_name || "Anonymous"}</span>
                      {c.is_official ? <MakerBadge /> : null}
                      <span className="text-muted-foreground" aria-hidden>&middot;</span>
                      <time className="text-muted-foreground" dateTime={c.created_at}>{timeAgo(c.created_at)}</time>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-[14px] leading-relaxed text-muted-foreground">{c.body}</p>
                  </li>
                ))}
              </ul>
            ) : null}

            <form onSubmit={send} className="mt-4">
              <label htmlFor="fb-comment" className="sr-only">Add a comment</label>
              <textarea
                id="fb-comment"
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={body ? 4 : 2}
                maxLength={4000}
                placeholder="Add something the post is missing: how often this hits you, what you do instead."
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
              {sendError ? <div className="mt-2"><ErrorNote message={sendError} /></div> : null}
            </form>
          </section>
        </>
      )}
    </div>
  );
}

// ---------- roadmap + changelog ----------

function Roadmap({ api, onOpen }: { api: Api; onOpen: (n: number) => void }) {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    api
      .roadmap()
      .then((r) => {
        if (!cancelled) setPosts(r.posts);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load.");
      });
    return () => {
      cancelled = true;
    };
  }, [api, attempt]);
  const load = useCallback(() => {
    setError(null);
    setAttempt((a) => a + 1);
  }, []);

  if (error) return <ErrorNote message={error} onRetry={load} />;
  if (!posts) return <Skeleton rows={3} />;
  if (posts.length === 0) return <Empty title="Nothing on the roadmap yet" body="Once feedback gets picked up, it shows here as planned, in progress and shipped." />;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {ROADMAP.map((col) => {
        const items = posts.filter((p) => p.status === col.status);
        return (
          <section key={col.status} aria-label={STATUS_LABEL[col.status]}>
            <header className="flex items-baseline gap-2 px-0.5 pb-2.5">
              <h2 className="text-[13px] font-semibold">{STATUS_LABEL[col.status]}</h2>
              <span className="rounded-full bg-muted px-1.5 text-[11px] tabular-nums text-muted-foreground">{items.length}</span>
              <span className="ml-auto text-[11px] text-muted-foreground">{col.blurb}</span>
            </header>
            {items.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border px-3 py-8 text-center text-[12px] text-muted-foreground">Nothing here yet</p>
            ) : (
              <ul className="space-y-2">
                {items.map((p) => (
                  <li key={p.id} className="relative flex gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-foreground/25">
                    <div className="relative z-10">
                      <VoteButton api={api} post={p} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-[14px] font-medium leading-snug">
                        <button type="button" onClick={() => onOpen(p.number)} className="text-left after:absolute after:inset-0 hover:underline">
                          {p.title}
                        </button>
                      </h3>
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        {CATEGORIES.find((c) => c.value === p.category)?.label}
                        {p.comment_count > 0 ? ` · ${p.comment_count} comments` : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

function Changelog({ api, appName, onOpen }: { api: Api; appName: string; onOpen: (n: number) => void }) {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    api
      .changelog()
      .then((r) => {
        if (!cancelled) setPosts(r.posts);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load.");
      });
    return () => {
      cancelled = true;
    };
  }, [api, attempt]);
  const load = useCallback(() => {
    setError(null);
    setAttempt((a) => a + 1);
  }, []);

  if (error) return <ErrorNote message={error} onRetry={load} />;
  if (!posts) return <Skeleton rows={3} />;
  if (posts.length === 0) return <Empty title="Nothing shipped from this board yet" body="When a request goes live, it lands here with the date it shipped." />;

  const groups = new Map<string, Post[]>();
  for (const p of posts) {
    const k = p.shipped_at ? new Date(p.shipped_at).toLocaleDateString("en-GB", { month: "long", year: "numeric" }) : "Earlier";
    groups.set(k, [...(groups.get(k) ?? []), p]);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <p className="text-[15px] leading-relaxed text-muted-foreground">Everything asked for here that is now live in {appName}.</p>
      {[...groups.entries()].map(([month, items]) => (
        <section key={month}>
          <h2 className="text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">{month}</h2>
          <ul className="mt-3 space-y-2.5 border-l border-border pl-5">
            {items.map((p) => (
              <li key={p.id} className="relative">
                <span className="absolute -left-[23px] top-2 h-2 w-2 rounded-full bg-emerald-500" />
                <button type="button" onClick={() => onOpen(p.number)} className="block w-full rounded-lg border border-border bg-card p-3.5 text-left transition-colors hover:border-foreground/25">
                  <h3 className="text-[14px] font-medium">{p.title}</h3>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                    <span>{shortDate(p.shipped_at)}</span>
                    <span aria-hidden>&middot;</span>
                    <span>{CATEGORIES.find((c) => c.value === p.category)?.label}</span>
                    <span aria-hidden>&middot;</span>
                    <span className="tabular-nums">{p.vote_count} votes</span>
                  </p>
                  {p.body ? <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground">{p.body}</p> : null}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

// ---------- the board ----------

export function FeedbackBoard({
  apiUrl,
  boardKey,
  appName,
  identity,
  className = "",
}: {
  apiUrl: string;
  boardKey: string;
  appName: string;
  identity?: FeedbackIdentity;
  className?: string;
}) {
  const api = useMemo(() => new Api(apiUrl.replace(/\/$/, ""), boardKey, voterId(identity)), [apiUrl, boardKey, identity?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [view, setView] = useState<View>(() => {
    if (typeof window === "undefined") return { kind: "list" };
    const sp = new URLSearchParams(window.location.search);
    const n = Number(sp.get("post"));
    if (Number.isInteger(n) && n > 0) return { kind: "post", number: n };
    const tab = sp.get("tab");
    if (tab === "roadmap" || tab === "changelog") return { kind: tab };
    return { kind: "list" };
  });
  const [sort, setSort] = useState<Sort>("trending");
  const [status, setStatus] = useState<Status | "all">("all");
  const [category, setCategory] = useState<Category | "all">("all");
  const [q, setQ] = useState("");
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [notifies, setNotifies] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Hosts can show a "New" marker on their nav entry until the board has been opened
  // once; this is the flag they read (see feedbackSeenKey).
  useEffect(() => {
    storage(feedbackSeenKey(boardKey), "1");
  }, [boardKey]);

  // Mirror the view into the URL so a post can be shared inside the app and the back
  // button behaves, without depending on the host's router.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.delete("post");
    url.searchParams.delete("tab");
    if (view.kind === "post") url.searchParams.set("post", String(view.number));
    else if (view.kind !== "list") url.searchParams.set("tab", view.kind);
    window.history.replaceState(window.history.state, "", url.toString());
  }, [view]);

  useEffect(() => {
    if (view.kind !== "list") return;
    let cancelled = false;
    const t = window.setTimeout(() => {
      api
        .list({ sort, status, category, q })
        .then((r) => {
          if (!cancelled) {
            setPosts(r.posts);
            setNotifies(!!r.board?.notifies);
            setError(null);
          }
        })
        .catch((e) => {
          if (!cancelled) setError(e instanceof Error ? e.message : "Could not load feedback.");
        });
    }, q ? 300 : 0);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [api, view.kind, sort, status, category, q, reloadKey]);

  const openPost = useCallback((n: number) => setView({ kind: "post", number: n }), []);
  const backToList = useCallback(() => {
    setView({ kind: "list" });
    setReloadKey((k) => k + 1);
  }, []);

  const filtered = status !== "all" || category !== "all" || q.trim() !== "";
  const tabs: { kind: View["kind"]; label: string }[] = [
    { kind: "list", label: "Feedback" },
    { kind: "roadmap", label: "Roadmap" },
    { kind: "changelog", label: "Changelog" },
  ];
  const activeTab = view.kind === "post" ? "list" : view.kind;

  return (
    <div className={`text-foreground ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Feedback</h1>
          <p className="mt-1 max-w-2xl text-[14px] leading-relaxed text-muted-foreground">
            Ask for what you need in {appName}, see what everyone else has asked for, and vote so the most wanted things get built first.
          </p>
        </div>
        <button type="button" onClick={() => setSubmitOpen(true)} className={btn.primary}>
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Give feedback
        </button>
      </div>

      <nav aria-label="Board sections" className="mt-5 flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.kind}
            type="button"
            onClick={() => setView({ kind: t.kind } as View)}
            className={`relative -mb-px px-3 py-2.5 text-[13px] font-medium transition-colors ${
              activeTab === t.kind ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
            {activeTab === t.kind ? <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-primary" /> : null}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {view.kind === "post" ? (
          <PostDetail key={view.number} api={api} number={view.number} identity={identity} onBack={backToList} onRedirect={openPost} />
        ) : view.kind === "roadmap" ? (
          <Roadmap api={api} onOpen={openPost} />
        ) : view.kind === "changelog" ? (
          <Changelog api={api} appName={appName} onOpen={openPost} />
        ) : (
          <>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div role="tablist" aria-label="Sort posts" className="flex shrink-0 gap-0.5 rounded-md border border-border bg-card p-0.5">
                {(["trending", "top", "new"] as Sort[]).map((s) => (
                  <button
                    key={s}
                    role="tab"
                    aria-selected={sort === s}
                    onClick={() => setSort(s)}
                    className={`h-8 rounded px-3 text-[13px] font-medium transition-colors ${
                      sort === s ? "bg-secondary text-secondary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {s === "trending" ? "Trending" : s === "top" ? "Top" : "New"}
                  </button>
                ))}
              </div>
              <div className="relative flex-1">
                <svg viewBox="0 0 24 24" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3.5-3.5" />
                </svg>
                <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search what people have asked for" aria-label="Search posts" className={`${input} h-9 pl-9`} />
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category | "all")}
                aria-label="Filter by type"
                className="h-9 shrink-0 rounded-md border border-border bg-background px-3 text-sm text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="all">All types</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="-mx-4 mt-3 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
              <Chip active={status === "all"} onClick={() => setStatus("all")}>All</Chip>
              {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                <Chip key={s} active={status === s} onClick={() => setStatus(s)}>{STATUS_LABEL[s]}</Chip>
              ))}
            </div>

            <div className="mt-5">
              {error ? (
                <ErrorNote message={error} onRetry={() => { setError(null); setReloadKey((k) => k + 1); }} />
              ) : !posts ? (
                <Skeleton />
              ) : posts.length === 0 ? (
                filtered ? (
                  <Empty
                    title="Nothing matches that"
                    body="Try a different status, type or search term."
                    action={
                      <button type="button" className={btn.outline} onClick={() => { setStatus("all"); setCategory("all"); setQ(""); }}>
                        Clear the filters
                      </button>
                    }
                  />
                ) : (
                  <Empty
                    title="Nothing here yet"
                    body={`Be the first to say what ${appName} should do next. It takes about twenty seconds.`}
                    action={
                      <button type="button" className={btn.primary} onClick={() => setSubmitOpen(true)}>
                        Post the first idea
                      </button>
                    }
                  />
                )
              ) : (
                <>
                  <p className="mb-2.5 text-[12px] text-muted-foreground">
                    {posts.length} {posts.length === 1 ? "post" : "posts"}{filtered ? " matching" : ""}
                  </p>
                  <ul className="space-y-2">
                    {posts.map((p) => (
                      <PostCard key={p.id} api={api} post={p} onOpen={openPost} />
                    ))}
                  </ul>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <SubmitDialog
        api={api}
        boardKey={boardKey}
        appName={appName}
        identity={identity}
        notifies={notifies}
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        onCreated={() => setReloadKey((k) => k + 1)}
        onOpenPost={openPost}
      />
    </div>
  );
}

export default FeedbackBoard;
