import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useProductBySlugOrId, getCategoryIdFromName } from "@/hooks/useProducts";
import { getCategorySlugFromId } from "@/utils/slugUtils";
import { useProductUpdate } from "@/hooks/useProductUpdate";
import { useRecentlyViewed } from "@/hooks/useRecentlyViewed";
import { useGamification } from "@/hooks/useGamification";

export function useProductDetail() {
  const { productSlugOrId } = useParams<{ productSlugOrId: string }>();
  const productId = productSlugOrId; // For now, treat as product ID until we implement full product slug support
  const navigate = useNavigate();
  const { product, loading } = useProductBySlugOrId(productId || '');
  const { updateProduct } = useProductUpdate();
  const { addToRecent } = useRecentlyViewed();
  const { recordPageVisit } = useGamification();
  const [assistantOpen, setAssistantOpen] = useState(false);

  // Track product view and award XP - only run once per product
  useEffect(() => {
    if (product) {
      addToRecent(product.id, 'product');
      // Award XP for visiting the product page
      recordPageVisit(product.category_id, product.id);
    }
  }, [product?.id, addToRecent, recordPageVisit]);

  const handleUpdate = async (field: string, value: any) => {
    if (!product) return;
    
    console.log('🎯 ProductDetail handleUpdate called:', { field, value, productId: product.id });
    
    try {
      const updatedData = await updateProduct(product.id, field, value);
      console.log('✅ ProductDetail update successful:', updatedData);
    } catch (error) {
      console.error('❌ ProductDetail update failed:', error);
      throw error;
    }
  };

  const handleBack = () => {
    // Navigate back to the category page using slug
    if (product) {
      const categorySlug = getCategorySlugFromId(product.category_id);
      navigate(`/category/${categorySlug}`);
    } else {
      navigate('/');
    }
  };

  // Enhanced breadcrumbs - special handling for sales tools
  const getBreadcrumbs = () => {
    if (!product) return [];
    
    const categoryName = (product as any).categories?.name || '';
    
    return productId === 'sales-tools-objections' 
      ? [
          { label: 'Home', href: '/' },
          { label: 'Resources', href: '/' },
          { label: product.title }
        ]
      : [
          { label: 'Home', href: '/' },
          { label: categoryName, href: `/category/${product.category_id}` },
          { label: product.title }
        ];
  };

  return {
    product,
    loading,
    productId,
    assistantOpen,
    setAssistantOpen,
    handleUpdate,
    handleBack,
    breadcrumbs: getBreadcrumbs(),
    categoryName: (product as any)?.categories?.name || ''
  };
}