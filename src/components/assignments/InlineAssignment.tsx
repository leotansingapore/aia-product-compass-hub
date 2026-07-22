import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ClipboardList, Upload, CheckCircle2, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { notifyAssignmentSubmitted } from '@/lib/notifyAssignmentSubmitted';
import type { AssignmentConfig } from '@/hooks/useProducts';

interface InlineAssignmentProps {
  title: string;
  description?: string;
  assignmentConfig: AssignmentConfig;
  productId: string;
  itemId: string;
  onComplete: () => void;
}

export default function InlineAssignment({
  title,
  description,
  assignmentConfig,
  productId,
  itemId,
  onComplete,
}: InlineAssignmentProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submissionText, setSubmissionText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  // The most recent submission's file, so a resubmit that doesn't re-pick a file
  // keeps the previously uploaded one instead of overwriting it with null.
  const [existingFile, setExistingFile] = useState<{ url: string | null; name: string | null } | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      const { data } = await (supabase.from as any)('assignment_submissions')
        .select('file_url, file_name')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .eq('item_id', itemId)
        .order('submitted_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (active && data) setExistingFile({ url: data.file_url ?? null, name: data.file_name ?? null });
    })();
    return () => {
      active = false;
    };
  }, [user, productId, itemId]);

  // Auto-save the typed response to this device so nothing is lost on a refresh
  // before the learner submits. (Submitting is a one-shot graded action, so the
  // final answer still goes to the account only on Submit.)
  const draftKey = user ? `assignment-draft-${user.id}-${productId}-${itemId}` : null;
  const draftLoaded = useRef(false);
  useEffect(() => {
    if (!draftKey || draftLoaded.current) return;
    try {
      const saved = localStorage.getItem(draftKey);
      if (saved) setSubmissionText(saved);
    } catch {
      /* private mode — non-fatal */
    }
    draftLoaded.current = true;
  }, [draftKey]);
  useEffect(() => {
    if (!draftKey || !draftLoaded.current) return;
    try {
      if (submissionText) localStorage.setItem(draftKey, submissionText);
      else localStorage.removeItem(draftKey);
    } catch {
      /* quota / private mode — non-fatal */
    }
  }, [submissionText, draftKey]);

  const maxFileSizeMb = assignmentConfig.max_file_size_mb ?? 10;
  const showText = assignmentConfig.submission_type === 'text' || assignmentConfig.submission_type === 'both';
  const showFile = assignmentConfig.submission_type === 'file' || assignmentConfig.submission_type === 'both';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxFileSizeMb * 1024 * 1024) {
      toast.error(`File size exceeds ${maxFileSizeMb}MB limit`);
      e.target.value = '';
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('You must be logged in to submit an assignment');
      return;
    }

    if (showText && !submissionText.trim() && !selectedFile) {
      toast.error('Please provide a text submission');
      return;
    }

    if (showFile && !selectedFile && !submissionText.trim()) {
      toast.error('Please upload a file');
      return;
    }

    setIsSubmitting(true);

    let uploadedPath: string | null = null;
    try {
      // Default to the previously uploaded file so a resubmit without a new file
      // keeps it rather than dropping it.
      let fileUrl: string | null = existingFile?.url ?? null;
      let fileName: string | null = existingFile?.name ?? null;

      if (selectedFile) {
        const ext = selectedFile.name.split('.').pop() ?? 'bin';
        const storagePath = `${user.id}/${productId}/${itemId}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('assignment-files')
          .upload(storagePath, selectedFile);

        if (uploadError) throw uploadError;
        uploadedPath = storagePath;

        const { data: urlData } = supabase.storage
          .from('assignment-files')
          .getPublicUrl(storagePath);

        fileUrl = urlData.publicUrl;
        fileName = selectedFile.name;
      }

      const { error: insertError } = await (supabase.from as any)('assignment_submissions').insert({
        user_id: user.id,
        product_id: productId,
        item_id: itemId,
        submission_text: submissionText.trim() || null,
        file_url: fileUrl,
        file_name: fileName,
      });

      // Don't leave a just-uploaded file orphaned in storage if the row fails.
      if (insertError) {
        if (uploadedPath) {
          await supabase.storage.from('assignment-files').remove([uploadedPath]).catch(() => {});
        }
        throw insertError;
      }

      if (fileUrl) setExistingFile({ url: fileUrl, name: fileName });

      notifyAssignmentSubmitted({
        userId: user.id,
        productId,
        itemId,
        assignmentTitle: title,
        submissionExcerpt: submissionText.trim() || null,
        fileName,
      });

      if (draftKey) {
        try {
          localStorage.removeItem(draftKey);
        } catch {
          /* non-fatal */
        }
      }

      setIsSubmitted(true);
      toast.success('Assignment submitted successfully');
      onComplete();
    } catch (err: any) {
      toast.error(err.message ?? 'Failed to submit assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResubmit = () => {
    setIsSubmitted(false);
  };

  if (isSubmitted) {
    return (
      <Card className="border-green-500/30 bg-green-500/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-600 dark:text-green-400 text-lg">
            <CheckCircle2 className="h-5 w-5" />
            Assignment Submitted
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Your submission for &ldquo;{title}&rdquo; has been received.
          </p>
          <Button variant="outline" size="sm" onClick={handleResubmit}>
            Edit &amp; Resubmit
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ClipboardList className="h-5 w-5" />
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-md bg-muted/50 p-3 text-sm">
          {assignmentConfig.prompt}
        </div>

        {showText && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Response</label>
            <Textarea
              placeholder="Type your response here..."
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              rows={5}
              disabled={isSubmitting}
            />
          </div>
        )}

        {showFile && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload File</label>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.mp4,.mov"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed border-2 h-20 flex flex-col gap-1"
              onClick={() => fileInputRef.current?.click()}
              disabled={isSubmitting}
            >
              {selectedFile ? (
                <span className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4" />
                  {selectedFile.name}
                </span>
              ) : (
                <>
                  <Upload className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Click to upload (max {maxFileSizeMb}MB)
                  </span>
                </>
              )}
            </Button>
          </div>
        )}

        <Button
          className="w-full"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Assignment'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
