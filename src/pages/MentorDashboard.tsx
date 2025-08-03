import { MentorDashboard } from '@/components/mentor/MentorDashboard';
import { ProtectedPage } from '@/components/ProtectedPage';

export default function MentorDashboardPage() {
  return (
    <ProtectedPage pageId="mentor-dashboard">
      <MentorDashboard />
    </ProtectedPage>
  );
}