import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Loader2,
  Lock,
  Target,
  Trophy,
  Upload,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useChecklistProgress } from '@/hooks/useChecklistProgress';
import { useSlideSubmissions } from '@/hooks/useSlideSubmissions';
import { cmfasRoom } from '../cmfasTheme';
import type { WorkspaceMode } from '../CMFASWorkspaceNav';
import { GET_READY_STEPS } from './getReadyData';
import {
  GET_READY_SLIDES,
  getSlideById,
  getSlidesForSection,
  type GetReadyLinkResource,
  type SlideEntry,
  type VerificationField,
} from './getReadySlideContent';

const DESK_SLIDE_PARAM = 'deskSlide';
const SLIDE_COUNT = GET_READY_SLIDES.length;
const DESK_SLIDE_STORAGE_PREFIX = 'cmfas-desk-slide';

function parseSlideIndex(raw: string | null): number {
  if (raw == null) return 0;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n)) return 0;
  return Math.min(Math.max(0, n), SLIDE_COUNT - 1);
}

/** Can jump to slide k given progress: same or earlier always allowed; later requires every prior slide to be "done". */
function canAccessSlideIndex(
  k: number,
  currentIndex: number,
  isDone: (slideId: string) => boolean,
): boolean {
  if (k === currentIndex) return true;
  if (k < currentIndex) return true;
  for (let j = 0; j < k; j++) {
    if (!isDone(GET_READY_SLIDES[j].slideId)) return false;
  }
  return true;
}

/** In-app `Link` for paths like `/cmfas-exams?mode=practice`; not `//` or `mailto:`. */
function isInternalAppPath(href: string) {
  return href.startsWith('/') && !href.startsWith('//');
}

function parseInlineLinks(
  text: string,
): Array<{ kind: 'text'; value: string } | { kind: 'link'; value: string; href: string }> {
  const out: Array<{ kind: 'text'; value: string } | { kind: 'link'; value: string; href: string }> = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      out.push({ kind: 'text', value: text.slice(lastIndex, match.index) });
    }
    out.push({ kind: 'link', value: match[1], href: match[2] });
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    out.push({ kind: 'text', value: text.slice(lastIndex) });
  }
  return out;
}

function InlineRichText({ text, className }: { text: string; className?: string }) {
  const parts = parseInlineLinks(text);
  if (parts.length === 1 && parts[0].kind === 'text') {
    return <>{text}</>;
  }
  return (
    <span className={className}>
      {parts.map((part, i) => {
        if (part.kind === 'text') return <span key={i}>{part.value}</span>;
        const external = /^https?:\/\//i.test(part.href);
        const linkClass =
          'font-semibold text-primary underline decoration-primary/40 underline-offset-[3px] transition-colors hover:text-primary hover:decoration-primary/80';
        if (external) {
          return (
            <a
              key={i}
              href={part.href}
              target="_blank"
              rel="noopener noreferrer"
              className={linkClass}
            >
              {part.value}
            </a>
          );
        }
        return (
          <Link key={i} to={part.href} className={linkClass}>
            {part.value}
          </Link>
        );
      })}
    </span>
  );
}

function GetReadyResourceLink({ item }: { item: GetReadyLinkResource }) {
  const className = cn(
    'flex w-full items-center justify-between gap-2 rounded-md border border-primary/20 px-3 py-2 text-left text-xs font-medium',
    'text-foreground transition-colors hover:border-primary/40 hover:bg-primary/8',
  );
  if (isInternalAppPath(item.href)) {
    return (
      <Link to={item.href} className={className}>
        <span className="min-w-0 flex-1 leading-snug">{item.label}</span>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
      </Link>
    );
  }
  const openInNewTab =
    item.href.startsWith('http://') || item.href.startsWith('https://') || item.href.startsWith('//');
  return (
    <a
      href={item.href}
      className={className}
      {...(openInNewTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <span className="min-w-0 flex-1 leading-snug">{item.label}</span>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-80" aria-hidden />
    </a>
  );
}

// ────────────────────────────────────────────────────────────────────────────
//                          Verification form
// ────────────────────────────────────────────────────────────────────────────
// One slide has one verification field (for now). Encoding to the submissions
// row:
//  - checkbox → answer_text = 'confirmed' when checked, null otherwise
//  - text     → answer_text = trimmed input
//  - screenshot → screenshot_url = storage path; answer_text may be null
// Re-submission is allowed: file input re-uploads; text/checkbox overwrites.

interface VerificationState {
  checked: boolean;
  text: string;
  file: File | null;
  existingScreenshot: string | null;
}

function initialStateFor(field: VerificationField | undefined): VerificationState {
  void field;
  return { checked: false, text: '', file: null, existingScreenshot: null };
}

function hydrateFromSubmission(
  field: VerificationField | undefined,
  submission: { answerText: string | null; screenshotUrl: string | null } | undefined,
): VerificationState {
  const base = initialStateFor(field);
  if (!submission || !field) return base;
  if (field.kind === 'checkbox') {
    return { ...base, checked: submission.answerText === 'confirmed' };
  }
  if (field.kind === 'text') {
    return { ...base, text: submission.answerText ?? '' };
  }
  return { ...base, existingScreenshot: submission.screenshotUrl };
}

function isValid(field: VerificationField | undefined, state: VerificationState): boolean {
  if (!field) return true;
  if (field.optional) return true;
  if (field.kind === 'checkbox') return state.checked;
  if (field.kind === 'text') return state.text.trim().length > 0;
  return state.file !== null || state.existingScreenshot !== null;
}

function ScreenshotPicker({
  field,
  state,
  onChange,
  getSignedUrl,
}: {
  field: VerificationField & { kind: 'screenshot' };
  state: VerificationState;
  onChange: (next: Partial<VerificationState>) => void;
  getSignedUrl: (path: string) => Promise<string | null>;
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Build preview URL: local File via object URL, or fetch signed URL for existing path.
  useEffect(() => {
    let revoked: string | null = null;
    if (state.file) {
      const url = URL.createObjectURL(state.file);
      revoked = url;
      setPreviewUrl(url);
      return () => {
        if (revoked) URL.revokeObjectURL(revoked);
      };
    }
    if (state.existingScreenshot) {
      let cancelled = false;
      void getSignedUrl(state.existingScreenshot).then((url) => {
        if (!cancelled) setPreviewUrl(url);
      });
      return () => {
        cancelled = true;
      };
    }
    setPreviewUrl(null);
  }, [state.file, state.existingScreenshot, getSignedUrl]);

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      // 5 MB cap.
      alert('Screenshot must be 5 MB or smaller.');
      return;
    }
    onChange({ file });
  };

  return (
    <div className="space-y-2">
      <label className={cn('block text-xs font-semibold', cmfasRoom.text)}>
        {field.label}
        {field.hint && (
          <span className={cn('mt-0.5 block text-[10px] font-normal', cmfasRoom.textFaint)}>{field.hint}</span>
        )}
      </label>
      {previewUrl ? (
        <div className="relative overflow-hidden rounded-md border border-primary/25 bg-background/40">
          <img src={previewUrl} alt="Screenshot preview" className="block h-auto w-full" />
          <button
            type="button"
            onClick={() => {
              onChange({ file: null, existingScreenshot: null });
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-background/85 text-foreground hover:bg-background"
            aria-label="Remove screenshot"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-1.5 rounded-md border border-dashed px-3 py-6 text-xs',
            'border-primary/40 text-muted-foreground hover:border-primary hover:bg-primary/5',
          )}
        >
          <Upload className="h-4 w-4" aria-hidden />
          <span className="font-semibold">Upload screenshot</span>
          <span className="text-[10px] opacity-70">PNG, JPEG, WebP · max 5 MB</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
    </div>
  );
}

function VerificationAside({
  slide,
  state,
  onChange,
  getSignedUrl,
}: {
  slide: SlideEntry;
  state: VerificationState;
  onChange: (next: Partial<VerificationState>) => void;
  getSignedUrl: (path: string) => Promise<string | null>;
}) {
  const field = slide.verification[0];
  if (!field) return null;

  if (field.kind === 'checkbox') {
    return (
      <label className="flex cursor-pointer items-start gap-2 rounded-md border border-primary/20 bg-background/30 px-3 py-2.5">
        <Checkbox
          checked={state.checked}
          onCheckedChange={(v) => onChange({ checked: v === true })}
          className="mt-0.5"
        />
        <span className={cn('text-xs leading-snug', cmfasRoom.text)}>{field.label}</span>
      </label>
    );
  }

  if (field.kind === 'text') {
    return (
      <div className="space-y-1.5">
        <label className={cn('block text-xs font-semibold', cmfasRoom.text)}>{field.label}</label>
        <Input
          value={state.text}
          maxLength={field.maxLength}
          placeholder={field.placeholder}
          onChange={(e) => onChange({ text: e.target.value })}
          className={cn('border-primary/30 bg-background/40 text-sm', cmfasRoom.text)}
        />
      </div>
    );
  }

  return <ScreenshotPicker field={field} state={state} onChange={onChange} getSignedUrl={getSignedUrl} />;
}

function buildSubmitPayload(field: VerificationField | undefined, state: VerificationState) {
  if (!field) return {};
  if (field.kind === 'checkbox') return { text: state.checked ? 'confirmed' : '' };
  if (field.kind === 'text') return { text: state.text.trim() };
  return { file: state.file ?? undefined };
}

// ────────────────────────────────────────────────────────────────────────────
//                          Main component
// ────────────────────────────────────────────────────────────────────────────

export function StudyDeskStepFlow({
  onSelectWorkspaceMode,
  roomEyebrow,
  roomTitle,
}: {
  onSelectWorkspaceMode: (mode: WorkspaceMode) => void;
  roomEyebrow: string;
  roomTitle: string;
}) {
  const { user } = useAuth();
  const { isItemCompleted } = useChecklistProgress();
  const { submissions, hasHydrated, isSubmitted, submitSlide, getScreenshotSignedUrl } =
    useSlideSubmissions();
  const [searchParams, setSearchParams] = useSearchParams();
  const deskSlideStorageKey = `${DESK_SLIDE_STORAGE_PREFIX}:${user?.id ?? 'anon'}`;

  /** A slide is "effectively done" when EITHER its sub-slide submission exists
   *  OR its parent section is already ticked in `user_checklist_progress` (the
   *  latter covers users who completed the Study Desk before atomic sub-slides
   *  existed, and the pre-migration window where `user_slide_submissions` isn't
   *  live yet). Used everywhere nav/display cares about "has the learner moved
   *  past this slide". Form hydration keeps strict `isSubmitted` so we never
   *  pre-fill fake data. */
  const isSlideDone = useCallback(
    (slideId: string): boolean => {
      if (isSubmitted(slideId)) return true;
      const s = getSlideById(slideId);
      return s ? isItemCompleted(s.sectionId) : false;
    },
    [isSubmitted, isItemCompleted],
  );

  const slideIndex = useMemo(
    () => parseSlideIndex(searchParams.get(DESK_SLIDE_PARAM)),
    [searchParams],
  );
  const slide = GET_READY_SLIDES[slideIndex];
  const section = useMemo(
    () => GET_READY_STEPS.find((s) => s.id === slide.sectionId),
    [slide.sectionId],
  );
  const sectionSlides = useMemo(() => getSlidesForSection(slide.sectionId), [slide.sectionId]);
  const linkResources = slide.linkResources ?? [];
  const submission = submissions.get(slide.slideId);
  const done = isSlideDone(slide.slideId);
  const isLast = slideIndex === SLIDE_COUNT - 1;

  const canGoToNextSlide =
    done && !isLast && canAccessSlideIndex(slideIndex + 1, slideIndex, isSlideDone);

  // Verification form state — reset on slide change, pre-fill from existing submission.
  const [vState, setVState] = useState<VerificationState>(() =>
    hydrateFromSubmission(slide.verification[0], submission),
  );
  useEffect(() => {
    setVState(hydrateFromSubmission(slide.verification[0], submission));
    // Intentionally depend on slideId only — we want this fresh only when the
    // slide changes, not on every submissions map update (which would clobber
    // unsaved edits).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide.slideId]);
  const [submitting, setSubmitting] = useState(false);

  const vField = slide.verification[0];
  const formValid = isValid(vField, vState);

  /** Landing effect: waits until submissions have hydrated from Supabase, then
   *  either (a) sets the URL to the first-incomplete slide if it's missing, or
   *  (b) bumps the URL FORWARD if the learner is parked on a slide they've
   *  already finished (covers first-render-with-stale-hooks, pre-refactor users
   *  whose section ticks land only after first mount, and across-browser resume).
   *  Never bumps BACKWARD — user navigating manually to a later section is fine. */
  useEffect(() => {
    if (!hasHydrated) return;
    const firstIncomplete = GET_READY_SLIDES.findIndex((s) => !isSlideDone(s.slideId));
    const target = firstIncomplete === -1 ? SLIDE_COUNT - 1 : firstIncomplete;
    const currentParam = searchParams.get(DESK_SLIDE_PARAM);

    if (currentParam == null) {
      const persistedRaw = localStorage.getItem(deskSlideStorageKey);
      const persistedIndex =
        persistedRaw == null ? null : parseSlideIndex(persistedRaw);
      const initialIndex = persistedIndex ?? target;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(DESK_SLIDE_PARAM, String(initialIndex));
          return next;
        },
        { replace: true },
      );
      return;
    }

    const currentIndex = parseSlideIndex(currentParam);
    const currentSlideId = GET_READY_SLIDES[currentIndex]?.slideId;
    if (currentIndex < target && currentSlideId && isSlideDone(currentSlideId)) {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(DESK_SLIDE_PARAM, String(target));
          return next;
        },
        { replace: true },
      );
    }
  }, [deskSlideStorageKey, hasHydrated, searchParams, isSlideDone, setSearchParams]);

  useEffect(() => {
    localStorage.setItem(deskSlideStorageKey, String(slideIndex));
  }, [deskSlideStorageKey, slideIndex]);

  const goToIndex = useCallback(
    (k: number) => {
      if (!canAccessSlideIndex(k, slideIndex, isSlideDone)) return;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(DESK_SLIDE_PARAM, String(k));
          return next;
        },
        { replace: true },
      );
    },
    [isSlideDone, setSearchParams, slideIndex],
  );

  const handleSubmitAndAdvance = useCallback(async () => {
    if (!formValid || submitting) return;
    setSubmitting(true);
    try {
      await submitSlide(slide.slideId, buildSubmitPayload(vField, vState));
    } finally {
      setSubmitting(false);
    }
    if (isLast) {
      onSelectWorkspaceMode('papers');
      return;
    }
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(DESK_SLIDE_PARAM, String(slideIndex + 1));
        return next;
      },
      { replace: true },
    );
  }, [
    formValid,
    submitting,
    submitSlide,
    slide.slideId,
    vField,
    vState,
    isLast,
    onSelectWorkspaceMode,
    setSearchParams,
    slideIndex,
  ]);

  return (
    <div className={cn('flex w-full min-h-0 flex-col gap-3', 'lg:min-h-0 lg:flex-1')}>
      {/* Top nav — section tabs + sub-slide dots */}
      <div className="flex w-full min-w-0 flex-col gap-3">
        <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="min-w-0 shrink">
            <p className={cn('text-[10px] font-semibold uppercase tracking-[0.2em]', cmfasRoom.brassText)}>
              {roomEyebrow}
            </p>
            <p className={cn('mt-0.5 font-serif text-base font-bold leading-tight sm:text-lg', cmfasRoom.text)}>
              {roomTitle}
            </p>
          </div>
          <ol
            className="flex min-h-[36px] min-w-0 flex-1 flex-wrap items-center sm:justify-end gap-2"
            aria-label="Study-desk sections"
          >
            {GET_READY_STEPS.map((sectionStep, sectionIdx) => {
              const complete = isItemCompleted(sectionStep.id);
              const current = sectionStep.id === slide.sectionId;
              const firstSlideOfSection = GET_READY_SLIDES.findIndex(
                (s) => s.sectionId === sectionStep.id,
              );
              const firstIncompleteSlideOfSection = GET_READY_SLIDES.findIndex(
                (s) => s.sectionId === sectionStep.id && !isSlideDone(s.slideId),
              );
              const targetIdx =
                firstIncompleteSlideOfSection === -1
                  ? firstSlideOfSection
                  : firstIncompleteSlideOfSection;
              const reachable = canAccessSlideIndex(targetIdx, slideIndex, isSlideDone);
              return (
                <li key={sectionStep.id} className="flex items-center gap-2">
                  {sectionIdx > 0 && <span className="text-primary/25" aria-hidden>·</span>}
                  <button
                    type="button"
                    onClick={() => reachable && goToIndex(targetIdx)}
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold tabular-nums transition-colors',
                      current && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
                      complete && cmfasRoom.positiveText,
                      !complete &&
                        !current &&
                        reachable &&
                        cn('border border-primary/30', cmfasRoom.textMuted, 'hover:bg-primary/10'),
                      !reachable && 'cursor-not-allowed border border-dashed border-muted-foreground/25 text-muted-foreground/50',
                    )}
                    title={!reachable ? 'Complete the earlier sections first' : sectionStep.title}
                  >
                    {!reachable ? (
                      <Lock className="h-3.5 w-3.5" aria-hidden />
                    ) : complete ? (
                      <CheckCircle2 className="h-5 w-5" aria-hidden />
                    ) : (
                      <span>{sectionIdx + 1}</span>
                    )}
                    <span className="sr-only">
                      {sectionIdx + 1}. {sectionStep.title} {complete ? 'completed' : ''}{' '}
                      {current ? 'current' : ''}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Sub-slide dots — shown only when the current section has >1 slide */}
        {sectionSlides.length > 1 && (
          <div className="flex min-h-[24px] items-center gap-3 rounded-md border border-primary/15 bg-background/30 px-3 py-1.5">
            <span className={cn('text-[10px] font-bold uppercase tracking-[0.2em]', cmfasRoom.brassText)}>
              {slide.section} · Slide {slide.indexWithinSection} of {slide.totalInSection}
            </span>
            <ol className="flex flex-wrap items-center gap-1.5" aria-label="Sub-slide progress">
              {sectionSlides.map((sub) => {
                const subIdx = GET_READY_SLIDES.findIndex((s) => s.slideId === sub.slideId);
                const subDone = isSlideDone(sub.slideId);
                const subCurrent = sub.slideId === slide.slideId;
                const subReachable = canAccessSlideIndex(subIdx, slideIndex, isSlideDone);
                return (
                  <li key={sub.slideId}>
                    <button
                      type="button"
                      onClick={() => subReachable && goToIndex(subIdx)}
                      aria-current={subCurrent ? 'step' : undefined}
                      aria-label={`${sub.slideHeading} ${subDone ? '(done)' : subCurrent ? '(current)' : ''}`}
                      className={cn(
                        'flex h-5 items-center justify-center rounded-full transition-all',
                        subCurrent ? 'w-6 px-0' : 'w-2.5',
                        subDone && !subCurrent && 'bg-emerald-500',
                        !subDone && !subCurrent && subReachable && 'bg-primary/35 hover:bg-primary/55',
                        !subReachable && 'cursor-not-allowed bg-muted-foreground/15',
                        subCurrent && 'bg-primary',
                      )}
                      title={sub.slideHeading}
                      disabled={!subReachable}
                    >
                      {subDone && !subCurrent ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-background" aria-hidden />
                      ) : subCurrent ? (
                        <span className="text-[10px] font-bold text-background">
                          {sub.indexWithinSection}
                        </span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>

      {/* Slide card */}
      <div
        id="study-desk-slides"
        className={cn(
          'flex min-h-[min(72vh,760px)] max-h-[calc(100vh-14rem)] flex-col overflow-hidden rounded-2xl border-2 shadow-2xl',
          'lg:min-h-0 lg:max-h-none lg:flex-1',
          cmfasRoom.brassBorderSoft,
          'bg-card',
          'shadow-md',
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col sm:flex-row lg:min-h-0">
          <div
            className={cn(
              'flex min-h-0 flex-1 flex-col border-b sm:border-b-0 sm:border-r',
              'border-primary/20',
            )}
          >
            <div className="shrink-0 border-b border-primary/15 px-5 py-4 sm:px-7 sm:py-5">
              <div className="flex flex-wrap items-center gap-2">
                <p className={cn('text-[10px] font-semibold uppercase tracking-[0.2em]', cmfasRoom.brassText)}>
                  {slide.section}
                </p>
                {slide.eyebrow && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tabular-nums',
                      'border-primary/40 bg-primary/10 text-primary',
                    )}
                  >
                    {slide.eyebrow}
                  </span>
                )}
              </div>
              <h2
                className={cn(
                  'mt-2 font-serif text-xl font-bold leading-tight tracking-tight sm:text-2xl lg:text-3xl',
                  cmfasRoom.text,
                )}
              >
                {slide.slideHeading}
              </h2>
              {section && (
                <p className={cn('mt-2 text-sm', cmfasRoom.textMuted)}>{section.outcome}</p>
              )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-7">
              <div className="space-y-5">
                {slide.blocks && slide.blocks.length > 0
                  ? slide.blocks.map((block, idx) => {
                      if (block.kind === 'intro') {
                        return (
                          <p
                            key={idx}
                            className={cn('text-base leading-[1.65] sm:text-lg', cmfasRoom.text)}
                          >
                            <InlineRichText text={block.text} />
                          </p>
                        );
                      }
                      if (block.kind === 'heading') {
                        return (
                          <h3
                            key={idx}
                            className={cn(
                              'pt-3 font-serif text-xl font-bold leading-tight tracking-tight sm:text-2xl',
                              cmfasRoom.brassText,
                            )}
                          >
                            {block.text}
                          </h3>
                        );
                      }
                      if (block.kind === 'partDivider') {
                        return (
                          <div key={idx} className="space-y-4">
                            <div className="mt-8 h-px w-full bg-primary/30" aria-hidden />
                            <section
                              className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-5 scroll-mt-4 sm:p-6"
                              aria-label={`${block.eyebrow ?? `Part ${block.partIndex} of ${block.partTotal}`} · ${block.title}`}
                            >
                              <p
                                className={cn(
                                  'text-[10px] font-bold uppercase tracking-[0.25em]',
                                  'text-primary',
                                )}
                              >
                                {block.eyebrow ?? `Part ${block.partIndex} of ${block.partTotal}`}
                              </p>
                              <h2
                                className={cn(
                                  'mt-1 font-serif text-2xl font-bold leading-tight tracking-tight sm:text-3xl',
                                  cmfasRoom.text,
                                )}
                              >
                                {block.title}
                              </h2>
                            </section>
                          </div>
                        );
                      }
                      if (block.kind === 'paragraph') {
                        return (
                          <p
                            key={idx}
                            className={cn('text-base leading-[1.65] sm:text-lg', cmfasRoom.text)}
                          >
                            <InlineRichText text={block.text} />
                          </p>
                        );
                      }
                      if (block.kind === 'list') {
                        return (
                          <ul
                            key={idx}
                            className={cn(
                              'list-disc space-y-1.5 pl-6 text-base leading-[1.65] marker:text-primary sm:text-lg',
                              cmfasRoom.text,
                            )}
                          >
                            {block.items.map((item, i) => (
                              <li key={i}>
                                <InlineRichText text={item} />
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      if (block.kind === 'image') {
                        return (
                          <figure
                            key={idx}
                            className="overflow-hidden rounded-lg border border-primary/25 bg-background/40"
                          >
                            <a
                              href={block.src}
                              target="_blank"
                              rel="noopener noreferrer"
                              aria-label={`Open ${block.alt} full size`}
                            >
                              <img
                                src={block.src}
                                alt={block.alt}
                                loading="lazy"
                                className="block h-auto w-full"
                              />
                            </a>
                            {block.caption && (
                              <figcaption
                                className={cn(
                                  'border-t border-primary/20 px-3 py-2 text-xs',
                                  cmfasRoom.textMuted,
                                )}
                              >
                                {block.caption}
                              </figcaption>
                            )}
                          </figure>
                        );
                      }
                      if (block.kind === 'loom') {
                        return (
                          <div
                            key={idx}
                            className="relative w-full overflow-hidden rounded-lg border border-primary/25 bg-black"
                            style={{ aspectRatio: '16 / 9' }}
                          >
                            <iframe
                              src={`https://www.loom.com/embed/${block.videoId}`}
                              title={block.title ?? 'Loom walkthrough'}
                              allow="fullscreen"
                              allowFullScreen
                              className="absolute inset-0 h-full w-full"
                            />
                          </div>
                        );
                      }
                      if (block.kind === 'rewardCard') {
                        const IconCmp =
                          block.icon === 'zap' ? Zap
                          : block.icon === 'trophy' ? Trophy
                          : block.icon === 'users' ? Users
                          : block.icon === 'target' ? Target
                          : Award;
                        return (
                          <section
                            key={idx}
                            className={cn(
                              'relative overflow-hidden rounded-2xl border-2 p-5 sm:p-6',
                              'border-primary/35 bg-primary/5',
                              'shadow-sm',
                            )}
                            aria-label={block.title}
                          >
                            {/* Decorative brass glow behind the icon */}
                            <div
                              className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
                              aria-hidden
                            />
                            <div className="relative flex items-start gap-4">
                              <div
                                className={cn(
                                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border',
                                  'border-primary/45 bg-primary/15 text-primary',
                                )}
                              >
                                <IconCmp className="h-6 w-6" aria-hidden />
                              </div>
                              <div className="min-w-0 flex-1">
                                {block.eyebrow && (
                                  <p
                                    className={cn(
                                      'text-[10px] font-bold uppercase tracking-[0.2em]',
                                      cmfasRoom.brassText,
                                    )}
                                  >
                                    {block.eyebrow}
                                  </p>
                                )}
                                <h3
                                  className={cn(
                                    'mt-1 font-serif text-xl font-bold leading-tight tracking-tight sm:text-2xl',
                                    cmfasRoom.text,
                                  )}
                                >
                                  {block.title}
                                </h3>
                                {block.tagline && (
                                  <p className={cn('mt-2 text-sm leading-snug', cmfasRoom.textMuted)}>
                                    {block.tagline}
                                  </p>
                                )}
                              </div>
                              {block.headlineAmount && (
                                <div className="shrink-0 text-right">
                                  <p
                                    className={cn(
                                      'font-serif text-2xl font-extrabold leading-none tabular-nums sm:text-3xl',
                                      'text-primary',
                                    )}
                                  >
                                    {block.headlineAmount}
                                  </p>
                                </div>
                              )}
                            </div>
                            {block.conditions && block.conditions.length > 0 && (
                              <ul
                                className={cn(
                                  'relative mt-4 space-y-1.5 border-t border-primary/15 pt-4 text-sm leading-[1.55]',
                                  cmfasRoom.text,
                                )}
                              >
                                {block.conditions.map((c, ci) => (
                                  <li key={ci} className="flex items-start gap-2">
                                    <CheckCircle2
                                      className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                                      aria-hidden
                                    />
                                    <InlineRichText text={c} />
                                  </li>
                                ))}
                              </ul>
                            )}
                            {block.notes && block.notes.length > 0 && (
                              <ul
                                className={cn(
                                  'relative mt-3 space-y-1 text-xs leading-snug',
                                  cmfasRoom.textFaint,
                                )}
                              >
                                {block.notes.map((n, ni) => (
                                  <li key={ni}>· {n}</li>
                                ))}
                              </ul>
                            )}
                          </section>
                        );
                      }
                      if (block.kind === 'table') {
                        return (
                          <div
                            key={idx}
                            className={cn('overflow-hidden rounded-lg border', 'border-primary/25')}
                          >
                            <table className="w-full text-sm sm:text-base">
                              <thead>
                                <tr className="bg-primary/10">
                                  {block.headers.map((h, i) => (
                                    <th
                                      key={i}
                                      className={cn(
                                        'px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.15em]',
                                        cmfasRoom.brassText,
                                      )}
                                    >
                                      {h}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {block.rows.map((row, ri) => (
                                  <tr
                                    key={ri}
                                    className={cn(ri > 0 && 'border-t border-primary/15')}
                                  >
                                    {row.map((cell, ci) => (
                                      <td
                                        key={ci}
                                        className={cn(
                                          'px-4 py-2.5 tabular-nums',
                                          ci === 0
                                            ? cn('font-semibold', cmfasRoom.text)
                                            : cmfasRoom.textMuted,
                                        )}
                                      >
                                        {cell}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        );
                      }
                      return null;
                    })
                  : slide.paragraphs?.map((para, idx) => (
                      <p
                        key={idx}
                        className={cn('text-base leading-[1.65] sm:text-lg', cmfasRoom.text)}
                      >
                        {para}
                      </p>
                    ))}

                {slide.pathStages && slide.pathStages.length > 0 && (
                  <div className={cn('mt-2 space-y-8 border-t border-primary/20 pt-8', cmfasRoom.text)}>
                    {slide.pathStages.map((stage) => (
                      <section key={stage.title} className="space-y-2">
                        <h3
                          className={cn(
                            'font-serif text-xl font-bold leading-tight tracking-tight sm:text-2xl',
                            cmfasRoom.brassText,
                          )}
                        >
                          {stage.title}
                        </h3>
                        <p className={cn('text-sm font-medium', cmfasRoom.textMuted)}>{stage.tagline}</p>
                        <ul
                          className={cn(
                            'list-disc space-y-1.5 pl-6 text-base leading-[1.65] marker:text-primary sm:text-lg',
                            cmfasRoom.text,
                          )}
                        >
                          {stage.bullets.map((b) => (
                            <li key={b}>{b}</li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                )}

                {slide.closingParagraphs?.map((para, idx) => (
                  <p
                    key={`close-${idx}`}
                    className={cn(
                      'text-base leading-[1.65] sm:text-lg',
                      para.startsWith('NEXT STEPS')
                        ? cn('mt-4 font-serif text-sm font-bold uppercase tracking-[0.2em]', cmfasRoom.textFaint)
                        : cmfasRoom.text,
                    )}
                  >
                    {para}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <aside
            className={cn(
              'flex w-full shrink-0 flex-col justify-between border-t border-primary/15 sm:w-72 sm:border-l sm:border-t-0 lg:w-80',
              'bg-background/40',
            )}
          >
            <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
              {/* Verification form */}
              {vField && (
                <div className="space-y-2">
                  <h4
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-[0.15em]',
                      cmfasRoom.brassText,
                    )}
                  >
                    Confirm you did this
                  </h4>
                  <VerificationAside
                    slide={slide}
                    state={vState}
                    onChange={(patch) => setVState((prev) => ({ ...prev, ...patch }))}
                    getSignedUrl={getScreenshotSignedUrl}
                  />
                </div>
              )}

              {/* Links & resources (collapsible) */}
              {linkResources.length > 0 && (
                <details className="group pt-1 [&::-webkit-details-marker]:hidden">
                  <summary
                    className={cn(
                      'mb-2 flex cursor-pointer list-none items-center justify-between gap-2 rounded-md',
                      '[&::-webkit-details-marker]:hidden',
                      'hover:text-foreground',
                      cmfasRoom.textFaint,
                    )}
                  >
                    <h4 className="text-[10px] font-bold uppercase tracking-[0.15em]">Links &amp; resources</h4>
                    <ChevronRight
                      className="h-3.5 w-3.5 shrink-0 transition-transform group-open:rotate-90"
                      aria-hidden
                    />
                  </summary>
                  <ul className="space-y-1.5">
                    {linkResources.map((item) => (
                      <li key={`${item.href}-${item.label}`}>
                        <GetReadyResourceLink item={item} />
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>

            <div className="mt-auto space-y-2 border-t border-primary/10 px-4 py-3 sm:px-5">
              {!done && slideIndex > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => goToIndex(slideIndex - 1)}
                  className={cn('h-9 w-full justify-center gap-2', cmfasRoom.textMuted)}
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  Previous slide
                </Button>
              )}
              {!done && (
                <Button
                  type="button"
                  disabled={!formValid || submitting}
                  className={cn(
                    'w-full gap-2 font-semibold',
                    'bg-primary text-background hover:bg-primary disabled:opacity-55',
                  )}
                  onClick={handleSubmitAndAdvance}
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
                  {isLast
                    ? vField
                      ? 'Submit & go to exam tutorials'
                      : 'Mark as done & go to exam tutorials'
                    : vField
                      ? 'Submit & next slide'
                      : 'Mark as done & next slide'}
                </Button>
              )}
              {done && canGoToNextSlide && (
                <div className="flex gap-2">
                  {slideIndex > 0 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => goToIndex(slideIndex - 1)}
                      className={cn('h-9 min-w-0 flex-1 justify-center gap-1.5 px-2', cmfasRoom.textMuted)}
                    >
                      <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="truncate">Back</span>
                    </Button>
                  )}
                  <Button
                    type="button"
                    className={cn(
                      'h-9 min-w-0 gap-1.5 font-semibold',
                      'bg-primary text-background hover:bg-primary',
                      slideIndex > 0 ? 'flex-1' : 'w-full',
                    )}
                    onClick={() => goToIndex(slideIndex + 1)}
                  >
                    <span className="min-w-0 truncate">Next slide</span>
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                  </Button>
                </div>
              )}
              {done && isLast && slideIndex > 0 && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => goToIndex(slideIndex - 1)}
                    className={cn('h-9 min-w-0 flex-1 justify-center gap-1.5 px-2', cmfasRoom.textMuted)}
                  >
                    <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="truncate">Back</span>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className={cn(
                      'h-9 min-w-0 flex-1 border border-primary/35',
                      'bg-background/60 text-foreground hover:bg-primary/15',
                    )}
                    onClick={() => onSelectWorkspaceMode('papers')}
                  >
                    <span className="min-w-0 truncate">Exam tutorials</span>
                  </Button>
                </div>
              )}
              {done && (
                <p
                  className={cn(
                    'flex min-h-9 w-full items-center justify-center gap-2 rounded-md border border-primary/20 bg-background/50 px-3 py-2 text-center text-xs font-semibold',
                    cmfasRoom.positiveText,
                  )}
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                  Submitted · resubmit any time
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
