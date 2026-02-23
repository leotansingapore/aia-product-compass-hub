import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { Square } from 'lucide-react';
import { cn } from '@/lib/utils';

const handleClass = '!w-2.5 !h-2.5 !bg-primary/70 !border-2 !border-background';

function ScriptEndNodeInner({ data, selected, isConnectable }: NodeProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-4 py-2 rounded-full border-2 min-w-[160px] justify-center',
        'bg-red-500/15 border-red-500',
        'transition-all',
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <Square className="w-3.5 h-3.5 text-red-600 shrink-0" />
      <span className="text-xs font-semibold text-foreground truncate">
        {data.label || 'End'}
      </span>

      {/* Target handles: top, left, right */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className={handleClass}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        isConnectable={isConnectable}
        className={handleClass}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right"
        isConnectable={isConnectable}
        className={handleClass}
      />
    </div>
  );
}

export const ScriptEndNode = memo(ScriptEndNodeInner);
