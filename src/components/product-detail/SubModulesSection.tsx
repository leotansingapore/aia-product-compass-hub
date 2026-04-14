import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProductCard } from "@/components/ProductCard";
import { Layers } from "lucide-react";
import type { Product } from "@/hooks/useProducts";

interface SubModulesSectionProps {
  parentProductId: string;
}

export function SubModulesSection({ parentProductId }: SubModulesSectionProps) {
  const [subModules, setSubModules] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchSubModules() {
      const { data, error } = await supabase
        .from('products')
        .select(`*, categories:category_id(id, name)`)
        .eq('parent_product_id', parentProductId)
        .order('sort_order', { ascending: true })
        .order('title', { ascending: true });

      if (!error && data) {
        // Guard against self-referencing rows (a product listing itself as its own sub-module)
        // and duplicate-title rows that share the parent's title.
        const filtered = data.filter(p => p.id !== parentProductId);
        setSubModules(filtered.map(p => ({
          ...p,
          training_videos: Array.isArray(p.training_videos) ? (p.training_videos as unknown as Product['training_videos']) : [],
        })) as unknown as Product[]);
      }
      setLoading(false);
    }
    fetchSubModules();
  }, [parentProductId]);

  if (loading || subModules.length === 0) return null;

  return (
    <div className="mt-6 sm:mt-8">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <Layers className="h-4 w-4 text-primary" />
        <h2 className="text-base sm:text-lg font-semibold">Sub-modules</h2>
        <span className="text-xs text-muted-foreground">({subModules.length})</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
        {subModules.map(sub => (
          <ProductCard
            key={sub.id}
            title={sub.title}
            description={sub.description || ''}
            category={(sub as any).categories?.name || ''}
            tags={sub.tags || []}
            highlights={sub.highlights || []}
            onClick={() => navigate(`/product/${sub.id}`)}
            productId={sub.id}
            published={sub.published}
          />
        ))}
      </div>
    </div>
  );
}
