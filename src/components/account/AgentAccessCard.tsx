import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { KeyRound, Copy, Check, Trash2, Plus, Bot } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Compass Hub's Supabase project (where the api / mcp edge functions and the
// api_keys table live). Hardcoded because the client reads no VITE_SUPABASE_URL.
const FUNCTIONS_BASE = "https://hgdbflprrficdoyxmdxe.supabase.co/functions/v1";

type ApiKeyRow = {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  last_used_at: string | null;
  created_at: string;
  expires_at: string | null;
};

function CopyButton({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
    >
      {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
      {copied ? "Copied" : label}
    </Button>
  );
}

export function AgentAccessCard() {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [allowWrite, setAllowWrite] = useState(false);
  const [expiryDays, setExpiryDays] = useState<string>("never");
  const [createOpen, setCreateOpen] = useState(false);
  const [freshKey, setFreshKey] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("api_keys")
      .select("id, name, prefix, scopes, last_used_at, created_at, expires_at")
      .is("revoked_at", null)
      .order("created_at", { ascending: false });
    if (error) toast.error("Could not load API keys");
    setKeys((data as ApiKeyRow[]) ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function createKey() {
    if (!newName.trim()) { toast.error("Give the key a name"); return; }
    setCreating(true);
    const scopes = allowWrite ? ["read", "write"] : ["read"];
    const { data, error } = await supabase.rpc("api_create_key", {
      p_name: newName.trim(),
      p_scopes: scopes,
      p_expires_in_days: expiryDays === "never" ? null : Number(expiryDays),
    });
    setCreating(false);
    if (error) { toast.error(error.message); return; }
    const row = Array.isArray(data) ? data[0] : data;
    setFreshKey(row?.raw_key ?? null);
    setNewName("");
    setAllowWrite(false);
    setExpiryDays("never");
    setCreateOpen(false);
    load();
  }

  async function revokeKey(id: string, name: string) {
    const { error } = await supabase.rpc("api_revoke_key", { p_id: id });
    if (error) { toast.error(error.message); return; }
    toast.success(`Revoked "${name}"`);
    load();
  }

  const mcpUrl = `${FUNCTIONS_BASE}/mcp`;
  const apiUrl = `${FUNCTIONS_BASE}/api/v1`;

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-lg sm:text-xl">
          <Bot className="w-6 h-6 text-primary flex-shrink-0" />
          <span>AI Agent Access</span>
        </CardTitle>
        <CardDescription className="mt-2">
          Connect an AI agent (Claude, a bot, your own script) to your Hub account — it
          can read your learning progress, XP, quiz history, achievements, bookmarks and
          notes, and (with write access) save notes for you, over MCP or the REST API.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Existing keys */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Your keys</h3>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              <Plus className="w-4 h-4 mr-1" /> New key
            </Button>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : keys.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No keys yet. Create one to connect an agent.
            </p>
          ) : (
            <div className="space-y-2">
              {keys.map((k) => (
                <div key={k.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{k.name}</span>
                      {k.scopes.map((s) => (
                        <Badge key={s} variant={s === "write" ? "default" : "secondary"} className="text-xs">{s}</Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      {k.prefix}…{"  "}·{"  "}
                      {k.last_used_at ? `last used ${new Date(k.last_used_at).toLocaleDateString()}` : "never used"}
                      {k.expires_at
                        ? `  ·  ${new Date(k.expires_at) < new Date() ? "expired" : "expires"} ${new Date(k.expires_at).toLocaleDateString()}`
                        : ""}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => revokeKey(k.id, k.name)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How to connect — step by step */}
        <div className="space-y-5">
          <h3 className="text-sm font-medium">How to connect</h3>

          <div className="p-4 rounded-lg bg-muted/50 border space-y-3 text-sm">
            <ol className="list-decimal pl-5 space-y-2.5 text-muted-foreground marker:text-foreground/40">
              <li>Tap <span className="text-foreground">New key</span> above, pick read or read+write, and copy the key (it&apos;s shown once).</li>
              <li>
                In Claude (claude.ai or the desktop app), open <span className="text-foreground">Settings → Connectors → Add custom connector</span> and paste this address:
                <div className="flex items-center gap-2 flex-wrap mt-1.5">
                  <code className="px-2 py-1 rounded bg-background border text-xs break-all text-foreground">{mcpUrl}</code>
                  <CopyButton text={mcpUrl} label="Copy" />
                </div>
                When it asks for a token, paste your key.
              </li>
              <li>
                For Claude Desktop / stdio clients, use the bridge (replace <span className="text-foreground">YOUR_KEY</span>):
                <div className="flex items-start gap-2 flex-wrap mt-1.5">
                  <code className="px-2 py-1 rounded bg-background border text-xs break-all text-foreground">npx mcp-remote {mcpUrl} --header "Authorization: Bearer YOUR_KEY"</code>
                  <CopyButton text={`npx mcp-remote ${mcpUrl} --header "Authorization: Bearer YOUR_KEY"`} label="Copy" />
                </div>
              </li>
              <li>
                Or call the REST API directly:
                <div className="flex items-center gap-2 flex-wrap mt-1.5">
                  <code className="px-2 py-1 rounded bg-background border text-xs break-all text-foreground">curl {apiUrl}/progress -H "Authorization: Bearer YOUR_KEY"</code>
                  <CopyButton text={`curl ${apiUrl}/progress -H "Authorization: Bearer YOUR_KEY"`} label="Copy" />
                </div>
              </li>
            </ol>
          </div>

          {/* What you can ask it */}
          <div className="p-4 rounded-lg bg-muted/50 border space-y-2.5 text-sm">
            <p className="font-medium">Things to ask your agent</p>
            <ul className="space-y-1.5 text-muted-foreground">
              {[
                "“How much XP do I have, and how far through the learning track am I?”",
                "“How did I do on my recent quizzes?”",
                "“What achievements have I earned so far?”",
                "“Which products have I bookmarked?”",
                "“Show my learning-track submissions and any feedback I got”",
                "“Read back my notes on the whole-life products”",
                "“Summarise what I’ve learned and what to study next” — it reads your history and coaches",
              ].map((t, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-primary flex-shrink-0">•</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground text-xs">Read-only keys can do everything except save notes — great if you just want insights.</p>
          </div>
        </div>
      </CardContent>

      {/* Create dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create an API key</DialogTitle>
            <DialogDescription>
              You will see the full key once — copy it somewhere safe.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="key-name">Name</Label>
              <Input
                id="key-name"
                placeholder="e.g. Claude Desktop, my study bot"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <Checkbox checked={allowWrite} onCheckedChange={(v) => setAllowWrite(Boolean(v))} />
              Allow saving notes (write access). Leave unchecked for read-only.
            </label>
            <div className="space-y-2">
              <Label htmlFor="key-expiry">Expiry</Label>
              <select
                id="key-expiry"
                value={expiryDays}
                onChange={(e) => setExpiryDays(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="never">Never expires</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="365">1 year</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={createKey} disabled={creating}>
              {creating ? "Creating…" : "Create key"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reveal-once dialog */}
      <Dialog open={!!freshKey} onOpenChange={(o) => !o && setFreshKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-primary" /> Your new API key
            </DialogTitle>
            <DialogDescription>
              Copy this now. For your security it won’t be shown again.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
            <code className="text-xs break-all flex-1">{freshKey}</code>
            {freshKey && <CopyButton text={freshKey} />}
          </div>
          <DialogFooter>
            <Button onClick={() => setFreshKey(null)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
