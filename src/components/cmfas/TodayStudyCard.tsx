import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
  getCMFASModuleVideos,
  getCMFASModuleName,
  moduleIdToProductId,
} from '@/data/cmfasModuleData';
import { getVideoSlug } from '@/utils/slugUtils';
import { PomodoroHero } from './PomodoroHero';
import { useCMFASStudy } from './CMFASStudyProvider';
import { cmfasTone } from './cmfasTheme';

const CMFAS_MODULE_IDS = ['onboarding', 'm9', 'm9a', 'hi', 'res5'] as const;

interface ResumeTarget {
  moduleId: string;
  moduleName: string;
  videoId: string;
  videoTitle: string;
  percentage: number;
}

/**
 * "Pick up where you left off" card. Finds the CMFAS video the learner most
 * recently updated that isn't already complete, and gives them one primary
 * action: start a pomodoro + open that lesson. The PomodoroHero renders to
 * the right (or below on mobile) so "start studying" is a single click.
 */
export function TodayStudyCard() {
  const { user } = useAuth();
  const { start, isRunning } = useCMFASStudy();
  const navigate = useNavigate();

  const [resume, setResume] = useState<ResumeTarget | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) {
      setResume(null);
      setLoaded(true);
      return;
    }
    let cancelled = false;
    (async () => {
      const productIds = Object.values(moduleIdToProductId);
      // Find the most recently touched incomplete CMFAS video.
      const { data, error } = await supabase
        .from('video_progress')
        .select('product_id, video_id, completed, completion_percentage, updated_at')
        .eq('user_id', user.id)
        .in('product_id', productIds)
        .eq('completed', false)
        .order('updated_at', { ascending: false })
        .limit(1);

      if (cancelled) return;
      if (error || !data || data.length === 0) {
        setResume(null);
        setLoaded(true);
        return;
      }

      const row = data[0] as { product_id: string; video_id: string; completion_percentage: number };
      // Map product_id back to moduleId (inverse of moduleIdToProductId).
      const moduleEntry = Object.entries(moduleIdToProductId).find(
        ([, pid]) => pid === row.product_id,
      );
      if (!moduleEntry) {
        setResume(null);
        setLoaded(true);
        return;
      }
      const [moduleId] = moduleEntry;
      const lessons = getCMFASModuleVideos(moduleId);
      const lesson = lessons.find((v) => v.id === row.video_id);
      if (!lesson) {
        setResume(null);
        setLoaded(true);
        return;
      }
      setResume({
        moduleId,
        moduleName: getCMFASModuleName(moduleId),
        videoId: row.video_id,
        videoTitle: lesson.title,
        percentage: row.completion_percentage ?? 0,
      });
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleStartSession = () => {
    start();
    if (resume) {
      const slug = getVideoSlug(resume.videoTitle);
      navigate(`/cmfas/module/${resume.moduleId}/video/${slug}`);
    } else {
      // No in-flight lesson — open the first module so the session has a home.
      navigate(`/cmfas/module/${CMFAS_MODULE_IDS[0]}`);
    }
  };

  const handleOpenLesson = () => {
    if (!resume) return;
    const slug = getVideoSlug(resume.videoTitle);
    navigate(`/cmfas/module/${resume.moduleId}/video/${slug}`);
  };

  return (
    <div className={cn('overflow-hidden rounded-2xl border-2', cmfasTone.accentBorder, cmfasTone.accentBgSoft)}>
      <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8 sm:p-6">
        <div className="min-w-0">
          <p className={cn('text-[11px] font-semibold uppercase tracking-wider', cmfasTone.accentText)}>
            Today
          </p>
          {loaded && resume ? (
            <>
              <h3 className="mt-1 text-lg font-bold leading-snug text-foreground sm:text-xl">
                Continue: {resume.moduleName}
              </h3>
              <p className="mt-0.5 text-sm text-muted-foreground">{resume.videoTitle}</p>
              {resume.percentage > 0 && (
                <div className="mt-3 flex items-center gap-3">
                  <Progress value={resume.percentage} className="h-1.5 flex-1" />
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {Math.round(resume.percentage)}% through
                  </span>
                </div>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className={cn('gap-2', 'bg-cyan-600 text-white hover:bg-cyan-700')}
                  onClick={handleStartSession}
                >
                  {isRunning ? 'Open lesson' : 'Start 25-min session'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" className="gap-2" onClick={handleOpenLesson}>
                  <BookOpen className="h-4 w-4" />
                  Open without timer
                </Button>
              </div>
            </>
          ) : (
            <>
              <h3 className="mt-1 text-lg font-bold leading-snug text-foreground sm:text-xl">
                Ready to begin
              </h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Open your first CMFAS module and start a focus session. You'll be surprised how much
                you can cover in 25 minutes.
              </p>
              <div className="mt-4">
                <Button
                  size="sm"
                  className={cn('gap-2', 'bg-cyan-600 text-white hover:bg-cyan-700')}
                  onClick={handleStartSession}
                >
                  Start 25-min session
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
        <div className="flex justify-center sm:justify-end">
          <PomodoroHero />
        </div>
      </div>
    </div>
  );
}
