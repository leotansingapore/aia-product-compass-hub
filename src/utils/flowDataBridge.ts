/**
 * Bidirectional conversion between DB format (FlowNode/FlowEdge) and React Flow format (Node/Edge).
 * Pure functions — no side effects.
 */
import type { Node, Edge, MarkerType } from 'reactflow';
import type { FlowNode, FlowEdge } from '@/hooks/useScriptFlows';

// ─── DB → React Flow ────────────────────────────────────────────

export function toReactFlowNodes(dbNodes: FlowNode[]): Node[] {
  return dbNodes.map((n) => ({
    id: n.id,
    type: mapNodeType(n.type),
    position: { x: n.x, y: n.y },
    data: {
      label: n.label,
      scriptId: n.scriptId,
      customText: n.customText,
      nodeType: n.type,
      color: n.color,
      borderStyle: n.borderStyle,
      fontSize: n.fontSize,
      opacity: n.opacity,
      shadow: n.shadow,
    },
  }));
}

export function toReactFlowEdges(dbEdges: FlowEdge[]): Edge[] {
  return dbEdges.map((e) => ({
    id: e.id,
    source: e.from,
    target: e.to,
    type: 'scriptFlowEdge',
    data: {
      label: e.label,
      condition: e.condition,
      edgeType: e.edgeType,
      lineStyle: e.lineStyle,
      animated: e.animated,
      color: e.color,
    },
    label: e.label,
  }));
}

// ─── React Flow → DB ────────────────────────────────────────────

export function fromReactFlowNodes(rfNodes: Node[]): FlowNode[] {
  return rfNodes.map((n) => ({
    id: n.id,
    label: n.data?.label || '',
    type: n.data?.nodeType || reverseMapNodeType(n.type),
    scriptId: n.data?.scriptId || null,
    customText: n.data?.customText,
    x: Math.round(n.position.x),
    y: Math.round(n.position.y),
    color: n.data?.color || undefined,
    borderStyle: n.data?.borderStyle || undefined,
    fontSize: n.data?.fontSize || undefined,
    opacity: n.data?.opacity || undefined,
    shadow: n.data?.shadow,
  }));
}

export function fromReactFlowEdges(rfEdges: Edge[]): FlowEdge[] {
  return rfEdges.map((e) => ({
    id: e.id,
    from: e.source,
    to: e.target,
    label: e.data?.label || (typeof e.label === 'string' ? e.label : undefined),
    condition: e.data?.condition,
    edgeType: e.data?.edgeType || undefined,
    lineStyle: e.data?.lineStyle || undefined,
    animated: e.data?.animated || undefined,
    color: e.data?.color || undefined,
  }));
}

// ─── Type mapping helpers ───────────────────────────────────────

function mapNodeType(dbType: FlowNode['type']): string {
  const map: Record<string, string> = {
    start: 'scriptStart',
    end: 'scriptEnd',
    script: 'scriptNode',
    decision: 'decisionNode',
    action: 'actionNode',
    hexagon: 'hexagonNode',
    parallelogram: 'parallelogramNode',
    cylinder: 'cylinderNode',
    document: 'documentNode',
  };
  return map[dbType] || 'scriptNode';
}

function reverseMapNodeType(rfType: string | undefined): FlowNode['type'] {
  const map: Record<string, FlowNode['type']> = {
    scriptStart: 'start',
    scriptEnd: 'end',
    scriptNode: 'script',
    decisionNode: 'decision',
    actionNode: 'action',
    hexagonNode: 'hexagon',
    parallelogramNode: 'parallelogram',
    cylinderNode: 'cylinder',
    documentNode: 'document',
  };
  return map[rfType || ''] || 'script';
}
