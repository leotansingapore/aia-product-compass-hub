import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Bot,
  X,
  Send,
  Loader2,
  MessageSquarePlus,
  ScrollText,
  Shield,
  BookOpen,
  Users,
  Trash2,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FeedbackModal } from "@/components/FeedbackButton";
import { cn } from "@/lib/utils";
import { streamAiChat, type AiChatMessage } from "@/lib/aiChatStream";
import { useAllProducts, useProductBySlugOrId } from "@/hooks/useProducts";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";

type ModeId = "ask" | "objections" | "product" | "roleplay";

type Mode = {
  id: ModeId;
  label: string;
  icon: typeof Bot;
  blurb: string;
  prompts: string[];
};

const MODES: readonly Mode[] = [
  {
    id: "ask",
    label: "Scripts",
    icon: ScrollText,
    blurb: "Openers, follow-ups and what to say next.",
    prompts: [
      "Which script should I use for a cold call to an NSF?",
      "Give me a second follow-up for someone who hasn't replied",
      "What's a good opening text for warm market outreach?",
    ],
  },
  {
    id: "objections",
    label: "Objections",
    icon: Shield,
    blurb: "Work through a real objection line by line.",
    prompts: [
      "They said they need to check with their spouse first",
      "The client says insurance is a waste of money",
      "They told me they already have enough coverage",
    ],
  },
  {
    id: "product",
    label: "Product",
    icon: BookOpen,
    blurb: "Ask about a specific plan's features and rules.",
    prompts: [
      "What does this plan actually cover?",
      "Who is this plan NOT a good fit for?",
      "How would I explain this to a first-time buyer?",
    ],
  },
  {
    id: "roleplay",
    label: "Roleplay",
    icon: Users,
    blurb: "Practise live on video with an AI client.",
    prompts: [],
  },
];

type Msg = { role: "user" | "assistant"; content: string };
type Threads = Record<ModeId, Msg[]>;

const EMPTY_THREADS: Threads = { ask: [], objections: [], product: [], roleplay: [] };
const STORAGE_KEY = "assistant-dock-threads";

function loadThreads(): Threads {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_THREADS;
    const parsed = JSON.parse(raw);
    return { ...EMPTY_THREADS, ...parsed };
  } catch {
    return EMPTY_THREADS;
  }
}

/** Pull a product slug/id out of /product/:slugOrId[/...] so the dock can
 *  scope Product mode to whatever the user is already looking at. */
function productSlugFromPath(pathname: string): string {
  const m = pathname.match(/^\/product\/([^/]+)/);
  return m ? m[1] : "";
}

export function AssistantDock() {
  const { user } = useSimplifiedAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ModeId>("ask");
  const [threads, setThreads] = useState<Threads>(EMPTY_THREADS);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  // The standalone floating Feedback button was retired in favour of this
  // dock — one launcher in the corner instead of two. Feedback lives in the
  // panel header so desktop keeps a route to it (mobile also has the entry in
  // MobileBottomNav).
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const abortRef = useRef<AbortController | null>(null);
  /** Throttles how often a streaming answer is checkpointed to localStorage. */
  const lastStreamPersistRef = useRef(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Both hooks return named keys (`product` / `allProducts`), not react-query's
  // raw `data` — destructuring `data` here silently left the picker empty.
  const routeSlug = productSlugFromPath(location.pathname);
  const { product: routeProduct } = useProductBySlugOrId(routeSlug);
  const { allProducts } = useAllProducts();

  useEffect(() => {
    setThreads(loadThreads());
  }, []);

  // Scope Product mode to the product page the user is on, without clobbering
  // a pick they made by hand.
  useEffect(() => {
    if (routeProduct?.id) setSelectedProductId(routeProduct.id);
  }, [routeProduct?.id]);

  const messages = threads[mode] ?? [];
  const activeMode = MODES.find((m) => m.id === mode)!;

  // Always derive from the latest state. Taking `threads` from the render
  // closure meant a click that landed after a streamed reply wrote back the
  // pre-stream snapshot — which is why Clear appeared to do nothing.
  const persist = useCallback((update: (prev: Threads) => Threads) => {
    setThreads((prev) => {
      const next = update(prev);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Private mode / quota: the thread still works for this session.
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [threads, open, mode, busy]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || busy) return;

      if (mode === "product" && !selectedProductId) {
        toast.error("Pick a product first so the answer is grounded in the right plan.");
        return;
      }

      const base = threads[mode] ?? [];
      const withUser: Msg[] = [...base, { role: "user", content: text }];
      persist((prev) => ({ ...prev, [mode]: withUser }));
      setInput("");
      setBusy(true);

      const controller = new AbortController();
      abortRef.current = controller;
      // Reset so this answer's first delta always checkpoints, rather than
      // being throttled by the previous answer's timestamp.
      lastStreamPersistRef.current = 0;

      let acc = "";
      try {
        const apiMessages: AiChatMessage[] = withUser.map((m) => ({
          role: m.role,
          content: m.content,
        }));
        const fn = mode === "product" ? "product-knowledge-chat" : "scripts-chat";
        const body =
          mode === "product"
            ? { productId: selectedProductId, mode: "knowledge" }
            : { mode: mode === "objections" ? "objections" : "scripts" };

        await streamAiChat({
          fn,
          messages: apiMessages,
          body,
          signal: controller.signal,
          onDelta: (delta) => {
            acc += delta;
            const next: Msg[] = [...withUser, { role: "assistant", content: acc }];
            // Checkpoint the partial answer to storage as it streams, at most
            // once a second. A plain setThreads here keeps the text in React
            // state only, so reloading or closing the tab mid-answer left the
            // question in the thread with the reply gone — the learner saw
            // their own message hanging with no response. Throttled because a
            // token-rate localStorage write would serialise the whole store
            // dozens of times a second.
            const now = Date.now();
            if (now - lastStreamPersistRef.current > 1000) {
              lastStreamPersistRef.current = now;
              persist((prev) => ({ ...prev, [mode]: next }));
            } else {
              setThreads((prev) => ({ ...prev, [mode]: next }));
            }
          },
        });

        persist((prev) => ({
          ...prev,
          [mode]: acc
            ? [...withUser, { role: "assistant" as const, content: acc }]
            : withUser,
        }));
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        toast.error("The assistant couldn't answer just now. Try again.");
        persist((prev) => ({ ...prev, [mode]: base }));
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [busy, mode, persist, selectedProductId, threads],
  );

  const clearThread = useCallback(() => {
    persist((prev) => ({ ...prev, [mode]: [] }));
  }, [mode, persist]);

  const productName = useMemo(() => {
    if (!selectedProductId) return "";
    return allProducts?.find((p) => p.id === selectedProductId)?.title ?? "";
  }, [allProducts, selectedProductId]);

  // Signed-out visitors get the marketing page, not an assistant.
  if (!user) return null;

  const onCmfas = location.pathname.startsWith("/cmfas");

  const launcher = (
    <button
      type="button"
      onClick={() => {
        setOpen((v) => !v);
        setTimeout(() => inputRef.current?.focus(), 120);
      }}
      aria-label={open ? "Close AI assistant" : "Open AI assistant"}
      aria-expanded={open}
      className={cn(
        "fixed z-[9995] flex items-center justify-center rounded-full shadow-lg transition-all",
        "bg-primary text-primary-foreground hover:brightness-110 focus:outline-none",
        "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "h-14 w-14 right-4 md:right-6",
        // Mobile always clears MobileBottomNav. On desktop the dock now owns
        // the bottom-right corner the Feedback button used to hold — except on
        // /cmfas, where CMFASHubChatFAB already sits at sm:bottom-8 and the two
        // would overlap, so the dock stacks above it there.
        onCmfas ? "bottom-24 md:bottom-24" : "bottom-24 md:bottom-6",
      )}
    >
      {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
    </button>
  );

  const panel = open && (
    <div
      role="dialog"
      aria-label="AI assistant"
      className={cn(
        "fixed z-[9994] flex flex-col overflow-hidden rounded-xl border bg-background shadow-2xl",
        "inset-x-3 bottom-40 top-16",
        // The panel sits directly above its launcher, so it follows the same
        // /cmfas offset rule — otherwise it would cover its own close button.
        onCmfas
          ? "sm:inset-x-auto sm:top-auto sm:right-6 sm:bottom-40 sm:h-[560px] sm:w-[400px]"
          : "sm:inset-x-auto sm:top-auto sm:right-6 sm:bottom-24 sm:h-[560px] sm:w-[400px]",
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Bot className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate text-sm font-semibold">AI assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setFeedbackOpen(true)}
            aria-label="Send feedback"
            title="Send feedback"
            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
          </button>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearThread}
              aria-label="Clear this conversation"
              className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close AI assistant"
            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        role="tablist"
        aria-label="Assistant modes"
        className="flex shrink-0 gap-1 overflow-x-auto border-b bg-muted/30 px-2 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {MODES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={mode === id}
            onClick={() => setMode(id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
              mode === id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {mode === "roleplay" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
          <Users className="h-8 w-8 text-primary" />
          <p className="text-sm text-muted-foreground">
            Roleplay runs as a live video conversation with an AI client, so it opens in
            its own room rather than this panel.
          </p>
          <Button
            onClick={() => {
              setOpen(false);
              navigate("/roleplay");
            }}
          >
            Open roleplay
          </Button>
        </div>
      ) : (
        <>
          {mode === "product" && (
            <div className="shrink-0 border-b px-3 py-2">
              <label
                htmlFor="assistant-product"
                className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Answering about
              </label>
              <select
                id="assistant-product"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-2 py-1.5 text-xs"
              >
                <option value="">Select a product…</option>
                {(allProducts ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3">
            {messages.length === 0 ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground">{activeMode.blurb}</p>
                {mode === "product" && productName && (
                  <p className="text-xs text-muted-foreground">
                    Scoped to <span className="font-medium text-foreground">{productName}</span>.
                  </p>
                )}
                {activeMode.prompts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => send(p)}
                    className="rounded-lg border bg-muted/30 px-3 py-2 text-left text-xs hover:bg-muted"
                  >
                    {p}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {messages.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      "max-w-[92%] rounded-lg px-3 py-2 text-xs",
                      m.role === "user"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted",
                    )}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-xs dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      m.content
                    )}
                  </div>
                ))}
                {busy && messages[messages.length - 1]?.role === "user" && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Thinking…
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="shrink-0 border-t p-2">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                rows={1}
                placeholder={`Ask the ${activeMode.label.toLowerCase()} assistant…`}
                aria-label="Message the assistant"
                className="max-h-28 min-h-[36px] flex-1 resize-none rounded-md border bg-background px-2.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button
                size="icon"
                className="h-9 w-9 shrink-0"
                disabled={busy || !input.trim()}
                onClick={() => send(input)}
                aria-label="Send message"
              >
                {busy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="mt-1.5 px-0.5 text-[10px] leading-tight text-muted-foreground">
              AI answers can be wrong. Verify against the product summary before using
              anything with a client. Never paste NRIC or bank details.
            </p>
          </div>
        </>
      )}
    </div>
  );

  return createPortal(
    <>
      {launcher}
      {panel}
      <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </>,
    document.body,
  );
}

export default AssistantDock;
