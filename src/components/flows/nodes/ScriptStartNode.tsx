import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { Play } from 'lucide-react';
import { cn } from '@/lib/utils';

const handleClass = '!w-2.5 !h-2.5 !bg-primary/70 !border-2 !border-background';

function ScriptStartNodeInner({ data, selected, isConnectable }: NodeProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1.5 px-4 py-2 rounded-full border-2 min-w-[160px] justify-center',
        'bg-green-500/15 border-green-500',
        'transition-all',
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <Play className="w-3.5 h-3.5 text-green-600 shrink-0" />
      <span className="text-xs font-semibold text-foreground truncate">
        {data.label || 'Start'}
      </span>

      {/* Source handles: bottom, left, right */}
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className={handleClass}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        isConnectable={isConnectable}
        className={handleClass}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        isConnectable={isConnectable}
        className={handleClass}
      />
    </div>
  );
}

export const ScriptStartNode = memo(ScriptStartNodeInner);
