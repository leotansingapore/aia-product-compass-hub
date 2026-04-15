import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Paperclip, Trash2 } from "lucide-react";
import {
  useUserSubmissionForItem,
  useUpsertSubmission,
  useUploadSubmissionFile,
  useAddSubmissionLink,
  useDeleteSubmissionFile,
  type SubmissionFile,
} from "@/hooks/learning-track/useLearningTrackSubmissions";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  itemId: string;
  userId: string | undefined;
  readOnly?: boolean;
}

const STATUS_LABEL = {
  pending: { label: "Pending review", variant: "secondary" as const },
  approved: { label: "Approved", variant: "default" as const },
  changes_requested: { label: "Changes requested", variant: "destructive" as const },
};

export function SubmissionPanel({ itemId, userId, readOnly = false }: Props) {
  const { data: submission, isLoading } = useUserSubmissionForItem(userId, itemId);
  const upsert = useUpsertSubmission(userId);
  const upload = useUploadSubmissionFile(userId);
  const addLink = useAddSubmissionLink(userId);
  const deleteFile = useDeleteSubmissionFile(userId);

  const [remarks, setRemarks] = useState("");
  const [linkUrl, setLinkUrl] = useState("");

  useEffect(() => {
    setRemarks(submission?.remarks ?? "");
  }, [submission?.remarks]);

  const locked = submission?.review_status === "approved";
  const canEdit = !readOnly && !locked;

  if (isLoading) return <Loader2 className="h-4 w-4 animate-spin" />;

  const handleSave = async () => {
    await upsert.mutateAsync({ itemId, remarks });
  };

  const handleFile = async (file: File) => {
    const fileType = file.type.startsWith("image/") ? "image" : "pdf";
    if (!submission) {
      const result = await upsert.mutateAsync({ itemId, remarks });
      await upload.mutateAsync({ submissionId: result.id, itemId, file, fileType });
    } else {
      await upload.mutateAsync({ submissionId: submission.id, itemId, file, fileType });
    }
  };

  const handleAddLink = async () => {
    if (!linkUrl || !submission) return;
    const fileType = linkUrl.includes("loom.com") ? "loom" : "url";
    await addLink.mutateAsync({ submissionId: submission.id, itemId, fileType, url: linkUrl });
    setLinkUrl("");
  };

  return (
    <div className="rounded border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Submission</h4>
        {submission && (
          <Badge variant={STATUS_LABEL[submission.review_status].variant}>
            {STATUS_LABEL[submission.review_status].label}
          </Badge>
        )}
      </div>

      {submission?.review_status === "changes_requested" && submission.review_feedback && (
        <div className="rounded bg-destructive/10 border border-destructive/30 p-2 text-sm">
          <div className="font-medium text-destructive">Reviewer feedback:</div>
          <div className="whitespace-pre-wrap">{submission.review_feedback}</div>
        </div>
      )}

      <div>
        <label className="text-xs text-muted-foreground">Remarks</label>
        <Textarea
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          disabled={!canEdit}
          rows={3}
        />
      </div>

      {submission?.files && submission.files.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs text-muted-foreground">Attachments</div>
          {submission.files.map((f) => (
            <FilePreviewRow
              key={f.id}
              file={f}
              canEdit={canEdit}
              onDelete={() =>
                deleteFile.mutate({ fileId: f.id, storagePath: f.storage_path, itemId })
              }
            />
          ))}
        </div>
      )}

      {canEdit && (
        <div className="space-y-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:bg-muted transition-colors min-h-[44px]">
            <Paperclip className="h-4 w-4 text-muted-foreground" />
            <input
              type="file"
              accept="application/pdf,image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            />
            <span>Attach file</span>
          </label>
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="Or paste a link (Loom, Drive, etc)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm min-h-[44px]"
            />
            <Button size="sm" className="min-h-[44px] sm:min-h-0" onClick={handleAddLink} disabled={!linkUrl || !submission}>
              Add link
            </Button>
          </div>
          <Button onClick={handleSave} size="sm" className="w-full sm:w-auto min-h-[44px] sm:min-h-0" disabled={upsert.isPending}>
            {upsert.isPending ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />{submission ? "Saving…" : "Submitting…"}</>
            ) : (
              submission ? "Save / Resubmit" : "Submit for review"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function FilePreviewRow({
  file,
  canEdit,
  onDelete,
}: {
  file: SubmissionFile;
  canEdit: boolean;
  onDelete: () => void;
}) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (file.storage_path && !signedUrl) {
      supabase.storage
        .from("learning-track-submissions")
        .createSignedUrl(file.storage_path, 3600)
        .then(({ data }) => {
          if (!cancelled && data) setSignedUrl(data.signedUrl);
        });
    }
    return () => {
      cancelled = true;
    };
  }, [file.storage_path, signedUrl]);

  const href = file.external_url ?? signedUrl ?? "#";
  return (
    <div className="flex items-center justify-between rounded bg-background px-2 py-1 text-xs">
      <a href={href} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">
        {file.label ?? file.storage_path ?? file.external_url ?? "Attachment"}
      </a>
      {canEdit && (
        <button onClick={onDelete} aria-label="Remove">
          <Trash2 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
