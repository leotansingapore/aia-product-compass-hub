import { useState, useEffect } from 'react';
import { useRecentlyViewed } from './useRecentlyViewed';
import { useBookmarks } from './useBookmarks';
import { useAllProducts, useCategories } from './useProducts';
import { useAuth } from './useAuth';

export interface LearningStats {
  productsViewed: number;
  categoriesExplored: number;
  bookmarksCreated: number;
  timeSpentLearning: number; // in minutes
  streakDays: number;
  completionRate: number;
  favoriteCategory: string;
  learningGoals: {
    daily: { target: number; current: number };
    weekly: { target: number; current: number };
    monthly: { target: number; current: number };
  };
}

export interface ActivityData {
  date: string;
  productsViewed: number;
  timeSpent: number;
  bookmarksAdded: number;
}

export interface CategoryProgress {
  categoryId: string;
  categoryName: string;
  totalProducts: number;
  viewedProducts: number;
  completionPercentage: number;
  timeSpent: number;
}

export function useLearningAnalytics() {
  const { user } = useAuth();
  const { getRecentProducts } = useRecentlyViewed();
  const { bookmarks } = useBookmarks();
  const { allProducts } = useAllProducts();
  const { categories } = useCategories();
  const [analytics, setAnalytics] = useState<any>(null);

  // Track session start time
  useEffect(() => {
    const sessionStart = Date.now();
    
    return () => {
      // Track session duration on component unmount
      const sessionDuration = Math.round((Date.now() - sessionStart) / 1000 / 60); // minutes
      trackSessionTime(sessionDuration);
    };
  }, []);

  const trackSessionTime = (minutes: number) => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('learningAnalytics');
    let data = stored ? JSON.parse(stored) : { dailyTime: {}, totalTime: 0 };
    
    data.dailyTime[today] = (data.dailyTime[today] || 0) + minutes;
    data.totalTime = (data.totalTime || 0) + minutes;
    
    localStorage.setItem('learningAnalytics', JSON.stringify(data));
  };

  const getLearningStats = (): LearningStats => {
    const recentProducts = getRecentProducts();
    const stored = localStorage.getItem('learningAnalytics');
    const analyticsData = stored ? JSON.parse(stored) : { dailyTime: {}, totalTime: 0 };
    
    // Calculate unique categories from recent products
    const categoriesExplored = new Set(
      recentProducts.map(p => {
        const product = allProducts.find(ap => ap.id === p.id);
        return product?.category_id;
      }).filter(Boolean)
    ).size;

    // Calculate streak days
    const streakDays = calculateStreakDays(analyticsData.dailyTime);

    // Find favorite category
    const categoryCounts: { [key: string]: number } = {};
    recentProducts.forEach(p => {
      const product = allProducts.find(ap => ap.id === p.id);
      if (product?.category_id) {
        categoryCounts[product.category_id] = (categoryCounts[product.category_id] || 0) + 1;
      }
    });

    const favoriteCategoryId = Object.keys(categoryCounts).reduce((a, b) => 
      categoryCounts[a] > categoryCounts[b] ? a : b, Object.keys(categoryCounts)[0]
    );

    const favoriteCategory = categories.find(c => c.id === favoriteCategoryId)?.name || 'None';

    const today = new Date().toISOString().split('T')[0];
    const thisWeekStart = getWeekStart(new Date()).toISOString().split('T')[0];
    const thisMonthStart = new Date().toISOString().slice(0, 7) + '-01';

    // Calculate current progress
    const todayViews = recentProducts.filter(p => 
      new Date(p.timestamp).toISOString().split('T')[0] === today
    ).length;

    const weekViews = recentProducts.filter(p => 
      new Date(p.timestamp) >= new Date(thisWeekStart)
    ).length;

    const monthViews = recentProducts.filter(p => 
      new Date(p.timestamp) >= new Date(thisMonthStart)
    ).length;

    return {
      productsViewed: recentProducts.length,
      categoriesExplored,
      bookmarksCreated: bookmarks.length,
      timeSpentLearning: analyticsData.totalTime || 0,
      streakDays,
      completionRate: calculateCompletionRate(),
      favoriteCategory,
      learningGoals: {
        daily: { target: 3, current: todayViews },
        weekly: { target: 15, current: weekViews },
        monthly: { target: 50, current: monthViews }
      }
    };
  };

  const getActivityData = (days: number = 30): ActivityData[] => {
    const stored = localStorage.getItem('learningAnalytics');
    const analyticsData = stored ? JSON.parse(stored) : { dailyTime: {} };
    const recentProducts = getRecentProducts();
    
    const activityData: ActivityData[] = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayProducts = recentProducts.filter(p => 
        new Date(p.timestamp).toISOString().split('T')[0] === dateStr
      );

      const dayBookmarks = bookmarks.filter(p => 
        new Date(p.created_at || 0).toISOString().split('T')[0] === dateStr
      );

      activityData.unshift({
        date: dateStr,
        productsViewed: dayProducts.length,
        timeSpent: analyticsData.dailyTime[dateStr] || 0,
        bookmarksAdded: dayBookmarks.length
      });
    }
    
    return activityData;
  };

  const getCategoryProgress = (): CategoryProgress[] => {
    const recentProducts = getRecentProducts();
    
    return categories.map(category => {
      const categoryProducts = allProducts.filter(p => p.category_id === category.id);
      const viewedProducts = recentProducts.filter(rp => {
        const product = allProducts.find(ap => ap.id === rp.id);
        return product?.category_id === category.id;
      });

      const completionPercentage = categoryProducts.length > 0 
        ? Math.round((viewedProducts.length / categoryProducts.length) * 100)
        : 0;

      return {
        categoryId: category.id,
        categoryName: category.name,
        totalProducts: categoryProducts.length,
        viewedProducts: viewedProducts.length,
        completionPercentage,
        timeSpent: calculateCategoryTime(category.id) // Simplified - would need more detailed tracking
      };
    });
  };

  const calculateStreakDays = (dailyTime: { [key: string]: number }): number => {
    const dates = Object.keys(dailyTime).sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const checkDate = new Date();
      checkDate.setDate(checkDate.getDate() - i);
      const expectedDate = checkDate.toISOString().split('T')[0];
      
      if (date === expectedDate && dailyTime[date] > 0) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateCompletionRate = (): number => {
    const totalProducts = allProducts.length;
    const viewedProducts = getRecentProducts().length;
    return totalProducts > 0 ? Math.round((viewedProducts / totalProducts) * 100) : 0;
  };

  const calculateCategoryTime = (categoryId: string): number => {
    // Simplified calculation - in a real app, you'd track this more precisely
    const recentProducts = getRecentProducts();
    const categoryViews = recentProducts.filter(rp => {
      const product = allProducts.find(ap => ap.id === rp.id);
      return product?.category_id === categoryId;
    });
    
    return categoryViews.length * 5; // Assume 5 minutes per product view
  };

  const getWeekStart = (date: Date): Date => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day;
    return new Date(start.setDate(diff));
  };

  const getInsights = (): string[] => {
    const stats = getLearningStats();
    const insights: string[] = [];

    if (stats.streakDays >= 7) {
      insights.push(`🔥 Amazing! You're on a ${stats.streakDays}-day learning streak!`);
    } else if (stats.streakDays >= 3) {
      insights.push(`⚡ Great momentum! Keep up your ${stats.streakDays}-day streak!`);
    }

    if (stats.completionRate >= 50) {
      insights.push(`📚 You've explored ${stats.completionRate}% of all products!`);
    }

    if (stats.categoriesExplored >= 3) {
      insights.push(`🎯 You're well-rounded - exploring ${stats.categoriesExplored} different categories!`);
    }

    if (stats.favoriteCategory !== 'None') {
      insights.push(`💡 Your focus area is ${stats.favoriteCategory} products`);
    }

    if (insights.length === 0) {
      insights.push('🚀 Start exploring products to unlock learning insights!');
    }

    return insights;
  };

  return {
    getLearningStats,
    getActivityData,
    getCategoryProgress,
    getInsights,
    trackSessionTime
  };
}