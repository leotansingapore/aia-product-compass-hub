import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import type { NodeProps } from 'reactflow';
import { Database } from 'lucide-react';
import { getNodeColors } from '@/utils/flowColorUtils';

function CylinderNodeInner({ data, selected, isConnectable }: NodeProps) {
  const { bg, text, handleBorder } = getNodeColors('cylinderNode', data.color);
  const opacity = data.opacity ?? 1;
  const shadow = data.shadow !== false;
  const fontSize = data.fontSize || 14;

  const handleClass = '!w-3 !h-3 !bg-white !border-2';
  const w = 140;
  const h = 80;
  const ry = 12; // ellipse radius for top/bottom

  // Cylinder path: top ellipse, sides, bottom ellipse
  const d = `
    M 0,${ry}
    A ${w / 2},${ry} 0 0,1 ${w},${ry}
    V ${h - ry}
    A ${w / 2},${ry} 0 0,1 0,${h - ry}
    Z
  `;
  // Top ellipse overlay (visible face)
  const topEllipse = `M 0,${ry} A ${w / 2},${ry} 0 0,0 ${w},${ry} A ${w / 2},${ry} 0 0,0 0,${ry}`;

  return (
    <div className="relative" style={{ width: w, height: h, opacity }}>
      <svg
        width={w}
        height={h}
        className="absolute inset-0"
        style={{ filter: shadow ? 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' : undefined }}
      >
        <path d={d} fill={bg} stroke={selected ? 'hsl(var(--primary))' : bg} strokeWidth={selected ? 3 : 2} />
        <path d={topEllipse} fill={bg} stroke={selected ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.3)'} strokeWidth={1.5} />
      </svg>

      <div className="absolute inset-0 flex items-center justify-center gap-1.5 pointer-events-none px-4" style={{ paddingTop: ry }}>
        <Database className="w-3.5 h-3.5 shrink-0" style={{ color: text }} />
        <span
          className="font-semibold truncate"
          style={{ color: text, fontSize: `${fontSize}px`, lineHeight: '1.3' }}
        >
          {data.label || 'Storage'}
        </span>
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

export const CylinderNode = memo(CylinderNodeInner);
