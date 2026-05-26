import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image as ImageIcon, Upload, Loader2, CheckCircle2, Download, Sparkles, RefreshCw, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import { useFcBrandBrochure } from "@/hooks/useFcBrandBrochure";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  brandBrief: any;
  formData: any;
  framework: { name: string; description: string; steps: string[] } | null;
};

// Higgsfield Soul-2 training requires 5–20 reference images.
const MIN_PHOTOS = 5;
const MAX_PHOTOS = 8;

const STYLE_LABELS: Record<string, string> = {
  professional: "Professional",
  lifestyle: "Lifestyle",
  environmental: "Environmental",
  hero: "Hero",
};

const CONTACT_STORAGE_KEY = "fads-brochure-contact-v1";

type ContactInfo = { name: string; phone: string; email: string };

export function BrochureBuilderCard({ brandBrief, formData, framework }: Props) {
  const brochure = useFcBrandBrochure();
  const { user } = useSimplifiedAuth();
  const [stagedPaths, setStagedPaths] = useState<string[]>([]);
  const [stagedPreviews, setStagedPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  // When true, force the upload UI even if a previous row exists.
  // Cleared automatically once a *new* row appears (different id).
  const [newAttemptMode, setNewAttemptMode] = useState(false);
  const newAttemptBaselineRowId = useRef<string | null>(null);
  const [contact, setContact] = useState<ContactInfo>({ name: "", phone: "", email: "" });
  const contactHydrated = useRef(false);
  // AI-polished overrides for the headline copy on the brochure. Empty until
  // the learner clicks "Polish copy with AI"; rendered in BrochurePage when set.
  const [polishedCopy, setPolishedCopy] = useState<{ tagline?: string; mission?: string }>({});
  const [polishingCopy, setPolishingCopy] = useState(false);

  // Fetch FC's profile for default display name
  const profileQuery = useQuery({
    queryKey: ["fc-profile-for-brochure", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from("profiles")
        .select("display_name, first_name, last_name, email")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user?.id,
    staleTime: Infinity,
  });

  // Hydrate contact from localStorage first, then fill from profile if empty
  useEffect(() => {
    if (typeof window === "undefined" || contactHydrated.current) return;
    try {
      const raw = localStorage.getItem(CONTACT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setContact({ name: parsed.name || "", phone: parsed.phone || "", email: parsed.email || "" });
        }
      }
    } catch {/* ignore */}
    contactHydrated.current = true;
  }, []);

  useEffect(() => {
    if (!contactHydrated.current) return;
    if (!profileQuery.data && !user) return;
    setContact(prev => {
      const next = { ...prev };
      if (!next.name) {
        const p = profileQuery.data;
        next.name = p?.display_name
          || [p?.first_name, p?.last_name].filter(Boolean).join(" ")
          || (user?.email ? user.email.split("@")[0] : "");
      }
      if (!next.email) next.email = profileQuery.data?.email || user?.email || "";
      return next;
    });
  }, [profileQuery.data, user]);

  // Persist contact whenever it changes
  useEffect(() => {
    if (!contactHydrated.current) return;
    try {
      localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(contact));
    } catch {/* ignore */}
  }, [contact]);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const brochureRef = useRef<HTMLDivElement>(null);

  const handleSelectFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const remaining = MAX_PHOTOS - stagedPaths.length;
      const toUpload = Array.from(files).slice(0, remaining);
      if (!toUpload.length) {
        toast.error(`Maximum ${MAX_PHOTOS} photos`);
        return;
      }
      setUploading(true);
      try {
        const offset = stagedPaths.length;
        const uploaded: string[] = [];
        const previews: string[] = [];
        for (let i = 0; i < toUpload.length; i++) {
          const file = toUpload[i];
          const path = await brochure.uploadPhoto(file, offset + i);
          uploaded.push(path);
          previews.push(URL.createObjectURL(file));
        }
        setStagedPaths(prev => [...prev, ...uploaded]);
        setStagedPreviews(prev => [...prev, ...previews]);
        toast.success(`Uploaded ${uploaded.length} photo${uploaded.length > 1 ? "s" : ""}`);
      } catch (e: any) {
        toast.error(e?.message || "Upload failed");
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [brochure, stagedPaths.length],
  );

  const removeStaged = (i: number) => {
    setStagedPaths(prev => prev.filter((_, idx) => idx !== i));
    setStagedPreviews(prev => {
      const url = prev[i];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, idx) => idx !== i);
    });
  };

  const handleGenerate = async () => {
    try {
      const styleVibe = `${formData.personalityStyle || "default"}-${formData.audience1Occupation || "general"}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      await brochure.enqueue({
        sourcePaths: stagedPaths,
        brandBrief,
        styleVibe,
      });
      setStagedPaths([]);
      setStagedPreviews([]);
      // New row will become the "latest" — leaving newAttemptMode wins automatically
      // once the polling query refetches. Belt-and-braces clear here too.
      setNewAttemptMode(false);
      newAttemptBaselineRowId.current = null;
      toast.success("Headshot generation queued. This usually takes 2–5 minutes.");
    } catch (e: any) {
      toast.error(e?.message || "Failed to queue generation");
    }
  };

  const handleStartOver = () => {
    newAttemptBaselineRowId.current = brochure.row?.id ?? null;
    setStagedPaths([]);
    setStagedPreviews([]);
    setNewAttemptMode(true);
  };

  // Auto-exit newAttemptMode once a new row (different id from baseline) appears.
  useEffect(() => {
    if (!newAttemptMode) return;
    if (brochure.row && brochure.row.id !== newAttemptBaselineRowId.current) {
      setNewAttemptMode(false);
      newAttemptBaselineRowId.current = null;
    }
  }, [newAttemptMode, brochure.row]);

  const handleSelectVariant = async (path: string) => {
    if (!brochure.row) return;
    try {
      await brochure.selectVariant({ rowId: brochure.row.id, selectedPath: path });
      toast.success("Headshot selected");
    } catch (e: any) {
      toast.error(e?.message || "Failed to select variant");
    }
  };

  const polishBrochureCopy = async () => {
    setPolishingCopy(true);
    try {
      const taglineDraft =
        formData.endResultStatement ||
        `I help ${formData.audience1Occupation || "[your audience]"} achieve their financial goals.`;
      const missionDraft = formData.mission || formData.purpose || "";

      const calls: Array<Promise<void>> = [];
      const next: { tagline?: string; mission?: string } = {};

      const polish = async (
        key: "tagline" | "mission",
        name: string,
        purpose: string,
        draft: string,
      ) => {
        if (!draft.trim()) return;
        const { data, error } = await supabase.functions.invoke("generate-collateral", {
          body: {
            brandBrief,
            target: { kind: "brochure-blurb", id: key, name, channelOrPurpose: purpose, draft },
          },
        });
        if (error) throw error;
        const polished = (data as { polished?: string } | null)?.polished?.trim();
        if (polished) next[key] = polished;
      };

      calls.push(
        polish(
          "tagline",
          "Brochure tagline (hero one-liner)",
          "Headline copy printed under the FC name on the brochure cover — one sentence, plain English, no marketing fluff.",
          taglineDraft,
        ),
      );
      calls.push(
        polish(
          "mission",
          "Brochure mission paragraph",
          "Mission paragraph on the brochure body — two to three sentences, professional warm, anchored on the audience the FC is here to serve.",
          missionDraft,
        ),
      );

      await Promise.all(calls);

      if (!next.tagline && !next.mission) {
        toast.error("AI polish returned nothing — try again.");
        return;
      }
      setPolishedCopy((prev) => ({ ...prev, ...next }));
      toast.success("AI-polished brochure copy ready.");
    } catch (err) {
      console.warn("polishBrochureCopy failed", err);
      toast.error("AI polish failed — the original copy is still in the brochure.");
    } finally {
      setPolishingCopy(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!brochureRef.current || !brochure.row) return;
    setGeneratingPdf(true);
    try {
      const dataUrl = await toPng(brochureRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: 2,
        cacheBust: true,
      });
      // A4 portrait 210 x 297 mm
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      pdf.addImage(dataUrl, "PNG", 0, 0, 210, 297);
      const blob = pdf.output("blob");
      // Upload to storage + mark rendered, then trigger local download
      const path = await brochure.uploadBrochurePdf(brochure.row.id, blob);
      await brochure.markRendered({ rowId: brochure.row.id, pdfPath: path });
      pdf.save("brochure.pdf");
      toast.success("Brochure downloaded and saved");
    } catch (e: any) {
      toast.error(e?.message || "PDF generation failed");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const selectedVariant = brochure.variants.find(v => v.path === brochure.selectedPath);

  // --- Render states ---
  const stage = (() => {
    if (newAttemptMode) return "upload";
    if (!brochure.row) return "upload";
    if (brochure.row.status === "queued" || brochure.row.status === "generating") return "polling";
    if (brochure.row.status === "failed") return "failed";
    if (brochure.row.status === "ready" || brochure.row.status === "rendered") return "ready";
    return "upload";
  })();

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">1-Page Leave-Behind Brochure</CardTitle>
            <CardDescription className="mt-1">
              Print-ready A4 PDF you hand a prospect after the first appointment. Includes an AI-generated styled headshot based on your uploaded photos.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ===== STAGE: UPLOAD ===== */}
        {stage === "upload" && (
          <>
            <div className="rounded-lg border-2 border-dashed border-muted-foreground/30 p-6">
              <div className="text-center mb-4">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm font-medium">Upload {MIN_PHOTOS}–{MAX_PHOTOS} photos of yourself</p>
                <p className="text-xs text-muted-foreground mt-1">Mix of selfies, casual shots, and any professional photo. The AI uses these to learn your face.</p>
              </div>
              <div className="flex justify-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleSelectFiles(e.target.files)}
                  className="hidden"
                  id="brochure-photo-upload"
                />
                <Button asChild variant="outline" disabled={uploading || stagedPaths.length >= MAX_PHOTOS}>
                  <label htmlFor="brochure-photo-upload" className="cursor-pointer">
                    {uploading ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Uploading...</>
                    ) : (
                      <><Upload className="h-4 w-4 mr-2" /> Choose photos</>
                    )}
                  </label>
                </Button>
              </div>

              {stagedPreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-5 gap-2">
                  {stagedPreviews.map((src, i) => (
                    <div key={src} className="relative aspect-square rounded overflow-hidden border bg-muted group">
                      <img src={src} alt={`upload ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeStaged(i)}
                        className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Remove photo"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button
              onClick={handleGenerate}
              disabled={stagedPaths.length < MIN_PHOTOS || brochure.enqueueState.isPending}
              className="w-full"
              size="lg"
            >
              {brochure.enqueueState.isPending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Queueing...</>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate 4 styled headshots ({stagedPaths.length}/{MIN_PHOTOS} minimum)
                </>
              )}
            </Button>
          </>
        )}

        {/* ===== STAGE: POLLING ===== */}
        {stage === "polling" && (
          <div className="text-center py-8 space-y-3">
            <Loader2 className="h-10 w-10 text-primary mx-auto animate-spin" />
            <p className="font-semibold">Generating your headshots...</p>
            <p className="text-sm text-muted-foreground">
              The AI is training on your photos and creating 4 styled variants. This usually takes 2–5 minutes — feel free to leave this tab open or come back later.
            </p>
            <p className="text-xs text-muted-foreground italic">Status: {brochure.row?.status}</p>
          </div>
        )}

        {/* ===== STAGE: FAILED ===== */}
        {stage === "failed" && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
            <div className="flex gap-2 items-start">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm">Headshot generation failed</p>
                <p className="text-xs text-muted-foreground mt-1">{brochure.row?.headshot_error || "Unknown error"}</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={handleStartOver} className="gap-2">
              <RefreshCw className="h-3 w-3" /> Try again with different photos
            </Button>
          </div>
        )}

        {/* ===== STAGE: READY (pick variant + render brochure) ===== */}
        {stage === "ready" && (
          <>
            <div>
              <p className="text-sm font-medium mb-2">Pick the headshot for your brochure</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {brochure.variants.map(v => {
                  const isSelected = v.path === brochure.selectedPath;
                  return (
                    <button
                      key={v.path}
                      type="button"
                      onClick={() => handleSelectVariant(v.path)}
                      className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 bg-muted transition-all ${isSelected ? "border-primary ring-2 ring-primary/30" : "border-transparent hover:border-muted-foreground/50"}`}
                    >
                      {v.url ? (
                        <img src={v.url} alt={v.styleId} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 text-center capitalize">
                        {STYLE_LABELS[v.styleId] || v.styleId}
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                          <CheckCircle2 className="h-3 w-3" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedVariant?.url && (
              <>
                {/* Contact override — name/phone/email shown on the brochure */}
                <div className="rounded-lg border bg-muted/20 p-4 space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Brochure contact details</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="brochure-name" className="text-xs">Display name</Label>
                      <Input id="brochure-name" value={contact.name} onChange={e => setContact(c => ({ ...c, name: e.target.value }))} placeholder="Your name" />
                    </div>
                    <div>
                      <Label htmlFor="brochure-phone" className="text-xs">Phone / WhatsApp</Label>
                      <Input id="brochure-phone" value={contact.phone} onChange={e => setContact(c => ({ ...c, phone: e.target.value }))} placeholder="+65 9123 4567" />
                    </div>
                    <div>
                      <Label htmlFor="brochure-email" className="text-xs">Email</Label>
                      <Input id="brochure-email" value={contact.email} onChange={e => setContact(c => ({ ...c, email: e.target.value }))} placeholder="you@example.com" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground italic">Saved locally — only edit once unless you change them.</p>
                </div>

                <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Brochure preview</p>
                    <div className="flex items-center gap-2">
                      {(polishedCopy.tagline || polishedCopy.mission) && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">AI-polished</span>
                      )}
                      <Button
                        size="sm"
                        variant={polishedCopy.tagline || polishedCopy.mission ? "outline" : "default"}
                        onClick={polishBrochureCopy}
                        disabled={polishingCopy}
                        className="gap-1 h-7 text-xs"
                      >
                        {polishingCopy ? (
                          <><Loader2 className="h-3 w-3 animate-spin" /> Polishing...</>
                        ) : polishedCopy.tagline || polishedCopy.mission ? (
                          <><Sparkles className="h-3 w-3" /> Re-polish copy</>
                        ) : (
                          <><Sparkles className="h-3 w-3" /> AI polish copy</>
                        )}
                      </Button>
                      {(polishedCopy.tagline || polishedCopy.mission) && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setPolishedCopy({})}
                          className="h-7 text-xs"
                        >
                          Revert to template
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="bg-white rounded shadow-sm overflow-hidden mx-auto" style={{ maxWidth: "100%" }}>
                    {/* Off-screen scale wrapper so the preview fits while the source renders at full A4 dimensions */}
                    <div style={{ transform: "scale(0.5)", transformOrigin: "top left", width: "200%", height: "auto" }}>
                      <BrochurePage
                        ref={brochureRef}
                        brandBrief={brandBrief}
                        formData={formData}
                        framework={framework}
                        headshotUrl={selectedVariant.url}
                        contact={contact}
                        overrides={polishedCopy}
                      />
                    </div>
                  </div>
                </div>
                <Button onClick={handleDownloadPdf} disabled={generatingPdf} className="w-full" size="lg">
                  {generatingPdf ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating PDF...</>
                  ) : (
                    <><Download className="h-4 w-4 mr-2" /> Download Brochure (PDF)</>
                  )}
                </Button>
              </>
            )}
            {!selectedVariant && (
              <p className="text-sm text-muted-foreground text-center italic">Pick a headshot above to preview the brochure.</p>
            )}

            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:underline">Not happy with these? Start over.</summary>
              <div className="mt-2 pt-2 border-t">
                <p className="text-muted-foreground mb-2">Uploading a new set will create a new brochure job — the existing one stays in your history.</p>
                <Button size="sm" variant="outline" onClick={handleStartOver} className="gap-2">
                  <RefreshCw className="h-3 w-3" /> Upload different photos
                </Button>
              </div>
            </details>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// BrochurePage — printable A4 layout. Rendered at 794x1123 (A4 @ 96dpi), then
// captured to PNG via html-to-image and embedded into a jsPDF A4 page.
// ============================================================================

type BrochurePageProps = {
  brandBrief: any;
  formData: any;
  framework: { name: string; description: string; steps: string[] } | null;
  headshotUrl: string;
  contact: ContactInfo;
  overrides?: { tagline?: string; mission?: string };
};

const BrochurePage = forwardRef<HTMLDivElement, BrochurePageProps>(({ brandBrief, formData, framework, headshotUrl, contact, overrides }, ref) => {
  const fcName = contact.name || "[Your Name]";
  const tagline =
    overrides?.tagline ||
    formData.endResultStatement ||
    `I help ${formData.audience1Occupation || "[your audience]"} achieve their financial goals.`;
  const mission = overrides?.mission || formData.mission || formData.purpose || "";
  const audience = formData.audience1Occupation || "";
  const audienceDesc = formData.audience1DesiredState || "";
  const certs = formData.certifications || "Licensed Financial Consultant";
  const story1 = formData.moment1 || "";
  const story2 = formData.moment2 || "";

  return (
    <div
      ref={ref}
      style={{
        width: "794px",
        height: "1123px",
        background: "#ffffff",
        color: "#1a1a1a",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {/* Header band */}
      <div style={{ height: "220px", display: "flex", background: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)", color: "white", padding: "40px", alignItems: "center", gap: "32px" }}>
        <div style={{ width: "140px", height: "140px", borderRadius: "70px", overflow: "hidden", flexShrink: 0, border: "4px solid white", boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}>
          <img src={headshotUrl} alt="headshot" style={{ width: "100%", height: "100%", objectFit: "cover" }} crossOrigin="anonymous" />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: "36px", fontWeight: 700, margin: 0, lineHeight: 1.1 }}>{fcName}</h1>
          <p style={{ fontSize: "14px", opacity: 0.9, margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "1px" }}>{certs}</p>
          <p style={{ fontSize: "18px", marginTop: "16px", fontStyle: "italic", lineHeight: 1.4 }}>{tagline}</p>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, padding: "32px 40px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {mission && (
          <section>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#3b82f6", letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>Mission</p>
            <p style={{ fontSize: "15px", marginTop: "6px", lineHeight: 1.5 }}>{mission}</p>
          </section>
        )}

        {audience && (
          <section>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#3b82f6", letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>Who I serve</p>
            <p style={{ fontSize: "15px", marginTop: "6px", lineHeight: 1.5 }}>
              <strong>{audience}</strong>{audienceDesc ? ` — who want ${audienceDesc.replace(/\.$/, "").toLowerCase()}` : ""}.
            </p>
          </section>
        )}

        {framework && (
          <section>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#3b82f6", letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>How I work — {framework.name}</p>
            <p style={{ fontSize: "13px", marginTop: "4px", color: "#666" }}>{framework.description}</p>
            <ol style={{ marginTop: "8px", paddingLeft: "20px", fontSize: "14px", lineHeight: 1.6 }}>
              {framework.steps.map((s, i) => (
                <li key={i} style={{ marginBottom: "4px" }}>{s}</li>
              ))}
            </ol>
          </section>
        )}

        {(story1 || story2) && (
          <section>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "#3b82f6", letterSpacing: "1px", textTransform: "uppercase", margin: 0 }}>Defining moments</p>
            <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {story1 && <div style={{ fontSize: "13px", padding: "10px 12px", background: "#f8fafc", borderLeft: "3px solid #3b82f6", lineHeight: 1.4 }}>{story1}</div>}
              {story2 && <div style={{ fontSize: "13px", padding: "10px 12px", background: "#f8fafc", borderLeft: "3px solid #3b82f6", lineHeight: 1.4 }}>{story2}</div>}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <div style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0", padding: "16px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "#64748b" }}>
        <div>
          <p style={{ margin: 0, fontWeight: 600, color: "#334155" }}>Let's talk.</p>
          <p style={{ margin: "2px 0 0" }}>{[contact.phone, contact.email].filter(Boolean).join(" · ") || "+65 [your number] · [your.email]"}</p>
        </div>
        <div style={{ textAlign: "right", maxWidth: "55%" }}>
          <p style={{ margin: 0, fontStyle: "italic" }}>
            This brochure is for general information only — not financial advice. Suitability depends on your circumstances.
          </p>
        </div>
      </div>
    </div>
  );
});
BrochurePage.displayName = "BrochurePage";
