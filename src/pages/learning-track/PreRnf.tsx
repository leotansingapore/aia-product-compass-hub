import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import First60DaysAssignments from "@/pages/learning-track/First60DaysAssignments";
import StudentProgressChecklist from "@/components/learning-track/StudentProgressChecklist";
import RecommendedOrder from "@/components/learning-track/RecommendedOrder";

export default function PreRnfTrack() {
  return <PreRnfLearnerView />;
}

function PreRnfLearnerView() {
  const { itemId } = useParams<{ itemId?: string }>();
  const isDetailView = !!itemId;

  return (
    <div className="space-y-5" data-testid="pre-rnf-page">
      {/* The roadmap only belongs on the landing grid — when a single assignment
          is open we hand the whole surface to its detail view. The Checklist (do
          things in any order, ticks itself) and the Recommended Order (one optimal
          interleaved path) are two views of the same progress. */}
      {!isDetailView && (
        <div className="max-w-4xl mx-auto px-3 sm:px-0">
          <Tabs defaultValue="checklist" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2 sm:w-auto sm:inline-grid">
              <TabsTrigger value="checklist">Checklist</TabsTrigger>
              <TabsTrigger value="recommended">Recommended order</TabsTrigger>
            </TabsList>
            <TabsContent value="checklist">
              <StudentProgressChecklist />
            </TabsContent>
            <TabsContent value="recommended">
              <RecommendedOrder />
            </TabsContent>
          </Tabs>
        </div>
      )}
      <First60DaysAssignments />
    </div>
  );
}
