import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Sparkles, Loader2, ArrowRight, Pencil, AlertTriangle, ExternalLink, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { ObjectionEntry } from "@/hooks/useObjections";

const CATEGORIES: Record<string, { label: string; icon: string }> = {
  generic: { label: "Generic Objections", icon: "🧠" },
  tactical: { label: "Tactical Objections", icon: "⚡" },
  product: { label: "Product-Specific", icon: "📦" },
  pricing: { label: "Pricing & Fees", icon: "💰" },
  trust: { label: "Trust & Credibility", icon: "🤝" },
  timing: { label: "Timing & Delay", icon: "⏳" },
};

interface ClassifiedObjection {
  title: string;
  category: string;
  description: string;
  tags: string[];
  initial_response: string;
  selected: boolean;
}

interface SimilarEntry {
  id: string;
  title: string;
  category: string;
  similarity: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; category: string; description?: string; tags?: string[]; initialResponse?: string }) => Promise<void>;
  editingEntry?: ObjectionEntry | null;
}

type EditorStep = "paste" | "duplicates" | "review";

export function ObjectionEditorDialog({ open, onClose, onSave, editingEntry }: Props) {
  const isEditing = !!editingEntry;
  const [step, setStep] = useState<EditorStep>(isEditing ? "review" : "paste");

  // Paste step
  const [pasteContent, setPasteContent] = useState("");
  const [isClassifying, setIsClassifying] = useState(false);

  // Classified results (can be multiple)
  const [classifiedItems, setClassifiedItems] = useState<ClassifiedObjection[]>([]);
  const [similarEntries, setSimilarEntries] = useState<SimilarEntry[]>([]);

  // Review/edit form (single item)
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("generic");
  const [formDescription, setFormDescription] = useState("");
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formTagInput, setFormTagInput] = useState("");
  const [formInitialResponse, setFormInitialResponse] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    if (editingEntry) {
      setStep("review");
      setFormTitle(editingEntry.title);
      setFormCategory(editingEntry.category);
      setFormDescription(editingEntry.description || "");
      setFormTags(editingEntry.tags || []);
      setFormInitialResponse("");
      setClassifiedItems([]);
    } else {
      setStep("paste");
      setPasteContent("");
      setClassifiedItems([]);
      setSimilarEntries([]);
      setFormTitle("");
      setFormCategory("generic");
      setFormDescription("");
      setFormTags([]);
      setFormTagInput("");
      setFormInitialResponse("");
      setCurrentItemIndex(0);
      setSavedCount(0);
    }
  }, [editingEntry, open]);

  const checkForDuplicates = async (items: ClassifiedObjection[]) => {
    try {
      const { data: existing } = await supabase
        .from("objection_entries")
        .select("id, title, category");

      if (!existing || existing.length === 0) return [];

      const matches: SimilarEntry[] = [];
      for (const item of items) {
        const inputWords = new Set(item.title.toLowerCase().split(/\s+/).filter(w => w.length > 2));

        for (const entry of existing) {
          const titleWords = new Set(entry.title.toLowerCase().split(/\s+/).filter(w => w.length > 2));
          const shared = [...inputWords].filter(w => titleWords.has(w)).length;
          const overlapRatio = inputWords.size > 0 ? shared / inputWords.size : 0;

          if (overlapRatio > 0.5 || entry.title.toLowerCase().includes(item.title.toLowerCase().slice(0, 20))) {
            const alreadyAdded = matches.some(m => m.id === entry.id);
            if (!alreadyAdded) {
              matches.push({
                id: entry.id,
                title: entry.title,
                category: entry.category,
                similarity: overlapRatio > 0.7 ? "Very similar" : "Potentially similar",
              });
            }
          }
        }
      }
      return matches.slice(0, 5);
    } catch {
      return [];
    }
  };

  const handleClassify = async () => {
    if (!pasteContent.trim()) {
      toast.error("Please paste objection content first");
      return;
    }
    setIsClassifying(true);
    try {
      const { data, error } = await supabase.functions.invoke("classify-objection", {
        body: { content: pasteContent },
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        setIsClassifying(false);
        return;
      }

      const items: ClassifiedObjection[] = (data.objections || []).map((o: any) => ({
        ...o,
        selected: true,
      }));

      if (items.length === 0) {
        toast.error("Could not detect any objections in the text");
        setIsClassifying(false);
        return;
      }

      setClassifiedItems(items);

      // Check duplicates
      const dupes = await checkForDuplicates(items);
      if (dupes.length > 0) {
        setSimilarEntries(dupes);
        setStep("duplicates");
        toast.info(`Found ${dupes.length} similar existing objection${dupes.length > 1 ? "s" : ""}`);
      } else {
        // Load first item into form
        loadItemIntoForm(items, 0);
        setStep("review");
        toast.success(`AI detected ${items.length} objection${items.length > 1 ? "s" : ""}! Review and save.`);
      }
    } catch (err: any) {
      console.error("Classification error:", err);
      // Fallback: move to review with defaults
      setFormTitle("");
      setFormCategory("generic");
      setFormDescription("");
      setFormTags([]);
      setFormInitialResponse("");
      setStep("review");
      toast.info("AI classification unavailable — fill in details manually.");
    } finally {
      setIsClassifying(false);
    }
  };

  const loadItemIntoForm = (items: ClassifiedObjection[], index: number) => {
    const item = items[index];
    if (!item) return;
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormDescription(item.description);
    setFormTags(item.tags);
    setFormInitialResponse(item.initial_response || "");
    setCurrentItemIndex(index);
  };

  const proceedToReview = () => {
    const selected = classifiedItems.filter(i => i.selected);
    if (selected.length === 0) {
      toast.error("No objections selected");
      return;
    }
    loadItemIntoForm(selected, 0);
    setStep("review");
  };

  const handleSubmit = async () => {
    if (!formTitle.trim()) return;
    setSaving(true);
    await onSave({
      title: formTitle,
      category: formCategory,
      description: formDescription || undefined,
      tags: formTags,
      initialResponse: formInitialResponse || undefined,
    });

    // If multiple items, move to next
    const selectedItems = classifiedItems.filter(i => i.selected);
    const nextIndex = currentItemIndex + 1;
    if (!isEditing && selectedItems.length > 1 && nextIndex < selectedItems.length) {
      setSavedCount(prev => prev + 1);
      loadItemIntoForm(selectedItems, nextIndex);
      setSaving(false);
      toast.success(`Saved! (${nextIndex}/${selectedItems.length})`);
    } else {
      setSaving(false);
      onClose();
    }
  };

  const toggleItemSelection = (index: number) => {
    setClassifiedItems(prev => prev.map((item, i) => i === index ? { ...item, selected: !item.selected } : item));
  };

  const selectedCount = classifiedItems.filter(i => i.selected).length;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? (
              <><Pencil className="h-4 w-4" /> Edit Objection</>
            ) : step === "paste" ? (
              <><Sparkles className="h-4 w-4 text-primary" /> Quick Add Objection</>
            ) : step === "duplicates" ? (
              <><AlertTriangle className="h-4 w-4 text-amber-500" /> Similar Objections Found</>
            ) : (
              <><Sparkles className="h-4 w-4 text-primary" /> Review & Save{classifiedItems.filter(i => i.selected).length > 1 ? ` (${currentItemIndex + 1}/${classifiedItems.filter(i => i.selected).length})` : ""}</>
            )}
          </DialogTitle>
        </DialogHeader>

        {/* === STEP 1: Paste === */}
        {step === "paste" && !isEditing && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Paste objection text below. AI will extract objections, categorize them, and detect duplicates. You can paste multiple objections at once.
            </p>
            <div>
              <Label>Objection Content</Label>
              <Textarea
                value={pasteContent}
                onChange={e => setPasteContent(e.target.value)}
                placeholder={`e.g. "I already have an agent"\nor paste a full list of objections...`}
                rows={10}
                className="text-sm"
              />
            </div>
          </div>
        )}

        {/* === STEP 2: Duplicates === */}
        {step === "duplicates" && (
          <div className="space-y-4">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400 mb-1">
                We found {similarEntries.length} similar objection{similarEntries.length > 1 ? "s" : ""} already in the database.
              </p>
              <p className="text-xs text-muted-foreground">
                Review these first to avoid duplicates. Consider adding a new response to an existing objection instead.
              </p>
            </div>

            <div className="space-y-2">
              {similarEntries.map((s) => (
                <div key={s.id} className="border rounded-lg p-3 flex items-start justify-between gap-3 bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{s.title}</p>
                    <div className="flex gap-1 mt-1">
                      <Badge variant="secondary" className="text-[10px]">
                        {CATEGORIES[s.category]?.icon} {CATEGORIES[s.category]?.label}
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{s.similarity}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-1 text-xs"
                    onClick={() => window.open(`/scripts?view=objections&highlight=${s.id}`, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3" /> View
                  </Button>
                </div>
              ))}
            </div>

            {/* Show detected items with selection */}
            {classifiedItems.length > 0 && (
              <div>
                <Label className="text-xs mb-2 block">AI detected {classifiedItems.length} objection{classifiedItems.length > 1 ? "s" : ""} — select which to add:</Label>
                <div className="space-y-1.5">
                  {classifiedItems.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => toggleItemSelection(i)}
                      className={`w-full text-left border rounded-lg p-2.5 flex items-center gap-2 transition-colors ${item.selected ? "border-primary bg-primary/5" : "border-muted bg-muted/20 opacity-60"}`}
                    >
                      <div className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${item.selected ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
                        {item.selected && <Check className="h-3 w-3" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-[10px] text-muted-foreground">{CATEGORIES[item.category]?.icon} {CATEGORIES[item.category]?.label}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* === STEP 3: Review === */}
        {step === "review" && (
          <div className="space-y-4">
            {/* AI-detected badge */}
            {!isEditing && classifiedItems.length > 0 && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
                <p className="text-xs font-medium text-primary mb-1.5 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> AI-detected — edit if needed
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="secondary" className="text-[10px]">
                    {CATEGORIES[formCategory]?.icon} {CATEGORIES[formCategory]?.label}
                  </Badge>
                  {formTags.map((t, i) => (
                    <Badge key={i} variant="outline" className="text-[10px]">{t}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>Objection Title</Label>
              <Input
                value={formTitle}
                onChange={e => setFormTitle(e.target.value)}
                placeholder={`e.g. "I already have an agent"`}
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORIES).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.icon} {config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Description (optional)</Label>
              <Textarea
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                placeholder="Brief context about when this objection arises..."
                rows={3}
                className="text-sm"
              />
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {formTags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs gap-1 pr-1">
                    {tag}
                    <button type="button" className="ml-0.5 hover:text-destructive" onClick={() => setFormTags(prev => prev.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-2.5 w-2.5" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={formTagInput}
                  onChange={e => setFormTagInput(e.target.value)}
                  placeholder="Type a tag and press Enter"
                  className="flex-1"
                  onKeyDown={e => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      const val = formTagInput.trim().toLowerCase().replace(/,/g, "");
                      if (val && !formTags.includes(val)) setFormTags(prev => [...prev, val]);
                      setFormTagInput("");
                    }
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={() => {
                  const val = formTagInput.trim().toLowerCase();
                  if (val && !formTags.includes(val)) setFormTags(prev => [...prev, val]);
                  setFormTagInput("");
                }}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {/* Initial response (only for new) */}
            {!isEditing && formInitialResponse && (
              <div>
                <Label>Initial Response (will be added as the first rebuttal)</Label>
                <Textarea
                  value={formInitialResponse}
                  onChange={e => setFormInitialResponse(e.target.value)}
                  rows={4}
                  className="text-sm"
                />
              </div>
            )}
          </div>
        )}

        <DialogFooter className="flex-row justify-between sm:justify-between">
          <div>
            {step === "review" && !isEditing && (
              <Button variant="ghost" size="sm" onClick={() => setStep(similarEntries.length > 0 ? "duplicates" : "paste")}>
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
              <Button onClick={proceedToReview} disabled={selectedCount === 0} variant="secondary" className="gap-1.5">
                Add {selectedCount > 0 ? `${selectedCount} ` : ""}Anyway <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={saving || !formTitle.trim()}>
                {saving ? "Saving..." : isEditing ? "Save Changes" : classifiedItems.filter(i => i.selected).length > 1 ? `Save & Next` : "Create Objection"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
