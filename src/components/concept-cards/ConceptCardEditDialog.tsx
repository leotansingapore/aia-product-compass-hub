import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, X, ImageIcon, Save, Crop, Eraser } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useConceptCardsMutations, ConceptCard } from '@/hooks/useConceptCards';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ImageCropper } from './ImageCropper';
import { InlineImageEditor } from './InlineImageEditor';

const AUDIENCE_OPTIONS = ['NSF / NS', 'Young Adults', 'Working Adults', 'Pre-Retirees (50-65)', 'Parents', 'General'];
const PRODUCT_OPTIONS = ['Investment', 'Endowment', 'Whole Life', 'Term', 'Medical', 'General'];

interface Props {
  card: ConceptCard | null;
  onClose: () => void;
  onUpdated: () => void;
}

type EditMode = 'crop-current' | 'edit-current' | 'crop-enhanced' | 'edit-enhanced' | null;

export function ConceptCardEditDialog({ card, onClose, onUpdated }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [audience, setAudience] = useState<string[]>([]);
  const [productType, setProductType] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [newFile, setNewFile] = useState<File | null>(null);
  const [newPreview, setNewPreview] = useState<string | null>(null);
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null);
  const [enhancing, setEnhancing] = useState(false);
  const [saving, setSaving] = useState(false);
  // Edited versions of images (base64 overrides)
  const [editedCurrentUrl, setEditedCurrentUrl] = useState<string | null>(null);
  const [editedEnhancedUrl, setEditedEnhancedUrl] = useState<string | null>(null);
  const [editMode, setEditMode] = useState<EditMode>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { updateCard, uploadOriginalImage } = useConceptCardsMutations();

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
      setAudience(card.audience || []);
      setProductType(card.product_type || []);
      setTags(card.tags || []);
      setNewFile(null);
      setNewPreview(null);
      setEnhancedUrl(null);
      setEditedCurrentUrl(null);
      setEditedEnhancedUrl(null);
      setEditMode(null);
    }
  }, [card]);

  if (!card) return null;

  const handleClose = () => {
    setNewFile(null); setNewPreview(null); setEnhancedUrl(null);
    setEditedCurrentUrl(null); setEditedEnhancedUrl(null); setEditMode(null);
    setSaving(false); setEnhancing(false);
    onClose();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setNewFile(file);
    setEnhancedUrl(null);
    setEditedEnhancedUrl(null);
    const reader = new FileReader();
    reader.onload = ev => setNewPreview(ev.target?.result as string);
    reader.readAsDataURL(file);

    setEnhancing(true);
    try {
      const b64Reader = new FileReader();
      b64Reader.onload = async ev => {
        const base64 = ev.target?.result as string;
        const { data, error } = await supabase.functions.invoke('enhance-concept-image', {
          body: { imageBase64: base64, fileName: file.name },
        });
        if (error || !data?.enhancedUrl) {
          toast.error('Enhancement failed — original will be used');
        } else {
          setEnhancedUrl(data.enhancedUrl);
          toast.success('Image enhanced ✨');
        }
        setEnhancing(false);
      };
      b64Reader.readAsDataURL(file);
    } catch {
      setEnhancing(false);
      toast.error('Enhancement failed — original will be used');
    }
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

    const updates: Partial<ConceptCard> = {
      title: title.trim(),
      description: description.trim() || null,
      audience,
      product_type: productType,
      tags,
    };

    if (newFile) {
      const originalUrl = await uploadOriginalImage(newFile);
      updates.original_image_url = originalUrl;
      // Use edited enhanced > edited original > enhanced > original
      const finalEnhanced = editedEnhancedUrl || enhancedUrl;
      const finalOriginal = editedCurrentUrl || originalUrl;
      updates.image_url = finalEnhanced
        ? (editedEnhancedUrl ? await uploadBase64(editedEnhancedUrl, 'enhanced') : finalEnhanced)
        : finalOriginal;
    } else if (editedCurrentUrl) {
      // Admin edited/cropped the existing drawing without uploading a new file
      const uploaded = await uploadBase64(editedCurrentUrl, 'edited');
      updates.image_url = uploaded;
    }

    const ok = await updateCard(card.id, updates);
    setSaving(false);
    if (ok) { onUpdated(); handleClose(); }
  };

  // ── Image action bar helper ─────────────────────────────────────────────
  const ImageActions = ({
    onCrop,
    onEdit,
    label,
  }: { onCrop: () => void; onEdit: () => void; label: string }) => (
    <div className="flex items-center gap-1 mt-1">
      <span className="text-[10px] text-muted-foreground flex-1">{label}</span>
      <button
        type="button"
        onClick={onCrop}
        className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground hover:border-primary/60 hover:text-primary transition-colors"
      >
        <Crop className="h-2.5 w-2.5" /> Crop
      </button>
      <button
        type="button"
        onClick={onEdit}
        className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border border-border text-muted-foreground hover:border-primary/60 hover:text-primary transition-colors"
      >
        <Eraser className="h-2.5 w-2.5" /> Edit
      </button>
    </div>
  );

  const currentDisplayUrl = editedCurrentUrl || card.image_url;
  const enhancedDisplayUrl = editedEnhancedUrl || enhancedUrl;

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

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Hint / subtitle <span className="text-muted-foreground text-xs">(optional)</span></Label>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} />
          </div>

          {/* Image section */}
          <div className="space-y-2">
            <Label>Drawing / Diagram</Label>

            {/* ── Edit/crop modes ── */}
            {editMode === 'crop-current' && currentDisplayUrl && (
              <div className="rounded-xl border overflow-hidden">
                <ImageCropper
                  imageUrl={currentDisplayUrl}
                  maxImgClass="max-w-full max-h-[40vh]"
                  onCrop={url => { setEditedCurrentUrl(url); setEditMode(null); toast.success('Cropped ✓'); }}
                  onCancel={() => setEditMode(null)}
                />
              </div>
            )}
            {editMode === 'edit-current' && currentDisplayUrl && (
              <div className="rounded-xl border overflow-hidden">
                <InlineImageEditor
                  imageUrl={currentDisplayUrl}
                  onApply={url => { setEditedCurrentUrl(url); setEditMode(null); toast.success('Image updated ✓'); }}
                  onCancel={() => setEditMode(null)}
                />
              </div>
            )}
            {editMode === 'crop-enhanced' && enhancedDisplayUrl && (
              <div className="rounded-xl border overflow-hidden">
                <ImageCropper
                  imageUrl={enhancedDisplayUrl}
                  maxImgClass="max-w-full max-h-[40vh]"
                  onCrop={url => { setEditedEnhancedUrl(url); setEditMode(null); toast.success('Cropped ✓'); }}
                  onCancel={() => setEditMode(null)}
                />
              </div>
            )}
            {editMode === 'edit-enhanced' && enhancedDisplayUrl && (
              <div className="rounded-xl border overflow-hidden">
                <InlineImageEditor
                  imageUrl={enhancedDisplayUrl}
                  onApply={url => { setEditedEnhancedUrl(url); setEditMode(null); toast.success('Image updated ✓'); }}
                  onCancel={() => setEditMode(null)}
                />
              </div>
            )}

            {/* ── Current drawing (shown when no edit mode active) ── */}
            {!editMode && currentDisplayUrl && !newPreview && (
              <div className="rounded-xl border overflow-hidden bg-muted/20 p-2">
                <img src={currentDisplayUrl} alt="Current" className="max-h-40 object-contain mx-auto rounded" />
                <ImageActions
                  label={editedCurrentUrl ? 'Current drawing (edited)' : 'Current drawing'}
                  onCrop={() => setEditMode('crop-current')}
                  onEdit={() => setEditMode('edit-current')}
                />
              </div>
            )}

            {/* ── New upload preview ── */}
            {!editMode && newPreview && (
              <div className="grid grid-cols-2 gap-3 rounded-xl border p-3 bg-muted/10">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">New original</p>
                  <img src={newPreview} alt="New" className="rounded-lg w-full object-contain max-h-40" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                    Enhanced {enhancing && <Loader2 className="h-3 w-3 animate-spin" />}
                  </p>
                  {enhancing ? (
                    <div className="rounded-lg bg-muted/50 flex items-center justify-center h-40">
                      <Sparkles className="h-6 w-6 text-primary mx-auto animate-pulse" />
                    </div>
                  ) : enhancedDisplayUrl ? (
                    <>
                      <img src={enhancedDisplayUrl} alt="Enhanced" className="rounded-lg w-full object-contain max-h-40" />
                      <ImageActions
                        label={editedEnhancedUrl ? 'Enhanced (edited)' : 'Enhanced'}
                        onCrop={() => setEditMode('crop-enhanced')}
                        onEdit={() => setEditMode('edit-enhanced')}
                      />
                    </>
                  ) : (
                    <div className="rounded-lg bg-muted/50 flex items-center justify-center h-40">
                      <p className="text-xs text-muted-foreground">Enhancement failed</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── Drop zone ── */}
            {!editMode && (
              <div
                onClick={() => fileRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors text-center",
                  "hover:border-primary/60 hover:bg-primary/5 border-muted-foreground/30"
                )}
              >
                <div className="py-2 space-y-1">
                  <ImageIcon className="h-6 w-6 text-muted-foreground/50 mx-auto" />
                  <p className="text-sm text-muted-foreground">{newPreview ? 'Click to replace again' : 'Click to replace drawing'}</p>
                  <p className="text-xs text-muted-foreground/60">AI will auto-enhance to clean B&W</p>
                </div>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>

          {/* Audience */}
          <div className="space-y-2">
            <Label>Audience</Label>
            <div className="flex flex-wrap gap-1.5">
              {AUDIENCE_OPTIONS.map(a => (
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
          </div>

          {/* Product Type */}
          <div className="space-y-2">
            <Label>Product Type</Label>
            <div className="flex flex-wrap gap-1.5">
              {PRODUCT_OPTIONS.map(p => (
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
                  <Badge key={t} variant="secondary" className="gap-1">
                    {t}
                    <button onClick={() => setTags(tags.filter(x => x !== t))}><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={handleClose} disabled={saving}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave} disabled={saving || enhancing || !!editMode}>
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
