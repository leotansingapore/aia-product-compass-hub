import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Plus, Edit, Trash2, ExternalLink } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import type { UsefulLink } from '@/hooks/useProducts';

interface EditableLinksProps {
  links: UsefulLink[];
  onSave?: (newLinks: UsefulLink[]) => Promise<void>;
  className?: string;
  readOnly?: boolean;
}

const defaultIcons = ['📄', '📋', '🌐', '📚', '📊', '🎥', '🔗', '📱'];

export function EditableLinks({ links, onSave, className = "", readOnly = false }: EditableLinksProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLinks, setEditLinks] = useState<UsefulLink[]>(links);
  const [newLink, setNewLink] = useState<UsefulLink>({ name: '', url: '', icon: '📄' });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const { isAdminMode, isAdmin } = useAdmin();
  const { toast } = useToast();

  // Update editLinks when links prop changes, but not while editing
  useEffect(() => {
    if (!isEditing) {
      setEditLinks(links);
    }
  }, [links, isEditing]);

  const handleSave = async () => {
    if (!onSave) {
      console.warn('EditableLinks: onSave callback not provided');
      return;
    }

    setSaving(true);
    console.log('🔗 EditableLinks handleSave called with:', editLinks);
    
    try {
      // Validate links before saving
      const validLinks = editLinks.filter(link => link.name.trim() && link.url.trim());
      console.log('🔗 Valid links to save:', validLinks);
      
      await onSave(validLinks);
      setIsEditing(false);
      setEditingIndex(null);
      console.log('✅ EditableLinks save successful');
      toast({
        title: "Success",
        description: "Useful links saved successfully",
      });
    } catch (error) {
      console.error('❌ EditableLinks save failed:', error);
      toast({
        title: "Error",
        description: "Failed to save links. Please try again.",
        variant: "destructive",
      });
      // Reset to original links on failure
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
      const updatedLinks = [...editLinks, { ...newLink }];
      setEditLinks(updatedLinks);
      setNewLink({ name: '', url: '', icon: '📄' });
      console.log('🔗 Added new link:', newLink);
    }
  };

  const updateLink = (index: number, updatedLink: UsefulLink) => {
    const updated = [...editLinks];
    updated[index] = updatedLink;
    setEditLinks(updated);
    console.log('🔗 Updated link at index', index, ':', updatedLink);
  };

  const removeLink = (index: number) => {
    const updated = editLinks.filter((_, i) => i !== index);
    setEditLinks(updated);
    console.log('🔗 Removed link at index', index);
  };

  const isValidUrl = (url: string) => {
    try {
      // Allow URLs without protocol by prepending https://
      const urlToTest = url.startsWith('http') ? url : `https://${url}`;
      new URL(urlToTest);
      return true;
    } catch {
      return false;
    }
  };

  // Allow editing without authentication
  const canEdit = true;
  
  if (!canEdit || readOnly || !onSave) {
    return (
      <div className={`grid grid-cols-1 3xl:grid-cols-2 gap-3 ${className}`}>
        {links.map((link, index) => (
          <Button
            key={index}
            variant="outline"
            className="justify-start min-w-0"
            onClick={() => {
              const urlToOpen = link.url.startsWith('http') ? link.url : `https://${link.url}`;
              window.open(urlToOpen, '_blank');
            }}
            disabled={!isValidUrl(link.url)}
          >
            <span className="mr-2 flex-shrink-0">{link.icon}</span>
            <span className="truncate">{link.name}</span>
            <ExternalLink className="h-4 w-4 ml-auto flex-shrink-0" />
          </Button>
        ))}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4">
          {editLinks.map((link, index) => (
            <div key={index} className="border rounded-lg p-4 bg-card">
              {editingIndex === index ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-[auto_1fr] gap-3 items-start">
                    <select
                      value={link.icon}
                      onChange={(e) => updateLink(index, { ...link, icon: e.target.value })}
                      className="h-10 w-16 px-2 py-2 border border-input rounded-md text-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {defaultIcons.map(icon => (
                        <option key={icon} value={icon}>{icon}</option>
                      ))}
                    </select>
                    <Input
                      value={link.name}
                      onChange={(e) => updateLink(index, { ...link, name: e.target.value })}
                      placeholder="Link name"
                      className="w-full"
                    />
                  </div>
                  <Input
                    value={link.url}
                    onChange={(e) => updateLink(index, { ...link, url: e.target.value })}
                    placeholder="https://example.com"
                    className="w-full"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => setEditingIndex(null)} variant="outline">
                      <Check className="h-4 w-4" />
                      Done
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-xl flex-shrink-0">{link.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{link.name}</div>
                      <div className="text-micro text-muted-foreground truncate">
                        {link.url}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0 ml-2">
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

        <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 bg-primary/5">
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Add New Link</h4>
            <div className="grid grid-cols-[auto_1fr] gap-3 items-start">
              <select
                value={newLink.icon}
                onChange={(e) => setNewLink({ ...newLink, icon: e.target.value })}
                className="h-10 w-16 px-2 py-2 border border-input rounded-md text-xl bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {defaultIcons.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
              <Input
                value={newLink.name}
                onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                placeholder="Link name"
                className="w-full"
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
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} disabled={saving} className="bg-green-600 hover:bg-green-700">
            <Check className="h-4 w-4 mr-1" />
            {saving ? 'Saving...' : 'Save Changes'}
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
    <div className={`space-y-3 ${className}`}>
      <div className="grid grid-cols-1 3xl:grid-cols-2 gap-3">
        {links.length > 0 ? (
          links.map((link, index) => (
            <Button
              key={index}
              variant="outline"
              className="justify-start hover:border-primary hover:bg-primary/5 min-w-0"
              onClick={() => {
                const urlToOpen = link.url.startsWith('http') ? link.url : `https://${link.url}`;
                window.open(urlToOpen, '_blank');
              }}
              disabled={!isValidUrl(link.url)}
            >
              <span className="mr-2 flex-shrink-0">{link.icon}</span>
              <span className="truncate">{link.name}</span>
              <ExternalLink className="h-4 w-4 ml-auto flex-shrink-0" />
            </Button>
          ))
        ) : (
          <>
            <Button variant="outline" className="justify-start hover:border-primary hover:bg-primary/5" disabled>
              📄 Benefit Illustration (PDF)
            </Button>
            <Button variant="outline" className="justify-start hover:border-primary hover:bg-primary/5" disabled>
              📋 Product Summary (PDF)
            </Button>
            <Button variant="outline" className="justify-start hover:border-primary hover:bg-primary/5" disabled>
              🌐 AIA Website
            </Button>
            <Button variant="outline" className="justify-start hover:border-primary hover:bg-primary/5" disabled>
              📚 Supplementary Materials
            </Button>
          </>
        )}
      </div>
      <div 
        className="flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed border-primary/30 rounded p-2 cursor-pointer hover:bg-primary/10 hover:border-primary/20 transition-all duration-200 bg-primary/5"
        onClick={() => setIsEditing(true)}
        title="🔧 ADMIN MODE: Click to edit useful links"
      >
        <Plus className="h-4 w-4 mr-1" />
        Click to add/edit links
      </div>
    </div>
  );
}