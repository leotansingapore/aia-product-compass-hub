import { useState, useRef, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, Loader2, Sparkles, X, ImageIcon, ClipboardPaste, CheckCircle, ChevronLeft, ChevronRight, Trash2, Crop, Eraser, Zap, ZapOff } from 'lucide-react';
import { ImageCropper } from './ImageCropper';
import { InlineImageEditor } from './InlineImageEditor';
import { supabase } from '@/integrations/supabase/client';
import { useConceptCardsMutations } from '@/hooks/useConceptCards';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const AUDIENCE_OPTIONS = ['NSF / NS', 'Young Adults', 'Working Adults', 'Pre-Retirees (50-65)', 'Parents', 'General'];
const PRODUCT_OPTIONS = ['Investment', 'Endowment', 'Whole Life', 'Term', 'Medical', 'Critical Illness', 'General'];


interface ImageEntry {
  id: string;
  file: File;
  originalPreview: string;
  enhancedUrl: string | null;
  enhancing: boolean;
  title: string;
  description: string;
  audience: string[];
  productType: string[];
  tags: string[];
  saved: boolean;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function ConceptCardUploadDialog({ open, onClose, onCreated }: Props) {
  const [entries, setEntries] = useState<ImageEntry[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [tagInput, setTagInput] = useState('');
  const [audienceInput, setAudienceInput] = useState('');
  const [productTypeInput, setProductTypeInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [croppingId, setCroppingId] = useState<string | null>(null);
  const [aiEnhance, setAiEnhance] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { createCard, uploadOriginalImage } = useConceptCardsMutations();

  const reset = useCallback(() => {
    setEntries([]);
    setActiveIndex(0);
    setTagInput('');
    setSaving(false);
    setIsDragging(false);
    setEditingId(null);
    setCroppingId(null);
  }, []);

  const handleClose = () => { reset(); onClose(); };

  // ── Enhance a single image entry ──────────────────────────────────────────
  const enhanceEntry = useCallback(async (id: string, file: File, base64: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, enhancing: true } : e));
    try {
      const { data, error } = await supabase.functions.invoke('enhance-concept-image', {
        body: { imageBase64: base64, fileName: file.name },
      });
      setEntries(prev => prev.map(e =>
        e.id === id
          ? { ...e, enhancing: false, enhancedUrl: (!error && data?.enhancedUrl) ? data.enhancedUrl : null }
          : e
      ));
      if (error || !data?.enhancedUrl) toast.error('AI enhancement failed for one image — original will be used');
    } catch {
      setEntries(prev => prev.map(e => e.id === id ? { ...e, enhancing: false } : e));
    }
  }, []);

  // ── Add files ─────────────────────────────────────────────────────────────
  const addFiles = useCallback((files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (!imageFiles.length) return;

    imageFiles.forEach(file => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const base64 = ev.target?.result as string;
        const newEntry: ImageEntry = {
          id, file,
          originalPreview: base64,
          enhancedUrl: null,
          enhancing: false,
          title: '',
          description: '',
          audience: [],
          productType: [],
          tags: [],
          saved: false,
        };
        setEntries(prev => {
          const updated = [...prev, newEntry];
          setActiveIndex(updated.length - 1);
          return updated;
        });
        if (aiEnhance) enhanceEntry(id, file, base64);
      };
      reader.readAsDataURL(file);
    });
    toast.success(`${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''} added`);
  }, [enhanceEntry, aiEnhance]);

  // ── Clipboard paste (global while dialog open) ────────────────────────────
  useEffect(() => {
    if (!open) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const files: File[] = [];
      for (const item of Array.from(items)) {
        if (item.type.startsWith('image/')) {
          const f = item.getAsFile();
          if (f) files.push(f);
        }
      }
      if (files.length) addFiles(files);
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [open, addFiles]);

  // ── Drag and drop ─────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  // ── Update active entry field ─────────────────────────────────────────────
  const updateActive = (patch: Partial<ImageEntry>) => {
    setEntries(prev => prev.map((e, i) => i === activeIndex ? { ...e, ...patch } : e));
  };

  const toggleItem = (arr: string[], key: 'audience' | 'productType', val: string) => {
    const updated = arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
    updateActive({ [key]: updated });
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    const entry = entries[activeIndex];
    if (t && entry && !entry.tags.includes(t)) updateActive({ tags: [...entry.tags, t] });
    setTagInput('');
  };

  const removeEntry = (id: string) => {
    setEntries(prev => {
      const next = prev.filter(e => e.id !== id);
      setActiveIndex(i => Math.min(i, Math.max(0, next.length - 1)));
      return next;
    });
  };

  // ── Save all ─────────────────────────────────────────────────────────────
  const handleSaveAll = async () => {
    const toSave = entries.filter(e => !e.saved && e.title.trim());
    if (!toSave.length) {
      toast.error('Please add a question/title to at least one card');
      return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    let successCount = 0;

    for (const entry of toSave) {
      const originalUrl = await uploadOriginalImage(entry.file);
      const result = await createCard({
        title: entry.title.trim(),
        description: entry.description.trim() || null,
        image_url: aiEnhance ? (entry.enhancedUrl || originalUrl) : originalUrl,
        original_image_url: originalUrl,
        audience: entry.audience,
        product_type: entry.productType,
        tags: entry.tags,
        sort_order: 0,
        created_by: user?.id || null,
      });
      if (result) {
        setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, saved: true } : e));
        successCount++;
      }
    }

    setSaving(false);
    if (successCount > 0) {
      toast.success(`${successCount} card${successCount > 1 ? 's' : ''} saved!`);
      onCreated();
      reset();
      onClose();
    }
  };

  const active = entries[activeIndex];
  const allTitled = entries.length > 0 && entries.every(e => e.title.trim());

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-5 pb-4 border-b shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Add Concept Cards
            {entries.length > 0 && (
              <Badge variant="secondary" className="ml-1">{entries.length} image{entries.length > 1 ? 's' : ''}</Badge>
            )}
            <button
              type="button"
              onClick={() => setAiEnhance(v => !v)}
              className={cn(
                "ml-auto flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border transition-colors",
                aiEnhance
                  ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                  : "bg-muted text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
              )}
            >
              {aiEnhance ? <Zap className="h-3.5 w-3.5" /> : <ZapOff className="h-3.5 w-3.5" />}
              AI Enhance {aiEnhance ? 'On' : 'Off'}
            </button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* ── Drop / paste zone ─────────────────────────── */}
          <div className="px-6 pt-4">
            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={cn(
                "relative border-2 border-dashed rounded-xl transition-all cursor-pointer group",
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : entries.length === 0
                    ? "border-muted-foreground/30 hover:border-primary/60 hover:bg-primary/5 py-10"
                    : "border-muted-foreground/20 hover:border-primary/40 hover:bg-primary/3 py-3",
              )}
            >
              {entries.length === 0 ? (
                <div className="text-center space-y-3 px-4">
                  <div className="flex justify-center gap-4 text-muted-foreground/50">
                    <ClipboardPaste className="h-8 w-8" />
                    <ImageIcon className="h-8 w-8" />
                    <Upload className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Paste images, drag & drop, or click to browse</p>
                    <p className="text-xs text-muted-foreground/60 mt-0.5">Multiple images supported — one card per image · AI auto-enhances to clean B&W</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 px-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ClipboardPaste className="h-3.5 w-3.5" />
                    Paste more · drag & drop · or click to add more images
                  </div>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} />
          </div>

          {/* ── Image strip + editor ──────────────────────── */}
          {entries.length > 0 && (
            <div className="px-6 pt-4 space-y-4">
              {/* Thumbnail strip */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {entries.map((entry, i) => (
                  <button
                    key={entry.id}
                    onClick={() => setActiveIndex(i)}
                    className={cn(
                      "group relative shrink-0 w-20 h-20 rounded-lg border-2 overflow-hidden transition-all",
                      i === activeIndex ? "border-primary shadow-md scale-105" : "border-border hover:border-primary/60",
                      entry.saved && "opacity-60"
                    )}
                  >
                    <img
                      src={entry.enhancedUrl || entry.originalPreview}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {entry.enhancing && (
                      <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                      </div>
                    )}
                    {entry.saved && (
                      <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    )}
                    {!entry.title.trim() && (
                      <div className="absolute bottom-0 inset-x-0 h-1 bg-destructive/60 rounded-b" />
                    )}
                    {/* Remove button */}
                    <button
                      onClick={e => { e.stopPropagation(); removeEntry(entry.id); }}
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-destructive/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                    <p className="absolute inset-x-0 bottom-0 text-[8px] leading-tight px-1 py-0.5 bg-background/70 text-foreground truncate">
                      {i + 1}. {entry.title || <span className="text-muted-foreground italic">no title</span>}
                    </p>
                  </button>
                ))}
              </div>

              {/* Navigation */}
              {entries.length > 1 && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <button
                    onClick={() => setActiveIndex(i => Math.max(0, i - 1))}
                    disabled={activeIndex === 0}
                    className="p-1 rounded border border-border hover:border-primary/60 disabled:opacity-30 transition-colors"
                  ><ChevronLeft className="h-3.5 w-3.5" /></button>
                  <span>Card {activeIndex + 1} of {entries.length}</span>
                  <button
                    onClick={() => setActiveIndex(i => Math.min(entries.length - 1, i + 1))}
                    disabled={activeIndex === entries.length - 1}
                    className="p-1 rounded border border-border hover:border-primary/60 disabled:opacity-30 transition-colors"
                  ><ChevronRight className="h-3.5 w-3.5" /></button>
                  <span className="ml-auto">
                    {entries.filter(e => e.title.trim()).length}/{entries.length} titled
                  </span>
                </div>
              )}

              {/* Active entry editor */}
              {active && (
                <div className="rounded-xl border bg-card p-4 space-y-4">
                  {/* Preview row */}
                  {aiEnhance ? (
                    <div className={cn(
                      "grid gap-3",
                      editingId === active.id ? "grid-cols-1" : "grid-cols-2"
                    )}>
                      {editingId !== active.id && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground font-medium">Original</p>
                          <img src={active.originalPreview} alt="" className="rounded-lg w-full object-contain max-h-32 bg-muted/20" />
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                            AI Enhanced {active.enhancing && <Loader2 className="h-3 w-3 animate-spin" />}
                          </p>
                          {active.enhancedUrl && !active.enhancing && editingId !== active.id && croppingId !== active.id && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setCroppingId(active.id)}
                                className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground hover:border-primary/60 hover:text-primary transition-colors"
                              >
                                <Crop className="h-2.5 w-2.5" /> Crop
                              </button>
                              <button
                                onClick={() => setEditingId(active.id)}
                                className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground hover:border-primary/60 hover:text-primary transition-colors"
                              >
                                <Eraser className="h-2.5 w-2.5" /> Edit
                              </button>
                            </div>
                          )}
                        </div>
                        {active.enhancing ? (
                          <div className="rounded-lg bg-muted/40 flex items-center justify-center h-32">
                            <div className="text-center space-y-1">
                              <Sparkles className="h-5 w-5 text-primary mx-auto animate-pulse" />
                              <p className="text-xs text-muted-foreground">Enhancing...</p>
                            </div>
                          </div>
                        ) : croppingId === active.id && active.enhancedUrl ? (
                          <ImageCropper
                            imageUrl={active.enhancedUrl}
                            maxImgClass="max-w-full max-h-[40vh]"
                            onCrop={(cropped) => {
                              updateActive({ enhancedUrl: cropped });
                              setCroppingId(null);
                              toast.success('Image cropped ✓');
                            }}
                            onCancel={() => setCroppingId(null)}
                          />
                        ) : editingId === active.id && active.enhancedUrl ? (
                          <InlineImageEditor
                            imageUrl={active.enhancedUrl}
                            onApply={(edited) => {
                              updateActive({ enhancedUrl: edited });
                              setEditingId(null);
                              toast.success('Image updated ✓');
                            }}
                            onCancel={() => setEditingId(null)}
                          />
                        ) : active.enhancedUrl ? (
                          <img src={active.enhancedUrl} alt="Enhanced" className="rounded-lg w-full object-contain max-h-32 bg-white" />
                        ) : (
                          <div className="rounded-lg bg-muted/40 flex items-center justify-center h-32">
                            <p className="text-xs text-muted-foreground">Using original</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground font-medium">Image Preview</p>
                      <img src={active.originalPreview} alt="" className="rounded-lg w-full object-contain max-h-40 bg-muted/20" />
                    </div>
                  )}

                  {/* Question */}
                  <div className="space-y-1.5">
                    <Label>Question <span className="text-destructive">*</span></Label>
                    <Input
                      placeholder="e.g. How does the Rule of 72 work?"
                      value={active.title}
                      onChange={e => updateActive({ title: e.target.value })}
                      autoFocus
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <Label className="text-sm">Hint <span className="text-muted-foreground text-xs">(optional)</span></Label>
                    <Textarea
                      placeholder="Short description shown as a hint..."
                      value={active.description}
                      onChange={e => updateActive({ description: e.target.value })}
                      rows={2}
                    />
                  </div>

                  {/* Audience */}
                  <div className="space-y-2">
                    <Label className="text-sm">Audience</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {[...new Set([...AUDIENCE_OPTIONS, ...active.audience.filter(a => !AUDIENCE_OPTIONS.includes(a))])].map(a => (
                        <button
                          key={a} type="button"
                          onClick={() => toggleItem(active.audience, 'audience', a)}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                            active.audience.includes(a)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-muted-foreground border-border hover:border-primary/60"
                          )}
                        >{a}</button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add custom audience…"
                        value={audienceInput}
                        onChange={e => setAudienceInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const v = audienceInput.trim();
                            if (v && !active.audience.includes(v)) updateActive({ audience: [...active.audience, v] });
                            setAudienceInput('');
                          }
                        }}
                        className="h-8 text-xs"
                      />
                      <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => {
                        const v = audienceInput.trim();
                        if (v && !active.audience.includes(v)) updateActive({ audience: [...active.audience, v] });
                        setAudienceInput('');
                      }}>Add</Button>
                    </div>
                  </div>

                  {/* Product Type */}
                  <div className="space-y-2">
                    <Label className="text-sm">Product Type</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {[...new Set([...PRODUCT_OPTIONS, ...active.productType.filter(p => !PRODUCT_OPTIONS.includes(p))])].map(p => (
                        <button
                          key={p} type="button"
                          onClick={() => toggleItem(active.productType, 'productType', p)}
                          className={cn(
                            "px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
                            active.productType.includes(p)
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-muted-foreground border-border hover:border-primary/60"
                          )}
                        >{p}</button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add custom product type…"
                        value={productTypeInput}
                        onChange={e => setProductTypeInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const v = productTypeInput.trim();
                            if (v && !active.productType.includes(v)) updateActive({ productType: [...active.productType, v] });
                            setProductTypeInput('');
                          }
                        }}
                        className="h-8 text-xs"
                      />
                      <Button type="button" variant="outline" size="sm" className="h-8 text-xs" onClick={() => {
                        const v = productTypeInput.trim();
                        if (v && !active.productType.includes(v)) updateActive({ productType: [...active.productType, v] });
                        setProductTypeInput('');
                      }}>Add</Button>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label className="text-sm">Tags</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g. rule-of-72"
                        value={tagInput}
                        onChange={e => setTagInput(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); }}}
                      />
                      <Button type="button" variant="outline" size="sm" onClick={addTag}>Add</Button>
                    </div>
                    {active.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {active.tags.map(t => (
                          <Badge key={t} variant="secondary" className="gap-1 text-xs">
                            {t}
                            <button onClick={() => updateActive({ tags: active.tags.filter(x => x !== t) })}>
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────── */}
        <div className="px-6 py-4 border-t bg-card shrink-0 flex gap-2">
          <Button variant="outline" className="flex-1" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSaveAll}
            disabled={saving || entries.length === 0 || !entries.some(e => e.title.trim())}
          >
            {saving
              ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
              : entries.length > 1
                ? `Save ${entries.filter(e => e.title.trim()).length} Card${entries.filter(e => e.title.trim()).length !== 1 ? 's' : ''}`
                : 'Save Card'
            }
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
