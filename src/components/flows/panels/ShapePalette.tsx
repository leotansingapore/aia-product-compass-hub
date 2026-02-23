import { Play, FileText, Diamond, Zap, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

type NodeType = 'start' | 'script' | 'decision' | 'action' | 'end';

interface ShapePaletteProps {
  onAddNode: (type: NodeType) => void;
}

const PALETTE_ITEMS: { type: NodeType; label: string; icon: typeof Play; color: string }[] = [
  { type: 'start', label: 'Start', icon: Play, color: 'text-green-500' },
  { type: 'script', label: 'Script', icon: FileText, color: 'text-blue-500' },
  { type: 'decision', label: 'Decision', icon: Diamond, color: 'text-amber-500' },
  { type: 'action', label: 'Action', icon: Zap, color: 'text-blue-500' },
  { type: 'end', label: 'End', icon: Square, color: 'text-red-500' },
];

export function ShapePalette({ onAddNode }: ShapePaletteProps) {
  const handleDragStart = (e: React.DragEvent, type: NodeType) => {
    e.dataTransfer.setData('application/reactflow-nodetype', type);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="absolute left-2 top-2 z-20 flex flex-col gap-1 bg-background/95 backdrop-blur border-r border rounded-lg p-1.5 shadow-lg">
      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider px-1.5 pb-0.5">
        Nodes
      </span>
      {PALETTE_ITEMS.map(({ type, label, icon: Icon, color }) => (
        <button
          key={type}
          draggable
          onDragStart={(e) => handleDragStart(e, type)}
          onClick={() => onAddNode(type)}
          className={cn(
            'flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium',
            'hover:bg-muted/80 active:bg-muted transition-colors',
            'cursor-grab active:cursor-grabbing',
            'select-none'
          )}
          title={`Drag or click to add ${label} node`}
        >
          <Icon className={cn('w-4 h-4 shrink-0', color)} />
          <span className="text-foreground">{label}</span>
        </button>
      ))}
    </div>
  );
}
