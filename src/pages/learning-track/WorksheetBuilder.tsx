import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  FileSpreadsheet,
  Loader2,
  Save,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { usePermissions } from "@/hooks/usePermissions";
import WorksheetForm from "@/components/worksheets/WorksheetForm";
import WorksheetPrintView from "@/components/worksheets/WorksheetPrintView";
import PledgeSheetCalculator from "@/components/worksheets/PledgeSheetCalculator";
import PledgeSheetPrintView from "@/components/worksheets/PledgeSheetPrintView";
import CustomizePanel from "@/components/worksheets/CustomizePanel";
import { personName } from "@/features/pre-rnf-worksheets/customize";
import { WORKSHEET_SCHEMAS } from "@/features/pre-rnf-worksheets/schema";
import {
  WORKSHEETS,
  WORKSHEET_SLUGS,
  isWorksheetSlug,
  loadWorksheet,
  saveWorksheet,
  type WorksheetSlug,
  type WorksheetValues,
} from "@/features/pre-rnf-worksheets/worksheets";

const draftKey = (userId: string, slug: string) => `worksheet-draft-${userId}-${slug}`;

function readDraft(userId: string | undefined, slug: string): WorksheetValues | null {
  if (!userId || typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(draftKey(userId, slug));
    return raw ? (JSON.parse(raw) as WorksheetValues) : null;
  } catch {
    return null;
  }
}

/** Landing hub when no specific worksheet is selected. */
function WorksheetHub() {
  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
      <div>
        <h1 className="font-serif text-2xl font-bold">Business Plan worksheets</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill these in here, save them, and export a PDF any time. They're the in-app version of the
          two downloadable templates — a second option if you'd rather type than print.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {WORKSHEET_SLUGS.map((slug) => (
          <Link key={slug} to={`/learning-track/pre-rnf/worksheets/${slug}`} className="group">
            <Card className="h-full transition-all hover:border-primary/40 hover:shadow-md">
              <CardContent className="space-y-2 p-5">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FileSpreadsheet className="h-5 w-5" />
                </div>
                <h2 className="font-serif text-lg font-bold">{WORKSHEETS[slug].title}</h2>
                <p className="text-sm text-muted-foreground">{WORKSHEETS[slug].short}</p>
                <span className="inline-flex items-center gap-1 pt-1 text-sm font-semibold text-primary">
                  Open <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function WorksheetBuilder() {
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams] = useSearchParams();
  const { user } = useSimplifiedAuth();
  const { isAdmin, isMasterAdmin } = usePermissions();
  const admin = isAdmin() || isMasterAdmin();

  // Admin read-only view of another learner's worksheet via ?user=<id>.
  const viewUserId = searchParams.get("user");
  const isAdminView = !!viewUserId && admin && viewUserId !== user?.id;
  const ownerId = isAdminView ? viewUserId! : user?.id;

  const [values, setValues] = useState<WorksheetValues>({});
  const [rowId, setRowId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const hydrated = useRef(false);
  const printRef = useRef<HTMLDivElement>(null);

  const valid = isWorksheetSlug(slug);

  const loaded = useQuery({
    queryKey: ["worksheet", slug, ownerId],
    enabled: valid && !!ownerId,
    queryFn: () => loadWorksheet(ownerId!, slug as WorksheetSlug),
    staleTime: 30_000,
  });

  // Hydrate once: server copy is the source of truth, but a newer local draft
  // (own worksheet only) wins so an in-progress edit survives a refresh.
  useEffect(() => {
    if (!valid || loaded.isLoading || hydrated.current) return;
    const server = loaded.data;
    setRowId(server?.id ?? null);
    setLastSavedAt(server?.updatedAt ?? null);
    const draft = isAdminView ? null : readDraft(user?.id, slug as string);
    setValues(draft ?? server?.values ?? {});
    hydrated.current = true;
  }, [valid, loaded.isLoading, loaded.data, isAdminView, user?.id, slug]);

  // Reset hydration when switching worksheets / users.
  useEffect(() => {
    hydrated.current = false;
  }, [slug, ownerId]);

  // Autosave the in-progress draft (own worksheet only).
  useEffect(() => {
    if (!valid || isAdminView || !user?.id || !hydrated.current) return;
    try {
      localStorage.setItem(draftKey(user.id, slug as string), JSON.stringify(values));
    } catch {
      /* quota / private mode — non-fatal */
    }
  }, [values, valid, isAdminView, user?.id, slug]);

  const viewerName = useQuery({
    queryKey: ["worksheet-owner-name", viewUserId],
    enabled: isAdminView,
    queryFn: async () => {
      const { data } = await (supabase.rpc as any)("get_cohort_display_names", {
        p_user_ids: [viewUserId],
      });
      const row = Array.isArray(data) ? data[0] : null;
      return (row?.display_name ?? "").trim() || "this learner";
    },
  });

  const onChange = (id: string, v: string) =>
    setValues((prev) => ({ ...prev, [id]: v }));

  const save = async () => {
    if (!user?.id) {
      toast.error("Please sign in to save.");
      return;
    }
    setSaving(true);
    try {
      const id = await saveWorksheet(user.id, slug as WorksheetSlug, values, rowId);
      setRowId(id);
      setLastSavedAt(new Date().toISOString());
      toast.success("Worksheet saved — you can come back to it any time.");
    } catch (err: any) {
      toast.error(err?.message ?? "Couldn't save.");
    } finally {
      setSaving(false);
    }
  };

  // Render the on-screen preview element to a downloaded PDF. The element is
  // visible (inside the preview modal), so html2canvas captures it reliably —
  // off-screen capture produced blank pages.
  const generatePdf = async () => {
    const src = printRef.current;
    if (!src) return;
    setGenerating(true);
    // Render the print HTML in a clean, on-screen, body-level container so the
    // modal's fixed / overflow / backdrop-blur ancestors don't make html2canvas
    // capture an empty region (the cause of the earlier blank pages).
    const holder = document.createElement("div");
    holder.style.cssText =
      "position:fixed;left:0;top:0;width:794px;background:#ffffff;padding:24px;z-index:2147483647;";
    // Deep-clone the already-rendered (and escaped) print DOM — no re-parsing of
    // HTML, so no XSS surface, and the scoped <style> + content come along.
    holder.appendChild(src.cloneNode(true));
    document.body.appendChild(holder);
    try {
      const [{ default: html2canvas }, jspdf] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const JsPDF = jspdf.jsPDF;
      await new Promise((r) => setTimeout(r, 40));
      const canvas = await html2canvas(holder, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });
      const scale = 2;
      const pdf = new JsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const imgW = pageW - margin * 2;
      const pxPerMm = canvas.width / imgW;
      const pageHpx = (pageH - margin * 2) * pxPerMm;

      // Element-aware pagination: measure each top-level block (heading, table,
      // field, note) in the captured layout, then pack whole blocks onto pages so
      // nothing is ever split mid-block, and a heading is never left stranded at
      // the foot of a page without the content that follows it.
      const root = (holder.querySelector(".wpv, .psv") as HTMLElement) ?? holder;
      const hostTop = holder.getBoundingClientRect().top;
      type Block = { top: number; bottom: number; heading: boolean };
      const blocks: Block[] = [];
      const headingCls = ["wpv-step", "wpv-table-label", "blackband", "redband"];
      for (const child of Array.from(root.children)) {
        if (child.tagName === "STYLE") continue;
        const r = child.getBoundingClientRect();
        const top = (r.top - hostTop) * scale;
        const bottom = (r.bottom - hostTop) * scale;
        if (bottom - top < 1) continue;
        const heading = headingCls.some((c) => (child as HTMLElement).classList.contains(c));
        blocks.push({ top, bottom, heading });
      }

      // Group blocks into pages.
      const pages: Array<{ start: number; end: number }> = [];
      if (blocks.length === 0) {
        pages.push({ start: 0, end: canvas.height });
      } else {
        let i = 0;
        let start = 0; // page 1 starts at the very top (keeps title/name margin)
        while (i < blocks.length) {
          const limit = start + pageHpx;
          let last = i;
          while (last + 1 < blocks.length && blocks[last + 1].bottom <= limit) last++;
          // Never end a page on a heading — push it (and any heading run) forward.
          while (last > i && blocks[last].heading) last--;
          pages.push({ start, end: blocks[last].bottom });
          i = last + 1;
          if (i < blocks.length) start = blocks[i].top; // trim inter-block gap
        }
      }

      pages.forEach((pg, p) => {
        const sliceH = Math.max(1, Math.round(pg.end - pg.start));
        const slice = document.createElement("canvas");
        slice.width = canvas.width;
        slice.height = sliceH;
        const sctx = slice.getContext("2d");
        if (sctx) {
          // Paint white first — a bare canvas is transparent, and JPEG renders
          // transparency as black (the stray dark bar seen between pages).
          sctx.fillStyle = "#ffffff";
          sctx.fillRect(0, 0, slice.width, sliceH);
          sctx.drawImage(canvas, 0, pg.start, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
        }
        if (p > 0) pdf.addPage();
        pdf.addImage(slice.toDataURL("image/jpeg", 0.95), "JPEG", margin, margin, imgW, sliceH / pxPerMm);
      });

      const who = personName(values);
      const rawName = `${who ? `${who} - ` : ""}${WORKSHEETS[slug as WorksheetSlug].title}`;
      const filename = `${rawName.replace(/[\\/:*?"<>|]+/g, "-").trim() || "worksheet"}.pdf`;
      pdf.save(filename);
      toast.success("PDF downloaded.");
    } catch (err) {
      console.error("PDF generation failed:", err);
      toast.error("PDF: " + String((err as any)?.message ?? err).slice(0, 120));
    } finally {
      document.body.removeChild(holder);
      setGenerating(false);
    }
  };

  if (!valid) return <WorksheetHub />;

  const meta = WORKSHEETS[slug as WorksheetSlug];
  const schema = WORKSHEET_SCHEMAS[slug as WorksheetSlug];
  const isPledge = slug === "pledge-sheet";
  // The editor itself is admin-locked only; printing swaps in a dedicated
  // template-styled view (below) so the PDF matches the downloadable template.
  const readOnly = isAdminView;

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4 sm:p-6">
      <div data-no-print className="flex items-center justify-between gap-3">
        <Link
          to="/learning-track/pre-rnf/assignments/business-plan"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to assignment
        </Link>
        {lastSavedAt && !isAdminView && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            Saved {new Date(lastSavedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {isAdminView && (
        <div
          data-no-print
          className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm text-amber-700 dark:text-amber-300"
        >
          <ShieldCheck className="h-4 w-4 shrink-0" />
          Admin view — {viewerName.data ?? "loading…"}'s worksheet (read-only).
        </div>
      )}

      {!loaded.isLoading && (
        <CustomizePanel
          values={values}
          onChange={onChange}
          readOnly={readOnly}
          showHeadline={!isPledge}
        />
      )}

      <div className="rounded-2xl border bg-card p-4 sm:p-8">
        <div className="mb-5 border-b pb-4">
          <h1 className="font-serif text-xl font-bold sm:text-2xl">{meta.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{meta.short}</p>
        </div>

        {loaded.isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : isPledge ? (
          <PledgeSheetCalculator values={values} onChange={onChange} readOnly={readOnly} />
        ) : (
          <WorksheetForm schema={schema} values={values} onChange={onChange} readOnly={readOnly} />
        )}
      </div>

      {/* Preview modal: shows the exact PDF layout on-screen and downloads it. */}
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm"
          onClick={() => !generating && setPreviewOpen(false)}
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <span className="text-sm font-semibold text-white">Preview — {meta.title}</span>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={(e) => { e.stopPropagation(); generatePdf(); }} disabled={generating} className="gap-2">
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                Download PDF
              </Button>
              <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); setPreviewOpen(false); }} disabled={generating}>
                Close
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto" style={{ width: "794px", maxWidth: "100%" }}>
              <div ref={printRef} style={{ background: "#fff", padding: "24px", borderRadius: "6px" }}>
                {isPledge ? (
                  <PledgeSheetPrintView values={values} />
                ) : (
                  <WorksheetPrintView
                    title={meta.title}
                    subtitle={meta.short}
                    schema={schema}
                    values={values}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div data-no-print className="flex flex-col gap-3 sm:flex-row">
        {!isAdminView && (
          <Button onClick={save} disabled={saving} className="flex-1 gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
        )}
        <Button variant="outline" onClick={() => setPreviewOpen(true)} className="flex-1 gap-2">
          <Download className="h-4 w-4" />
          Preview &amp; download PDF
        </Button>
      </div>

      {!isAdminView && (
        <p data-no-print className="text-center text-xs text-muted-foreground">
          Your answers save to this device as you type, and to your account when you hit Save — open
          this from your profile any time.
        </p>
      )}
    </div>
  );
}
