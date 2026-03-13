import { AdminLayout } from '@/components/layout/AdminLayout';
import { UnifiedUserDirectory } from '@/components/admin/UnifiedUserDirectory';
import { VideoProgressPanel } from '@/components/admin/VideoProgressPanel';
import { QuizScoresPanel } from '@/components/admin/QuizScoresPanel';
import { FeedbackPanel } from '@/components/admin/FeedbackPanel';
import { ProAchieverLeaderboard } from '@/components/admin/ProAchieverLeaderboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Video, Brain, MessageSquare, Trophy } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <AdminLayout
      title="Admin Dashboard"
      description="Unified user management dashboard for registration to activation."
    >
      <Tabs defaultValue="users">
        <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto flex-wrap h-auto gap-1">
          <TabsTrigger value="users" className="flex items-center gap-1.5 flex-1 sm:flex-none">
            <Users className="h-4 w-4 shrink-0" />
            <span className="hidden xs:inline sm:inline">User Management</span>
            <span className="xs:hidden sm:hidden">Users</span>
          </TabsTrigger>
          <TabsTrigger value="video-progress" className="flex items-center gap-1.5 flex-1 sm:flex-none">
            <Video className="h-4 w-4 shrink-0" />
            <span className="hidden xs:inline sm:inline">Video Progress</span>
            <span className="xs:hidden sm:hidden">Videos</span>
          </TabsTrigger>
          <TabsTrigger value="quiz-scores" className="flex items-center gap-1.5 flex-1 sm:flex-none">
            <Brain className="h-4 w-4 shrink-0" />
            <span className="hidden xs:inline sm:inline">Quiz Scores</span>
            <span className="xs:hidden sm:hidden">Quizzes</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-1.5 flex-1 sm:flex-none">
            <Trophy className="h-4 w-4 shrink-0" />
            <span className="hidden xs:inline sm:inline">Leaderboard</span>
            <span className="xs:hidden sm:hidden">Board</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-1.5 flex-1 sm:flex-none">
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

        <TabsContent value="quiz-scores">
          <QuizScoresPanel />
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
