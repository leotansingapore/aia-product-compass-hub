import { useState } from 'react';
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

interface CreateModuleFormProps {
  categoryId: string;
  onModuleCreated?: () => void;
}

export function CreateModuleForm({ categoryId, onModuleCreated }: CreateModuleFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [moduleData, setModuleData] = useState({
    title: '',
    description: '',
    tags: '',
    highlights: '',
    publishImmediately: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Generate SEO-friendly slug from title
      const baseSlug = createSlug(moduleData.title);
      
      // Check if slug already exists
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('id', baseSlug)
        .maybeSingle();
      
      // If slug exists, append timestamp to make it unique
      let finalSlug = baseSlug;
      if (existingProduct) {
        const timestamp = Date.now().toString(36);
        finalSlug = `${baseSlug}-${timestamp}`;
      }

      const { error } = await supabase
        .from('products')
        .insert({
          id: finalSlug,
          title: moduleData.title,
          description: moduleData.description,
          category_id: categoryId,
          tags: moduleData.tags ? moduleData.tags.split(',').map(tag => tag.trim()) : [],
          highlights: moduleData.highlights ? moduleData.highlights.split(',').map(highlight => highlight.trim()) : [],
          training_videos: [],
          useful_links: [],
          published: moduleData.publishImmediately
        });

      if (error) throw error;

      toast({
        title: "Module Created",
        description: `Successfully created "${moduleData.title}" module.`
      });

      // Reset form
      setModuleData({
        title: '',
        description: '',
        tags: '',
        highlights: '',
        publishImmediately: false
      });
      setIsOpen(false);
      onModuleCreated?.();

    } catch (error) {
      console.error('Error creating module:', error);
      toast({
        title: "Error",
        description: "Failed to create module. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="mb-6"
        variant="default"
      >
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
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Module Title *</Label>
            <Input
              id="title"
              value={moduleData.title}
              onChange={(e) => setModuleData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter module title"
              required
              disabled={saving}
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={moduleData.description}
              onChange={(e) => setModuleData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter module description"
              disabled={saving}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={moduleData.tags}
              onChange={(e) => setModuleData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="e.g. Beginner, Advanced, Core Skills"
              disabled={saving}
            />
          </div>

          <div>
            <Label htmlFor="highlights">Key Highlights (comma-separated)</Label>
            <Input
              id="highlights"
              value={moduleData.highlights}
              onChange={(e) => setModuleData(prev => ({ ...prev, highlights: e.target.value }))}
              placeholder="e.g. Interactive content, Assessment included"
              disabled={saving}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="publish-module" className="text-sm cursor-pointer">Publish immediately</Label>
            <Switch
              id="publish-module"
              checked={moduleData.publishImmediately}
              onCheckedChange={(checked) => setModuleData(prev => ({ ...prev, publishImmediately: checked }))}
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={saving || !moduleData.title.trim()}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Module
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}