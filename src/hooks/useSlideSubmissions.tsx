import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from './useAuth';
import { useChecklistProgress } from './useChecklistProgress';
import { supabase } from '@/integrations/supabase/client';
import { scheduleIdle } from '@/lib/idle';
import {
  GET_READY_SLIDES,
  getSlideById,
  getSlidesForSection,
} from '@/components/cmfas/workspace-views/getReadySlideContent';
import type { ReadyStepId } from '@/components/cmfas/workspace-views/getReadyData';

/**
 * Per-slide verification submissions for the CMFAS Study Desk.
 *
 * Source of truth is Supabase table `user_slide_submissions` (see SUPABASE.md).
 * Screenshots live in the private `checklist-screenshots` storage bucket at
 * `<user_id>/<slide_id>.<ext>`; `screenshot_url` on the row stores that path
 * (not a signed URL — URLs expire, paths don't). Call `getScreenshotSignedUrl`
 * when you need to render one.
 *
 * Section roll-up: when submitting the last remaining slide of a section,
 * the matching section row in `user_checklist_progress` is also flipped to
 * complete, so the Papers/Practice gate driven by `useChecklistProgress`
 * keeps working as today.
 *
 * Graceful degradation: if Supabase is unreachable or the table is missing
 * (pre-migration window), the hook silently falls back to in-memory state —
 * `console.warn` once per failed call, no user-visible error.
 */

export interface SlideSubmission {
  slideId: string;
  answerText: string | null;
  screenshotUrl: string | null;
  submittedAt: string;
}

export interface SubmitSlidePayload {
  text?: string;
  file?: File;
}

interface SlideSubmissionsContextType {
  submissions: Map<string, SlideSubmission>;
  /** True once the initial Supabase fetch has settled (success OR failure).
   *  Consumers gate URL-positioning effects on this so they don't evaluate
   *  progress before the row set is loaded. */
  hasHydrated: boolean;
  isSubmitted: (slideId: string) => boolean;
  submitSlide: (slideId: string, payload: SubmitSlidePayload) => Promise<void>;
  getScreenshotSignedUrl: (path: string) => Promise<string | null>;
}

const SCREENSHOT_BUCKET = 'checklist-screenshots';
const SIGNED_URL_TTL_SECONDS = 60 * 60;

const SlideSubmissionsContext = createContext<SlideSubmissionsContextType>({
  submissions: new Map(),
  hasHydrated: false,
  isSubmitted: () => false,
  submitSlide: async () => {},
  getScreenshotSignedUrl: async () => null,
});

function fileExtension(file: File): string {
  const byName = file.name.split('.').pop()?.toLowerCase();
  if (byName && byName.length <= 5) return byName;
  if (file.type === 'image/png') return 'png';
  if (file.type === 'image/jpeg') return 'jpg';
  if (file.type === 'image/webp') return 'webp';
  return 'bin';
}

export function SlideSubmissionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { completeItem } = useChecklistProgress();
  const [submissions, setSubmissions] = useState<Map<string, SlideSubmission>>(new Map());
  const [hasHydrated, setHasHydrated] = useState(false);
  const hydrationRanForUser = useRef<string | null>(null);
  /** Mirror of `submissions` that always points at the freshest map, so
   *  rapidly-sequential `submitSlide` calls can't each capture a stale
   *  closure and overwrite each other's optimistic entries. Used for both
   *  the optimistic merge and the section-rollup check. */
  const submissionsRef = useRef<Map<string, SlideSubmission>>(new Map());

  useEffect(() => {
    submissionsRef.current = submissions;
  }, [submissions]);

  useEffect(() => {
    if (!user) {
      setSubmissions(new Map());
      submissionsRef.current = new Map();
      // Don't prematurely mark hydrated on initial mount with null user
      // (auth still resolving). Only mark hydrated when we affirmatively
      // know the user state.
      if (hydrationRanForUser.current !== null) {
        // User was previously signed in — they've now signed out. Reset.
        setHasHydrated(true);
      }
      hydrationRanForUser.current = null;
      return;
    }
    if (hydrationRanForUser.current === user.id) return;
    hydrationRanForUser.current = user.id;
    setHasHydrated(false);

    let cancelled = false;

    const runHydration = async () => {
      try {
        const { data, error } = await supabase
          .from('user_slide_submissions')
          .select('slide_id, answer_text, screenshot_url, submitted_at')
          .eq('user_id', user.id);
        if (error) throw error;
        if (cancelled) return;

        const rows = data ?? [];

        const next = new Map<string, SlideSubmission>();
        for (const row of rows) {
          next.set(row.slide_id, {
            slideId: row.slide_id,
            answerText: row.answer_text,
            screenshotUrl: row.screenshot_url,
            submittedAt: row.submitted_at,
          });
        }
        submissionsRef.current = next;
        setSubmissions(next);
      } catch (err) {
        console.warn(
          '[useSlideSubmissions] Supabase read failed, starting with empty in-memory state.',
          err,
        );
      } finally {
        if (!cancelled) setHasHydrated(true);
      }
    };

    // Defer hydration so the learning-track critical-path queries go first —
    // this provider's data is only read from CMFAS views that live behind a
    // route transition.
    const cancelIdle = scheduleIdle(() => {
      if (!cancelled) void runHydration();
    });

    return () => {
      cancelled = true;
      cancelIdle();
    };
  }, [user]);

  const submitSlide = useCallback(
    async (slideId: string, payload: SubmitSlidePayload) => {
      const slide = getSlideById(slideId);
      if (!slide) {
        console.warn('[useSlideSubmissions] submitSlide called with unknown slideId', slideId);
        return;
      }
      const now = new Date().toISOString();
      const textValue = payload.text?.trim() || null;
      let storagePath: string | null = null;

      // Upload screenshot first so the row reflects the final path.
      if (payload.file && user) {
        const path = `${user.id}/${slideId}.${fileExtension(payload.file)}`;
        try {
          const { error } = await supabase.storage
            .from(SCREENSHOT_BUCKET)
            .upload(path, payload.file, {
              upsert: true,
              contentType: payload.file.type || undefined,
            });
          if (error) throw error;
          storagePath = path;
        } catch (err) {
          console.warn('[useSlideSubmissions] Screenshot upload failed.', err);
        }
      }

      // Optimistic local update — read from and write to the ref so
      // rapid consecutive submits don't each see a stale closure.
      const priorMap = submissionsRef.current;
      const prior = priorMap.get(slideId);
      const optimistic: SlideSubmission = {
        slideId,
        answerText: textValue ?? prior?.answerText ?? null,
        screenshotUrl: storagePath ?? prior?.screenshotUrl ?? null,
        submittedAt: now,
      };
      const nextMap = new Map(priorMap);
      nextMap.set(slideId, optimistic);
      submissionsRef.current = nextMap;
      setSubmissions(nextMap);

      // Roll up to the section tick when every slide in the section is done.
      const sectionSlides = getSlidesForSection(slide.sectionId);
      const sectionComplete = sectionSlides.every((s) => nextMap.has(s.slideId));
      if (sectionComplete) completeItem(slide.sectionId);

      if (!user) return;

      // Fire-and-forget upsert. Keep optimistic state on failure.
      try {
        const { error } = await supabase
          .from('user_slide_submissions')
          .upsert(
            {
              user_id: user.id,
              slide_id: slideId,
              answer_text: optimistic.answerText,
              screenshot_url: optimistic.screenshotUrl,
              submitted_at: now,
            },
            { onConflict: 'user_id,slide_id' },
          );
        if (error) throw error;
      } catch (err) {
        console.warn('[useSlideSubmissions] Supabase upsert failed — optimistic state retained.', err);
      }
    },
    [user, completeItem, submissions],
  );

  const isSubmitted = useCallback((slideId: string) => submissions.has(slideId), [submissions]);

  const getScreenshotSignedUrl = useCallback(async (path: string) => {
    if (!path) return null;
    try {
      const { data, error } = await supabase.storage
        .from(SCREENSHOT_BUCKET)
        .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
      if (error) throw error;
      return data?.signedUrl ?? null;
    } catch (err) {
      console.warn('[useSlideSubmissions] Signed-URL generation failed.', err);
      return null;
    }
  }, []);

  const value = useMemo(
    () => ({ submissions, hasHydrated, isSubmitted, submitSlide, getScreenshotSignedUrl }),
    [submissions, hasHydrated, isSubmitted, submitSlide, getScreenshotSignedUrl],
  );

  return (
    <SlideSubmissionsContext.Provider value={value}>{children}</SlideSubmissionsContext.Provider>
  );
}

export const useSlideSubmissions = () => {
  const context = useContext(SlideSubmissionsContext);
  if (!context) {
    throw new Error('useSlideSubmissions must be used within a SlideSubmissionsProvider');
  }
  return context;
};

// Re-export the slide list so consumers that only care about the schema can
// import from a single place alongside the hook.
export { GET_READY_SLIDES } from '@/components/cmfas/workspace-views/getReadySlideContent';
export type { ReadyStepId };
