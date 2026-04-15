import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Track, BlockType } from "@/types/learning-track";
import type { LearningItemTemplate } from "@/data/learningItemTemplates";
import type { ParsedItem } from "@/lib/parseLearningItemsMarkdown";

// ---- Phase mutations ----

export function useCreatePhase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ track, title, description, order_index }: {
      track: Track; title: string; description?: string; order_index: number;
    }) => {
      const { data, error } = await supabase
        .from("learning_track_phases")
        .insert({ track, title, description: description ?? null, order_index })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, v) => {
      toast.success("Phase created");
      qc.invalidateQueries({ queryKey: ["learning-track-phases", v.track] });
    },
    onError: () => toast.error("Failed to create phase"),
  });
}

export function useDuplicatePhase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sourcePhaseId,
      targetTrack,
    }: {
      sourcePhaseId: string;
      targetTrack: Track;
    }) => {
      const { data: source, error: srcErr } = await supabase
        .from("learning_track_phases")
        .select("track, title, description")
        .eq("id", sourcePhaseId)
        .single();
      if (srcErr) throw srcErr;

      const { data: existing, error: existErr } = await supabase
        .from("learning_track_phases")
        .select("order_index")
        .eq("track", targetTrack)
        .order("order_index", { ascending: false })
        .limit(1);
      if (existErr) throw existErr;
      const nextOrder = existing && existing.length > 0 ? existing[0].order_index + 1 : 0;

      const titleSuffix = source.track === targetTrack ? " (copy)" : "";
      const { data: newPhase, error: phaseErr } = await supabase
        .from("learning_track_phases")
        .insert({
          track: targetTrack,
          title: `${source.title}${titleSuffix}`,
          description: source.description,
          order_index: nextOrder,
        })
        .select("id")
        .single();
      if (phaseErr) throw phaseErr;

      // Fetch source items and their blocks
      const { data: items, error: itemsErr } = await supabase
        .from("learning_track_items")
        .select(
          "id, title, description, objectives, action_items, requires_submission, hidden_resources, order_index"
        )
        .eq("phase_id", sourcePhaseId)
        .order("order_index", { ascending: true });
      if (itemsErr) throw itemsErr;
      if (!items || items.length === 0) return newPhase;

      // Insert cloned items
      const itemInserts = items.map((it, idx) => ({
        phase_id: newPhase.id,
        title: it.title,
        description: it.description,
        objectives: it.objectives,
        action_items: it.action_items,
        requires_submission: it.requires_submission,
        hidden_resources: it.hidden_resources,
        order_index: idx,
      }));
      const { data: newItems, error: insItemsErr } = await supabase
        .from("learning_track_items")
        .insert(itemInserts)
        .select("id");
      if (insItemsErr) throw insItemsErr;

      // Fetch source blocks
      const sourceItemIds = items.map((i) => i.id);
      const { data: blocks, error: blocksErr } = await supabase
        .from("learning_track_content_blocks")
        .select("item_id, block_type, title, body, url, resource_type, resource_id, order_index")
        .in("item_id", sourceItemIds)
        .order("order_index", { ascending: true });
      if (blocksErr) throw blocksErr;

      if (blocks && blocks.length > 0 && newItems) {
        const idMap = new Map<string, string>();
        items.forEach((it, idx) => idMap.set(it.id, newItems[idx].id));
        const blockRows = blocks.map((b) => ({
          item_id: idMap.get(b.item_id)!,
          block_type: b.block_type,
          title: b.title,
          body: b.body,
          url: b.url,
          resource_type: b.resource_type,
          resource_id: b.resource_id,
          order_index: b.order_index,
        }));
        const { error: insBlocksErr } = await supabase
          .from("learning_track_content_blocks")
          .insert(blockRows);
        if (insBlocksErr) throw insBlocksErr;
      }

      return newPhase;
    },
    onSuccess: (_, v) => {
      toast.success(`Phase copied to ${v.targetTrack === "pre_rnf" ? "Pre-RNF" : "Post-RNF"}`);
      qc.invalidateQueries({ queryKey: ["learning-track-phases"] });
    },
    onError: () => toast.error("Failed to copy phase"),
  });
}

export function useUpdatePhase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...fields }: {
      id: string;
      title?: string;
      description?: string | null;
      order_index?: number;
      published_at?: string | null;
    }) => {
      const { error } = await supabase
        .from("learning_track_phases")
        .update(fields)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["learning-track-phases"] });
    },
    onError: () => toast.error("Failed to update phase"),
  });
}

export function useDeletePhase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("learning_track_phases")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Phase deleted");
      qc.invalidateQueries({ queryKey: ["learning-track-phases"] });
    },
    onError: () => toast.error("Failed to delete phase"),
  });
}

// ---- Item mutations ----

export function useCreateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ phase_id, title, order_index }: {
      phase_id: string; title: string; order_index: number;
    }) => {
      const { data, error } = await supabase
        .from("learning_track_items")
        .insert({ phase_id, title, order_index, requires_submission: false })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Item created");
      qc.invalidateQueries({ queryKey: ["learning-track-phases"] });
    },
    onError: () => toast.error("Failed to create item"),
  });
}

export function useCreateItemFromTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      phase_id,
      order_index,
      template,
      titleOverride,
    }: {
      phase_id: string;
      order_index: number;
      template: LearningItemTemplate;
      titleOverride?: string;
    }) => {
      const title = (titleOverride?.trim() || template.title).trim();

      const { data: item, error: itemError } = await supabase
        .from("learning_track_items")
        .insert({
          phase_id,
          title,
          description: template.description ?? null,
          objectives: template.objectives ?? null,
          action_items: template.action_items ?? null,
          requires_submission: template.requires_submission ?? false,
          order_index,
        })
        .select("id")
        .single();
      if (itemError) throw itemError;

      const blocks = template.content_blocks ?? [];
      if (blocks.length > 0) {
        const rows = blocks.map((b, idx) => ({
          item_id: item.id,
          block_type: b.block_type,
          title: b.title ?? null,
          body: b.body ?? null,
          url: b.url ?? null,
          order_index: idx,
        }));
        const { error: blocksError } = await supabase
          .from("learning_track_content_blocks")
          .insert(rows);
        if (blocksError) throw blocksError;
      }

      return item;
    },
    onSuccess: (_, v) => {
      toast.success(`Item created from "${v.template.label}" template`);
      qc.invalidateQueries({ queryKey: ["learning-track-phases"] });
    },
    onError: () => toast.error("Failed to create item from template"),
  });
}

export function useUpdateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...fields }: {
      id: string;
      title?: string;
      description?: string | null;
      objectives?: string[] | null;
      action_items?: string[] | null;
      requires_submission?: boolean;
      order_index?: number;
      published_at?: string | null;
    }) => {
      const { error } = await supabase
        .from("learning_track_items")
        .update(fields)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["learning-track-phases"] });
    },
    onError: () => toast.error("Failed to update item"),
  });
}

export function useMoveItemToPhase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, targetPhaseId }: { itemId: string; targetPhaseId: string }) => {
      // Get the max order_index in the target phase
      const { data: existing } = await supabase
        .from("learning_track_items")
        .select("order_index")
        .eq("phase_id", targetPhaseId)
        .order("order_index", { ascending: false })
        .limit(1);
      const nextOrder = existing && existing.length > 0 ? (existing[0] as any).order_index + 1 : 0;
      const { error } = await supabase
        .from("learning_track_items")
        .update({ phase_id: targetPhaseId, order_index: nextOrder })
        .eq("id", itemId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Item moved");
      qc.invalidateQueries({ queryKey: ["learning-track-phases"] });
    },
    onError: () => toast.error("Failed to move item"),
  });
}

export function useDeleteItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("learning_track_items")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Item deleted");
      qc.invalidateQueries({ queryKey: ["learning-track-phases"] });
    },
    onError: () => toast.error("Failed to delete item"),
  });
}

export function useBulkImportItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      phase_id,
      items,
    }: {
      phase_id: string;
      items: ParsedItem[];
    }) => {
      if (items.length === 0) return { inserted: 0 };

      const { data: existing, error: existErr } = await supabase
        .from("learning_track_items")
        .select("order_index")
        .eq("phase_id", phase_id)
        .order("order_index", { ascending: false })
        .limit(1);
      if (existErr) throw existErr;
      const startOrder = existing && existing.length > 0 ? existing[0].order_index + 1 : 0;

      const itemInserts = items.map((it, idx) => ({
        phase_id,
        title: it.title,
        description: it.description ?? null,
        objectives: it.objectives.length > 0 ? it.objectives : null,
        action_items: it.action_items.length > 0 ? it.action_items : null,
        requires_submission: false,
        order_index: startOrder + idx,
      }));

      const { data: inserted, error: insErr } = await supabase
        .from("learning_track_items")
        .insert(itemInserts)
        .select("id");
      if (insErr) throw insErr;
      if (!inserted) return { inserted: 0 };

      const blockRows: Array<{
        item_id: string;
        block_type: "text" | "link" | "video";
        title: string | null;
        body: string | null;
        url: string | null;
        order_index: number;
      }> = [];
      items.forEach((it, idx) => {
        it.content_blocks.forEach((b, bIdx) => {
          blockRows.push({
            item_id: inserted[idx].id,
            block_type: b.block_type,
            title: b.title ?? null,
            body: b.body ?? null,
            url: b.url ?? null,
            order_index: bIdx,
          });
        });
      });

      if (blockRows.length > 0) {
        const { error: blocksErr } = await supabase
          .from("learning_track_content_blocks")
          .insert(blockRows);
        if (blocksErr) throw blocksErr;
      }

      return { inserted: inserted.length };
    },
    onSuccess: (res) => {
      toast.success(`Imported ${res.inserted} item${res.inserted === 1 ? "" : "s"}`);
      qc.invalidateQueries({ queryKey: ["learning-track-phases"] });
    },
    onError: () => toast.error("Failed to import items"),
  });
}

export function useDuplicateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sourceItemId,
      targetPhaseId,
    }: {
      sourceItemId: string;
      targetPhaseId?: string;
    }) => {
      const { data: source, error: srcErr } = await supabase
        .from("learning_track_items")
        .select(
          "phase_id, title, description, objectives, action_items, requires_submission, hidden_resources"
        )
        .eq("id", sourceItemId)
        .single();
      if (srcErr) throw srcErr;

      // Append at end of destination phase — avoids unique (phase_id, order_index) collision.
      const destPhaseId = targetPhaseId ?? source.phase_id;
      const { data: siblings, error: sibErr } = await supabase
        .from("learning_track_items")
        .select("order_index")
        .eq("phase_id", destPhaseId)
        .order("order_index", { ascending: false })
        .limit(1);
      if (sibErr) throw sibErr;
      const order_index = siblings && siblings.length > 0 ? siblings[0].order_index + 1 : 0;

      const { data: blocks, error: blocksErr } = await supabase
        .from("learning_track_content_blocks")
        .select("block_type, title, body, url, resource_type, resource_id, order_index")
        .eq("item_id", sourceItemId)
        .order("order_index", { ascending: true });
      if (blocksErr) throw blocksErr;

      const { data: item, error: itemErr } = await supabase
        .from("learning_track_items")
        .insert({
          phase_id: destPhaseId,
          title: `${source.title} (copy)`,
          description: source.description,
          objectives: source.objectives,
          action_items: source.action_items,
          requires_submission: source.requires_submission,
          hidden_resources: source.hidden_resources,
          order_index,
        })
        .select("id")
        .single();
      if (itemErr) throw itemErr;

      if (blocks && blocks.length > 0) {
        const rows = blocks.map((b, idx) => ({
          item_id: item.id,
          block_type: b.block_type,
          title: b.title,
          body: b.body,
          url: b.url,
          resource_type: b.resource_type,
          resource_id: b.resource_id,
          order_index: idx,
        }));
        const { error: insErr } = await supabase
          .from("learning_track_content_blocks")
          .insert(rows);
        if (insErr) throw insErr;
      }

      return item;
    },
    onSuccess: () => {
      toast.success("Item duplicated");
      qc.invalidateQueries({ queryKey: ["learning-track-phases"] });
    },
    onError: () => toast.error("Failed to duplicate item"),
  });
}

export function useReorderItems() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (items: { id: string; order_index: number }[]) => {
      // First, move all items to temporary high order_index values to avoid
      // unique constraint violations on (phase_id, order_index)
      const tempPromises = items.map(({ id }, i) =>
        supabase.from("learning_track_items").update({ order_index: 100000 + i }).eq("id", id)
      );
      const tempResults = await Promise.all(tempPromises);
      const tempFailed = tempResults.find((r) => r.error);
      if (tempFailed?.error) throw tempFailed.error;

      // Now set the final order_index values
      const finalPromises = items.map(({ id, order_index }) =>
        supabase.from("learning_track_items").update({ order_index }).eq("id", id)
      );
      const results = await Promise.all(finalPromises);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["learning-track-phases"] });
    },
    onError: () => toast.error("Failed to reorder items"),
  });
}

// ---- Content block mutations ----

export function useCreateContentBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ item_id, block_type, title, body, url, order_index }: {
      item_id: string; block_type: BlockType; title?: string; body?: string;
      url?: string; order_index: number;
    }) => {
      const { data, error } = await supabase
        .from("learning_track_content_blocks")
        .insert({
          item_id,
          block_type,
          title: title ?? null,
          body: body ?? null,
          url: url ?? null,
          order_index,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Content block added");
      qc.invalidateQueries({ queryKey: ["learning-track-phases"] });
    },
    onError: () => toast.error("Failed to add content block"),
  });
}

export function useUpdateContentBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...fields }: {
      id: string; title?: string | null; body?: string | null; url?: string | null;
    }) => {
      const { error } = await supabase
        .from("learning_track_content_blocks")
        .update(fields)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["learning-track-phases"] });
    },
    onError: () => toast.error("Failed to update content block"),
  });
}

export function useDeleteContentBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("learning_track_content_blocks")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Content block removed");
      qc.invalidateQueries({ queryKey: ["learning-track-phases"] });
    },
    onError: () => toast.error("Failed to remove content block"),
  });
}
