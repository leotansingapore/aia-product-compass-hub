import { MentorDashboard } from '@/components/mentor/MentorDashboard';
import { Helmet } from 'react-helmet-async';
import { ProtectedPage } from '@/components/ProtectedPage';

export default function MentorDashboardPage() {
  return (
    <ProtectedPage pageId="mentor-dashboard">
      <>
        <Helmet>
          <title>Mentor Dashboard - FINternship</title>
          <meta name="description" content="Review mentee progress and manage mentoring sessions." />
          <link rel="canonical" href={`${window.location.origin}/mentor-dashboard`} />
        </Helmet>
        <MentorDashboard />
      </>
    </ProtectedPage>
  );
}