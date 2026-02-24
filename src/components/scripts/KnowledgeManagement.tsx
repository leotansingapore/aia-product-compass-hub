import { useState, useRef } from "react";
import { KnowledgeSyncButton } from "@/components/admin/KnowledgeSyncButton";
import { useKnowledgeDocuments } from "@/hooks/useKnowledgeDocuments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Upload, Trash2, RefreshCw, FileText, Loader2, Database, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";

const statusConfig: Record<string, { icon: typeof Clock; label: string; color: string }> = {
  pending: { icon: Clock, label: "Pending", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" },
  processing: { icon: Loader2, label: "Processing", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
  processed: { icon: CheckCircle, label: "Ready", color: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  error: { icon: AlertCircle, label: "Error", color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" },
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function KnowledgeManagement() {
  const { documents, loading, uploadDocument, deleteDocument, syncScripts, reprocessDocument, isAdmin } = useKnowledgeDocuments();
  const [uploading, setUploading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [title, setTitle] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; filePath: string; title: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!isAdmin) return null;

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0];
    if (!file) { toast.error("Please select a file"); return; }
    if (!title.trim()) { toast.error("Please enter a title"); return; }
    if (file.size > 20 * 1024 * 1024) { toast.error("File too large. Max 20MB."); return; }

    setUploading(true);
    await uploadDocument(file, title.trim());
    setUploading(false);
    setTitle("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSync = async () => {
    setSyncing(true);
    await syncScripts();
    setSyncing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5" /> Knowledge Base Management
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={handleSync} disabled={syncing} className="gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${syncing ? "animate-spin" : ""}`} />
              {syncing ? "Syncing..." : "Sync Scripts"}
            </Button>
            <KnowledgeSyncButton />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Upload section */}
        <div className="border-2 border-dashed rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Upload className="h-4 w-4" /> Upload Knowledge Document
          </div>
          <Input
            placeholder="Document title (e.g. 'AIA Product Guide 2025')"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt,.md,.csv,.xlsx,.xls"
              className="text-sm file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 min-w-0 flex-1"
            />
            <Button onClick={handleUpload} disabled={uploading} size="sm" className="gap-1.5 shrink-0">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {uploading ? "Uploading..." : "Upload"}
            </Button>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Supports PDF, DOCX, TXT, MD, CSV, XLSX. Max 20MB. Documents are chunked and indexed for AI search.
          </p>
        </div>

        {/* Documents list */}
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : documents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No knowledge documents uploaded yet. Upload files or sync scripts to build the AI's knowledge base.
          </p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => {
              const status = statusConfig[doc.status] || statusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border bg-card">
                  <FileText className="h-8 w-8 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{doc.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">{formatFileSize(doc.file_size)}</span>
                      <Badge variant="secondary" className={`text-[10px] ${status.color}`}>
                        <StatusIcon className={`h-2.5 w-2.5 mr-0.5 ${doc.status === "processing" ? "animate-spin" : ""}`} />
                        {status.label}
                      </Badge>
                      {doc.chunk_count > 0 && (
                        <span className="text-[10px] text-muted-foreground">{doc.chunk_count} chunks</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {doc.status === "error" && (
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => reprocessDocument(doc.id)} title="Retry processing">
                        <RefreshCw className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => setDeleteTarget({ id: doc.id, filePath: doc.file_path, title: doc.title })}
                      title="Delete document"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Delete "{deleteTarget?.title}"? This removes the file and all its indexed chunks from the knowledge base.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deleteTarget) {
                  await deleteDocument(deleteTarget.id, deleteTarget.filePath);
                  setDeleteTarget(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
