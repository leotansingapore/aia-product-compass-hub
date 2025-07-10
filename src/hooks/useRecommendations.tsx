import { useState, useEffect, useMemo } from 'react';
import { useAllProducts } from './useProducts';
import { useRecentlyViewed } from './useRecentlyViewed';
import { useBookmarks } from './useBookmarks';

export interface Recommendation {
  id: string;
  title: string;
  description?: string;
  categoryName: string;
  categoryId: string;
  tags?: string[];
  reason: string;
  score: number;
  type: 'similar' | 'trending' | 'complementary' | 'popular' | 'category-based';
}

export function useRecommendations() {
  const { allProducts, loading } = useAllProducts();
  const { getRecentProducts } = useRecentlyViewed();
  const { bookmarks } = useBookmarks();
  const [userInterests, setUserInterests] = useState<string[]>([]);

  // Track user interests based on their behavior
  useEffect(() => {
    const recentProducts = getRecentProducts();
    const interests = new Set<string>();

    // Extract interests from recent products
    recentProducts.forEach(product => {
      const foundProduct = allProducts.find(p => p.id === product.id);
      if (foundProduct) {
        foundProduct.tags?.forEach(tag => interests.add(tag.toLowerCase()));
        interests.add(foundProduct.category_id);
      }
    });

    // Extract interests from bookmarked products
    bookmarks.forEach(bookmark => {
      const product = allProducts.find(p => p.id === bookmark.product_id);
      if (product) {
        product.tags?.forEach(tag => interests.add(tag.toLowerCase()));
        interests.add(product.category_id);
      }
    });

    setUserInterests(Array.from(interests));
  }, [allProducts, getRecentProducts, bookmarks]);

  const getRecommendations = (excludeIds: string[] = [], limit: number = 10): Recommendation[] => {
    if (loading) return [];

    const recentProducts = getRecentProducts();
    const recommendations: Recommendation[] = [];

    // 1. Similar products based on recent views
    recentProducts.slice(0, 3).forEach(recentProduct => {
      const similarProducts = findSimilarProducts(recentProduct.id, excludeIds);
      similarProducts.slice(0, 2).forEach(product => {
        recommendations.push({
          id: product.id,
          title: product.title,
          description: product.description,
          categoryName: (product as any).categories?.name || '',
          categoryId: product.category_id,
          tags: product.tags,
          reason: `Similar to "${recentProduct.title}"`,
          score: 85,
          type: 'similar'
        });
      });
    });

    // 2. Complementary products (products that work well together)
    const complementaryProducts = findComplementaryProducts(excludeIds);
    complementaryProducts.slice(0, 3).forEach(product => {
      recommendations.push({
        id: product.product.id,
        title: product.product.title,
        description: product.product.description,
        categoryName: (product.product as any).categories?.name || '',
        categoryId: product.product.category_id,
        tags: product.product.tags,
        reason: product.reason,
        score: 80,
        type: 'complementary'
      });
    });

    // 3. Category-based recommendations
    const categoryRecommendations = getCategoryBasedRecommendations(excludeIds);
    categoryRecommendations.slice(0, 3).forEach(product => {
      recommendations.push({
        id: product.id,
        title: product.title,
        description: product.description,
        categoryName: (product as any).categories?.name || '',
        categoryId: product.category_id,
        tags: product.tags,
        reason: 'Trending in your interests',
        score: 75,
        type: 'category-based'
      });
    });

    // 4. Popular products (based on having more content)
    const popularProducts = getPopularProducts(excludeIds);
    popularProducts.slice(0, 2).forEach(product => {
      recommendations.push({
        id: product.id,
        title: product.title,
        description: product.description,
        categoryName: (product as any).categories?.name || '',
        categoryId: product.category_id,
        tags: product.tags,
        reason: 'Popular choice with comprehensive content',
        score: 70,
        type: 'popular'
      });
    });

    // Remove duplicates and sort by score
    const uniqueRecommendations = recommendations
      .filter((rec, index, arr) => 
        arr.findIndex(r => r.id === rec.id) === index &&
        !excludeIds.includes(rec.id)
      )
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return uniqueRecommendations;
  };

  const findSimilarProducts = (productId: string, excludeIds: string[]) => {
    const currentProduct = allProducts.find(p => p.id === productId);
    if (!currentProduct) return [];

    return allProducts
      .filter(product => 
        product.id !== productId && 
        !excludeIds.includes(product.id)
      )
      .map(product => {
        let similarity = 0;

        // Same category
        if (product.category_id === currentProduct.category_id) {
          similarity += 40;
        }

        // Shared tags
        const sharedTags = product.tags?.filter(tag => 
          currentProduct.tags?.includes(tag)
        ) || [];
        similarity += sharedTags.length * 15;

        // Similar title words
        const currentWords = currentProduct.title.toLowerCase().split(' ');
        const productWords = product.title.toLowerCase().split(' ');
        const sharedWords = currentWords.filter(word => 
          productWords.includes(word) && word.length > 3
        );
        similarity += sharedWords.length * 10;

        return { product, similarity };
      })
      .filter(item => item.similarity > 30)
      .sort((a, b) => b.similarity - a.similarity)
      .map(item => item.product);
  };

  const findComplementaryProducts = (excludeIds: string[]) => {
    const recentProducts = getRecentProducts();
    const complementaryPairs: { [key: string]: string[] } = {
      'investment': ['insurance', 'savings', 'retirement'],
      'term': ['investment', 'medical', 'savings'],
      'endowment': ['term', 'medical', 'investment'],
      'medical': ['term', 'investment', 'life'],
      'whole-life': ['investment', 'medical', 'endowment']
    };

    const results: { product: any; reason: string }[] = [];

    recentProducts.forEach(recentProduct => {
      const recentProductData = allProducts.find(p => p.id === recentProduct.id);
      if (!recentProductData) return;

      const productType = getProductType(recentProductData);
      const complementaryTypes = complementaryPairs[productType] || [];

      complementaryTypes.forEach(compType => {
        const complementaryProducts = allProducts.filter(product => 
          !excludeIds.includes(product.id) &&
          product.id !== recentProduct.id &&
          getProductType(product) === compType
        );

        complementaryProducts.slice(0, 1).forEach(product => {
          results.push({
            product,
            reason: `Complements your interest in ${recentProductData.title}`
          });
        });
      });
    });

    return results;
  };

  const getProductType = (product: any): string => {
    const title = product.title.toLowerCase();
    const tags = product.tags?.map((tag: string) => tag.toLowerCase()) || [];

    if (title.includes('term') || tags.includes('term')) return 'term';
    if (title.includes('endowment') || tags.includes('endowment')) return 'endowment';
    if (title.includes('medical') || title.includes('health') || tags.includes('medical')) return 'medical';
    if (title.includes('whole') || title.includes('life') || tags.includes('whole-life')) return 'whole-life';
    if (title.includes('investment') || title.includes('wealth') || tags.includes('investment')) return 'investment';
    
    return 'general';
  };

  const getCategoryBasedRecommendations = (excludeIds: string[]) => {
    const userCategoryInterests = userInterests.filter(interest => 
      allProducts.some(p => p.category_id === interest)
    );

    const categoryProducts = allProducts.filter(product =>
      userCategoryInterests.includes(product.category_id) &&
      !excludeIds.includes(product.id)
    );

    return categoryProducts.slice(0, 5);
  };

  const getPopularProducts = (excludeIds: string[]) => {
    return allProducts
      .filter(product => !excludeIds.includes(product.id))
      .map(product => {
        let popularity = 0;
        
        // Products with more content are considered more popular
        if (product.training_videos && Array.isArray(product.training_videos)) {
          popularity += product.training_videos.length * 10;
        }
        if (product.useful_links && Array.isArray(product.useful_links)) {
          popularity += product.useful_links.length * 5;
        }
        if (product.highlights && Array.isArray(product.highlights)) {
          popularity += product.highlights.length * 3;
        }
        if (product.tags && Array.isArray(product.tags)) {
          popularity += product.tags.length * 2;
        }

        return { product, popularity };
      })
      .filter(item => item.popularity > 15)
      .sort((a, b) => b.popularity - a.popularity)
      .map(item => item.product);
  };

  const getPersonalizedRecommendations = (limit: number = 6): Recommendation[] => {
    const recentProductIds = getRecentProducts().map(p => p.id);
    const bookmarkedIds = bookmarks.map(p => p.product_id);
    const excludeIds = [...recentProductIds, ...bookmarkedIds];

    return getRecommendations(excludeIds, limit);
  };

  return {
    getRecommendations,
    getPersonalizedRecommendations,
    userInterests,
    loading
  };
}