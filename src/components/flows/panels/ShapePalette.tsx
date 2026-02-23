import { useState } from 'react';
import { Play, FileText, Diamond, Zap, Square, Hexagon, ArrowRightLeft, Database, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FlowNode } from '@/hooks/useScriptFlows';

type NodeType = FlowNode['type'];

interface ShapePaletteProps {
  onAddNode: (type: NodeType) => void;
}

interface PaletteItem {
  type: NodeType;
  label: string;
  icon: typeof Play;
  color: string;
}

const CATEGORIES: { label: string; items: PaletteItem[] }[] = [
  {
    label: 'Terminals',
    items: [
      { type: 'start', label: 'Start', icon: Play, color: '#16a34a' },
      { type: 'end', label: 'End', icon: Square, color: '#dc2626' },
    ],
  },
  {
    label: 'Flow',
    items: [
      { type: 'script', label: 'Script', icon: FileText, color: '#2563eb' },
      { type: 'decision', label: 'Decision', icon: Diamond, color: '#d97706' },
      { type: 'action', label: 'Action', icon: Zap, color: '#7c3aed' },
    ],
  },
  {
    label: 'Data',
    items: [
      { type: 'hexagon', label: 'Hexagon', icon: Hexagon, color: '#0891b2' },
      { type: 'parallelogram', label: 'I/O', icon: ArrowRightLeft, color: '#ea580c' },
      { type: 'cylinder', label: 'Storage', icon: Database, color: '#4f46e5' },
      { type: 'document', label: 'Document', icon: FileText, color: '#0d9488' },
    ],
  },
];

export function ShapePalette({ onAddNode }: ShapePaletteProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const handleDragStart = (e: React.DragEvent, type: NodeType) => {
    e.dataTransfer.setData('application/reactflow-nodetype', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  const toggleCategory = (label: string) => {
    setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="absolute left-2 top-2 z-20 flex flex-col bg-background/95 backdrop-blur border rounded-lg shadow-lg w-[150px]">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-2.5 pt-2 pb-1">
        Nodes
      </span>

      {CATEGORIES.map(({ label, items }) => (
        <div key={label}>
          <button
            onClick={() => toggleCategory(label)}
            className="flex items-center justify-between w-full px-2.5 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hover:bg-muted/50 transition-colors"
          >
            {label}
            <ChevronDown
              className={cn(
                'w-3 h-3 transition-transform',
                collapsed[label] && '-rotate-90'
              )}
            />
          </button>

          {!collapsed[label] && (
            <div className="grid grid-cols-2 gap-0.5 px-1.5 pb-1.5">
              {items.map(({ type, label: itemLabel, icon: Icon, color }) => (
                <button
                  key={type}
                  draggable
                  onDragStart={(e) => handleDragStart(e, type)}
                  onClick={() => onAddNode(type)}
                  className={cn(
                    'flex flex-col items-center gap-0.5 px-1 py-1.5 rounded-md',
                    'hover:bg-muted/80 active:bg-muted transition-colors',
                    'cursor-grab active:cursor-grabbing',
                    'select-none text-center'
                  )}
                  title={`Drag or click to add ${itemLabel} node`}
                >
                  <div
                    className="w-7 h-7 rounded flex items-center justify-center"
                    style={{ backgroundColor: color }}
                  >
                    <Icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-[9px] text-foreground leading-tight">{itemLabel}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
