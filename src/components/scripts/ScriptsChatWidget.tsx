import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { MessageCircle, X, Send, Image, Loader2, ScrollText, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

type ChatMode = "scripts" | "objections";
type Msg = { role: "user" | "assistant"; content: string; image?: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scripts-chat`;

async function streamChat({
  messages,
  mode,
  onDelta,
  onDone,
}: {
  messages: Msg[];
  mode: ChatMode;
  onDelta: (deltaText: string) => void;
  onDone: () => void;
}) {
  const apiMessages = messages.map((m) => {
    if (m.image) {
      return {
        role: m.role,
        content: [
          { type: "text" as const, text: m.content || "Please analyze this screenshot and suggest how the consultant should respond." },
          { type: "image_url" as const, image_url: { url: m.image } },
        ],
      };
    }
    return { role: m.role, content: m.content };
  });

  const resp = await fetch(CHAT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify({ messages: apiMessages, mode }),
  });

  if (!resp.ok || !resp.body) {
    if (resp.status === 429) { toast.error("Rate limit reached. Try again shortly."); return; }
    if (resp.status === 402) { toast.error("AI credits exhausted. Please top up."); return; }
    throw new Error("Failed to start stream");
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = "";
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (line.startsWith(":") || line.trim() === "") continue;
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") { streamDone = true; break; }
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + "\n" + textBuffer;
        break;
      }
    }
  }

  if (textBuffer.trim()) {
    for (let raw of textBuffer.split("\n")) {
      if (!raw) continue;
      if (raw.endsWith("\r")) raw = raw.slice(0, -1);
      if (raw.startsWith(":") || raw.trim() === "") continue;
      if (!raw.startsWith("data: ")) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch { /* ignore */ }
    }
  }

  onDone();
}

const SCRIPTS_PROMPTS = [
  "Which script should I use for a cold call to an NSF?",
  "Give me a 2nd follow-up message for someone who hasn't replied",
  "How should I respond if they ask which company I'm from?",
  "What's a good opening text for warm market outreach?",
];

const OBJECTION_PROMPTS = [
  "They said 'I need to check with my spouse first'",
  "How do I handle 'I already have an advisor'?",
  "They ghosted after the first meeting, what do I say?",
  "Client says 'insurance is a scam', help me respond",
];

const MODE_CONFIG = {
  scripts: {
    label: "Scripts",
    icon: ScrollText,
    title: "Scripts AI Coach",
    subtitle: "Paste screenshots • Ask about scripts",
    placeholder: "Ask about scripts or paste a screenshot...",
    emptyText: "Ask about scripts, paste client screenshots, or get help crafting responses.",
  },
  objections: {
    label: "Objections",
    icon: Shield,
    title: "Objection Coach",
    subtitle: "Practice rebuttals • Handle objections",
    placeholder: "Describe the objection you're facing...",
    emptyText: "Share a prospect's objection, paste a screenshot, or practice your rebuttals.",
  },
};

interface ScriptsChatWidgetProps {
  initialMode?: ChatMode;
}

export function ScriptsChatWidget({ initialMode = "scripts" }: ScriptsChatWidgetProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>(initialMode);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pastedImage, setPastedImage] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync mode with initialMode when it changes (e.g. tab switch)
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageUpload = useCallback((file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Max 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setPastedImage(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) handleImageUpload(file);
        return;
      }
    }
  }, [handleImageUpload]);

  const switchMode = useCallback((newMode: ChatMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setMessages([]);
    setInput("");
    setPastedImage(null);
  }, [mode]);

  const send = async (text?: string) => {
    const content = text || input.trim();
    if (!content && !pastedImage) return;

    const userMsg: Msg = {
      role: "user",
      content: content || "Analyze this screenshot and suggest responses.",
      ...(pastedImage ? { image: pastedImage } : {}),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setPastedImage(null);
    setIsLoading(true);

    let assistantSoFar = "";
    const upsertAssistant = (nextChunk: string) => {
      assistantSoFar += nextChunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMsg],
        mode,
        onDelta: (chunk) => upsertAssistant(chunk),
        onDone: () => setIsLoading(false),
      });
    } catch (e) {
      console.error(e);
      setIsLoading(false);
      toast.error("Failed to get response. Please try again.");
    }
  };

  const cfg = MODE_CONFIG[mode];
  const quickPrompts = mode === "scripts" ? SCRIPTS_PROMPTS : OBJECTION_PROMPTS;
  const ModeIcon = cfg.icon;

  return createPortal(
    <>
      {/* Floating trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "fixed right-4 z-50 h-14 w-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300",
          "bottom-20 md:bottom-6",
          "bg-primary text-primary-foreground hover:scale-105"
        )}
        aria-label="Open AI Coach"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          "fixed z-50 rounded-2xl shadow-2xl border bg-card flex flex-col transition-all duration-300 origin-bottom-right",
          "bottom-20 right-2 md:bottom-6 md:right-6 w-[calc(100vw-1rem)] md:w-[380px] md:max-w-[calc(100vw-2rem)]",
          open ? "scale-100 opacity-100 h-[min(600px,70vh)] md:h-[min(600px,80vh)]" : "scale-0 opacity-0 h-0 pointer-events-none"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-primary rounded-t-2xl">
          <div className="flex items-center gap-2">
            <ModeIcon className="h-5 w-5 text-primary-foreground" />
            <div>
              <h3 className="text-sm font-semibold text-primary-foreground">{cfg.title}</h3>
              <p className="text-[10px] text-primary-foreground/70">{cfg.subtitle}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => setOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Mode toggle */}
        <div className="flex border-b bg-muted/30 p-1 gap-1">
          {(["scripts", "objections"] as const).map((m) => {
            const Icon = MODE_CONFIG[m].icon;
            return (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-medium transition-all",
                  mode === m
                    ? "bg-background shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {MODE_CONFIG[m].label}
              </button>
            );
          })}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
          {messages.length === 0 && (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-muted-foreground text-center">
                {cfg.emptyText}
              </p>
              <div className="space-y-1.5">
                {quickPrompts.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => send(q)}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg border hover:bg-muted/50 transition-colors text-foreground"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-muted text-foreground rounded-bl-sm"
                )}
              >
                {msg.image && (
                  <img src={msg.image} alt="Pasted screenshot" className="rounded-lg mb-2 max-h-40 w-auto" />
                )}
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0.5">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-xl px-3 py-2 rounded-bl-sm">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              </div>
            </div>
          )}
        </div>

        {/* Image preview */}
        {pastedImage && (
          <div className="px-3 pb-1">
            <div className="relative inline-block">
              <img src={pastedImage} alt="Preview" className="h-16 rounded-lg border" />
              <button
                onClick={() => setPastedImage(null)}
                className="absolute -top-1 -right-1 h-5 w-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-3 border-t">
          <div className="flex items-end gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
                e.target.value = "";
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => fileInputRef.current?.click()}
              title="Upload screenshot"
            >
              <Image className="h-4 w-4" />
            </Button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onPaste={handlePaste}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={cfg.placeholder}
              className="flex-1 resize-none border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring min-h-[36px] max-h-[100px]"
              rows={1}
            />
            <Button
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => send()}
              disabled={isLoading || (!input.trim() && !pastedImage)}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
}
