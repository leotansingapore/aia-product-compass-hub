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
  isSubmitted: (slideId: string) => boolean;
  submitSlide: (slideId: string, payload: SubmitSlidePayload) => Promise<void>;
  getScreenshotSignedUrl: (path: string) => Promise<string | null>;
}

const SCREENSHOT_BUCKET = 'checklist-screenshots';
const SIGNED_URL_TTL_SECONDS = 60 * 60;

const SlideSubmissionsContext = createContext<SlideSubmissionsContextType>({
  submissions: new Map(),
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
  const hydrationRanForUser = useRef<string | null>(null);

  useEffect(() => {
    if (!user) {
      setSubmissions(new Map());
      hydrationRanForUser.current = null;
      return;
    }
    if (hydrationRanForUser.current === user.id) return;
    hydrationRanForUser.current = user.id;

    let cancelled = false;

    (async () => {
      try {
        const { data, error } = await supabase
          .from('user_slide_submissions' as never)
          .select('slide_id, answer_text, screenshot_url, submitted_at')
          .eq('user_id', user.id);
        if (error) throw error;
        if (cancelled) return;

        const rows = (data as Array<{
          slide_id: string;
          answer_text: string | null;
          screenshot_url: string | null;
          submitted_at: string;
        }> | null) ?? [];

        const next = new Map<string, SlideSubmission>();
        for (const row of rows) {
          next.set(row.slide_id, {
            slideId: row.slide_id,
            answerText: row.answer_text,
            screenshotUrl: row.screenshot_url,
            submittedAt: row.submitted_at,
          });
        }
        setSubmissions(next);
      } catch (err) {
        console.warn(
          '[useSlideSubmissions] Supabase read failed, starting with empty in-memory state.',
          err,
        );
      }
    })();

    return () => {
      cancelled = true;
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

      // Optimistic local update — consumers re-render immediately.
      const prior = submissions.get(slideId);
      const optimistic: SlideSubmission = {
        slideId,
        answerText: textValue ?? prior?.answerText ?? null,
        screenshotUrl: storagePath ?? prior?.screenshotUrl ?? null,
        submittedAt: now,
      };
      const nextMap = new Map(submissions);
      nextMap.set(slideId, optimistic);
      setSubmissions(nextMap);

      // Roll up to the section tick when every slide in the section is done.
      const sectionSlides = getSlidesForSection(slide.sectionId);
      const sectionComplete = sectionSlides.every((s) => nextMap.has(s.slideId));
      if (sectionComplete) completeItem(slide.sectionId);

      if (!user) return;

      // Fire-and-forget upsert. Keep optimistic state on failure.
      try {
        const { error } = await supabase
          .from('user_slide_submissions' as never)
          .upsert(
            {
              user_id: user.id,
              slide_id: slideId,
              answer_text: optimistic.answerText,
              screenshot_url: optimistic.screenshotUrl,
              submitted_at: now,
            } as never,
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
    () => ({ submissions, isSubmitted, submitSlide, getScreenshotSignedUrl }),
    [submissions, isSubmitted, submitSlide, getScreenshotSignedUrl],
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
