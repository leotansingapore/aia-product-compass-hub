import type { NodeTypes } from 'reactflow';
import { ScriptStartNode } from './ScriptStartNode';
import { ScriptEndNode } from './ScriptEndNode';
import { ScriptNode } from './ScriptNode';
import { DecisionNode } from './DecisionNode';
import { ActionNode } from './ActionNode';

export const scriptFlowNodeTypes: NodeTypes = {
  scriptStart: ScriptStartNode,
  scriptEnd: ScriptEndNode,
  scriptNode: ScriptNode,
  decisionNode: DecisionNode,
  actionNode: ActionNode,
};

export { InlineNodeEditor } from './InlineNodeEditor';
export { ScriptStartNode } from './ScriptStartNode';
export { ScriptEndNode } from './ScriptEndNode';
export { ScriptNode } from './ScriptNode';
export { DecisionNode } from './DecisionNode';
export { ActionNode } from './ActionNode';
