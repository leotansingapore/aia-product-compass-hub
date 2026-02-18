

## Draft/Published Status for Categories and Products

### Overview
Add a `published` boolean flag to both categories and products. New content defaults to **draft**. Non-admin users only see published content (enforced by RLS). Admins see everything, with draft items subtly distinguished. Publish/unpublish actions are inline toggles -- no separate workflow.

---

### 1. Database Migrations

**Migration: Add `published` column to `categories` and `products`**

```sql
-- Categories
ALTER TABLE categories ADD COLUMN published boolean NOT NULL DEFAULT false;
UPDATE categories SET published = true; -- existing content stays visible

-- Products
ALTER TABLE products ADD COLUMN published boolean NOT NULL DEFAULT false;
UPDATE products SET published = true; -- existing content stays visible

-- Update RLS: non-admins only see published categories
DROP POLICY "Everyone can view categories" ON categories;
CREATE POLICY "Everyone can view categories" ON categories
  FOR SELECT USING (
    published = true
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'master_admin')
  );

-- Update RLS: non-admins only see published products
DROP POLICY "Everyone can view products" ON products;
CREATE POLICY "Everyone can view products" ON products
  FOR SELECT USING (
    published = true
    OR has_role(auth.uid(), 'admin')
    OR has_role(auth.uid(), 'master_admin')
  );
```

---

### 2. TypeScript Type Updates

**`src/hooks/useProducts.tsx`** -- Add `published` to `Category` and `Product` interfaces:
- `Category.published?: boolean`
- `Product.published?: boolean`

---

### 3. Sidebar Changes (`AppSidebar.tsx`)

- **Draft badge**: After category name, show a small `Badge` with text "Draft" in muted/secondary styling when `category.published === false`. Only visible to admins (non-admins won't see draft categories at all due to RLS).
- **Dropdown menu**: Add a "Publish" / "Unpublish" option in the existing three-dot menu for each category. Uses a simple `supabase.update({ published: !current })` call followed by `refetchCategories()`.
- **Create dialog**: No changes needed -- default is `false` (draft), so new categories automatically start as drafts.

Visual example in sidebar:
```
Investment Products
Term Products
My Test Category  [Draft]   ...
```

---

### 4. Create Category Dialog (`AppSidebar.tsx`)

Add a small inline switch below the description field:
```
[  ] Publish immediately
```
Default: unchecked (draft). When checked, inserts with `published: true`. Keeps the form simple -- just one extra toggle.

---

### 5. Create Module Form (`CreateModuleForm.tsx`)

Add the same inline switch:
```
[  ] Publish immediately
```
Default: unchecked. Passes `published: true/false` in the insert payload.

---

### 6. Category Page (`ProductCategory.tsx`)

- **Draft banner**: When `category.published === false` and user is admin, show a subtle banner below the header: "This category is in draft mode and is only visible to admins." with a "Publish" button.
- **Publish/Unpublish toggle**: Add a `Switch` component in the `BrandedPageHeader` area (admin only) to toggle the category's published state. Includes a brief confirmation toast.

---

### 7. Product Cards (`ProductCard.tsx`)

- When the product's `published` is `false` and user is admin, show a small "Draft" badge next to the category badge.
- Add "Publish" / "Unpublish" option in the existing admin dropdown menu (alongside Edit and Delete).

---

### 8. Product Edit Dialog (`ProductCard.tsx`)

Add a "Published" switch in the edit form so admins can toggle visibility while editing.

---

### Summary of Behavior

| Scenario | Result |
|---|---|
| Admin creates category | Defaults to draft, visible only to admins |
| Admin creates product | Defaults to draft, visible only to admins |
| Admin toggles publish | Content becomes visible to all users |
| Non-admin browses | Only sees published categories and products |
| Admin browses sidebar | Sees all categories, drafts marked with subtle badge |

### Files Modified
1. **Database migration** -- add `published` column + update RLS policies
2. `src/hooks/useProducts.tsx` -- update interfaces
3. `src/components/layout/AppSidebar.tsx` -- draft badge, publish toggle in dropdown, switch in create dialog
4. `src/components/admin/CreateModuleForm.tsx` -- publish switch in create form
5. `src/pages/ProductCategory.tsx` -- draft banner + publish toggle for admins
6. `src/components/ProductCard.tsx` -- draft badge + publish/unpublish in dropdown
