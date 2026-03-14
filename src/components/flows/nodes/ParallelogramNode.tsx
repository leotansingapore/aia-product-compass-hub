import { memo, useState } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { ArrowRightLeft } from 'lucide-react';
import { getNodeColors } from '@/utils/flowColorUtils';
import { InlineNodeEditor } from './InlineNodeEditor';

function ParallelogramNodeInner({ data, selected, isConnectable }: NodeProps) {
  const { bg, text, handleBorder } = getNodeColors('parallelogramNode', data.color);
  const opacity = data.opacity ?? 1;
  const shadow = data.shadow !== false;
  const fontSize = data.fontSize || 14;
  const [editing, setEditing] = useState(false);

  const handleClass = '!w-3 !h-3 !bg-white !border-2';
  const w = 170;
  const h = 60;
  const skew = 25;
  const points = `${skew},0 ${w},0 ${w - skew},${h} 0,${h}`;

  return (
    <div className="relative" style={{ width: '100%', height: '100%', minWidth: w, minHeight: h, opacity }}>
      <NodeResizer
        isVisible={selected}
        minWidth={w}
        minHeight={h}
        lineStyle={{ borderColor: 'hsl(var(--primary))' }}
        handleStyle={{ borderColor: 'hsl(var(--primary))', backgroundColor: 'white', width: 10, height: 10 }}
      />
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
        className="absolute inset-0"
        style={{ filter: shadow ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' : undefined }}
      >
        <polygon
          points={points}
          fill={bg}
          stroke={selected ? 'hsl(var(--primary))' : bg}
          strokeWidth={selected ? 3 : 2}
        />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center gap-1.5 px-8">
        <ArrowRightLeft className="w-3.5 h-3.5 shrink-0 pointer-events-none" style={{ color: text }} />
        {editing ? (
          <InlineNodeEditor
            value={data.label || ''}
            onChange={(val) => data.onLabelChange?.(val)}
            onBlur={() => setEditing(false)}
          />
        ) : (
          <span
            className="font-semibold truncate cursor-text hover:opacity-80"
            style={{ color: text, fontSize: `${fontSize}px`, lineHeight: '1.3' }}
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
            title="Click to edit label"
          >
            {data.label || 'Input/Output'}
          </span>
        )}
      </div>

      <Handle type="target" position={Position.Top} isConnectable={isConnectable}
        className={handleClass} style={{ borderColor: handleBorder }} />
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable}
        className={handleClass} style={{ borderColor: handleBorder }} />
      <Handle type="target" position={Position.Left} id="left-target" isConnectable={isConnectable}
        className={handleClass} style={{ borderColor: handleBorder }} />
      <Handle type="source" position={Position.Left} id="left-source" isConnectable={isConnectable}
        className={handleClass} style={{ borderColor: handleBorder }} />
      <Handle type="target" position={Position.Right} id="right-target" isConnectable={isConnectable}
        className={handleClass} style={{ borderColor: handleBorder }} />
      <Handle type="source" position={Position.Right} id="right-source" isConnectable={isConnectable}
        className={handleClass} style={{ borderColor: handleBorder }} />
    </div>
  );
}

export const ParallelogramNode = memo(ParallelogramNodeInner);
