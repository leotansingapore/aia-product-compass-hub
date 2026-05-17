import { useCallback, useEffect, useRef, useState } from 'react';
import { Components } from 'react-markdown';
import { detectVideoEmbed } from './video-embed-utils';

// Hook that tracks left/right overflow edges on a horizontally scrollable
// element. Returns a ref to attach to the scroll element and an `edges`
// flag set updated on scroll + resize.
function useScrollEdges<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [edges, setEdges] = useState({ left: false, right: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const overflow = el.scrollWidth - el.clientWidth;
    if (overflow <= 1) {
      setEdges({ left: false, right: false });
      return;
    }
    setEdges({
      left: el.scrollLeft > 1,
      right: el.scrollLeft < overflow - 1,
    });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  return { ref, edges, onScroll: update };
}

// Edge-fade overlays positioned absolutely against a `relative` parent.
function EdgeFades({
  edges,
  fadeColorClass,
}: {
  edges: { left: boolean; right: boolean };
  fadeColorClass: string;
}) {
  return (
    <>
      {edges.right && (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l ${fadeColorClass} to-transparent`}
        />
      )}
      {edges.left && (
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-y-0 left-0 w-12 bg-gradient-to-r ${fadeColorClass} to-transparent`}
        />
      )}
    </>
  );
}

// Wrapper for content that needs its OWN scroll container (e.g. markdown
// tables, where the table itself does not handle overflow). Renders a
// scrollable div with the supplied children inside.
function ScrollableX({
  children,
  className,
  fadeColorClass,
  ariaLabel,
}: {
  children: React.ReactNode;
  className: string;
  fadeColorClass: string;
  ariaLabel: string;
}) {
  const { ref, edges, onScroll } = useScrollEdges<HTMLDivElement>();
  return (
    <div className="relative">
      <div
        ref={ref}
        className={className}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        onScroll={onScroll}
      >
        {children}
      </div>
      <EdgeFades edges={edges} fadeColorClass={fadeColorClass} />
    </div>
  );
}

// <pre> wrapper that keeps the original styling (the pre itself is the
// scroll element) and adds edge-fade overlays. Required because moving the
// scroll responsibility to a wrapping div caused the inner <pre> to be
// constrained to the wrapper width — no horizontal scrolling triggered.
function PreWithFade({ children }: { children: React.ReactNode }) {
  const { ref, edges, onScroll } = useScrollEdges<HTMLPreElement>();
  return (
    <div className="relative mb-3">
      <pre
        ref={ref}
        onScroll={onScroll}
        role="region"
        aria-label="Scrollable code block"
        tabIndex={0}
        className="bg-muted border border-border p-3 rounded-lg text-sm font-mono overflow-x-auto text-foreground shadow-sm"
      >
        {children}
      </pre>
      <EdgeFades edges={edges} fadeColorClass="from-muted" />
    </div>
  );
}

// Inline iframe wrapper — duplicates the markup of VideoEmbed on purpose so
// this module doesn't drag the full VideoEmbed component (and its tree) into
// every chunk that renders markdown. Day pages render dozens of paragraphs;
// the video link case hits at most once or twice per day.
function InlineVideoEmbed({ embedUrl, platform }: { embedUrl: string; platform: string }) {
  if (platform === 'mp4') {
    return (
      <div className="my-4">
        <div
          className="relative w-full bg-black rounded-lg overflow-hidden border border-border shadow-sm"
          style={{ paddingBottom: '56.25%' }}
        >
          <video
            src={embedUrl}
            className="absolute top-0 left-0 w-full h-full"
            controls
            controlsList="nodownload"
            preload="metadata"
            playsInline
          />
        </div>
      </div>
    );
  }
  return (
    <div className="my-4">
      <div className="relative w-full bg-black aspect-video">
        <iframe
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full rounded-lg border border-border shadow-sm"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          style={{ border: 0 }}
          title={`${platform} video`}
        />
      </div>
    </div>
  );
}

/**
 * Unified markdown component configuration for chat interfaces
 * Matches backend formatting instructions for consistent rendering
 */
export const markdownComponents: Components = {
  // Headings with proper hierarchy and spacing
  h1: ({ children }: any) => (
    <h1 className="text-xl font-bold mb-3 mt-4 first:mt-0 text-foreground border-b pb-2">
      {children}
    </h1>
  ),
  h2: ({ children }: any) => (
    <h2 className="text-lg font-semibold mb-2 mt-3 first:mt-0 text-foreground">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => (
    <h3 className="text-base font-semibold mb-2 mt-2 first:mt-0 text-foreground">
      {children}
    </h3>
  ),
  h4: ({ children }: any) => (
    <h4 className="text-sm font-semibold mb-1 mt-2 text-foreground">
      {children}
    </h4>
  ),

  // Paragraphs with proper spacing. Use div when children include a block
  // element so we don't emit invalid HTML (e.g. <div> inside <p>). The most
  // common case is a markdown link whose href points at a video — our `a:`
  // renderer turns that into a div-based InlineVideoEmbed. We detect that
  // ahead of render by re-running the same `detectVideoEmbed` check on
  // anchor children, instead of trying to introspect React component types
  // (which doesn't work because react-markdown passes our `a` override as
  // an opaque function reference).
  p: ({ children }: any) => {
    const childArray = Array.isArray(children) ? children : [children];
    const isBlockChild = (c: any): boolean => {
      if (!c || typeof c !== 'object') return false;
      if (c.type === 'div') return true;
      if (typeof c.props?.className === 'string' && c.props.className.includes('my-4')) return true;
      // Markdown link children — react-markdown passes the original tag as
      // a string `node.tagName` on the props object; for an <a> rendered by
      // our override, we receive the href and can re-detect video URLs.
      if (typeof c.props?.href === 'string' && detectVideoEmbed(c.props.href)) return true;
      // One-level recursion — covers shapes like <strong><link/></strong>.
      if (c.props?.children) {
        const inner = Array.isArray(c.props.children) ? c.props.children : [c.props.children];
        if (inner.some(isBlockChild)) return true;
      }
      return false;
    };
    const hasBlockChild = childArray.some(isBlockChild);
    if (hasBlockChild) {
      return <div className="mb-3 last:mb-0">{children}</div>;
    }
    return (
      <p className="mb-3 last:mb-0 leading-relaxed text-foreground">
        {children}
      </p>
    );
  },

  // Unordered lists with better styling
  ul: ({ children }: any) => (
    <ul className="list-disc list-outside ml-5 mb-3 space-y-1.5 text-foreground">
      {children}
    </ul>
  ),

  // Ordered lists
  ol: ({ children }: any) => (
    <ol className="list-decimal list-outside ml-5 mb-3 space-y-1.5 text-foreground">
      {children}
    </ol>
  ),

  // List items with proper spacing
  li: ({ children }: any) => (
    <li className="text-sm leading-relaxed text-foreground pl-1">
      {children}
    </li>
  ),

  // Bold text (important points, product names)
  strong: ({ children }: any) => (
    <strong className="font-bold text-foreground">
      {children}
    </strong>
  ),

  // Italic text (emphasis)
  em: ({ children }: any) => (
    <em className="italic text-foreground">
      {children}
    </em>
  ),

  // Inline code (technical terms, amounts, product codes)
  code: ({ children, className }: any) => {
    // Check if it's a code block (has language class)
    const isCodeBlock = className?.startsWith('language-');

    if (isCodeBlock) {
      return (
        <code className={`${className} block text-foreground`}>
          {children}
        </code>
      );
    }

    return (
      <code className="bg-muted px-1.5 py-0.5 rounded text-[0.9em] font-mono text-foreground border border-border">
        {children}
      </code>
    );
  },

  // Code blocks with enhanced styling. PreWithFade keeps the original <pre>
  // overflow-x:auto behaviour and adds a right-edge fade hint on mobile.
  pre: ({ children }: any) => <PreWithFade>{children}</PreWithFade>,

  // Blockquotes — suppress empty ones (lone `>` spacers produce no visible content)
  blockquote: ({ children }: any) => {
    const text = typeof children === 'string' ? children : (Array.isArray(children) ? children.join('') : '');
    if (!text.trim()) return null;
    return (
      <blockquote className="border-l-4 border-primary/50 pl-4 py-2 my-3 italic bg-muted/30 rounded-r text-foreground">
        {children}
      </blockquote>
    );
  },

  // Links with hover effects and video embed detection
  a: ({ children, href }: any) => {
    // Check if the link is a video URL
    const videoInfo = detectVideoEmbed(href);
    
    if (videoInfo.isVideo && videoInfo.embedUrl) {
      return <InlineVideoEmbed embedUrl={videoInfo.embedUrl} platform={videoInfo.platform || 'video'} />;
    }
    
    // Regular link
    return (
      <a
        href={href}
        className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  },

  // Images with metadata support (width, alignment, crop from alt text)
  img: ({ src, alt }: any) => {
    // Historical DB content references .png paths under /scripts/, /first-14-days/,
    // and /first-60-days/. Those originals were batch-converted to WebP (up to ~90%
    // smaller). Rewrite on the fly so the browser actually fetches .webp.
    const webpSrc =
      typeof src === "string" &&
      /^\/(scripts|first-14-days|first-60-days)\/.+\.png$/i.test(src)
        ? src.replace(/\.png$/i, ".webp")
        : src;

    let realAlt = alt || '';
    let width: string | undefined;
    let alignment = 'center';
    let cropX = 0, cropY = 0, cropW = 100, cropH = 100;

    const pipeIdx = realAlt.indexOf('|');
    if (pipeIdx !== -1) {
      const metaStr = realAlt.slice(pipeIdx + 1);
      realAlt = realAlt.slice(0, pipeIdx);
      const attrs: Record<string, string> = {};
      metaStr.split(',').forEach((pair: string) => {
        const [k, v] = pair.split('=');
        if (k && v) attrs[k.trim()] = v.trim();
      });
      if (attrs.width) width = attrs.width;
      if (attrs.align) alignment = attrs.align;
      if (attrs.cx) cropX = Number(attrs.cx);
      if (attrs.cy) cropY = Number(attrs.cy);
      if (attrs.cw) cropW = Number(attrs.cw);
      if (attrs.ch) cropH = Number(attrs.ch);
    }

    const hasCrop = cropX !== 0 || cropY !== 0 || cropW !== 100 || cropH !== 100;
    const justifyClass = alignment === 'left' ? 'justify-start' : alignment === 'right' ? 'justify-end' : 'justify-center';

    return (
      <span className={`flex my-2 ${justifyClass}`}>
        <span
          className="inline-block overflow-hidden rounded-md"
          style={{
            width: width ? `${width}px` : undefined,
            maxWidth: '100%',
            ...(hasCrop ? { position: 'relative' as const, paddingBottom: `${(cropH / cropW) * 100}%` } : {}),
          }}
        >
          <img
            src={webpSrc}
            alt={realAlt}
            loading="lazy"
            className={hasCrop ? 'absolute' : 'block w-full rounded-md'}
            style={hasCrop ? {
              left: `${-(cropX / cropW) * 100}%`,
              top: `${-(cropY / cropH) * 100}%`,
              width: `${100 / cropW * 100}%`,
              height: `${100 / cropH * 100}%`,
            } : undefined}
          />
        </span>
      </span>
    );
  },

  // Horizontal rules
  hr: () => (
    <hr className="my-4 border-t border-border" />
  ),

  // Tables — wrap in ScrollableX so wide tables horizontally scroll with a
  // right-edge fade affordance, and narrow tables (2-3 cols) shrink to fit.
  // Previously hardcoded min-w-[640px] forced even 2-col tables to overflow
  // a 390px viewport by ~300px with no visible scroll hint.
  table: ({ children }: any) => (
    <div className="-mx-3 sm:mx-0 mb-3">
      <ScrollableX
        ariaLabel="Scrollable table"
        fadeColorClass="from-card"
        className="overflow-x-auto rounded-lg border border-border [-webkit-overflow-scrolling:touch]"
      >
        <table className="w-full min-w-max divide-y divide-border text-sm">
          {children}
        </table>
      </ScrollableX>
    </div>
  ),
  thead: ({ children }: any) => (
    <thead className="bg-muted">
      {children}
    </thead>
  ),
  tbody: ({ children }: any) => (
    <tbody className="divide-y divide-border bg-background">
      {children}
    </tbody>
  ),
  tr: ({ children }: any) => (
    <tr className="hover:bg-muted/50 transition-colors">
      {children}
    </tr>
  ),
  th: ({ children }: any) => (
    <th className="px-3 py-2 text-left align-top text-[11px] font-semibold uppercase tracking-wider text-foreground whitespace-normal sm:px-4">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-3 py-2 text-sm align-top text-foreground sm:px-4">
      {children}
    </td>
  ),
};
