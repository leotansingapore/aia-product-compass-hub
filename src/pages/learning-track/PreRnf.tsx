import { useParams } from "react-router-dom";
import First60DaysAssignments from "@/pages/learning-track/First60DaysAssignments";
import StudentProgressChecklist from "@/components/learning-track/StudentProgressChecklist";

export default function PreRnfTrack() {
  return <PreRnfLearnerView />;
}

function PreRnfLearnerView() {
  const { itemId } = useParams<{ itemId?: string }>();
  const isDetailView = !!itemId;

  return (
    <div className="space-y-5" data-testid="pre-rnf-page">
      {/* The roadmap checklist only belongs on the landing grid — when a single
          assignment is open we hand the whole surface to its detail view. */}
      {!isDetailView && (
        <div className="max-w-4xl mx-auto px-3 sm:px-0">
          <StudentProgressChecklist />
        </div>
      )}
      <First60DaysAssignments />
    </div>
  );
}
