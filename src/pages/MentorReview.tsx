import { MentorReviewInterface } from '@/components/mentor/MentorReviewInterface';
import { Helmet } from 'react-helmet-async';
import { ProtectedPage } from '@/components/ProtectedPage';

export default function MentorReviewPage() {
  return (
    <ProtectedPage pageId="mentor-review">
      <>
        <Helmet>
          <title>Mentor Review - FINternship</title>
          <meta name="description" content="Evaluate roleplays, provide feedback, and track mentee improvements." />
          <link rel="canonical" href={`${window.location.origin}/mentor-review`} />
        </Helmet>
        <MentorReviewInterface />
      </>
    </ProtectedPage>
  );
}