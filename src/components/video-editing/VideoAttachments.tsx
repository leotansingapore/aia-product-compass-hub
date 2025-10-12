import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, Download, FileText } from 'lucide-react';
import type { VideoAttachment } from '@/hooks/useProducts';

interface VideoAttachmentsProps {
  attachments: VideoAttachment[];
  onAttachmentsChange: (attachments: VideoAttachment[]) => void;
}

export function VideoAttachments({ attachments, onAttachmentsChange }: VideoAttachmentsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAttachment, setNewAttachment] = useState<Partial<VideoAttachment>>({
    name: '',
    url: '',
    file_type: '',
    file_size: 0
  });

  const addAttachment = () => {
    if (newAttachment.name && newAttachment.url) {
      const attachment: VideoAttachment = {
        id: Date.now().toString(),
        name: newAttachment.name,
        url: newAttachment.url,
        file_type: newAttachment.file_type,
        file_size: newAttachment.file_size
      };
      
      onAttachmentsChange([...attachments, attachment]);
      setNewAttachment({ name: '', url: '', file_type: '', file_size: 0 });
      setShowAddForm(false);
    }
  };

  const removeAttachment = (id: string) => {
    onAttachmentsChange(attachments.filter(attachment => attachment.id !== id));
  };

  const updateAttachment = (id: string, field: keyof VideoAttachment, value: string | number) => {
    onAttachmentsChange(
      attachments.map(attachment =>
        attachment.id === id ? { ...attachment, [field]: value } : attachment
      )
    );
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${Math.round(mb * 1024)} KB` : `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {attachments.map((attachment) => (
        <Card key={attachment.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Input
                      value={attachment.name}
                      onChange={(e) => updateAttachment(attachment.id, 'name', e.target.value)}
                      className="font-medium text-sm"
                      placeholder="Attachment name"
                    />
                    {attachment.file_size && (
                      <span className="text-micro text-muted-foreground whitespace-nowrap">
                        {formatFileSize(attachment.file_size)}
                      </span>
                    )}
                  </div>
                  <Input
                    value={attachment.url}
                    onChange={(e) => updateAttachment(attachment.id, 'url', e.target.value)}
                    placeholder="Download URL"
                    className="text-micro"
                  />
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={attachment.file_type || ''}
                      onChange={(e) => updateAttachment(attachment.id, 'file_type', e.target.value)}
                      placeholder="File type (e.g., PDF, DOCX)"
                      className="text-micro"
                    />
                    <Input
                      type="number"
                      value={attachment.file_size || ''}
                      onChange={(e) => updateAttachment(attachment.id, 'file_size', parseInt(e.target.value) || 0)}
                      placeholder="Size (bytes)"
                      className="text-micro"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(attachment.url, '_blank')}
                  disabled={!attachment.url}
                >
                  <Download className="h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeAttachment(attachment.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {showAddForm ? (
        <Card>
          <CardContent className="p-4 space-y-3">
            <div className="space-y-2">
              <Label>Attachment Name</Label>
              <Input
                value={newAttachment.name || ''}
                onChange={(e) => setNewAttachment({ ...newAttachment, name: e.target.value })}
                placeholder="e.g., Product Guide, Training Slides"
              />
            </div>
            <div className="space-y-2">
              <Label>Download URL</Label>
              <Input
                value={newAttachment.url || ''}
                onChange={(e) => setNewAttachment({ ...newAttachment, url: e.target.value })}
                placeholder="https://example.com/file.pdf"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>File Type</Label>
                <Input
                  value={newAttachment.file_type || ''}
                  onChange={(e) => setNewAttachment({ ...newAttachment, file_type: e.target.value })}
                  placeholder="PDF, DOCX, etc."
                />
              </div>
              <div className="space-y-2">
                <Label>File Size (bytes)</Label>
                <Input
                  type="number"
                  value={newAttachment.file_size || ''}
                  onChange={(e) => setNewAttachment({ ...newAttachment, file_size: parseInt(e.target.value) || 0 })}
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={addAttachment} size="sm">
                Add Attachment
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)} size="sm">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          variant="outline"
          onClick={() => setShowAddForm(true)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Attachment
        </Button>
      )}
    </div>
  );
}