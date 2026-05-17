/**
 * CaseReferencePhotos
 *
 * Pulls the auto-matched + admin-tagged reference photos for a given case id,
 * lets the viewer mark wrong matches as "Not relevant" (persisted to
 * localStorage), and offers a reset button to unhide them. localStorage keys
 * are namespaced per case so curating one case doesn't affect others.
 *
 * Photos come from two sources, merged here and de-dup'd by URL:
 *   1) Static auto-matched JSON (src/data/case-reference-photos.json, built
 *      by tools/match-photos-to-cases.py).
 *   2) photo_case_tags table — admin-curated via /admin/assign-drawings.
 */
import { useState, useEffect } from "react";
import { X, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import caseReferencePhotosRaw from "@/data/case-reference-photos.json";

export interface CaseReferencePhoto {
  url: string;
  summary: string;
  score: number;
  evidence: string[];
}

const CASE_REFERENCE_PHOTOS = caseReferencePhotosRaw as Record<
  string,
  CaseReferencePhoto[]
>;

export function CaseReferencePhotos({ caseId }: { caseId: string }) {
  const HIDDEN_KEY = `case-vault.hidden-ref-photos.${caseId}`;

  const [adminTagged, setAdminTagged] = useState<CaseReferencePhoto[]>([]);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await (supabase as any)
        .from("photo_case_tags")
        .select("photo_url")
        .eq("case_id", caseId);
      if (cancelled || error || !Array.isArray(data)) return;
      setAdminTagged(
        data.map((row: { photo_url: string }) => ({
          url: row.photo_url,
          summary: "Manually tagged by admin",
          score: 999,
          evidence: ["admin-tagged"],
        }))
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [caseId]);

  const autoMatched = CASE_REFERENCE_PHOTOS[caseId] ?? [];
  const seen = new Set<string>();
  const photos = [...adminTagged, ...autoMatched].filter((p) => {
    if (seen.has(p.url)) return false;
    seen.add(p.url);
    return true;
  });

  const [hiddenUrls, setHiddenUrls] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const raw = localStorage.getItem(HIDDEN_KEY);
      return new Set<string>(raw ? JSON.parse(raw) : []);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HIDDEN_KEY);
      setHiddenUrls(new Set<string>(raw ? JSON.parse(raw) : []));
    } catch {
      setHiddenUrls(new Set());
    }
  }, [HIDDEN_KEY]);

  const persist = (next: Set<string>) => {
    setHiddenUrls(next);
    try {
      localStorage.setItem(HIDDEN_KEY, JSON.stringify(Array.from(next)));
    } catch {
      /* localStorage full / disabled — silently degrade */
    }
  };

  const visible = photos.filter((p) => !hiddenUrls.has(p.url));
  if (photos.length === 0) return null;

  const allHidden = visible.length === 0 && hiddenUrls.size > 0;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2 gap-2 flex-wrap">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Reference photos from the case-study chat ({visible.length}
          {hiddenUrls.size > 0 ? (
            <span className="text-amber-600 dark:text-amber-400">
              {" "}
              · {hiddenUrls.size} hidden
            </span>
          ) : null}
          )
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-muted-foreground/60 italic">
            auto-matched · hover for description · ✕ to hide
          </span>
          {hiddenUrls.size > 0 && (
            <button
              type="button"
              onClick={() => persist(new Set())}
              className="inline-flex items-center gap-1 text-primary hover:underline"
              title="Unhide every photo you previously marked Not relevant for this case"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
        </div>
      </div>
      {allHidden ? (
        <div className="rounded-lg border border-dashed border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 p-3 text-xs text-amber-900 dark:text-amber-200">
          All auto-matched photos for this case were marked Not relevant. Click
          Reset above to unhide them.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {visible.map((p) => (
            <div
              key={p.url}
              className="group/refimg relative rounded-lg overflow-hidden border bg-white aspect-[4/3] hover:border-primary/60 transition-colors"
            >
              <a
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                title={`${p.summary}\n\nEvidence: ${p.evidence.join(", ")}\n(Click thumbnail to open full-size; click ✕ to mark Not relevant)`}
                className="block w-full h-full"
              >
                <img
                  src={p.url}
                  alt={p.summary}
                  loading="lazy"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-x-0 bottom-0 z-10 translate-y-full group-hover/refimg:translate-y-0 transition-transform bg-black/85 text-white text-[10px] leading-snug px-2 py-1.5 pointer-events-none">
                  <div className="line-clamp-3">{p.summary}</div>
                </div>
              </a>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  const next = new Set(hiddenUrls);
                  next.add(p.url);
                  persist(next);
                }}
                className="absolute top-1 right-1 z-20 inline-flex items-center gap-1 rounded-md bg-destructive/90 hover:bg-destructive text-white text-[10px] font-medium px-1.5 py-0.5 shadow-sm opacity-0 group-hover/refimg:opacity-100 transition-opacity"
                title="Hide this photo from this case (you can unhide via Reset)"
              >
                <X className="h-3 w-3" />
                Not relevant
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
