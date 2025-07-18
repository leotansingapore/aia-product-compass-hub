import { useState, useEffect, useCallback } from 'react';
import { useAllProducts } from './useProducts';

interface RecentItem {
  id: string;
  timestamp: number;
  type: 'product' | 'category';
}

interface RecentProduct {
  id: string;
  title: string;
  categoryName: string;
  description?: string;
  timestamp: number;
}

export function useRecentlyViewed() {
  const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
  const { allProducts } = useAllProducts();

  useEffect(() => {
    // Load from localStorage
    const stored = localStorage.getItem('recentlyViewed');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRecentItems(parsed);
      } catch (error) {
        console.error('Error parsing recently viewed items:', error);
      }
    }
  }, []);

  const addToRecent = useCallback((id: string, type: 'product' | 'category') => {
    const newItem: RecentItem = {
      id,
      timestamp: Date.now(),
      type
    };

    setRecentItems(prev => {
      const filtered = prev.filter(item => !(item.id === id && item.type === type));
      const updated = [newItem, ...filtered].slice(0, 10);
      localStorage.setItem('recentItems', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getRecentProducts = (): RecentProduct[] => {
    const recentProductItems = recentItems
      .filter(item => item.type === 'product')
      .slice(0, 5);

    return recentProductItems
      .map(item => {
        const product = allProducts.find(p => p.id === item.id);
        if (!product) return null;

        return {
          id: product.id,
          title: product.title,
          categoryName: (product as any).categories?.name || '',
          description: product.description,
          timestamp: item.timestamp
        };
      })
      .filter(Boolean) as RecentProduct[];
  };

  const clearRecent = () => {
    setRecentItems([]);
    localStorage.removeItem('recentlyViewed');
  };

  return {
    recentItems,
    addToRecent,
    getRecentProducts,
    clearRecent
  };
}