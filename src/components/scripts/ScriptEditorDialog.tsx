import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Sparkles, Loader2, ArrowRight, Pencil, AlertTriangle, GitMerge, ShieldAlert, Link2, X } from "lucide-react";
import { useScripts } from "@/hooks/useScripts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ScriptEntry, ScriptVersion } from "@/hooks/useScripts";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const CATEGORIES = [
  { value: "cold-calling", label: "Cold Calling" },
  { value: "initial-text", label: "Initial Texts" },
  { value: "post-call-text", label: "Post-Call Texts" },
  { value: "callback", label: "Callback Scripts" },
  { value: "follow-up", label: "Follow-Up Messages" },
  { value: "ad-campaign", label: "Ad Campaign / Lead Gen" },
  { value: "referral", label: "Referral Scripts" },
  { value: "confirmation", label: "Appointment Confirmation" },
  { value: "faq", label: "FAQ / Objections" },
  { value: "tips", label: "Tips & Best Practices" },
];

const TARGET_AUDIENCES = [
  { value: "warm-market", label: "Warm Market / Friends & Family" },
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

type SimilarityTier = "near-identical" | "similar" | "none";

interface SimilarScript {
  id: string;
  stage: string;
  category: string;
  target_audience: string;
  similarity: string;
  overlapPercent: number;
  searchTier: "tier1" | "tier2";
  similarityTier: SimilarityTier;
  contentPreview: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: { stage: string; category: string; target_audience: string; script_role: string; tags: string[]; versions: ScriptVersion[]; sort_order: number; related_script_id?: string | null }) => Promise<void>;
  script?: ScriptEntry | null;
}

type EditorStep = "paste" | "duplicates" | "review";

function computeSimilarity(
  inputTitle: string,
  inputContent: string,
  scriptTitle: string,
  scriptContent: string
): { overlapPercent: number; reason: string; titleSimilar: boolean } {
  const inputWords = new Set(inputContent.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const titleWords = inputTitle.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const titleOverlap = titleWords.length > 0
    ? titleWords.filter(w => scriptTitle.toLowerCase().includes(w)).length / titleWords.length
    : 0;
  const titleSimilar = titleOverlap > 0.5;

  const scriptWords = new Set(scriptContent.toLowerCase().split(/\s+/).filter(w => w.length > 3));
  const shared = [...inputWords].filter(w => scriptWords.has(w)).length;
  const overlapRatio = inputWords.size > 0 ? shared / inputWords.size : 0;
  const overlapPercent = Math.round(overlapRatio * 100);

  let reason: string;
  if (titleSimilar && overlapRatio > 0.4) {
    reason = "Very similar title and content";
  } else if (titleSimilar) {
    reason = "Similar title";
  } else {
    reason = `~${overlapPercent}% content overlap`;
  }

  // Use the higher of title or content overlap for the tier
  const effectivePercent = titleSimilar ? Math.max(overlapPercent, 60) : overlapPercent;

  return { overlapPercent: effectivePercent, reason, titleSimilar };
}

function getSimilarityTier(overlapPercent: number): SimilarityTier {
  if (overlapPercent >= 80) return "near-identical";
  if (overlapPercent >= 40) return "similar";
  return "none";
}

export function ScriptEditorDialog({ open, onClose, onSave, script }: Props) {
  const { user } = useSimplifiedAuth();
  const navigate = useNavigate();
  const { scripts: allScriptsRaw } = useScripts();
  const isEditing = !!script;
  const [step, setStep] = useState<EditorStep>(isEditing ? "review" : "paste");
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (!user) return;
    const fetchName = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, first_name, last_name")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        const name = data.display_name || [data.first_name, data.last_name].filter(Boolean).join(" ") || user.email || "";
        setUserName(name);
      } else {
        setUserName(user.email || "");
      }
    };
    fetchName();
  }, [user]);

  // Paste step state
  const [pasteContent, setPasteContent] = useState("");
  const [isClassifying, setIsClassifying] = useState(false);

  // Duplicate detection state
  const [similarScripts, setSimilarScripts] = useState<SimilarScript[]>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false);
  const [highestSimilarityTier, setHighestSimilarityTier] = useState<SimilarityTier>("none");

  // Review/edit step state
  const [stage, setStage] = useState("");
  const [category, setCategory] = useState("cold-calling");
  const [targetAudience, setTargetAudience] = useState("general");
  const [scriptRole, setScriptRole] = useState("consultant");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [versions, setVersions] = useState<ScriptVersion[]>([{ author: "", content: "" }]);
  const [sortOrder, setSortOrder] = useState(0);
  const [relatedScriptId, setRelatedScriptId] = useState<string | null>(null);
  const [relatedSearch, setRelatedSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Filter out current script from related options, and apply search
  const relatedScriptOptions = useMemo(() => {
    const filtered = allScriptsRaw.filter(s => s.id !== script?.id);
    if (!relatedSearch.trim()) return filtered.slice(0, 20);
    const q = relatedSearch.toLowerCase();
    return filtered.filter(s =>
      s.stage.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q) ||
      (s.target_audience || "").toLowerCase().includes(q)
    ).slice(0, 20);
  }, [allScriptsRaw, script?.id, relatedSearch]);

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
      setRelatedScriptId(script.related_script_id || null);
      setRelatedSearch("");
      setShowAdvanced(!!script.related_script_id);
    } else {
      setStep("paste");
      setPasteContent("");
      setSimilarScripts([]);
      setHighestSimilarityTier("none");
      setStage("");
      setCategory("cold-calling");
      setTargetAudience("general");
      setScriptRole("consultant");
      setTags([]);
      setTagInput("");
      setVersions([{ author: "", content: "" }]);
      setSortOrder(0);
      setRelatedScriptId(null);
      setRelatedSearch("");
      setShowAdvanced(false);
    }
  }, [script, open]);

  const checkForDuplicates = async (classifiedCategory: string, classifiedAudience: string, content: string, title: string) => {
    setIsCheckingDuplicates(true);
    try {
      // TIER 1: Same pipeline stage + same audience
      const { data: tier1Data } = await supabase
        .from("scripts")
        .select("id, stage, category, target_audience, versions")
        .eq("category", classifiedCategory)
        .eq("target_audience", classifiedAudience);

      let matches = findMatches(tier1Data || [], content, title, "tier1");

      // TIER 2: Same pipeline stage, any audience (only if Tier 1 found nothing)
      if (matches.length === 0) {
        const { data: tier2Data } = await supabase
          .from("scripts")
          .select("id, stage, category, target_audience, versions")
          .eq("category", classifiedCategory)
          .neq("target_audience", classifiedAudience);

        matches = findMatches(tier2Data || [], content, title, "tier2");
      }

      setIsCheckingDuplicates(false);
      return matches.slice(0, 5);
    } catch (err) {
      console.error("Duplicate check error:", err);
      setIsCheckingDuplicates(false);
      return [];
    }
  };

  const findMatches = (
    scripts: { id: string; stage: string; category: string; target_audience: string | null; versions: unknown }[],
    content: string,
    title: string,
    searchTier: "tier1" | "tier2"
  ): SimilarScript[] => {
    const results: SimilarScript[] = [];
    for (const s of scripts) {
      const vers = s.versions as unknown as ScriptVersion[];
      const scriptContent = vers.map(v => v.content).join(" ");
      const { overlapPercent, reason } = computeSimilarity(title, content, s.stage, scriptContent);
      const similarityTier = getSimilarityTier(overlapPercent);

      if (similarityTier !== "none") {
        // Build a content preview: first version's content, stripped of markdown, truncated
        const preview = (vers[0]?.content || "")
          .replace(/[#*_~`>\-|[\]()!]/g, "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 300);
        results.push({
          id: s.id,
          stage: s.stage,
          category: s.category,
          target_audience: (s.target_audience as string) || "general",
          similarity: reason,
          overlapPercent,
          searchTier,
          similarityTier,
          contentPreview: preview,
        });
      }
    }
    // Sort by overlap descending
    return results.sort((a, b) => b.overlapPercent - a.overlapPercent);
  };

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

      const classifiedTitle = data.suggested_title || "";
      const classifiedCategory = data.category || "cold-calling";
      const classifiedAudience = data.target_audience || "general";
      setStage(classifiedTitle);
      setCategory(classifiedCategory);
      setTargetAudience(classifiedAudience);
      setScriptRole(data.script_role || "consultant");
      setTags(data.tags || []);
      setVersions([{ author: userName, content: pasteContent }]);

      const duplicates = await checkForDuplicates(classifiedCategory, classifiedAudience, pasteContent, classifiedTitle);
      if (duplicates.length > 0) {
        const highest = duplicates[0].similarityTier;
        setHighestSimilarityTier(highest);
        setSimilarScripts(duplicates);
        setStep("duplicates");
        if (highest === "near-identical") {
          toast.warning("Near-identical script found — consider adding as a version instead.");
        } else {
          toast.info("Found similar existing scripts — please review.");
        }
      } else {
        setStep("review");
        toast.success("AI classified your script! Review and save.");
      }
    } catch (err: any) {
      console.error("Classification error:", err);
      setVersions([{ author: userName, content: pasteContent }]);
      setStep("review");
      toast.info("AI classification unavailable — please fill in details manually.");
    } finally {
      setIsClassifying(false);
    }
  };


  const trackDuplicateDecision = async (action: string, overlapPercent?: number, searchTier?: string) => {
    if (!user?.id) return;
    try {
      await supabase.from("script_duplicate_analytics" as any).insert({
        user_id: user.id,
        action,
        similarity_score: overlapPercent ?? null,
        search_tier: searchTier ?? null,
        category,
        target_audience: targetAudience,
      });
    } catch (e) {
      console.error("Analytics tracking error:", e);
    }
  };

  const handleAddAsVersion = async (targetScriptId: string, targetTitle: string) => {
    setIsMerging(true);
    try {
      const match = similarScripts.find(s => s.id === targetScriptId);
      await trackDuplicateDecision("merge_as_version", match?.overlapPercent, match?.searchTier);

      const { data, error } = await supabase.functions.invoke("seed-scripts", {
        body: {
          mode: "append-version",
          targetId: targetScriptId,
          newVersion: { author: userName, content: pasteContent },
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success(`Added as a new version to "${targetTitle}" (${data.totalVersions} versions total)`);
      onClose();
      setTimeout(() => navigate(`/scripts/${targetScriptId}`, { replace: true }), 150);
    } catch (err: any) {
      console.error("Merge error:", err);
      toast.error("Failed to merge: " + (err.message || "Unknown error"));
    } finally {
      setIsMerging(false);
    }
  };

  const handleProceedToReview = () => {
    if (highestSimilarityTier === "near-identical") {
      setShowOverrideConfirm(true);
    } else {
      const topMatch = similarScripts[0];
      trackDuplicateDecision("add_separate", topMatch?.overlapPercent, topMatch?.searchTier);
      setStep("review");
    }
  };

  const handleSubmit = async () => {
    if (!stage.trim()) return;
    const validVersions = versions.filter(v => v.content.trim());
    if (validVersions.length === 0) return;
    setSaving(true);
    await onSave({ stage, category, target_audience: targetAudience, script_role: scriptRole, tags, versions: validVersions, sort_order: sortOrder, related_script_id: relatedScriptId });
    setSaving(false);
    onClose();
  };

  const updateVersion = (index: number, field: keyof ScriptVersion, value: string) => {
    setVersions(prev => prev.map((v, i) => i === index ? { ...v, [field]: value } : v));
  };

  const addVersion = () => setVersions(prev => [...prev, { author: userName, content: "" }]);
  const removeVersion = (index: number) => setVersions(prev => prev.filter((_, i) => i !== index));

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEditing ? (
                <><Pencil className="h-4 w-4" /> Edit Script</>
              ) : step === "paste" ? (
                <><Sparkles className="h-4 w-4 text-primary" /> Quick Add Script</>
              ) : step === "duplicates" ? (
                highestSimilarityTier === "near-identical" ? (
                  <><ShieldAlert className="h-4 w-4 text-destructive" /> Near-Identical Script Found</>
                ) : (
                  <><AlertTriangle className="h-4 w-4 text-amber-500" /> Similar Scripts Found</>
                )
              ) : (
                <><Sparkles className="h-4 w-4 text-primary" /> Review & Save</>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* === STEP 1: Paste === */}
          {step === "paste" && !isEditing && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Paste your script below. AI will auto-detect the category, audience, role, and tags.
              </p>
              <div>
                <Label>Script Content</Label>
                <Textarea
                  value={pasteContent}
                  onChange={e => setPasteContent(e.target.value)}
                  placeholder="Paste your full script here..."
                  rows={12}
                  className="text-sm"
                />
              </div>
            </div>
          )}

          {/* === STEP 2: Duplicates === */}
          {step === "duplicates" && (
            <div className="space-y-4">
              {/* Warning banner */}
              <div className={`rounded-lg p-4 border ${
                highestSimilarityTier === "near-identical"
                  ? "bg-destructive/10 border-destructive/30"
                  : "bg-amber-500/10 border-amber-500/30"
              }`}>
                <p className={`text-sm font-medium mb-1 ${
                  highestSimilarityTier === "near-identical"
                    ? "text-destructive"
                    : "text-amber-700 dark:text-amber-400"
                }`}>
                  {highestSimilarityTier === "near-identical"
                    ? `This looks like a duplicate of an existing script.`
                    : `We found ${similarScripts.length} similar script${similarScripts.length > 1 ? "s" : ""} already in the database.`
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {highestSimilarityTier === "near-identical"
                    ? "To keep a single source of truth, add yours as a new version to the existing script instead."
                    : "Review these first. You can merge as a version or add as a separate script."
                  }
                </p>
              </div>

              {/* Match cards */}
              <div className="space-y-2">
                {similarScripts.map((s) => (
                  <div key={s.id} className={`border rounded-lg p-3 space-y-2 ${
                    s.similarityTier === "near-identical" ? "bg-destructive/5 border-destructive/20" : "bg-muted/30"
                  }`}>
                  <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{s.stage}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          <Badge variant="secondary" className="text-[10px]">
                            {CATEGORIES.find(c => c.value === s.category)?.label}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {TARGET_AUDIENCES.find(a => a.value === s.target_audience)?.label}
                          </Badge>
                          <Badge variant={s.similarityTier === "near-identical" ? "destructive" : "outline"} className="text-[10px]">
                            {s.overlapPercent}% match
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {s.searchTier === "tier1" ? "Same stage & audience" : "Same stage, diff. audience"}
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">{s.similarity}</p>
                      </div>
                    </div>

                    {/* Inline content preview */}
                    {s.contentPreview && (
                      <div className="rounded-md bg-muted/50 border p-2.5 text-xs text-muted-foreground leading-relaxed max-h-32 overflow-y-auto">
                        {s.contentPreview}{s.contentPreview.length >= 300 ? "…" : ""}
                      </div>
                    )}

                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        className="gap-1 text-xs"
                        disabled={isMerging}
                        onClick={() => handleAddAsVersion(s.id, s.stage)}
                      >
                        {isMerging ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <GitMerge className="h-3 w-3" />
                        )}
                        Add as Version
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === STEP 3: Review === */}
          {step === "review" && (
            <div className="space-y-4">
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
                        <div className="flex-1 text-sm text-muted-foreground">
                          By: {v.author || userName || "You"}
                        </div>
                        {versions.length > 1 && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeVersion(i)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <Textarea
                        value={v.content}
                        onChange={e => updateVersion(i, "content", e.target.value)}
                        placeholder="Script content..."
                        rows={8}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Advanced */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {showAdvanced ? "▾ Hide advanced" : "▸ Advanced options"}
              </button>
              {showAdvanced && (
                <div className="pl-3 border-l-2 border-muted space-y-3">
                  <div>
                    <Label className="text-xs">Sort Order <span className="text-muted-foreground">(lower = higher position)</span></Label>
                    <Input type="number" value={sortOrder} onChange={e => setSortOrder(Number(e.target.value))} className="w-24" />
                  </div>
                  <div>
                    <Label className="text-xs flex items-center gap-1.5">
                      <Link2 className="h-3 w-3" />
                      Related Script <span className="text-muted-foreground">(link to parent/child)</span>
                    </Label>
                    {relatedScriptId ? (
                      <div className="flex items-center gap-2 mt-1 p-2 rounded-md border bg-muted/40">
                        <Link2 className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-sm truncate flex-1">
                          {allScriptsRaw.find(s => s.id === relatedScriptId)?.stage || "Unknown script"}
                        </span>
                        <Badge variant="secondary" className="text-[9px] shrink-0">
                          {CATEGORIES.find(c => c.value === allScriptsRaw.find(s => s.id === relatedScriptId)?.category)?.label || ""}
                        </Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 shrink-0"
                          onClick={() => setRelatedScriptId(null)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-1 space-y-1">
                        <Input
                          value={relatedSearch}
                          onChange={e => setRelatedSearch(e.target.value)}
                          placeholder="Search scripts by title, category..."
                          className="text-sm"
                        />
                        {relatedSearch.trim() && relatedScriptOptions.length > 0 && (
                          <div className="border rounded-md bg-popover shadow-md max-h-48 overflow-y-auto z-50">
                            {relatedScriptOptions.map(s => (
                              <button
                                key={s.id}
                                type="button"
                                className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-2"
                                onClick={() => {
                                  setRelatedScriptId(s.id);
                                  setRelatedSearch("");
                                }}
                              >
                                <span className="truncate flex-1">{s.stage}</span>
                                <Badge variant="secondary" className="text-[9px] shrink-0">
                                  {CATEGORIES.find(c => c.value === s.category)?.label || s.category}
                                </Badge>
                              </button>
                            ))}
                          </div>
                        )}
                        {relatedSearch.trim() && relatedScriptOptions.length === 0 && (
                          <p className="text-xs text-muted-foreground px-2 py-1">No matching scripts found</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-row justify-between sm:justify-between">
            <div>
              {step === "review" && !isEditing && (
                <Button variant="ghost" size="sm" onClick={() => setStep(similarScripts.length > 0 ? "duplicates" : "paste")}>
                  ← Back
                </Button>
              )}
              {step === "duplicates" && (
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
              ) : step === "duplicates" ? (
                <Button
                  onClick={handleProceedToReview}
                  variant={highestSimilarityTier === "near-identical" ? "outline" : "secondary"}
                  className="gap-1.5"
                  disabled={isMerging}
                >
                  {highestSimilarityTier === "near-identical" ? "Override & Add Anyway" : "Add as Separate Script"}
                  <ArrowRight className="h-3.5 w-3.5" />
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

      {/* Override confirmation for near-identical scripts */}
      <AlertDialog open={showOverrideConfirm} onOpenChange={setShowOverrideConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-destructive" />
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This script is very similar to "<span className="font-medium">{similarScripts[0]?.stage}</span>" ({similarScripts[0]?.overlapPercent}% match).
              Adding it separately may create confusion. Consider merging it as a version instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const topMatch = similarScripts[0];
                trackDuplicateDecision("override_near_identical", topMatch?.overlapPercent, topMatch?.searchTier);
                setShowOverrideConfirm(false);
                setStep("review");
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Add Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
