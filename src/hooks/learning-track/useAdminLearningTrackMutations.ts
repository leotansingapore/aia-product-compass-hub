import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Track, BlockType } from "@/types/learning-track";
import type { LearningItemTemplate } from "@/data/learningItemTemplates";

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

export function useUpdatePhase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...fields }: {
      id: string; title?: string; description?: string | null; order_index?: number;
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

export function useDuplicateItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      sourceItemId,
      targetPhaseId,
      order_index,
    }: {
      sourceItemId: string;
      targetPhaseId?: string;
      order_index: number;
    }) => {
      const { data: source, error: srcErr } = await supabase
        .from("learning_track_items")
        .select(
          "phase_id, title, description, objectives, action_items, requires_submission, hidden_resources"
        )
        .eq("id", sourceItemId)
        .single();
      if (srcErr) throw srcErr;

      const { data: blocks, error: blocksErr } = await supabase
        .from("learning_track_content_blocks")
        .select("block_type, title, body, url, resource_type, resource_id, order_index")
        .eq("item_id", sourceItemId)
        .order("order_index", { ascending: true });
      if (blocksErr) throw blocksErr;

      const { data: item, error: itemErr } = await supabase
        .from("learning_track_items")
        .insert({
          phase_id: targetPhaseId ?? source.phase_id,
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
