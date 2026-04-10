import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableLinks } from "@/components/EditableLinks";
import { FolderBasedUsefulLinks } from "@/components/product-detail/FolderBasedUsefulLinks";
import { ProductFileUpload, type ProductFile } from "@/components/product-detail/ProductFileUpload";
import type { UsefulLink } from "@/hooks/useProducts";
import { ProtectedSection } from "@/components/ProtectedSection";
import { useAdmin } from "@/hooks/useAdmin";
import { Separator } from "@/components/ui/separator";

interface ResourceFolder {
  name: string;
  links: UsefulLink[];
  expanded?: boolean;
}

interface ProductUsefulLinksProps {
  links: UsefulLink[];
  onUpdate: (field: string, value: any) => Promise<void>;
  productId?: string;
}

export function ProductUsefulLinks({ links, onUpdate, productId }: ProductUsefulLinksProps) {
  const { isAdmin } = useAdmin();
  const canEdit = isAdmin;
  
  // Check if this is a Resources module that should use folder-based links
  const resourceModuleIds = [
    'module-1758266631016-n7jff6ewh',
    'module-1759490805756-i6duglldb',
  ];
  const isTermProduct = productId === 'secure-flexi-term' || productId === 'ultimate-critical-cover';
  const isResourcesModule = resourceModuleIds.includes(productId || '') || isTermProduct;

  // --- Data extraction helpers ---
  // The useful_links field can be:
  // 1. A flat array of links (legacy)
  // 2. { type: 'folder_structure', folders: [...] }
  // 3. { type: 'with_files', links: [...], files: [...] } (new format)
  // We need to handle all cases.

  const extractLinks = (data: any): UsefulLink[] => {
    if (Array.isArray(data)) return transformToEditableFormat(data);
    if (data?.type === 'with_files') return transformToEditableFormat(data.links || []);
    return [];
  };

  const extractFiles = (data: any): ProductFile[] => {
    if (data?.type === 'with_files' && Array.isArray(data.files)) return data.files;
    return [];
  };

  const extractFolders = (data: any): ResourceFolder[] => {
    if (data?.type === 'folder_structure' && Array.isArray(data.folders)) {
      return data.folders.map((folder: any) => ({
        name: folder.folder_name || '',
        expanded: true,
        links: (folder.links || []).map((link: any) => ({
          name: link.title || link.name || '',
          url: link.url || '',
          icon: getIconForType(link.type || 'document'),
        })),
      }));
    }
    return [];
  };

  // Transform database format to EditableLinks format
  const transformToEditableFormat = (dbLinks: any[]): UsefulLink[] => {
    if (!Array.isArray(dbLinks)) return [];
    return dbLinks.map((link: any) => ({
      name: link.title || link.name || '',
      url: link.url || '',
      icon: getIconForType(link.type || 'document'),
    }));
  };

  const transformToDbFormat = (editableLinks: UsefulLink[]): any[] => {
    return editableLinks.map((link: UsefulLink) => ({
      title: link.name,
      url: link.url,
      type: getTypeForIcon(link.icon),
    }));
  };

  const getIconForType = (type: string): string => {
    const iconMap: Record<string, string> = {
      'pdf': '📄', 'app': '📱', 'tool': '🛠️', 'document': '📄',
      'link': '🔗', 'video': '🎥', 'guide': '📋',
    };
    return iconMap[type] || '📄';
  };

  const getTypeForIcon = (icon: string): string => {
    const typeMap: Record<string, string> = {
      '📄': 'pdf', '📱': 'app', '🛠️': 'tool', '🔗': 'link', '🎥': 'video', '📋': 'guide',
    };
    return typeMap[icon] || 'document';
  };

  // --- Save handlers ---
  const currentFiles = extractFiles(links);

  const handleLinksSave = async (editableLinks: UsefulLink[]) => {
    const dbFormatLinks = transformToDbFormat(editableLinks);
    // Preserve files when saving links
    if (currentFiles.length > 0) {
      await onUpdate('useful_links', { type: 'with_files', links: dbFormatLinks, files: currentFiles });
    } else {
      await onUpdate('useful_links', dbFormatLinks);
    }
  };

  const handleFilesSave = async (updatedFiles: ProductFile[]) => {
    // Get current links in db format
    const currentLinks = Array.isArray(links) 
      ? links 
      : (links as any)?.links || [];
    
    if (updatedFiles.length > 0 || currentLinks.length > 0) {
      await onUpdate('useful_links', { type: 'with_files', links: currentLinks, files: updatedFiles });
    } else {
      await onUpdate('useful_links', []);
    }
  };

  const handleFolderSave = async (folders: ResourceFolder[]) => {
    const dbFormatFolders = {
      type: 'folder_structure',
      folders: folders.map(folder => ({
        folder_name: folder.name,
        links: folder.links.map(link => ({
          title: link.name, url: link.url, type: getTypeForIcon(link.icon),
        })),
      })),
    };
    await onUpdate('useful_links', dbFormatFolders);
  };

  const transformedLinks = extractLinks(links);
  const productFiles = extractFiles(links);
  const resourceFolders = extractFolders(links);

  return (
    <ProtectedSection sectionId="product_links">
      <Card>
        <CardHeader className="p-3 sm:p-4 md:p-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base md:text-lg">
            <span>🔗</span> Resources
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Links, documents, and files for this product
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 pt-0 space-y-4">
          {/* Links section */}
          {isResourcesModule ? (
            <FolderBasedUsefulLinks
              folders={resourceFolders}
              onSave={canEdit ? handleFolderSave : undefined}
              readOnly={!canEdit}
            />
          ) : (
            <EditableLinks
              links={transformedLinks}
              onSave={canEdit ? handleLinksSave : undefined}
              readOnly={!canEdit}
            />
          )}

          {/* Files section - admin only */}
          {canEdit && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span>📁</span> Uploaded Files
                </h4>
                <ProductFileUpload
                  productId={productId || ''}
                  productName=""
                  files={productFiles}
                  onFilesChange={handleFilesSave}
                  readOnly={!canEdit}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </ProtectedSection>
  );
}
