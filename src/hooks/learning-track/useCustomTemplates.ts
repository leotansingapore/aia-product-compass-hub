import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type {
  LearningItemTemplate,
  TemplateCategory,
  TemplateContentBlock,
} from "@/data/learningItemTemplates";

/**
 * Custom templates stored in `learning_track_templates` table, surfaced
 * alongside the built-in ones from `learningItemTemplates.ts`. Any admin
 * can save/edit/delete — instructors curate their own library.
 */

interface CustomTemplateRow {
  id: string;
  key: string;
  label: string;
  hint: string | null;
  category: TemplateCategory;
  title: string;
  description: string | null;
  objectives: string[] | null;
  action_items: string[] | null;
  requires_submission: boolean;
  content_blocks: TemplateContentBlock[] | null;
}

export interface CustomTemplate extends LearningItemTemplate {
  id: string;
  isCustom: true;
}

function rowToTemplate(row: CustomTemplateRow): CustomTemplate {
  return {
    id: row.id,
    key: row.key,
    label: row.label,
    hint: row.hint ?? "",
    category: row.category,
    title: row.title,
    description: row.description ?? undefined,
    objectives: row.objectives ?? undefined,
    action_items: row.action_items ?? undefined,
    requires_submission: row.requires_submission,
    content_blocks: row.content_blocks ?? undefined,
    isCustom: true,
  };
}

export function useCustomTemplates() {
  return useQuery({
    queryKey: ["learning-track-custom-templates"],
    queryFn: async (): Promise<CustomTemplate[]> => {
      const { data, error } = await supabase
        .from("learning_track_templates")
        .select(
          "id, key, label, hint, category, title, description, objectives, action_items, requires_submission, content_blocks"
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => rowToTemplate(r as unknown as CustomTemplateRow));
    },
    staleTime: 60 * 1000,
  });
}

export function useSaveItemAsTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      itemId,
      label,
      hint,
      category,
    }: {
      itemId: string;
      label: string;
      hint?: string;
      category: TemplateCategory;
    }) => {
      const { data: item, error: itemErr } = await supabase
        .from("learning_track_items")
        .select("title, description, objectives, action_items, requires_submission")
        .eq("id", itemId)
        .single();
      if (itemErr) throw itemErr;

      const { data: blocks, error: blocksErr } = await supabase
        .from("learning_track_content_blocks")
        .select("block_type, title, body, url, order_index")
        .eq("item_id", itemId)
        .order("order_index", { ascending: true });
      if (blocksErr) throw blocksErr;

      const contentBlocks: TemplateContentBlock[] = (blocks ?? [])
        .filter((b) => b.block_type !== "resource_ref")
        .map((b) => ({
          block_type: b.block_type as TemplateContentBlock["block_type"],
          title: b.title ?? undefined,
          body: b.body ?? undefined,
          url: b.url ?? undefined,
        }));

      const slug = label
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      const key = `${slug}-${Date.now().toString(36)}`;

      const { error: insErr } = await supabase.from("learning_track_templates").insert({
        key,
        label,
        hint: hint ?? null,
        category,
        title: item.title,
        description: item.description,
        objectives: item.objectives,
        action_items: item.action_items,
        requires_submission: item.requires_submission,
        content_blocks: contentBlocks.length > 0 ? contentBlocks : null,
      });
      if (insErr) throw insErr;
    },
    onSuccess: () => {
      toast.success("Saved as template");
      qc.invalidateQueries({ queryKey: ["learning-track-custom-templates"] });
    },
    onError: () => toast.error("Failed to save template"),
  });
}

export function useDeleteCustomTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("learning_track_templates").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Template deleted");
      qc.invalidateQueries({ queryKey: ["learning-track-custom-templates"] });
    },
    onError: () => toast.error("Failed to delete template"),
  });
}
