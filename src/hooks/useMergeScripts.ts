import { useState, useCallback } from "react";
import type { ScriptEntry, ScriptVersion } from "@/hooks/useScripts";

export interface MergeState {
  sourceId: string | null;
  targetId: string | null;
  dragOverId: string | null;
}

export function useMergeScripts(
  allScripts: ScriptEntry[],
  onSave: (scriptId: string, versions: ScriptVersion[]) => Promise<void>
) {
  const [mergeState, setMergeState] = useState<MergeState>({
    sourceId: null,
    targetId: null,
    dragOverId: null,
  });

  const [pendingMerge, setPendingMerge] = useState<{
    source: ScriptEntry;
    target: ScriptEntry;
  } | null>(null);

  const startDrag = useCallback((id: string) => {
    setMergeState(prev => ({ ...prev, sourceId: id }));
  }, []);

  const endDrag = useCallback(() => {
    setMergeState({ sourceId: null, targetId: null, dragOverId: null });
  }, []);

  const onDragOver = useCallback((id: string) => {
    setMergeState(prev => (prev.dragOverId === id ? prev : { ...prev, dragOverId: id }));
  }, []);

  const onDragLeave = useCallback(() => {
    setMergeState(prev => ({ ...prev, dragOverId: null }));
  }, []);

  const onDrop = useCallback((targetId: string) => {
    setMergeState(prev => {
      if (!prev.sourceId || prev.sourceId === targetId) return { sourceId: null, targetId: null, dragOverId: null };
      const source = allScripts.find(s => s.id === prev.sourceId);
      const target = allScripts.find(s => s.id === targetId);
      if (source && target) {
        setPendingMerge({ source, target });
      }
      return { sourceId: null, targetId: null, dragOverId: null };
    });
  }, [allScripts]);

  const confirmMerge = useCallback(async () => {
    if (!pendingMerge) return;
    const { source, target } = pendingMerge;
    const newVersions: ScriptVersion[] = [
      ...target.versions,
      ...source.versions.map(v => ({
        ...v,
        author: v.author ? `${v.author} (from "${source.stage}")` : `From "${source.stage}"`,
        title: v.title ? `${v.title} (from "${source.stage}")` : undefined,
      })),
    ];
    await onSave(target.id, newVersions);
    setPendingMerge(null);
  }, [pendingMerge, onSave]);

  const cancelMerge = useCallback(() => setPendingMerge(null), []);

  return {
    mergeState,
    pendingMerge,
    startDrag,
    endDrag,
    onDragOver,
    onDragLeave,
    onDrop,
    confirmMerge,
    cancelMerge,
  };
}
