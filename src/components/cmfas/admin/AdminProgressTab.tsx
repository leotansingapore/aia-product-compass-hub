import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Circle, ImageIcon, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { GET_READY_SLIDES } from '@/components/cmfas/workspace-views/getReadySlideContent';
import { GET_READY_STEPS } from '@/components/cmfas/workspace-views/getReadyData';

const SECTION_COUNT = GET_READY_STEPS.length;
const SLIDE_COUNT = GET_READY_SLIDES.length;
const SCREENSHOT_BUCKET = 'checklist-screenshots';

interface LearnerSummary {
  userId: string;
  displayName: string | null;
  email: string | null;
  sectionTicks: Set<string>;
  submissionCount: number;
  screenshotCount: number;
  lastActivity: string | null;
}

interface SlideSubmissionRow {
  user_id: string;
  slide_id: string;
  answer_text: string | null;
  screenshot_url: string | null;
  submitted_at: string;
}

/**
 * Admin tab 3 — CMFAS progress dashboard.
 *
 * Left column: learners with any CMFAS progress, ranked by most-recent
 * activity. Right column / drill-down: one learner's full submission trail
 * — section ticks, every sub-slide answer, screenshot thumbnails via
 * Supabase Storage signed URLs (1h TTL).
 *
 * Scoped exclusively to CMFAS: reads `user_slide_submissions` (filtered by
 * the known CMFAS slide_ids), `user_checklist_progress` (filtered by the 6
 * CMFAS section ids), and `profiles` for display name + email.
 *
 * Read-only — no approve/reject, no edit. Just visibility.
 */
export function AdminProgressTab() {
  const [loading, setLoading] = useState(true);
  const [learners, setLearners] = useState<LearnerSummary[]>([]);
  const [submissionsByUser, setSubmissionsByUser] = useState<Map<string, SlideSubmissionRow[]>>(
    new Map(),
  );
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const cmfasSlideIds = GET_READY_SLIDES.map((s) => s.slideId);
        const cmfasSectionIds = GET_READY_STEPS.map((s) => s.id);

        const [submissionsRes, ticksRes] = await Promise.all([
          supabase
            .from('user_slide_submissions')
            .select('user_id, slide_id, answer_text, screenshot_url, submitted_at')
            .in('slide_id', cmfasSlideIds),
          supabase
            .from('user_checklist_progress')
            .select('user_id, item_id')
            .in('item_id', cmfasSectionIds),
        ]);

        if (cancelled) return;
        if (submissionsRes.error) throw submissionsRes.error;
        if (ticksRes.error) throw ticksRes.error;

        const submissions = (submissionsRes.data ?? []) as SlideSubmissionRow[];
        const ticks = (ticksRes.data ?? []) as Array<{ user_id: string; item_id: string }>;

        const userIds = new Set<string>();
        for (const row of submissions) userIds.add(row.user_id);
        for (const row of ticks) userIds.add(row.user_id);

        if (userIds.size === 0) {
          setLearners([]);
          setSubmissionsByUser(new Map());
          return;
        }

        const { data: profiles, error: profilesErr } = await supabase
          .from('profiles')
          .select('id, display_name, email')
          .in('id', Array.from(userIds));
        if (cancelled) return;
        if (profilesErr) throw profilesErr;

        const profileMap = new Map<string, { display_name: string | null; email: string | null }>();
        for (const p of (profiles ?? []) as Array<{
          id: string;
          display_name: string | null;
          email: string | null;
        }>) {
          profileMap.set(p.id, { display_name: p.display_name, email: p.email });
        }

        const subsByUser = new Map<string, SlideSubmissionRow[]>();
        for (const s of submissions) {
          const list = subsByUser.get(s.user_id) ?? [];
          list.push(s);
          subsByUser.set(s.user_id, list);
        }
        for (const list of subsByUser.values()) {
          list.sort((a, b) => (a.submitted_at < b.submitted_at ? 1 : -1));
        }

        const ticksByUser = new Map<string, Set<string>>();
        for (const t of ticks) {
          const set = ticksByUser.get(t.user_id) ?? new Set<string>();
          set.add(t.item_id);
          ticksByUser.set(t.user_id, set);
        }

        const summaries: LearnerSummary[] = Array.from(userIds).map((uid) => {
          const subs = subsByUser.get(uid) ?? [];
          const profile = profileMap.get(uid) ?? { display_name: null, email: null };
          return {
            userId: uid,
            displayName: profile.display_name,
            email: profile.email,
            sectionTicks: ticksByUser.get(uid) ?? new Set<string>(),
            submissionCount: subs.length,
            screenshotCount: subs.filter((s) => s.screenshot_url != null).length,
            lastActivity: subs[0]?.submitted_at ?? null,
          };
        });

        summaries.sort((a, b) => {
          if (!a.lastActivity) return 1;
          if (!b.lastActivity) return -1;
          return a.lastActivity < b.lastActivity ? 1 : -1;
        });

        setLearners(summaries);
        setSubmissionsByUser(subsByUser);
      } catch (err) {
        if (cancelled) return;
        console.error('[AdminProgressTab] load failed', err);
        setError(err instanceof Error ? err.message : 'Failed to load learner progress.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return learners;
    const q = search.trim().toLowerCase();
    return learners.filter(
      (l) =>
        (l.displayName ?? '').toLowerCase().includes(q) ||
        (l.email ?? '').toLowerCase().includes(q),
    );
  }, [learners, search]);

  const selectedLearner =
    selectedUserId != null ? learners.find((l) => l.userId === selectedUserId) ?? null : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-border bg-card px-5 py-16 text-sm text-muted-foreground shadow-sm">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading learner progress…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-destructive/40 bg-destructive/5 px-5 py-6 text-sm text-destructive">
        <p className="font-semibold">Couldn't load learner data</p>
        <p className="mt-1 text-xs opacity-80">{error}</p>
      </div>
    );
  }

  if (selectedLearner) {
    return (
      <LearnerDetail
        learner={selectedLearner}
        submissions={submissionsByUser.get(selectedLearner.userId) ?? []}
        onBack={() => setSelectedUserId(null)}
      />
    );
  }

  const completedLearners = learners.filter((l) => l.sectionTicks.size === SECTION_COUNT).length;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-bold">Learner CMFAS progress</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Every learner who has submitted anything in the CMFAS Study Desk. Click a row to see
          their answers and screenshots.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm shadow-sm">
          <span className="text-muted-foreground">Active learners: </span>
          <span className="font-semibold">{learners.length}</span>
        </div>
        <div className="rounded-xl border border-border bg-card px-4 py-2.5 text-sm shadow-sm">
          <span className="text-muted-foreground">Completed all {SECTION_COUNT} sections: </span>
          <span className="font-semibold">{completedLearners}</span>
        </div>
        <div className="relative ml-auto w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or email…"
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card/40 px-5 py-16 text-center text-sm text-muted-foreground">
          {learners.length === 0
            ? 'No learners have started the Study Desk yet.'
            : 'No matches for that search.'}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <ul className="divide-y divide-border">
            {filtered.map((l) => {
              const pctSections = Math.round((l.sectionTicks.size / SECTION_COUNT) * 100);
              return (
                <li key={l.userId}>
                  <button
                    type="button"
                    onClick={() => setSelectedUserId(l.userId)}
                    className="group flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {l.displayName ?? l.email ?? 'Unknown learner'}
                      </p>
                      {l.displayName && l.email && (
                        <p className="truncate text-xs text-muted-foreground">{l.email}</p>
                      )}
                    </div>

                    {/* Section ticks dots */}
                    <div className="hidden items-center gap-1 sm:flex" aria-label="Section completion">
                      {GET_READY_STEPS.map((s) => (
                        <span
                          key={s.id}
                          className={cn(
                            'h-2 w-2 rounded-full',
                            l.sectionTicks.has(s.id) ? 'bg-emerald-500' : 'bg-muted',
                          )}
                          title={`${s.title}: ${l.sectionTicks.has(s.id) ? 'done' : 'not done'}`}
                        />
                      ))}
                    </div>

                    <div className="hidden min-w-[7rem] text-right text-xs tabular-nums text-muted-foreground md:block">
                      <p>
                        <span className="font-semibold text-foreground">
                          {l.submissionCount}
                        </span>
                        {' / '}
                        {SLIDE_COUNT} slides
                      </p>
                      {l.screenshotCount > 0 && (
                        <p className="mt-0.5 flex items-center justify-end gap-1">
                          <ImageIcon className="h-3 w-3" aria-hidden />
                          {l.screenshotCount}
                        </p>
                      )}
                    </div>

                    <div className="hidden min-w-[4.5rem] text-right text-xs tabular-nums text-primary md:block">
                      {pctSections}%
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

function LearnerDetail({
  learner,
  submissions,
  onBack,
}: {
  learner: LearnerSummary;
  submissions: SlideSubmissionRow[];
  onBack: () => void;
}) {
  const submittedByPkey = useMemo(() => {
    const map = new Map<string, SlideSubmissionRow>();
    for (const s of submissions) map.set(s.slide_id, s);
    return map;
  }, [submissions]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          onClick={onBack}
          className="h-9 gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All learners
        </Button>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="font-serif text-2xl font-bold">
          {learner.displayName ?? learner.email ?? 'Unknown learner'}
        </h2>
        {learner.email && learner.displayName && (
          <p className="mt-0.5 text-sm text-muted-foreground">{learner.email}</p>
        )}
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="rounded-md border border-border bg-muted/30 px-3 py-1.5">
            Sections:{' '}
            <span className="font-semibold">
              {learner.sectionTicks.size} / {SECTION_COUNT}
            </span>
          </span>
          <span className="rounded-md border border-border bg-muted/30 px-3 py-1.5">
            Submissions:{' '}
            <span className="font-semibold">
              {learner.submissionCount} / {SLIDE_COUNT}
            </span>
          </span>
          {learner.lastActivity && (
            <span className="rounded-md border border-border bg-muted/30 px-3 py-1.5 text-muted-foreground">
              Last activity:{' '}
              <span className="font-medium text-foreground">
                {new Date(learner.lastActivity).toLocaleString()}
              </span>
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {GET_READY_STEPS.map((section) => {
          const sectionSlides = GET_READY_SLIDES.filter((s) => s.sectionId === section.id);
          const ticked = learner.sectionTicks.has(section.id);
          return (
            <details
              key={section.id}
              open
              className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm [&::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3 hover:bg-muted/30">
                {ticked ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" aria-hidden />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-muted-foreground/50" aria-hidden />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{section.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {sectionSlides.filter((s) => submittedByPkey.has(s.slideId)).length} /{' '}
                    {sectionSlides.length} slides submitted
                  </p>
                </div>
              </summary>
              <ul className="divide-y divide-border border-t border-border bg-muted/20">
                {sectionSlides.map((slide) => {
                  const sub = submittedByPkey.get(slide.slideId);
                  return (
                    <li key={slide.slideId} className="px-4 py-3">
                      <div className="flex items-start gap-3">
                        {sub ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" aria-hidden />
                        ) : (
                          <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" aria-hidden />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{slide.slideHeading}</p>
                          {sub ? (
                            <>
                              <p className="mt-0.5 text-[11px] text-muted-foreground">
                                Submitted {new Date(sub.submitted_at).toLocaleString()}
                              </p>
                              {sub.answer_text && (
                                <p className="mt-2 whitespace-pre-wrap rounded-md bg-background px-3 py-2 text-sm">
                                  {sub.answer_text}
                                </p>
                              )}
                              {sub.screenshot_url && (
                                <ScreenshotThumb path={sub.screenshot_url} />
                              )}
                            </>
                          ) : (
                            <p className="mt-0.5 text-[11px] text-muted-foreground/70">
                              Not submitted yet
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </div>
    </div>
  );
}

function ScreenshotThumb({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.storage
          .from(SCREENSHOT_BUCKET)
          .createSignedUrl(path, 60 * 60);
        if (cancelled) return;
        if (error) throw error;
        setUrl(data?.signedUrl ?? null);
      } catch (err) {
        console.warn('[AdminProgressTab] signed-url failed', err);
        if (!cancelled) setUrl(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (loading) {
    return (
      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-3 w-3 animate-spin" />
        Loading screenshot…
      </div>
    );
  }
  if (!url) {
    return (
      <p className="mt-2 text-xs text-muted-foreground italic">
        Screenshot unavailable (bucket path: <code>{path}</code>)
      </p>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 block overflow-hidden rounded-md border border-border bg-background transition-shadow hover:shadow-md"
      aria-label="Open screenshot full size"
    >
      <img src={url} alt="Learner screenshot" className="block h-auto w-full max-w-md" loading="lazy" />
    </a>
  );
}
