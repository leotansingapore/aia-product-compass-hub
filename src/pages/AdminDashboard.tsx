import { lazy, Suspense } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PlatformControls } from '@/components/admin/PlatformControls';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Each admin panel is heavy (data tables, charts, mutations). The dashboard
// has 10 tabs but a single visit only ever uses 1–2 of them. Lazy-load each
// so an admin opening "users" doesn't pay for VideoProgress + QuizScores +
// StudyProgress + Leaderboard + QuestionBank + Tier + Feedback + Categories.
const UnifiedUserDirectory = lazy(() => import('@/components/admin/UnifiedUserDirectory').then(m => ({ default: m.UnifiedUserDirectory })));
const VideoProgressPanel = lazy(() => import('@/components/admin/VideoProgressPanel').then(m => ({ default: m.VideoProgressPanel })));
const QuizScoresPanel = lazy(() => import('@/components/admin/QuizScoresPanel').then(m => ({ default: m.QuizScoresPanel })));
const StudyProgressPanel = lazy(() => import('@/components/admin/StudyProgressPanel').then(m => ({ default: m.StudyProgressPanel })));
const FeedbackPanel = lazy(() => import('@/components/admin/FeedbackPanel').then(m => ({ default: m.FeedbackPanel })));
const ProAchieverLeaderboard = lazy(() => import('@/components/admin/ProAchieverLeaderboard').then(m => ({ default: m.ProAchieverLeaderboard })));
const QuestionBankManager = lazy(() => import('@/components/admin/QuestionBankManager').then(m => ({ default: m.QuestionBankManager })));
const TierRequestsPanel = lazy(() => import('@/components/admin/TierRequestsPanel').then(m => ({ default: m.TierRequestsPanel })));
const CategoryTreeEditor = lazy(() => import('@/components/admin/CategoryTreeEditor').then(m => ({ default: m.CategoryTreeEditor })));

const PanelFallback = () => (
  <div className="space-y-3">
    <div className="h-8 w-48 animate-pulse rounded bg-muted/40" />
    <div className="h-64 w-full animate-pulse rounded bg-muted/30" />
  </div>
);
import { Users, Video, Brain, MessageSquare, Trophy, BookOpen, GraduationCap, BarChart3, Inbox, FolderTree } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'users';

  return (
    <AdminLayout
      title="Admin Dashboard"
      description="Unified user management dashboard for registration to activation."
    >
      <div className="mb-4">
        <PlatformControls />
      </div>
      <Tabs defaultValue={initialTab}>
        <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto flex-wrap h-auto gap-0 !bg-transparent !p-0 border-b border-border rounded-none justify-start">
          <TabsTrigger
            value="users"
            className="flex items-center gap-1.5 flex-1 sm:flex-none rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-foreground"
          >
            <Users className="h-4 w-4 shrink-0" />
            <span className="hidden xs:inline sm:inline">User Management</span>
            <span className="xs:hidden sm:hidden">Users</span>
          </TabsTrigger>
          <TabsTrigger
            value="video-progress"
            className="flex items-center gap-1.5 flex-1 sm:flex-none rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-foreground"
          >
            <Video className="h-4 w-4 shrink-0" />
            <span className="hidden xs:inline sm:inline">Video Progress</span>
            <span className="xs:hidden sm:hidden">Videos</span>
          </TabsTrigger>
          <TabsTrigger
            value="performance"
            className="flex items-center gap-1.5 flex-1 sm:flex-none rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-foreground"
          >
            <BarChart3 className="h-4 w-4 shrink-0" />
            <span className="hidden xs:inline sm:inline">Performance</span>
            <span className="xs:hidden sm:hidden">Perf</span>
          </TabsTrigger>
          <TabsTrigger
            value="question-bank"
            className="flex items-center gap-1.5 flex-1 sm:flex-none rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-foreground"
          >
            <BookOpen className="h-4 w-4 shrink-0" />
            <span className="hidden xs:inline sm:inline">Question Bank</span>
            <span className="xs:hidden sm:hidden">Bank</span>
          </TabsTrigger>
          <TabsTrigger
            value="leaderboard"
            className="flex items-center gap-1.5 flex-1 sm:flex-none rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-foreground"
          >
            <Trophy className="h-4 w-4 shrink-0" />
            <span className="hidden xs:inline sm:inline">Leaderboard</span>
            <span className="xs:hidden sm:hidden">Board</span>
          </TabsTrigger>
          <TabsTrigger
            value="tier-requests"
            className="flex items-center gap-1.5 flex-1 sm:flex-none rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-foreground"
          >
            <Inbox className="h-4 w-4 shrink-0" />
            <span className="hidden xs:inline sm:inline">Tier Requests</span>
            <span className="xs:hidden sm:hidden">Requests</span>
          </TabsTrigger>
          <TabsTrigger
            value="feedback"
            className="flex items-center gap-1.5 flex-1 sm:flex-none rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-foreground"
          >
            <MessageSquare className="h-4 w-4 shrink-0" />
            <span className="hidden xs:inline sm:inline">Feedback</span>
            <span className="xs:hidden sm:hidden">Feedback</span>
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="flex items-center gap-1.5 flex-1 sm:flex-none rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-foreground"
          >
            <FolderTree className="h-4 w-4 shrink-0" />
            <span className="hidden xs:inline sm:inline">Categories</span>
            <span className="xs:hidden sm:hidden">Cats</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Suspense fallback={<PanelFallback />}><UnifiedUserDirectory /></Suspense>
        </TabsContent>

        <TabsContent value="video-progress">
          <Suspense fallback={<PanelFallback />}><VideoProgressPanel /></Suspense>
        </TabsContent>

        <TabsContent value="performance">
          <Tabs defaultValue="quizzes">
            <TabsList className="mb-4 h-9 min-h-0 p-1 bg-muted/50 w-auto inline-flex gap-0.5">
              <TabsTrigger
                value="quizzes"
                className="flex items-center gap-1.5 h-7 px-3 text-xs rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <Brain className="h-3.5 w-3.5 shrink-0" />
                Quizzes
              </TabsTrigger>
              <TabsTrigger
                value="study"
                className="flex items-center gap-1.5 h-7 px-3 text-xs rounded-sm data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                Study Progress
              </TabsTrigger>
            </TabsList>
            <TabsContent value="quizzes">
              <Suspense fallback={<PanelFallback />}><QuizScoresPanel /></Suspense>
            </TabsContent>
            <TabsContent value="study">
              <Suspense fallback={<PanelFallback />}><StudyProgressPanel /></Suspense>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="question-bank">
          <Suspense fallback={<PanelFallback />}><QuestionBankManager /></Suspense>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Suspense fallback={<PanelFallback />}><ProAchieverLeaderboard /></Suspense>
        </TabsContent>

        <TabsContent value="tier-requests">
          <Suspense fallback={<PanelFallback />}><TierRequestsPanel /></Suspense>
        </TabsContent>

        <TabsContent value="feedback">
          <Suspense fallback={<PanelFallback />}><FeedbackPanel /></Suspense>
        </TabsContent>

        <TabsContent value="categories">
          <Suspense fallback={<PanelFallback />}><CategoryTreeEditor /></Suspense>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
