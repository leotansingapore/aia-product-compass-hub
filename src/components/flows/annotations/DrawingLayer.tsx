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
  currentUserId?: string;
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
  currentUserId,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [activePath, setActivePath] = useState<{ points: [number, number][] } | null>(null);
  const [selectedDrawing, setSelectedDrawing] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const drawings = annotations.filter(a => a.type === 'drawing');

  // Pointer drawing — one code path for mouse, touch and stylus
  useEffect(() => {
    if (!isDrawing || !containerRef.current) return;
    const el = containerRef.current;

    // Stop the browser claiming the gesture for panning/zooming while the pen is armed
    const prevTouchAction = el.style.touchAction;
    el.style.touchAction = 'none';

    const getPos = (e: PointerEvent): [number, number] => {
      const rect = el.getBoundingClientRect();
      return [e.clientX - rect.left, e.clientY - rect.top];
    };

    let currentPoints: [number, number][] = [];
    let drawing = false;
    let activePointerId: number | null = null;

    const onDown = (e: PointerEvent) => {
      // Ignore secondary mouse buttons and extra fingers of a pinch
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (!e.isPrimary || drawing) return;
      // Using the toolbar must not start a stroke underneath it
      if ((e.target as HTMLElement | null)?.closest('[data-annotation-toolbar]')) return;
      drawing = true;
      activePointerId = e.pointerId;
      try { el.setPointerCapture(e.pointerId); } catch { /* capture unsupported */ }
      const pt = getPos(e);
      currentPoints = [pt];
      setActivePath({ points: [pt] });
    };
    const onMove = (e: PointerEvent) => {
      if (!drawing || e.pointerId !== activePointerId) return;
      const pt = getPos(e);
      currentPoints = [...currentPoints, pt];
      setActivePath({ points: currentPoints });
    };
    const onCancel = (e: PointerEvent) => {
      if (e.pointerId !== activePointerId) return;
      drawing = false;
      activePointerId = null;
      currentPoints = [];
      setActivePath(null);
    };
    const onUp = (e: PointerEvent) => {
      if (e.pointerId !== activePointerId) return;
      activePointerId = null;
      try { el.releasePointerCapture(e.pointerId); } catch { /* already released */ }
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

    // Pointer capture keeps move/up on the container even if the finger leaves it
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onCancel);
    return () => {
      el.style.touchAction = prevTouchAction;
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onCancel);
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
            style={{ left: sx, top: sy, zIndex: 20, overflow: 'visible', touchAction: 'none' }}
            width={w * zoom}
            height={h * zoom}
            // Only the author has an action here, so only they get a button
            role={currentUserId === ann.user_id ? 'button' : 'img'}
            tabIndex={currentUserId === ann.user_id ? 0 : undefined}
            aria-label={currentUserId === ann.user_id
              ? `Drawing by ${ann.author_name}. Press Enter to select it, then use the delete button.`
              : `Drawing by ${ann.author_name}`}
            aria-pressed={currentUserId === ann.user_id ? selectedDrawing === ann.id : undefined}
            onClick={() => setSelectedDrawing(selectedDrawing === ann.id ? null : ann.id)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                setSelectedDrawing(selectedDrawing === ann.id ? null : ann.id);
              } else if (e.key === 'Escape' && selectedDrawing === ann.id) {
                e.stopPropagation();
                setSelectedDrawing(null);
                setConfirmDeleteId(null);
              }
            }}
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
                {/* Only the author can delete (RLS drops other users' deletes anyway) */}
                {currentUserId === ann.user_id && (
                  <foreignObject x={w * zoom - 4} y={-16} width={confirmDeleteId === ann.id ? 60 : 20} height={20}>
                    <button
                      type="button"
                      className={`h-5 ${confirmDeleteId === ann.id ? 'px-1.5 ring-2 ring-destructive/50' : 'w-5'} bg-destructive text-white rounded-full text-xs flex items-center justify-center shadow whitespace-nowrap relative after:absolute after:content-[''] after:-inset-[8px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive`}
                      aria-label={confirmDeleteId === ann.id ? 'Press again to confirm deleting this drawing' : `Delete drawing by ${ann.author_name}`}
                      title={confirmDeleteId === ann.id ? 'Click again to confirm delete' : 'Delete drawing'}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirmDeleteId === ann.id) {
                          onDelete(ann.id);
                          setSelectedDrawing(null);
                          setConfirmDeleteId(null);
                        } else {
                          setConfirmDeleteId(ann.id);
                          setTimeout(() => setConfirmDeleteId(prev => (prev === ann.id ? null : prev)), 3000);
                        }
                      }}
                    >
                      {confirmDeleteId === ann.id ? 'Sure?' : '×'}
                    </button>
                  </foreignObject>
                )}
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
