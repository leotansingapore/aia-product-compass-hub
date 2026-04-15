import { AdminLayout } from '@/components/layout/AdminLayout';
import { UnifiedUserDirectory } from '@/components/admin/UnifiedUserDirectory';
import { VideoProgressPanel } from '@/components/admin/VideoProgressPanel';
import { QuizScoresPanel } from '@/components/admin/QuizScoresPanel';
import { StudyProgressPanel } from '@/components/admin/StudyProgressPanel';
import { FeedbackPanel } from '@/components/admin/FeedbackPanel';
import { ProAchieverLeaderboard } from '@/components/admin/ProAchieverLeaderboard';
import { QuestionBankManager } from '@/components/admin/QuestionBankManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Video, Brain, MessageSquare, Trophy, BookOpen, GraduationCap, BarChart3 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export default function AdminDashboard() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'users';

  return (
    <AdminLayout
      title="Admin Dashboard"
      description="Unified user management dashboard for registration to activation."
    >
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
            value="feedback"
            className="flex items-center gap-1.5 flex-1 sm:flex-none rounded-none border-b-2 border-transparent bg-transparent px-4 py-2.5 text-muted-foreground shadow-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none hover:text-foreground"
          >
            <MessageSquare className="h-4 w-4 shrink-0" />
            <span className="hidden xs:inline sm:inline">Feedback</span>
            <span className="xs:hidden sm:hidden">Feedback</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <UnifiedUserDirectory />
        </TabsContent>

        <TabsContent value="video-progress">
          <VideoProgressPanel />
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
              <QuizScoresPanel />
            </TabsContent>
            <TabsContent value="study">
              <StudyProgressPanel />
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="question-bank">
          <QuestionBankManager />
        </TabsContent>

        <TabsContent value="leaderboard">
          <ProAchieverLeaderboard />
        </TabsContent>

        <TabsContent value="feedback">
          <FeedbackPanel />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}
