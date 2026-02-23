import { useState, useCallback, useRef, useEffect } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
  MarkerType,
} from 'reactflow';
import { CONDITION_COLORS } from '@/utils/flowColorUtils';

const DEFAULT_EDGE_COLOR = 'hsl(var(--muted-foreground))';

export default function ScriptFlowEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
  markerEnd,
}: EdgeProps) {
  const { setEdges } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [editValue, setEditValue] = useState(data?.label ?? '');
  const inputRef = useRef<HTMLInputElement>(null);

  const condition = data?.condition as string | undefined;
  const label = data?.label as string | undefined;
  const edgeColor = condition ? CONDITION_COLORS[condition] ?? DEFAULT_EDGE_COLOR : DEFAULT_EDGE_COLOR;
  const isDashed = condition === 'no-reply';

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    borderRadius: 16,
  });

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commitLabel = useCallback(() => {
    const trimmed = editValue.trim();
    setEdges((edges) =>
      edges.map((e) =>
        e.id === id ? { ...e, data: { ...e.data, label: trimmed || undefined } } : e
      )
    );
    setIsEditing(false);
  }, [id, editValue, setEdges]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        commitLabel();
      } else if (e.key === 'Escape') {
        setEditValue(label ?? '');
        setIsEditing(false);
      }
    },
    [commitLabel, label]
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setEdges((edges) => edges.filter((edge) => edge.id !== id));
    },
    [id, setEdges]
  );

  const handleLabelClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setEditValue(label ?? '');
      setIsEditing(true);
    },
    [label]
  );

  const strokeColor = selected ? 'hsl(var(--primary))' : edgeColor;

  return (
    <>
      {/* Wider invisible hit area for easier clicking */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ cursor: 'pointer' }}
      />

      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth: selected ? 2.5 : 2,
          strokeDasharray: isDashed ? '8 4' : undefined,
          transition: 'stroke 0.15s ease, stroke-width 0.15s ease',
        }}
        markerEnd={markerEnd}
      />

      <EdgeLabelRenderer>
        <div
          className="nodrag nopan"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={handleKeyDown}
              className="px-1.5 py-0.5 text-[11px] rounded border border-primary bg-background text-foreground outline-none min-w-[48px] max-w-[120px] text-center shadow-sm"
              style={{ width: `${Math.max(48, editValue.length * 7 + 16)}px` }}
            />
          ) : (
            <div className="relative flex items-center gap-0.5">
              <button
                onClick={handleLabelClick}
                className="px-2 py-0.5 text-[10px] font-medium rounded border shadow-sm cursor-text select-none whitespace-nowrap"
                style={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: condition ? edgeColor : 'hsl(var(--border))',
                  color: condition ? edgeColor : 'hsl(var(--foreground))',
                }}
                title="Click to edit label"
              >
                {label || (
                  <span
                    style={{ color: 'hsl(var(--muted-foreground))' }}
                    className="italic"
                  >
                    ...
                  </span>
                )}
              </button>

              {/* Delete button on hover */}
              {isHovered && (
                <button
                  onClick={handleDelete}
                  className="absolute -top-2 -right-2 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold leading-none shadow-sm transition-opacity"
                  style={{
                    backgroundColor: 'hsl(var(--destructive))',
                    color: 'hsl(var(--destructive-foreground))',
                  }}
                  title="Delete connection"
                >
                  x
                </button>
              )}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
