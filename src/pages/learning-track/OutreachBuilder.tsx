import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, CheckCircle2, Plus, Trash2, FileSpreadsheet, MessageSquare, Sparkles, Edit3, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";

type Temperature = "hot" | "semi-warm" | "cold-referral" | "cold-stranger";
type Channel = "whatsapp" | "telegram" | "ig" | "linkedin" | "sms" | "email";
type Status = "new" | "sent" | "replied" | "booked" | "passed";

type Prospect = {
  id: string;
  name: string;
  temperature: Temperature;
  hook: string;
  channel: Channel;
  referrer?: string;
  notes?: string;
  status: Status;
  customMessage?: string;
};

const STORAGE_PREFIX = "outreach-builder-v1";
const SETTINGS_PREFIX = "outreach-builder-settings-v1";

const TEMP_LABEL: Record<Temperature, string> = {
  "hot": "Hot — close",
  "semi-warm": "Semi-warm — reconnect",
  "cold-referral": "Cold — referral",
  "cold-stranger": "Cold — stranger",
};

const TEMP_BADGE: Record<Temperature, string> = {
  "hot": "bg-rose-500/15 text-rose-700 border-rose-500/30 dark:text-rose-300",
  "semi-warm": "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300",
  "cold-referral": "bg-sky-500/15 text-sky-700 border-sky-500/30 dark:text-sky-300",
  "cold-stranger": "bg-slate-500/15 text-slate-700 border-slate-500/30 dark:text-slate-300",
};

const STATUS_LABEL: Record<Status, string> = {
  "new": "Not sent",
  "sent": "Sent",
  "replied": "Replied",
  "booked": "Booked",
  "passed": "Passed",
};

const STATUS_BADGE: Record<Status, string> = {
  "new": "bg-muted text-muted-foreground border-border",
  "sent": "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-300",
  "replied": "bg-violet-500/15 text-violet-700 border-violet-500/30 dark:text-violet-300",
  "booked": "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300",
  "passed": "bg-stone-500/15 text-stone-700 border-stone-500/30 dark:text-stone-300",
};

const CHANNEL_LABEL: Record<Channel, string> = {
  whatsapp: "WhatsApp",
  telegram: "Telegram",
  ig: "Instagram DM",
  linkedin: "LinkedIn",
  sms: "SMS",
  email: "Email",
};

// ============ TEMPLATE GENERATION ============

function pickFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] || name.trim();
}

function generateMessage(p: Prospect, advisorName: string): string {
  const first = pickFirstName(p.name);
  const advisor = advisorName.trim() || "[Your name]";
  const hook = p.hook?.trim();
  const referrer = p.referrer?.trim();
  const channel = p.channel;

  // Channel tone — IG/LinkedIn/email tend to be slightly more formal openers,
  // WhatsApp/Telegram/SMS more casual. Templates default to casual; adjust the
  // opener for the more formal channels.
  const formalOpener = channel === "linkedin" || channel === "email";

  switch (p.temperature) {
    case "hot": {
      const opener = formalOpener
        ? `Hi ${first},`
        : `Hey ${first}!`;
      const reason = hook ? ` ${hook}.` : "";
      return `${opener} long time no proper catch-up.${reason}\n\nWanted to share — I've recently moved into financial advisory, and I'm spending the first few months sitting down with the people closest to me to understand where they actually are with money (no pitch, no agenda). You're one of the first I thought of.\n\nFree for a coffee or a quick call in the next two weeks?\n\n${advisor}`;
    }

    case "semi-warm": {
      const opener = formalOpener
        ? `Hi ${first}, hope this finds you well.`
        : `Hey ${first}, hope you're well!`;
      const reason = hook
        ? ` ${hook} — got me thinking I haven't said hi properly in ages.`
        : ` Realised it's been ages since we properly caught up.`;
      return `${opener}${reason}\n\nNot reaching out for anything specific — just want to reconnect and hear what you've been up to. If you're up for a 20-min coffee or even a phone call in the next couple of weeks, would love that.\n\nIf the timing's bad, no worries at all. Just let me know.\n\n${advisor}`;
    }

    case "cold-referral": {
      const intro = referrer
        ? `${referrer} mentioned you'd be a great person to connect with`
        : `[a mutual contact] mentioned you'd be a great person to connect with`;
      const reason = hook ? ` — specifically because ${hook}.` : ".";
      return `Hi ${first}, my name is ${advisor}. ${intro}${reason}\n\nNo agenda from my side — I'm a financial advisor and I make it a point to actually meet the people ${referrer || "they"} introduce me to before doing anything else. If you'd be open to a 20-min coffee or call sometime in the next two weeks, would love to say hi.\n\nIf now's not a good time, completely understand.\n\nThanks,\n${advisor}`;
    }

    case "cold-stranger": {
      const intro = hook
        ? `Came across your profile and noticed ${hook}.`
        : `Came across your profile and wanted to reach out.`;
      return `Hi ${first}, my name is ${advisor}. ${intro}\n\nI'm a financial advisor based in Singapore and I've been making it a habit to connect with people whose work I find interesting — no pitch, just a chat. Would you be open to a 15-min virtual coffee or call sometime in the next two weeks?\n\nIf the timing's off or it's not your thing, completely fine — appreciate you reading this.\n\nThanks,\n${advisor}`;
    }
  }
}

// ============ CSV PARSING ============

function parseCsv(raw: string): Partial<Prospect>[] {
  const text = raw.trim();
  if (!text) return [];

  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];

  // Detect delimiter: prefer tab (Google Sheets paste), then comma.
  const firstLine = lines[0];
  const delimiter = firstLine.includes("\t") ? "\t" : ",";

  // Robust-enough CSV split — handles quoted fields with embedded commas.
  const splitRow = (row: string): string[] => {
    if (delimiter === "\t") return row.split("\t").map((c) => c.trim());
    const out: string[] = [];
    let cur = "";
    let inQuote = false;
    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      if (ch === '"') {
        if (inQuote && row[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuote = !inQuote;
        }
      } else if (ch === "," && !inQuote) {
        out.push(cur.trim());
        cur = "";
      } else {
        cur += ch;
      }
    }
    out.push(cur.trim());
    return out;
  };

  const rawHeader = splitRow(lines[0]).map((h) => h.toLowerCase());

  // Header detection: if no header-like words in the first row, assume no
  // header and treat row 0 as data, mapping column 0 → name.
  const HEADER_WORDS = ["name", "temperature", "temp", "hook", "channel", "referrer", "notes", "ring"];
  const looksLikeHeader = rawHeader.some((c) => HEADER_WORDS.includes(c));

  const headers = looksLikeHeader ? rawHeader : ["name"];
  const dataLines = looksLikeHeader ? lines.slice(1) : lines;

  const idx = (key: string): number => {
    for (let i = 0; i < headers.length; i++) {
      if (headers[i] === key || headers[i].includes(key)) return i;
    }
    return -1;
  };

  const i_name = idx("name");
  const i_temp = idx("temperature") >= 0 ? idx("temperature") : idx("temp") >= 0 ? idx("temp") : idx("ring");
  const i_hook = idx("hook");
  const i_channel = idx("channel");
  const i_referrer = idx("referrer");
  const i_notes = idx("notes");

  const normTemp = (v: string | undefined): Temperature => {
    const s = (v ?? "").toLowerCase().trim();
    if (s.startsWith("hot") || s.includes("close") || s.includes("priority a")) return "hot";
    if (s.startsWith("cold") && s.includes("ref")) return "cold-referral";
    if (s.startsWith("cold")) return "cold-stranger";
    if (s.includes("warm") || s.startsWith("semi")) return "semi-warm";
    return "semi-warm";
  };

  const normChannel = (v: string | undefined): Channel => {
    const s = (v ?? "").toLowerCase().trim();
    if (s.includes("whatsapp") || s.includes("wa")) return "whatsapp";
    if (s.includes("telegram") || s.includes("tele") || s.includes("tg")) return "telegram";
    if (s.includes("ig") || s.includes("insta")) return "ig";
    if (s.includes("linkedin") || s.includes("li")) return "linkedin";
    if (s.includes("email") || s.includes("mail")) return "email";
    if (s.includes("sms") || s.includes("text")) return "sms";
    return "whatsapp";
  };

  const out: Partial<Prospect>[] = [];
  for (const line of dataLines) {
    const cols = splitRow(line);
    const name = (i_name >= 0 ? cols[i_name] : cols[0])?.trim();
    if (!name) continue;
    out.push({
      name,
      temperature: normTemp(i_temp >= 0 ? cols[i_temp] : undefined),
      hook: (i_hook >= 0 ? cols[i_hook] : "")?.trim() || "",
      channel: normChannel(i_channel >= 0 ? cols[i_channel] : undefined),
      referrer: (i_referrer >= 0 ? cols[i_referrer] : "")?.trim() || undefined,
      notes: (i_notes >= 0 ? cols[i_notes] : "")?.trim() || undefined,
    });
  }
  return out;
}

// ============ MAIN COMPONENT ============

export default function OutreachBuilder() {
  const { user } = useSimplifiedAuth();
  const userId = user?.id ?? "anon";
  const storageKey = `${STORAGE_PREFIX}-${userId}`;
  const settingsKey = `${SETTINGS_PREFIX}-${userId}`;

  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [advisorName, setAdvisorName] = useState("");
  const [csvText, setCsvText] = useState("");
  const [showCsv, setShowCsv] = useState(false);
  const [editing, setEditing] = useState<Prospect | null>(null);
  const [filter, setFilter] = useState<"all" | Status>("all");
  const hasHydrated = useRef(false);

  // Hydrate
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setProspects(parsed);
      }
      const settings = localStorage.getItem(settingsKey);
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed?.advisorName) setAdvisorName(parsed.advisorName);
      }
    } catch (e) {
      console.warn("Outreach builder: hydration failed", e);
    } finally {
      hasHydrated.current = true;
    }
  }, [storageKey, settingsKey]);

  // Persist
  useEffect(() => {
    if (typeof window === "undefined" || !hasHydrated.current) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(prospects));
    } catch (e) {
      console.warn("Outreach builder: persist failed", e);
    }
  }, [prospects, storageKey]);

  useEffect(() => {
    if (typeof window === "undefined" || !hasHydrated.current) return;
    try {
      localStorage.setItem(settingsKey, JSON.stringify({ advisorName }));
    } catch (e) {
      console.warn("Outreach builder: settings persist failed", e);
    }
  }, [advisorName, settingsKey]);

  const visible = useMemo(() => {
    if (filter === "all") return prospects;
    return prospects.filter((p) => p.status === filter);
  }, [prospects, filter]);

  const counts = useMemo(() => {
    const c: Record<Status | "all", number> = { all: prospects.length, new: 0, sent: 0, replied: 0, booked: 0, passed: 0 };
    for (const p of prospects) c[p.status]++;
    return c;
  }, [prospects]);

  const addBlank = () => {
    const p: Prospect = {
      id: crypto.randomUUID(),
      name: "",
      temperature: "semi-warm",
      hook: "",
      channel: "whatsapp",
      status: "new",
    };
    setProspects((prev) => [p, ...prev]);
    setEditing(p);
  };

  const importCsv = () => {
    const parsed = parseCsv(csvText);
    if (parsed.length === 0) {
      toast.error("Couldn't find any rows. Make sure your paste has at least a Name column.");
      return;
    }
    const newProspects: Prospect[] = parsed.map((p) => ({
      id: crypto.randomUUID(),
      name: p.name ?? "",
      temperature: p.temperature ?? "semi-warm",
      hook: p.hook ?? "",
      channel: p.channel ?? "whatsapp",
      referrer: p.referrer,
      notes: p.notes,
      status: "new" as Status,
    }));
    setProspects((prev) => [...newProspects, ...prev]);
    setCsvText("");
    setShowCsv(false);
    toast.success(`Imported ${newProspects.length} prospect${newProspects.length === 1 ? "" : "s"}.`);
  };

  const updateProspect = (id: string, patch: Partial<Prospect>) => {
    setProspects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const deleteProspect = (id: string) => {
    setProspects((prev) => prev.filter((p) => p.id !== id));
    if (editing?.id === id) setEditing(null);
  };

  const copyMessage = async (p: Prospect) => {
    const msg = p.customMessage ?? generateMessage(p, advisorName);
    try {
      await navigator.clipboard.writeText(msg);
      toast.success(`Copied message for ${p.name || "prospect"}.`);
      if (p.status === "new") updateProspect(p.id, { status: "sent" });
    } catch {
      toast.error("Couldn't copy. Try selecting the message and copying manually.");
    }
  };

  const clearAll = () => {
    if (!confirm("Delete every prospect from this device? Your Project 100 sheet is unaffected.")) return;
    setProspects([]);
    toast.success("Cleared.");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6" data-testid="outreach-builder">
      <div className="flex items-center justify-between gap-3">
        <Link
          to="/learning-track/pre-rnf/assignments/assignment-02"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Assignment 2
        </Link>
        {prospects.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear all
          </Button>
        )}
      </div>

      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary mb-1">
          <Sparkles className="h-3 w-3" /> Outreach builder
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-semibold tracking-tight">Generate first-message templates per prospect</h1>
        <p className="mt-2 text-muted-foreground text-sm sm:text-base">
          Paste rows from your Project 100 sheet (or add prospects one at a time). The tool generates a starter message per row based on temperature and channel — edit before sending, then one-tap copy to WhatsApp / Telegram / wherever.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Your name (used in every message)</CardTitle>
          <CardDescription className="text-xs">Saved on this device, never sent anywhere.</CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            value={advisorName}
            onChange={(e) => setAdvisorName(e.target.value)}
            placeholder="e.g. Leo"
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle className="text-base">Add prospects</CardTitle>
              <CardDescription className="text-xs">
                Paste from Sheets (tab-separated) or upload one at a time.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowCsv((v) => !v)}>
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1" /> Paste CSV
              </Button>
              <Button size="sm" onClick={addBlank}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add one
              </Button>
            </div>
          </div>
        </CardHeader>
        {showCsv && (
          <CardContent className="space-y-3 pt-0">
            <div className="rounded-md border bg-muted/30 p-3 text-xs space-y-1.5">
              <p className="font-medium">Expected columns (in any order, header row optional):</p>
              <p className="text-muted-foreground">
                <code>Name</code>, <code>Temperature</code> (hot / semi-warm / cold-referral / cold-stranger), <code>Hook</code>, <code>Channel</code> (whatsapp / telegram / ig / linkedin / sms / email), <code>Referrer</code>, <code>Notes</code>
              </p>
              <p className="text-muted-foreground">
                Only <code>Name</code> is required — the rest will get sensible defaults.
              </p>
            </div>
            <Textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={"Name\tTemperature\tHook\tChannel\nJohn Tan\tsemi-warm\tjust had a baby\twhatsapp\nMei Lin\thot\tsaw she got promoted\ttelegram"}
              rows={6}
              className="font-mono text-xs"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" onClick={() => { setCsvText(""); setShowCsv(false); }}>
                Cancel
              </Button>
              <Button size="sm" onClick={importCsv} disabled={!csvText.trim()}>
                Import
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {prospects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            <MessageSquare className="h-8 w-8 mx-auto mb-3 opacity-50" />
            No prospects yet. Paste your Project 100 sheet above, or add one to get started.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap gap-1.5">
            {(["all", "new", "sent", "replied", "booked", "passed"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  filter === s
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background hover:bg-muted",
                )}
              >
                {s === "all" ? "All" : STATUS_LABEL[s]}
                <span className="tabular-nums opacity-70">{counts[s]}</span>
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {visible.map((p) => (
              <ProspectCard
                key={p.id}
                p={p}
                advisorName={advisorName}
                onEdit={() => setEditing(p)}
                onCopy={() => copyMessage(p)}
                onDelete={() => deleteProspect(p.id)}
                onStatus={(status) => updateProspect(p.id, { status })}
              />
            ))}
          </div>
        </>
      )}

      <EditDialog
        prospect={editing}
        advisorName={advisorName}
        onClose={() => setEditing(null)}
        onSave={(patch) => {
          if (editing) updateProspect(editing.id, patch);
          setEditing(null);
        }}
      />
    </div>
  );
}

// ============ PROSPECT CARD ============

function ProspectCard({
  p,
  advisorName,
  onEdit,
  onCopy,
  onDelete,
  onStatus,
}: {
  p: Prospect;
  advisorName: string;
  onEdit: () => void;
  onCopy: () => void;
  onDelete: () => void;
  onStatus: (s: Status) => void;
}) {
  const message = p.customMessage ?? generateMessage(p, advisorName);
  const [showFull, setShowFull] = useState(false);

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-base">{p.name || "(no name)"}</span>
              <Badge variant="outline" className={cn("text-[10px] font-medium", TEMP_BADGE[p.temperature])}>
                {TEMP_LABEL[p.temperature]}
              </Badge>
              <Badge variant="outline" className="text-[10px]">
                {CHANNEL_LABEL[p.channel]}
              </Badge>
              {p.customMessage && (
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300">
                  Edited
                </Badge>
              )}
            </div>
            {(p.hook || p.referrer) && (
              <div className="mt-1 text-xs text-muted-foreground">
                {p.referrer && <span>Referred by {p.referrer}. </span>}
                {p.hook && <span>{p.hook}</span>}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Select value={p.status} onValueChange={(v) => onStatus(v as Status)}>
              <SelectTrigger className={cn("h-7 text-xs w-auto gap-1.5 px-2", STATUS_BADGE[p.status])}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(STATUS_LABEL) as Status[]).map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={onEdit} title="Edit">
              <Edit3 className="h-3.5 w-3.5" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 hover:text-destructive" onClick={onDelete} title="Delete">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        <div className="rounded-md border bg-muted/30 p-3 text-sm whitespace-pre-wrap font-sans">
          {showFull ? message : truncate(message, 240)}
          {message.length > 240 && (
            <button
              onClick={() => setShowFull((v) => !v)}
              className="ml-1 text-xs text-primary hover:underline"
            >
              {showFull ? "Show less" : "Show full"}
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={onCopy} className="gap-1.5">
            <Copy className="h-3.5 w-3.5" /> Copy message
          </Button>
          <Button size="sm" variant="outline" onClick={onEdit} className="gap-1.5">
            <Edit3 className="h-3.5 w-3.5" /> Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n) + "…";
}

// ============ EDIT DIALOG ============

function EditDialog({
  prospect,
  advisorName,
  onClose,
  onSave,
}: {
  prospect: Prospect | null;
  advisorName: string;
  onClose: () => void;
  onSave: (patch: Partial<Prospect>) => void;
}) {
  const [name, setName] = useState("");
  const [temperature, setTemperature] = useState<Temperature>("semi-warm");
  const [hook, setHook] = useState("");
  const [channel, setChannel] = useState<Channel>("whatsapp");
  const [referrer, setReferrer] = useState("");
  const [notes, setNotes] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [useCustom, setUseCustom] = useState(false);

  useEffect(() => {
    if (!prospect) return;
    setName(prospect.name);
    setTemperature(prospect.temperature);
    setHook(prospect.hook);
    setChannel(prospect.channel);
    setReferrer(prospect.referrer ?? "");
    setNotes(prospect.notes ?? "");
    setCustomMessage(prospect.customMessage ?? "");
    setUseCustom(Boolean(prospect.customMessage));
  }, [prospect]);

  if (!prospect) return null;

  const previewProspect: Prospect = {
    ...prospect,
    name,
    temperature,
    hook,
    channel,
    referrer: referrer || undefined,
  };
  const previewMessage = useCustom && customMessage
    ? customMessage
    : generateMessage(previewProspect, advisorName);

  const handleSave = () => {
    onSave({
      name,
      temperature,
      hook,
      channel,
      referrer: referrer || undefined,
      notes: notes || undefined,
      customMessage: useCustom && customMessage ? customMessage : undefined,
    });
  };

  return (
    <Dialog open={Boolean(prospect)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit prospect</DialogTitle>
          <DialogDescription>
            Tone, hook and channel feed the auto-generated message. Override the message itself if you want to customise further.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ob-name">Name</Label>
              <Input id="ob-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="ob-temp">Temperature</Label>
              <Select value={temperature} onValueChange={(v) => setTemperature(v as Temperature)}>
                <SelectTrigger id="ob-temp"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(TEMP_LABEL) as Temperature[]).map((t) => (
                    <SelectItem key={t} value={t}>{TEMP_LABEL[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="ob-channel">Channel</Label>
              <Select value={channel} onValueChange={(v) => setChannel(v as Channel)}>
                <SelectTrigger id="ob-channel"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(CHANNEL_LABEL) as Channel[]).map((c) => (
                    <SelectItem key={c} value={c}>{CHANNEL_LABEL[c]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {temperature === "cold-referral" && (
              <div>
                <Label htmlFor="ob-ref">Referred by</Label>
                <Input id="ob-ref" value={referrer} onChange={(e) => setReferrer(e.target.value)} placeholder="e.g. Sarah Lim" />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="ob-hook">Hook / context</Label>
            <Input id="ob-hook" value={hook} onChange={(e) => setHook(e.target.value)} placeholder="e.g. just had a baby, recently switched jobs" />
            <p className="text-[11px] text-muted-foreground mt-1">A specific reason to reach out — life event, recent post, mutual context. Lowercase, naturally placed mid-sentence.</p>
          </div>

          <div>
            <Label htmlFor="ob-notes">Private notes (not in message)</Label>
            <Textarea id="ob-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="What you remember about them, history, anything to flag" />
          </div>

          <div className="rounded-md border bg-muted/20 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wider">Message preview</Label>
              <button
                onClick={() => setUseCustom((v) => !v)}
                className="text-xs text-primary hover:underline"
              >
                {useCustom ? "Use auto-generated" : "Customise"}
              </button>
            </div>
            {useCustom ? (
              <Textarea
                value={customMessage || previewMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={10}
                className="font-mono text-xs"
              />
            ) : (
              <div className="text-sm whitespace-pre-wrap">{previewMessage}</div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose}><X className="h-4 w-4 mr-1" /> Cancel</Button>
          <Button onClick={handleSave}><CheckCircle2 className="h-4 w-4 mr-1" /> Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
