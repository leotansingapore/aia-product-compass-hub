import { useRef, useState, useEffect } from 'react';
import type { FlowAnnotation } from '@/hooks/useFlowAnnotations';

interface DrawingPath {
  d: string;
  color: string;
  width: number;
}

interface Props {
  annotations: FlowAnnotation[];
  isDrawing: boolean;
  penColor: string;
  penWidth: number;
  onSaveDrawing: (paths: DrawingPath[], x: number, y: number) => void;
  containerRef: React.RefObject<HTMLDivElement>;
  onDelete: (id: string) => void;
  zoom: number;
  panX: number;
  panY: number;
}

export function DrawingLayer({
  annotations,
  isDrawing,
  penColor,
  penWidth,
  onSaveDrawing,
  containerRef,
  onDelete,
  zoom,
  panX,
  panY,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activePath, setActivePath] = useState<{ points: [number, number][] } | null>(null);
  const [selectedDrawing, setSelectedDrawing] = useState<string | null>(null);

  const drawings = annotations.filter(a => a.type === 'drawing');

  // Mouse drawing
  useEffect(() => {
    if (!isDrawing || !containerRef.current) return;
    const el = containerRef.current;

    const getPos = (e: MouseEvent): [number, number] => {
      const rect = el.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    };

    let currentPoints: [number, number][] = [];
    let drawing = false;

    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      drawing = true;
      const pt = getPos(e);
      currentPoints = [pt];
      setActivePath({ points: [pt] });
    };
    const onMove = (e: MouseEvent) => {
      if (!drawing) return;
      const pt = getPos(e);
      currentPoints = [...currentPoints, pt];
      setActivePath({ points: currentPoints });
    };
    const onUp = () => {
      if (!drawing || currentPoints.length < 2) {
        drawing = false;
        setActivePath(null);
        currentPoints = [];
        return;
      }
      drawing = false;
      // Convert screen points to flow coords
      const flowPoints = currentPoints.map(([x, y]): [number, number] => [
        (x - panX) / zoom,
        (y - panY) / zoom,
      ]);
      // Build SVG path relative to bounding box top-left
      const xs = flowPoints.map(p => p[0]);
      const ys = flowPoints.map(p => p[1]);
      const minX = Math.min(...xs);
      const minY = Math.min(...ys);
      const d = flowPoints.map(([x, y], i) =>
        `${i === 0 ? 'M' : 'L'} ${(x - minX).toFixed(1)} ${(y - minY).toFixed(1)}`
      ).join(' ');

      onSaveDrawing([{ d, color: penColor, width: penWidth / zoom }], minX, minY);
      setActivePath(null);
      currentPoints = [];
    };

    el.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [isDrawing, penColor, penWidth, zoom, panX, panY, containerRef, onSaveDrawing]);

  // Compute bounding box for a saved drawing
  const getBBox = (paths: DrawingPath[]) => {
    let maxX = 0, maxY = 0;
    for (const p of paths) {
      const coords = p.d.match(/[-\d.]+/g);
      if (!coords) continue;
      for (let i = 0; i < coords.length - 1; i += 2) {
        maxX = Math.max(maxX, parseFloat(coords[i]));
        maxY = Math.max(maxY, parseFloat(coords[i + 1]));
      }
    }
    return { w: maxX + 20, h: maxY + 20 };
  };

  return (
    <>
      {/* Saved drawings */}
      {drawings.map(ann => {
        const paths = (ann.drawing_paths as DrawingPath[]) || [];
        const { w, h } = getBBox(paths);
        const sx = ann.x * zoom + panX;
        const sy = ann.y * zoom + panY;
        return (
          <svg
            key={ann.id}
            className="absolute pointer-events-auto group cursor-pointer"
            style={{ left: sx, top: sy, zIndex: 20, overflow: 'visible' }}
            width={w * zoom}
            height={h * zoom}
            onClick={() => setSelectedDrawing(selectedDrawing === ann.id ? null : ann.id)}
          >
            {paths.map((p, i) => (
              <path
                key={i}
                d={scalePathD(p.d, zoom)}
                stroke={p.color}
                strokeWidth={p.width * zoom}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
            {selectedDrawing === ann.id && (
              <g>
                <rect
                  x={-4} y={-4}
                  width={w * zoom + 8}
                  height={h * zoom + 8}
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth={1.5}
                  strokeDasharray="4 2"
                  rx={4}
                />
                <foreignObject x={w * zoom - 4} y={-16} width={20} height={20}>
                  <button
                    className="w-5 h-5 bg-destructive text-white rounded-full text-xs flex items-center justify-center shadow"
                    onClick={(e) => { e.stopPropagation(); onDelete(ann.id); setSelectedDrawing(null); }}
                  >
                    ×
                  </button>
                </foreignObject>
              </g>
            )}
          </svg>
        );
      })}

      {/* Live drawing preview */}
      {activePath && activePath.points.length > 1 && (
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 30, width: '100%', height: '100%', overflow: 'visible' }}
        >
          <path
            d={activePath.points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x} ${y}`).join(' ')}
            stroke={penColor}
            strokeWidth={penWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </>
  );
}

function scalePathD(d: string, zoom: number): string {
  return d.replace(/([-\d.]+)\s+([-\d.]+)/g, (_, x, y) =>
    `${parseFloat(x) * zoom} ${parseFloat(y) * zoom}`
  );
}
