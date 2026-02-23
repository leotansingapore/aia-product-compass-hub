import { useEffect, useRef } from 'react';

interface InlineNodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  onBlur: () => void;
}

export function InlineNodeEditor({ value, onChange, onBlur }: InlineNodeEditorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-focus and select all text on mount
    const el = inputRef.current;
    if (el) {
      el.focus();
      el.select();
    }
  }, []);

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onBlur}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onBlur();
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          onBlur();
        }
        // Prevent reactflow keyboard shortcuts while editing
        e.stopPropagation();
      }}
      className="w-full bg-background/90 border border-primary/50 rounded px-1.5 py-0.5 text-xs text-center outline-none focus:ring-1 focus:ring-primary"
      style={{ minWidth: 80, maxWidth: 180 }}
    />
  );
}
