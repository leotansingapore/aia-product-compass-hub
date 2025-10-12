# Product Categories Feature - Comprehensive Scanning Prompt

## Purpose
This document provides a complete blueprint for scanning and replicating the Product Categories feature from the AIA Product Compass Hub codebase. Use this prompt to understand the architecture, implementation details, and integration points.

---

## 1. Architecture Overview

### Feature Description
The Product Categories feature provides:
- Dashboard section displaying category cards (Investment, Endowment, Whole Life, Term, Medical Insurance)
- Category-specific pages showing products within each category
- SEO-friendly slug-based URLs with backward compatibility for UUID URLs
- Search and filtering capabilities
- Integration with Supabase for data persistence
- Recently viewed tracking

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Library**: shadcn/ui (Radix UI components + Tailwind CSS)
- **Routing**: React Router v6
- **State Management**: React Query (@tanstack/react-query)
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React
- **Styling**: Tailwind CSS

### Key Design Patterns
1. **Slug-based routing** - SEO-friendly URLs (`/category/investment-products`)
2. **UUID mapping** - Bidirectional conversion between UUIDs and slugs
3. **Hook-based architecture** - Custom hooks for data fetching and state
4. **Component composition** - Reusable cards and grids
5. **Backward compatibility** - Automatic redirect from UUID URLs to slug URLs

---

## 2. Component Locations & Responsibilities

### Dashboard Components

#### `/src/components/dashboard/ProductCategories.tsx`
**Purpose**: Main dashboard section displaying category cards
**Key Features**:
- Hardcoded category data with UUIDs, names, descriptions, icons, colors
- Grid layout (responsive: 1 col mobile, 2 cols tablet, 3 cols desktop)
- Navigation to category pages via slug-based URLs
- Uses `getCategorySlugFromId()` for URL generation

**Category Data Structure**:
```typescript
{
  id: "c7cde8f4-12d4-4ddc-9150-7b32008a4e19", // UUID
  name: "Investment Products",
  description: "Build wealth and achieve financial goals",
  icon: TrendingUp, // Lucide React icon
  color: "text-green-600",
  bgColor: "bg-green-50",
  count: 3 // Product count
}
```

**Dependencies**:
- `react-router-dom` (useNavigate)
- `@/components/ui/card` (Card, CardContent)
- `@/components/ui/badge` (Badge)
- `@/utils/slugUtils` (getCategorySlugFromId)
- `lucide-react` (TrendingUp, Shield, Heart, Clock, Stethoscope)

### Category Page Components

#### `/src/pages/ProductCategory.tsx`
**Purpose**: Individual category page displaying products
**Key Features**:
- Uses `useProductCategory` hook for data and logic
- Displays category header with breadcrumbs
- Search functionality via `EnhancedSearchBar`
- Products grid with filtering
- Admin module creation (conditional)
- SEO metadata with structured data
- Skeleton loader for loading state
- 404 handling for invalid categories

**Data Flow**:
1. Extract `categorySlugOrId` from URL params
2. Convert slug to UUID via `getCategoryIdFromSlug()`
3. Fetch category and products from Supabase
4. Redirect UUID URLs to slug URLs
5. Track category view in recently viewed
6. Filter products based on search query

#### `/src/components/category/CategoryHeader.tsx`
**Purpose**: Category page header with navigation
**Key Features**:
- Back button functionality
- Breadcrumb navigation (Home → Category Name)
- Category name and description display
- Uses `NavigationHeader` component

#### `/src/components/category/ProductsGrid.tsx`
**Purpose**: Grid display of products within a category
**Key Features**:
- Responsive grid (1/2/3 columns)
- Animated fade-in (staggered delay)
- Empty state handling
- Clear filters button
- Uses `ProductCard` for individual products

### Reusable Components

#### `/src/components/CategoryCard.tsx`
**Purpose**: Reusable category card for dashboard grid
**Key Features**:
- Gradient icon background
- Product count badge
- Hover effects (shadow, scale)
- Click handler for navigation
- Responsive padding and text sizes

#### `/src/components/ProductCard.tsx`
**Purpose**: Individual product card in category grids
**Key Features**:
- Category badge with color coding
- Tags display
- Highlights list (first 3 items)
- "Learn More" button
- Hover effects

---

## 3. Database Schema

### Categories Table
```sql
CREATE TABLE public.categories (
  id TEXT PRIMARY KEY,           -- UUID stored as text
  name TEXT NOT NULL,             -- "Investment Products"
  description TEXT,               -- Category description
  useful_links JSONB,             -- Optional links (not used in this feature)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view categories"
ON public.categories
FOR SELECT
USING (true);
```

### Products Table
```sql
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,            -- Slug-like ID or module ID
  title TEXT NOT NULL,            -- "Pro Achiever"
  description TEXT,               -- Product description
  category_id TEXT NOT NULL,      -- FK to categories.id
  tags TEXT[] DEFAULT '{}',       -- ["Flexible Premium", "Multiple Funds"]
  highlights TEXT[] DEFAULT '{}', -- ["Choice of 20+ funds", "Free switching"]
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS Policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
ON public.products
FOR SELECT
USING (true);
```

### Seed Data (5 Main Categories)
```sql
INSERT INTO public.categories (id, name, description) VALUES
  ('c7cde8f4-12d4-4ddc-9150-7b32008a4e19', 'Investment Products', 'Growth-focused solutions for wealth building'),
  ('3adb6155-c158-408d-b910-9b3db532d435', 'Endowment Products', 'Balanced savings and protection plans'),
  ('19b8c528-f36e-4731-827c-0cdb1de25059', 'Whole Life Products', 'Lifelong protection with cash value'),
  ('291cf475-d918-40c0-b37d-33794534d469', 'Term Products', 'Affordable protection for specific periods'),
  ('b1024527-481f-4d85-9192-b43633e9be4a', 'Medical Insurance Products', 'Comprehensive health protection');
```

### TypeScript Types (from Supabase)
```typescript
export interface Category {
  id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  category_id: string;
  tags: string[];
  highlights: string[];
  created_at: string;
  updated_at: string;
}
```

---

## 4. Routing Configuration

### Route Definition (`/src/App.tsx`)
```typescript
<Route path="/category/:categorySlugOrId" element={<ProductCategory />} />
```

### Route Parameters
- **Parameter**: `categorySlugOrId`
- **Accepts**: Both slugs (`investment-products`) and UUIDs (`c7cde8f4-...`)
- **Behavior**: UUID URLs automatically redirect to slug URLs

### Navigation Examples
```typescript
// From dashboard
navigate(`/category/${getCategorySlugFromId(category.id)}`);
// Result: /category/investment-products

// From anywhere with slug
navigate('/category/endowment-products');

// Legacy UUID support (auto-redirects)
navigate('/category/c7cde8f4-12d4-4ddc-9150-7b32008a4e19');
// Redirects to: /category/investment-products
```

---

## 5. Slug Utility Functions

### File: `/src/utils/slugUtils.ts`

#### Core Slug Creation
```typescript
export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')          // Spaces to hyphens
    .replace(/-+/g, '-')           // Multiple hyphens to single
    .trim()
    .replace(/^-+|-+$/g, '');      // Remove leading/trailing hyphens
};
```

#### Category ID ↔ Slug Mappings
```typescript
// UUID to slug mapping (hardcoded for 5 main categories)
export const categoryIdToSlugMap: Record<string, string> = {
  'c7cde8f4-12d4-4ddc-9150-7b32008a4e19': 'investment-products',
  '3adb6155-c158-408d-b910-9b3db532d435': 'endowment-products',
  '19b8c528-f36e-4731-827c-0cdb1de25059': 'whole-life-products',
  '291cf475-d918-40c0-b37d-33794534d469': 'term-products',
  'b1024527-481f-4d85-9192-b43633e9be4a': 'medical-insurance-products'
};

// Reverse mapping (slug to UUID)
export const slugToCategoryIdMap: Record<string, string> = {
  'investment-products': 'c7cde8f4-12d4-4ddc-9150-7b32008a4e19',
  'endowment-products': '3adb6155-c158-408d-b910-9b3db532d435',
  'whole-life-products': '19b8c528-f36e-4731-827c-0cdb1de25059',
  'term-products': '291cf475-d918-40c0-b37d-33794534d469',
  'medical-insurance-products': 'b1024527-481f-4d85-9192-b43633e9be4a'
};
```

#### Utility Functions
```typescript
// Get slug from UUID
export const getCategorySlugFromId = (categoryId: string): string => {
  return categoryIdToSlugMap[categoryId] || categoryId;
};

// Get UUID from slug
export const getCategoryIdFromSlug = (slug: string): string | undefined => {
  return slugToCategoryIdMap[slug];
};

// Check if string is UUID
export const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};
```

---

## 6. Data Flow & Integration

### Hook Architecture

#### `/src/hooks/useProducts.tsx`

##### `useCategories()` Hook
```typescript
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetches from Supabase: categories table
  // Returns: { categories, loading, error }
  // Includes 5-minute cache
}
```

##### `useProducts(categoryId?: string)` Hook
```typescript
export function useProducts(categoryId?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetches products from Supabase
  // Filters by categoryId if provided
  // Joins with categories table
  // Returns: { products, loading, error, refetch }
}
```

#### `/src/hooks/useProductCategory.ts`

##### `useProductCategory()` Hook
**Purpose**: Main hook for category page logic
**Responsibilities**:
1. Extract `categorySlugOrId` from URL params
2. Convert slug to UUID using `getCategoryIdFromSlug()`
3. Fetch products and categories
4. Handle UUID → slug redirects
5. Track recently viewed
6. Manage search and filter state
7. Provide navigation handlers

**Returns**:
```typescript
{
  categorySlugOrId: string,
  categoryId: string,
  category: Category,
  products: Product[],        // Filtered
  loading: boolean,
  searchQuery: string,
  refetch: () => void,
  handleSearch: (query: string) => void,
  handleProductClick: (productId: string) => void,
  clearFilters: () => void
}
```

### Data Flow Diagram
```
1. User clicks category card in dashboard
   ↓
2. Navigate to /category/investment-products
   ↓
3. useProductCategory extracts "investment-products"
   ↓
4. Convert slug → UUID via slugToCategoryIdMap
   ↓
5. useProducts fetches products for UUID from Supabase
   ↓
6. useCategories fetches category details
   ↓
7. Render category page with products
   ↓
8. User searches → filter products locally
   ↓
9. User clicks product → navigate to /product/:id
```

### Supabase Integration

#### Client Setup (`/src/integrations/supabase/client.ts`)
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
```

#### Query Examples
```typescript
// Fetch all categories
const { data, error } = await supabase
  .from('categories')
  .select('*')
  .order('name');

// Fetch products by category
const { data, error } = await supabase
  .from('products')
  .select(`
    *,
    categories:category_id (id, name)
  `)
  .eq('category_id', categoryId)
  .order('title');
```

---

## 7. UI Component Integration

### shadcn/ui Components Used
- `Card`, `CardContent`, `CardHeader`, `CardTitle`, `CardDescription` - Category and product cards
- `Badge` - Category tags, product count, product tags
- `Button` - Navigation buttons, filter actions

### Icon Integration (Lucide React)
```typescript
import {
  TrendingUp,    // Investment Products
  Shield,        // Endowment Products
  Heart,         // Whole Life Products
  Clock,         // Term Products
  Stethoscope    // Medical Insurance Products
} from "lucide-react";
```

### Category Configuration (`/src/utils/categoryConfig.ts`)
```typescript
export function getCategoryConfig(categoryName: string) {
  const configs: Record<string, { icon: string; gradient: string }> = {
    'Investment Products': {
      icon: '📈',
      gradient: 'bg-gradient-to-r from-blue-500 to-blue-600'
    },
    'Endowment Products': {
      icon: '💰',
      gradient: 'bg-gradient-to-r from-green-500 to-green-600'
    },
    // ... other categories
  };
  return configs[categoryName] || defaultConfig;
}
```

### Color Coding System
- **Investment**: Blue (`text-green-600`, `bg-green-50`, `from-blue-500`)
- **Endowment**: Green (`text-blue-600`, `bg-blue-50`, `from-green-500`)
- **Whole Life**: Purple (`text-red-600`, `bg-red-50`, `from-purple-500`)
- **Term**: Orange (`text-orange-600`, `bg-orange-50`, `from-orange-500`)
- **Medical**: Red/Purple (`text-purple-600`, `bg-purple-50`, `from-red-500`)

### Responsive Grid Layouts
```css
/* Dashboard category cards */
grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4

/* Products grid */
grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6
```

---

## 8. Verification Checklist

### Components to Verify
- [ ] `/src/components/dashboard/ProductCategories.tsx` exists
- [ ] `/src/pages/ProductCategory.tsx` exists
- [ ] `/src/components/category/CategoryHeader.tsx` exists
- [ ] `/src/components/category/ProductsGrid.tsx` exists
- [ ] `/src/components/CategoryCard.tsx` exists
- [ ] `/src/components/ProductCard.tsx` exists

### Hooks to Verify
- [ ] `/src/hooks/useProductCategory.ts` exists
- [ ] `/src/hooks/useProducts.tsx` exports `useCategories`, `useProducts`

### Utilities to Verify
- [ ] `/src/utils/slugUtils.ts` exists with all conversion functions
- [ ] `/src/utils/categoryConfig.ts` exists with category configs
- [ ] `categoryIdToSlugMap` contains all 5 category UUIDs
- [ ] `slugToCategoryIdMap` is reverse of above

### Database to Verify
- [ ] `categories` table exists with correct schema
- [ ] `products` table exists with correct schema
- [ ] 5 main categories are seeded with exact UUIDs
- [ ] RLS policies allow public read access
- [ ] Foreign key relationship: `products.category_id` → `categories.id`

### Routes to Verify
- [ ] `/category/:categorySlugOrId` route exists in `App.tsx`
- [ ] Route uses `<ProductCategory />` component
- [ ] Navigation from dashboard uses slug URLs
- [ ] UUID URLs redirect to slug URLs

### Expected User Flow
1. Dashboard displays 5 category cards with icons, names, product counts
2. Click "Investment Products" → navigate to `/category/investment-products`
3. Category page shows header with breadcrumbs and back button
4. Products grid displays all investment products
5. Search bar filters products by title/description
6. Click product → navigate to product detail page
7. Test legacy URL `/category/c7cde8f4-...` → auto-redirect to slug URL

---

## 9. Implementation Steps for Replication

### Step 1: Install Dependencies
```bash
npm install @supabase/supabase-js @tanstack/react-query
npm install react-router-dom react-helmet-async
npm install lucide-react
npm install class-variance-authority clsx tailwind-merge

# shadcn/ui components
npx shadcn@latest add card badge button
```

### Step 2: Setup Supabase Integration
```bash
# Create directory structure
mkdir -p src/integrations/supabase

# Copy files:
# - src/integrations/supabase/client.ts
# - src/integrations/supabase/types.ts (from Supabase CLI: supabase gen types typescript)
```

### Step 3: Create Database Schema
```bash
# Run migrations in Supabase dashboard or via CLI
supabase migration new create_categories_products

# Add SQL from section 3 (Database Schema)
# Apply migration: supabase db push
```

### Step 4: Create Utility Files
```bash
# Create:
# - src/utils/slugUtils.ts (full content from section 5)
# - src/utils/categoryConfig.ts (full content from section 7)
```

### Step 5: Create Hooks
```bash
# Create:
# - src/hooks/useProducts.tsx (useCategories, useProducts hooks)
# - src/hooks/useProductCategory.ts (main category page hook)
```

### Step 6: Create Components
```bash
# Create directory structure
mkdir -p src/components/dashboard
mkdir -p src/components/category
mkdir -p src/pages

# Create components in order:
# 1. src/components/CategoryCard.tsx
# 2. src/components/ProductCard.tsx
# 3. src/components/dashboard/ProductCategories.tsx
# 4. src/components/category/CategoryHeader.tsx
# 5. src/components/category/ProductsGrid.tsx
# 6. src/pages/ProductCategory.tsx
```

### Step 7: Configure Routing
```typescript
// In src/App.tsx, add route:
<Route path="/category/:categorySlugOrId" element={<ProductCategory />} />
```

### Step 8: Integrate into Dashboard
```typescript
// In your main dashboard/index page:
import { ProductCategories } from "@/components/dashboard/ProductCategories";

// Add to dashboard layout:
<ProductCategories />
```

### Step 9: Test Implementation
1. Start dev server: `npm run dev`
2. Visit dashboard - verify 5 category cards display
3. Click each category - verify navigation to `/category/[slug]`
4. Verify products load for each category
5. Test search functionality
6. Test legacy UUID URL redirect
7. Verify responsive layouts (mobile, tablet, desktop)

### Step 10: Seed Sample Data (Optional)
```sql
-- Add sample products for testing
INSERT INTO public.products (id, title, description, category_id, tags, highlights)
VALUES
  ('test-product-1', 'Sample Investment Product', 'Test description',
   'c7cde8f4-12d4-4ddc-9150-7b32008a4e19',
   ARRAY['Tag1', 'Tag2'],
   ARRAY['Highlight 1', 'Highlight 2', 'Highlight 3']);
```

---

## 10. Key Integration Points

### Required Context from Other Parts of Codebase

#### Navigation Component
- `NavigationHeader` component (used in CategoryHeader)
- Should support: `title`, `subtitle`, `breadcrumbs`, `showBackButton`, `onBack`

#### Search Component
- `EnhancedSearchBar` component (used in ProductCategory page)
- Should support: `onSearch` callback, `placeholder` prop

#### Skeleton Loader
- `SkeletonLoader` component with `type="category"` variant

#### Recently Viewed Tracking
- `useRecentlyViewed` hook with `addToRecent(id, type)` method
- Should track category views

#### Permissions (Optional)
- `usePermissions` hook with `isAdmin()` method
- Used for conditional admin module creation form

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 11. Common Issues & Solutions

### Issue: Categories not loading
**Solution**: Check Supabase RLS policies, ensure public read access enabled

### Issue: Slug URLs not working
**Solution**: Verify `categoryIdToSlugMap` has exact UUID matches from database

### Issue: UUID redirect loop
**Solution**: Check `isUUID()` regex pattern, ensure `useEffect` dependencies correct

### Issue: Products not filtering by category
**Solution**: Verify `category_id` foreign key matches UUID in categories table

### Issue: Search not working
**Solution**: Check filter logic in `useProductCategory` hook, ensure case-insensitive matching

---

## 12. File Checklist for Replication

### Required Files (14 total)

#### Components (6 files)
- [ ] `/src/components/dashboard/ProductCategories.tsx`
- [ ] `/src/components/category/CategoryHeader.tsx`
- [ ] `/src/components/category/ProductsGrid.tsx`
- [ ] `/src/components/CategoryCard.tsx`
- [ ] `/src/components/ProductCard.tsx`
- [ ] `/src/pages/ProductCategory.tsx`

#### Hooks (2 files)
- [ ] `/src/hooks/useProductCategory.ts`
- [ ] `/src/hooks/useProducts.tsx`

#### Utilities (2 files)
- [ ] `/src/utils/slugUtils.ts`
- [ ] `/src/utils/categoryConfig.ts`

#### Supabase (2 files)
- [ ] `/src/integrations/supabase/client.ts`
- [ ] `/src/integrations/supabase/types.ts`

#### Database (1 migration)
- [ ] `supabase/migrations/[timestamp]_create_categories_products.sql`

#### Routing (1 modification)
- [ ] `/src/App.tsx` - Add category route

---

## 13. Expected Output Format

When successfully replicated, you should be able to:

### Dashboard View
```
Product Categories
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  📈             │  │  💰             │  │  🛡️             │
│ Investment      │  │ Endowment       │  │ Whole Life      │
│ Products        │  │ Products        │  │ Products        │
│ 3 products      │  │ 2 products      │  │ 1 product       │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Category Page View
```
← Home / Investment Products
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Search investment products...

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ Pro Achiever    │  │ Pro Lifetime    │  │ Platinum Wealth │
│ Flexible invest │  │ Investment +    │  │ Premium invest  │
│ [Tags...]       │  │ [Tags...]       │  │ [Tags...]       │
│ • Highlight 1   │  │ • Highlight 1   │  │ • Highlight 1   │
│ • Highlight 2   │  │ • Highlight 2   │  │ • Highlight 2   │
│ [Learn More]    │  │ [Learn More]    │  │ [Learn More]    │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### URL Patterns
- Dashboard: `/`
- Category (slug): `/category/investment-products`
- Category (UUID - redirects): `/category/c7cde8f4-12d4-4ddc-9150-7b32008a4e19` → `/category/investment-products`
- Product: `/product/pro-achiever`

---

## Summary

This comprehensive scan document covers all aspects of the Product Categories feature:

✅ **Architecture**: React + TypeScript + Supabase
✅ **Components**: 6 main components + 2 reusable cards
✅ **Database**: 2 tables (categories, products) with RLS
✅ **Routing**: Slug-based with UUID backward compatibility
✅ **Hooks**: 2 custom hooks for data fetching and state
✅ **Utilities**: Slug conversion and category configuration
✅ **Integration**: shadcn/ui, Lucide icons, React Query

Use this document as a prompt to scan the codebase and replicate the feature in another project. All file paths, function signatures, and implementation details are provided for accurate replication.
