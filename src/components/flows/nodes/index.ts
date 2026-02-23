import type { NodeTypes } from 'reactflow';
import { ScriptStartNode } from './ScriptStartNode';
import { ScriptEndNode } from './ScriptEndNode';
import { ScriptNode } from './ScriptNode';
import { DecisionNode } from './DecisionNode';
import { ActionNode } from './ActionNode';
import { HexagonNode } from './HexagonNode';
import { ParallelogramNode } from './ParallelogramNode';
import { CylinderNode } from './CylinderNode';
import { DocumentNode } from './DocumentNode';

export const scriptFlowNodeTypes: NodeTypes = {
  scriptStart: ScriptStartNode,
  scriptEnd: ScriptEndNode,
  scriptNode: ScriptNode,
  decisionNode: DecisionNode,
  actionNode: ActionNode,
  hexagonNode: HexagonNode,
  parallelogramNode: ParallelogramNode,
  cylinderNode: CylinderNode,
  documentNode: DocumentNode,
};

export { InlineNodeEditor } from './InlineNodeEditor';
export { ScriptStartNode } from './ScriptStartNode';
export { ScriptEndNode } from './ScriptEndNode';
export { ScriptNode } from './ScriptNode';
export { DecisionNode } from './DecisionNode';
export { ActionNode } from './ActionNode';
export { HexagonNode } from './HexagonNode';
export { ParallelogramNode } from './ParallelogramNode';
export { CylinderNode } from './CylinderNode';
export { DocumentNode } from './DocumentNode';
