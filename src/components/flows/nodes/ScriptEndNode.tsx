import { memo, useState } from 'react';
import { Handle, Position, NodeResizer } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { Square } from 'lucide-react';
import { getNodeColors } from '@/utils/flowColorUtils';
import { cn } from '@/lib/utils';
import { InlineNodeEditor } from './InlineNodeEditor';

function ScriptEndNodeInner({ data, selected, isConnectable }: NodeProps) {
  const { bg, text, handleBorder } = getNodeColors('scriptEnd', data.color);
  const opacity = data.opacity ?? 1;
  const shadow = data.shadow !== false;
  const borderStyle = data.borderStyle || 'solid';
  const fontSize = data.fontSize || 14;
  const [editing, setEditing] = useState(false);

  const handleClass = '!w-3 !h-3 !bg-white !border-2';

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-4 py-2 rounded-full border-2 min-w-[160px] justify-center',
        'transition-all',
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
      style={{
        backgroundColor: bg,
        borderColor: bg,
        borderStyle,
        opacity,
        filter: shadow ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' : undefined,
        width: '100%',
        height: '100%',
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={100}
        minHeight={36}
        lineStyle={{ borderColor: 'hsl(var(--primary))' }}
        handleStyle={{ borderColor: 'hsl(var(--primary))', backgroundColor: 'white', width: 10, height: 10 }}
      />
      <Square className="w-3.5 h-3.5 shrink-0" style={{ color: text }} />
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
          {data.label || 'End'}
        </span>
      )}

      <Handle type="target" position={Position.Top} isConnectable={isConnectable}
        className={handleClass} style={{ borderColor: handleBorder }} />
      <Handle type="target" position={Position.Left} id="left" isConnectable={isConnectable}
        className={handleClass} style={{ borderColor: handleBorder }} />
      <Handle type="target" position={Position.Right} id="right" isConnectable={isConnectable}
        className={handleClass} style={{ borderColor: handleBorder }} />
    </div>
  );
}

export const ScriptEndNode = memo(ScriptEndNodeInner);
