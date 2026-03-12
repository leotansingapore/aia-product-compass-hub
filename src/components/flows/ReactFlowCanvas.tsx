import { useCallback, useRef, useMemo, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  reconnectEdge,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ReactFlowProvider,
  type Connection,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
  MarkerType,
  Panel,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';

import type { FlowNode, FlowEdge } from '@/hooks/useScriptFlows';
import type { ScriptEntry } from '@/hooks/useScripts';
import { toReactFlowNodes, toReactFlowEdges, fromReactFlowNodes, fromReactFlowEdges } from '@/utils/flowDataBridge';
import { scriptFlowNodeTypes } from './nodes';
import { scriptFlowEdgeTypes } from './edges';
import { useFlowHistory } from './hooks/useFlowHistory';
import { getLayoutedElements } from './hooks/useFlowAutoLayout';
import { useFlowClipboard } from './hooks/useFlowClipboard';
import { useFlowExport } from './hooks/useFlowExport';
import { ShapePalette } from './panels/ShapePalette';
import { ScriptNodeEditPanel } from './panels/ScriptNodeEditPanel';
import { ScriptEdgeStylePanel } from './panels/ScriptEdgeStylePanel';
import { AnnotationLayer } from './annotations/AnnotationLayer';
import { AnnotationToolbar, type AnnotationTool } from './annotations/AnnotationToolbar';
import { NODE_TYPE_DEFAULTS } from '@/utils/flowColorUtils';
import { PenLine } from 'lucide-react';

interface ReactFlowCanvasProps {
  initialNodes: FlowNode[];
  initialEdges: FlowEdge[];
  scripts: ScriptEntry[];
  flowId?: string;
  readOnly?: boolean;
  onNodesChange?: (nodes: FlowNode[]) => void;
  onEdgesChange?: (edges: FlowEdge[]) => void;
  onDoubleClickNode?: (node: FlowNode) => void;
  onClickNode?: (node: FlowNode) => void;
  onPaneClick?: () => void;
  /** Expose undo/redo/layout/export controls to parent */
  controlsRef?: React.MutableRefObject<FlowCanvasControls | null>;
}

export interface FlowCanvasControls {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  autoLayout: (direction?: 'TB' | 'LR' | 'BT' | 'RL') => void;
  exportPng: (filename: string) => Promise<void>;
  exportPdf: (filename: string) => Promise<void>;
  exportJson: (title: string) => Promise<void>;
  fitView: () => void;
  getNodes: () => FlowNode[];
  getEdges: () => FlowEdge[];
  save: () => { nodes: FlowNode[]; edges: FlowEdge[] };
  updateNodeData: (nodeId: string, dataUpdates: Record<string, any>) => void;
  updateEdgeData?: (edgeId: string, dataUpdates: Record<string, any>) => void;
  snapToGrid: boolean;
  setSnapToGrid: (val: boolean) => void;
  focusNode: (nodeId: string) => void;
}

const DEFAULT_EDGE_OPTIONS = {
  type: 'scriptFlowEdge',
  markerEnd: {
    type: MarkerType.ArrowClosed,
    width: 16,
    height: 16,
  },
};

const PROPTIONS = { hideAttribution: true };

function ReactFlowCanvasInner({
  initialNodes: dbNodes,
  initialEdges: dbEdges,
  scripts,
  flowId,
  readOnly = false,
  onNodesChange: onNodesChangeProp,
  onEdgesChange: onEdgesChangeProp,
  onDoubleClickNode,
  onClickNode,
  onPaneClick,
  controlsRef,
}: ReactFlowCanvasProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { fitView, screenToFlowPosition, getNodes: rfGetNodes, getEdges: rfGetEdges } = useReactFlow();

  // Annotation state
  const [annotationMode, setAnnotationMode] = useState(false);
  const [activeTool, setActiveTool] = useState<AnnotationTool>('none');
  const [annotationColor, setAnnotationColor] = useState('#fef08a');
  const [penWidth, setPenWidth] = useState(3);
  const [canvasTransform, setCanvasTransform] = useState({ x: 0, y: 0, zoom: 1 });

  // Convert DB format to React Flow format for initial load
  const rfInitialNodes = useMemo(() => {
    const converted = toReactFlowNodes(dbNodes);
    // Enrich script nodes with script names
    return converted.map((n) => {
      if (n.data?.scriptId) {
        const script = scripts.find((s) => s.id === n.data.scriptId);
        return { ...n, data: { ...n.data, scriptName: script?.stage } };
      }
      return n;
    });
  }, []); // Only on mount — subsequent changes managed by React Flow

  const rfInitialEdges = useMemo(() => toReactFlowEdges(dbEdges), []);

  const [nodes, setNodes, onNodesChange] = useNodesState(rfInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfInitialEdges);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(false);

  // Hooks
  const history = useFlowHistory();
  const clipboard = useFlowClipboard();
  const flowExport = useFlowExport();

  // Take initial snapshot
  useEffect(() => {
    history.takeSnapshot(rfInitialNodes, rfInitialEdges, 'Initial state');
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Notify parent of changes
  const notifyParent = useCallback(() => {
    const currentNodes = rfGetNodes();
    const currentEdges = rfGetEdges();
    onNodesChangeProp?.(fromReactFlowNodes(currentNodes));
    onEdgesChangeProp?.(fromReactFlowEdges(currentEdges));
  }, [rfGetNodes, rfGetEdges, onNodesChangeProp, onEdgesChangeProp]);

  // Inline label change — called directly from node components
  const handleInlineLabelChange = useCallback((nodeId: string, newLabel: string) => {
    setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: { ...n.data, label: newLabel } } : n));
    requestAnimationFrame(() => {
      const n = rfGetNodes();
      const e = rfGetEdges();
      history.takeSnapshot(n, e, 'Renamed node');
      notifyParent();
    });
  }, [setNodes, rfGetNodes, rfGetEdges, history, notifyParent]);

  // Wrap onNodesChange to track changes
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    onNodesChange(changes);

    // Track selection
    for (const change of changes) {
      if (change.type === 'select') {
        setSelectedNodeId(change.selected ? change.id : null);
        if (change.selected) setSelectedEdgeId(null);
      }
    }

    // Snapshot on meaningful changes (position, remove)
    const hasMeaningful = changes.some(
      (c) => c.type === 'position' && c.dragging === false || c.type === 'remove'
    );
    if (hasMeaningful) {
      // Defer to get updated state
      requestAnimationFrame(() => {
        const n = rfGetNodes();
        const e = rfGetEdges();
        history.takeSnapshot(n, e, 'Node moved');
        notifyParent();
      });
    }
  }, [onNodesChange, history, rfGetNodes, rfGetEdges, notifyParent]);

  const handleEdgesChange = useCallback((changes: EdgeChange[]) => {
    onEdgesChange(changes);

    for (const change of changes) {
      if (change.type === 'select') {
        setSelectedEdgeId(change.selected ? change.id : null);
        if (change.selected) setSelectedNodeId(null);
      }
    }

    const hasMeaningful = changes.some((c) => c.type === 'remove');
    if (hasMeaningful) {
      requestAnimationFrame(() => {
        const n = rfGetNodes();
        const e = rfGetEdges();
        history.takeSnapshot(n, e, 'Edge removed');
        notifyParent();
      });
    }
  }, [onEdgesChange, history, rfGetNodes, rfGetEdges, notifyParent]);

  // Connect handler
  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => addEdge({
      ...connection,
      type: 'scriptFlowEdge',
      markerEnd: { type: MarkerType.ArrowClosed, width: 16, height: 16 },
      data: {},
    }, eds));

    requestAnimationFrame(() => {
      const n = rfGetNodes();
      const e = rfGetEdges();
      history.takeSnapshot(n, e, 'Connected nodes');
      notifyParent();
    });
  }, [setEdges, history, rfGetNodes, rfGetEdges, notifyParent]);

  // Add node (from palette click or drag)
  const addNode = useCallback((type: FlowNode['type'], position?: { x: number; y: number }) => {
    const labels: Record<string, string> = {
      start: 'Start', script: 'New Script', decision: 'Decision?', action: 'Follow-up', end: 'End',
      hexagon: 'Process', parallelogram: 'Input/Output', cylinder: 'Storage', document: 'Document',
    };
    const nodeTypeMap: Record<string, string> = {
      start: 'scriptStart', script: 'scriptNode', decision: 'decisionNode', action: 'actionNode', end: 'scriptEnd',
      hexagon: 'hexagonNode', parallelogram: 'parallelogramNode', cylinder: 'cylinderNode', document: 'documentNode',
    };

    const newNode: Node = {
      id: `n${Date.now()}`,
      type: nodeTypeMap[type],
      position: position || { x: 300 + Math.random() * 200, y: 200 + Math.random() * 200 },
      data: {
        label: labels[type],
        scriptId: null,
        nodeType: type,
      },
    };

    setNodes((nds) => [...nds, newNode]);

    requestAnimationFrame(() => {
      const n = rfGetNodes();
      const e = rfGetEdges();
      history.takeSnapshot(n, e, `Added ${type} node`);
      notifyParent();
    });
  }, [setNodes, history, rfGetNodes, rfGetEdges, notifyParent]);

  // Drop handler for drag-and-drop from palette
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('application/reactflow-nodetype') as FlowNode['type'];
    if (!type) return;

    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    addNode(type, position);
  }, [screenToFlowPosition, addNode]);

  // Double-click node handler
  const onNodeDoubleClick = useCallback((_: React.MouseEvent, node: Node) => {
    if (!onDoubleClickNode) return;
    // Convert back to DB format for the dialog
    const dbNode: FlowNode = {
      id: node.id,
      label: node.data?.label || '',
      type: (node.data?.nodeType || node.type || 'script') as FlowNode['type'],
      scriptId: node.data?.scriptId || null,
      customText: node.data?.customText || '',
      x: Math.round(node.position.x),
      y: Math.round(node.position.y),
    };
    onDoubleClickNode(dbNode);
  }, [onDoubleClickNode]);

  // Single-click node handler — preview
  const onNodeClickHandler = useCallback((_: React.MouseEvent, node: Node) => {
    if (!onClickNode) return;
    const dbNode: FlowNode = {
      id: node.id,
      label: node.data?.label || '',
      type: (node.data?.nodeType || node.type || 'script') as FlowNode['type'],
      scriptId: node.data?.scriptId || null,
      customText: node.data?.customText || '',
      x: Math.round(node.position.x),
      y: Math.round(node.position.y),
    };
    onClickNode(dbNode);
  }, [onClickNode]);

  // Panel handlers
  const selectedNode = useMemo(() => nodes.find((n) => n.id === selectedNodeId) || null, [nodes, selectedNodeId]);
  const selectedEdge = useMemo(() => edges.find((e) => e.id === selectedEdgeId) || null, [edges, selectedEdgeId]);

  const handleUpdateNode = useCallback((id: string, dataUpdates: Record<string, any>) => {
    if (Object.keys(dataUpdates).length === 0) {
      // Close panel (deselect)
      setSelectedNodeId(null);
      setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
      return;
    }

    setNodes((nds) => nds.map((n) => {
      if (n.id !== id) return n;
      const newData = { ...n.data, ...dataUpdates };
      // Enrich script name if scriptId changed
      if (dataUpdates.scriptId !== undefined) {
        const script = scripts.find((s) => s.id === dataUpdates.scriptId);
        newData.scriptName = script?.stage;
      }
      return { ...n, data: newData };
    }));

    requestAnimationFrame(() => {
      const n = rfGetNodes();
      const e = rfGetEdges();
      history.takeSnapshot(n, e, 'Updated node');
      notifyParent();
    });
  }, [setNodes, scripts, history, rfGetNodes, rfGetEdges, notifyParent]);

  const handleDeleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== id));
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setSelectedNodeId(null);

    requestAnimationFrame(() => {
      const n = rfGetNodes();
      const e = rfGetEdges();
      history.takeSnapshot(n, e, 'Deleted node');
      notifyParent();
    });
  }, [setNodes, setEdges, history, rfGetNodes, rfGetEdges, notifyParent]);

  const handleOpenFullEditor = useCallback((nodeId: string) => {
    const node = rfGetNodes().find((n) => n.id === nodeId);
    if (!node || !onDoubleClickNode) return;
    const dbNode: FlowNode = {
      id: node.id,
      label: node.data?.label || '',
      type: node.data?.nodeType || 'script',
      scriptId: node.data?.scriptId || null,
      customText: node.data?.customText,
      x: Math.round(node.position.x),
      y: Math.round(node.position.y),
    };
    onDoubleClickNode(dbNode);
  }, [rfGetNodes, onDoubleClickNode]);

  const handleUpdateEdge = useCallback((id: string, dataUpdates: Record<string, any>) => {
    if (Object.keys(dataUpdates).length === 0) {
      setSelectedEdgeId(null);
      setEdges((eds) => eds.map((e) => ({ ...e, selected: false })));
      return;
    }

    setEdges((eds) => eds.map((e) => {
      if (e.id !== id) return e;
      return { ...e, data: { ...e.data, ...dataUpdates } };
    }));

    requestAnimationFrame(() => {
      const n = rfGetNodes();
      const e = rfGetEdges();
      history.takeSnapshot(n, e, 'Updated edge');
      notifyParent();
    });
  }, [setEdges, history, rfGetNodes, rfGetEdges, notifyParent]);

  const handleDeleteEdge = useCallback((id: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== id));
    setSelectedEdgeId(null);

    requestAnimationFrame(() => {
      const n = rfGetNodes();
      const e = rfGetEdges();
      history.takeSnapshot(n, e, 'Deleted edge');
      notifyParent();
    });
  }, [setEdges, history, rfGetNodes, rfGetEdges, notifyParent]);

  // Auto-layout
  const handleAutoLayout = useCallback((direction: 'TB' | 'LR' | 'BT' | 'RL' = 'TB') => {
    const currentNodes = rfGetNodes();
    const currentEdges = rfGetEdges();
    const { nodes: layouted } = getLayoutedElements(currentNodes, currentEdges, direction);
    setNodes(layouted);

    requestAnimationFrame(() => {
      fitView({ padding: 0.15, duration: 300 });
      const n = rfGetNodes();
      const e = rfGetEdges();
      history.takeSnapshot(n, e, `Auto-layout (${direction})`);
      notifyParent();
    });
  }, [rfGetNodes, rfGetEdges, setNodes, fitView, history, notifyParent]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (readOnly) return;

      // Don't capture when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;

      const isCtrl = e.ctrlKey || e.metaKey;

      // Undo
      if (isCtrl && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        const state = history.undo();
        if (state) {
          setNodes(state.nodes);
          setEdges(state.edges);
          notifyParent();
        }
      }

      // Redo
      if (isCtrl && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        const state = history.redo();
        if (state) {
          setNodes(state.nodes);
          setEdges(state.edges);
          notifyParent();
        }
      }

      // Copy
      if (isCtrl && e.key === 'c') {
        const selected = rfGetNodes().filter((n) => n.selected);
        if (selected.length > 0) {
          e.preventDefault();
          clipboard.copyNodes(selected, rfGetEdges());
        }
      }

      // Paste
      if (isCtrl && e.key === 'v') {
        const result = clipboard.pasteNodes();
        if (result) {
          e.preventDefault();
          setNodes((nds) => [...nds.map((n) => ({ ...n, selected: false })), ...result.nodes.map((n) => ({ ...n, selected: true }))]);
          setEdges((eds) => [...eds, ...result.edges]);
          requestAnimationFrame(() => {
            const n = rfGetNodes();
            const ed = rfGetEdges();
            history.takeSnapshot(n, ed, 'Pasted nodes');
            notifyParent();
          });
        }
      }

      // Duplicate
      if (isCtrl && e.key === 'd') {
        e.preventDefault();
        const selected = rfGetNodes().filter((n) => n.selected);
        const result = clipboard.duplicateNodes(selected, rfGetEdges());
        if (result) {
          setNodes((nds) => [...nds.map((n) => ({ ...n, selected: false })), ...result.nodes.map((n) => ({ ...n, selected: true }))]);
          setEdges((eds) => [...eds, ...result.edges]);
          requestAnimationFrame(() => {
            const n = rfGetNodes();
            const ed = rfGetEdges();
            history.takeSnapshot(n, ed, 'Duplicated nodes');
            notifyParent();
          });
        }
      }

      // Delete
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedNodes = rfGetNodes().filter((n) => n.selected);
        const selectedEdgesList = rfGetEdges().filter((edge) => edge.selected);
        if (selectedNodes.length > 0 || selectedEdgesList.length > 0) {
          e.preventDefault();
          const nodeIds = new Set(selectedNodes.map((n) => n.id));
          setNodes((nds) => nds.filter((n) => !nodeIds.has(n.id)));
          setEdges((eds) => eds.filter((edge) => !edge.selected && !nodeIds.has(edge.source) && !nodeIds.has(edge.target)));
          setSelectedNodeId(null);
          setSelectedEdgeId(null);
          requestAnimationFrame(() => {
            const n = rfGetNodes();
            const ed = rfGetEdges();
            history.takeSnapshot(n, ed, 'Deleted selection');
            notifyParent();
          });
        }
      }

      // Fit view
      if (e.key === 'f' && !isCtrl) {
        e.preventDefault();
        fitView({ padding: 0.15, duration: 300 });
      }

      // Select all
      if (isCtrl && e.key === 'a') {
        e.preventDefault();
        setNodes((nds) => nds.map((n) => ({ ...n, selected: true })));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [readOnly, history, clipboard, setNodes, setEdges, rfGetNodes, rfGetEdges, fitView, notifyParent]);

  // Listen for inline edge deletions (from ScriptFlowEdge hover delete button)
  useEffect(() => {
    const handler = () => {
      requestAnimationFrame(() => {
        const n = rfGetNodes();
        const e = rfGetEdges();
        history.takeSnapshot(n, e, 'Deleted edge (inline)');
        notifyParent();
      });
    };
    window.addEventListener('flow-edge-inline-delete', handler);
    return () => window.removeEventListener('flow-edge-inline-delete', handler);
  }, [rfGetNodes, rfGetEdges, history, notifyParent]);

  // Expose controls to parent
  useEffect(() => {
    if (!controlsRef) return;
    controlsRef.current = {
      undo: () => {
        const state = history.undo();
        if (state) {
          setNodes(state.nodes);
          setEdges(state.edges);
          notifyParent();
        }
      },
      redo: () => {
        const state = history.redo();
        if (state) {
          setNodes(state.nodes);
          setEdges(state.edges);
          notifyParent();
        }
      },
      canUndo: history.canUndo,
      canRedo: history.canRedo,
      autoLayout: handleAutoLayout,
      exportPng: async (filename) => {
        const el = reactFlowWrapper.current?.querySelector('.react-flow__viewport') as HTMLElement;
        if (el) await flowExport.exportAsPng(el, filename);
      },
      exportPdf: async (filename) => {
        const el = reactFlowWrapper.current?.querySelector('.react-flow__viewport') as HTMLElement;
        if (el) await flowExport.exportAsPdf(el, filename);
      },
      exportJson: async (title) => {
        await flowExport.exportAsJson(rfGetNodes(), rfGetEdges(), title);
      },
      fitView: () => fitView({ padding: 0.15, duration: 300 }),
      getNodes: () => fromReactFlowNodes(rfGetNodes()),
      getEdges: () => fromReactFlowEdges(rfGetEdges()),
      save: () => ({
        nodes: fromReactFlowNodes(rfGetNodes()),
        edges: fromReactFlowEdges(rfGetEdges()),
      }),
      updateNodeData: (nodeId: string, dataUpdates: Record<string, any>) => {
        setNodes((nds) => nds.map((n) => {
          if (n.id !== nodeId) return n;
          const newData = { ...n.data, ...dataUpdates };
          if (dataUpdates.scriptId !== undefined) {
            const script = scripts.find((s) => s.id === dataUpdates.scriptId);
            newData.scriptName = script?.stage;
          }
          return { ...n, data: newData };
        }));
        requestAnimationFrame(() => {
          const n = rfGetNodes();
          const e = rfGetEdges();
          history.takeSnapshot(n, e, 'Updated node via dialog');
          notifyParent();
        });
      },
      updateEdgeData: (edgeId: string, dataUpdates: Record<string, any>) => {
        setEdges((eds) => eds.map((e) => {
          if (e.id !== edgeId) return e;
          return { ...e, data: { ...e.data, ...dataUpdates } };
        }));
        requestAnimationFrame(() => {
          const n = rfGetNodes();
          const e = rfGetEdges();
          history.takeSnapshot(n, e, 'Updated edge via dialog');
          notifyParent();
        });
      },
      snapToGrid,
      setSnapToGrid,
      focusNode: (nodeId: string) => {
        const node = rfGetNodes().find((n) => n.id === nodeId);
        if (node) {
          fitView({ nodes: [node], padding: 0.5, duration: 400 });
          // Select the node
          setNodes((nds) => nds.map((n) => ({ ...n, selected: n.id === nodeId })));
          setSelectedNodeId(nodeId);
          setSelectedEdgeId(null);
        }
      },
    };
  });

  // Enrich nodes with inline label change callback
  const nodesWithCallbacks = useMemo(() =>
    nodes.map((n) => ({
      ...n,
      data: { ...n.data, onLabelChange: (label: string) => handleInlineLabelChange(n.id, label) },
    })),
    [nodes, handleInlineLabelChange]
  );

  return (
    <div ref={reactFlowWrapper} className="relative w-full h-full">
      <ReactFlow
        nodes={nodesWithCallbacks}
        edges={edges}

        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={onConnect}
        onReconnect={(oldEdge, newConnection) => {
          setEdges((eds) => reconnectEdge(oldEdge, newConnection, eds));
          requestAnimationFrame(() => {
            const n = rfGetNodes();
            const e = rfGetEdges();
            history.takeSnapshot(n, e, 'Reconnected edge');
            notifyParent();
          });
        }}
        edgeUpdaterRadius={20}
        onNodeDoubleClick={onNodeDoubleClick}
        onNodeClick={onClickNode ? onNodeClickHandler : undefined}
        onPaneClick={() => {
          setSelectedNodeId(null);
          setSelectedEdgeId(null);
          setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
          setEdges((eds) => eds.map((e) => ({ ...e, selected: false })));
          onPaneClick?.();
        }}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={scriptFlowNodeTypes}
        edgeTypes={scriptFlowEdgeTypes}
        defaultEdgeOptions={DEFAULT_EDGE_OPTIONS}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        proOptions={PROPTIONS}
        snapToGrid={snapToGrid}
        snapGrid={[20, 20]}
        deleteKeyCode={null} // We handle deletion ourselves
        onMove={(_, viewport) => setCanvasTransform({ x: viewport.x, y: viewport.y, zoom: viewport.zoom })}
        onMoveEnd={(_, viewport) => setCanvasTransform({ x: viewport.x, y: viewport.y, zoom: viewport.zoom })}
        multiSelectionKeyCode="Shift"
        selectionOnDrag={false}
        nodesDraggable={!readOnly}
        nodesConnectable={!readOnly}
        elementsSelectable={!readOnly}
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

        {/* Shape palette */}
        {!readOnly && (
          <Panel position="top-left" className="!m-0">
            <ShapePalette onAddNode={addNode} />
          </Panel>
        )}
      </ReactFlow>

      {/* Node edit panel */}
      {!readOnly && selectedNode && !selectedEdge && (
        <ScriptNodeEditPanel
          node={selectedNode}
          scripts={scripts}
          onUpdateNode={handleUpdateNode}
          onDeleteNode={handleDeleteNode}
          onOpenFullEditor={handleOpenFullEditor}
        />
      )}

      {/* Edge style panel */}
      {!readOnly && selectedEdge && !selectedNode && (
        <ScriptEdgeStylePanel
          edge={selectedEdge}
          onUpdateEdge={handleUpdateEdge}
          onDeleteEdge={handleDeleteEdge}
        />
      )}

      {/* Annotation layer overlay — always visible, interactive only when annotationMode is on */}
      {flowId && (
        <AnnotationLayer
          flowId={flowId}
          activeTool={annotationMode ? activeTool : 'none'}
          activeColor={annotationColor}
          penWidth={penWidth}
          zoom={canvasTransform.zoom}
          panX={canvasTransform.x}
          panY={canvasTransform.y}
          containerRef={reactFlowWrapper}
          onToolUsed={() => {}}
        />
      )}

      {/* Annotation toolbar */}
      {annotationMode && (
        <AnnotationToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          activeColor={annotationColor}
          onColorChange={setAnnotationColor}
          penWidth={penWidth}
          onPenWidthChange={setPenWidth}
          onClose={() => { setAnnotationMode(false); setActiveTool('none'); }}
        />
      )}

      {/* Annotate toggle button */}
      {flowId && !readOnly && !annotationMode && (
        <button
          onClick={() => setAnnotationMode(true)}
          className="absolute bottom-4 left-4 z-20 flex items-center gap-1.5 bg-background/95 backdrop-blur border border-border rounded-xl px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 shadow transition-all"
          title="Open annotation tools"
        >
          <PenLine className="h-3.5 w-3.5" />
          Annotate
        </button>
      )}
    </div>
  );
}

export default function ReactFlowCanvas(props: ReactFlowCanvasProps) {
  return (
    <ReactFlowProvider>
      <ReactFlowCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
