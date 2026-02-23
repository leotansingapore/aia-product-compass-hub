import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { GitBranch } from 'lucide-react';
import { cn } from '@/lib/utils';

const handleClass = '!w-2.5 !h-2.5 !bg-primary/70 !border-2 !border-background';

function DecisionNodeInner({ data, selected, isConnectable }: NodeProps) {
  return (
    <div className="relative" style={{ width: 100, height: 100 }}>
      {/* Rotated diamond container */}
      <div
        className={cn(
          'absolute inset-0 border-2 rounded-sm',
          'bg-amber-500/15 border-amber-500',
          'transition-all',
          selected && 'ring-2 ring-primary ring-offset-2'
        )}
        style={{ transform: 'rotate(45deg)' }}
      />

      {/* Counter-rotated content so text reads normally */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center gap-0.5 pointer-events-none"
      >
        <GitBranch className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span className="text-xs font-semibold text-foreground text-center leading-tight max-w-[80px] truncate">
          {data.label || 'Decision'}
        </span>
      </div>

      {/* Handles on all 4 sides (positioned at diamond tips) */}
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className={handleClass}
        style={{ top: 0, left: '50%', transform: 'translate(-50%, -50%)' }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className={handleClass}
        style={{ bottom: 0, left: '50%', transform: 'translate(-50%, 50%)' }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        isConnectable={isConnectable}
        className={handleClass}
        style={{ left: 0, top: '50%', transform: 'translate(-50%, -50%)' }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        isConnectable={isConnectable}
        className={handleClass}
        style={{ left: 0, top: '50%', transform: 'translate(-50%, -50%)' }}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        isConnectable={isConnectable}
        className={handleClass}
        style={{ right: 0, top: '50%', transform: 'translate(50%, -50%)' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        isConnectable={isConnectable}
        className={handleClass}
        style={{ right: 0, top: '50%', transform: 'translate(50%, -50%)' }}
      />
    </div>
  );
}

export const DecisionNode = memo(DecisionNodeInner);
