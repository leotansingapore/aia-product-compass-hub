import { Node, mergeAttributes } from '@tiptap/react';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { Trash2, Download, Maximize2, Minimize2, GripVertical } from 'lucide-react';
import { useState, useRef } from 'react';

export const InlineVideoNode = Node.create({
  name: 'inlineVideo',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      width: { default: null },
      alignment: { default: 'center' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="inline-video"]',
        getAttrs: (el) => {
          const element = el as HTMLElement;
          return {
            src: element.getAttribute('data-src'),
            width: element.getAttribute('data-width') ? Number(element.getAttribute('data-width')) : null,
            alignment: element.getAttribute('data-alignment') || 'center',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'inline-video',
        'data-src': HTMLAttributes.src,
        'data-width': HTMLAttributes.width,
        'data-alignment': HTMLAttributes.alignment,
      }),
      'video',
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(InlineVideoComponent);
  },
});

function InlineVideoComponent({ node, updateAttributes, deleteNode, selected }: any) {
  const { src, width, alignment } = node.attrs;
  const [showControls, setShowControls] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const justifyClass =
    alignment === 'left' ? 'justify-start' :
    alignment === 'right' ? 'justify-end' : 'justify-center';

  const handleResizeStart = (e: React.MouseEvent, side: 'left' | 'right') => {
    e.preventDefault();
    setIsResizing(true);
    startXRef.current = e.clientX;
    const el = containerRef.current;
    startWidthRef.current = el ? el.getBoundingClientRect().width : 400;

    const onMove = (ev: MouseEvent) => {
      const diff = side === 'right'
        ? ev.clientX - startXRef.current
        : startXRef.current - ev.clientX;
      const newWidth = Math.max(200, Math.min(startWidthRef.current + diff, 800));
      updateAttributes({ width: Math.round(newWidth) });
    };
    const onUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  return (
    <NodeViewWrapper className={`my-3 flex ${justifyClass}`} data-drag-handle>
      <div
        ref={containerRef}
        className={`relative group rounded-lg overflow-hidden border transition-all ${
          selected ? 'ring-2 ring-primary border-primary' : 'border-border'
        } ${isResizing ? 'select-none' : ''}`}
        style={{ width: width ? `${width}px` : '100%', maxWidth: '100%' }}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Drag handle */}
        <div
          className={`absolute top-2 left-10 z-20 flex items-center justify-center w-6 h-6 rounded bg-black/50 backdrop-blur-sm cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity`}
          title="Drag to reorder"
        >
          <GripVertical className="h-3.5 w-3.5 text-white" />
        </div>

        {/* Platform badge */}
        <div className="absolute top-2 left-2 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">
            MP4
          </span>
        </div>

        {/* Controls */}
        <div
          className={`absolute top-2 right-2 z-10 flex items-center gap-1 transition-opacity duration-200 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Alignment buttons */}
          {(['left', 'center', 'right'] as const).map((a) => (
            <button
              key={a}
              onClick={() => updateAttributes({ alignment: a })}
              className={`p-1 rounded text-[10px] font-medium backdrop-blur-sm transition-colors ${
                alignment === a
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-black/60 text-white hover:bg-black/80'
              }`}
              title={`Align ${a}`}
            >
              {a[0].toUpperCase()}
            </button>
          ))}
          <button
            onClick={() => window.open(src, '_blank')}
            className="p-1.5 rounded-md bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm transition-colors"
            title="Download"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={deleteNode}
            className="p-1.5 rounded-md bg-destructive/80 text-white hover:bg-destructive backdrop-blur-sm transition-colors"
            title="Remove video"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Resize handles */}
        <div
          className="absolute left-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary/20 z-10"
          onMouseDown={(e) => handleResizeStart(e, 'left')}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-primary/20 z-10"
          onMouseDown={(e) => handleResizeStart(e, 'right')}
        />

        {/* Video player */}
        <video
          src={src}
          controls
          className="w-full rounded-lg"
          preload="metadata"
          style={{ display: 'block' }}
        />
      </div>
    </NodeViewWrapper>
  );
}
