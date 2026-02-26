import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { MinimalRichEditor } from "@/components/MinimalRichEditor";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Sparkles, Loader2, ArrowRight, Pencil, AlertTriangle, GitMerge, ShieldAlert, Link2, X, AlertCircle, ChevronDown, FolderOpen, ImagePlus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  { value: "servicing", label: "Servicing" },
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
  lockedAudience?: string;
  lockedRoles?: { value: string; label: string }[];
  lockedCategory?: string;
  /** Path prefix to navigate to after a merge-as-version action, e.g. "/servicing" */
  mergeNavigateBase?: string;
}

type EditorStep = "paste" | "duplicates" | "review";

function slugToLabel(slug: string) {
  return slug.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Strips the first line if it looks like a human annotation/heading used to
 * prompt the AI (e.g. "Asking clients to pay overdue policies"), rather than
 * being part of the actual script body.
 *
 * A line is considered an annotation when it:
 *  - Is the very first non-empty line
 *  - Contains no punctuation typical of script content (colons, commas, dots, !, ?)
 *  - Does NOT start like a greeting or body line (Dear, Hi, Hello, I , We , To )
 *  - Is reasonably short (≤ 80 chars)
 *  - Is followed by a blank line OR a greeting/salutation line
 */
function stripHeaderAnnotation(raw: string): { cleaned: string; stripped: string | null } {
  const lines = raw.split("\n");
  // Find first non-empty line index
  const firstNonEmpty = lines.findIndex(l => l.trim().length > 0);
  if (firstNonEmpty === -1) return { cleaned: raw, stripped: null };

  const firstLine = lines[firstNonEmpty].trim();

  // Must be short
  if (firstLine.length > 80) return { cleaned: raw, stripped: null };

  // Should NOT look like a greeting or script opener
  const scriptOpenerRx = /^(dear|hi\b|hello|hey|i |we |to |re:|subject:|from:|cc:)/i;
  if (scriptOpenerRx.test(firstLine)) return { cleaned: raw, stripped: null };

  // Should NOT contain typical script punctuation mid-sentence
  const hasPunctuation = /[,!?]/.test(firstLine) || (firstLine.includes(":") && !firstLine.endsWith(":"));
  if (hasPunctuation) return { cleaned: raw, stripped: null };

  // Should be followed by a blank line OR a greeting
  const nextLine = lines[firstNonEmpty + 1]?.trim() ?? "";
  const followedByBlankOrGreeting = nextLine === "" || scriptOpenerRx.test(nextLine);
  if (!followedByBlankOrGreeting) return { cleaned: raw, stripped: null };

  // Strip the annotation line (and the blank line right after it if present)
  const rest = lines.slice(firstNonEmpty + 1);
  if (rest[0]?.trim() === "") rest.shift();
  return { cleaned: rest.join("\n").trim(), stripped: firstLine };
}

function CategoryOverridePicker({
  displaySlug, isNew, allSlugs, onSelect,
}: {
  displaySlug: string;
  isNew: boolean;
  allSlugs: string[];
  onSelect: (slug: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [newCatInput, setNewCatInput] = useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="w-full rounded-lg border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 transition-colors p-3 text-left group"
        >
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <FolderOpen className="h-3.5 w-3.5" />
            Filed under
            <span className="ml-auto text-[10px] font-normal normal-case text-primary group-hover:underline">click to change</span>
          </p>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-foreground leading-tight">
              {slugToLabel(displaySlug)}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
          {isNew && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-1 inline-block">
              ✦ New category — will be created
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 space-y-3" align="start">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Choose a category</p>
        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
          {allSlugs.map(slug => (
            <button
              key={slug}
              type="button"
              onClick={() => { onSelect(slug); setOpen(false); }}
              className="px-2.5 py-1 rounded-md text-xs border border-border bg-background hover:bg-accent hover:border-primary transition-colors font-medium"
            >
              {slugToLabel(slug)}
            </button>
          ))}
        </div>
        <div className="border-t pt-2 space-y-1.5">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Or create a new category</p>
          <div className="flex gap-1.5">
            <Input
              placeholder="e.g. policy-transfers"
              value={newCatInput}
              onChange={e => setNewCatInput(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}
              className="h-7 text-xs"
              onKeyDown={e => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.stopPropagation();
                  if (newCatInput.trim()) {
                    onSelect(newCatInput.trim());
                    setNewCatInput("");
                    setOpen(false);
                  }
                }
              }}
            />
            <Button
              type="button"
              size="sm"
              className="h-7 px-2 text-xs shrink-0"
              disabled={!newCatInput.trim()}
              onClick={() => { onSelect(newCatInput.trim()); setNewCatInput(""); setOpen(false); }}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

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

export function ScriptEditorDialog({ open, onClose, onSave, script, lockedAudience, lockedRoles, lockedCategory, mergeNavigateBase }: Props) {
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
  const [pasteImages, setPasteImages] = useState<Array<{ url: string; name: string }>>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const uploadImage = useCallback(async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { toast.error("Image too large. Max 10MB."); return; }
    setIsUploadingImage(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `script-images/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("knowledge-files").upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("knowledge-files").getPublicUrl(path);
      setPasteImages(prev => [...prev, { url: urlData.publicUrl, name: file.name }]);
      toast.success("Image added");
    } catch (e) {
      toast.error("Failed to upload image");
    } finally {
      setIsUploadingImage(false);
    }
  }, []);

  const handlePasteImages = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) uploadImage(file);
        return;
      }
    }
  }, [uploadImage]);

  // Duplicate detection state
  const [similarScripts, setSimilarScripts] = useState<SimilarScript[]>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);
  const [isMerging, setIsMerging] = useState(false);
  const [showOverrideConfirm, setShowOverrideConfirm] = useState(false);
  const [highestSimilarityTier, setHighestSimilarityTier] = useState<SimilarityTier>("none");

  // Servicing category override state
  const [aiSuggestedNewCategory, setAiSuggestedNewCategory] = useState<string | null>(null);
  const [existingCategorySlugs, setExistingCategorySlugs] = useState<string[]>([]);

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
      setPasteImages([]);
      setSimilarScripts([]);
      setHighestSimilarityTier("none");
      setStage("");
      setCategory(lockedCategory || "cold-calling");
      setTargetAudience(lockedAudience || "general");
      setScriptRole(lockedRoles?.[0]?.value || "consultant");
      setTags([]);
      setTagInput("");
      setVersions([{ author: "", content: "" }]);
      setSortOrder(0);
    setRelatedScriptId(null);
      setRelatedSearch("");
      setShowAdvanced(false);
      setAiSuggestedNewCategory(null);
    }
  }, [script, open]);

  const checkForDuplicates = async (classifiedCategory: string, classifiedAudience: string, content: string, title: string) => {
    setIsCheckingDuplicates(true);
    // When a category is locked (e.g. servicing), only search within that category
    const searchCategory = lockedCategory || classifiedCategory;
    try {
      // TIER 1: Same category + same audience
      const { data: tier1Data } = await supabase
        .from("scripts")
        .select("id, stage, category, target_audience, versions")
        .eq("category", searchCategory)
        .eq("target_audience", classifiedAudience);

      let matches = findMatches(tier1Data || [], content, title, "tier1");

      // TIER 2: Same category, any audience (only if Tier 1 found nothing)
      if (matches.length === 0) {
        const { data: tier2Data } = await supabase
          .from("scripts")
          .select("id, stage, category, target_audience, versions")
          .eq("category", searchCategory)
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
      // Strip header annotation (e.g. "Asking clients to pay overdue policies")
      // before sending to AI and before storing the script body
      const { cleaned: cleanedContent, stripped: strippedAnnotation } = stripHeaderAnnotation(pasteContent);
      if (strippedAnnotation) {
        // Update the paste box too so what's stored is clean
        setPasteContent(cleanedContent);
        toast.info(`Removed annotation: "${strippedAnnotation}"`, { duration: 4000 });
      }
      const contentForClassify = strippedAnnotation ? cleanedContent : pasteContent;

      // Gather existing servicing category slugs from the database to help the AI reuse them
      const isServicing = lockedCategory === "servicing";
      let existingCategories: string[] = [];
      if (isServicing) {
        const { data: servicingScripts } = await supabase
          .from("scripts")
          .select("tags")
          .eq("category", "servicing");
        if (servicingScripts) {
          const knownServicingCategories = [
            "premium-payments","new-business","claims","policy-services",
            "travel-insurance","texting-campaigns","festive-greetings",
            "referrals","annual-reviews","general-education",
          ];
          const slugSet = new Set<string>();
          servicingScripts.forEach(s => (s.tags || []).forEach((t: string) => {
            if (knownServicingCategories.includes(t) || t.includes("-")) slugSet.add(t);
          }));
          existingCategories = Array.from(slugSet);
        }
      }

      const { data, error } = await supabase.functions.invoke("classify-script", {

        body: {
          title: "",
          content: contentForClassify,
          context: isServicing ? "servicing" : undefined,
          existingCategories: isServicing ? existingCategories : undefined,
        },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        setIsClassifying(false);
        return;
      }

      const classifiedTitle = data.suggested_title || "";
      const classifiedCategory = lockedCategory || data.category || "cold-calling";
      const classifiedAudience = lockedAudience || data.target_audience || "general";
      setStage(classifiedTitle);
      setCategory(classifiedCategory);
      setTargetAudience(classifiedAudience);
      const availableRoles = lockedRoles || SCRIPT_ROLES;
      const suggestedRole = data.script_role || "consultant";
      setScriptRole(availableRoles.find(r => r.value === suggestedRole) ? suggestedRole : availableRoles[0].value);

      // Merge servicing_category into tags so the Servicing page can filter by it
      const aiTags: string[] = data.tags || [];
      if (isServicing && data.servicing_category) {
        const catSlug = data.servicing_category.toLowerCase().replace(/\s+/g, "-");
        if (!aiTags.includes(catSlug)) aiTags.unshift(catSlug);
        // Track if this is a brand-new category so we can show the override UI
        if (!existingCategories.includes(catSlug)) {
          setAiSuggestedNewCategory(catSlug);
          setExistingCategorySlugs(existingCategories);
        } else {
          setAiSuggestedNewCategory(null);
        }
      }
      setTags(aiTags);
      setVersions([{ author: userName, content: contentForClassify }]);

      // Auto-suggest related script: follow-up → post-call-text, post-call-text → follow-up
      const relatedCategory = classifiedCategory === "follow-up" ? "post-call-text"
        : classifiedCategory === "post-call-text" ? "follow-up"
        : null;
      if (relatedCategory) {
        try {
          let query = supabase
            .from("scripts")
            .select("id, stage, category, target_audience")
            .eq("category", relatedCategory);
          // Try same audience first, fall back to any
          if (classifiedAudience !== "general") {
            query = query.or(`target_audience.eq.${classifiedAudience},target_audience.eq.general`);
          }
          const { data: candidates } = await query.limit(10);
          if (candidates && candidates.length > 0) {
            // Prefer exact audience match
            const exactMatch = candidates.find(c => c.target_audience === classifiedAudience);
            const bestMatch = exactMatch || candidates[0];
            setRelatedScriptId(bestMatch.id);
            setShowAdvanced(true);
            toast.info(`Auto-linked to "${bestMatch.stage}" as related ${relatedCategory.replace("-", " ")} script`);
          }
        } catch (e) {
          console.error("Related script suggestion error:", e);
        }
      }

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

  const handleAddAsVersion = async (targetScriptId: string, targetTitle: string, addMode: "current" | "all" = "current") => {
    setIsMerging(true);
    try {
      const match = similarScripts.find(s => s.id === targetScriptId);
      const versionsToAdd = addMode === "all" && versions.length > 1
        ? versions
        : [{ author: userName, content: pasteContent }];

      for (const ver of versionsToAdd) {
        const { data, error } = await supabase.functions.invoke("seed-scripts", {
          body: {
            mode: "append-version",
            targetId: targetScriptId,
            newVersion: { author: ver.author || userName, content: ver.content },
          },
        });
        if (error || data?.error) throw new Error(data?.error || error?.message);
      }

      const addedCount = versionsToAdd.length;
      toast.success(`Added ${addedCount > 1 ? `${addedCount} versions` : "as a new version"} to "${targetTitle}"`);
      onClose();
      const basePath = mergeNavigateBase || "/scripts";
      setTimeout(() => navigate(`${basePath}/${targetScriptId}`, { replace: true }), 150);
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
    const attachments = pasteImages.map(img => ({ label: img.name, url: img.url, type: "image" as const }));
    await onSave({ stage, category, target_audience: targetAudience, script_role: scriptRole, tags, versions: validVersions, sort_order: sortOrder, related_script_id: relatedScriptId, ...(attachments.length > 0 ? { attachments } : {}) } as any);
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
                  onPaste={handlePasteImages}
                  placeholder="Paste your full script here..."
                  rows={12}
                  className="text-sm"
                />
              </div>
              {/* Image attachments */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Label className="text-xs text-muted-foreground">Images / Screenshots</Label>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => {
                      Array.from(e.target.files || []).forEach(uploadImage);
                      e.target.value = "";
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 gap-1.5 text-xs"
                    onClick={() => imageInputRef.current?.click()}
                    disabled={isUploadingImage}
                  >
                    {isUploadingImage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5" />}
                    Add Image
                  </Button>
                  <span className="text-[11px] text-muted-foreground">or paste an image into the text box above</span>
                </div>
                {pasteImages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {pasteImages.map((img, i) => (
                      <div key={i} className="relative group">
                        <img src={img.url} alt={img.name} className="h-20 w-20 object-cover rounded-lg border" />
                        <button
                          type="button"
                          onClick={() => setPasteImages(prev => prev.filter((_, j) => j !== i))}
                          className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-xs"
                            disabled={isMerging}
                          >
                            {isMerging ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <GitMerge className="h-3 w-3" />
                            )}
                            Add as Version
                            <ChevronDown className="h-3 w-3 ml-0.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem onClick={() => handleAddAsVersion(s.id, s.stage, "current")}>
                            <GitMerge className="h-3.5 w-3.5 mr-2 shrink-0" />
                            <div>
                              <div className="font-medium text-xs">Current version only</div>
                              <div className="text-[10px] text-muted-foreground">Add just this pasted content</div>
                            </div>
                          </DropdownMenuItem>
                          {versions.length > 1 && (
                            <DropdownMenuItem onClick={() => handleAddAsVersion(s.id, s.stage, "all")}>
                              <GitMerge className="h-3.5 w-3.5 mr-2 shrink-0" />
                              <div>
                                <div className="font-medium text-xs">All versions ({versions.length})</div>
                                <div className="text-[10px] text-muted-foreground">Add every version tab</div>
                              </div>
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* === STEP 3: Review === */}
          {step === "review" && (
            <div className="space-y-4">

              {/* === AI Summary header === */}
              {!isEditing && (
                <div className="flex items-center gap-1.5 text-xs text-primary font-medium">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI-detected — tap any field to change it
                </div>
              )}

              {/* === Servicing: Filed Under (clickable) === */}
              {lockedCategory === "servicing" && !isEditing && (() => {
                const KNOWN_SLUGS = ["premium-payments","new-business","claims","policy-services",
                  "travel-insurance","texting-campaigns","festive-greetings",
                  "referrals","annual-reviews","general-education"];
                const servicingSubcategory = tags.find(t => KNOWN_SLUGS.includes(t) || (t.includes("-") && !["phone-call","whatsapp","sms","cpf","follow-up","referral-ask"].includes(t)));
                if (!servicingSubcategory && !aiSuggestedNewCategory) return null;
                const displaySlug = servicingSubcategory || aiSuggestedNewCategory || "";
                const isNew = !!(aiSuggestedNewCategory && !servicingSubcategory);
                const allSlugs = Array.from(new Set([...KNOWN_SLUGS, ...existingCategorySlugs])).filter(s => s !== displaySlug);
                return (
                  <CategoryOverridePicker
                    displaySlug={displaySlug}
                    isNew={isNew}
                    allSlugs={allSlugs}
                    onSelect={(slug) => {
                      setTags(prev => [slug, ...prev.filter(t => t !== displaySlug)]);
                      setAiSuggestedNewCategory(null);
                    }}
                  />
                );
              })()}

              {/* === Script Title === */}
              <div>
                <Label className="text-xs text-muted-foreground uppercase tracking-wide mb-1.5 block">Script Title / Stage</Label>
                <Input value={stage} onChange={e => setStage(e.target.value)} placeholder="e.g. Cold Calling — Original Script" />
              </div>

              {/* === Inline editable metadata chips === */}
              {!isEditing && (
                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Classification</p>
                  <div className="flex flex-wrap gap-2">

                    {/* Category chip */}
                    {!lockedCategory && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button type="button" className="group flex items-center gap-1.5 rounded-full border border-dashed border-border bg-background hover:border-primary hover:bg-primary/5 transition-all px-3 py-1.5 text-xs font-medium">
                            <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Category</span>
                            <span className="text-foreground">{CATEGORIES.find(c => c.value === category)?.label ?? "—"}</span>
                            <Pencil className="h-2.5 w-2.5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-52 p-1.5" align="start">
                          {CATEGORIES.map(c => (
                            <button key={c.value} type="button" onClick={() => setCategory(c.value)}
                              className={`w-full text-left px-3 py-1.5 rounded-md text-xs hover:bg-accent transition-colors ${category === c.value ? "font-semibold text-primary" : ""}`}>
                              {c.label}
                            </button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    )}

                    {/* Audience chip */}
                    {!lockedAudience && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button type="button" className="group flex items-center gap-1.5 rounded-full border border-dashed border-border bg-background hover:border-primary hover:bg-primary/5 transition-all px-3 py-1.5 text-xs font-medium">
                            <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Audience</span>
                            <span className="text-foreground">{TARGET_AUDIENCES.find(a => a.value === targetAudience)?.label ?? "—"}</span>
                            <Pencil className="h-2.5 w-2.5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56 p-1.5" align="start">
                          {TARGET_AUDIENCES.map(a => (
                            <button key={a.value} type="button" onClick={() => setTargetAudience(a.value)}
                              className={`w-full text-left px-3 py-1.5 rounded-md text-xs hover:bg-accent transition-colors ${targetAudience === a.value ? "font-semibold text-primary" : ""}`}>
                              {a.label}
                            </button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    )}

                    {/* Role chip */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" className="group flex items-center gap-1.5 rounded-full border border-dashed border-border bg-background hover:border-primary hover:bg-primary/5 transition-all px-3 py-1.5 text-xs font-medium">
                          <span className="text-[9px] uppercase tracking-widest text-muted-foreground">Role</span>
                          <span className="text-foreground">{(lockedRoles || SCRIPT_ROLES).find(r => r.value === scriptRole)?.label ?? "—"}</span>
                          <Pencil className="h-2.5 w-2.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-44 p-1.5" align="start">
                        {(lockedRoles || SCRIPT_ROLES).map(r => (
                          <button key={r.value} type="button" onClick={() => setScriptRole(r.value)}
                            className={`w-full text-left px-3 py-1.5 rounded-md text-xs hover:bg-accent transition-colors ${scriptRole === r.value ? "font-semibold text-primary" : ""}`}>
                            {r.label}
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              {/* Fallback selects when editing */}
              {isEditing && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {!lockedCategory && (
                    <div>
                      <Label>Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {!lockedAudience && (
                    <div>
                      <Label>Target Audience</Label>
                      <Select value={targetAudience} onValueChange={setTargetAudience}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TARGET_AUDIENCES.map(a => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div>
                    <Label>Role</Label>
                    <Select value={scriptRole} onValueChange={setScriptRole}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(lockedRoles || SCRIPT_ROLES).map(r => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Tags */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Tags</Label>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {tags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs gap-1 pr-1 group">
                      {tag}
                      <button type="button" className="ml-0.5 opacity-50 group-hover:opacity-100 hover:text-destructive transition-opacity" onClick={() => setTags(prev => prev.filter((_, idx) => idx !== i))}>
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </Badge>
                  ))}
                  {/* inline add tag */}
                  <div className="flex items-center gap-1">
                    <Input
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      placeholder="+ add tag"
                      className="h-6 text-xs w-24 border-dashed focus:w-32 transition-all"
                      onKeyDown={e => {
                        if (e.key === "Enter" || e.key === ",") {
                          e.preventDefault();
                          const val = tagInput.trim().toLowerCase().replace(/,/g, "");
                          if (val && !tags.includes(val)) setTags(prev => [...prev, val]);
                          setTagInput("");
                        }
                      }}
                    />
                  </div>
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
                      <div className="border rounded-md overflow-hidden">
                        <MinimalRichEditor
                          value={v.content}
                          onChange={(val) => updateVersion(i, "content", val)}
                          placeholder="Script content..."
                        />
                      </div>
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
