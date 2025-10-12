import React, { useState, useRef, useCallback } from 'react';
import { Upload, Image, Loader2, X, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface MediaUploadZoneProps {
  onMediaAdd: (url: string, type: 'gif' | 'image') => void;
  className?: string;
}

export function MediaUploadZone({ onMediaAdd, className = "" }: MediaUploadZoneProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadFile = async (file: File): Promise<string> => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Please select an image file');
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('File size must be less than 10MB');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `onboarding-media/${fileName}`;

    const { data, error } = await supabase.storage
      .from('knowledge-files')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('knowledge-files')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      const type = file.type === 'image/gif' ? 'gif' : 'image';
      onMediaAdd(url, type);
      toast({
        title: "Upload successful",
        description: "Your image has been added to the step.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePaste = useCallback(async (e: ClipboardEvent) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imageItem = items.find(item => item.type.startsWith('image/'));
    
    if (imageItem) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (file) {
        await handleFileUpload(file);
      }
    }
  }, []);

  React.useEffect(() => {
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleFileUpload(files[0]);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      const type = urlInput.toLowerCase().includes('.gif') ? 'gif' : 'image';
      onMediaAdd(urlInput.trim(), type);
      setUrlInput('');
      setShowUrlInput(false);
      toast({
        title: "Media added",
        description: "URL has been added to the step.",
      });
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <Image className="w-12 h-12 mx-auto text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">Drop your image here</p>
              <p className="text-sm text-muted-foreground">
                Or paste (Ctrl+V), drag & drop, or click to browse
              </p>
              <p className="text-micro text-muted-foreground mt-1">
                Supports GIF, PNG, JPG, WebP (max 10MB)
              </p>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
            >
              <Upload className="w-4 h-4 mr-2" />
              Browse Files
            </Button>
          </div>
        )}
      </div>

      {/* URL Input Toggle */}
      <div className="flex justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-muted-foreground"
        >
          <Link className="w-4 h-4 mr-2" />
          Or add from URL
        </Button>
      </div>

      {/* URL Input */}
      {showUrlInput && (
        <div className="flex gap-2">
          <Input
            placeholder="Paste image URL here..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
          />
          <Button onClick={handleUrlSubmit} size="sm">
            Add
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowUrlInput(false);
              setUrlInput('');
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}