import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { FlowNode } from '@/hooks/useScriptFlows';
import { NODE_TYPE_DEFAULTS } from '@/utils/flowColorUtils';

interface NodeSearchProps {
  nodes: FlowNode[];
  onFocusNode: (nodeId: string) => void;
}

export function NodeSearch({ nodes, onFocusNode }: NodeSearchProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
    }
  }, [open]);

  const filtered = query.trim()
    ? nodes.filter((n) => n.label.toLowerCase().includes(query.toLowerCase()))
    : [];

  const handleSelect = (nodeId: string) => {
    onFocusNode(nodeId);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Search className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="start">
        <div className="relative">
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search nodes..."
            className="h-8 text-sm pr-7"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {query.trim() && (
          <div className="mt-1 max-h-40 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-xs text-muted-foreground px-2 py-1.5">No matching nodes</p>
            ) : (
              filtered.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleSelect(n.id)}
                  className={cn(
                    'w-full text-left px-2 py-1.5 text-xs rounded hover:bg-muted transition-colors',
                    'flex items-center gap-2'
                  )}
                >
                  <span className="w-2 h-2 rounded-full shrink-0" style={{
                    backgroundColor: NODE_TYPE_DEFAULTS[{
                      start: 'scriptStart', end: 'scriptEnd', script: 'scriptNode', decision: 'decisionNode', action: 'actionNode',
                      hexagon: 'hexagonNode', parallelogram: 'parallelogramNode', cylinder: 'cylinderNode', document: 'documentNode',
                    }[n.type] || ''] || '#94a3b8',
                  }} />
                  <span className="truncate">{n.label}</span>
                  <span className="text-muted-foreground ml-auto capitalize text-[10px]">{n.type}</span>
                </button>
              ))
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
