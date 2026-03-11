import { useState, useCallback, useRef, useEffect } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Plus, GitBranch, Trash2, Layout, ArrowLeft, Save, Undo2, Redo2, Keyboard, Sparkles, Link, Grid3x3, FileText, X, ChevronDown, ChevronUp } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { useScriptFlows, type FlowNode, type FlowEdge } from '@/hooks/useScriptFlows';
import { useScripts } from '@/hooks/useScripts';
import ReactFlowCanvas, { type FlowCanvasControls } from '@/components/flows/ReactFlowCanvas';
import { NodeEditorDialog } from '@/components/flows/NodeEditorDialog';
import { EdgeEditorDialog } from '@/components/flows/EdgeEditorDialog';
import { AutoLayoutControls } from '@/components/flows/controls/AutoLayoutControls';
import { ExportControls } from '@/components/flows/controls/ExportControls';
import { KeyboardShortcutsHelp } from '@/components/flows/controls/KeyboardShortcutsHelp';
import { FLOW_TEMPLATES } from '@/utils/flowTemplates';
import { AIFlowWizard } from '@/components/flows/AIFlowWizard';
import { AIFlowChat } from '@/components/flows/AIFlowChat';
import { NodeSearch } from '@/components/flows/controls/NodeSearch';
import DOMPurify from 'dompurify';
import { toast } from 'sonner';
import { ScriptsTabBar } from '@/components/scripts/ScriptsTabBar';
import { useNavigate, useParams } from 'react-router-dom';

function FlowListView({ flows, onSelect, onCreateNew, onCreateFromTemplate, onDelete, userId, onOpenAIWizard }: {
  flows: ReturnType<typeof useScriptFlows>['flows'];
  onSelect: (id: string) => void;
  onCreateNew: () => void;
  onCreateFromTemplate: (templateIndex: number) => void;
  onDelete: (id: string) => void;
  userId?: string;
  onOpenAIWizard: () => void;
}) {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <h2 className="text-base sm:text-lg font-semibold">My Flows</h2>
          <div className="flex items-center gap-2">
            <Button onClick={onOpenAIWizard} size="sm" variant="outline" className="gap-1.5 h-8 sm:h-9 text-xs sm:text-sm">
              <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline">AI </span>Builder
            </Button>
            <Button onClick={onCreateNew} size="sm" className="gap-1.5 h-8 sm:h-9 text-xs sm:text-sm">
              <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>New Flow</span>
            </Button>
          </div>
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
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {flows.filter(f => !f.is_template).map(flow => (
              <Card key={flow.id} className="cursor-pointer hover:border-primary/50 transition-colors group" onClick={() => onSelect(flow.id)}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-sm">{flow.title}</CardTitle>
                    {userId === flow.created_by && (
                      <button
                        onClick={e => { e.stopPropagation(); onDelete(flow.id); }}
                        className="sm:opacity-0 sm:group-hover:opacity-100 text-destructive hover:bg-destructive/10 p-1 rounded transition-all"
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
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Templates</h2>
        <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
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
  const { flows, isLoading, createFlow, updateFlow, deleteFlow, userId } = useScriptFlows();
  const { scripts } = useScripts();
  const navigate = useNavigate();
  const { flowId: urlFlowId } = useParams<{ flowId: string }>();

  // Derive activeFlowId from URL param — fall back to null (list view)
  const activeFlowId = urlFlowId || null;

  const [localNodes, setLocalNodes] = useState<FlowNode[]>([]);
  const [localEdges, setLocalEdges] = useState<FlowEdge[]>([]);
  const [flowTitle, setFlowTitle] = useState('');
  const [flowDescription, setFlowDescription] = useState('');
  const [editingNode, setEditingNode] = useState<FlowNode | null>(null);
  const [editingEdge, setEditingEdge] = useState<FlowEdge | null>(null);
  const [previewingNode, setPreviewingNode] = useState<FlowNode | null>(null);
  const [expandedVersion, setExpandedVersion] = useState(0);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAIWizard, setShowAIWizard] = useState(false);

  const controlsRef = useRef<FlowCanvasControls | null>(null);

  // Sync local state when active flow changes (URL-driven)
  useEffect(() => {
    if (!activeFlowId) return;
    const flow = flows.find(f => f.id === activeFlowId);
    if (!flow) return;
    setLocalNodes([...flow.nodes]);
    setLocalEdges([...flow.edges]);
    setFlowTitle(flow.title);
    setFlowDescription(flow.description || '');
    setHasUnsaved(false);
  }, [activeFlowId, flows.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const openFlow = useCallback((id: string) => {
    navigate(`/flows/${id}`);
  }, [navigate]);

  const closeFlow = useCallback(() => {
    navigate('/flows');
  }, [navigate]);

  const createFromTemplate = useCallback(async (index: number) => {
    const tpl = FLOW_TEMPLATES[index];
    const result = await createFlow.mutateAsync({
      title: tpl.title, description: tpl.description,
      nodes: tpl.nodes, edges: tpl.edges,
    });
    if (result) {
      setTimeout(() => openFlow((result as any).id), 500);
    }
  }, [createFlow, openFlow]);

  const handleCreateNew = async () => {
    if (!newTitle.trim()) return;
    const startNode: FlowNode = { id: 'n1', scriptId: null, label: 'Start', type: 'start', x: 400, y: 50 };
    const result = await createFlow.mutateAsync({ title: newTitle, description: newDesc, nodes: [startNode], edges: [] });
    setShowNewDialog(false);
    setNewTitle('');
    setNewDesc('');
    if (result) openFlow((result as any).id);
  };

  const handleAIFlowGenerated = async (data: { title: string; description: string; nodes: any[]; edges: any[] }) => {
    const result = await createFlow.mutateAsync({
      title: data.title, description: data.description,
      nodes: data.nodes, edges: data.edges,
    });
    if (result) openFlow((result as any).id);
  };

  const handleSave = useCallback(async () => {
    if (!activeFlowId) return;
    const data = controlsRef.current?.save();
    const nodes = data?.nodes ?? localNodes;
    const edges = data?.edges ?? localEdges;
    await updateFlow.mutateAsync({ id: activeFlowId, title: flowTitle, description: flowDescription, nodes, edges });
    setLocalNodes(nodes);
    setLocalEdges(edges);
    setHasUnsaved(false);
  }, [activeFlowId, flowTitle, flowDescription, localNodes, localEdges, updateFlow]);

  // Ctrl+S for save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's' && activeFlowId) {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeFlowId, handleSave]);

  const handleNodeSave = (updates: Partial<FlowNode>) => {
    if (!editingNode) return;
    const merged = { ...editingNode, ...updates };
    const updatedNodes = localNodes.map(n => n.id === editingNode.id ? merged : n);
    setLocalNodes([...updatedNodes]);
    setHasUnsaved(true);
    // Also push into ReactFlow's internal state so controlsRef.save() picks it up
    controlsRef.current?.updateNodeData(editingNode.id, updates as Record<string, any>);
    // Refresh preview panel if this node was being previewed
    if (previewingNode?.id === editingNode.id) setPreviewingNode(merged);
  };

  const handleEdgeSave = (updates: Partial<FlowEdge>) => {
    if (!editingEdge) return;
    setLocalEdges(prev => prev.map(e => e.id === editingEdge.id ? { ...e, ...updates } : e));
    setHasUnsaved(true);
  };

  const handleExport = useCallback(async (format: 'png' | 'pdf' | 'json') => {
    if (!controlsRef.current) return;
    try {
      switch (format) {
        case 'png':
          await controlsRef.current.exportPng(flowTitle || 'flow');
          toast.success('Exported as PNG');
          break;
        case 'pdf':
          await controlsRef.current.exportPdf(flowTitle || 'flow');
          toast.success('Exported as PDF');
          break;
        case 'json':
          await controlsRef.current.exportJson(flowTitle || 'flow');
          toast.success('Exported as JSON');
          break;
      }
    } catch {
      toast.error('Export failed');
    }
  }, [flowTitle]);

  if (activeFlowId) {
    return (
      <TooltipProvider>
        <PageLayout title={flowTitle} description="Script Flow Builder">
          <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex items-center gap-2 flex-wrap bg-muted/30 border rounded-lg px-3 py-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/flows')}>
                <ArrowLeft className="h-4 w-4 mr-1" /> Back
              </Button>

              <div className="w-px h-6 bg-border" />

              {/* Undo/Redo */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => controlsRef.current?.undo()}
                    disabled={!controlsRef.current?.canUndo}
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => controlsRef.current?.redo()}
                    disabled={!controlsRef.current?.canRedo}
                  >
                    <Redo2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
              </Tooltip>

              <div className="w-px h-6 bg-border" />

              {/* Auto-layout */}
              <AutoLayoutControls onLayout={(dir) => controlsRef.current?.autoLayout(dir)} />

              {/* Export */}
              <ExportControls onExport={handleExport} />

              {/* Share */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline" size="sm"
                    onClick={() => {
                      const url = `${window.location.origin}/flows/view/${activeFlowId}`;
                      navigator.clipboard.writeText(url).then(() => {
                        toast.success('Share link copied to clipboard!');
                      });
                    }}
                  >
                    <Link className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy share link</TooltipContent>
              </Tooltip>

              <div className="w-px h-6 bg-border" />

              {/* Keyboard shortcuts */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setShowShortcuts(true)}>
                    <Keyboard className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Keyboard shortcuts</TooltipContent>
              </Tooltip>

              <div className="w-px h-6 bg-border" />

              {/* Grid snap toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={controlsRef.current?.snapToGrid ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      const current = controlsRef.current?.snapToGrid ?? false;
                      controlsRef.current?.setSnapToGrid(!current);
                      toast.success(!current ? 'Snap to grid enabled' : 'Snap to grid disabled');
                    }}
                  >
                    <Grid3x3 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Toggle snap to grid</TooltipContent>
              </Tooltip>

              {/* Node search */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <NodeSearch
                      nodes={localNodes}
                      onFocusNode={(id) => controlsRef.current?.focusNode(id)}
                    />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Search nodes</TooltipContent>
              </Tooltip>

              <div className="flex-1" />

              {/* Save */}
              <Button size="sm" onClick={handleSave} disabled={!hasUnsaved || updateFlow.isPending} className="gap-1.5">
                <Save className="h-3.5 w-3.5" />
                {updateFlow.isPending ? 'Saving...' : hasUnsaved ? 'Save' : 'Saved'}
              </Button>
            </div>

            {/* Title */}
            <Input
              value={flowTitle}
              onChange={e => { setFlowTitle(e.target.value); setHasUnsaved(true); }}
              className="font-semibold text-base max-w-md"
              placeholder="Flow title"
            />

            {/* React Flow Canvas */}
            <div className="flex gap-3 items-start">
              <div className={`relative rounded-xl border overflow-hidden transition-all duration-300 ${previewingNode ? 'flex-1' : 'w-full'}`}
                style={{ height: 'calc(100vh - 260px)', minHeight: 400 }}>
                <ReactFlowCanvas
                  key={activeFlowId}
                  initialNodes={localNodes}
                  initialEdges={localEdges}
                  scripts={scripts}
                  flowId={activeFlowId}
                  onNodesChange={(nodes) => { setLocalNodes(nodes); setHasUnsaved(true); }}
                  onEdgesChange={(edges) => { setLocalEdges(edges); setHasUnsaved(true); }}
                  onDoubleClickNode={node => setEditingNode(node)}
                  onClickNode={node => { setPreviewingNode(node); setExpandedVersion(0); }}
                  controlsRef={controlsRef}
                />
                <AIFlowChat
                  nodes={localNodes}
                  edges={localEdges}
                  flowTitle={flowTitle}
                  onFlowUpdated={(nodes, edges) => {
                    setLocalNodes([...nodes]);
                    setLocalEdges([...edges]);
                    setHasUnsaved(true);
                  }}
                />
              </div>

              {/* Script Preview Panel */}
              {previewingNode && (() => {
                const linkedScript = scripts.find(s => s.id === previewingNode.scriptId);
                return (
                  <div className="w-[360px] shrink-0 rounded-xl border bg-card shadow-lg flex flex-col overflow-hidden"
                    style={{ height: 'calc(100vh - 260px)', minHeight: 400 }}>
                    {/* Panel header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 shrink-0">
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-semibold text-sm truncate">{previewingNode.label}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setEditingNode(previewingNode)}>
                          Edit node
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPreviewingNode(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {linkedScript ? (
                      <ScrollArea className="flex-1">
                        <div className="p-4 space-y-3">
                          <div className="flex flex-wrap gap-1.5">
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{linkedScript.category}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{linkedScript.stage}</span>
                            {linkedScript.target_audience && linkedScript.target_audience !== 'general' && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{linkedScript.target_audience}</span>
                            )}
                          </div>

                          {linkedScript.versions.length === 0 ? (
                            <p className="text-sm text-muted-foreground italic">No script content available.</p>
                          ) : (
                            <div className="space-y-2">
                              {linkedScript.versions.map((version, i) => (
                                <div key={i} className="border rounded-lg overflow-hidden">
                                  <button
                                    onClick={() => setExpandedVersion(expandedVersion === i ? -1 : i)}
                                    className="flex items-center justify-between w-full px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors bg-muted/20"
                                  >
                                    <span className="font-medium text-xs">{(version as any).author || `Version ${i + 1}`}</span>
                                    {expandedVersion === i ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                                  </button>
                                  {expandedVersion === i && (
                                    <div className="px-3 pb-3 pt-1 text-xs leading-relaxed text-foreground prose prose-sm dark:prose-invert max-w-none [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0.5">
                                      <ReactMarkdown>{(version as any).content || ''}</ReactMarkdown>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {previewingNode.customText && (
                            <div className="border rounded-lg p-3 bg-muted/40 border-border">
                              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                              <div className="text-xs text-foreground prose prose-sm dark:prose-invert max-w-none [&_p]:my-1"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(previewingNode.customText) }} />
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-3">
                        <FileText className="h-10 w-10 text-muted-foreground/30" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">No script linked</p>
                          <p className="text-xs text-muted-foreground/70 mt-1">Click "Edit node" to link a script to this node.</p>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => setEditingNode(previewingNode)}>
                          Link a script
                        </Button>
                        {previewingNode.customText && (
                           <div className="w-full border rounded-lg p-3 bg-muted/40 border-border text-left">
                             <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Notes</p>
                            <div className="text-xs text-foreground prose prose-sm dark:prose-invert max-w-none [&_p]:my-1"
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(previewingNode.customText) }} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>

          <NodeEditorDialog
            open={!!editingNode}
            onClose={() => setEditingNode(null)}
            onSave={handleNodeSave}
            node={editingNode}
            scripts={scripts}
          />
          <EdgeEditorDialog
            open={!!editingEdge}
            onClose={() => setEditingEdge(null)}
            onSave={handleEdgeSave}
            edge={editingEdge}
          />
          <KeyboardShortcutsHelp
            open={showShortcuts}
            onOpenChange={setShowShortcuts}
          />
        </PageLayout>
      </TooltipProvider>
    );
  }

  return (
    <PageLayout title="Script Flows" description="Build visual flowcharts for your sales and prospecting processes">
      <div className="px-3 lg:px-6 max-w-5xl mx-auto pb-20">
      <ScriptsTabBar />
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading flows...</div>
      ) : (
        <FlowListView
          flows={flows} onSelect={openFlow} onCreateNew={() => setShowNewDialog(true)}
          onCreateFromTemplate={createFromTemplate} onDelete={id => deleteFlow.mutate(id)} userId={userId}
          onOpenAIWizard={() => setShowAIWizard(true)}
        />
      )}
      </div>

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

      <AIFlowWizard
        open={showAIWizard}
        onClose={() => setShowAIWizard(false)}
        onFlowGenerated={handleAIFlowGenerated}
      />
    </PageLayout>
  );
}
