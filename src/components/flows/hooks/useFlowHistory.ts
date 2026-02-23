import { useCallback, useRef, useState } from 'react';
import type { Node, Edge } from 'reactflow';

interface HistoryEntry {
  nodes: Node[];
  edges: Edge[];
  description: string;
}

const MAX_HISTORY = 50;

export function useFlowHistory() {
  const pastRef = useRef<HistoryEntry[]>([]);
  const futureRef = useRef<HistoryEntry[]>([]);
  const [revision, setRevision] = useState(0);

  const bump = useCallback(() => setRevision((r) => r + 1), []);

  const takeSnapshot = useCallback(
    (nodes: Node[], edges: Edge[], description: string) => {
      const entry: HistoryEntry = {
        nodes: structuredClone(nodes),
        edges: structuredClone(edges),
        description,
      };
      pastRef.current = [...pastRef.current.slice(-(MAX_HISTORY - 1)), entry];
      futureRef.current = [];
      bump();
    },
    [bump]
  );

  const undo = useCallback((): HistoryEntry | null => {
    if (pastRef.current.length === 0) return null;

    const previous = pastRef.current[pastRef.current.length - 1];
    pastRef.current = pastRef.current.slice(0, -1);
    futureRef.current = [...futureRef.current, previous];
    bump();

    // Return the state we should restore to (the one before the popped entry)
    const restoreTo = pastRef.current[pastRef.current.length - 1] ?? null;
    return restoreTo;
  }, [bump]);

  const redo = useCallback((): HistoryEntry | null => {
    if (futureRef.current.length === 0) return null;

    const next = futureRef.current[futureRef.current.length - 1];
    futureRef.current = futureRef.current.slice(0, -1);
    pastRef.current = [...pastRef.current, next];
    bump();

    return next;
  }, [bump]);

  const clear = useCallback(() => {
    pastRef.current = [];
    futureRef.current = [];
    bump();
  }, [bump]);

  // Read revision to subscribe to updates (forces re-render when stacks change)
  void revision;

  return {
    takeSnapshot,
    undo,
    redo,
    canUndo: pastRef.current.length > 0,
    canRedo: futureRef.current.length > 0,
    clear,
  };
}
