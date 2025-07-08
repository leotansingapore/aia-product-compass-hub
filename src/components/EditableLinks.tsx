import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import type { UsefulLink } from '@/hooks/useProducts';

interface EditableLinksProps {
  links: UsefulLink[];
  onSave: (newLinks: UsefulLink[]) => Promise<void>;
  className?: string;
}

const defaultIcons = ['📄', '📋', '🌐', '📚', '📊', '🎥', '🔗', '📱'];

export function EditableLinks({ links, onSave, className = "" }: EditableLinksProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLinks, setEditLinks] = useState<UsefulLink[]>(links);
  const [newLink, setNewLink] = useState<UsefulLink>({ name: '', url: '', icon: '📄' });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const { isAdminMode } = useAdmin();
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    console.log('🔗 EditableLinks handleSave called with:', editLinks);
    
    try {
      await onSave(editLinks);
      setIsEditing(false);
      setEditingIndex(null);
      console.log('✅ EditableLinks save successful');
      toast({
        title: "Saved",
        description: "Useful links updated successfully",
      });
    } catch (error) {
      console.error('❌ EditableLinks save failed:', error);
      toast({
        title: "Error",
        description: "Failed to save links",
        variant: "destructive",
      });
      setEditLinks(links);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditLinks(links);
    setNewLink({ name: '', url: '', icon: '📄' });
    setEditingIndex(null);
    setIsEditing(false);
  };

  const addLink = () => {
    if (newLink.name.trim() && newLink.url.trim()) {
      setEditLinks([...editLinks, { ...newLink }]);
      setNewLink({ name: '', url: '', icon: '📄' });
    }
  };

  const updateLink = (index: number, updatedLink: UsefulLink) => {
    const updated = [...editLinks];
    updated[index] = updatedLink;
    setEditLinks(updated);
    setEditingIndex(null);
  };

  const removeLink = (index: number) => {
    setEditLinks(editLinks.filter((_, i) => i !== index));
  };

  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  if (!isAdminMode) {
    return (
      <div className={`grid md:grid-cols-2 gap-3 ${className}`}>
        {links.map((link, index) => (
          <Button
            key={index}
            variant="outline"
            className="justify-start"
            onClick={() => window.open(link.url, '_blank')}
            disabled={!isValidUrl(link.url)}
          >
            <span className="mr-2">{link.icon}</span>
            {link.name}
            <ExternalLink className="h-4 w-4 ml-auto" />
          </Button>
        ))}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-3">
          {editLinks.map((link, index) => (
            <div key={index} className="border rounded-lg p-3 space-y-2">
              {editingIndex === index ? (
                <>
                  <div className="flex gap-2">
                    <select
                      value={link.icon}
                      onChange={(e) => updateLink(index, { ...link, icon: e.target.value })}
                      className="px-2 py-1 border rounded text-xl w-16"
                    >
                      {defaultIcons.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                    <Input
                      value={link.name}
                      onChange={(e) => updateLink(index, { ...link, name: e.target.value })}
                      placeholder="Link name"
                      className="flex-1"
                    />
                  </div>
                  <Input
                    value={link.url}
                    onChange={(e) => updateLink(index, { ...link, url: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setEditingIndex(null)}>
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{link.icon}</span>
                    <div>
                      <div className="font-medium">{link.name}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {link.url}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditingIndex(index)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeLink(index)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-2 border-dashed border-primary/30 rounded-lg p-3 space-y-2">
          <div className="flex gap-2">
            <select
              value={newLink.icon}
              onChange={(e) => setNewLink({ ...newLink, icon: e.target.value })}
              className="px-2 py-1 border rounded text-xl w-16"
            >
              {defaultIcons.map(icon => (
                <option key={icon} value={icon}>{icon}</option>
              ))}
            </select>
            <Input
              value={newLink.name}
              onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
              placeholder="Link name"
              className="flex-1"
            />
          </div>
          <Input
            value={newLink.url}
            onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
            placeholder="https://example.com"
            onKeyPress={(e) => e.key === 'Enter' && addLink()}
          />
          <Button size="sm" onClick={addLink} disabled={!newLink.name.trim() || !newLink.url.trim()}>
            <Plus className="h-4 w-4 mr-1" />
            Add Link
          </Button>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            <Check className="h-4 w-4 mr-1" />
            Save Links
          </Button>
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`grid md:grid-cols-2 gap-3 ${className} cursor-pointer hover:bg-primary/10 hover:border-primary/20 border-2 border-dashed border-primary/30 p-3 rounded transition-all duration-200 bg-primary/5`}
      onClick={() => setIsEditing(true)}
      title="🔧 ADMIN MODE: Click to edit useful links"
    >
      {links.length > 0 ? (
        links.map((link, index) => (
          <Button
            key={index}
            variant="outline"
            className="justify-start pointer-events-none"
          >
            <span className="mr-2">{link.icon}</span>
            {link.name}
          </Button>
        ))
      ) : (
        <>
          <Button variant="outline" className="justify-start pointer-events-none" disabled>
            📄 Benefit Illustration (PDF)
          </Button>
          <Button variant="outline" className="justify-start pointer-events-none" disabled>
            📋 Product Summary (PDF)
          </Button>
          <Button variant="outline" className="justify-start pointer-events-none" disabled>
            🌐 AIA Website
          </Button>
          <Button variant="outline" className="justify-start pointer-events-none" disabled>
            📚 Supplementary Materials
          </Button>
        </>
      )}
      <div className="flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed border-primary/30 rounded p-2">
        <Plus className="h-4 w-4 mr-1" />
        Click to add/edit links
      </div>
    </div>
  );
}