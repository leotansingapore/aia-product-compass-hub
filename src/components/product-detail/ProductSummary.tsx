import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableText } from "@/components/EditableText";
import { ProtectedSection } from "@/components/ProtectedSection";
import { usePermissions } from "@/hooks/usePermissions";

interface ProductSummaryProps {
  description: string;
  onUpdate: (field: string, value: any) => Promise<void>;
}

export function ProductSummary({ description, onUpdate }: ProductSummaryProps) {
  const { canEditSection } = usePermissions();
  const canEdit = canEditSection('product_summary');

  return (
    <ProtectedSection sectionId="product_summary">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>🗂️</span> Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EditableText
            value={description || ''}
            onSave={canEdit ? (newValue) => onUpdate('description', newValue) : undefined}
            multiline
            className="text-muted-foreground leading-relaxed"
            placeholder="Add product description..."
            readOnly={!canEdit}
          />
        </CardContent>
      </Card>
    </ProtectedSection>
  );
}