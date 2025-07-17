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
            links={links || []}
            onSave={canEdit ? (newLinks) => onUpdate('useful_links', newLinks) : undefined}
            readOnly={!canEdit}
          />
        </CardContent>
      </Card>
    </ProtectedSection>
  );
}