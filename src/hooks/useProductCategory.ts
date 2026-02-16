import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts, useCategories } from '@/hooks/useProducts';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { getCategoryIdFromSlug, getCategorySlugFromId, isUUID } from '@/utils/slugUtils';

export function useProductCategory() {
  const { categorySlugOrId } = useParams<{ categorySlugOrId: string }>();
  const navigate = useNavigate();
  const { categories, refetch: refetchCategories } = useCategories();
  const { addToRecent } = useRecentlyViewed();
  
  // Handle both slug and UUID routing for backward compatibility
  const categoryId = isUUID(categorySlugOrId || '') ? categorySlugOrId : getCategoryIdFromSlug(categorySlugOrId || '');
  
  const { products, loading, refetch } = useProducts(categoryId);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Find the category by ID from the database
  const category = categories.find(cat => cat.id === categoryId);
  
  // Redirect UUID-based URLs to slug-based URLs
  useEffect(() => {
    if (categorySlugOrId && isUUID(categorySlugOrId) && categoryId) {
      const slug = getCategorySlugFromId(categoryId);
      if (slug !== categoryId) {
        navigate(`/category/${slug}`, { replace: true });
      }
    }
  }, [categorySlugOrId, categoryId, navigate]);
  
  // Track category view
  useEffect(() => {
    if (categoryId && category?.id) {
      addToRecent(categoryId, 'category');
    }
  }, [categoryId, category?.id, addToRecent]);

  // Filter products based on search and tags
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => product.tags?.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
  };

  const handleBack = () => {
    navigate('/');
  };

  return {
    categorySlugOrId,
    categoryId,
    category,
    products: filteredProducts,
    loading,
    searchQuery,
    selectedTags,
    refetch,
    refetchCategories,
    handleSearch,
    handleProductClick,
    clearFilters,
    setSelectedTags,
    handleBack
  };
}