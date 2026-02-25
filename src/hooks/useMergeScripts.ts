import { useState, useCallback } from "react";
import type { ScriptEntry, ScriptVersion } from "@/hooks/useScripts";

export interface MergeState {
  sourceId: string | null;
  targetId: string | null;
  dragOverId: string | null;
  /** Touch/tap-based merge: true when user has tapped a grip to select a source */
  tapSelectMode: boolean;
}

const EMPTY_STATE: MergeState = { sourceId: null, targetId: null, dragOverId: null, tapSelectMode: false };

export function useMergeScripts(
  allScripts: ScriptEntry[],
  onSave: (scriptId: string, versions: ScriptVersion[]) => Promise<void>
) {
  const [mergeState, setMergeState] = useState<MergeState>(EMPTY_STATE);

  const [pendingMerge, setPendingMerge] = useState<{
    source: ScriptEntry;
    target: ScriptEntry;
  } | null>(null);

  // ── Drag-and-drop (desktop) ──────────────────────────────────────────────
  const startDrag = useCallback((id: string) => {
    setMergeState(prev => ({ ...prev, sourceId: id, tapSelectMode: false }));
  }, []);

  const endDrag = useCallback(() => {
    setMergeState(EMPTY_STATE);
  }, []);

  const onDragOver = useCallback((id: string) => {
    setMergeState(prev => (prev.dragOverId === id ? prev : { ...prev, dragOverId: id }));
  }, []);

  const onDragLeave = useCallback(() => {
    setMergeState(prev => ({ ...prev, dragOverId: null }));
  }, []);

  const onDrop = useCallback((targetId: string) => {
    setMergeState(prev => {
      if (!prev.sourceId || prev.sourceId === targetId) return EMPTY_STATE;
      const source = allScripts.find(s => s.id === prev.sourceId);
      const target = allScripts.find(s => s.id === targetId);
      if (source && target) setPendingMerge({ source, target });
      return EMPTY_STATE;
    });
  }, [allScripts]);

  // ── Tap-to-merge (mobile) ────────────────────────────────────────────────
  /** Tap the grip icon to enter select-mode; tap again to deselect */
  const tapSelect = useCallback((id: string) => {
    setMergeState(prev => {
      if (prev.tapSelectMode && prev.sourceId === id) {
        // Second tap on same card → cancel
        return EMPTY_STATE;
      }
      return { ...EMPTY_STATE, sourceId: id, tapSelectMode: true };
    });
  }, []);

  /** Tap any other card while in select-mode to trigger merge */
  const tapTarget = useCallback((targetId: string) => {
    setMergeState(prev => {
      if (!prev.tapSelectMode || !prev.sourceId || prev.sourceId === targetId) return prev;
      const source = allScripts.find(s => s.id === prev.sourceId);
      const target = allScripts.find(s => s.id === targetId);
      if (source && target) setPendingMerge({ source, target });
      return EMPTY_STATE;
    });
  }, [allScripts]);

  const cancelTapSelect = useCallback(() => setMergeState(EMPTY_STATE), []);

  // ── Confirm / Cancel merge ───────────────────────────────────────────────
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
    tapSelect,
    tapTarget,
    cancelTapSelect,
    confirmMerge,
    cancelMerge,
  };
}
