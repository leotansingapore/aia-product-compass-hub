import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, X, ImageIcon, Save, Crop, Eraser, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useConceptCardsMutations, ConceptCard } from '@/hooks/useConceptCards';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ImageCropper } from './ImageCropper';
import { InlineImageEditor } from './InlineImageEditor';

const AUDIENCE_OPTIONS = ['NSF / NS', 'Young Adults', 'Working Adults', 'Pre-Retirees (50-65)', 'Parents', 'General'];
const PRODUCT_OPTIONS = ['Investment', 'Endowment', 'Whole Life', 'Term', 'Medical', 'Critical Illness', 'General'];

interface Props {
  card: ConceptCard | null;
  onClose: () => void;
  onUpdated: () => void;
}

interface ImageEntry {
  /** Stable key for React */
  key: string;
  /** Existing saved URL (null for brand-new uploads) */
  savedUrl: string | null;
  /** Preview data URL for new file chosen by user */
  preview: string | null;
  /** Raw File object for new upload */
  file: File | null;
  /** AI-enhanced URL (from edge function) */
  enhancedUrl: string | null;
  /** Whether enhancement is in progress */
  enhancing: boolean;
  /** User-edited override (base64) for the display image */
  editedUrl: string | null;
  /** User-edited override (base64) for the enhanced image */
  editedEnhancedUrl: string | null;
}

type EditTarget = { key: string; side: 'current' | 'enhanced'; mode: 'crop' | 'edit' } | null;

function makeKey() { return Math.random().toString(36).slice(2); }

function emptyEntry(savedUrl: string | null): ImageEntry {
  return { key: makeKey(), savedUrl, preview: null, file: null, enhancedUrl: null, enhancing: false, editedUrl: null, editedEnhancedUrl: null };
}

export function ConceptCardEditDialog({ card, onClose, onUpdated }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [audience, setAudience] = useState<string[]>([]);
  const [productType, setProductType] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [audienceInput, setAudienceInput] = useState('');
  const [productTypeInput, setProductTypeInput] = useState('');
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [editTarget, setEditTarget] = useState<EditTarget>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { updateCard, uploadOriginalImage } = useConceptCardsMutations();

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
      setAudience(card.audience || []);
      setProductType(card.product_type || []);
      setTags(card.tags || []);
      setEditTarget(null);
      setSaving(false);
      setAudienceInput('');
      setProductTypeInput('');

      // Build image entries from existing saved URLs
      const urls: string[] = [];
      // Prefer the image_urls array; fall back to legacy image_url
      if (card.image_urls && card.image_urls.length > 0) {
        urls.push(...card.image_urls);
      } else if (card.image_url) {
        urls.push(card.image_url);
      }
      setImages(urls.map(u => emptyEntry(u)));
    }
  }, [card]);

  if (!card) return null;

  const handleClose = () => {
    setImages([]);
    setEditTarget(null);
    setSaving(false);
    onClose();
  };

  // ── Enhance a newly chosen file ──────────────────────────────────────────
  const runEnhancement = async (key: string, file: File, base64: string) => {
    setImages(prev => prev.map(img => img.key === key ? { ...img, enhancing: true } : img));
    try {
      const { data, error } = await supabase.functions.invoke('enhance-concept-image', {
        body: { imageBase64: base64, fileName: file.name },
      });
      if (error || !data?.enhancedUrl) {
        toast.error('Enhancement failed — original will be used');
      } else {
        setImages(prev => prev.map(img => img.key === key ? { ...img, enhancedUrl: data.enhancedUrl } : img));
        toast.success('Image enhanced ✨');
      }
    } catch {
      toast.error('Enhancement failed');
    } finally {
      setImages(prev => prev.map(img => img.key === key ? { ...img, enhancing: false } : img));
    }
  };

  // ── Handle file selection ────────────────────────────────────────────────
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    // Reset input so same file can be picked again
    e.target.value = '';

    for (const file of files) {
      const key = makeKey();
      const reader = new FileReader();
      reader.onload = async ev => {
        const base64 = ev.target?.result as string;
        const entry: ImageEntry = {
          key, savedUrl: null, preview: base64, file,
          enhancedUrl: null, enhancing: false, editedUrl: null, editedEnhancedUrl: null,
        };
        setImages(prev => [...prev, entry]);
        await runEnhancement(key, file, base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (key: string) => {
    setImages(prev => prev.filter(img => img.key !== key));
    if (editTarget?.key === key) setEditTarget(null);
  };

  const toggleItem = (arr: string[], setArr: (v: string[]) => void, val: string) =>
    arr.includes(val) ? setArr(arr.filter(x => x !== val)) : setArr([...arr, val]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  // Upload a base64 data URL as a new file to Supabase storage
  const uploadBase64 = async (dataUrl: string, prefix: string): Promise<string> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const file = new File([blob], `${prefix}_${Date.now()}.png`, { type: 'image/png' });
    return uploadOriginalImage(file);
  };

  const handleSave = async () => {
    if (!title.trim()) { toast.error('Please enter a question/title'); return; }
    setSaving(true);

    // Resolve final URL for each image entry
    const finalUrls: string[] = [];
    for (const img of images) {
      if (img.file) {
        // New upload
        const origUrl = await uploadOriginalImage(img.file);
        const finalEnhanced = img.editedEnhancedUrl || img.enhancedUrl;
        const finalOrig = img.editedUrl || origUrl;
        if (finalEnhanced) {
          const url = img.editedEnhancedUrl
            ? await uploadBase64(img.editedEnhancedUrl, 'enhanced')
            : finalEnhanced;
          finalUrls.push(url);
        } else {
          finalUrls.push(finalOrig);
        }
      } else if (img.editedUrl) {
        // Existing image was edited/cropped
        const url = await uploadBase64(img.editedUrl, 'edited');
        finalUrls.push(url);
      } else if (img.savedUrl) {
        // Unchanged existing image
        finalUrls.push(img.savedUrl);
      }
    }

    const updates: Partial<ConceptCard> = {
      title: title.trim(),
      description: description.trim() || null,
      audience,
      product_type: productType,
      tags,
      // Keep legacy image_url as the first image for backward compat
      image_url: finalUrls[0] || null,
      image_urls: finalUrls,
    };

    const ok = await updateCard(card.id, updates);
    setSaving(false);
    if (ok) { onUpdated(); handleClose(); }
  };

  // ── Active edit/crop mode ─────────────────────────────────────────────────
  const activeImg = editTarget ? images.find(img => img.key === editTarget.key) : null;
  const activeImgUrl = activeImg
    ? (editTarget!.side === 'enhanced'
        ? (activeImg.editedEnhancedUrl || activeImg.enhancedUrl)
        : (activeImg.editedUrl || activeImg.savedUrl || activeImg.preview))
    : null;

  if (editTarget && activeImgUrl) {
    return (
      <Dialog open={!!card} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="h-5 w-5 text-primary" />
              {editTarget.mode === 'crop' ? 'Crop Image' : 'Edit Image'}
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-xl border overflow-hidden">
            {editTarget.mode === 'crop' ? (
              <ImageCropper
                imageUrl={activeImgUrl}
                maxImgClass="max-w-full max-h-[40vh]"
                onCrop={url => {
                  const { key, side } = editTarget;
                  setImages(prev => prev.map(img => img.key === key
                    ? side === 'enhanced'
                      ? { ...img, editedEnhancedUrl: url }
                      : { ...img, editedUrl: url }
                    : img));
                  setEditTarget(null);
                  toast.success('Cropped ✓');
                }}
                onCancel={() => setEditTarget(null)}
              />
            ) : (
              <InlineImageEditor
                imageUrl={activeImgUrl}
                onApply={url => {
                  const { key, side } = editTarget;
                  setImages(prev => prev.map(img => img.key === key
                    ? side === 'enhanced'
                      ? { ...img, editedEnhancedUrl: url }
                      : { ...img, editedUrl: url }
                    : img));
                  setEditTarget(null);
                  toast.success('Image updated ✓');
                }}
                onCancel={() => setEditTarget(null)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={!!card} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-primary" />
            Edit Concept Card
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          {/* Question */}
          <div className="space-y-1.5">
            <Label>Question <span className="text-destructive">*</span></Label>
            <Input value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Explanation <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          </div>

          {/* Images section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Drawings / Diagrams</Label>
              <span className="text-xs text-muted-foreground">{images.length} image{images.length !== 1 ? 's' : ''}</span>
            </div>

            {/* Existing + new images grid */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {images.map(img => {
                  const displayUrl = img.editedUrl || img.savedUrl || img.preview;
                  const enhDisplayUrl = img.editedEnhancedUrl || img.enhancedUrl;
                  const isNew = !!img.file;

                  return (
                    <div key={img.key} className="rounded-xl border bg-muted/10 overflow-hidden">
                      {/* Header */}
                      <div className="flex items-center justify-between px-2.5 py-1.5 bg-muted/20 border-b">
                        <span className="text-[10px] text-muted-foreground font-medium">
                          {isNew ? 'New image' : 'Saved image'}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeImage(img.key)}
                          className="p-0.5 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>

                      {/* Image panels */}
                      {isNew ? (
                        // New upload: show original + enhanced side by side
                        <div className="grid grid-cols-2 gap-2 p-2">
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground">Original</p>
                            {displayUrl && (
                              <>
                                <img src={displayUrl} alt="" className="rounded w-full object-contain max-h-28" />
                                <div className="flex gap-1">
                                  <button type="button" onClick={() => setEditTarget({ key: img.key, side: 'current', mode: 'crop' })}
                                    className="flex-1 flex items-center justify-center gap-0.5 text-[9px] px-1 py-0.5 rounded border border-border hover:border-primary/60 hover:text-primary text-muted-foreground transition-colors">
                                    <Crop className="h-2 w-2" /> Crop
                                  </button>
                                  <button type="button" onClick={() => setEditTarget({ key: img.key, side: 'current', mode: 'edit' })}
                                    className="flex-1 flex items-center justify-center gap-0.5 text-[9px] px-1 py-0.5 rounded border border-border hover:border-primary/60 hover:text-primary text-muted-foreground transition-colors">
                                    <Eraser className="h-2 w-2" /> Edit
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                              Enhanced {img.enhancing && <Loader2 className="h-2.5 w-2.5 animate-spin" />}
                            </p>
                            {img.enhancing ? (
                              <div className="rounded bg-muted/50 flex items-center justify-center h-28">
                                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                              </div>
                            ) : enhDisplayUrl ? (
                              <>
                                <img src={enhDisplayUrl} alt="" className="rounded w-full object-contain max-h-28" />
                                <div className="flex gap-1">
                                  <button type="button" onClick={() => setEditTarget({ key: img.key, side: 'enhanced', mode: 'crop' })}
                                    className="flex-1 flex items-center justify-center gap-0.5 text-[9px] px-1 py-0.5 rounded border border-border hover:border-primary/60 hover:text-primary text-muted-foreground transition-colors">
                                    <Crop className="h-2 w-2" /> Crop
                                  </button>
                                  <button type="button" onClick={() => setEditTarget({ key: img.key, side: 'enhanced', mode: 'edit' })}
                                    className="flex-1 flex items-center justify-center gap-0.5 text-[9px] px-1 py-0.5 rounded border border-border hover:border-primary/60 hover:text-primary text-muted-foreground transition-colors">
                                    <Eraser className="h-2 w-2" /> Edit
                                  </button>
                                </div>
                              </>
                            ) : (
                              <div className="rounded bg-muted/50 flex items-center justify-center h-28">
                                <p className="text-[10px] text-muted-foreground">Failed</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        // Saved image: show single preview with crop/edit
                        <div className="p-2 space-y-1.5">
                          {displayUrl && (
                            <img src={displayUrl} alt="" className="rounded w-full object-contain max-h-32 mx-auto" />
                          )}
                          <div className="flex gap-1">
                            <button type="button" onClick={() => setEditTarget({ key: img.key, side: 'current', mode: 'crop' })}
                              className="flex-1 flex items-center justify-center gap-1 text-[10px] px-1.5 py-0.5 rounded border border-border hover:border-primary/60 hover:text-primary text-muted-foreground transition-colors">
                              <Crop className="h-2.5 w-2.5" /> Crop
                            </button>
                            <button type="button" onClick={() => setEditTarget({ key: img.key, side: 'current', mode: 'edit' })}
                              className="flex-1 flex items-center justify-center gap-1 text-[10px] px-1.5 py-0.5 rounded border border-border hover:border-primary/60 hover:text-primary text-muted-foreground transition-colors">
                              <Eraser className="h-2.5 w-2.5" /> Edit
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Add image drop zone */}
            <div
              onClick={() => fileRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors text-center",
                "hover:border-primary/60 hover:bg-primary/5 border-muted-foreground/30"
              )}
            >
              <div className="py-2 space-y-1">
                <div className="flex items-center justify-center gap-2">
                  <ImageIcon className="h-5 w-5 text-muted-foreground/50" />
                  <Plus className="h-4 w-4 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {images.length === 0 ? 'Click to add a drawing' : 'Click to add another drawing'}
                </p>
                <p className="text-xs text-muted-foreground/60">AI will auto-enhance to clean B&W · multiple images supported</p>
              </div>
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
          </div>

          {/* Audience */}
          <div className="space-y-2">
            <Label>Audience</Label>
            <div className="flex flex-wrap gap-1.5">
              {[...new Set([...AUDIENCE_OPTIONS, ...audience.filter(a => !AUDIENCE_OPTIONS.includes(a))])].map(a => (
                <button
                  key={a} type="button"
                  onClick={() => toggleItem(audience, setAudience, a)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                    audience.includes(a)
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
                    if (v && !audience.includes(v)) setAudience([...audience, v]);
                    setAudienceInput('');
                  }
                }}
                className="h-8 text-xs"
              />
              <Button type="button" variant="outline" className="h-8 text-xs px-3" onClick={() => {
                const v = audienceInput.trim();
                if (v && !audience.includes(v)) setAudience([...audience, v]);
                setAudienceInput('');
              }}>Add</Button>
            </div>
          </div>

          {/* Product Type */}
          <div className="space-y-2">
            <Label>Product Type</Label>
            <div className="flex flex-wrap gap-1.5">
              {[...new Set([...PRODUCT_OPTIONS, ...productType.filter(p => !PRODUCT_OPTIONS.includes(p))])].map(p => (
                <button
                  key={p} type="button"
                  onClick={() => toggleItem(productType, setProductType, p)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                    productType.includes(p)
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
                    if (v && !productType.includes(v)) setProductType([...productType, v]);
                    setProductTypeInput('');
                  }
                }}
                className="h-8 text-xs"
              />
              <Button type="button" variant="outline" className="h-8 text-xs px-3" onClick={() => {
                const v = productTypeInput.trim();
                if (v && !productType.includes(v)) setProductType([...productType, v]);
                setProductTypeInput('');
              }}>Add</Button>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. rule-of-72"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              />
              <Button type="button" variant="outline" onClick={addTag}>Add</Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map(t => (
                  <Badge key={t} variant="secondary" className="gap-1 pr-1">
                    {t}
                    <button type="button" onClick={() => setTags(tags.filter(x => x !== t))} className="hover:text-destructive transition-colors">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Save */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1" disabled={saving}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} className="flex-1" disabled={saving}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving…</> : <><Save className="h-4 w-4 mr-2" />Save Changes</>}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
