import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface ProductSyncButtonProps {
  productId: string;
  productName: string;
  onDarkSurface?: boolean;
}

export function ProductSyncButton({ productId, productName, onDarkSurface }: ProductSyncButtonProps) {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    toast({ title: `Syncing "${productName}" to AI…`, description: "This may take a moment." });
    try {
      const { data, error } = await supabase.functions.invoke("process-knowledge", {
        body: { action: "sync_training_videos", product_id: productId },
      });
      if (error) throw error;
      toast({
        title: "Sync complete ✓",
        description: `${data.chunks_created ?? 0} chunks created (${data.chunks_embedded ?? 0} embedded)`,
      });
    } catch (e: any) {
      toast({ title: "Sync failed", description: e.message, variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <Button
      variant={onDarkSurface ? "heroOutline" : "outline"}
      size="sm"
      onClick={handleSync}
      disabled={syncing}
      className={cn(onDarkSurface && "font-medium")}
    >
      {syncing ? <RefreshCw className="h-4 w-4 mr-1.5 animate-spin" /> : <Database className="h-4 w-4 mr-1.5" />}
      {syncing ? "Syncing…" : "Sync to AI"}
    </Button>
  );
}
