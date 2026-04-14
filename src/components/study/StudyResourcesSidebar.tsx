import { useProductBySlugOrId } from '@/hooks/useProducts';
import { ExternalLink, FileText, Loader2 } from 'lucide-react';

interface StudyResourcesSidebarProps {
  productSlug: string;
}

interface ResourceLink {
  name: string;
  url: string;
  icon: string;
}

function extractLinks(data: any): ResourceLink[] {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data.map((link: any) => ({
      name: link.title || link.name || '',
      url: link.url || '',
      icon: link.icon || '📄',
    }));
  }
  if (data?.type === 'with_files') {
    return (data.links || []).map((link: any) => ({
      name: link.title || link.name || '',
      url: link.url || '',
      icon: link.icon || '📄',
    }));
  }
  if (data?.type === 'folder_structure' && Array.isArray(data.folders)) {
    return data.folders.flatMap((folder: any) =>
      (folder.links || []).map((link: any) => ({
        name: link.title || link.name || '',
        url: link.url || '',
        icon: link.icon || '📄',
      }))
    );
  }
  return [];
}

export function StudyResourcesSidebar({ productSlug }: StudyResourcesSidebarProps) {
  const { product, loading } = useProductBySlugOrId(productSlug);
  const links = product ? extractLinks(product.useful_links) : [];

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading resources...
        </div>
      </div>
    );
  }

  if (links.length === 0) return null;

  return (
    <div className="rounded-lg border bg-card">
      <div className="p-3 border-b">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          Resources
        </h3>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Quick reference materials
        </p>
      </div>
      <div className="p-2 space-y-0.5">
        {links.map((link, i) => (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-md px-2.5 py-2 text-sm hover:bg-accent transition-colors group"
          >
            <span className="text-base shrink-0">{link.icon}</span>
            <span className="flex-1 truncate">{link.name}</span>
            <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}
