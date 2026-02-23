import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { Zap } from 'lucide-react';
import { getNodeColors } from '@/utils/flowColorUtils';
import { cn } from '@/lib/utils';

function ActionNodeInner({ data, selected, isConnectable }: NodeProps) {
  const { bg, text, handleBorder } = getNodeColors('actionNode', data.color);
  const opacity = data.opacity ?? 1;
  const shadow = data.shadow !== false;
  const borderStyle = data.borderStyle || 'solid';
  const fontSize = data.fontSize || 14;

  const handleClass = '!w-3 !h-3 !bg-white !border-2';

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 min-w-[160px] justify-center',
        'transition-all',
        selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background'
      )}
      style={{
        backgroundColor: bg,
        borderColor: bg,
        borderStyle,
        opacity,
        filter: shadow ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' : undefined,
      }}
    >
      <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: text }} />
      <span
        className="font-semibold truncate"
        style={{ color: text, fontSize: `${fontSize}px`, lineHeight: '1.3' }}
      >
        {data.label || 'Action'}
      </span>

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

export const ActionNode = memo(ActionNodeInner);
