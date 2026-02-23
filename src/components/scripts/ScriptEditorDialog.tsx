import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Sparkles, Loader2, ArrowRight, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ScriptEntry, ScriptVersion } from "@/hooks/useScripts";

const CATEGORIES = [
  { value: "cold-calling", label: "Cold Calling" },
  { value: "warm-market", label: "Warm Market Outreach" },
  { value: "follow-up", label: "Follow-Up Messages" },
  { value: "ad-campaign", label: "Ad Campaign / Lead Gen" },
  { value: "referral", label: "Referral Scripts" },
  { value: "confirmation", label: "Appointment Confirmation" },
  { value: "faq", label: "FAQ / Objections" },
  { value: "tips", label: "Tips & Best Practices" },
];

const TARGET_AUDIENCES = [
  { value: "general", label: "General" },
  { value: "young-adult", label: "Young Adults" },
  { value: "nsf", label: "NSF / NS" },
  { value: "working-adult", label: "Working Adults" },
  { value: "parent", label: "Parents" },
  { value: "pre-retiree", label: "Pre-Retirees (50-65)" },
  { value: "hnw", label: "High Net Worth" },
  { value: "referral", label: "Referrals" },
  { value: "cold-lead", label: "Cold Leads" },
];

const SCRIPT_ROLES = [
  { value: "consultant", label: "Consultant" },
  { value: "va", label: "VA" },
  { value: "telemarketer", label: "Telemarketer" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: { stage: string; category: string; target_audience: string; script_role: string; tags: string[]; versions: ScriptVersion[]; sort_order: number }) => Promise<void>;
  script?: ScriptEntry | null;
}

type EditorStep = "paste" | "review";

export function ScriptEditorDialog({ open, onClose, onSave, script }: Props) {
  // Step state (only for new scripts)
  const isEditing = !!script;
  const [step, setStep] = useState<EditorStep>(isEditing ? "review" : "paste");

  // Paste step state
  const [pasteContent, setPasteContent] = useState("");
  const [pasteAuthor, setPasteAuthor] = useState("");
  const [isClassifying, setIsClassifying] = useState(false);

  // Review/edit step state
  const [stage, setStage] = useState("");
  const [category, setCategory] = useState("cold-calling");
  const [targetAudience, setTargetAudience] = useState("general");
  const [scriptRole, setScriptRole] = useState("consultant");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [versions, setVersions] = useState<ScriptVersion[]>([{ author: "", content: "" }]);
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (script) {
      setStep("review");
      setStage(script.stage);
      setCategory(script.category);
      setTargetAudience(script.target_audience || "general");
      setScriptRole(script.script_role || "consultant");
      setTags(script.tags || []);
      setTagInput("");
      setVersions(script.versions.length > 0 ? script.versions : [{ author: "", content: "" }]);
      setSortOrder(script.sort_order);
      setShowAdvanced(false);
    } else {
      setStep("paste");
      setPasteContent("");
      setPasteAuthor("");
      setStage("");
      setCategory("cold-calling");
      setTargetAudience("general");
      setScriptRole("consultant");
      setTags([]);
      setTagInput("");
      setVersions([{ author: "", content: "" }]);
      setSortOrder(0);
      setShowAdvanced(false);
    }
  }, [script, open]);

  const handleClassify = async () => {
    if (!pasteContent.trim()) {
      toast.error("Please paste your script content first");
      return;
    }
    setIsClassifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("classify-script", {
        body: { title: "", content: pasteContent },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        setIsClassifying(false);
        return;
      }

      // Apply AI results
      setStage(data.suggested_title || "");
      setCategory(data.category || "cold-calling");
      setTargetAudience(data.target_audience || "general");
      setScriptRole(data.script_role || "consultant");
      setTags(data.tags || []);
      setVersions([{ author: pasteAuthor || "", content: pasteContent }]);
      setStep("review");
      toast.success("AI classified your script! Review and save.");
    } catch (err: any) {
      console.error("Classification error:", err);
      // Fallback: just move to review with defaults
      setVersions([{ author: pasteAuthor || "", content: pasteContent }]);
      setStep("review");
      toast.info("AI classification unavailable — please fill in details manually.");
    } finally {
      setIsClassifying(false);
    }
  };

  const handleSubmit = async () => {
    if (!stage.trim()) return;
    const validVersions = versions.filter(v => v.content.trim());
    if (validVersions.length === 0) return;
    setSaving(true);
    await onSave({ stage, category, target_audience: targetAudience, script_role: scriptRole, tags, versions: validVersions, sort_order: sortOrder });
    setSaving(false);
    onClose();
  };

  const updateVersion = (index: number, field: keyof ScriptVersion, value: string) => {
    setVersions(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const addVersion = () => setVersions(prev => [...prev, { author: "", content: "" }]);
  const removeVersion = (index: number) => setVersions(prev => prev.filter((_, i) => i !== index));

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? (
              <><Pencil className="h-4 w-4" /> Edit Script</>
            ) : step === "paste" ? (
              <><Sparkles className="h-4 w-4 text-primary" /> Quick Add Script</>
            ) : (
              <><Sparkles className="h-4 w-4 text-primary" /> Review & Save</>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* === STEP 1: Paste (new scripts only) === */}
        {step === "paste" && !isEditing && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Paste your script below. AI will auto-detect the category, audience, role, and tags.
            </p>
            <div>
              <Label>Author / Version name <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                value={pasteAuthor}
                onChange={e => setPasteAuthor(e.target.value)}
                placeholder="e.g. Jamie's Script, V2, Original"
              />
            </div>
            <div>
              <Label>Script Content</Label>
              <Textarea
                value={pasteContent}
                onChange={e => setPasteContent(e.target.value)}
                placeholder="Paste your full script here... (supports markdown)"
                rows={12}
                className="font-mono text-sm"
              />
            </div>
          </div>
        )}

        {/* === STEP 2: Review (or Edit mode) === */}
        {step === "review" && (
          <div className="space-y-4">
            {/* AI-detected badges */}
            {!isEditing && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-xs font-medium text-primary mb-2 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> AI-detected — edit if needed
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="text-[10px]">
                    {CATEGORIES.find(c => c.value === category)?.label}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {TARGET_AUDIENCES.find(a => a.value === targetAudience)?.label}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {SCRIPT_ROLES.find(r => r.value === scriptRole)?.label}
                  </Badge>
                  {tags.map((t, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">{t}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>Script Title / Stage</Label>
              <Input value={stage} onChange={e => setStage(e.target.value)} placeholder="e.g. Cold Calling — Original Script" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Target Audience</Label>
                <Select value={targetAudience} onValueChange={setTargetAudience}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TARGET_AUDIENCES.map(a => (
                      <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Role</Label>
                <Select value={scriptRole} onValueChange={setScriptRole}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SCRIPT_ROLES.map(r => (
                      <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs gap-1 pr-1">
                    {tag}
                    <button type="button" className="ml-0.5 hover:text-destructive" onClick={() => setTags(prev => prev.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  placeholder="Type a tag and press Enter"
                  className="flex-1"
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      const val = tagInput.trim().toLowerCase().replace(/,/g, "");
                      if (val && !tags.includes(val)) setTags(prev => [...prev, val]);
                      setTagInput("");
                    }
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  const val = tagInput.trim().toLowerCase();
                  if (val && !tags.includes(val)) setTags(prev => [...prev, val]);
                  setTagInput("");
                }}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Script Versions */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Script Versions</Label>
                <Button variant="outline" size="sm" onClick={addVersion} className="gap-1">
                  <Plus className="h-3 w-3" /> Add Version
                </Button>
              </div>
              <div className="space-y-4">
                {versions.map((v, i) => (
                  <div key={i} className="border rounded-lg p-3 space-y-2 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Input
                        value={v.author}
                        onChange={e => updateVersion(i, "author", e.target.value)}
                        placeholder="Author / Version name"
                        className="flex-1"
                      />
                      {versions.length > 1 && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeVersion(i)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <Textarea
                      value={v.content}
                      onChange={e => updateVersion(i, "content", e.target.value)}
                      placeholder="Script content... (supports markdown)"
                      rows={8}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Advanced toggle for sort order */}
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {showAdvanced ? "▾ Hide advanced" : "▸ Advanced options"}
            </button>
            {showAdvanced && (
              <div className="pl-3 border-l-2 border-muted">
                <Label className="text-xs">Sort Order <span className="text-muted-foreground">(lower = higher position)</span></Label>
                <Input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} className="w-24" />
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <div>
            {step === "review" && !isEditing && (
              <Button variant="ghost" size="sm" onClick={() => setStep("paste")}>
                ← Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            {step === "paste" ? (
              <Button onClick={handleClassify} disabled={isClassifying || !pasteContent.trim()} className="gap-1.5">
                {isClassifying ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Classifying...</>
                ) : (
                  <><Sparkles className="h-4 w-4" /> Classify & Continue</>
                )}
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={saving || !stage.trim()}>
                {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Script"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
