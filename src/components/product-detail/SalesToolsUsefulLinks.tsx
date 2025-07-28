import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EditableLinks } from "@/components/EditableLinks";
import type { UsefulLink } from "@/hooks/useProducts";
import { ProtectedSection } from "@/components/ProtectedSection";
import { usePermissions } from "@/hooks/usePermissions";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SalesToolsUsefulLinksProps {
  links: UsefulLink[];
  onUpdate: (field: string, value: any) => Promise<void>;
}

export function SalesToolsUsefulLinks({ links, onUpdate }: SalesToolsUsefulLinksProps) {
  const { canEditSection } = usePermissions();
  const canEdit = canEditSection('product_links');

  // Categorize links based on their names/descriptions
  const categorizeLinks = (links: UsefulLink[]) => {
    const categories = {
      'Generic Objections': [] as UsefulLink[],
      'Tactical Objections': [] as UsefulLink[],
      'Other Resources': [] as UsefulLink[]
    };

    links.forEach(link => {
      const name = link.name.toLowerCase();
      if (name.includes('trust') || name.includes('cost') || name.includes('delay') || 
          name.includes('entrepreneurial') || name.includes('emotional') || 
          name.includes('loyalty') || name.includes('analytical') || name.includes('objection')) {
        categories['Generic Objections'].push(link);
      } else if (name.includes('portfolio') || name.includes('market') || name.includes('ilp') || 
                 name.includes('loading') || name.includes('fwd') || name.includes('ifa') || 
                 name.includes('gtl') || name.includes('robo') || name.includes('mha') || 
                 name.includes('s&p') || name.includes('premium') || name.includes('stress')) {
        categories['Tactical Objections'].push(link);
      } else {
        categories['Other Resources'].push(link);
      }
    });

    return categories;
  };

  const categorizedLinks = categorizeLinks(links);

  const renderCategorySection = (categoryName: string, categoryLinks: UsefulLink[], icon: string) => {
    if (categoryLinks.length === 0) return null;

    return (
      <div key={categoryName} className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-foreground">{categoryName}</h3>
            <Badge variant="secondary" className="text-xs">
              {categoryLinks.length} {categoryLinks.length === 1 ? 'resource' : 'resources'}
            </Badge>
          </div>
        </div>
        
        <div className="bg-muted/30 rounded-xl p-4 border border-muted/50">
          <EditableLinks
            links={categoryLinks}
            onSave={canEdit ? async (newLinks) => {
              // Merge updated category links back with other categories
              const otherCategories = Object.entries(categorizedLinks)
                .filter(([name]) => name !== categoryName)
                .flatMap(([, links]) => links);
              const updatedLinks = [...otherCategories, ...newLinks];
              await onUpdate('useful_links', updatedLinks);
            } : undefined}
            readOnly={!canEdit}
            className="space-y-2"
          />
        </div>
      </div>
    );
  };

  return (
    <ProtectedSection sectionId="product_links">
      <Card className="bg-gradient-to-br from-card via-card to-accent/5 border-2 border-accent/20 shadow-xl">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3">
            <span className="text-3xl">🛠️</span>
            <div>
              <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent font-bold text-2xl">
                Sales Tools & Objection Handling
              </span>
            </div>
          </CardTitle>
          <CardDescription className="text-base text-muted-foreground/80 mt-2">
            Comprehensive resources to handle objections and close deals effectively
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Generic Objections */}
          {renderCategorySection('Generic Objections', categorizedLinks['Generic Objections'], '🧠')}
          
          {/* Separator */}
          {categorizedLinks['Generic Objections'].length > 0 && categorizedLinks['Tactical Objections'].length > 0 && (
            <div className="flex items-center gap-4">
              <Separator className="flex-1" />
              <span className="text-sm text-muted-foreground font-medium">Tactical Responses</span>
              <Separator className="flex-1" />
            </div>
          )}
          
          {/* Tactical Objections */}
          {renderCategorySection('Tactical Objections', categorizedLinks['Tactical Objections'], '⚡')}
          
          {/* Other Resources */}
          {categorizedLinks['Other Resources'].length > 0 && (
            <>
              <Separator />
              {renderCategorySection('Other Resources', categorizedLinks['Other Resources'], '📚')}
            </>
          )}
          
          {/* If user can edit and no links exist */}
          {canEdit && links.length === 0 && (
            <div className="bg-muted/30 rounded-xl p-8 border border-muted/50 text-center">
              <p className="text-muted-foreground mb-4">No objection handling resources added yet</p>
              <EditableLinks
                links={[]}
                onSave={async (newLinks) => await onUpdate('useful_links', newLinks)}
                readOnly={false}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </ProtectedSection>
  );
}
