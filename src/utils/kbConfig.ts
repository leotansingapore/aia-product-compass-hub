export interface KBProduct {
  name: string;
  slug: string;
  categorySlug: string;
  tags: string[];
  mdPath: string; // relative to src/
}

export interface KBCategory {
  name: string;
  slug: string;
  description: string;
  products: KBProduct[];
}

export const kbCategories: KBCategory[] = [
  {
    name: "Investment Products",
    slug: "investment-products",
    description: "Investment-linked products designed for growth and flexibility.",
    products: [
      {
        name: "Pro Achiever",
        slug: "pro-achiever",
        categorySlug: "investment-products",
        tags: ["ILP", "Mass Market"],
        mdPath: "kb/products/investment-products/pro-achiever.md",
      },
      {
        name: "Pro Lifetime Protector",
        slug: "pro-lifetime-protector",
        categorySlug: "investment-products",
        tags: ["ILP", "Protection"],
        mdPath: "kb/products/investment-products/pro-lifetime-protector.md",
      },
      {
        name: "Platinum Wealth Venture",
        slug: "platinum-wealth-venture",
        categorySlug: "investment-products",
        tags: ["ILP", "HNW"],
        mdPath: "kb/products/investment-products/platinum-wealth-venture.md",
      },
    ],
  },
  {
    name: "Endowment Products",
    slug: "endowment-products",
    description: "Savings-focused plans with guaranteed components and bonuses.",
    products: [
      {
        name: "Smart Wealth Builder",
        slug: "smart-wealth-builder",
        categorySlug: "endowment-products",
        tags: ["Endowment", "Mass Market"],
        mdPath: "kb/products/endowment-products/smart-wealth-builder.md",
      },
      {
        name: "Retirement Saver",
        slug: "retirement-saver",
        categorySlug: "endowment-products",
        tags: ["Endowment", "Retirement"],
        mdPath: "kb/products/endowment-products/retirement-saver.md",
      },
    ],
  },
  {
    name: "Whole Life Products",
    slug: "whole-life-products",
    description: "Lifetime protection with cash value accumulation.",
    products: [
      {
        name: "Guaranteed Protect Plus",
        slug: "guaranteed-protect-plus",
        categorySlug: "whole-life-products",
        tags: ["Whole Life", "Protection"],
        mdPath: "kb/products/whole-life-products/guaranteed-protect-plus.md",
      },
    ],
  },
  {
    name: "Term Products",
    slug: "term-products",
    description: "Cost-effective protection for fixed durations.",
    products: [
      {
        name: "Secure Flexi Term",
        slug: "secure-flexi-term",
        categorySlug: "term-products",
        tags: ["Term", "Mass Market"],
        mdPath: "kb/products/term-products/secure-flexi-term.md",
      },
      {
        name: "Ultimate Critical Cover",
        slug: "ultimate-critical-cover",
        categorySlug: "term-products",
        tags: ["Term", "Critical Illness"],
        mdPath: "kb/products/term-products/ultimate-critical-cover.md",
      },
    ],
  },
  {
    name: "Medical Insurance Products",
    slug: "medical-insurance-products",
    description: "Hospitalization, surgical coverage, and personal accident plans.",
    products: [
      {
        name: "Healthshield Gold Max",
        slug: "healthshield-gold-max",
        categorySlug: "medical-insurance-products",
        tags: ["Medical", "Shield"],
        mdPath: "kb/products/medical-insurance-products/healthshield-gold-max.md",
      },
      {
        name: "Solitaire PA",
        slug: "solitaire-pa",
        categorySlug: "medical-insurance-products",
        tags: ["Medical", "PA"],
        mdPath: "kb/products/medical-insurance-products/solitaire-pa.md",
      },
    ],
  },
];

export const findCategory = (slug: string) =>
  kbCategories.find((c) => c.slug === slug);

export const findProduct = (categorySlug: string, productSlug: string) =>
  findCategory(categorySlug)?.products.find((p) => p.slug === productSlug);
