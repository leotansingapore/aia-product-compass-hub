import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { createSlug } from '@/utils/slugUtils';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus } from 'lucide-react';

export interface CreateModuleFormProps {
  categoryId: string;
  onModuleCreated?: () => void;
  /** `default`: collapsible button + card. `embedded`: form only (e.g. inside Sheet). */
  variant?: 'default' | 'embedded';
  /** Called after successful create and when user cancels (embedded variant). */
  onEmbeddedClose?: () => void;
  /** Post-create route; default `/product/:slug`. */
  getModuleUrl?: (slug: string) => string;
}

export function CreateModuleForm({
  categoryId,
  onModuleCreated,
  variant = 'default',
  onEmbeddedClose,
  getModuleUrl,
}: CreateModuleFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const [moduleData, setModuleData] = useState({
    title: '',
    description: '',
    tags: '',
    highlights: '',
    publishImmediately: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const baseSlug = createSlug(moduleData.title);

      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('id', baseSlug)
        .maybeSingle();

      let finalSlug = baseSlug;
      if (existingProduct) {
        const timestamp = Date.now().toString(36);
        finalSlug = `${baseSlug}-${timestamp}`;
      }

      const defaultPage = {
        id: `page-${Date.now()}`,
        title: 'Page 1',
        url: '',
        description: '',
        category: '',
        order: 0,
        rich_content: '',
        legacy_fields: {
          migrated_at: new Date().toISOString(),
          notes: '',
          transcript: '',
          useful_links: [],
          attachments: [],
        },
      };

      const { error } = await supabase.from('products').insert({
        id: finalSlug,
        title: moduleData.title,
        description: moduleData.description,
        category_id: categoryId,
        tags: moduleData.tags ? moduleData.tags.split(',').map((tag) => tag.trim()) : [],
        highlights: moduleData.highlights
          ? moduleData.highlights.split(',').map((highlight) => highlight.trim())
          : [],
        training_videos: [defaultPage],
        useful_links: [],
        published: moduleData.publishImmediately,
      });

      if (error) throw error;

      toast({
        title: 'Module Created',
        description: `Successfully created "${moduleData.title}" module.`,
      });

      setModuleData({
        title: '',
        description: '',
        tags: '',
        highlights: '',
        publishImmediately: false,
      });

      onModuleCreated?.();

      if (variant === 'default') {
        setIsOpen(false);
      } else {
        onEmbeddedClose?.();
      }

      const path = getModuleUrl ? getModuleUrl(finalSlug) : `/product/${finalSlug}`;
      navigate(path);
    } catch (error) {
      console.error('Error creating module:', error);
      toast({
        title: 'Error',
        description: 'Failed to create module. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const formBody = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="create-module-title">Module Title *</Label>
        <Input
          id="create-module-title"
          value={moduleData.title}
          onChange={(e) => setModuleData((prev) => ({ ...prev, title: e.target.value }))}
          placeholder="Enter module title"
          required
          disabled={saving}
        />
      </div>

      <div>
        <Label htmlFor="create-module-description">Description</Label>
        <Textarea
          id="create-module-description"
          value={moduleData.description}
          onChange={(e) => setModuleData((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Enter module description"
          disabled={saving}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="create-module-tags">Tags (comma-separated)</Label>
        <Input
          id="create-module-tags"
          value={moduleData.tags}
          onChange={(e) => setModuleData((prev) => ({ ...prev, tags: e.target.value }))}
          placeholder="e.g. Beginner, Advanced, Core Skills"
          disabled={saving}
        />
      </div>

      <div>
        <Label htmlFor="create-module-highlights">Key Highlights (comma-separated)</Label>
        <Input
          id="create-module-highlights"
          value={moduleData.highlights}
          onChange={(e) => setModuleData((prev) => ({ ...prev, highlights: e.target.value }))}
          placeholder="e.g. Interactive content, Assessment included"
          disabled={saving}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="create-module-publish" className="text-sm cursor-pointer">
          Publish immediately
        </Label>
        <Switch
          id="create-module-publish"
          checked={moduleData.publishImmediately}
          onCheckedChange={(checked) =>
            setModuleData((prev) => ({ ...prev, publishImmediately: checked }))
          }
        />
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => {
            if (variant === 'embedded') {
              onEmbeddedClose?.();
            } else {
              setIsOpen(false);
            }
          }}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="w-full sm:w-auto"
          disabled={saving || !moduleData.title.trim()}
        >
          {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Create module
        </Button>
      </div>
    </form>
  );

  if (variant === 'embedded') {
    return <div className="px-1">{formBody}</div>;
  }

  if (!isOpen) {
    return (
      <Button onClick={() => setIsOpen(true)} className="mb-6" variant="default">
        <Plus className="w-4 h-4 mr-2" />
        Create New Module
      </Button>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Create New Module</CardTitle>
      </CardHeader>
      <CardContent>{formBody}</CardContent>
    </Card>
  );
}
