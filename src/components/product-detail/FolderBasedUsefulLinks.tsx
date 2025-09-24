import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X, Plus, Edit, Trash2, ExternalLink, Folder, FolderPlus, ChevronDown, ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { UsefulLink } from '@/hooks/useProducts';

interface CompetitorFolder {
  name: string;
  links: UsefulLink[];
  expanded?: boolean;
}

interface FolderBasedUsefulLinksProps {
  folders: CompetitorFolder[];
  onSave?: (newFolders: CompetitorFolder[]) => Promise<void>;
  className?: string;
  readOnly?: boolean;
}

const defaultIcons = ['📄', '📋', '🌐', '📚', '📊', '🎥', '🔗', '📱', '💼', '🏢'];

export function FolderBasedUsefulLinks({ folders, onSave, className = "", readOnly = false }: FolderBasedUsefulLinksProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editFolders, setEditFolders] = useState<CompetitorFolder[]>(folders);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingFolderIndex, setEditingFolderIndex] = useState<number | null>(null);
  const [editingLinkIndex, setEditingLinkIndex] = useState<{ folderIndex: number; linkIndex: number } | null>(null);
  const [newLink, setNewLink] = useState<UsefulLink>({ name: '', url: '', icon: '📄' });
  const [addingLinkToFolder, setAddingLinkToFolder] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!isEditing) {
      setEditFolders(folders);
    }
  }, [folders, isEditing]);

  const handleSave = async () => {
    if (!onSave) return;

    setSaving(true);
    try {
      const validFolders = editFolders.map(folder => ({
        ...folder,
        links: folder.links.filter(link => link.name.trim() && link.url.trim())
      })).filter(folder => folder.name.trim());
      
      await onSave(validFolders);
      setIsEditing(false);
      setEditingFolderIndex(null);
      setEditingLinkIndex(null);
      setAddingLinkToFolder(null);
      toast({
        title: "Success",
        description: "Competitor folders saved successfully",
      });
    } catch (error) {
      console.error('Failed to save folders:', error);
      toast({
        title: "Error",
        description: "Failed to save folders. Please try again.",
        variant: "destructive",
      });
      setEditFolders(folders);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditFolders(folders);
    setNewFolderName('');
    setNewLink({ name: '', url: '', icon: '📄' });
    setEditingFolderIndex(null);
    setEditingLinkIndex(null);
    setAddingLinkToFolder(null);
    setIsEditing(false);
  };

  const addFolder = () => {
    if (newFolderName.trim()) {
      const updatedFolders = [...editFolders, { name: newFolderName, links: [], expanded: true }];
      setEditFolders(updatedFolders);
      setNewFolderName('');
    }
  };

  const updateFolderName = (index: number, newName: string) => {
    const updated = [...editFolders];
    updated[index].name = newName;
    setEditFolders(updated);
  };

  const removeFolder = (index: number) => {
    const updated = editFolders.filter((_, i) => i !== index);
    setEditFolders(updated);
  };

  const addLinkToFolder = (folderIndex: number) => {
    if (newLink.name.trim() && newLink.url.trim()) {
      const updated = [...editFolders];
      updated[folderIndex].links.push({ ...newLink });
      setEditFolders(updated);
      setNewLink({ name: '', url: '', icon: '📄' });
      setAddingLinkToFolder(null);
    }
  };

  const updateLinkInFolder = (folderIndex: number, linkIndex: number, updatedLink: UsefulLink) => {
    const updated = [...editFolders];
    updated[folderIndex].links[linkIndex] = updatedLink;
    setEditFolders(updated);
  };

  const removeLinkFromFolder = (folderIndex: number, linkIndex: number) => {
    const updated = [...editFolders];
    updated[folderIndex].links = updated[folderIndex].links.filter((_, i) => i !== linkIndex);
    setEditFolders(updated);
  };

  const toggleFolder = (index: number) => {
    const updated = [...editFolders];
    updated[index].expanded = !updated[index].expanded;
    setEditFolders(updated);
  };

  const isValidUrl = (url: string) => {
    try {
      const urlToTest = url.startsWith('http') ? url : `https://${url}`;
      new URL(urlToTest);
      return true;
    } catch {
      return false;
    }
  };

  const canEdit = true;

  if (!canEdit || readOnly || !onSave) {
    return (
      <div className={`space-y-4 ${className}`}>
        {folders.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Folder className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No competitor folders created yet</p>
          </div>
        ) : (
          folders.map((folder, folderIndex) => (
            <Collapsible key={folderIndex} defaultOpen={folder.expanded}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-start mb-2">
                  <ChevronRight className="h-4 w-4 mr-2" />
                  <Folder className="h-4 w-4 mr-2" />
                  {folder.name}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {folder.links.length} links
                  </span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-6">
                <div className="grid md:grid-cols-2 gap-2">
                  {folder.links.map((link, linkIndex) => (
                    <Button
                      key={linkIndex}
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => {
                        const urlToOpen = link.url.startsWith('http') ? link.url : `https://${link.url}`;
                        window.open(urlToOpen, '_blank');
                      }}
                      disabled={!isValidUrl(link.url)}
                    >
                      <span className="mr-2">{link.icon}</span>
                      {link.name}
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </Button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))
        )}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        {editFolders.map((folder, folderIndex) => (
          <div key={folderIndex} className="border rounded-lg p-4 bg-card">
            <div className="flex items-center justify-between mb-4">
              {editingFolderIndex === folderIndex ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    value={folder.name}
                    onChange={(e) => updateFolderName(folderIndex, e.target.value)}
                    placeholder="Competitor name (e.g., Prudential)"
                    className="flex-1"
                  />
                  <Button size="sm" onClick={() => setEditingFolderIndex(null)} variant="outline">
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFolder(folderIndex)}
                    >
                      {folder.expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      <Folder className="h-4 w-4 ml-1" />
                    </Button>
                    <span className="font-medium">{folder.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditingFolderIndex(folderIndex)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeFolder(folderIndex)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </>
              )}
            </div>

            <Collapsible open={folder.expanded}>
              <CollapsibleContent className="space-y-3">
                {folder.links.map((link, linkIndex) => (
                  <div key={linkIndex} className="border rounded p-3 bg-muted/30">
                    {editingLinkIndex?.folderIndex === folderIndex && editingLinkIndex?.linkIndex === linkIndex ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-[auto_1fr] gap-3">
                          <select
                            value={link.icon}
                            onChange={(e) => updateLinkInFolder(folderIndex, linkIndex, { ...link, icon: e.target.value })}
                            className="h-10 w-16 px-2 py-2 border border-input rounded-md text-xl bg-background"
                          >
                            {defaultIcons.map(icon => (
                              <option key={icon} value={icon}>{icon}</option>
                            ))}
                          </select>
                          <Input
                            value={link.name}
                            onChange={(e) => updateLinkInFolder(folderIndex, linkIndex, { ...link, name: e.target.value })}
                            placeholder="Link name"
                          />
                        </div>
                        <Input
                          value={link.url}
                          onChange={(e) => updateLinkInFolder(folderIndex, linkIndex, { ...link, url: e.target.value })}
                          placeholder="https://example.com"
                        />
                        <Button size="sm" onClick={() => setEditingLinkIndex(null)} variant="outline">
                          <Check className="h-4 w-4" />
                          Done
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="text-lg">{link.icon}</span>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium truncate">{link.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{link.url}</div>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => setEditingLinkIndex({ folderIndex, linkIndex })}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => removeLinkFromFolder(folderIndex, linkIndex)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {addingLinkToFolder === folderIndex ? (
                  <div className="border-2 border-dashed border-primary/30 rounded p-3 bg-primary/5">
                    <div className="space-y-3">
                      <div className="grid grid-cols-[auto_1fr] gap-3">
                        <select
                          value={newLink.icon}
                          onChange={(e) => setNewLink({ ...newLink, icon: e.target.value })}
                          className="h-10 w-16 px-2 py-2 border border-input rounded-md text-xl bg-background"
                        >
                          {defaultIcons.map(icon => (
                            <option key={icon} value={icon}>{icon}</option>
                          ))}
                        </select>
                        <Input
                          value={newLink.name}
                          onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
                          placeholder="Link name"
                        />
                      </div>
                      <Input
                        value={newLink.url}
                        onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                        placeholder="https://example.com"
                        onKeyPress={(e) => e.key === 'Enter' && addLinkToFolder(folderIndex)}
                      />
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => addLinkToFolder(folderIndex)} 
                          disabled={!newLink.name.trim() || !newLink.url.trim()}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Link
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setAddingLinkToFolder(null)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => setAddingLinkToFolder(folderIndex)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Link to {folder.name}
                  </Button>
                )}
              </CollapsibleContent>
            </Collapsible>
          </div>
        ))}

        <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 bg-primary/5">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FolderPlus className="h-4 w-4" />
              Add New Competitor Folder
            </h4>
            <Input
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Competitor name (e.g., Great Eastern, Prudential)"
              onKeyPress={(e) => e.key === 'Enter' && addFolder()}
            />
            <Button size="sm" onClick={addFolder} disabled={!newFolderName.trim()}>
              <FolderPlus className="h-4 w-4 mr-1" />
              Add Folder
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
      {folders.length > 0 ? (
        <div className="space-y-3">
          {folders.map((folder, folderIndex) => (
            <Collapsible key={folderIndex} defaultOpen={folder.expanded}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <ChevronRight className="h-4 w-4 mr-2" />
                  <Folder className="h-4 w-4 mr-2" />
                  {folder.name}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {folder.links.length} links
                  </span>
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-6 mt-2">
                <div className="grid md:grid-cols-2 gap-2">
                  {folder.links.map((link, linkIndex) => (
                    <Button
                      key={linkIndex}
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                      onClick={() => {
                        const urlToOpen = link.url.startsWith('http') ? link.url : `https://${link.url}`;
                        window.open(urlToOpen, '_blank');
                      }}
                      disabled={!isValidUrl(link.url)}
                    >
                      <span className="mr-2">{link.icon}</span>
                      {link.name}
                      <ExternalLink className="h-3 w-3 ml-auto" />
                    </Button>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      ) : (
        <div className="text-center text-muted-foreground py-4">
          <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No competitor folders yet</p>
        </div>
      )}
      
      <div 
        className="flex items-center justify-center text-muted-foreground text-sm border-2 border-dashed border-primary/30 rounded p-3 cursor-pointer hover:bg-primary/10 hover:border-primary/20 transition-all duration-200 bg-primary/5"
        onClick={() => setIsEditing(true)}
        title="Click to manage competitor folders"
      >
        <FolderPlus className="h-4 w-4 mr-1" />
        Click to add/edit competitor folders
      </div>
    </div>
  );
}