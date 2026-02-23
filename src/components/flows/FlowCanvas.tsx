import { useCallback, useRef, useState, useEffect } from 'react';
import type { FlowNode, FlowEdge } from '@/hooks/useScriptFlows';
import type { ScriptEntry } from '@/hooks/useScripts';
import { cn } from '@/lib/utils';

interface FlowCanvasProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  scripts: ScriptEntry[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onMoveNode: (id: string, x: number, y: number) => void;
  onStartConnect: (fromId: string) => void;
  connectingFrom: string | null;
  onCompleteConnect: (toId: string) => void;
  readOnly?: boolean;
}

const NODE_COLORS: Record<string, string> = {
  start: 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300',
  script: 'bg-primary/10 border-primary text-foreground',
  decision: 'bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300',
  action: 'bg-blue-500/20 border-blue-500 text-blue-700 dark:text-blue-300',
  end: 'bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300',
};

const CONDITION_COLORS: Record<string, string> = {
  yes: '#22c55e',
  no: '#ef4444',
  'no-reply': '#f59e0b',
  custom: '#8b5cf6',
};

function getNodeCenter(node: FlowNode) {
  const w = node.type === 'decision' ? 160 : 180;
  const h = node.type === 'decision' ? 70 : 56;
  return { cx: node.x + w / 2, cy: node.y + h / 2 };
}

function EdgeLine({ edge, nodes }: { edge: FlowEdge; nodes: FlowNode[] }) {
  const fromNode = nodes.find(n => n.id === edge.from);
  const toNode = nodes.find(n => n.id === edge.to);
  if (!fromNode || !toNode) return null;

  const from = getNodeCenter(fromNode);
  const to = getNodeCenter(toNode);
  const midY = (from.cy + to.cy) / 2;
  const color = edge.condition ? CONDITION_COLORS[edge.condition] || '#888' : 'hsl(var(--muted-foreground))';

  const path = `M ${from.cx} ${from.cy} C ${from.cx} ${midY}, ${to.cx} ${midY}, ${to.cx} ${to.cy}`;

  return (
    <g>
      <path d={path} fill="none" stroke={color} strokeWidth={2} markerEnd="url(#arrowhead)" />
      {edge.label && (
        <text
          x={(from.cx + to.cx) / 2 + (edge.condition === 'yes' ? -30 : edge.condition === 'no' ? 30 : 0)}
          y={midY - 6}
          textAnchor="middle"
          className="fill-muted-foreground text-[11px] font-medium"
        >
          {edge.label}
        </text>
      )}
    </g>
  );
}

export function FlowCanvas({
  nodes, edges, scripts, selectedNodeId, onSelectNode, onMoveNode,
  onStartConnect, connectingFrom, onCompleteConnect, readOnly
}: FlowCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const getSvgPoint = useCallback((e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - pan.x) / zoom,
      y: (e.clientY - rect.top - pan.y) / zoom,
    };
  }, [pan, zoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    if (readOnly) return;
    if (connectingFrom) {
      onCompleteConnect(nodeId);
      return;
    }
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    const pt = getSvgPoint(e);
    setDragging({ id: nodeId, offsetX: pt.x - node.x, offsetY: pt.y - node.y });
    onSelectNode(nodeId);
  }, [readOnly, connectingFrom, nodes, getSvgPoint, onSelectNode, onCompleteConnect]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging) {
      const pt = getSvgPoint(e);
      onMoveNode(dragging.id, Math.round(pt.x - dragging.offsetX), Math.round(pt.y - dragging.offsetY));
    } else if (isPanning) {
      setPan(prev => ({
        x: prev.x + (e.clientX - panStart.x),
        y: prev.y + (e.clientY - panStart.y),
      }));
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [dragging, isPanning, panStart, getSvgPoint, onMoveNode]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setIsPanning(false);
  }, []);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current || (e.target as Element).tagName === 'rect') {
      onSelectNode(null);
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }
  }, [onSelectNode]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.3, Math.min(2, prev - e.deltaY * 0.001)));
  }, []);

  // Calculate canvas bounds
  const minX = Math.min(0, ...nodes.map(n => n.x)) - 100;
  const minY = Math.min(0, ...nodes.map(n => n.y)) - 100;
  const maxX = Math.max(800, ...nodes.map(n => n.x + 200)) + 100;
  const maxY = Math.max(600, ...nodes.map(n => n.y + 100)) + 100;

  const getScriptTitle = (scriptId: string | null) => {
    if (!scriptId) return null;
    const script = scripts.find(s => s.id === scriptId);
    return script ? script.stage : null;
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-lg border bg-muted/20">
      {/* Zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-background/90 border rounded-md p-1 shadow-sm">
        <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="px-2 py-1 text-xs hover:bg-muted rounded">+</button>
        <span className="text-xs text-muted-foreground w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="px-2 py-1 text-xs hover:bg-muted rounded">−</button>
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="px-2 py-1 text-xs hover:bg-muted rounded ml-1">Reset</button>
      </div>

      {connectingFrom && (
        <div className="absolute top-3 left-3 z-10 bg-amber-500/20 border border-amber-500 text-amber-700 dark:text-amber-300 px-3 py-1.5 rounded-md text-xs font-medium">
          Click a node to connect → or click canvas to cancel
        </div>
      )}

      <svg
        ref={svgRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{ minHeight: '500px' }}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--muted-foreground))" />
          </marker>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.5" />
          </pattern>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {/* Grid background */}
          <rect x={minX} y={minY} width={maxX - minX} height={maxY - minY} fill="url(#grid)" />

          {/* Edges */}
          {edges.map(edge => <EdgeLine key={edge.id} edge={edge} nodes={nodes} />)}

          {/* Nodes */}
          {nodes.map(node => {
            const isSelected = selectedNodeId === node.id;
            const scriptTitle = getScriptTitle(node.scriptId);
            const w = node.type === 'decision' ? 160 : 180;
            const h = node.type === 'decision' ? 70 : 56;

            if (node.type === 'decision') {
              // Diamond shape
              const cx = node.x + w / 2;
              const cy = node.y + h / 2;
              return (
                <g key={node.id} onMouseDown={e => handleMouseDown(e, node.id)} className="cursor-pointer">
                  <polygon
                    points={`${cx},${node.y} ${node.x + w},${cy} ${cx},${node.y + h} ${node.x},${cy}`}
                    className={cn('stroke-2', isSelected ? 'stroke-primary fill-amber-500/20' : 'stroke-amber-500 fill-amber-500/10')}
                    strokeWidth={isSelected ? 3 : 2}
                  />
                  <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-[11px] font-medium pointer-events-none">
                    {node.label.length > 20 ? node.label.slice(0, 18) + '…' : node.label}
                  </text>
                </g>
              );
            }

            const rx = node.type === 'start' || node.type === 'end' ? 20 : 8;
            const colorClass = NODE_COLORS[node.type] || NODE_COLORS.script;

            return (
              <g key={node.id} onMouseDown={e => handleMouseDown(e, node.id)} className="cursor-pointer">
                <rect
                  x={node.x} y={node.y} width={w} height={h} rx={rx}
                  className={cn('stroke-2', isSelected ? 'stroke-ring' : '')}
                  fill={node.type === 'start' ? 'hsl(142, 71%, 45%, 0.15)' : node.type === 'end' ? 'hsl(0, 84%, 60%, 0.15)' : node.type === 'action' ? 'hsl(217, 91%, 60%, 0.15)' : 'hsl(var(--primary) / 0.1)'}
                  stroke={isSelected ? 'hsl(var(--ring))' : node.type === 'start' ? 'hsl(142, 71%, 45%)' : node.type === 'end' ? 'hsl(0, 84%, 60%)' : node.type === 'action' ? 'hsl(217, 91%, 60%)' : 'hsl(var(--primary))'}
                  strokeWidth={isSelected ? 3 : 2}
                />
                <text x={node.x + w / 2} y={node.y + (scriptTitle ? h / 2 - 6 : h / 2)} textAnchor="middle" dominantBaseline="middle" className="fill-foreground text-[11px] font-semibold pointer-events-none">
                  {node.label.length > 22 ? node.label.slice(0, 20) + '…' : node.label}
                </text>
                {scriptTitle && (
                  <text x={node.x + w / 2} y={node.y + h / 2 + 10} textAnchor="middle" dominantBaseline="middle" className="fill-muted-foreground text-[9px] pointer-events-none">
                    📄 {scriptTitle.length > 24 ? scriptTitle.slice(0, 22) + '…' : scriptTitle}
                  </text>
                )}
                {/* Connect handle */}
                {!readOnly && (
                  <circle
                    cx={node.x + w / 2} cy={node.y + h} r={5}
                    fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth={2}
                    className="cursor-crosshair opacity-0 hover:opacity-100 transition-opacity"
                    onMouseDown={e => { e.stopPropagation(); onStartConnect(node.id); }}
                  />
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
