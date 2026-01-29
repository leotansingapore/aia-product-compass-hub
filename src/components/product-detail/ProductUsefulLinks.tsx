import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableLinks } from "@/components/EditableLinks";
import { FolderBasedUsefulLinks } from "@/components/product-detail/FolderBasedUsefulLinks";
import type { UsefulLink } from "@/hooks/useProducts";
import { ProtectedSection } from "@/components/ProtectedSection";
import { useAdmin } from "@/hooks/useAdmin";

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
    'module-1758266631016-n7jff6ewh', // Investment Products - Resources
    'module-1759490805756-i6duglldb', // Medical Insurance Products - Resources
  ];

  // Also enable for all Term Products
  const isTermProduct = productId === 'secure-flexi-term' || productId === 'ultimate-critical-cover';

  const isResourcesModule = resourceModuleIds.includes(productId || '') || isTermProduct;

  // Transform database format to EditableLinks format
  const transformToEditableFormat = (dbLinks: any): UsefulLink[] => {
    if (!Array.isArray(dbLinks)) return [];
    return dbLinks.map((link: any) => ({
      name: link.title || link.name || '',
      url: link.url || '',
      icon: getIconForType(link.type || 'document')
    }));
  };

  // Transform EditableLinks format back to database format
  const transformToDbFormat = (editableLinks: UsefulLink[]): any[] => {
    return editableLinks.map((link: UsefulLink) => ({
      title: link.name,
      url: link.url,
      type: getTypeForIcon(link.icon)
    }));
  };

  const getIconForType = (type: string): string => {
    const iconMap: Record<string, string> = {
      'pdf': '📄',
      'app': '📱',
      'tool': '🛠️',
      'document': '📄',
      'link': '🔗',
      'video': '🎥',
      'guide': '📋'
    };
    return iconMap[type] || '📄';
  };

  const getTypeForIcon = (icon: string): string => {
    const typeMap: Record<string, string> = {
      '📄': 'pdf',
      '📱': 'app',
      '🛠️': 'tool',
      '🔗': 'link',
      '🎥': 'video',
      '📋': 'guide'
    };
    return typeMap[icon] || 'document';
  };

  const handleSave = async (editableLinks: UsefulLink[]) => {
    const dbFormatLinks = transformToDbFormat(editableLinks);
    await onUpdate('useful_links', dbFormatLinks);
  };

  const handleFolderSave = async (folders: ResourceFolder[]) => {
    // Convert folder structure to database format
    const dbFormatFolders = {
      type: 'folder_structure',
      folders: folders.map(folder => ({
        folder_name: folder.name,
        links: folder.links.map(link => ({
          title: link.name,
          url: link.url,
          type: getTypeForIcon(link.icon)
        }))
      }))
    };
    await onUpdate('useful_links', dbFormatFolders);
  };

  const transformedLinks = Array.isArray(links) ? transformToEditableFormat(links) : [];

  // Transform database folders to component format
  const transformFoldersFromDb = (dbData: any): ResourceFolder[] => {
    // Check if the data has folder structure format
    if (dbData && typeof dbData === 'object' && dbData.type === 'folder_structure' && Array.isArray(dbData.folders)) {
      return dbData.folders.map((folder: any) => ({
        name: folder.folder_name || '',
        expanded: true,
        links: (folder.links || []).map((link: any) => ({
          name: link.title || link.name || '',
          url: link.url || '',
          icon: getIconForType(link.type || 'document')
        }))
      }));
    }
    return [];
  };

  // Get resource folders from the database
  const resourceFolders = transformFoldersFromDb(links);

  return (
    <ProtectedSection sectionId="product_links">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🔗</span> Useful Links
          </CardTitle>
          <CardDescription>
            Additional resources and materials for this product
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isResourcesModule ? (
            <FolderBasedUsefulLinks
              folders={resourceFolders}
              onSave={canEdit ? handleFolderSave : undefined}
              readOnly={!canEdit}
            />
          ) : (
            <EditableLinks
              links={transformedLinks}
              onSave={canEdit ? handleSave : undefined}
              readOnly={!canEdit}
            />
          )}
        </CardContent>
      </Card>
    </ProtectedSection>
  );
}