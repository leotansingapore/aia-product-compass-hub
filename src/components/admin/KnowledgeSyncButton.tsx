import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export function KnowledgeSyncButton() {
  const [syncing, setSyncing] = useState(false);
  const [reembedding, setReembedding] = useState(false);

  const handleSyncAll = async () => {
    setSyncing(true);
    toast({ title: "Syncing all training videos…", description: "This may take a minute." });
    try {
      const { data, error } = await supabase.functions.invoke("process-knowledge", {
        body: { action: "sync_all_training_videos" },
      });
      if (error) throw error;
      toast({
        title: "Sync complete ✓",
        description: `${data.products_processed} products → ${data.chunks_created} chunks (${data.chunks_embedded} embedded)`,
      });
    } catch (e: any) {
      toast({ title: "Sync failed", description: e.message, variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  const handleReembed = async () => {
    setReembedding(true);
    toast({ title: "Re-embedding missing chunks…" });
    try {
      const { data, error } = await supabase.functions.invoke("process-knowledge", {
        body: { action: "reembed_missing" },
      });
      if (error) throw error;
      toast({
        title: "Re-embed complete ✓",
        description: `${data.chunks_embedded}/${data.total_missing} chunks embedded`,
      });
    } catch (e: any) {
      toast({ title: "Re-embed failed", description: e.message, variant: "destructive" });
    } finally {
      setReembedding(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleSyncAll}
        disabled={syncing || reembedding}
      >
        {syncing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Database className="h-4 w-4 mr-2" />}
        {syncing ? "Syncing…" : "Sync All Training Videos to AI"}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleReembed}
        disabled={syncing || reembedding}
      >
        {reembedding ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
        {reembedding ? "Embedding…" : "Re-embed Missing"}
      </Button>
    </div>
  );
}
