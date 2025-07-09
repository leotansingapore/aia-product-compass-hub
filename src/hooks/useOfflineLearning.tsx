import { useState, useEffect } from 'react';
import { useAllProducts } from './useProducts';

interface OfflineContent {
  productId: string;
  title: string;
  description?: string;
  highlights?: string[];
  tags?: string[];
  categoryName: string;
  downloadedAt: number;
  size: number; // estimated size in KB
}

interface OfflineStats {
  totalDownloaded: number;
  totalSize: number; // in KB
  lastSync: number;
  isOfflineMode: boolean;
}

export function useOfflineLearning() {
  const [offlineContent, setOfflineContent] = useState<OfflineContent[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [downloadQueue, setDownloadQueue] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const { allProducts } = useAllProducts();

  // Listen for online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load offline content from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('offlineContent');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setOfflineContent(parsed);
      } catch (error) {
        console.error('Error loading offline content:', error);
      }
    }
  }, []);

  // Save offline content to localStorage
  const saveOfflineContent = (content: OfflineContent[]) => {
    localStorage.setItem('offlineContent', JSON.stringify(content));
    setOfflineContent(content);
  };

  // Download product for offline access
  const downloadProduct = async (productId: string): Promise<boolean> => {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return false;

    try {
      // Check if already downloaded
      const existing = offlineContent.find(c => c.productId === productId);
      if (existing) return true;

      // Calculate estimated size (text content + metadata)
      const textContent = [
        product.title,
        product.description || '',
        ...(product.highlights || []),
        ...(product.tags || [])
      ].join(' ');
      
      const estimatedSize = Math.ceil(textContent.length / 1024); // Convert to KB

      const offlineItem: OfflineContent = {
        productId: product.id,
        title: product.title,
        description: product.description,
        highlights: product.highlights,
        tags: product.tags,
        categoryName: (product as any).categories?.name || '',
        downloadedAt: Date.now(),
        size: estimatedSize
      };

      const updatedContent = [...offlineContent, offlineItem];
      saveOfflineContent(updatedContent);

      return true;
    } catch (error) {
      console.error('Error downloading product:', error);
      return false;
    }
  };

  // Download multiple products
  const downloadProducts = async (productIds: string[]): Promise<void> => {
    setIsDownloading(true);
    setDownloadQueue(productIds);

    try {
      for (const productId of productIds) {
        await downloadProduct(productId);
        // Remove from queue as we complete each download
        setDownloadQueue(prev => prev.filter(id => id !== productId));
        
        // Small delay to prevent blocking the UI
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } finally {
      setIsDownloading(false);
      setDownloadQueue([]);
    }
  };

  // Remove product from offline storage
  const removeOfflineProduct = (productId: string) => {
    const updatedContent = offlineContent.filter(c => c.productId !== productId);
    saveOfflineContent(updatedContent);
  };

  // Clear all offline content
  const clearOfflineContent = () => {
    localStorage.removeItem('offlineContent');
    setOfflineContent([]);
  };

  // Check if product is available offline
  const isProductOffline = (productId: string): boolean => {
    return offlineContent.some(c => c.productId === productId);
  };

  // Get offline product data
  const getOfflineProduct = (productId: string): OfflineContent | null => {
    return offlineContent.find(c => c.productId === productId) || null;
  };

  // Get offline statistics
  const getOfflineStats = (): OfflineStats => {
    const totalSize = offlineContent.reduce((sum, item) => sum + item.size, 0);
    const lastSync = Math.max(...offlineContent.map(c => c.downloadedAt), 0);

    return {
      totalDownloaded: offlineContent.length,
      totalSize,
      lastSync,
      isOfflineMode: !isOnline
    };
  };

  // Sync when coming back online
  const syncOnlineContent = async (): Promise<void> => {
    if (!isOnline) return;

    try {
      // Update download timestamps
      const updatedContent = offlineContent.map(item => ({
        ...item,
        downloadedAt: Date.now()
      }));
      
      saveOfflineContent(updatedContent);
    } catch (error) {
      console.error('Error syncing content:', error);
    }
  };

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && offlineContent.length > 0) {
      syncOnlineContent();
    }
  }, [isOnline]);

  // Download recommended products for offline access
  const downloadRecommendedContent = async (): Promise<void> => {
    // Get recently viewed products and some popular ones
    const recentIds = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
      .slice(0, 5)
      .map((item: any) => item.id);

    // Add some products with more content (videos, links)
    const contentRichProducts = allProducts
      .filter(p => 
        (p.training_videos && Array.isArray(p.training_videos) && p.training_videos.length > 0) ||
        (p.useful_links && Array.isArray(p.useful_links) && p.useful_links.length > 0)
      )
      .slice(0, 3)
      .map(p => p.id);

    const toDownload = [...new Set([...recentIds, ...contentRichProducts])];
    await downloadProducts(toDownload);
  };

  return {
    offlineContent,
    isOnline,
    downloadQueue,
    isDownloading,
    downloadProduct,
    downloadProducts,
    removeOfflineProduct,
    clearOfflineContent,
    isProductOffline,
    getOfflineProduct,
    getOfflineStats,
    syncOnlineContent,
    downloadRecommendedContent
  };
}