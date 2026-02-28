import { memo, useState } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { FileText } from 'lucide-react';
import { getNodeColors } from '@/utils/flowColorUtils';
import { cn } from '@/lib/utils';
import { InlineNodeEditor } from './InlineNodeEditor';

function ScriptNodeInner({ data, selected, isConnectable }: NodeProps) {
  const { bg, text, handleBorder } = getNodeColors('scriptNode', data.color);
  const opacity = data.opacity ?? 1;
  const shadow = data.shadow !== false;
  const borderStyle = data.borderStyle || 'solid';
  const fontSize = data.fontSize || 14;
  const [editing, setEditing] = useState(false);

  const handleClass = '!w-3 !h-3 !bg-white !border-2';

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg border-2 min-w-[160px]',
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
      <div className="flex items-center gap-1.5 w-full justify-center">
        <FileText className="w-3.5 h-3.5 shrink-0" style={{ color: text }} />
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
            {data.label || 'Script'}
          </span>
        )}
      </div>

      {data.scriptId && data.scriptName && (
        <span
          className="text-[10px] truncate max-w-[140px]"
          style={{ color: text, opacity: 0.8 }}
        >
          {'\uD83D\uDCC4'} {data.scriptName}
        </span>
      )}

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

export const ScriptNode = memo(ScriptNodeInner);

