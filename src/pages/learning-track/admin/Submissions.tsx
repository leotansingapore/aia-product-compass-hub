import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  useAdminSubmissions,
  useReviewSubmission,
} from "@/hooks/learning-track/useAdminSubmissions";
import type { ReviewStatus } from "@/types/learning-track";

export default function Submissions() {
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | "all">("pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const { data, isLoading } = useAdminSubmissions(statusFilter);
  const review = useReviewSubmission();

  const selected = data?.find((s) => s.id === selectedId);

  const handleSelect = (id: string, currentFeedback: string | null) => {
    setSelectedId(id);
    setFeedback(currentFeedback ?? "");
  };

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 min-h-[60vh]"
      data-testid="admin-submissions-page"
    >
      <aside className="overflow-y-auto rounded border">
        <div className="border-b p-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ReviewStatus | "all")}
            className="w-full rounded border bg-background p-1 text-sm"
            aria-label="Filter by review status"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="changes_requested">Changes requested</option>
            <option value="all">All</option>
          </select>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : (data ?? []).length === 0 ? (
          <div className="p-4 text-xs text-muted-foreground">No submissions match.</div>
        ) : (
          (data ?? []).map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelect(s.id, s.review_feedback)}
              className={`block w-full border-b p-2 text-left text-xs hover:bg-muted ${
                selectedId === s.id ? "bg-muted" : ""
              }`}
            >
              <div className="font-medium">{s.user?.display_name || "(unnamed)"}</div>
              <div className="text-muted-foreground truncate">{s.item?.title}</div>
              <div className="text-muted-foreground">
                {new Date(s.submitted_at).toLocaleString()}
              </div>
            </button>
          ))
        )}
      </aside>

      <section className="overflow-y-auto rounded border p-4">
        {!selected ? (
          <div className="text-sm text-muted-foreground">Select a submission to review.</div>
        ) : (
          <div className="space-y-4">
            <header>
              <div className="text-xs uppercase text-muted-foreground">
                {selected.item?.phase?.track === "pre_rnf" ? "Pre-RNF" : "Post-RNF"} ·{" "}
                {selected.item?.phase?.title}
              </div>
              <h2 className="text-lg font-semibold">{selected.item?.title}</h2>
              <div className="text-sm text-muted-foreground">
                {selected.user?.display_name || "(unnamed)"} ·{" "}
                {new Date(selected.submitted_at).toLocaleString()}
              </div>
            </header>

            {selected.remarks && (
              <div>
                <h3 className="text-sm font-semibold">Remarks</h3>
                <div className="whitespace-pre-wrap rounded border bg-muted/30 p-2 text-sm">
                  {selected.remarks}
                </div>
              </div>
            )}

            {selected.files.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold">Attachments</h3>
                <ul className="space-y-1 text-sm">
                  {selected.files.map((f) => (
                    <li key={f.id}>
                      {f.external_url ? (
                        <a
                          href={f.external_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-primary hover:underline"
                        >
                          {f.label || f.external_url}
                        </a>
                      ) : f.content_text ? (
                        <span className="whitespace-pre-wrap">{f.content_text}</span>
                      ) : (
                        <span className="text-muted-foreground">
                          {f.label || f.storage_path || "Attachment"}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Reviewer feedback</label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={4}
                placeholder="Optional for approval; required to request changes."
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    review.mutate({
                      submissionId: selected.id,
                      action: "approve",
                      feedback,
                    })
                  }
                  disabled={review.isPending}
                >
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() =>
                    review.mutate({
                      submissionId: selected.id,
                      action: "request_changes",
                      feedback,
                    })
                  }
                  disabled={review.isPending || !feedback.trim()}
                >
                  Request changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
