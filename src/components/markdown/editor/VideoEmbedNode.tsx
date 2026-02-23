import { Node, mergeAttributes } from '@tiptap/react';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import { Maximize2, Minimize2, Trash2, ExternalLink } from 'lucide-react';
import { useState } from 'react';

// Video Embed Node for Tiptap
export const VideoEmbedNode = Node.create({
  name: 'videoEmbed',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      embedUrl: { default: null },
      platform: { default: 'video' },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="video-embed"]',
        getAttrs: (element) => {
          const el = element as HTMLElement;
          return {
            src: el.getAttribute('data-src'),
            embedUrl: el.getAttribute('data-embed-url'),
            platform: el.getAttribute('data-platform'),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // Must include content (the platform label) so turndown doesn't skip this as an empty div
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'video-embed',
        'data-src': HTMLAttributes.src,
        'data-embed-url': HTMLAttributes.embedUrl,
        'data-platform': HTMLAttributes.platform,
      }),
      HTMLAttributes.platform || 'video',
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoEmbedComponent);
  },
});

// React component for the video embed
function VideoEmbedComponent({ node, deleteNode, selected }: any) {
  const { src, embedUrl, platform } = node.attrs;
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);

  const handleFullscreen = () => {
    const el = document.querySelector(`[data-video-src="${src}"]`);
    if (el) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        setIsFullscreen(false);
      } else {
        el.requestFullscreen();
        setIsFullscreen(true);
      }
    }
  };

  const platformLabel = platform.charAt(0).toUpperCase() + platform.slice(1);

  return (
    <NodeViewWrapper className="my-4">
      <div
        data-video-src={src}
        className={`relative rounded-lg overflow-hidden border transition-all ${
          selected ? 'ring-2 ring-primary border-primary' : 'border-border'
        }`}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Platform badge */}
        <div className="absolute top-2 left-2 z-10">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">
            {platformLabel}
          </span>
        </div>

        {/* Control buttons */}
        <div
          className={`absolute top-2 right-2 z-10 flex items-center gap-1 transition-opacity duration-200 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <button
            onClick={() => window.open(src, '_blank')}
            className="p-1.5 rounded-md bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm transition-colors"
            title="Open in new tab"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleFullscreen}
            className="p-1.5 rounded-md bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={deleteNode}
            className="p-1.5 rounded-md bg-destructive/80 text-white hover:bg-destructive backdrop-blur-sm transition-colors"
            title="Remove video"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Video iframe */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={`${platformLabel} video`}
          />
        </div>

        {/* URL display on hover */}
        <div
          className={`absolute bottom-0 left-0 right-0 px-3 py-1.5 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-200 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <p className="text-[11px] text-white/80 truncate font-mono">{src}</p>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
