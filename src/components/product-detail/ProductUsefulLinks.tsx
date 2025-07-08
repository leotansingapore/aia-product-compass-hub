import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableLinks } from "@/components/EditableLinks";
import type { UsefulLink } from "@/hooks/useProducts";

interface ProductUsefulLinksProps {
  links: UsefulLink[];
  onUpdate: (field: string, value: any) => Promise<void>;
}

export function ProductUsefulLinks({ links, onUpdate }: ProductUsefulLinksProps) {
  return (
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
          onSave={(newLinks) => onUpdate('useful_links', newLinks)}
        />
      </CardContent>
    </Card>
  );
}