import { useCallback, useRef, useState } from 'react';
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
  onDoubleClickNode?: (node: FlowNode) => void;
  onDoubleClickEdge?: (edge: FlowEdge) => void;
  onDoubleClickCanvas?: (x: number, y: number) => void;
  readOnly?: boolean;
}

const NODE_W = 180;
const NODE_H = 56;
const DECISION_W = 160;
const DECISION_H = 70;

const CONDITION_COLORS: Record<string, string> = {
  yes: '#22c55e',
  no: '#ef4444',
  'no-reply': '#f59e0b',
  custom: '#8b5cf6',
};

const TYPE_STYLES: Record<string, { fill: string; stroke: string; icon: string }> = {
  start: { fill: 'hsl(142, 71%, 45%, 0.15)', stroke: 'hsl(142, 71%, 45%)', icon: '▶' },
  script: { fill: 'hsl(var(--primary) / 0.1)', stroke: 'hsl(var(--primary))', icon: '📄' },
  decision: { fill: 'hsl(45, 93%, 47%, 0.15)', stroke: 'hsl(45, 93%, 47%)', icon: '🔀' },
  action: { fill: 'hsl(217, 91%, 60%, 0.15)', stroke: 'hsl(217, 91%, 60%)', icon: '⚡' },
  end: { fill: 'hsl(0, 84%, 60%, 0.15)', stroke: 'hsl(0, 84%, 60%)', icon: '⏹' },
};

function getNodeDims(type: string) {
  return type === 'decision' ? { w: DECISION_W, h: DECISION_H } : { w: NODE_W, h: NODE_H };
}

function getNodeCenter(node: FlowNode) {
  const { w, h } = getNodeDims(node.type);
  return { cx: node.x + w / 2, cy: node.y + h / 2 };
}

function getNodePorts(node: FlowNode) {
  const { w, h } = getNodeDims(node.type);
  return {
    top: { x: node.x + w / 2, y: node.y },
    bottom: { x: node.x + w / 2, y: node.y + h },
    left: { x: node.x, y: node.y + h / 2 },
    right: { x: node.x + w, y: node.y + h / 2 },
  };
}

function closestPorts(fromNode: FlowNode, toNode: FlowNode) {
  const fp = getNodePorts(fromNode);
  const tp = getNodePorts(toNode);
  let minDist = Infinity;
  let best = { from: fp.bottom, to: tp.top };
  for (const [, fv] of Object.entries(fp)) {
    for (const [, tv] of Object.entries(tp)) {
      const d = Math.hypot(fv.x - tv.x, fv.y - tv.y);
      if (d < minDist) { minDist = d; best = { from: fv, to: tv }; }
    }
  }
  return best;
}

function EdgeLine({ edge, nodes, isSelected, onClick }: { edge: FlowEdge; nodes: FlowNode[]; isSelected?: boolean; onClick?: () => void }) {
  const fromNode = nodes.find(n => n.id === edge.from);
  const toNode = nodes.find(n => n.id === edge.to);
  if (!fromNode || !toNode) return null;

  const ports = closestPorts(fromNode, toNode);
  const midX = (ports.from.x + ports.to.x) / 2;
  const midY = (ports.from.y + ports.to.y) / 2;
  const color = edge.condition ? CONDITION_COLORS[edge.condition] || 'hsl(var(--muted-foreground))' : 'hsl(var(--muted-foreground))';

  const dx = ports.to.x - ports.from.x;
  const dy = ports.to.y - ports.from.y;
  const isVertical = Math.abs(dy) > Math.abs(dx);

  const cp1x = isVertical ? ports.from.x : ports.from.x + dx * 0.4;
  const cp1y = isVertical ? ports.from.y + dy * 0.4 : ports.from.y;
  const cp2x = isVertical ? ports.to.x : ports.to.x - dx * 0.4;
  const cp2y = isVertical ? ports.to.y - dy * 0.4 : ports.to.y;

  const path = `M ${ports.from.x} ${ports.from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${ports.to.x} ${ports.to.y}`;

  return (
    <g className="cursor-pointer" onClick={onClick}>
      {/* Wider invisible hit area */}
      <path d={path} fill="none" stroke="transparent" strokeWidth={14} />
      <path
        d={path} fill="none" stroke={isSelected ? 'hsl(var(--primary))' : color}
        strokeWidth={isSelected ? 3 : 2} strokeDasharray={edge.condition === 'no-reply' ? '6 3' : undefined}
        markerEnd="url(#arrowhead)"
        className="transition-all"
      />
      {edge.label && (
        <g>
          <rect x={midX - 24} y={midY - 10} width={48} height={18} rx={4} fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth={1} />
          <text x={midX} y={midY + 3} textAnchor="middle" className="fill-foreground text-[10px] font-medium pointer-events-none">
            {edge.label}
          </text>
        </g>
      )}
    </g>
  );
}

function ConnectHandle({ x, y, onMouseDown }: { x: number; y: number; onMouseDown: (e: React.MouseEvent) => void }) {
  return (
    <g className="connect-handle" onMouseDown={onMouseDown}>
      <circle cx={x} cy={y} r={8} fill="transparent" className="cursor-crosshair" />
      <circle cx={x} cy={y} r={5} fill="hsl(var(--primary))" stroke="hsl(var(--background))" strokeWidth={2}
        className="opacity-0 group-hover:opacity-100 transition-opacity cursor-crosshair" />
    </g>
  );
}

export function FlowCanvas({
  nodes, edges, scripts, selectedNodeId, onSelectNode, onMoveNode,
  onStartConnect, connectingFrom, onCompleteConnect,
  onDoubleClickNode, onDoubleClickEdge, onDoubleClickCanvas,
  readOnly
}: FlowCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

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
    setSelectedEdgeId(null);
  }, [readOnly, connectingFrom, nodes, getSvgPoint, onSelectNode, onCompleteConnect]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (connectingFrom) {
      setMousePos(getSvgPoint(e));
    }
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
  }, [dragging, isPanning, panStart, getSvgPoint, onMoveNode, connectingFrom]);

  const handleMouseUp = useCallback(() => {
    setDragging(null);
    setIsPanning(false);
  }, []);

  const handleCanvasMouseDown = useCallback((e: React.MouseEvent) => {
    if (connectingFrom) {
      setConnectingFrom(null);
      return;
    }
    if (e.target === svgRef.current || (e.target as Element).tagName === 'rect') {
      onSelectNode(null);
      setSelectedEdgeId(null);
      setIsPanning(true);
      setPanStart({ x: e.clientX, y: e.clientY });
    }

    function setConnectingFrom(_: null) {
      // Cancel connecting by clicking canvas - handled by parent
      onSelectNode(null);
    }
  }, [onSelectNode, connectingFrom]);

  const handleCanvasDoubleClick = useCallback((e: React.MouseEvent) => {
    if (readOnly || !onDoubleClickCanvas) return;
    if (e.target === svgRef.current || (e.target as Element).classList.contains('canvas-bg')) {
      const pt = getSvgPoint(e);
      onDoubleClickCanvas(pt.x, pt.y);
    }
  }, [readOnly, onDoubleClickCanvas, getSvgPoint]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom(prev => Math.max(0.3, Math.min(2, prev - e.deltaY * 0.001)));
  }, []);

  const minX = Math.min(0, ...nodes.map(n => n.x)) - 200;
  const minY = Math.min(0, ...nodes.map(n => n.y)) - 200;
  const maxX = Math.max(800, ...nodes.map(n => n.x + 200)) + 200;
  const maxY = Math.max(600, ...nodes.map(n => n.y + 100)) + 200;

  const getScriptTitle = (scriptId: string | null) => {
    if (!scriptId) return null;
    return scripts.find(s => s.id === scriptId)?.stage || null;
  };

  // Connecting line preview
  const connectFromNode = connectingFrom ? nodes.find(n => n.id === connectingFrom) : null;

  return (
    <div className="relative w-full h-full overflow-hidden rounded-xl border bg-muted/10">
      {/* Toolbar overlay */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-background/95 backdrop-blur border rounded-lg p-1 shadow-sm">
        <button onClick={() => setZoom(z => Math.min(2, z + 0.1))} className="px-2 py-1 text-xs hover:bg-muted rounded font-medium">+</button>
        <span className="text-xs text-muted-foreground w-12 text-center font-mono">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="px-2 py-1 text-xs hover:bg-muted rounded font-medium">−</button>
        <div className="w-px h-4 bg-border mx-1" />
        <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }} className="px-2 py-1 text-xs hover:bg-muted rounded text-muted-foreground">Reset</button>
      </div>

      {/* Connecting mode indicator */}
      {connectingFrom && (
        <div className="absolute top-3 left-3 z-10 bg-primary/10 border border-primary/30 text-primary px-3 py-2 rounded-lg text-xs font-medium animate-pulse">
          🔗 Click a target node to connect — or press Esc / click canvas to cancel
        </div>
      )}

      {/* Empty state hint */}
      {nodes.length <= 1 && !readOnly && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-background/95 backdrop-blur border rounded-lg px-4 py-2 shadow-sm text-xs text-muted-foreground text-center max-w-xs">
          💡 <strong>Double-click</strong> the canvas to add a node, or use the toolbar above. Drag the <span className="text-primary font-medium">●</span> handle to connect nodes.
        </div>
      )}

      <svg
        ref={svgRef}
        className={cn("w-full h-full", connectingFrom ? 'cursor-crosshair' : 'cursor-grab active:cursor-grabbing')}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onDoubleClick={handleCanvasDoubleClick}
        style={{ minHeight: '500px' }}
      >
        <defs>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--muted-foreground))" />
          </marker>
          <marker id="arrowhead-primary" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--primary))" />
          </marker>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="0.8" fill="hsl(var(--muted-foreground))" opacity="0.2" />
          </pattern>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          <rect x={minX} y={minY} width={maxX - minX} height={maxY - minY} fill="url(#grid)" className="canvas-bg" />

          {/* Edges */}
          {edges.map(edge => (
            <EdgeLine
              key={edge.id} edge={edge} nodes={nodes}
              isSelected={selectedEdgeId === edge.id}
              onClick={() => {
                setSelectedEdgeId(edge.id);
                onSelectNode(null);
                if (onDoubleClickEdge) {
                  // Single click selects, use dedicated button to edit
                }
              }}
            />
          ))}

          {/* Connecting preview line */}
          {connectFromNode && mousePos && (
            <line
              x1={getNodeCenter(connectFromNode).cx}
              y1={getNodeCenter(connectFromNode).cy}
              x2={mousePos.x} y2={mousePos.y}
              stroke="hsl(var(--primary))" strokeWidth={2} strokeDasharray="6 3" opacity={0.6}
              markerEnd="url(#arrowhead-primary)" pointerEvents="none"
            />
          )}

          {/* Nodes */}
          {nodes.map(node => {
            const isSelected = selectedNodeId === node.id;
            const isConnectTarget = connectingFrom && connectingFrom !== node.id;
            const scriptTitle = getScriptTitle(node.scriptId);
            const style = TYPE_STYLES[node.type] || TYPE_STYLES.script;
            const { w, h } = getNodeDims(node.type);

            if (node.type === 'decision') {
              const cx = node.x + w / 2;
              const cy = node.y + h / 2;
              return (
                <g
                  key={node.id}
                  className={cn("group", isConnectTarget ? 'cursor-crosshair' : 'cursor-pointer')}
                  onMouseDown={e => handleMouseDown(e, node.id)}
                  onDoubleClick={e => { e.stopPropagation(); onDoubleClickNode?.(node); }}
                >
                  {/* Glow on hover/select */}
                  {isSelected && (
                    <polygon
                      points={`${cx},${node.y - 4} ${node.x + w + 4},${cy} ${cx},${node.y + h + 4} ${node.x - 4},${cy}`}
                      fill="none" stroke="hsl(var(--primary))" strokeWidth={1} opacity={0.3}
                    />
                  )}
                  <polygon
                    points={`${cx},${node.y} ${node.x + w},${cy} ${cx},${node.y + h} ${node.x},${cy}`}
                    fill={style.fill} stroke={isSelected ? 'hsl(var(--primary))' : style.stroke}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    className={cn("transition-all", isConnectTarget && 'hover:brightness-125')}
                  />
                  <text x={cx} y={cy - (scriptTitle ? 5 : 0)} textAnchor="middle" dominantBaseline="middle"
                    className="fill-foreground text-[11px] font-medium pointer-events-none">
                    {node.label.length > 18 ? node.label.slice(0, 16) + '…' : node.label}
                  </text>
                  {scriptTitle && (
                    <text x={cx} y={cy + 12} textAnchor="middle" className="fill-muted-foreground text-[9px] pointer-events-none">
                      📄 {scriptTitle.length > 20 ? scriptTitle.slice(0, 18) + '…' : scriptTitle}
                    </text>
                  )}
                  {/* Connect handles */}
                  {!readOnly && (
                    <>
                      <ConnectHandle x={cx} y={node.y} onMouseDown={e => { e.stopPropagation(); onStartConnect(node.id); }} />
                      <ConnectHandle x={node.x + w} y={cy} onMouseDown={e => { e.stopPropagation(); onStartConnect(node.id); }} />
                      <ConnectHandle x={cx} y={node.y + h} onMouseDown={e => { e.stopPropagation(); onStartConnect(node.id); }} />
                      <ConnectHandle x={node.x} y={cy} onMouseDown={e => { e.stopPropagation(); onStartConnect(node.id); }} />
                    </>
                  )}
                </g>
              );
            }

            const rx = node.type === 'start' || node.type === 'end' ? 24 : 10;
            return (
              <g
                key={node.id}
                className={cn("group", isConnectTarget ? 'cursor-crosshair' : 'cursor-pointer')}
                onMouseDown={e => handleMouseDown(e, node.id)}
                onDoubleClick={e => { e.stopPropagation(); onDoubleClickNode?.(node); }}
              >
                {/* Selection highlight */}
                {isSelected && (
                  <rect x={node.x - 3} y={node.y - 3} width={w + 6} height={h + 6} rx={rx + 2}
                    fill="none" stroke="hsl(var(--primary))" strokeWidth={1} opacity={0.3} />
                )}
                <rect
                  x={node.x} y={node.y} width={w} height={h} rx={rx}
                  fill={style.fill} stroke={isSelected ? 'hsl(var(--primary))' : style.stroke}
                  strokeWidth={isSelected ? 2.5 : 1.5}
                  className={cn("transition-all", isConnectTarget && 'hover:brightness-125')}
                />
                {/* Type icon */}
                <text x={node.x + 12} y={node.y + h / 2} textAnchor="middle" dominantBaseline="middle"
                  className="text-[11px] pointer-events-none">
                  {style.icon}
                </text>
                {/* Label */}
                <text x={node.x + 22 + (w - 22) / 2} y={node.y + (scriptTitle ? h / 2 - 6 : h / 2)} textAnchor="middle" dominantBaseline="middle"
                  className="fill-foreground text-[11px] font-semibold pointer-events-none">
                  {node.label.length > 18 ? node.label.slice(0, 16) + '…' : node.label}
                </text>
                {scriptTitle && (
                  <text x={node.x + w / 2} y={node.y + h / 2 + 10} textAnchor="middle"
                    className="fill-muted-foreground text-[9px] pointer-events-none">
                    📄 {scriptTitle.length > 20 ? scriptTitle.slice(0, 18) + '…' : scriptTitle}
                  </text>
                )}
                {/* Connect handles on all 4 sides */}
                {!readOnly && (
                  <>
                    <ConnectHandle x={node.x + w / 2} y={node.y} onMouseDown={e => { e.stopPropagation(); onStartConnect(node.id); }} />
                    <ConnectHandle x={node.x + w} y={node.y + h / 2} onMouseDown={e => { e.stopPropagation(); onStartConnect(node.id); }} />
                    <ConnectHandle x={node.x + w / 2} y={node.y + h} onMouseDown={e => { e.stopPropagation(); onStartConnect(node.id); }} />
                    <ConnectHandle x={node.x} y={node.y + h / 2} onMouseDown={e => { e.stopPropagation(); onStartConnect(node.id); }} />
                  </>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
