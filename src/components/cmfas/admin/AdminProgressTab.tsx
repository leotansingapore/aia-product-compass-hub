import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, Circle, ImageIcon, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { GET_READY_SLIDES } from '@/components/cmfas/workspace-views/getReadySlideContent';
import { GET_READY_STEPS } from '@/components/cmfas/workspace-views/getReadyData';
import { moduleIdToProductId } from '@/data/cmfasModuleData';
import type { TrainingVideo } from '@/hooks/useProducts';

const SECTION_COUNT = GET_READY_STEPS.length;
const SLIDE_COUNT = GET_READY_SLIDES.length;
const SCREENSHOT_BUCKET = 'checklist-screenshots';

const PAPERS = [
  { id: 'm9', code: 'M9' },
  { id: 'm9a', code: 'M9A' },
  { id: 'hi', code: 'HI' },
  { id: 'res5', code: 'RES5' },
] as const;

type PaperId = (typeof PAPERS)[number]['id'];

interface PaperProgress {
  completed: number;
  total: number;
}

interface LearnerSummary {
  userId: string;
  displayName: string | null;
  email: string | null;
  sectionTicks: Set<string>;
  submissionCount: number;
  screenshotCount: number;
  lastActivity: string | null;
  paperProgress: Record<PaperId, PaperProgress>;
}

interface SlideSubmissionRow {
  user_id: string;
  slide_id: string;
  answer_text: string | null;
  screenshot_url: string | null;
  submitted_at: string;
}

type ProgressFilter = 'all' | 'in-progress' | 'stalled' | 'completed';

/**
 * Admin tab 3 — CMFAS progress dashboard.
 *
 * Lists EVERY profile (all learners in the app, admin roles excluded) and
 * shows their CMFAS-scoped engagement:
 *   1. Study-Desk section ticks (`user_checklist_progress` rows with the 6
 *      CMFAS section ids).
 *   2. Atomic sub-slide submissions (`user_slide_submissions` filtered to
 *      the 17 CMFAS slide ids) — text answers + screenshot thumbnails via
 *      1-hour signed URLs.
 *   3. Per-paper video completion (`video_progress` filtered to the 4
 *      CMFAS product ids + current `training_videos` length per paper).
 *
 * Read-only — no approve/reject, no edit. Just visibility.
 */
export function AdminProgressTab() {
  const [loading, setLoading] = useState(true);
  const [learners, setLearners] = useState<LearnerSummary[]>([]);
  const [submissionsByUser, setSubmissionsByUser] = useState<Map<string, SlideSubmissionRow[]>>(
    new Map(),
  );
  const [paperTotals, setPaperTotals] = useState<Record<PaperId, number>>({
    m9: 0,
    m9a: 0,
    hi: 0,
    res5: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<ProgressFilter>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const cmfasSlideIds = GET_READY_SLIDES.map((s) => s.slideId);
        const cmfasSectionIds = GET_READY_STEPS.map((s) => s.id);
        const paperProductIds = PAPERS.map((p) => moduleIdToProductId[p.id]);

        const [profilesRes, submissionsRes, ticksRes, videoProgressRes, productsRes, adminRolesRes] =
          await Promise.all([
            supabase.from('profiles').select('id, display_name, email'),
            supabase
              .from('user_slide_submissions')
              .select('user_id, slide_id, answer_text, screenshot_url, submitted_at')
              .in('slide_id', cmfasSlideIds),
            supabase
              .from('user_checklist_progress')
              .select('user_id, item_id')
              .in('item_id', cmfasSectionIds),
            supabase
              .from('video_progress')
              .select('user_id, product_id, completed')
              .in('product_id', paperProductIds)
              .eq('completed', true),
            supabase.from('products').select('id, training_videos').in('id', paperProductIds),
            supabase.from('user_admin_roles').select('user_id'),
          ]);

        if (cancelled) return;
        if (profilesRes.error) throw profilesRes.error;
        if (submissionsRes.error) throw submissionsRes.error;
        if (ticksRes.error) throw ticksRes.error;
        if (videoProgressRes.error) throw videoProgressRes.error;
        if (productsRes.error) throw productsRes.error;
        if (adminRolesRes.error) throw adminRolesRes.error;

        const profiles = (profilesRes.data ?? []) as Array<{
          id: string;
          display_name: string | null;
          email: string | null;
        }>;
        const submissions = (submissionsRes.data ?? []) as SlideSubmissionRow[];
        const ticks = (ticksRes.data ?? []) as Array<{ user_id: string; item_id: string }>;
        const videoProgress = (videoProgressRes.data ?? []) as Array<{
          user_id: string;
          product_id: string;
          completed: boolean;
        }>;
        const products = (productsRes.data ?? []) as Array<{
          id: string;
          training_videos: TrainingVideo[] | null;
        }>;
        const adminRoles = (adminRolesRes.data ?? []) as Array<{ user_id: string }>;
        const adminUserIds = new Set(adminRoles.map((a) => a.user_id));

        // Per-paper total video count — use current products table values.
        const totals: Record<PaperId, number> = { m9: 0, m9a: 0, hi: 0, res5: 0 };
        for (const p of products) {
          const paper = PAPERS.find((pp) => moduleIdToProductId[pp.id] === p.id);
          if (paper) totals[paper.id] = (p.training_videos ?? []).length;
        }
        setPaperTotals(totals);

        // Per-user submissions map (sorted newest-first for lastActivity).
        const subsByUser = new Map<string, SlideSubmissionRow[]>();
        for (const s of submissions) {
          const list = subsByUser.get(s.user_id) ?? [];
          list.push(s);
          subsByUser.set(s.user_id, list);
        }
        for (const list of subsByUser.values()) {
          list.sort((a, b) => (a.submitted_at < b.submitted_at ? 1 : -1));
        }

        // Per-user section ticks map.
        const ticksByUser = new Map<string, Set<string>>();
        for (const t of ticks) {
          const set = ticksByUser.get(t.user_id) ?? new Set<string>();
          set.add(t.item_id);
          ticksByUser.set(t.user_id, set);
        }

        // Per-user per-product video completion count.
        const videosByUser = new Map<string, Map<string, number>>();
        for (const v of videoProgress) {
          const userMap = videosByUser.get(v.user_id) ?? new Map<string, number>();
          userMap.set(v.product_id, (userMap.get(v.product_id) ?? 0) + 1);
          videosByUser.set(v.user_id, userMap);
        }

        const summaries: LearnerSummary[] = profiles
          .filter((p) => !adminUserIds.has(p.id))
          .map((p) => {
            const subs = subsByUser.get(p.id) ?? [];
            const userVideos = videosByUser.get(p.id) ?? new Map<string, number>();
            const paperProgress: Record<PaperId, PaperProgress> = {
              m9: { completed: 0, total: totals.m9 },
              m9a: { completed: 0, total: totals.m9a },
              hi: { completed: 0, total: totals.hi },
              res5: { completed: 0, total: totals.res5 },
            };
            for (const paper of PAPERS) {
              const pid = moduleIdToProductId[paper.id];
              paperProgress[paper.id].completed = userVideos.get(pid) ?? 0;
            }
            return {
              userId: p.id,
              displayName: p.display_name,
              email: p.email,
              sectionTicks: ticksByUser.get(p.id) ?? new Set<string>(),
              submissionCount: subs.length,
              screenshotCount: subs.filter((s) => s.screenshot_url != null).length,
              lastActivity: subs[0]?.submitted_at ?? null,
              paperProgress,
            };
          });

        // Sort: most-recently-active first, then untouched learners at the end.
        summaries.sort((a, b) => {
          if (!a.lastActivity && !b.lastActivity) {
            return (a.displayName ?? a.email ?? '').localeCompare(b.displayName ?? b.email ?? '');
          }
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
    let list = learners;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (l) =>
          (l.displayName ?? '').toLowerCase().includes(q) ||
          (l.email ?? '').toLowerCase().includes(q),
      );
    }
    if (filter === 'in-progress') {
      list = list.filter(
        (l) => l.sectionTicks.size > 0 && l.sectionTicks.size < SECTION_COUNT,
      );
    } else if (filter === 'stalled') {
      list = list.filter((l) => l.submissionCount === 0 && l.sectionTicks.size === 0);
    } else if (filter === 'completed') {
      list = list.filter((l) => l.sectionTicks.size === SECTION_COUNT);
    }
    return list;
  }, [learners, search, filter]);

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
        paperTotals={paperTotals}
        onBack={() => setSelectedUserId(null)}
      />
    );
  }

  const completedCount = learners.filter((l) => l.sectionTicks.size === SECTION_COUNT).length;
  const inProgressCount = learners.filter(
    (l) => l.sectionTicks.size > 0 && l.sectionTicks.size < SECTION_COUNT,
  ).length;
  const stalledCount = learners.filter(
    (l) => l.submissionCount === 0 && l.sectionTicks.size === 0,
  ).length;

  const FILTERS: Array<{ id: ProgressFilter; label: string; count: number }> = [
    { id: 'all', label: 'All', count: learners.length },
    { id: 'in-progress', label: 'In progress', count: inProgressCount },
    { id: 'stalled', label: 'Not started', count: stalledCount },
    { id: 'completed', label: 'Completed', count: completedCount },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-bold">Learner CMFAS progress</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Every non-admin learner in the app — their Study Desk progress, sub-slide answers,
          screenshot uploads, and per-paper video completion. Click a row for the full trail.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
              filter === f.id
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
            )}
          >
            {f.label} <span className="tabular-nums opacity-70">({f.count})</span>
          </button>
        ))}
        <div className="relative ml-auto w-full max-w-xs">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
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
          No learners match these filters.
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
                    className="group flex w-full flex-col gap-3 px-5 py-4 text-left transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:gap-5"
                  >
                    {/* Name + email */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        {l.displayName ?? l.email ?? 'Unknown learner'}
                      </p>
                      {l.displayName && l.email && (
                        <p className="truncate text-xs text-muted-foreground">{l.email}</p>
                      )}
                    </div>

                    {/* Study-Desk section ticks */}
                    <div className="flex flex-col gap-1" aria-label="Section completion">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/80">
                        Study Desk
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center gap-1">
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
                        <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
                          {pctSections}%
                        </span>
                      </div>
                    </div>

                    {/* Per-paper video completion */}
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/80">
                        Videos
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {PAPERS.map((paper) => {
                          const p = l.paperProgress[paper.id];
                          const label =
                            p.total === 0
                              ? `${paper.code}: —`
                              : `${paper.code}: ${p.completed}/${p.total}`;
                          const full = p.total > 0 && p.completed === p.total;
                          const partial = p.completed > 0 && !full;
                          return (
                            <span
                              key={paper.id}
                              className={cn(
                                'rounded-md border px-1.5 py-0.5 text-[10px] font-medium tabular-nums',
                                full && 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300',
                                partial && 'border-primary/40 bg-primary/10 text-primary',
                                !full && !partial && 'border-border bg-muted/40 text-muted-foreground',
                              )}
                            >
                              {label}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Submissions summary */}
                    <div className="hidden min-w-[6rem] text-right text-xs tabular-nums text-muted-foreground md:block">
                      <p>
                        <span className="font-semibold text-foreground">
                          {l.submissionCount}
                        </span>
                        {' / '}
                        {SLIDE_COUNT}
                      </p>
                      {l.screenshotCount > 0 && (
                        <p className="mt-0.5 flex items-center justify-end gap-1">
                          <ImageIcon className="h-3 w-3" aria-hidden />
                          {l.screenshotCount}
                        </p>
                      )}
                      {l.lastActivity && (
                        <p className="mt-0.5 text-[10px] opacity-70">
                          {formatRelativeTime(l.lastActivity)}
                        </p>
                      )}
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

function formatRelativeTime(iso: string): string {
  const delta = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(delta / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function LearnerDetail({
  learner,
  submissions,
  paperTotals,
  onBack,
}: {
  learner: LearnerSummary;
  submissions: SlideSubmissionRow[];
  paperTotals: Record<PaperId, number>;
  onBack: () => void;
}) {
  const submittedByKey = useMemo(() => {
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
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <Stat
            label="Sections"
            value={`${learner.sectionTicks.size} / ${SECTION_COUNT}`}
          />
          <Stat
            label="Sub-slides"
            value={`${learner.submissionCount} / ${SLIDE_COUNT}`}
          />
          <Stat
            label="Screenshots"
            value={learner.screenshotCount.toString()}
          />
          <Stat
            label="Last activity"
            value={
              learner.lastActivity
                ? new Date(learner.lastActivity).toLocaleDateString()
                : 'No activity'
            }
          />
        </div>
      </div>

      {/* Per-paper video progress */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="font-serif text-lg font-bold">Per-paper video progress</h3>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Videos each paper's module marked complete via <code>video_progress</code>.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PAPERS.map((paper) => {
            const p = learner.paperProgress[paper.id];
            const pct = p.total > 0 ? Math.round((p.completed / p.total) * 100) : 0;
            return (
              <div
                key={paper.id}
                className="rounded-xl border border-border bg-background p-3"
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-serif text-lg font-bold text-primary">{paper.code}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    {p.completed} / {p.total || paperTotals[paper.id]}
                  </span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn(
                      'h-full transition-all',
                      pct === 100 ? 'bg-emerald-500' : 'bg-primary',
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-muted-foreground tabular-nums">{pct}%</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Study Desk submissions drill-down */}
      <div className="space-y-2">
        <h3 className="font-serif text-lg font-bold">Study Desk submissions</h3>
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
                    {sectionSlides.filter((s) => submittedByKey.has(s.slideId)).length} /{' '}
                    {sectionSlides.length} slides submitted
                  </p>
                </div>
              </summary>
              <ul className="divide-y divide-border border-t border-border bg-muted/20">
                {sectionSlides.map((slide) => {
                  const sub = submittedByKey.get(slide.slideId);
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
                              {sub.screenshot_url && <ScreenshotThumb path={sub.screenshot_url} />}
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
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
