import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

const handleClass = '!w-2.5 !h-2.5 !bg-primary/70 !border-2 !border-background';

function ScriptNodeInner({ data, selected, isConnectable }: NodeProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg border-2 min-w-[160px]',
        'bg-primary/10 border-primary',
        'transition-all',
        selected && 'ring-2 ring-primary ring-offset-2'
      )}
    >
      <div className="flex items-center gap-1.5 w-full justify-center">
        <FileText className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="text-xs font-semibold text-foreground truncate">
          {data.label || 'Script'}
        </span>
      </div>

      {data.scriptId && data.scriptName && (
        <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">
          {'\uD83D\uDCC4'} {data.scriptName}
        </span>
      )}

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

export const ScriptNode = memo(ScriptNodeInner);
