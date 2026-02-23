import { useState, useEffect, useRef } from 'react';
import type { Editor } from '@tiptap/react';
import {
  Plus,
  Minus,
  Trash2,
  Rows3,
  Columns3,
} from 'lucide-react';

interface TableControlsProps {
  editor: Editor;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function TableControls({ editor, containerRef }: TableControlsProps) {
  const [isInTable, setIsInTable] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleUpdate = () => {
      const active = editor.isActive('table');
      setIsInTable(active);

      if (active && containerRef.current) {
        // Find the table DOM element from the current selection
        const { node } = editor.view.domAtPos(editor.state.selection.from);
        const tableEl = (node as HTMLElement).closest?.('table')
          || (node.parentElement as HTMLElement)?.closest?.('table');

        if (tableEl && containerRef.current) {
          const containerRect = containerRef.current.getBoundingClientRect();
          const tableRect = tableEl.getBoundingClientRect();

          setPosition({
            top: tableRect.top - containerRect.top - 36,
            left: tableRect.left - containerRect.left,
          });
        }
      } else {
        setPosition(null);
      }
    };

    editor.on('selectionUpdate', handleUpdate);
    editor.on('transaction', handleUpdate);

    return () => {
      editor.off('selectionUpdate', handleUpdate);
      editor.off('transaction', handleUpdate);
    };
  }, [editor, containerRef]);

  if (!isInTable || !position) return null;

  const btn =
    'flex items-center gap-1 px-1.5 py-1 text-[11px] rounded hover:bg-background transition-colors text-foreground/70 hover:text-foreground whitespace-nowrap';
  const sep = 'w-px h-4 bg-border/60 mx-0.5';

  return (
    <div
      ref={controlsRef}
      className="absolute z-20 flex items-center gap-0.5 px-2 py-1 rounded-lg border border-border bg-card shadow-md"
      style={{ top: position.top, left: position.left }}
    >
      <button
        type="button"
        onClick={() => editor.chain().focus().addColumnAfter().run()}
        className={btn}
        title="Add column"
      >
        <Columns3 className="h-3.5 w-3.5" />
        <Plus className="h-2.5 w-2.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().addRowAfter().run()}
        className={btn}
        title="Add row"
      >
        <Rows3 className="h-3.5 w-3.5" />
        <Plus className="h-2.5 w-2.5" />
      </button>

      <div className={sep} />

      <button
        type="button"
        onClick={() => editor.chain().focus().deleteColumn().run()}
        className={btn}
        title="Delete column"
      >
        <Columns3 className="h-3.5 w-3.5" />
        <Minus className="h-2.5 w-2.5" />
      </button>

      <button
        type="button"
        onClick={() => editor.chain().focus().deleteRow().run()}
        className={btn}
        title="Delete row"
      >
        <Rows3 className="h-3.5 w-3.5" />
        <Minus className="h-2.5 w-2.5" />
      </button>

      <div className={sep} />

      <button
        type="button"
        onClick={() => editor.chain().focus().deleteTable().run()}
        className={`${btn} text-destructive hover:text-destructive hover:bg-destructive/10`}
        title="Delete table"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
