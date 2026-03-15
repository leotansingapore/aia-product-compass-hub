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
import { Badge } from '@/components/ui/badge';
import { GitBranch, ArrowLeft } from 'lucide-react';
import type { FlowNode, FlowEdge } from '@/hooks/useScriptFlows';

const PROPTIONS = { hideAttribution: true };

function PublicFlowViewInner() {
  const { flowId } = useParams<{ flowId: string }>();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState<string | null>(null);
  const [nodeCount, setNodeCount] = useState(0);
  const [updatedAt, setUpdatedAt] = useState('');
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
      setDescription(data.description);
      setUpdatedAt(data.updated_at);
      const dbNodes = (data.nodes as unknown as FlowNode[]) || [];
      const dbEdges = (data.edges as unknown as FlowEdge[]) || [];
      setNodeCount(dbNodes.length);
      setNodes(toReactFlowNodes(dbNodes));
      setEdges(toReactFlowEdges(dbEdges));
      setLoading(false);
    }

    fetchFlow();
  }, [flowId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-muted-foreground gap-2">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        Loading flow...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 text-muted-foreground px-4">
        <GitBranch className="h-12 w-12 opacity-30" />
        <h1 className="text-2xl font-bold text-foreground">Flow not found</h1>
        <p className="text-center">This flow may have been deleted or the link is invalid.</p>
        <a href="/" className="flex items-center gap-1.5 text-sm text-primary hover:underline mt-2">
          <ArrowLeft className="h-3.5 w-3.5" /> Go to homepage
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b bg-background px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-base sm:text-lg font-semibold text-foreground truncate">{title}</h1>
          {description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="secondary" className="text-[10px] hidden sm:flex">{nodeCount} nodes</Badge>
          {updatedAt && (
            <span className="text-[10px] text-muted-foreground hidden sm:inline">
              Updated {new Date(updatedAt).toLocaleDateString()}
            </span>
          )}
          <span className="text-xs text-muted-foreground font-medium">AIA Academy</span>
        </div>
      </div>

      {/* Hint bar for touch devices */}
      <div className="bg-muted/50 border-b px-4 py-1.5 text-[11px] text-muted-foreground text-center sm:hidden">
        Pinch to zoom, drag to pan
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
            className="!bottom-3 !right-14 !w-36 !h-24 hidden sm:block"
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
