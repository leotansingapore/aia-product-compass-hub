import { 
  Search, 
  BookOpen, 
  Users, 
  Bookmark, 
  Video,
  Target,
  Sparkles
} from 'lucide-react';
import { FEATURES, type FeatureKey } from '@/lib/tiers';

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  icon: any;
  action: () => void;
  points: number;
  category: 'essential' | 'explore' | 'advanced';
  /**
   * Feature the item's destination is gated behind. The renderer resolves
   * this through `can()` and shows a lock instead of a Start button — new
   * Explorers used to be sent straight into a tier-gated route and bounced
   * back home with a "This section is locked" toast.
   */
  feature?: FeatureKey;
}

export const getCategoryColor = (category: string) => {
  switch (category) {
    case 'essential': return 'bg-red-500';
    case 'explore': return 'bg-blue-500';
    case 'advanced': return 'bg-purple-500';
    default: return 'bg-gray-500';
  }
};

export const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'essential': return 'Essential';
    case 'explore': return 'Explore';
    case 'advanced': return 'Advanced';
    default: return '';
  }
};

export const createChecklistItems = (
  completeItem: (itemId: string) => void,
  navigate: (path: string) => void,
  startOnboarding: () => void
): ChecklistItem[] => [
  {
    id: 'take-tour',
    title: 'Take the Interactive Tour',
    description: 'Get familiar with the platform through our guided walkthrough',
    icon: Sparkles,
    action: () => startOnboarding(),
    points: 20,
    category: 'essential'
  },
  {
    id: 'search-product',
    title: 'Try the Search Feature',
    description: 'Search for a product or topic to see how our enhanced search works',
    icon: Search,
    action: () => {
      completeItem('search-product');
      navigate('/');
      // Focus search after navigation
      setTimeout(() => {
        const searchInput = document.querySelector('[data-onboarding="search"] input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    },
    points: 15,
    category: 'essential'
  },
  {
    id: 'browse-category',
    title: 'Browse a Product Category',
    description: 'Explore one of our product categories to see detailed information',
    icon: BookOpen,
    action: () => {
      completeItem('browse-category');
      navigate('/category/investment-products');
    },
    points: 15,
    category: 'essential',
    feature: FEATURES.PRODUCTS
  },
  {
    id: 'client-profile',
    title: 'Browse Product Categories',
    description: 'Explore the different product categories available',
    icon: Users,
    action: () => {
      completeItem('client-profile');
      navigate('/categories');
    },
    points: 20,
    category: 'explore',
    feature: FEATURES.PRODUCTS
  },
  {
    id: 'bookmark-item',
    title: 'Bookmark Your First Item',
    description: 'Save a product or resource for quick access later',
    icon: Bookmark,
    action: () => {
      completeItem('bookmark-item');
      navigate('/category/investment-products');
    },
    points: 10,
    category: 'explore',
    feature: FEATURES.PRODUCTS
  },
  {
    id: 'watch-video',
    title: 'Watch a Training Video',
    description: 'View a product explainer video to see our learning materials',
    icon: Video,
    action: () => {
      completeItem('watch-video');
      navigate('/category/investment-products');
    },
    points: 15,
    category: 'explore',
    feature: FEATURES.PRODUCTS
  },
];