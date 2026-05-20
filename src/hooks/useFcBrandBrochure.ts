import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSimplifiedAuth } from "@/hooks/useSimplifiedAuth";
import type { Database } from "@/integrations/supabase/types";

type BrochureRow = Database["public"]["Tables"]["fc_brand_brochures"]["Row"];

const SOURCE_BUCKET = "fc-headshots-source";
const GENERATED_BUCKET = "fc-headshots-generated";
const BROCHURE_BUCKET = "fc-brochures";

const QUERY_KEY = "fc-brand-brochure-latest";

async function fetchLatest(userId: string): Promise<BrochureRow | null> {
  const { data, error } = await supabase
    .from("fc_brand_brochures")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function signedUrlsFor(bucket: string, paths: string[]): Promise<string[]> {
  if (!paths.length) return [];
  const { data, error } = await supabase.storage.from(bucket).createSignedUrls(paths, 3600);
  if (error) throw error;
  return (data ?? []).map(d => d.signedUrl);
}

export function useFcBrandBrochure() {
  const { user } = useSimplifiedAuth();
  const userId = user?.id ?? null;
  const queryClient = useQueryClient();

  const latestQuery = useQuery({
    queryKey: [QUERY_KEY, userId],
    queryFn: () => fetchLatest(userId!),
    enabled: !!userId,
    // Poll while a job is in flight so the UI updates without a manual refresh.
    refetchInterval: (query) => {
      const row = query.state.data as BrochureRow | null | undefined;
      if (row && (row.status === "queued" || row.status === "generating")) return 8000;
      return false;
    },
  });

  const row = latestQuery.data ?? null;

  // Resolve signed URLs for the generated headshots whenever the row updates.
  const generatedUrlsQuery = useQuery({
    queryKey: ["fc-brand-brochure-generated-urls", row?.id, row?.headshot_generated_paths?.join(",")],
    queryFn: () => signedUrlsFor(GENERATED_BUCKET, row?.headshot_generated_paths ?? []),
    enabled: !!row && (row.headshot_generated_paths?.length ?? 0) > 0,
    staleTime: 55 * 60 * 1000,
  });

  const uploadPhoto = useCallback(
    async (file: File, idx: number): Promise<string> => {
      if (!userId) throw new Error("not signed in");
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `${userId}/staging/${Date.now()}_${idx}.${ext}`;
      const { error } = await supabase.storage.from(SOURCE_BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || "image/jpeg",
      });
      if (error) throw error;
      return path;
    },
    [userId],
  );

  const enqueueMutation = useMutation({
    mutationFn: async (args: { sourcePaths: string[]; brandBrief: unknown; styleVibe?: string }) => {
      if (!userId) throw new Error("not signed in");
      if (args.sourcePaths.length < 5) throw new Error("need at least 5 source photos");
      const { data, error } = await supabase
        .from("fc_brand_brochures")
        .insert({
          user_id: userId,
          brand_brief_snapshot: args.brandBrief as never,
          headshot_source_paths: args.sourcePaths,
          style_vibe: args.styleVibe ?? null,
          status: "queued",
        })
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, userId] });
    },
  });

  const selectVariantMutation = useMutation({
    mutationFn: async (args: { rowId: string; selectedPath: string }) => {
      const { data, error } = await supabase
        .from("fc_brand_brochures")
        .update({ headshot_selected_path: args.selectedPath })
        .eq("id", args.rowId)
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, userId] });
    },
  });

  const markRenderedMutation = useMutation({
    mutationFn: async (args: { rowId: string; pdfPath: string }) => {
      const { data, error } = await supabase
        .from("fc_brand_brochures")
        .update({
          brochure_pdf_path: args.pdfPath,
          status: "rendered",
          rendered_at: new Date().toISOString(),
        })
        .eq("id", args.rowId)
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, userId] });
    },
  });

  const uploadBrochurePdf = useCallback(
    async (rowId: string, blob: Blob): Promise<string> => {
      if (!userId) throw new Error("not signed in");
      const path = `${userId}/${rowId}/brochure.pdf`;
      const { error } = await supabase.storage.from(BROCHURE_BUCKET).upload(path, blob, {
        cacheControl: "3600",
        upsert: true,
        contentType: "application/pdf",
      });
      if (error) throw error;
      return path;
    },
    [userId],
  );

  const variants = useMemo(() => {
    const paths = row?.headshot_generated_paths ?? [];
    const urls = generatedUrlsQuery.data ?? [];
    return paths.map((path, i) => ({
      path,
      url: urls[i] ?? null,
      // Match the style ids the worker writes: "<id>.png"
      styleId: (path.split("/").pop() || "").replace(/\.[^.]+$/, ""),
    }));
  }, [row, generatedUrlsQuery.data]);

  return {
    row,
    isLoading: latestQuery.isLoading,
    isPolling: row?.status === "queued" || row?.status === "generating",
    variants,
    selectedPath: row?.headshot_selected_path ?? null,
    uploadPhoto,
    enqueue: enqueueMutation.mutateAsync,
    enqueueState: enqueueMutation,
    selectVariant: selectVariantMutation.mutateAsync,
    markRendered: markRenderedMutation.mutateAsync,
    uploadBrochurePdf,
  };
}
