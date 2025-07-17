import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableText } from "@/components/EditableText";
import { CheckCircle } from "lucide-react";
import { ProtectedSection } from "@/components/ProtectedSection";
import { usePermissions } from "@/hooks/usePermissions";

interface ProductHighlightsProps {
  highlights: string[];
  onUpdate: (field: string, value: any) => Promise<void>;
}

export function ProductHighlights({ highlights, onUpdate }: ProductHighlightsProps) {
  const { canEditSection } = usePermissions();
  const canEdit = canEditSection('product_highlights');

  return (
    <ProtectedSection sectionId="product_highlights">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>📊</span> Key Highlights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {highlights?.map((highlight, index) => (
              <div key={index} className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                <EditableText
                  value={highlight}
                  onSave={canEdit ? async (newValue) => {
                    const updatedHighlights = [...(highlights || [])];
                    updatedHighlights[index] = newValue;
                    await onUpdate('highlights', updatedHighlights);
                  } : undefined}
                  className="text-sm flex-1"
                  placeholder="Enter highlight..."
                  readOnly={!canEdit}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </ProtectedSection>
  );
}