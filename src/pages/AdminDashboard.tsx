import { AdminLayout } from '@/components/layout/AdminLayout';
import { UnifiedUserDirectory } from '@/components/admin/UnifiedUserDirectory';
import { VideoProgressPanel } from '@/components/admin/VideoProgressPanel';
import { QuizScoresPanel } from '@/components/admin/QuizScoresPanel';
import { FeedbackPanel } from '@/components/admin/FeedbackPanel';
import { ProAchieverLeaderboard } from '@/components/admin/ProAchieverLeaderboard';
import { QuestionBankManager } from '@/components/admin/QuestionBankManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Video, Brain, MessageSquare, Trophy, BookOpen } from 'lucide-react';
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
        <TabsList className="mb-4 sm:mb-6 w-full sm:w-auto flex-nowrap overflow-x-auto h-auto gap-1 justify-start no-scrollbar">
          <TabsTrigger value="users" className="flex items-center gap-1.5 shrink-0">
            <Users className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="video-progress" className="flex items-center gap-1.5 shrink-0">
            <Video className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Videos</span>
          </TabsTrigger>
          <TabsTrigger value="quiz-scores" className="flex items-center gap-1.5 shrink-0">
            <Brain className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Quizzes</span>
          </TabsTrigger>
          <TabsTrigger value="question-bank" className="flex items-center gap-1.5 shrink-0">
            <BookOpen className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Q-Bank</span>
          </TabsTrigger>
          <TabsTrigger value="leaderboard" className="flex items-center gap-1.5 shrink-0">
            <Trophy className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Board</span>
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-1.5 shrink-0">
            <MessageSquare className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline">Feedback</span>
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
