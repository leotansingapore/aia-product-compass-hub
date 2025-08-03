import { MentorReviewInterface } from '@/components/mentor/MentorReviewInterface';
import { ProtectedPage } from '@/components/ProtectedPage';

export default function MentorReviewPage() {
  return (
    <ProtectedPage pageId="mentor-review">
      <MentorReviewInterface />
    </ProtectedPage>
  );
}