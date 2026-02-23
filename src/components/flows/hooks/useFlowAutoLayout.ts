import dagre from '@dagrejs/dagre';
import type { Node, Edge } from 'reactflow';

const DEFAULT_NODE_WIDTH = 180;
const DEFAULT_NODE_HEIGHT = 60;
const DECISION_NODE_WIDTH = 120;
const DECISION_NODE_HEIGHT = 80;

type Direction = 'TB' | 'LR' | 'BT' | 'RL';

/**
 * Computes an auto-layout for a set of React Flow nodes and edges using dagre.
 * Returns new arrays with updated positions -- does not mutate the originals.
 */
export function getLayoutedElements(
  nodes: Node[],
  edges: Edge[],
  direction: Direction = 'TB'
): { nodes: Node[]; edges: Edge[] } {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR' || direction === 'RL';

  g.setGraph({
    rankdir: direction,
    ranksep: 80,
    nodesep: 50,
    marginx: 20,
    marginy: 20,
  });

  for (const node of nodes) {
    const isDecision = node.type === 'decision' || node.data?.nodeType === 'decision';
    const width = isDecision ? DECISION_NODE_WIDTH : DEFAULT_NODE_WIDTH;
    const height = isDecision ? DECISION_NODE_HEIGHT : DEFAULT_NODE_HEIGHT;
    g.setNode(node.id, { width, height });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const dagreNode = g.node(node.id);
    if (!dagreNode) return node;

    const isDecision = node.type === 'decision' || node.data?.nodeType === 'decision';
    const width = isDecision ? DECISION_NODE_WIDTH : DEFAULT_NODE_WIDTH;
    const height = isDecision ? DECISION_NODE_HEIGHT : DEFAULT_NODE_HEIGHT;

    return {
      ...node,
      position: {
        x: dagreNode.x - width / 2,
        y: dagreNode.y - height / 2,
      },
      // Set sourcePosition/targetPosition based on layout direction
      sourcePosition: isHorizontal ? 'right' : 'bottom',
      targetPosition: isHorizontal ? 'left' : 'top',
    } as Node;
  });

  return { nodes: layoutedNodes, edges };
}
