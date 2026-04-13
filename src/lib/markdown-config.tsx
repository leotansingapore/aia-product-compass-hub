import { Components } from 'react-markdown';
import { detectVideoEmbed, VideoEmbed } from './video-embed-utils';

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

  // Paragraphs with proper spacing — use div if children contain a block element (e.g. VideoEmbed)
  p: ({ children }: any) => {
    const childArray = Array.isArray(children) ? children : [children];
    const hasBlockChild = childArray.some(
      (c: any) => c?.type === 'div' || (typeof c === 'object' && c?.props?.className?.includes('my-4'))
    );
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

  // Code blocks with enhanced styling
  pre: ({ children }: any) => (
    <pre className="bg-muted border border-border p-3 rounded-lg text-sm font-mono overflow-x-auto mb-3 text-foreground shadow-sm">
      {children}
    </pre>
  ),

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
      return <VideoEmbed embedUrl={videoInfo.embedUrl} platform={videoInfo.platform || 'video'} />;
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
            src={src}
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

  // Tables (if needed)
  table: ({ children }: any) => (
    <div className="overflow-x-auto mb-3">
      <table className="min-w-full divide-y divide-border border border-border rounded-lg">
        {children}
      </table>
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
    <th className="px-4 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider">
      {children}
    </th>
  ),
  td: ({ children }: any) => (
    <td className="px-4 py-2 text-sm text-foreground">
      {children}
    </td>
  ),
};
