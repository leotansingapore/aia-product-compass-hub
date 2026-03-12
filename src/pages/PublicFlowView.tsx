import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { supabase } from '@/integrations/supabase/client';
import { toReactFlowNodes, toReactFlowEdges } from '@/utils/flowDataBridge';
import { scriptFlowNodeTypes } from '@/components/flows/nodes';
import { scriptFlowEdgeTypes } from '@/components/flows/edges';
import { NODE_TYPE_DEFAULTS } from '@/utils/flowColorUtils';
import type { FlowNode, FlowEdge } from '@/hooks/useScriptFlows';

const PROPTIONS = { hideAttribution: true };

function PublicFlowViewInner() {
  const { flowId } = useParams<{ flowId: string }>();
  const [title, setTitle] = useState('');
  const [nodes, setNodes] = useState<ReturnType<typeof toReactFlowNodes>>([]);
  const [edges, setEdges] = useState<ReturnType<typeof toReactFlowEdges>>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!flowId) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    async function fetchFlow() {
      const { data, error } = await supabase
        .from('script_flows')
        .select('*')
        .eq('id', flowId!)
        .single();

      if (error || !data) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setTitle(data.title);
      const dbNodes = (data.nodes as unknown as FlowNode[]) || [];
      const dbEdges = (data.edges as unknown as FlowEdge[]) || [];
      setNodes(toReactFlowNodes(dbNodes));
      setEdges(toReactFlowEdges(dbEdges));
      setLoading(false);
    }

    fetchFlow();
  }, [flowId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground">
        Loading flow...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 text-muted-foreground">
        <h1 className="text-2xl font-bold text-foreground">Flow not found</h1>
        <p>This flow may have been deleted or the link is invalid.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b bg-background px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <span className="text-xs text-muted-foreground">Built with AIA Academy</span>
      </div>

      {/* Canvas */}
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={scriptFlowNodeTypes}
          edgeTypes={scriptFlowEdgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          proOptions={PROPTIONS}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag
          zoomOnScroll
          className="bg-muted/10"
        >
          <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(var(--muted-foreground)/0.2)" />
          <Controls showInteractive={false} className="!bottom-3 !left-auto !right-3" />
          <MiniMap
            className="!bottom-3 !right-14 !w-36 !h-24"
            nodeColor={(n) => {
              const rfType = n.type || '';
              return n.data?.color || NODE_TYPE_DEFAULTS[rfType] || '#94a3b8';
            }}
            maskColor="rgba(0,0,0,0.1)"
            pannable
            zoomable
          />
        </ReactFlow>
      </div>
    </div>
  );
}

export default function PublicFlowView() {
  return (
    <ReactFlowProvider>
      <PublicFlowViewInner />
    </ReactFlowProvider>
  );
}
