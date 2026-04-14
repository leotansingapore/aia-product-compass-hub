import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Plus, GitBranch, Trash2, Layout, ArrowLeft, Save, Undo2, Redo2, Keyboard, Sparkles, Link, Grid3x3, FileText, X, ChevronDown, ChevronUp, Search, Copy, Clock, MousePointerClick, Workflow, Zap } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import { useScriptFlows, type FlowNode, type FlowEdge } from '@/hooks/useScriptFlows';
import { useScripts } from '@/hooks/useScripts';
import ReactFlowCanvas, { type FlowCanvasControls } from '@/components/flows/ReactFlowCanvas';
import { NodeEditorDialog } from '@/components/flows/NodeEditorDialog';
import { AutoLayoutControls } from '@/components/flows/controls/AutoLayoutControls';
import { ExportControls } from '@/components/flows/controls/ExportControls';
import { KeyboardShortcutsHelp } from '@/components/flows/controls/KeyboardShortcutsHelp';
import { FLOW_TEMPLATES } from '@/utils/flowTemplates';
import { AIFlowWizard } from '@/components/flows/AIFlowWizard';
import { AIFlowChat } from '@/components/flows/AIFlowChat';
import { NodeSearch } from '@/components/flows/controls/NodeSearch';
import DOMPurify from 'dompurify';
import { toast } from 'sonner';
import { BrandedPageHeader } from '@/components/layout/BrandedPageHeader';
import { ScriptsHubHeaderTabs } from '@/components/scripts/ScriptsTabBar';
import { useNavigate, useParams } from 'react-router-dom';

/** Format a date as a human-readable relative time */
function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(dateStr).toLocaleDateString();
}

function FlowListView({ flows, onSelect, onCreateNew, onCreateFromTemplate, onDelete, onDuplicate, userId, onOpenAIWizard }: {
  flows: ReturnType<typeof useScriptFlows>['flows'];
  onSelect: (id: string) => void;
  onCreateNew: () => void;
  onCreateFromTemplate: (templateIndex: number) => void;
  onDelete: (id: string) => void;
  onDuplicate: (flow: ReturnType<typeof useScriptFlows>['flows'][0]) => void;
  userId?: string;
  onOpenAIWizard: () => void;
}) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const userFlows = useMemo(() => {
    const filtered = flows.filter(f => !f.is_template);
    if (!searchQuery.trim()) return filtered;
    const q = searchQuery.toLowerCase();
    return filtered.filter(f =>
      f.title.toLowerCase().includes(q) ||
      (f.description || '').toLowerCase().includes(q)
    );
  }, [flows, searchQuery]);

  const totalUserFlows = flows.filter(f => !f.is_template).length;

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

        {/* Search bar — only show when there are flows */}
        {totalUserFlows > 0 && (
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search your flows..."
              className="pl-8 h-8 text-sm max-w-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {totalUserFlows === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Workflow className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Build your first sales flow</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                Create visual flowcharts for your prospecting and sales processes. Map out every step from first contact to closing.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
                <Button onClick={onCreateNew} className="gap-1.5">
                  <Plus className="h-4 w-4" /> Create from scratch
                </Button>
                <Button onClick={onOpenAIWizard} variant="outline" className="gap-1.5">
                  <Sparkles className="h-4 w-4" /> Generate with AI
                </Button>
              </div>
              <div className="flex items-center gap-6 justify-center mt-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><MousePointerClick className="h-3.5 w-3.5" /> Drag & drop nodes</span>
                <span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Link to scripts</span>
                <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> AI-powered</span>
              </div>
            </CardContent>
          </Card>
        ) : userFlows.length === 0 && searchQuery ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No flows matching "{searchQuery}"</p>
              <Button variant="link" size="sm" onClick={() => setSearchQuery('')} className="mt-1">Clear search</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {userFlows.map(flow => (
              <Card key={flow.id} className="cursor-pointer hover:border-primary/50 transition-colors group" onClick={() => onSelect(flow.id)}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm truncate">{flow.title}</CardTitle>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {/* Duplicate button */}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          onDuplicate(flow);
                        }}
                        className="sm:opacity-0 sm:group-hover:opacity-100 p-1 rounded transition-all text-muted-foreground hover:text-foreground hover:bg-muted"
                        title="Duplicate flow"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      {/* Delete button */}
                      {userId === flow.created_by && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            if (confirmDeleteId === flow.id) {
                              onDelete(flow.id);
                              setConfirmDeleteId(null);
                            } else {
                              setConfirmDeleteId(flow.id);
                              setTimeout(() => setConfirmDeleteId(prev => prev === flow.id ? null : prev), 3000);
                            }
                          }}
                          className={`sm:opacity-0 sm:group-hover:opacity-100 p-1 rounded transition-all ${
                            confirmDeleteId === flow.id
                              ? 'opacity-100 bg-destructive text-destructive-foreground'
                              : 'text-destructive hover:bg-destructive/10'
                          }`}
                          title={confirmDeleteId === flow.id ? 'Click again to confirm delete' : 'Delete flow'}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  {confirmDeleteId === flow.id ? (
                    <CardDescription className="text-xs text-destructive font-medium">Click trash again to confirm delete</CardDescription>
                  ) : (
                    <CardDescription className="text-xs line-clamp-2">{flow.description || 'No description'}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="secondary" className="text-[10px]">{flow.nodes.length} nodes</Badge>
                    <Badge variant="secondary" className="text-[10px]">{flow.edges.length} connections</Badge>
                    <span className="text-[10px] ml-auto flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatRelativeTime(flow.updated_at)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-base sm:text-lg font-semibold mb-1 sm:mb-2">Templates</h2>
        <p className="text-xs text-muted-foreground mb-3">Click a template to instantly create an editable copy</p>
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
  // Edge editing is handled by ScriptEdgeStylePanel inside ReactFlowCanvas (select an edge to edit)
  const [previewingNode, setPreviewingNode] = useState<FlowNode | null>(null);
  const [expandedVersion, setExpandedVersion] = useState(0);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showAIWizard, setShowAIWizard] = useState(false);
  // Mobile preview sheet
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  // Unsaved changes confirmation dialog
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);

  const controlsRef = useRef<FlowCanvasControls | null>(null);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local state when active flow changes (URL-driven)
  const activeFlow = flows.find(f => f.id === activeFlowId) ?? null;
  const activeFlowUpdatedAt = activeFlow?.updated_at;
  useEffect(() => {
    if (!activeFlowId || !activeFlow) return;
    setLocalNodes([...activeFlow.nodes]);
    setLocalEdges([...activeFlow.edges]);
    setFlowTitle(activeFlow.title);
    setFlowDescription(activeFlow.description || '');
    setHasUnsaved(false);
  }, [activeFlowId, activeFlowUpdatedAt]); // eslint-disable-line react-hooks/exhaustive-deps

  const openFlow = useCallback((id: string) => {
    navigate(`/flows/${id}`);
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

  const handleDuplicateFlow = async (flow: typeof flows[0]) => {
    const result = await createFlow.mutateAsync({
      title: `${flow.title} (Copy)`,
      description: flow.description || undefined,
      nodes: flow.nodes,
      edges: flow.edges,
    });
    if (result) {
      toast.success('Flow duplicated');
    }
  };

  const handleAIFlowGenerated = async (data: { title: string; description: string; nodes: any[]; edges: any[] }) => {
    const result = await createFlow.mutateAsync({
      title: data.title, description: data.description,
      nodes: data.nodes, edges: data.edges,
    });
    if (result) openFlow((result as any).id);
  };

  /** Validate flow structure and show warnings (non-blocking) */
  const validateFlow = useCallback((nodes: FlowNode[], edges: FlowEdge[]) => {
    const warnings: string[] = [];
    if (nodes.length === 0) return warnings;

    const nodeIds = new Set(nodes.map(n => n.id));
    const hasOutgoing = new Set(edges.map(e => e.from));
    const hasIncoming = new Set(edges.map(e => e.to));

    // Dead-end nodes (non-end nodes with no outgoing edges)
    const deadEnds = nodes.filter(n => n.type !== 'end' && !hasOutgoing.has(n.id));
    if (deadEnds.length > 0) {
      warnings.push(`${deadEnds.length} node${deadEnds.length > 1 ? 's have' : ' has'} no outgoing connection: ${deadEnds.map(n => `"${n.label}"`).slice(0, 3).join(', ')}${deadEnds.length > 3 ? '...' : ''}`);
    }

    // Disconnected nodes (no incoming AND no outgoing, excluding start nodes)
    const disconnected = nodes.filter(n => n.type !== 'start' && !hasOutgoing.has(n.id) && !hasIncoming.has(n.id));
    if (disconnected.length > 0) {
      warnings.push(`${disconnected.length} disconnected node${disconnected.length > 1 ? 's' : ''}: ${disconnected.map(n => `"${n.label}"`).slice(0, 3).join(', ')}${disconnected.length > 3 ? '...' : ''}`);
    }

    // Edges pointing to non-existent nodes
    const brokenEdges = edges.filter(e => !nodeIds.has(e.from) || !nodeIds.has(e.to));
    if (brokenEdges.length > 0) {
      warnings.push(`${brokenEdges.length} broken connection${brokenEdges.length > 1 ? 's' : ''} (pointing to deleted nodes)`);
    }

    return warnings;
  }, []);

  const handleSave = useCallback(async () => {
    if (!activeFlowId) return;
    const data = controlsRef.current?.save();
    const nodes = data?.nodes ?? localNodes;
    const edges = data?.edges ?? localEdges;

    // Run validation and show warnings (non-blocking)
    const warnings = validateFlow(nodes, edges);
    if (warnings.length > 0) {
      toast.warning('Flow saved with warnings', {
        description: warnings.join('. '),
        duration: 6000,
      });
    }

    await updateFlow.mutateAsync({ id: activeFlowId, title: flowTitle, description: flowDescription, nodes, edges });
    setLocalNodes(nodes);
    setLocalEdges(edges);
    setHasUnsaved(false);
  }, [activeFlowId, flowTitle, flowDescription, localNodes, localEdges, updateFlow, validateFlow]);

  // Auto-save: debounce 5 seconds after changes
  useEffect(() => {
    if (!hasUnsaved || !activeFlowId) return;
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    autoSaveTimerRef.current = setTimeout(() => {
      handleSave();
    }, 5000);
    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    };
  }, [hasUnsaved, activeFlowId, handleSave]);

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

  // Open mobile preview sheet when clicking a node on small screens
  const handleNodeClick = useCallback((node: FlowNode) => {
    setPreviewingNode(node);
    setExpandedVersion(0);
    // On mobile, open the sheet
    if (window.innerWidth < 1024) {
      setMobilePreviewOpen(true);
    }
  }, []);

  // Render the preview content (shared between desktop panel and mobile sheet)
  const renderPreviewContent = () => {
    if (!previewingNode) return null;
    const linkedScript = scripts.find(s => s.id === previewingNode.scriptId);

    return (
      <>
        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <FileText className="h-4 w-4 text-primary shrink-0" />
            <span className="font-semibold text-sm truncate">{previewingNode.label}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => { setEditingNode(previewingNode); setMobilePreviewOpen(false); }}>
              Edit node
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 hidden lg:flex" onClick={() => setPreviewingNode(null)}>
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
              <p className="text-xs text-muted-foreground/70 mt-1">Tap "Edit node" to link a script to this node.</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => { setEditingNode(previewingNode); setMobilePreviewOpen(false); }}>
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
      </>
    );
  };

  if (activeFlowId) {
    return (
      <TooltipProvider>
        <PageLayout title={flowTitle} description="Script Flow Builder">
          <div className="space-y-2 sm:space-y-3">
            {/* Toolbar — responsive with overflow handling */}
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap bg-muted/30 border rounded-lg px-2 sm:px-3 py-1.5 sm:py-2">
              <Button variant="ghost" size="sm" className="h-8 text-xs sm:text-sm" onClick={() => {
                if (hasUnsaved) {
                  setShowLeaveDialog(true);
                  return;
                }
                navigate('/flows');
              }}>
                <ArrowLeft className="h-4 w-4 mr-1" /> <span className="hidden sm:inline">Back</span>
              </Button>

              <div className="w-px h-6 bg-border hidden sm:block" />

              {/* Undo/Redo */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline" size="sm" className="h-8"
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
                    variant="outline" size="sm" className="h-8"
                    onClick={() => controlsRef.current?.redo()}
                    disabled={!controlsRef.current?.canRedo}
                  >
                    <Redo2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Redo (Ctrl+Shift+Z)</TooltipContent>
              </Tooltip>

              <div className="w-px h-6 bg-border hidden sm:block" />

              {/* Auto-layout — hide text on small screens */}
              <div className="hidden sm:block">
                <AutoLayoutControls onLayout={(dir) => controlsRef.current?.autoLayout(dir)} />
              </div>
              <div className="sm:hidden">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline" size="sm" className="h-8"
                      onClick={() => controlsRef.current?.autoLayout('TB')}
                    >
                      <Layout className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Auto layout</TooltipContent>
                </Tooltip>
              </div>

              {/* Export & Import — hide text on small screens */}
              <div className="hidden sm:block">
                <ExportControls
                  onExport={handleExport}
                  onImportJson={(data) => {
                    try {
                      setLocalNodes(data.nodes);
                      setLocalEdges(data.edges);
                      setHasUnsaved(true);
                      toast.success(`Imported ${data.nodes.length} nodes and ${data.edges.length} connections`);
                    } catch {
                      toast.error('Failed to import: invalid flow data');
                    }
                  }}
                />
              </div>

              {/* Share */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline" size="sm" className="h-8"
                    onClick={() => {
                      const url = `${window.location.origin}/flows/view/${activeFlowId}`;
                      navigator.clipboard.writeText(url).then(() => {
                        toast.success('Share link copied!');
                      });
                    }}
                  >
                    <Link className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Copy share link</TooltipContent>
              </Tooltip>

              {/* Desktop-only secondary tools */}
              <div className="hidden md:flex items-center gap-1.5">
                <div className="w-px h-6 bg-border" />

                {/* Keyboard shortcuts */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8" onClick={() => setShowShortcuts(true)}>
                      <Keyboard className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Keyboard shortcuts</TooltipContent>
                </Tooltip>

                {/* Grid snap toggle */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={controlsRef.current?.snapToGrid ? 'default' : 'outline'}
                      size="sm" className="h-8"
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
                <NodeSearch
                  nodes={localNodes}
                  onFocusNode={(id) => controlsRef.current?.focusNode(id)}
                />
              </div>

              <div className="flex-1" />

              {/* Save status indicator + button */}
              <div className="flex items-center gap-1.5">
                {hasUnsaved && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 hidden sm:inline">Auto-saving...</span>
                )}
                <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={handleSave} disabled={!hasUnsaved || updateFlow.isPending}>
                  <Save className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">
                    {updateFlow.isPending ? 'Saving...' : hasUnsaved ? 'Save now' : 'Saved'}
                  </span>
                  <span className="sm:hidden">
                    {updateFlow.isPending ? '...' : hasUnsaved ? 'Save' : '✓'}
                  </span>
                </Button>
              </div>
            </div>

            {/* Title — editable inline */}
            <div className="flex items-center gap-2 max-w-md px-1">
              {hasUnsaved && <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse" title="Unsaved changes" />}
              <Input
                value={flowTitle}
                onChange={e => { setFlowTitle(e.target.value); setHasUnsaved(true); }}
                className="font-semibold text-base border-transparent hover:border-border focus:border-border transition-colors"
                placeholder="Flow title"
              />
            </div>

            {/* React Flow Canvas */}
            <div className="flex gap-3 items-start">
              <div className={`relative rounded-xl border overflow-hidden transition-all duration-300 ${previewingNode && window.innerWidth >= 1024 ? 'flex-1' : 'w-full'}`}
                style={{ height: 'calc(100vh - 240px)', minHeight: 350 }}>
                <ReactFlowCanvas
                  key={activeFlowId}
                  initialNodes={localNodes}
                  initialEdges={localEdges}
                  scripts={scripts}
                  flowId={activeFlowId}
                  onNodesChange={(nodes) => { setLocalNodes(nodes); setHasUnsaved(true); }}
                  onEdgesChange={(edges) => { setLocalEdges(edges); setHasUnsaved(true); }}
                  onDoubleClickNode={node => setEditingNode(node)}
                  onClickNode={handleNodeClick}
                  onPaneClick={() => setPreviewingNode(null)}
                  controlsRef={controlsRef}
                />

                {/* Canvas onboarding hint — shown when flow has only 1 node (fresh flow) */}
                {localNodes.length <= 1 && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 bg-background/95 backdrop-blur border rounded-xl px-4 py-2.5 shadow-lg text-center pointer-events-none max-w-xs">
                    <p className="text-xs font-medium text-foreground mb-1">Get started</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Drag shapes from the palette on the left onto the canvas, then connect them by dragging from one handle to another.
                    </p>
                  </div>
                )}

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

              {/* Desktop Script Preview Panel */}
              {previewingNode && (
                <div className="hidden lg:flex w-[320px] xl:w-[360px] shrink-0 rounded-xl border bg-card shadow-lg flex-col overflow-hidden"
                  style={{ height: 'calc(100vh - 240px)', minHeight: 350 }}>
                  {renderPreviewContent()}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Script Preview Sheet */}
          <Sheet open={mobilePreviewOpen} onOpenChange={setMobilePreviewOpen}>
            <SheetContent side="bottom" className="h-[60vh] flex flex-col p-0 rounded-t-2xl">
              <SheetHeader className="sr-only">
                <SheetTitle>Node Preview</SheetTitle>
              </SheetHeader>
              {renderPreviewContent()}
            </SheetContent>
          </Sheet>

          <NodeEditorDialog
            open={!!editingNode}
            onClose={() => setEditingNode(null)}
            onSave={handleNodeSave}
            node={editingNode}
            scripts={scripts}
          />
          <KeyboardShortcutsHelp
            open={showShortcuts}
            onOpenChange={setShowShortcuts}
          />

          {/* Unsaved changes confirmation dialog */}
          <Dialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
            <DialogContent className="max-w-xs">
              <DialogHeader>
                <DialogTitle>Unsaved changes</DialogTitle>
                <DialogDescription>You have unsaved changes that will be lost if you leave.</DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex-row gap-2 sm:justify-end">
                <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setShowLeaveDialog(false)}>Stay</Button>
                <Button variant="destructive" className="flex-1 sm:flex-none" onClick={() => { setShowLeaveDialog(false); navigate('/flows'); }}>Leave</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </PageLayout>
      </TooltipProvider>
    );
  }

  return (
    <PageLayout title="Script Flows" description="Build visual flowcharts for your sales and prospecting processes">
      <BrandedPageHeader
        tone="dark"
        showOnMobile
        title="Script Flows"
        subtitle="Build visual flowcharts for your sales and prospecting processes"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Flows" }]}
        headerTabs={<ScriptsHubHeaderTabs />}
      />
      <div className="px-3 lg:px-6 max-w-5xl mx-auto pb-20">
      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">Loading flows...</div>
      ) : (
        <FlowListView
          flows={flows} onSelect={openFlow} onCreateNew={() => setShowNewDialog(true)}
          onCreateFromTemplate={createFromTemplate} onDelete={id => deleteFlow.mutate(id)}
          onDuplicate={handleDuplicateFlow}
          userId={userId}
          onOpenAIWizard={() => setShowAIWizard(true)}
        />
      )}
      </div>

      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Create New Flow</DialogTitle>
            <DialogDescription>Give your flow a name to get started. You can change it later.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Title</Label>
              <Input
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                placeholder="e.g. My Prospecting Flow"
                onKeyDown={e => { if (e.key === 'Enter' && newTitle.trim()) handleCreateNew(); }}
                autoFocus
              />
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="What is this flow for?" rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateNew} disabled={!newTitle.trim() || createFlow.isPending}>
              {createFlow.isPending ? 'Creating...' : 'Create'}
            </Button>
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
