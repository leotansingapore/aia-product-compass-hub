// Utility functions for handling SEO-friendly slugs

// Convert a string to a URL-friendly slug
export const createSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Category name to slug mapping
export const categorySlugMap: Record<string, string> = {
  'Investment Products': 'investment-products',
  'Endowment Products': 'endowment-products', 
  'Whole Life Products': 'whole-life-products',
  'Term Products': 'term-products',
  'Medical Insurance Products': 'medical-insurance-products',
  'Appointment Flows': 'appointment-flows',
  'Learning Modules': 'learning-modules'
};

// Reverse mapping from slug to category name
export const slugToCategoryMap: Record<string, string> = Object.fromEntries(
  Object.entries(categorySlugMap).map(([name, slug]) => [slug, name])
);

// Category ID to slug mapping (based on database data)
export const categoryIdToSlugMap: Record<string, string> = {
  'c7cde8f4-12d4-4ddc-9150-7b32008a4e19': 'investment-products',
  '3adb6155-c158-408d-b910-9b3db532d435': 'endowment-products',
  '19b8c528-f36e-4731-827c-0cdb1de25059': 'whole-life-products', 
  '291cf475-d918-40c0-b37d-33794534d469': 'term-products',
  'b1024527-481f-4d85-9192-b43633e9be4a': 'medical-insurance-products',
  '5ef0b17f-a19f-4859-8349-3e4959620e94': 'appointment-flows',
  'be7504d3-e88b-4107-aae2-f8027fd884e0': 'learning-modules'
};

// Reverse mapping from slug to category ID
export const slugToCategoryIdMap: Record<string, string> = Object.fromEntries(
  Object.entries(categoryIdToSlugMap).map(([id, slug]) => [slug, id])
);

// Get category slug from name
export const getCategorySlug = (categoryName: string): string => {
  return categorySlugMap[categoryName] || createSlug(categoryName);
};

// Get category slug from ID
export const getCategorySlugFromId = (categoryId: string): string => {
  return categoryIdToSlugMap[categoryId] || categoryId;
};

// Get category ID from slug
export const getCategoryIdFromSlug = (slug: string): string | undefined => {
  return slugToCategoryIdMap[slug];
};

// Get category name from slug
export const getCategoryNameFromSlug = (slug: string): string | undefined => {
  return slugToCategoryMap[slug];
};

// Product slug utilities
export const getProductSlug = (productTitle: string): string => {
  return createSlug(productTitle);
};

// Check if a string is a UUID (for backward compatibility)
export const isUUID = (str: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Check if a string is a module ID (old format: module-timestamp-randomstring)
export const isModuleId = (str: string): boolean => {
  return /^module-\d+-[a-z0-9]+$/i.test(str);
};

// Video slug utilities
export const getVideoSlug = (videoTitle: string): string => {
  return createSlug(videoTitle);
};

// Check if a string looks like a video ID (old format: video-timestamp-randomstring)
export const isVideoId = (str: string): boolean => {
  return /^video-\d+-[a-z0-9]+$/i.test(str);
};

// ===== SEO-Friendly URL Generation =====

// Generate SEO-friendly product URL: /[category-slug]/[product-slug]
export const getProductUrl = (categoryId: string, productTitle: string): string => {
  const categorySlug = getCategorySlugFromId(categoryId);
  const productSlug = getProductSlug(productTitle);
  return `/${categorySlug}/${productSlug}`;
};

// Generate SEO-friendly product video URL: /[category-slug]/[product-slug]/[video-slug]
export const getProductVideoUrl = (categoryId: string, productTitle: string, videoTitle: string): string => {
  const categorySlug = getCategorySlugFromId(categoryId);
  const productSlug = getProductSlug(productTitle);
  const videoSlug = getVideoSlug(videoTitle);
  return `/${categorySlug}/${productSlug}/${videoSlug}`;
};

// Parse SEO-friendly URL to extract category, product, and optional lesson slugs
export interface ParsedProductUrl {
  categorySlug: string;
  productSlug: string;
  lessonSlug?: string;
}

export const parseProductUrl = (categorySlug: string, productSlug: string, lessonSlug?: string): ParsedProductUrl => {
  return {
    categorySlug,
    productSlug,
    lessonSlug
  };
};

// Check if a product identifier is a direct ID (UUID or module ID) vs a slug
export const isDirectProductId = (identifier: string): boolean => {
  return isUUID(identifier) || isModuleId(identifier);
};