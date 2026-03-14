import { memo, useState } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { GitBranch } from 'lucide-react';
import { getNodeColors } from '@/utils/flowColorUtils';
import { cn } from '@/lib/utils';
import { InlineNodeEditor } from './InlineNodeEditor';

function DecisionNodeInner({ data, selected, isConnectable }: NodeProps) {
  const { bg, text, handleBorder } = getNodeColors('decisionNode', data.color);
  const opacity = data.opacity ?? 1;
  const shadow = data.shadow !== false;
  const fontSize = data.fontSize || 14;
  const [editing, setEditing] = useState(false);

  const handleClass = '!w-3 !h-3 !bg-white !border-2';
  const size = 110;
  const half = size / 2;
  const points = `${half},0 ${size},${half} ${half},${size} 0,${half}`;

  return (
    <div className="relative" style={{ width: size, height: size, opacity }}>
      <svg
        width={size}
        height={size}
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

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 px-4">
        <GitBranch className="w-3.5 h-3.5 shrink-0 pointer-events-none" style={{ color: text }} />
        {editing ? (
          <InlineNodeEditor
            value={data.label || ''}
            onChange={(val) => data.onLabelChange?.(val)}
            onBlur={() => setEditing(false)}
          />
        ) : (
          <span
            className={cn('font-semibold text-center leading-tight max-w-[70px] truncate cursor-text hover:opacity-80')}
            style={{ color: text, fontSize: `${fontSize}px` }}
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
            title="Click to edit label"
          >
            {data.label || 'Decision'}
          </span>
        )}
      </div>

      {selected && (
        <div
          className="absolute -inset-1.5 rounded-sm ring-2 ring-primary ring-offset-2 ring-offset-background pointer-events-none"
          style={{ transform: 'rotate(45deg)', width: size * 0.72, height: size * 0.72, top: '50%', left: '50%', marginTop: -(size * 0.72) / 2, marginLeft: -(size * 0.72) / 2 }}
        />
      )}

      <Handle type="target" position={Position.Top} isConnectable={isConnectable}
        className={handleClass}
        style={{ top: 0, left: '50%', transform: 'translate(-50%, -50%)', borderColor: handleBorder }} />
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable}
        className={handleClass}
        style={{ bottom: 0, left: '50%', transform: 'translate(-50%, 50%)', borderColor: handleBorder }} />
      <Handle type="target" position={Position.Left} id="left-target" isConnectable={isConnectable}
        className={handleClass}
        style={{ left: 0, top: '50%', transform: 'translate(-50%, -50%)', borderColor: handleBorder }} />
      <Handle type="source" position={Position.Left} id="left-source" isConnectable={isConnectable}
        className={handleClass}
        style={{ left: 0, top: '50%', transform: 'translate(-50%, -50%)', borderColor: handleBorder }} />
      <Handle type="target" position={Position.Right} id="right-target" isConnectable={isConnectable}
        className={handleClass}
        style={{ right: 0, top: '50%', transform: 'translate(50%, -50%)', borderColor: handleBorder }} />
      <Handle type="source" position={Position.Right} id="right-source" isConnectable={isConnectable}
        className={handleClass}
        style={{ right: 0, top: '50%', transform: 'translate(50%, -50%)', borderColor: handleBorder }} />
    </div>
  );
}

export const DecisionNode = memo(DecisionNodeInner);
