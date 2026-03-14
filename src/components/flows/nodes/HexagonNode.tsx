import { memo, useState } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { Hexagon } from 'lucide-react';
import { getNodeColors } from '@/utils/flowColorUtils';
import { cn } from '@/lib/utils';
import { InlineNodeEditor } from './InlineNodeEditor';

function HexagonNodeInner({ data, selected, isConnectable }: NodeProps) {
  const { bg, text, handleBorder } = getNodeColors('hexagonNode', data.color);
  const opacity = data.opacity ?? 1;
  const shadow = data.shadow !== false;
  const fontSize = data.fontSize || 14;
  const [editing, setEditing] = useState(false);

  const handleClass = '!w-3 !h-3 !bg-white !border-2';
  const w = 160;
  const h = 80;
  const inset = 20;
  const points = `${inset},0 ${w - inset},0 ${w},${h / 2} ${w - inset},${h} ${inset},${h} 0,${h / 2}`;

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
        width={w}
        height={h}
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

      <div className="absolute inset-0 flex items-center justify-center gap-1.5 px-6">
        <Hexagon className="w-3.5 h-3.5 shrink-0 pointer-events-none" style={{ color: text }} />
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
            {data.label || 'Process'}
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

export const HexagonNode = memo(HexagonNodeInner);
