"use client";

/**
 * AssistantDock - the in-app assistant for products that do not have one of their own.
 *
 * A floating button opens a chat panel. The assistant answers from the app's own
 * knowledge on the feedback service, and every action it offers is a chip the person
 * taps: post to the feedback board, send a message to the team, or open a page. It never
 * claims to have done something itself.
 *
 *   <AssistantDock apiUrl="https://leotan-feedback.vercel.app/api/v1" boardKey="fb_..."
 *                  appName="FourLens" identity={{ id, name, email }} navigate={(p) => router.push(p)} />
 *
 * Self-contained like FeedbackBoard: React + Tailwind on the shadcn tokens. `navigate`
 * is optional; without it "Open /path" does a full page load.
 * Source of truth: github.com/leotansingapore/feedback-board/client/AssistantDock.tsx
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type AssistantIdentity = { id: string; name?: string | null; email?: string | null };

type Action =
  | { type: "feedback"; category: "feature" | "improvement" | "bug" | "question"; title: string; body: string; label: string }
  | { type: "support"; message: string; label: string }
  | { type: "go"; path: string; label: string };

type Msg = {
  role: "user" | "assistant";
  text: string;
  id?: string | null;            // assistant_events id, for thumbs
  actions?: Action[];
  done?: Record<number, string>; // action index -> outcome line
  rating?: 1 | -1;
  error?: boolean;
};

function storage(key: string, value?: string | null) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    /* blocked storage */
  }
  return null;
}

function voterId(identity?: AssistantIdentity) {
  if (identity?.id) return identity.id;
  let t = storage("fb_voter");
  if (!t) {
    t = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    storage("fb_voter", t);
  }
  return t;
}

const btn = {
  primary:
    "inline-flex h-9 items-center justify-center gap-2 rounded-md bg-primary px-3.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50",
  chip:
    "inline-flex min-h-8 items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-left text-[12px] font-medium text-foreground transition-colors hover:bg-primary/20 disabled:pointer-events-none disabled:opacity-60",
  icon: "inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
};

/** The four things people come to a product team with, offered before they have to
 *  think of the words. Tapping one sends that sentence, so the assistant replies in
 *  the same chat and attaches the button that actually posts it. */
const OPENERS: { id: string; label: string; text: string }[] = [
  { id: "bug", label: "Something is broken", text: "Something is broken and I want to report it:" },
  { id: "feature", label: "Ask for a feature", text: "I would like to ask for a feature:" },
  { id: "improve", label: "Suggest an improvement", text: "I have an idea to improve something:" },
  { id: "question", label: "Ask a question", text: "I have a question about how this works:" },
];

export function AssistantDock({
  apiUrl,
  boardKey,
  appName,
  identity,
  navigate,
  position = "bottom-right",
  offsetY = 20,
  offsetX = 20,
  mobileOffsetY,
  mobileBreakpoint = 768,
  label = "Ask",
}: {
  apiUrl: string;
  boardKey: string;
  appName: string;
  identity?: AssistantIdentity;
  navigate?: (path: string) => void;
  position?: "bottom-right" | "bottom-left";
  offsetY?: number;
  offsetX?: number;
  /** Bottom offset below mobileBreakpoint, for apps with a mobile bottom nav. Defaults to offsetY. */
  mobileOffsetY?: number;
  /** Width in px under which mobileOffsetY applies. */
  mobileBreakpoint?: number;
  label?: string;
}) {
  const base = apiUrl.replace(/\/$/, "");
  const voter = useMemo(() => voterId(identity), [identity?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const threadKey = `fb_asst_${boardKey.slice(-8)}`;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>(() => {
    try {
      const saved = storage(threadKey);
      return saved ? (JSON.parse(saved) as Msg[]).slice(-20) : [];
    } catch {
      return [];
    }
  });
  const [draft, setDraft] = useState(() => storage(`${threadKey}_draft`) ?? "");
  const [busy, setBusy] = useState(false);
  /** The board's own path in this app, read from the service (which derives it from
   *  boards.feedback_url) so the dock never hardcodes a route. Fetched when the dock
   *  first opens, so "See what others asked for" is there before anyone has typed. */
  const [feedbackPath, setFeedbackPath] = useState<string | null>(null);
  const threadId = useMemo(() => storage(`${threadKey}_id`) ?? (() => { const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`; storage(`${threadKey}_id`, id); return id; })(), [threadKey]);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${mobileBreakpoint - 1}px)`);
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [mobileBreakpoint]);
  const bottom = narrow && mobileOffsetY !== undefined ? mobileOffsetY : offsetY;

  useEffect(() => {
    storage(threadKey, JSON.stringify(messages.slice(-20)));
  }, [messages, threadKey]);
  useEffect(() => {
    storage(`${threadKey}_draft`, draft || null);
  }, [draft, threadKey]);
  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
    const t = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(t);
  }, [open, messages.length, busy]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const headers = useMemo(
    () => ({ "Content-Type": "application/json", "X-Board-Key": boardKey, "X-Voter": voter }),
    [boardKey, voter]
  );

  // The board's own route in this app, so "See what others asked for" is offered from
  // the moment the dock opens rather than after the first answer.
  useEffect(() => {
    if (!open || feedbackPath) return;
    let alive = true;
    fetch(`${base}/posts?sort=new`, { headers })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => { if (alive && d?.board?.feedbackPath) setFeedbackPath(d.board.feedbackPath); })
      .catch(() => { /* the chip simply stays hidden */ });
    return () => { alive = false; };
  }, [open, feedbackPath, base, headers]);

  const send = useCallback(async (seed?: string) => {
    const text = (seed ?? draft).trim();
    if (!text || busy) return;
    setDraft("");
    const next: Msg[] = [...messages, { role: "user", text }];
    setMessages(next);
    setBusy(true);
    try {
      const res = await fetch(`${base}/assistant/chat`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          messages: next.slice(-12).map((m) => ({ role: m.role, text: m.text })),
          page: typeof window !== "undefined" ? window.location.pathname : null,
          thread: threadId,
          identity: identity ? { name: identity.name ?? null } : null,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: string; text?: string; actions?: Action[]; feedbackPath?: string | null; error?: string };
      if (data.feedbackPath) setFeedbackPath(data.feedbackPath);
      if (!res.ok) throw new Error(data.error || "The assistant is not answering right now.");
      setMessages((m) => [...m, { role: "assistant", text: data.text || "", id: data.id ?? null, actions: data.actions ?? [] }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", text: e instanceof Error ? e.message : "Something went wrong.", error: true }]);
    } finally {
      setBusy(false);
    }
  }, [draft, busy, messages, base, headers, threadId, identity]);

  const runAction = useCallback(
    async (mi: number, ai: number, a: Action) => {
      const mark = (line: string) =>
        setMessages((m) => m.map((x, i) => (i === mi ? { ...x, done: { ...(x.done ?? {}), [ai]: line } } : x)));
      if (a.type === "go") {
        // Belt and braces with the server: only a same-origin path ever navigates.
        if (!/^\/(?![\/\\])/.test(a.path) || /[:\\]/.test(a.path)) return;
        if (navigate) navigate(a.path);
        else window.location.assign(a.path);
        setOpen(false);
        return;
      }
      mark("Working...");
      try {
        if (a.type === "feedback") {
          const res = await fetch(`${base}/posts`, {
            method: "POST",
            headers,
            body: JSON.stringify({ title: a.title, body: a.body, category: a.category, name: identity?.name ?? "", email: identity?.email ?? "", website: "" }),
          });
          const d = (await res.json().catch(() => ({}))) as { number?: number; error?: string };
          if (!res.ok || typeof d.number !== "number") throw new Error(d.error || "The board did not accept that.");
          mark(`Posted to the feedback board as #${d.number}.`);
        } else {
          const res = await fetch(`${base}/support`, {
            method: "POST",
            headers,
            body: JSON.stringify({ message: a.message, name: identity?.name ?? "", email: identity?.email ?? "", page: window.location.pathname, website: "" }),
          });
          const d = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; replyTo?: string | null };
          if (!res.ok || !d.ok) throw new Error(d.error || "Could not send that.");
          mark(d.replyTo ? `Sent. The reply will come to ${d.replyTo}.` : "Sent to the team.");
        }
      } catch (e) {
        mark(`That did not work: ${e instanceof Error ? e.message : "try again"}`);
      }
    },
    [base, headers, identity, navigate]
  );

  const rate = useCallback(
    async (mi: number, rating: 1 | -1) => {
      const msg = messages[mi];
      if (!msg?.id) return;
      const next = msg.rating === rating ? 0 : rating;
      setMessages((m) => m.map((x, i) => (i === mi ? { ...x, rating: next === 0 ? undefined : (next as 1 | -1) } : x)));
      await fetch(`${base}/assistant/rate`, { method: "POST", headers, body: JSON.stringify({ id: msg.id, rating: next }) }).catch(() => {});
    },
    [messages, base, headers]
  );

  const reset = () => {
    setMessages([]);
    storage(`${threadKey}_id`, null);
  };

  const side = position === "bottom-left" ? { left: offsetX } : { right: offsetX };

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Ask the ${appName} assistant`}
          style={{ position: "fixed", bottom, zIndex: 60, ...side }}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 11.5a8.38 8.38 0 0 1-9 8.4 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.2A8.38 8.38 0 0 1 4 11.5a8.5 8.5 0 0 1 8.5-8.5 8.38 8.38 0 0 1 8.5 8.5z" />
          </svg>
          {label}
        </button>
      ) : null}

      {open ? (
        <div
          role="dialog"
          aria-label={`${appName} assistant`}
          style={{ position: "fixed", bottom, zIndex: 60, ...side }}
          className="flex h-[min(640px,calc(100dvh-32px))] w-[min(400px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-border bg-background text-foreground shadow-2xl"
        >
          <header className="flex items-center gap-2 border-b border-border px-3 py-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
              </svg>
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">Assistant</p>
              <p className="truncate text-[11px] text-muted-foreground">How {appName} works, an idea, a problem, or a word to the team</p>
            </div>
            {messages.length > 0 ? (
              <button type="button" onClick={reset} title="New chat" aria-label="New chat" className={btn.icon}>
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M12 5v14M5 12h14" /></svg>
              </button>
            ) : null}
            <button type="button" onClick={() => setOpen(false)} aria-label="Close" className={btn.icon}>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M18 6L6 18M6 6l12 12" /></svg>
            </button>
          </header>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.length === 0 ? (
              // One chat, every channel. The four openers are the point of this dock: a
              // person who would never hunt for a feedback form will tap "Something is
              // broken". Each one just types its sentence and sends, so the answer is a
              // real conversation, not a form -- and the assistant hands back the button
              // that posts it or reaches the team.
              <div className="space-y-3">
                <div className="rounded-xl bg-muted/60 px-3 py-3 text-[13px] leading-relaxed text-muted-foreground">
                  Ask how anything in {appName} works, or use this to reach the team. Whatever you pick, you see the exact message before anything is sent.
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {OPENERS.map((o) => (
                    <button
                      key={o.label}
                      type="button"
                      // Seeds the box and focuses it: the person finishes the sentence in
                      // their own words. Sending the stub alone would make the assistant
                      // ask "what is broken?", which is a question they already answered
                      // by tapping.
                      onClick={() => { setDraft(o.text + " "); inputRef.current?.focus(); }}
                      className={btn.chip}
                      data-testid={`assistant-opener-${o.id}`}
                    >
                      {o.label}
                    </button>
                  ))}
                  {feedbackPath ? (
                    <button type="button" onClick={() => { setOpen(false); navigate?.(feedbackPath); }} className={btn.chip} data-testid="assistant-opener-board">
                      See what others asked for
                    </button>
                  ) : null}
                </div>
              </div>
            ) : null}
            {messages.map((m, mi) =>
              m.role === "user" ? (
                <div key={mi} className="flex justify-end">
                  <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-primary px-3 py-2 text-[13px] leading-relaxed text-primary-foreground">{m.text}</div>
                </div>
              ) : (
                <div key={mi} className="flex flex-col items-start gap-2">
                  <div className={`max-w-[92%] whitespace-pre-wrap rounded-2xl rounded-bl-md px-3 py-2 text-[13px] leading-relaxed ${m.error ? "bg-destructive/10 text-destructive" : "bg-muted text-foreground"}`}>{m.text}</div>
                  {m.actions && m.actions.length > 0 ? (
                    <div className="flex max-w-[92%] flex-wrap gap-1.5">
                      {m.actions.map((a, ai) => {
                        const outcome = m.done?.[ai];
                        return outcome ? (
                          <span key={ai} className="rounded-full bg-emerald-500/15 px-3 py-1 text-[12px] text-emerald-700 dark:text-emerald-300">{outcome}</span>
                        ) : (
                          <button key={ai} type="button" onClick={() => void runAction(mi, ai, a)} className={btn.chip}>
                            {a.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                  {m.id && !m.error ? (
                    <div className="flex items-center gap-1 pl-1">
                      <button type="button" aria-label="Helpful" aria-pressed={m.rating === 1} onClick={() => void rate(mi, 1)} className={`${btn.icon} h-6 w-6 ${m.rating === 1 ? "text-primary" : ""}`}>
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.3a2 2 0 0 0 2-1.7l1.4-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" /></svg>
                      </button>
                      <button type="button" aria-label="Not helpful" aria-pressed={m.rating === -1} onClick={() => void rate(mi, -1)} className={`${btn.icon} h-6 w-6 ${m.rating === -1 ? "text-primary" : ""}`}>
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.7a2 2 0 0 0-2 1.7l-1.4 9a2 2 0 0 0 2 2.3H10zM17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" /></svg>
                      </button>
                    </div>
                  ) : null}
                </div>
              )
            )}
            {busy ? (
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted-foreground/40 border-t-transparent" aria-hidden />
                thinking...
              </div>
            ) : null}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="flex items-end gap-2 border-t border-border p-2.5"
          >
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={1}
              maxLength={6000}
              placeholder="Ask anything about the app..."
              aria-label="Message"
              className="max-h-32 min-h-9 flex-1 resize-none rounded-md border border-border bg-background px-3 py-2 text-[13px] placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <button type="submit" disabled={busy || !draft.trim()} className={`${btn.primary} h-9 px-3`} aria-label="Send">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" /></svg>
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}

export default AssistantDock;
