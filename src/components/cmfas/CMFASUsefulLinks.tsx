import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableLinks } from "@/components/EditableLinks";
import type { UsefulLink } from "@/hooks/useProducts";

interface CMFASUsefulLinksProps {
  links: UsefulLink[];
  onUpdate: (field: string, value: any) => Promise<void>;
}

export function CMFASUsefulLinks({ links, onUpdate }: CMFASUsefulLinksProps) {
  return (
    <Card className="bg-gradient-to-br from-card via-card to-muted/20 border-2 hover:shadow-xl transition-all duration-300 group">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
            <span className="text-xl">🔗</span>
          </div>
          <div>
            <span className="bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent font-bold text-xl">
              Useful Links
            </span>
          </div>
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground/80 mt-2">
          Study materials, resources, and references for this CMFAS module
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="bg-muted/30 rounded-xl p-4 border border-muted">
          <EditableLinks
            links={links || []}
            onSave={(newLinks) => onUpdate('useful_links', newLinks)}
          />
        </div>
      </CardContent>
    </Card>
  );
}