import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Plus, GitBranch, Trash2, Layout, ArrowLeft, Circle, Diamond, Zap, Square, FileText, Save, Undo2 } from 'lucide-react';
import { useScriptFlows, type FlowNode, type FlowEdge } from '@/hooks/useScriptFlows';
import { useScripts } from '@/hooks/useScripts';
import { FlowCanvas } from '@/components/flows/FlowCanvas';
import { NodeEditorDialog } from '@/components/flows/NodeEditorDialog';
import { EdgeEditorDialog } from '@/components/flows/EdgeEditorDialog';
import { FLOW_TEMPLATES } from '@/utils/flowTemplates';
import { toast } from 'sonner';

const NODE_TYPE_OPTIONS: { type: FlowNode['type']; label: string; icon: React.ReactNode; desc: string }[] = [
  { type: 'script', label: 'Script', icon: <FileText className="h-4 w-4" />, desc: 'Link to a script card' },
  { type: 'decision', label: 'Decision', icon: <Diamond className="h-4 w-4" />, desc: 'Yes/No branching point' },
  { type: 'action', label: 'Action', icon: <Zap className="h-4 w-4" />, desc: 'Wait or follow-up step' },
  { type: 'end', label: 'End', icon: <Square className="h-4 w-4" />, desc: 'End of the flow' },
];

function FlowListView({ flows, onSelect, onCreateNew, onCreateFromTemplate, onDelete, userId }: {
  flows: ReturnType<typeof useScriptFlows>['flows'];
  onSelect: (id: string) => void;
  onCreateNew: () => void;
  onCreateFromTemplate: (templateIndex: number) => void;
  onDelete: (id: string) => void;
  userId?: string;
}) {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">My Flows</h2>
          <Button onClick={onCreateNew} size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> New Flow
          </Button>
        </div>
        {flows.filter(f => !f.is_template).length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
              <GitBranch className="h-10 w-10 mx-auto mb-3 opacity-40" />
              <p className="font-medium">No flows yet</p>
              <p className="text-sm mt-1">Create a new flow or start from a template below</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {flows.filter(f => !f.is_template).map(flow => (
              <Card key={flow.id} className="cursor-pointer hover:border-primary/50 transition-colors group" onClick={() => onSelect(flow.id)}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm">{flow.title}</CardTitle>
                    {userId === flow.created_by && (
                      <button
                        onClick={e => { e.stopPropagation(); onDelete(flow.id); }}
                        className="opacity-0 group-hover:opacity-100 text-destructive hover:bg-destructive/10 p-1 rounded transition-all"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                  <CardDescription className="text-xs line-clamp-2">{flow.description || 'No description'}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px]">{flow.nodes.length} nodes</Badge>
                    <Badge variant="secondary" className="text-[10px]">{flow.edges.length} connections</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Templates</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FLOW_TEMPLATES.map((tpl, i) => (
            <Card key={i} className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => onCreateFromTemplate(i)}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Layout className="h-4 w-4 text-primary" />
                  <CardTitle className="text-sm">{tpl.title}</CardTitle>
                </div>
                <CardDescription className="text-xs">{tpl.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-1.5">
                  <Badge variant="outline" className="text-[10px]">{tpl.category}</Badge>
                  <Badge variant="secondary" className="text-[10px]">{tpl.nodes.length} steps</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ScriptFlows() {
  const navigate = useNavigate();
  const { flows, isLoading, createFlow, updateFlow, deleteFlow, userId } = useScriptFlows();
  const { scripts } = useScripts();

  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [localNodes, setLocalNodes] = useState<FlowNode[]>([]);
  const [localEdges, setLocalEdges] = useState<FlowEdge[]>([]);
  const [flowTitle, setFlowTitle] = useState('');
  const [flowDescription, setFlowDescription] = useState('');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<FlowNode | null>(null);
  const [editingEdge, setEditingEdge] = useState<FlowEdge | null>(null);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [addNodeOpen, setAddNodeOpen] = useState(false);

  const openFlow = useCallback((id: string) => {
    const flow = flows.find(f => f.id === id);
    if (!flow) return;
    setActiveFlowId(id);
    setLocalNodes([...flow.nodes]);
    setLocalEdges([...flow.edges]);
    setFlowTitle(flow.title);
    setFlowDescription(flow.description || '');
    setHasUnsaved(false);
    setSelectedNodeId(null);
  }, [flows]);

  const createFromTemplate = useCallback(async (index: number) => {
    const tpl = FLOW_TEMPLATES[index];
    const result = await createFlow.mutateAsync({
      title: tpl.title, description: tpl.description,
      nodes: tpl.nodes, edges: tpl.edges,
    });
    if (result) {
      setTimeout(() => {
        const created = flows.find(f => f.id === (result as any).id);
        if (created) openFlow(created.id);
        else {
          setActiveFlowId((result as any).id);
          setLocalNodes([...tpl.nodes]);
          setLocalEdges([...tpl.edges]);
          setFlowTitle(tpl.title);
          setFlowDescription(tpl.description);
          setHasUnsaved(false);
        }
      }, 500);
    }
  }, [createFlow, flows, openFlow]);

  const handleCreateNew = async () => {
    if (!newTitle.trim()) return;
    const startNode: FlowNode = { id: 'n1', scriptId: null, label: 'Start', type: 'start', x: 400, y: 50 };
    const result = await createFlow.mutateAsync({ title: newTitle, description: newDesc, nodes: [startNode], edges: [] });
    setShowNewDialog(false);
    setNewTitle('');
    setNewDesc('');
    if (result) {
      setActiveFlowId((result as any).id);
      setLocalNodes([startNode]);
      setLocalEdges([]);
      setFlowTitle(newTitle);
      setFlowDescription(newDesc);
      setHasUnsaved(false);
    }
  };

  const handleSave = async () => {
    if (!activeFlowId) return;
    await updateFlow.mutateAsync({ id: activeFlowId, title: flowTitle, description: flowDescription, nodes: localNodes, edges: localEdges });
    setHasUnsaved(false);
  };

  const addNodeOfType = (type: FlowNode['type'], x?: number, y?: number) => {
    const id = `n${Date.now()}`;
    const labels: Record<string, string> = { script: 'New Script', decision: 'Decision?', action: 'Follow-up', end: 'End', start: 'Start' };
    const newNode: FlowNode = {
      id, scriptId: null, label: labels[type] || 'New Step', type,
      x: x ?? 300 + Math.random() * 200,
      y: y ?? 200 + Math.random() * 200,
    };
    setLocalNodes(prev => [...prev, newNode]);
    setSelectedNodeId(id);
    setEditingNode(newNode);
    setHasUnsaved(true);
    setAddNodeOpen(false);
  };

  const handleDoubleClickCanvas = useCallback((x: number, y: number) => {
    // Quick-add a script node at the clicked position
    const id = `n${Date.now()}`;
    const newNode: FlowNode = { id, scriptId: null, label: 'New Step', type: 'script', x: x - 90, y: y - 28 };
    setLocalNodes(prev => [...prev, newNode]);
    setSelectedNodeId(id);
    setEditingNode(newNode);
    setHasUnsaved(true);
  }, []);

  const handleMoveNode = useCallback((id: string, x: number, y: number) => {
    setLocalNodes(prev => prev.map(n => n.id === id ? { ...n, x, y } : n));
    setHasUnsaved(true);
  }, []);

  const handleDeleteNode = () => {
    if (!selectedNodeId) return;
    setLocalNodes(prev => prev.filter(n => n.id !== selectedNodeId));
    setLocalEdges(prev => prev.filter(e => e.from !== selectedNodeId && e.to !== selectedNodeId));
    setSelectedNodeId(null);
    setHasUnsaved(true);
  };

  const handleCompleteConnect = useCallback((toId: string) => {
    if (!connectingFrom || connectingFrom === toId) {
      setConnectingFrom(null);
      return;
    }
    const exists = localEdges.some(e => e.from === connectingFrom && e.to === toId);
    if (!exists) {
      const newEdge: FlowEdge = { id: `e${Date.now()}`, from: connectingFrom, to: toId };
      setLocalEdges(prev => [...prev, newEdge]);
      setEditingEdge(newEdge);
      setHasUnsaved(true);
    }
    setConnectingFrom(null);
  }, [connectingFrom, localEdges]);

  const handleNodeSave = (updates: Partial<FlowNode>) => {
    if (editingNode) {
      setLocalNodes(prev => prev.map(n => n.id === editingNode.id ? { ...n, ...updates } : n));
      setHasUnsaved(true);
    }
  };

  const handleEdgeSave = (updates: Partial<FlowEdge>) => {
    if (editingEdge) {
      setLocalEdges(prev => prev.map(e => e.id === editingEdge.id ? { ...e, ...updates } : e));
      setHasUnsaved(true);
    }
  };

  const handleDeleteEdge = () => {
    if (!editingEdge) return;
    setLocalEdges(prev => prev.filter(e => e.id !== editingEdge.id));
    setEditingEdge(null);
    setHasUnsaved(true);
  };

  const selectedNode = localNodes.find(n => n.id === selectedNodeId) || null;

  if (activeFlowId) {
    return (
      <TooltipProvider>
        <PageLayout title={flowTitle} description="Script Flow Builder">
          <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex items-center gap-2 flex-wrap bg-muted/30 border rounded-lg px-3 py-2">
              <Button variant="ghost" size="sm" onClick={() => { setActiveFlowId(null); setSelectedNodeId(null); }}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>

              <div className="w-px h-6 bg-border" />

              {/* Quick-add node palette */}
              <Popover open={addNodeOpen} onOpenChange={setAddNodeOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Plus className="h-3.5 w-3.5" /> Add Node
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="start">
                  <p className="text-xs text-muted-foreground px-2 pb-2 font-medium">Choose node type</p>
                  {NODE_TYPE_OPTIONS.map(opt => (
                    <button
                      key={opt.type}
                      onClick={() => addNodeOfType(opt.type)}
                      className="flex items-center gap-3 w-full px-2 py-2 rounded-md text-sm hover:bg-muted transition-colors text-left"
                    >
                      <span className="text-primary">{opt.icon}</span>
                      <div>
                        <div className="font-medium text-sm">{opt.label}</div>
                        <div className="text-[11px] text-muted-foreground">{opt.desc}</div>
                      </div>
                    </button>
                  ))}
                </PopoverContent>
              </Popover>

              {/* Selected node actions */}
              {selectedNode && (
                <>
                  <div className="w-px h-6 bg-border" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setEditingNode(selectedNode)} className="gap-1">
                        ✏️ Edit
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit selected node (or double-click)</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive gap-1" onClick={handleDeleteNode}>
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete selected node</TooltipContent>
                  </Tooltip>
                  <Badge variant="secondary" className="text-[10px] ml-1">
                    Selected: {selectedNode.label}
                  </Badge>
                </>
              )}

              <div className="flex-1" />

              {/* Save */}
              <Button size="sm" onClick={handleSave} disabled={!hasUnsaved || updateFlow.isPending} className="gap-1.5">
                <Save className="h-3.5 w-3.5" />
                {updateFlow.isPending ? 'Saving...' : hasUnsaved ? 'Save' : 'Saved ✓'}
              </Button>
            </div>

            {/* Title */}
            <Input value={flowTitle} onChange={e => { setFlowTitle(e.target.value); setHasUnsaved(true); }} className="font-semibold text-base max-w-md" placeholder="Flow title" />

            {/* Selected node info panel */}
            {selectedNode && (
              <div className="flex items-center gap-3 bg-muted/40 border rounded-lg px-4 py-2.5 text-sm">
                <span className="font-medium truncate">{selectedNode.label}</span>
                <Badge variant="outline" className="text-[10px] shrink-0">{selectedNode.type}</Badge>
                {selectedNode.scriptId ? (() => {
                  const linked = scripts.find(s => s.id === selectedNode.scriptId);
                  return linked ? (
                    <>
                      <span className="text-muted-foreground text-xs">→</span>
                      <span className="text-xs text-muted-foreground truncate">📄 {linked.stage}</span>
                      <Button
                        variant="outline" size="sm" className="ml-auto shrink-0 gap-1.5 text-xs h-7"
                        onClick={() => navigate(`/scripts?highlight=${selectedNode.scriptId}`)}
                      >
                        <FileText className="h-3 w-3" /> View Script
                      </Button>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Linked script not found</span>
                  );
                })() : (
                  <span className="text-xs text-muted-foreground italic">No linked script — double-click to edit</span>
                )}
              </div>
            )}

            {/* Canvas */}
            <div className="h-[calc(100vh-260px)] min-h-[400px]">
              <FlowCanvas
                nodes={localNodes}
                edges={localEdges}
                scripts={scripts}
                selectedNodeId={selectedNodeId}
                onSelectNode={id => { setSelectedNodeId(id); if (connectingFrom && !id) setConnectingFrom(null); }}
                onMoveNode={handleMoveNode}
                onStartConnect={setConnectingFrom}
                connectingFrom={connectingFrom}
                onCompleteConnect={handleCompleteConnect}
                onDoubleClickNode={node => setEditingNode(node)}
                onDoubleClickEdge={edge => setEditingEdge(edge)}
                onDoubleClickCanvas={handleDoubleClickCanvas}
              />
            </div>

            {/* Edge list */}
            {localEdges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-xs text-muted-foreground py-1">Connections:</span>
                {localEdges.map(e => {
                  const from = localNodes.find(n => n.id === e.from);
                  const to = localNodes.find(n => n.id === e.to);
                  return (
                    <Badge key={e.id} variant="outline" className="text-[10px] cursor-pointer hover:bg-muted gap-1" onClick={() => setEditingEdge(e)}>
                      {from?.label || '?'} → {to?.label || '?'} {e.label ? `(${e.label})` : ''}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          <NodeEditorDialog open={!!editingNode} onClose={() => setEditingNode(null)} onSave={handleNodeSave} node={editingNode} scripts={scripts} />
          <EdgeEditorDialog open={!!editingEdge} onClose={() => setEditingEdge(null)} onSave={handleEdgeSave} edge={editingEdge} />
        </PageLayout>
      </TooltipProvider>
    );
  }

  return (
    <PageLayout title="Script Flows" description="Build visual flowcharts for your sales and prospecting processes">
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading flows...</div>
      ) : (
        <FlowListView
          flows={flows} onSelect={openFlow} onCreateNew={() => setShowNewDialog(true)}
          onCreateFromTemplate={createFromTemplate} onDelete={id => deleteFlow.mutate(id)} userId={userId}
        />
      )}

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Create New Flow</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. My Prospecting Flow" />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What is this flow for?" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateNew} disabled={!newTitle.trim() || createFlow.isPending}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
