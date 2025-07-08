import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Check, X, Plus, Edit, Trash2, Play } from 'lucide-react';
import { useAdmin } from '@/hooks/useAdmin';
import type { TrainingVideo } from '@/hooks/useProducts';

interface EditableVideosProps {
  videos: TrainingVideo[];
  onSave: (newVideos: TrainingVideo[]) => Promise<void>;
  className?: string;
}

// Function to get video embed URL and type
function getVideoEmbedInfo(url: string) {
  // YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (youtubeMatch) {
    return {
      embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
      type: 'youtube',
      thumbnail: `https://img.youtube.com/vi/${youtubeMatch[1]}/maxresdefault.jpg`
    };
  }

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/);
  if (vimeoMatch) {
    return {
      embedUrl: `https://player.vimeo.com/video/${vimeoMatch[3]}`,
      type: 'vimeo',
      thumbnail: null
    };
  }

  // Loom
  const loomMatch = url.match(/loom\.com\/share\/([a-f0-9]+)/);
  if (loomMatch) {
    return {
      embedUrl: `https://www.loom.com/embed/${loomMatch[1]}`,
      type: 'loom',
      thumbnail: null
    };
  }

  // Wistia
  const wistiaMatch = url.match(/wistia\.com\/medias\/([a-z0-9]+)/);
  if (wistiaMatch) {
    return {
      embedUrl: `https://fast.wistia.net/embed/iframe/${wistiaMatch[1]}`,
      type: 'wistia',
      thumbnail: null
    };
  }

  return null;
}

export function EditableVideos({ videos, onSave, className = "" }: EditableVideosProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editVideos, setEditVideos] = useState<TrainingVideo[]>(videos);
  const [newVideo, setNewVideo] = useState<TrainingVideo>({ title: '', url: '', description: '' });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const { isAdminMode } = useAdmin();
  const { toast } = useToast();

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(editVideos);
      setIsEditing(false);
      setEditingIndex(null);
      toast({
        title: "Saved",
        description: "Training videos updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save videos",
        variant: "destructive",
      });
      setEditVideos(videos);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditVideos(videos);
    setNewVideo({ title: '', url: '', description: '' });
    setEditingIndex(null);
    setIsEditing(false);
  };

  const addVideo = () => {
    if (newVideo.title.trim() && newVideo.url.trim()) {
      const videoInfo = getVideoEmbedInfo(newVideo.url);
      if (videoInfo) {
        setEditVideos([...editVideos, { ...newVideo }]);
        setNewVideo({ title: '', url: '', description: '' });
      } else {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid YouTube, Vimeo, Loom, or Wistia URL",
          variant: "destructive",
        });
      }
    }
  };

  const updateVideo = (index: number, updatedVideo: TrainingVideo) => {
    const updated = [...editVideos];
    updated[index] = updatedVideo;
    setEditVideos(updated);
    setEditingIndex(null);
  };

  const removeVideo = (index: number) => {
    setEditVideos(editVideos.filter((_, i) => i !== index));
  };

  if (!isAdminMode) {
    if (videos.length === 0) {
      return (
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">🎬</div>
            <p className="text-muted-foreground">Training videos coming soon</p>
            <p className="text-sm text-muted-foreground mt-2">Loom-style explainer videos</p>
          </div>
        </div>
      );
    }

    return (
      <div className={`space-y-6 ${className}`}>
        {videos.map((video, index) => {
          const videoInfo = getVideoEmbedInfo(video.url);
          return (
            <div key={index} className="space-y-3">
              <div>
                <h4 className="font-medium text-lg">{video.title}</h4>
                {video.description && (
                  <p className="text-muted-foreground text-sm">{video.description}</p>
                )}
              </div>
              {videoInfo ? (
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  <iframe
                    src={videoInfo.embedUrl}
                    title={video.title}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <p className="text-muted-foreground">Invalid video URL</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        {editVideos.map((video, index) => (
          <div key={index} className="border rounded-lg p-4 space-y-3">
            {editingIndex === index ? (
              <>
                <Input
                  value={video.title}
                  onChange={(e) => updateVideo(index, { ...video, title: e.target.value })}
                  placeholder="Video title"
                />
                <Input
                  value={video.url}
                  onChange={(e) => updateVideo(index, { ...video, url: e.target.value })}
                  placeholder="YouTube, Loom, Vimeo, or Wistia link"
                />
                <Textarea
                  value={video.description || ''}
                  onChange={(e) => updateVideo(index, { ...video, description: e.target.value })}
                  placeholder="Optional description"
                  rows={2}
                />
                <Button size="sm" onClick={() => setEditingIndex(null)}>
                  <Check className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{video.title}</h4>
                    {video.description && (
                      <p className="text-sm text-muted-foreground">{video.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground truncate max-w-[300px]">{video.url}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setEditingIndex(index)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeVideo(index)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {getVideoEmbedInfo(video.url) && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <iframe
                      src={getVideoEmbedInfo(video.url)?.embedUrl}
                      title={video.title}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                )}
              </>
            )}
          </div>
        ))}

        <div className="border-2 border-dashed border-primary/30 rounded-lg p-4 space-y-3">
          <h4 className="font-medium">Add New Video</h4>
          <Input
            value={newVideo.title}
            onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
            placeholder="Video title"
          />
          <Input
            value={newVideo.url}
            onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
            placeholder="🔗 YouTube, Loom, Vimeo, or Wistia link"
            onKeyPress={(e) => e.key === 'Enter' && addVideo()}
          />
          <Textarea
            value={newVideo.description || ''}
            onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
            placeholder="Optional description"
            rows={2}
          />
          <Button 
            size="sm" 
            onClick={addVideo} 
            disabled={!newVideo.title.trim() || !newVideo.url.trim()}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Video
          </Button>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving}>
            <Check className="h-4 w-4 mr-1" />
            Save Videos
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
      className={`${className} cursor-pointer hover:bg-primary/10 hover:border-primary/20 border-2 border-dashed border-primary/30 p-4 rounded transition-all duration-200 bg-primary/5`}
      onClick={() => setIsEditing(true)}
      title="🔧 ADMIN MODE: Click to add/edit training videos"
    >
      {videos.length > 0 ? (
        <div className="space-y-4">
          {videos.map((video, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-background rounded border">
              <Play className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">{video.title}</p>
                {video.description && (
                  <p className="text-sm text-muted-foreground">{video.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">🎬</div>
            <p className="text-muted-foreground">Training videos coming soon</p>
            <p className="text-sm text-muted-foreground mt-2">Click to add videos</p>
          </div>
        </div>
      )}
    </div>
  );
}