import { useCallback, useRef } from 'react';
import type { Node, Edge } from 'reactflow';

interface ClipboardData {
  nodes: Node[];
  edges: Edge[];
}

const PASTE_OFFSET = 50;

function remapIds(
  nodes: Node[],
  edges: Edge[],
  suffix: string
): { nodes: Node[]; edges: Edge[] } {
  const idMap = new Map<string, string>();

  const newNodes = nodes.map((node) => {
    const newId = `${node.id}_copy_${suffix}`;
    idMap.set(node.id, newId);
    return {
      ...node,
      id: newId,
      position: {
        x: (node.position?.x ?? 0) + PASTE_OFFSET,
        y: (node.position?.y ?? 0) + PASTE_OFFSET,
      },
      selected: false,
      data: { ...node.data },
    };
  });

  const newEdges = edges
    .filter((edge) => idMap.has(edge.source) && idMap.has(edge.target))
    .map((edge) => ({
      ...edge,
      id: `${edge.id}_copy_${suffix}`,
      source: idMap.get(edge.source)!,
      target: idMap.get(edge.target)!,
      selected: false,
      data: edge.data ? { ...edge.data } : undefined,
    }));

  return { nodes: newNodes, edges: newEdges };
}

export function useFlowClipboard() {
  const clipboardRef = useRef<ClipboardData | null>(null);

  const copyNodes = useCallback((selectedNodes: Node[], edges: Edge[]) => {
    if (selectedNodes.length === 0) return;

    const nodeIds = new Set(selectedNodes.map((n) => n.id));
    const connectedEdges = edges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
    );

    clipboardRef.current = {
      nodes: structuredClone(selectedNodes),
      edges: structuredClone(connectedEdges),
    };
  }, []);

  const pasteNodes = useCallback((): { nodes: Node[]; edges: Edge[] } | null => {
    if (!clipboardRef.current || clipboardRef.current.nodes.length === 0) {
      return null;
    }

    const suffix = Date.now().toString();
    return remapIds(clipboardRef.current.nodes, clipboardRef.current.edges, suffix);
  }, []);

  const duplicateNodes = useCallback(
    (selectedNodes: Node[], allEdges: Edge[]): { nodes: Node[]; edges: Edge[] } | null => {
      if (selectedNodes.length === 0) return null;

      const nodeIds = new Set(selectedNodes.map((n) => n.id));
      const connectedEdges = allEdges.filter(
        (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
      );

      const suffix = Date.now().toString();
      return remapIds(selectedNodes, connectedEdges, suffix);
    },
    []
  );

  return {
    copyNodes,
    pasteNodes,
    duplicateNodes,
  };
}
