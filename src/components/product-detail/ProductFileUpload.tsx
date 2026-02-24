import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface ProductFile {
  name: string;
  file_path: string;
  file_url: string;
  file_size: number;
  uploaded_at: string;
  knowledge_doc_id?: string;
}

interface ProductFileUploadProps {
  productId: string;
  productName: string;
  files: ProductFile[];
  onFilesChange: (files: ProductFile[]) => Promise<void>;
  readOnly?: boolean;
}

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
  "text/csv",
];

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".txt", ".md", ".csv"];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ProductFileUpload({
  productId,
  productName,
  files,
  onFilesChange,
  readOnly = false,
}: ProductFileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      toast({
        title: "Unsupported file type",
        description: `Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
        variant: "destructive",
      });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: `Max size: ${formatFileSize(MAX_FILE_SIZE)}`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // Upload to Supabase storage
      const fileName = `${productId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: uploadError } = await supabase.storage
        .from("knowledge-files")
        .upload(fileName, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("knowledge-files")
        .getPublicUrl(fileName);

      // Create knowledge_documents record for AI processing
      const { data: docRecord, error: docError } = await supabase
        .from("knowledge_documents")
        .insert({
          title: file.name,
          file_path: fileName,
          file_type: file.type,
          file_size: file.size,
          product_id: productId,
          status: "pending",
        })
        .select("id")
        .single();

      if (docError) {
        console.error("Failed to create knowledge doc record:", docError);
      }

      // Add to product files list
      const newFile: ProductFile = {
        name: file.name,
        file_path: fileName,
        file_url: urlData.publicUrl,
        file_size: file.size,
        uploaded_at: new Date().toISOString(),
        knowledge_doc_id: docRecord?.id,
      };

      const updatedFiles = [...files, newFile];
      await onFilesChange(updatedFiles);

      toast({ title: "File uploaded ✓", description: file.name });

      // Auto-sync to AI knowledge base (fire-and-forget)
      if (docRecord?.id) {
        toast({ title: "Processing for AI knowledge base…" });
        supabase.functions
          .invoke("process-knowledge", {
            body: { action: "process_document", document_id: docRecord.id },
          })
          .then(({ data, error }) => {
            if (error) throw error;
            toast({
              title: "AI knowledge base updated ✓",
              description: `${data?.chunks_created ?? 0} chunks indexed from "${file.name}"`,
            });
          })
          .catch((err: any) => {
            console.error("AI sync failed for uploaded file:", err);
            toast({
              title: "AI sync pending",
              description: "File uploaded but AI processing will retry later.",
              variant: "destructive",
            });
          });
      }
    } catch (err: any) {
      console.error("File upload failed:", err);
      toast({
        title: "Upload failed",
        description: err.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (index: number) => {
    setDeletingIndex(index);
    try {
      const file = files[index];

      // Delete from storage
      await supabase.storage.from("knowledge-files").remove([file.file_path]);

      // Delete knowledge doc and chunks if exists
      if (file.knowledge_doc_id) {
        await supabase
          .from("knowledge_chunks")
          .delete()
          .eq("document_id", file.knowledge_doc_id);
        await supabase
          .from("knowledge_documents")
          .delete()
          .eq("id", file.knowledge_doc_id);
      }

      const updatedFiles = files.filter((_, i) => i !== index);
      await onFilesChange(updatedFiles);
      toast({ title: "File deleted" });
    } catch (err: any) {
      console.error("File delete failed:", err);
      toast({ title: "Delete failed", description: err.message, variant: "destructive" });
    } finally {
      setDeletingIndex(null);
    }
  };

  return (
    <div className="space-y-3">
      {/* File list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={`${file.file_path}-${index}`}
              className="flex items-center gap-2 border rounded-lg p-3 bg-card hover:shadow-sm transition-shadow"
            >
              <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm truncate">{file.name}</div>
                <div className="text-xs text-muted-foreground">
                  {formatFileSize(file.file_size)}
                  {file.knowledge_doc_id && " · Synced to AI"}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <Button
                  size="sm"
                  variant="ghost"
                  asChild
                  className="h-8 w-8 p-0"
                  title="Open file"
                >
                  <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                {!readOnly && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-destructive/10"
                        title="Delete file"
                        disabled={deletingIndex === index}
                      >
                        {deletingIndex === index ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete file?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove <strong>"{file.name}"</strong> from storage and the AI knowledge base.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(index)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {!readOnly && (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_EXTENSIONS.join(",")}
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="w-full border-dashed"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Upload className="h-4 w-4 mr-2" />
            )}
            {uploading ? "Uploading…" : "Upload PDF / Document"}
          </Button>
          <p className="text-xs text-muted-foreground mt-1.5">
            PDF, DOCX, TXT, MD, CSV · Max {formatFileSize(MAX_FILE_SIZE)} · Auto-synced to AI
          </p>
        </div>
      )}

      {/* Empty state for read-only */}
      {readOnly && files.length === 0 && (
        <p className="text-sm text-muted-foreground italic">No files uploaded yet.</p>
      )}
    </div>
  );
}
