import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import { RequireTier } from "@/components/RequireTier";

/**
 * Route guard for /playbooks/:playbookId.
 *
 * An explicit collaborator grant (playbook_collaborators) outranks the generic
 * playbooks tier gate for THAT playbook: an owner who granted edit access has
 * made a deliberate human decision, and without this bypass the invited editor
 * was bounced off the page entirely. Everyone else falls through to the normal
 * RequireTier check. The playbooks LIST stays tier-gated — collaborators reach
 * their playbook via the link the owner shares.
 */
export function RequirePlaybookAccess({ children }: { children: React.ReactNode }) {
  const { playbookId } = useParams();
  const { user } = useSimplifiedAuth();

  const { data: isCollaborator, isLoading } = useQuery({
    queryKey: ["playbook-collab-access", playbookId, user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("playbook_collaborators" as any)
        .select("id")
        .eq("playbook_id", playbookId!)
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) return false;
      return !!data;
    },
    enabled: !!playbookId && !!user,
  });

  // Don't let RequireTier redirect before the collaborator check settles.
  if (user && playbookId && isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center py-12" aria-busy="true" aria-label="Loading access">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isCollaborator) return <>{children}</>;
  return <RequireTier feature="playbooks">{children}</RequireTier>;
}
