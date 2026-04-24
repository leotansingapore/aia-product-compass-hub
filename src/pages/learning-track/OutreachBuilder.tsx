import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Copy, CheckCircle2, Plus, Trash2, FileSpreadsheet, MessageSquare, Sparkles, Edit3, X, Send, Bell, Search } from "lucide-react";
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
  /** Phone (WA/SMS), @handle (IG/Telegram), email, or profile URL (LinkedIn). Used for deep-link sends. */
  contact?: string;
  referrer?: string;
  notes?: string;
  status: Status;
  customMessage?: string;
  /** ISO timestamp of the most recent "sent" transition — used for the follow-up nudge. */
  sentAt?: string;
  /** How many follow-up messages have already been generated for this prospect (0..3). */
  followUpCount?: number;
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

// ============ DEEP-LINK GENERATION ============

/**
 * Returns a one-tap-send URL for the chosen channel + contact, or `null`
 * if the channel can't open a pre-filled compose flow (e.g. IG DM, which
 * Meta does not allow text-prefill on). For channels that require a contact
 * to pre-fill (SMS, email, WhatsApp number), falls back to a `share`-style
 * URL where possible so the message text is always preserved.
 */
function getSendUrl(channel: Channel, contact: string | undefined, message: string): { url: string; opensCompose: boolean } | null {
  const text = encodeURIComponent(message);
  const c = (contact ?? "").trim();
  switch (channel) {
    case "whatsapp": {
      // wa.me accepts an international number with no leading + and no spaces.
      const num = c.replace(/[^\d]/g, "");
      const target = num ? num : "";
      return { url: `https://wa.me/${target}?text=${text}`, opensCompose: Boolean(num) };
    }
    case "telegram": {
      // Telegram's `share/url` flow accepts text but not a target user, so
      // contacting a known @username is a two-step UX.
      const handle = c.replace(/^@/, "");
      if (handle) {
        return { url: `https://t.me/${handle}`, opensCompose: false };
      }
      return { url: `https://t.me/share/url?url=&text=${text}`, opensCompose: true };
    }
    case "sms": {
      const num = c.replace(/[^\d+]/g, "");
      if (!num) return null;
      // iOS uses `&body=`; the spec is messy. Both forms work on most stacks.
      return { url: `sms:${num}?&body=${text}`, opensCompose: true };
    }
    case "email": {
      const subj = encodeURIComponent("Hi — quick hello");
      if (c) return { url: `mailto:${c}?subject=${subj}&body=${text}`, opensCompose: true };
      return { url: `mailto:?subject=${subj}&body=${text}`, opensCompose: true };
    }
    case "ig": {
      // Instagram DMs cannot be pre-filled. Open the profile if we know the
      // handle; otherwise no deep link is useful.
      const handle = c.replace(/^@/, "").trim();
      if (!handle) return null;
      return { url: `https://instagram.com/${handle}`, opensCompose: false };
    }
    case "linkedin": {
      // LinkedIn messaging cannot be pre-filled. If contact looks like a URL,
      // open it; otherwise treat as a vanity slug.
      if (!c) return null;
      const url = c.startsWith("http") ? c : `https://linkedin.com/in/${c.replace(/^\/+/, "")}`;
      return { url, opensCompose: false };
    }
  }
}

// ============ FOLLOW-UP TEMPLATES ============

function generateFollowUp(p: Prospect, advisorName: string, index: number): string {
  const first = pickFirstName(p.name);
  const advisor = advisorName.trim() || "[Your name]";
  // index 0 = day 3 nudge, 1 = day 7 nudge, 2 = day 30 final
  if (index === 0) {
    return `Hey ${first}, just bumping this back to the top in case it got buried 👆 totally fine if the timing's bad — just let me know either way!\n\n${advisor}`;
  }
  if (index === 1) {
    return `Hi ${first}, no rush at all on this — last bump for now. If the next two weeks are bad, say the word and I'll circle back later in the year. Otherwise still happy to grab that coffee whenever you've got 20 min.\n\n${advisor}`;
  }
  return `Hi ${first}, last nudge from me on this one — totally OK if now's not the right time, just don't want to keep messaging if it's a no. Either way, take care and stay well.\n\n${advisor}`;
}

function daysSince(iso: string | undefined): number | null {
  if (!iso) return null;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.floor((Date.now() - t) / 86_400_000);
}

function relativeAgo(days: number): string {
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 14) return "1 week ago";
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  return `${Math.floor(days / 30)} months ago`;
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
  const HEADER_WORDS = ["name", "temperature", "temp", "hook", "channel", "referrer", "notes", "ring", "contact", "phone", "handle", "number"];
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
  const i_contact = idx("contact") >= 0 ? idx("contact") : idx("phone") >= 0 ? idx("phone") : idx("handle") >= 0 ? idx("handle") : idx("number");

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
      contact: (i_contact >= 0 ? cols[i_contact] : "")?.trim() || undefined,
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
  const [search, setSearch] = useState("");
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
    let list = prospects;
    if (filter !== "all") list = list.filter((p) => p.status === filter);
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.hook ?? "").toLowerCase().includes(q) ||
          (p.referrer ?? "").toLowerCase().includes(q) ||
          (p.notes ?? "").toLowerCase().includes(q),
      );
    }
    return list;
  }, [prospects, filter, search]);

  const counts = useMemo(() => {
    const c: Record<Status | "all", number> = { all: prospects.length, new: 0, sent: 0, replied: 0, booked: 0, passed: 0 };
    for (const p of prospects) c[p.status]++;
    return c;
  }, [prospects]);

  const stats = useMemo(() => {
    const totalSent = counts.sent + counts.replied + counts.booked + counts.passed;
    const repliedOrBetter = counts.replied + counts.booked;
    const replyRate = totalSent > 0 ? Math.round((repliedOrBetter / totalSent) * 100) : 0;
    const bookRate = totalSent > 0 ? Math.round((counts.booked / totalSent) * 100) : 0;
    const sentToday = prospects.filter((p) => {
      if (!p.sentAt) return false;
      return new Date(p.sentAt).toDateString() === new Date().toDateString();
    }).length;
    const needsFollowUp = prospects.filter((p) => {
      if (p.status !== "sent") return false;
      const d = daysSince(p.sentAt);
      return d !== null && d >= 3;
    }).length;
    return { totalSent, repliedOrBetter, replyRate, bookRate, sentToday, needsFollowUp };
  }, [counts, prospects]);

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
      contact: p.contact,
      status: "new" as Status,
    }));
    setProspects((prev) => [...newProspects, ...prev]);
    setCsvText("");
    setShowCsv(false);
    toast.success(`Imported ${newProspects.length} prospect${newProspects.length === 1 ? "" : "s"}.`);
  };

  const updateProspect = (id: string, patch: Partial<Prospect>) => {
    setProspects((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const next = { ...p, ...patch };
        // Stamp sentAt the first time status transitions to "sent" so we can
        // surface "sent X days ago" / suggest follow-ups later.
        if (patch.status === "sent" && !p.sentAt) {
          next.sentAt = new Date().toISOString();
        }
        return next;
      }),
    );
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

  const sendViaChannel = async (p: Prospect) => {
    const msg = p.customMessage ?? generateMessage(p, advisorName);
    const link = getSendUrl(p.channel, p.contact, msg);
    if (!link) {
      // Fall back: copy to clipboard, since IG/LinkedIn etc. don't accept
      // pre-filled compose URLs without a known handle.
      await copyMessage(p);
      toast.message(`${CHANNEL_LABEL[p.channel]} can't open pre-filled — message copied so you can paste it.`);
      return;
    }
    if (!link.opensCompose) {
      // Profile/handle link only — copy the message too so they can paste once
      // the channel opens.
      try {
        await navigator.clipboard.writeText(msg);
      } catch {
        /* clipboard may be blocked; user can long-press */
      }
      toast.message("Message copied — paste it in once the chat opens.");
    } else {
      toast.success(`Opening ${CHANNEL_LABEL[p.channel]}…`);
    }
    window.open(link.url, "_blank", "noopener,noreferrer");
    if (p.status === "new") updateProspect(p.id, { status: "sent" });
  };

  const generateNextFollowUp = async (p: Prospect) => {
    const idx = Math.min(p.followUpCount ?? 0, 2);
    const msg = generateFollowUp(p, advisorName, idx);
    try {
      await navigator.clipboard.writeText(msg);
      toast.success(`Follow-up #${idx + 1} copied for ${p.name || "prospect"}.`);
      updateProspect(p.id, { followUpCount: Math.min(idx + 1, 3) });
    } catch {
      toast.error("Couldn't copy follow-up.");
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
          to="/learning-track/pre-rnf/assignments/outreach-playbook"
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
          <Card>
            <CardContent className="p-3 sm:p-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <Stat label="Sent today" value={stats.sentToday} accent="text-foreground" />
                <Stat label="Reply rate" value={`${stats.replyRate}%`} sub={`${stats.repliedOrBetter}/${stats.totalSent} sent`} accent="text-violet-600 dark:text-violet-400" />
                <Stat label="Booked" value={counts.booked} sub={`${stats.bookRate}% of sent`} accent="text-emerald-600 dark:text-emerald-400" />
                <Stat label="Need follow-up" value={stats.needsFollowUp} sub="sent ≥ 3 days, no reply" accent="text-amber-600 dark:text-amber-400" />
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[180px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, hook, referrer, notes…"
                className="h-8 pl-8 text-sm"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
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
          </div>

          {visible.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No prospects match this filter / search.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {visible.map((p) => (
                <ProspectCard
                  key={p.id}
                  p={p}
                  advisorName={advisorName}
                  onEdit={() => setEditing(p)}
                  onCopy={() => copyMessage(p)}
                  onSend={() => sendViaChannel(p)}
                  onFollowUp={() => generateNextFollowUp(p)}
                  onDelete={() => deleteProspect(p.id)}
                  onStatus={(status) => updateProspect(p.id, { status })}
                />
              ))}
            </div>
          )}
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

// ============ STAT TILE ============

function Stat({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div>
      <div className={cn("text-xl sm:text-2xl font-semibold tabular-nums leading-none", accent)}>{value}</div>
      <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mt-1">{label}</div>
      {sub && <div className="text-[10px] text-muted-foreground/80 mt-0.5">{sub}</div>}
    </div>
  );
}

// ============ PROSPECT CARD ============

function ProspectCard({
  p,
  advisorName,
  onEdit,
  onCopy,
  onSend,
  onFollowUp,
  onDelete,
  onStatus,
}: {
  p: Prospect;
  advisorName: string;
  onEdit: () => void;
  onCopy: () => void;
  onSend: () => void;
  onFollowUp: () => void;
  onDelete: () => void;
  onStatus: (s: Status) => void;
}) {
  const message = p.customMessage ?? generateMessage(p, advisorName);
  const [showFull, setShowFull] = useState(false);
  const sentDays = daysSince(p.sentAt);
  const stale = p.status === "sent" && sentDays !== null && sentDays >= 3;
  const sendLink = getSendUrl(p.channel, p.contact, message);
  const sendLabel = sendLink?.opensCompose
    ? `Send via ${CHANNEL_LABEL[p.channel]}`
    : `Open ${CHANNEL_LABEL[p.channel]}`;

  return (
    <Card className={cn(stale && "border-amber-500/40")}>
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
              {stale && (
                <Badge variant="outline" className="text-[10px] bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300 gap-1">
                  <Bell className="h-3 w-3" /> Follow-up due
                </Badge>
              )}
            </div>
            {(p.hook || p.referrer || p.contact) && (
              <div className="mt-1 text-xs text-muted-foreground space-x-1.5">
                {p.referrer && <span>Referred by {p.referrer}.</span>}
                {p.hook && <span>{p.hook}</span>}
                {p.contact && <span className="text-muted-foreground/70">· {p.contact}</span>}
              </div>
            )}
            {p.sentAt && (
              <div className="mt-1 text-[11px] text-muted-foreground">
                Sent {relativeAgo(sentDays ?? 0)}
                {(p.followUpCount ?? 0) > 0 && ` · ${p.followUpCount} follow-up${(p.followUpCount ?? 0) > 1 ? "s" : ""} sent`}
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

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={onSend} className="gap-1.5" title={sendLink ? undefined : `Add a contact to send via ${CHANNEL_LABEL[p.channel]}`}>
            <Send className="h-3.5 w-3.5" /> {sendLabel}
          </Button>
          <Button size="sm" variant="outline" onClick={onCopy} className="gap-1.5">
            <Copy className="h-3.5 w-3.5" /> Copy
          </Button>
          {(p.status === "sent" || stale) && (
            <Button
              size="sm"
              variant={stale ? "default" : "outline"}
              onClick={onFollowUp}
              className={cn("gap-1.5", stale && "bg-amber-500 hover:bg-amber-600 text-white")}
              title={`Day ${[3, 7, 30][Math.min(p.followUpCount ?? 0, 2)]} follow-up`}
            >
              <Bell className="h-3.5 w-3.5" /> {(p.followUpCount ?? 0) >= 3 ? "Follow-ups exhausted" : `Follow-up #${(p.followUpCount ?? 0) + 1}`}
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onEdit} className="gap-1.5">
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
  const [contact, setContact] = useState("");
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
    setContact(prospect.contact ?? "");
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
    contact: contact || undefined,
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
      contact: contact || undefined,
      referrer: referrer || undefined,
      notes: notes || undefined,
      customMessage: useCustom && customMessage ? customMessage : undefined,
    });
  };

  const contactPlaceholder = ((): string => {
    switch (channel) {
      case "whatsapp": return "+65 9123 4567";
      case "telegram": return "@username";
      case "ig": return "@username";
      case "linkedin": return "linkedin.com/in/username";
      case "sms": return "+65 9123 4567";
      case "email": return "name@example.com";
    }
  })();

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
            <Label htmlFor="ob-contact">Contact (for one-tap send)</Label>
            <Input id="ob-contact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder={contactPlaceholder} />
            <p className="text-[11px] text-muted-foreground mt-1">
              {channel === "whatsapp" && "International format with country code. Tap-to-send opens WhatsApp pre-filled."}
              {channel === "telegram" && "@username if you have it. Otherwise tap-to-send opens Telegram with the message ready to forward."}
              {channel === "sms" && "Phone number with country code. Tap-to-send opens your SMS app pre-filled."}
              {channel === "email" && "Email address. Tap-to-send opens your mail client pre-filled."}
              {channel === "ig" && "Instagram doesn't allow pre-filled DMs — we'll open the profile and copy your message so you can paste."}
              {channel === "linkedin" && "Paste profile URL or vanity slug. LinkedIn doesn't allow pre-filled messages — we'll open the profile."}
            </p>
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
