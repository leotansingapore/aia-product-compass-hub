import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableLinks } from "@/components/EditableLinks";
import type { UsefulLink } from "@/hooks/useProducts";

interface CMFASUsefulLinksProps {
  links: UsefulLink[];
  onUpdate: (field: string, value: any) => Promise<void>;
}

export function CMFASUsefulLinks({ links, onUpdate }: CMFASUsefulLinksProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🔗</span> Useful Links
        </CardTitle>
        <CardDescription>
          Study materials, resources, and references for this CMFAS module
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