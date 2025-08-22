import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableLinks } from "@/components/EditableLinks";
import type { UsefulLink } from "@/hooks/useProducts";
import { ProtectedSection } from "@/components/ProtectedSection";
import { usePermissions } from "@/hooks/usePermissions";

interface ProductUsefulLinksProps {
  links: UsefulLink[];
  onUpdate: (field: string, value: any) => Promise<void>;
}

export function ProductUsefulLinks({ links, onUpdate }: ProductUsefulLinksProps) {
  const { canEditSection } = usePermissions();
  const canEdit = canEditSection('product_links');

  // Transform database format to EditableLinks format
  const transformToEditableFormat = (dbLinks: any[]): UsefulLink[] => {
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

  const transformedLinks = transformToEditableFormat(links || []);

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
          <EditableLinks
            links={transformedLinks}
            onSave={canEdit ? handleSave : undefined}
            readOnly={!canEdit}
          />
        </CardContent>
      </Card>
    </ProtectedSection>
  );
}