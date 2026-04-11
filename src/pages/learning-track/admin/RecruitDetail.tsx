import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLearningTrackPhases } from "@/hooks/learning-track/useLearningTrackPhases";
import { useLearningTrackProgress } from "@/hooks/learning-track/useLearningTrackProgress";
import { PhaseSection } from "@/components/learning-track/PhaseSection";

export default function RecruitDetail() {
  const { userId } = useParams<{ userId: string }>();
  const [track, setTrack] = useState<"pre_rnf" | "post_rnf">("pre_rnf");

  const profile = useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, created_at")
        .eq("id", userId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const phasesQuery = useLearningTrackPhases(track);
  const { isCompleted } = useLearningTrackProgress(userId);

  if (profile.isLoading || phasesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="admin-recruit-page">
      <div>
        <Link
          to="/learning-track/admin/roster"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← Back to roster
        </Link>
        <h2 className="text-xl font-bold">{profile.data?.display_name || "(unnamed recruit)"}</h2>
        {profile.data?.created_at && (
          <p className="text-xs text-muted-foreground">
            Joined {new Date(profile.data.created_at).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTrack("pre_rnf")}
          className={`rounded px-3 py-1 text-sm ${
            track === "pre_rnf" ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          Pre-RNF
        </button>
        <button
          onClick={() => setTrack("post_rnf")}
          className={`rounded px-3 py-1 text-sm ${
            track === "post_rnf" ? "bg-primary text-primary-foreground" : "bg-muted"
          }`}
        >
          Post-RNF
        </button>
      </div>

      <div className="space-y-3">
        {(phasesQuery.data ?? []).map((phase) => (
          <PhaseSection
            key={phase.id}
            phase={phase}
            isCompleted={isCompleted}
            readOnly
            viewAsUserId={userId}
          />
        ))}
      </div>
    </div>
  );
}
