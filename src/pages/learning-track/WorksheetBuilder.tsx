import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
import WorksheetDeckPrintView, { DECK_SLIDE_W } from "@/components/worksheets/WorksheetDeckPrintView";
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

// A leftover raw form-submission blob (an object serialised to JSON) rather than
// a human-written 100 Whys answer.
function looksLikeFormJson(s: string): boolean {
  const t = s.trim();
  if (!t.startsWith("{") || !t.endsWith("}")) return false;
  try {
    const o = JSON.parse(t);
    return !!o && typeof o === "object" && !Array.isArray(o);
  } catch {
    return false;
  }
}

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
  const [autoSaving, setAutoSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  // PDF layout: classic A4 portrait document, or the landscape per-section deck.
  const [pdfLayout, setPdfLayout] = useState<"doc" | "deck">(() => {
    try {
      return localStorage.getItem("worksheet-pdf-layout") === "deck" ? "deck" : "doc";
    } catch {
      return "doc";
    }
  });
  const setLayoutMode = (l: "doc" | "deck") => {
    setPdfLayout(l);
    try {
      localStorage.setItem("worksheet-pdf-layout", l);
    } catch {
      /* non-fatal */
    }
  };
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const hydrated = useRef(false);
  const printRef = useRef<HTMLDivElement>(null);
  // Auto-save bookkeeping so nothing is lost even if the learner never clicks
  // Save. `rowIdRef` avoids inserting a duplicate row while the first insert is
  // in flight; `lastSavedRef` holds exactly what is on the server so we only push
  // real changes; `savingRef` serialises overlapping saves.
  const rowIdRef = useRef<string | null>(null);
  const lastSavedRef = useRef<string | null>(null);
  const savingRef = useRef(false);
  useEffect(() => {
    rowIdRef.current = rowId;
  }, [rowId]);

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
    rowIdRef.current = server?.id ?? null;
    setLastSavedAt(server?.updatedAt ?? null);
    // `lastSavedRef` tracks what is on the server. If a newer local draft differs,
    // the auto-save effect will push it up on hydration.
    lastSavedRef.current = JSON.stringify(server?.values ?? {});
    const draft = isAdminView ? null : readDraft(user?.id, slug as string);
    setValues(draft ?? server?.values ?? {});
    hydrated.current = true;
  }, [valid, loaded.isLoading, loaded.data, isAdminView, user?.id, slug]);

  // Reset hydration when switching worksheets / users.
  useEffect(() => {
    hydrated.current = false;
  }, [slug, ownerId]);

  // Autosave the in-progress draft to this device (own worksheet only) — instant,
  // offline-proof, and survives a refresh even before the server round-trip.
  useEffect(() => {
    if (!valid || isAdminView || !user?.id || !hydrated.current) return;
    try {
      localStorage.setItem(draftKey(user.id, slug as string), JSON.stringify(values));
    } catch {
      /* quota / private mode — non-fatal */
    }
  }, [values, valid, isAdminView, user?.id, slug]);

  // Auto-save to the learner's account (Supabase), debounced. This is what makes
  // the worksheet survive a cache clear, a different device, or a logout/login —
  // no need to remember to press Save. Guards: only real changes are pushed, the
  // first insert finishes before any follow-up (so no duplicate rows), and a
  // failed save is left in the localStorage draft to retry on the next edit.
  useEffect(() => {
    if (!valid || isAdminView || !user?.id || !hydrated.current) return;
    const serialized = JSON.stringify(values);
    if (serialized === lastSavedRef.current) return;
    let cancelled = false;
    const uid = user.id;
    const attempt = () => {
      if (cancelled) return;
      if (savingRef.current) {
        window.setTimeout(attempt, 400); // an earlier save is running — wait
        return;
      }
      savingRef.current = true;
      setAutoSaving(true);
      saveWorksheet(uid, slug as WorksheetSlug, values, rowIdRef.current)
        .then((id) => {
          rowIdRef.current = id;
          setRowId(id);
          lastSavedRef.current = serialized;
          setLastSavedAt(new Date().toISOString());
        })
        .catch(() => {
          /* keep the localStorage draft; the next edit retries */
        })
        .finally(() => {
          savingRef.current = false;
          setAutoSaving(false);
        });
    };
    const timer = window.setTimeout(attempt, 1200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
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

  // Vision board image (business plan only) — pulled from the owner's Vision
  // Board assignment and inlined as a data URL so html2canvas can rasterise it
  // into the PDF without a cross-origin taint.
  const visionBoard = useQuery({
    queryKey: ["worksheet-vision-board", ownerId],
    enabled: valid && slug === "business-plan" && !!ownerId,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data } = await (supabase.from as any)("assignment_submissions")
        .select("file_url, submitted_at")
        .eq("product_id", "first-60-days-assignments")
        .eq("item_id", "assignment-06-vision-board")
        .eq("user_id", ownerId)
        .order("submitted_at", { ascending: false })
        .limit(1);
      const url: string | undefined = data?.[0]?.file_url ?? undefined;
      if (!url) return null;
      try {
        const res = await fetch(url);
        const blob = await res.blob();
        return await new Promise<string>((resolve) => {
          const fr = new FileReader();
          fr.onload = () => resolve(String(fr.result));
          fr.onerror = () => resolve(url);
          fr.readAsDataURL(blob);
        });
      } catch {
        return url;
      }
    },
  });
  const images = visionBoard.data ? { vision_board: visionBoard.data } : undefined;

  // 100 Whys text (business plan only) — pulled from the owner's 100 Whys
  // assignment so it pre-fills the "My 100 Whys" section (still editable there).
  const hundredWhys = useQuery({
    queryKey: ["worksheet-100-whys", ownerId],
    enabled: valid && slug === "business-plan" && !!ownerId,
    staleTime: 5 * 60_000,
    queryFn: async () => {
      const { data } = await (supabase.from as any)("assignment_submissions")
        .select("submission_text, submitted_at")
        .eq("product_id", "first-60-days-assignments")
        .eq("item_id", "assignment-07-100-whys")
        .eq("user_id", ownerId)
        .order("submitted_at", { ascending: false })
        .limit(1);
      const raw = (data?.[0]?.submission_text as string | undefined)?.trim();
      if (!raw) return null;
      // The assignment is a multi-field form stored as JSON — pull out only the
      // "100 Whys" answer itself, not the whole blob of every prompt.
      try {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const keys = Object.keys(parsed);
          const key =
            keys.find((k) => /100\s*whys/i.test(k)) ??
            keys.find((k) => /why/i.test(k)) ??
            keys[0];
          return String(parsed[key] ?? "").trim() || null;
        }
      } catch {
        /* not JSON — it's already plain text */
      }
      return raw;
    },
  });
  const autofill = hundredWhys.data ? { hundred_whys_text: hundredWhys.data } : undefined;

  // Seed the 100 Whys text into the editable form state once, so the textarea is
  // a normal controlled field (fully clearable / backspaceable). A ref keeps a
  // deliberate clear from being re-filled, and admin (read-only) views are left
  // to render straight from `autofill`.
  const whysSeededFor = useRef<string | null>(null);
  useEffect(() => {
    if (!valid || slug !== "business-plan" || isAdminView) return;
    if (loaded.isLoading || !hydrated.current) return;
    const text = hundredWhys.data;
    if (!text || whysSeededFor.current === ownerId) return;
    whysSeededFor.current = ownerId ?? null;
    setValues((prev) => {
      const cur = prev.hundred_whys_text;
      // Seed when empty, or replace a stale raw-JSON blob left over from an older
      // build (so a genuine hand-written answer is never overwritten).
      if (cur?.trim() && !looksLikeFormJson(cur)) return prev;
      return { ...prev, hundred_whys_text: text };
    });
  }, [valid, slug, isAdminView, loaded.isLoading, hundredWhys.data, ownerId]);

  const onChange = (id: string, v: string) =>
    setValues((prev) => ({ ...prev, [id]: v }));

  const save = async () => {
    if (!user?.id) {
      toast.error("Please sign in to save.");
      return;
    }
    setSaving(true);
    try {
      const id = await saveWorksheet(user.id, slug as WorksheetSlug, values, rowIdRef.current);
      setRowId(id);
      rowIdRef.current = id;
      lastSavedRef.current = JSON.stringify(values);
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
    // Deck mode: landscape pages, full-bleed slides (the slide supplies its own
    // padding), so the holder gets no extra width or padding of its own.
    const deck = pdfLayout === "deck" && !isPledge;
    setGenerating(true);
    // Render the print HTML in a clean, on-screen, body-level container so the
    // modal's fixed / overflow / backdrop-blur ancestors don't make html2canvas
    // capture an empty region (the cause of the earlier blank pages).
    const holder = document.createElement("div");
    holder.style.cssText = `position:fixed;left:0;top:0;width:${deck ? DECK_SLIDE_W : 794}px;background:#ffffff;padding:${deck ? 0 : 24}px;z-index:2147483647;`;
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
      const pdf = new JsPDF({ unit: "mm", format: "a4", orientation: deck ? "landscape" : "portrait" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = deck ? 0 : 8;
      const imgW = pageW - margin * 2;
      const pxPerMm = canvas.width / imgW;
      const pageHpx = (pageH - margin * 2) * pxPerMm;

      // Element-aware pagination: measure each top-level block (heading, table,
      // field, note) in the captured layout, then pack whole blocks onto pages so
      // nothing is ever split mid-block, and a heading is never left stranded at
      // the foot of a page without the content that follows it.
      const root = (holder.querySelector(".wpv, .psv, .wdv") as HTMLElement) ?? holder;
      const hostTop = holder.getBoundingClientRect().top;
      type Block = { top: number; bottom: number; heading: boolean; breakAfter: boolean };
      const blocks: Block[] = [];
      const headingCls = ["wpv-step", "wpv-table-label", "blackband", "redband", "wpv-label"];
      // Collect measurable blocks in document order. A block taller than a whole
      // page (e.g. a long checklist) is broken into its own children so it splits
      // at an item boundary instead of being cut mid-item.
      const collect = (el: Element, markLastBreak = false) => {
        for (const child of Array.from(el.children)) {
          if (child.tagName === "STYLE") continue;
          const r = child.getBoundingClientRect();
          const top = (r.top - hostTop) * scale;
          const bottom = (r.bottom - hostTop) * scale;
          if (bottom - top < 1) continue;
          const c = child as HTMLElement;
          // The cover page / a deck slide always ends its page.
          const breakAfter =
            c.classList.contains("wpv-cover") ||
            c.classList.contains("wdv-slide") ||
            c.classList.contains("wdv-cover");
          // A block taller than a page must be broken down so it splits at an
          // inner boundary instead of being clipped. Recurse through ANY element
          // that has children — including single-child wrappers (e.g. a bordered
          // field that wraps one long <ol>/<table>), which previously slipped
          // through the `> 1` check and got rendered as one over-height, clipped
          // image (dropping everything past the first page). An over-tall slide
          // passes its page break down to its last descendant. A nested print
          // root (a WorksheetPrintView embedded in a deck slide) is always
          // transparent — treating it as one atomic block stranded a slide's
          // heading alone on its page whenever the body didn't quite fit.
          const printRoot = el !== root && (c.classList.contains("wpv") || c.classList.contains("psv"));
          if (printRoot || (bottom - top > pageHpx && child.children.length >= 1)) {
            collect(child, breakAfter);
            continue;
          }
          const heading = headingCls.some((h) => c.classList.contains(h));
          blocks.push({ top, bottom, heading, breakAfter });
        }
        if (markLastBreak && blocks.length > 0) blocks[blocks.length - 1].breakAfter = true;
      };
      collect(root);

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
          // …but don't strand a lone heading on an otherwise-empty page when the
          // very next block is itself taller than a page (it can only be sliced,
          // never packed) — keep the heading with the first slice of its content.
          if (
            last === i &&
            blocks[i].heading &&
            i + 1 < blocks.length &&
            blocks[i + 1].bottom - blocks[i + 1].top > pageHpx
          ) {
            last = i + 1;
          }
          // Honour an explicit page break (cover page) — end the page at it.
          for (let j = i; j <= last; j++) {
            if (blocks[j].breakAfter) { last = j; break; }
          }
          // If the page's content is taller than one page (an indivisible block,
          // e.g. a single huge paragraph), slice it across pages so nothing is
          // ever clipped/lost. Cut at a near-blank canvas row (the gap between
          // text lines) close to the page boundary so a line is never bisected.
          if (blocks[last].bottom - start > pageHpx) {
            const sctx = canvas.getContext("2d", { willReadFrequently: true });
            const x0 = Math.floor(canvas.width * 0.05);
            const x1 = Math.ceil(canvas.width * 0.95);
            const cutAt = (target: number, floor: number): number => {
              const t = Math.min(Math.round(target), canvas.height);
              if (!sctx) return t;
              const win = Math.round(pageHpx * 0.14);
              let bestY = t;
              let bestInk = Infinity;
              for (let y = t; y > t - win && y > floor + 1; y--) {
                let ink = 0;
                const row = sctx.getImageData(x0, y, x1 - x0, 1).data;
                for (let p = 0; p < row.length; p += 4 * 6) {
                  if (row[p] < 245 || row[p + 1] < 245 || row[p + 2] < 245) ink++;
                }
                if (ink < bestInk) {
                  bestInk = ink;
                  bestY = y;
                  if (ink === 0) break; // fully blank row — ideal cut
                }
              }
              return bestY;
            };
            let s = start;
            while (blocks[last].bottom - s > pageHpx) {
              const cut = cutAt(s + pageHpx, s);
              pages.push({ start: s, end: cut });
              s = cut;
            }
            pages.push({ start: s, end: blocks[last].bottom });
          } else {
            pages.push({ start, end: blocks[last].bottom });
          }
          i = last + 1;
          if (i < blocks.length) start = blocks[i].top; // trim inter-block gap
        }
      }

      // Safety net: html2canvas can paint content a few px lower than the DOM
      // measurement (line-height rounding accumulates down the page), so a cut
      // taken exactly at a measured block bottom can shave the last text line.
      // Nudge every page end down to the nearest blank canvas row, staying
      // inside the gap before the next page's content.
      const snapCtx = canvas.getContext("2d", { willReadFrequently: true });
      if (snapCtx) {
        const x0 = Math.floor(canvas.width * 0.05);
        const x1 = Math.ceil(canvas.width * 0.95);
        const rowBlank = (y: number): boolean => {
          const row = snapCtx.getImageData(x0, Math.min(Math.round(y), canvas.height - 1), x1 - x0, 1).data;
          for (let p = 0; p < row.length; p += 4 * 6) {
            if (row[p] < 245 || row[p + 1] < 245 || row[p + 2] < 245) return false;
          }
          return true;
        };
        for (let p = 0; p < pages.length; p++) {
          const cap = Math.min(
            p + 1 < pages.length ? pages[p + 1].start : canvas.height,
            pages[p].end + 14 * scale,
            canvas.height,
          );
          let e = Math.round(pages[p].end);
          while (e < cap && !rowBlank(e)) e++;
          pages[p].end = e;
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

      // Footer on every page: name (left) and "Page x of y" (right). Skip the
      // cover page (page 1 when a cover is present) so it stays clean.
      const total = pdf.getNumberOfPages();
      const coverOn = deck || (values._cover === "yes" && slug !== "pledge-sheet");
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      const fx = Math.max(margin, 10); // keep the footer off the page edge on full-bleed pages
      for (let p = 1; p <= total; p++) {
        if (coverOn && p === 1) continue;
        pdf.setPage(p);
        const y = pageH - 4;
        if (who) pdf.text(who, fx, y);
        pdf.text(`Page ${p} of ${total}`, pageW - fx, y, { align: "right" });
      }

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
        {!isAdminView && (autoSaving || lastSavedAt) && (
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            {autoSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                Saved automatically
              </>
            )}
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
          <WorksheetForm schema={schema} values={values} onChange={onChange} readOnly={readOnly} images={images} autofill={autofill} />
        )}
      </div>

      {/* Preview modal: shows the exact PDF layout on-screen and downloads it.
          Rendered in a body-level portal — an ancestor with a CSS transform
          (the route's page-transition wrapper) would otherwise become the
          containing block for `fixed` and push the modal off-screen. */}
      {previewOpen && createPortal(
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm"
          onClick={() => !generating && setPreviewOpen(false)}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <span className="text-sm font-semibold text-white">Preview — {meta.title}</span>
            <div className="flex items-center gap-2">
              {!isPledge && (
                <div className="flex overflow-hidden rounded-md border border-white/25 text-xs font-semibold">
                  <button
                    type="button"
                    disabled={generating}
                    onClick={(e) => { e.stopPropagation(); setLayoutMode("doc"); }}
                    className={`px-2.5 py-1.5 ${pdfLayout === "doc" ? "bg-white text-neutral-900" : "text-white/80 hover:text-white"}`}
                  >
                    A4 document
                  </button>
                  <button
                    type="button"
                    disabled={generating}
                    onClick={(e) => { e.stopPropagation(); setLayoutMode("deck"); }}
                    className={`px-2.5 py-1.5 ${pdfLayout === "deck" ? "bg-white text-neutral-900" : "text-white/80 hover:text-white"}`}
                  >
                    Landscape deck
                  </button>
                </div>
              )}
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
            <div className="mx-auto" style={{ width: !isPledge && pdfLayout === "deck" ? `${DECK_SLIDE_W}px` : "794px", maxWidth: "100%" }}>
              <div
                ref={printRef}
                style={{
                  background: "#fff",
                  padding: !isPledge && pdfLayout === "deck" ? 0 : "24px",
                  borderRadius: "6px",
                  overflow: "hidden",
                }}
              >
                {isPledge ? (
                  <PledgeSheetPrintView values={values} />
                ) : pdfLayout === "deck" ? (
                  <WorksheetDeckPrintView
                    title={meta.title}
                    subtitle="My plan for the next five years — my goals, my strengths, how I'll find and win clients, and the standards I'm holding myself to."
                    schema={schema}
                    values={values}
                    images={images}
                    autofill={autofill}
                  />
                ) : (
                  <WorksheetPrintView
                    title={meta.title}
                    subtitle="My plan for the next five years — my goals, my strengths, how I'll find and win clients, and the standards I'm holding myself to."
                    schema={schema}
                    values={values}
                    images={images}
                    autofill={autofill}
                  />
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body,
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
          Everything you type saves automatically — to this device instantly and to your account a
          moment later. Come back any time, on any device, even after logging out. The Save button is
          optional.
        </p>
      )}
    </div>
  );
}
