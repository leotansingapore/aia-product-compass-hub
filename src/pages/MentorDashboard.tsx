import { MentorDashboard } from '@/components/mentor/MentorDashboard';
import { PageLayout } from '@/components/layout/PageLayout';
import { ProtectedPage } from '@/components/ProtectedPage';

export default function MentorDashboardPage() {
  return (
    <ProtectedPage pageId="mentor-dashboard">
      <PageLayout
        title="Mentor Dashboard - FINternship"
        description="Review mentee progress and manage mentoring sessions."
      >
        <MentorDashboard />
      </PageLayout>
    </ProtectedPage>
  );
}