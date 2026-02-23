import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const handleClass = '!w-2.5 !h-2.5 !bg-primary/70 !border-2 !border-background';

function ActionNodeInner({ data, selected, isConnectable }: NodeProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 min-w-[160px] justify-center',
        'bg-blue-500/15 border-blue-500',
        'transition-all',
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <Zap className="w-3.5 h-3.5 text-blue-600 shrink-0" />
      <span className="text-xs font-semibold text-foreground truncate">
        {data.label || 'Action'}
      </span>

      {/* Target: top */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className={handleClass}
      />
      {/* Source: bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className={handleClass}
      />
      {/* Left: both source and target */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        isConnectable={isConnectable}
        className={handleClass}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        isConnectable={isConnectable}
        className={handleClass}
      />
      {/* Right: both source and target */}
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        isConnectable={isConnectable}
        className={handleClass}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        isConnectable={isConnectable}
        className={handleClass}
      />
    </div>
  );
}

export const ActionNode = memo(ActionNodeInner);
