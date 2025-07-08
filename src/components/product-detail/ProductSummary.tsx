import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableText } from "@/components/EditableText";

interface ProductSummaryProps {
  description: string;
  onUpdate: (field: string, value: any) => Promise<void>;
}

export function ProductSummary({ description, onUpdate }: ProductSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>🗂️</span> Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <EditableText
          value={description || ''}
          onSave={(newValue) => onUpdate('description', newValue)}
          multiline
          className="text-muted-foreground leading-relaxed"
          placeholder="Add product description..."
        />
      </CardContent>
    </Card>
  );
}