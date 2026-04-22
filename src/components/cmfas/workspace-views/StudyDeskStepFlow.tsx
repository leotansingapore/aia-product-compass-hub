import { useCallback, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, ChevronRight, ExternalLink, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useChecklistProgress } from '@/hooks/useChecklistProgress';
import { cmfasRoom } from '../cmfasTheme';
import type { WorkspaceMode } from '../CMFASWorkspaceNav';
import { GET_READY_STEPS } from './getReadyData';
import { getReadySlideContent, type GetReadyLinkResource } from './getReadySlideContent';

const DESK_STEP_PARAM = 'deskStep';
const STEP_COUNT = GET_READY_STEPS.length;

function parseStepIndex(raw: string | null): number {
  if (raw == null) return 0;
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n)) return 0;
  return Math.min(Math.max(0, n), STEP_COUNT - 1);
}

function canAccessStepIndex(
  k: number,
  stepIndex: number,
  isItemCompleted: (id: string) => boolean,
): boolean {
  if (k === stepIndex) return true;
  if (k < stepIndex) return true;
  for (let j = 0; j < k; j++) {
    if (!isItemCompleted(GET_READY_STEPS[j].id)) return false;
  }
  return true;
}

/** In-app `Link` for paths like `/cmfas-exams?mode=practice`; not `//` or `mailto:`. */
function isInternalAppPath(href: string) {
  return href.startsWith('/') && !href.startsWith('//');
}

function GetReadyResourceLink({ item }: { item: GetReadyLinkResource }) {
  const className = cn(
    'flex w-full items-center justify-between gap-2 rounded-md border border-[#b8894f]/20 px-3 py-2 text-left text-xs font-medium',
    'text-[#e8d4b8] transition-colors hover:border-[#b8894f]/40 hover:bg-[#b8894f]/8',
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

export function StudyDeskStepFlow({
  onSelectWorkspaceMode,
  roomEyebrow,
  roomTitle,
}: {
  onSelectWorkspaceMode: (mode: WorkspaceMode) => void;
  roomEyebrow: string;
  roomTitle: string;
}) {
  const { isItemCompleted, completeItem } = useChecklistProgress();
  const [searchParams, setSearchParams] = useSearchParams();

  const stepIndex = useMemo(
    () => parseStepIndex(searchParams.get(DESK_STEP_PARAM)),
    [searchParams],
  );
  const step = GET_READY_STEPS[stepIndex];
  const slide = getReadySlideContent(step.id);
  const linkResources = slide.linkResources ?? [];
  const done = isItemCompleted(step.id);
  const isLast = stepIndex === STEP_COUNT - 1;
  const canGoToNextSlide =
    done && !isLast && canAccessStepIndex(stepIndex + 1, stepIndex, isItemCompleted);
  const nextStepTitle = !isLast ? GET_READY_STEPS[stepIndex + 1]?.title : null;

  /** Section-part awareness: when multiple steps share the same `slide.section`
   *  string, show "Part X of Y" so the learner knows there's more coming. */
  const sectionPart = useMemo(() => {
    const sameSectionSteps = GET_READY_STEPS.filter(
      (s) => getReadySlideContent(s.id).section === slide.section,
    );
    if (sameSectionSteps.length <= 1) return null;
    const index = sameSectionSteps.findIndex((s) => s.id === step.id);
    return { part: index + 1, total: sameSectionSteps.length };
  }, [slide.section, step.id]);

  useEffect(() => {
    if (searchParams.get(DESK_STEP_PARAM) != null) return;
    const firstIncomplete = GET_READY_STEPS.findIndex((s) => !isItemCompleted(s.id));
    const initial = firstIncomplete === -1 ? 0 : firstIncomplete;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(DESK_STEP_PARAM, String(initial));
        return next;
      },
      { replace: true },
    );
  }, [searchParams, isItemCompleted, setSearchParams]);

  const goToIndex = useCallback(
    (k: number) => {
      if (!canAccessStepIndex(k, stepIndex, isItemCompleted)) return;
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set(DESK_STEP_PARAM, String(k));
          return next;
        },
        { replace: true },
      );
    },
    [isItemCompleted, setSearchParams, stepIndex],
  );

  /** Mark current step and immediately go to the next slide, or to exam tutorials on the last step. */
  const handleMarkDone = useCallback(() => {
    completeItem(step.id);
    if (isLast) {
      onSelectWorkspaceMode('papers');
      return;
    }
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set(DESK_STEP_PARAM, String(stepIndex + 1));
        return next;
      },
      { replace: true },
    );
  }, [completeItem, isLast, onSelectWorkspaceMode, setSearchParams, step.id, stepIndex]);

  return (
    <div
      className={cn(
        'flex w-full min-h-0 flex-col gap-3',
        'lg:min-h-0 lg:flex-1',
      )}
    >
      <div className="flex w-full min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0 shrink">
          <p className={cn('text-[10px] font-semibold uppercase tracking-[0.2em]', cmfasRoom.brassText)}>{roomEyebrow}</p>
          <p className={cn('mt-0.5 font-serif text-base font-bold leading-tight sm:text-lg', cmfasRoom.text)}>{roomTitle}</p>
        </div>
        <ol
          className="flex min-h-[36px] min-w-0 flex-1 flex-wrap items-center sm:justify-end gap-2"
          aria-label="Get ready steps"
        >
          {GET_READY_STEPS.map((s, i) => {
            const complete = isItemCompleted(s.id);
            const current = i === stepIndex;
            const reachable = canAccessStepIndex(i, stepIndex, isItemCompleted);
            return (
              <li key={s.id} className="flex items-center gap-2">
                {i > 0 && <span className="text-[#b8894f]/25" aria-hidden>·</span>}
                <button
                  type="button"
                  onClick={() => reachable && goToIndex(i)}
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold tabular-nums transition-colors',
                    current && 'ring-2 ring-[#d4a574] ring-offset-2 ring-offset-[#0a1424]',
                    complete && cmfasRoom.positiveText,
                    !complete && !current && reachable && cn('border border-[#b8894f]/30', cmfasRoom.textMuted, 'hover:bg-[#b8894f]/10'),
                    !reachable && 'cursor-not-allowed border border-dashed border-[#8b7355]/25 text-[#8b7355]/50',
                  )}
                  title={!reachable ? 'Complete the steps before this one first' : s.title}
                >
                  {!reachable ? <Lock className="h-3.5 w-3.5" aria-hidden /> : complete ? <CheckCircle2 className="h-5 w-5" aria-hidden /> : <span>{i + 1}</span>}
                  <span className="sr-only">
                    {i + 1}. {s.title} {complete ? 'completed' : ''} {current ? 'current' : ''}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>

      <div
        id="study-desk-slides"
        className={cn(
          'flex min-h-[min(72vh,760px)] max-h-[calc(100vh-14rem)] flex-col overflow-hidden rounded-2xl border-2 shadow-2xl',
          'lg:min-h-0 lg:max-h-none lg:flex-1',
          cmfasRoom.brassBorderSoft,
          'bg-gradient-to-b from-[#131c32] via-[#101a30] to-[#0c1528]',
          'shadow-[0_12px_48px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(212,165,116,0.12)]',
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col sm:flex-row lg:min-h-0">
          <div
            className={cn(
              'flex min-h-0 flex-1 flex-col border-b sm:border-b-0 sm:border-r',
              'border-[#b8894f]/20',
            )}
          >
            <div className="shrink-0 border-b border-[#b8894f]/15 px-5 py-4 sm:px-7 sm:py-5">
              <div className="flex items-center gap-2">
                <p className={cn('text-[10px] font-semibold uppercase tracking-[0.2em]', cmfasRoom.brassText)}>{slide.section}</p>
                {sectionPart && (
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tabular-nums',
                      'border-[#d4a574]/40 bg-[#d4a574]/10 text-[#d4a574]',
                    )}
                  >
                    Part {sectionPart.part} of {sectionPart.total}
                  </span>
                )}
              </div>
              <h2
                className={cn(
                  'mt-2 font-serif text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl',
                  cmfasRoom.text,
                )}
              >
                {slide.slideHeading}
              </h2>
              <p className={cn('mt-2 text-sm', cmfasRoom.textMuted)}>
                <span className="tabular-nums">~{step.minutes} min read</span>
                <span className="mx-2">·</span>
                <span>{step.outcome}</span>
              </p>
            </div>

            <div
              className={cn(
                'min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-7',
              )}
            >
              <div className="space-y-5">
                {/* Block renderer — real heading/body hierarchy. Falls back
                    to `paragraphs` for slides that haven't been migrated. */}
                {slide.blocks && slide.blocks.length > 0
                  ? slide.blocks.map((block, idx) => {
                      if (block.kind === 'intro') {
                        return (
                          <p
                            key={idx}
                            className={cn(
                              'text-base leading-[1.65] sm:text-lg',
                              cmfasRoom.text,
                            )}
                          >
                            {block.text}
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
                      if (block.kind === 'paragraph') {
                        return (
                          <p
                            key={idx}
                            className={cn(
                              'text-base leading-[1.65] sm:text-lg',
                              cmfasRoom.text,
                            )}
                          >
                            {block.text}
                          </p>
                        );
                      }
                      if (block.kind === 'list') {
                        return (
                          <ul
                            key={idx}
                            className={cn(
                              'list-disc space-y-1.5 pl-6 text-base leading-[1.65] marker:text-[#d4a574] sm:text-lg',
                              cmfasRoom.text,
                            )}
                          >
                            {block.items.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        );
                      }
                      if (block.kind === 'table') {
                        return (
                          <div
                            key={idx}
                            className={cn(
                              'overflow-hidden rounded-lg border',
                              'border-[#b8894f]/25',
                            )}
                          >
                            <table className="w-full text-sm sm:text-base">
                              <thead>
                                <tr className="bg-[#b8894f]/10">
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
                                    className={cn(
                                      ri > 0 && 'border-t border-[#b8894f]/15',
                                    )}
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
                  : slide.paragraphs.map((para, idx) => (
                      <p
                        key={idx}
                        className={cn('text-base leading-[1.65] sm:text-lg', cmfasRoom.text)}
                      >
                        {para}
                      </p>
                    ))}

                {slide.pathStages && slide.pathStages.length > 0 && (
                  <div className={cn('mt-2 space-y-8 border-t border-[#b8894f]/20 pt-8', cmfasRoom.text)}>
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
                        <ul className={cn('list-disc space-y-1.5 pl-6 text-base leading-[1.65] marker:text-[#d4a574] sm:text-lg', cmfasRoom.text)}>
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

                {/* Scroll-more cue: a line + bouncing chevron at the very
                    bottom of the scroll area. Purely visual — tells the eye
                    "keep going" without being a click-to-next-slide card. */}
                {!isLast && (
                  <div className="mt-10 flex flex-col items-center gap-2 pb-2">
                    <div className="h-px w-16 bg-[#b8894f]/30" aria-hidden />
                    <ChevronDown
                      className={cn('h-5 w-5 animate-bounce', cmfasRoom.brassText)}
                      aria-hidden
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside
            className={cn(
              'flex w-full shrink-0 flex-col justify-between border-t border-[#b8894f]/15 sm:w-72 sm:border-l sm:border-t-0 lg:w-80',
              'bg-[#0a1424]/40',
            )}
          >
            <div className="space-y-3 px-4 py-4 sm:px-5 sm:py-5">
              {linkResources.length > 0 && (
                <div className="pt-1">
                  <h4 className={cn('mb-2 text-[10px] font-bold uppercase tracking-[0.15em]', cmfasRoom.textFaint)}>
                    Links &amp; resources
                  </h4>
                  <ul className="space-y-1.5">
                    {linkResources.map((item) => (
                      <li key={`${item.href}-${item.label}`}>
                        <GetReadyResourceLink item={item} />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="mt-auto space-y-2 border-t border-[#b8894f]/10 px-4 py-3 sm:px-5">
              {/* In-progress: back + mark; completed (not last): paired Back/Next so revisiting a slide is reversible without the top step strip */}
              {!done && stepIndex > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => goToIndex(stepIndex - 1)}
                  className={cn('h-9 w-full justify-center gap-2', cmfasRoom.textMuted)}
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" />
                  Previous slide
                </Button>
              ) : null}
              {!done ? (
                <Button
                  type="button"
                  className={cn('w-full gap-2 font-semibold', 'bg-[#d4a574] text-[#0a1424] hover:bg-[#e8bb82]')}
                  onClick={handleMarkDone}
                >
                  {isLast ? 'Mark as done — go to exam tutorials' : 'Mark as done — next slide'}
                </Button>
              ) : null}
              {done && canGoToNextSlide && (
                <div className="flex gap-2">
                  {stepIndex > 0 ? (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => goToIndex(stepIndex - 1)}
                      className={cn('h-9 min-w-0 flex-1 justify-center gap-1.5 px-2', cmfasRoom.textMuted)}
                    >
                      <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="truncate">Back</span>
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    className={cn(
                      'h-9 min-w-0 gap-1.5 font-semibold',
                      'bg-[#d4a574] text-[#0a1424] hover:bg-[#e8bb82]',
                      stepIndex > 0 ? 'flex-1' : 'w-full',
                    )}
                    onClick={() => goToIndex(stepIndex + 1)}
                    title={nextStepTitle ? `Next: ${nextStepTitle}` : 'Next slide'}
                    aria-label={nextStepTitle ? `Next slide: ${nextStepTitle}` : 'Next slide'}
                  >
                    <span className="min-w-0 truncate">Next slide</span>
                    <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
                  </Button>
                </div>
              )}
              {done && isLast && stepIndex > 0 && (
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => goToIndex(stepIndex - 1)}
                    className={cn('h-9 min-w-0 flex-1 justify-center gap-1.5 px-2', cmfasRoom.textMuted)}
                  >
                    <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                    <span className="truncate">Back</span>
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className={cn(
                      'h-9 min-w-0 flex-1 border border-[#b8894f]/35',
                      'bg-[#0a1424]/60 text-[#e8d4b8] hover:bg-[#b8894f]/15',
                    )}
                    onClick={() => onSelectWorkspaceMode('papers')}
                  >
                    <span className="min-w-0 truncate">Exam tutorials</span>
                  </Button>
                </div>
              )}
              {done && isLast && stepIndex === 0 && STEP_COUNT === 1 && (
                <Button
                  type="button"
                  className={cn('h-9 w-full gap-2 font-medium', 'border border-[#b8894f]/35 bg-[#0a1424]/60 text-[#e8d4b8] hover:bg-[#b8894f]/15')}
                  onClick={() => onSelectWorkspaceMode('papers')}
                >
                  Open exam tutorials
                </Button>
              )}
              {done ? (
                <p
                  className={cn(
                    'flex min-h-9 w-full items-center justify-center gap-2 rounded-md border border-[#b8894f]/20 bg-[#0a1424]/50 px-3 py-2 text-center text-xs font-semibold',
                    cmfasRoom.positiveText,
                  )}
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
                  Step marked done
                </p>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
