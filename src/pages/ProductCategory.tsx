import { useState } from "react";
import { useParams } from "react-router-dom";
import { NavigationHeader } from "@/components/NavigationHeader";
import { SearchBar } from "@/components/SearchBar";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Sample product data
const sampleProducts = {
  investment: [
    {
      id: 'inv-1',
      title: 'AIA Investment-Linked Plan',
      description: 'Flexible investment plan with multiple fund options for long-term wealth building',
      category: 'Investment',
      tags: ['Flexible Premium', 'Multiple Funds', 'Long-term Growth'],
      highlights: [
        'Choice of over 20 investment funds',
        'Flexible premium payment options',
        'Potential for higher returns',
        'Free fund switching'
      ]
    },
    {
      id: 'inv-2', 
      title: 'AIA Capital Guaranteed Plan',
      description: 'Capital protection with guaranteed returns and potential bonuses',
      category: 'Investment',
      tags: ['Capital Guaranteed', 'Bonus Potential', 'Conservative'],
      highlights: [
        '100% capital protection',
        'Guaranteed minimum returns',
        'Annual bonus declarations',
        'Suitable for conservative investors'
      ]
    }
  ],
  endowment: [
    {
      id: 'end-1',
      title: 'AIA Smart Saver Plan',
      description: 'Balanced endowment plan combining savings and protection',
      category: 'Endowment',
      tags: ['Savings', 'Protection', 'Maturity Benefit'],
      highlights: [
        'Guaranteed cash value growth',
        'Life protection coverage',
        'Maturity benefit payout',
        'Loan facility available'
      ]
    }
  ],
  'whole-life': [
    {
      id: 'wl-1',
      title: 'AIA Whole Life Protection',
      description: 'Lifelong protection with increasing cash value',
      category: 'Whole Life',
      tags: ['Lifelong Coverage', 'Cash Value', 'Dividends'],
      highlights: [
        'Lifetime protection coverage',
        'Participating policy with dividends',
        'Increasing cash value',
        'Estate planning benefits'
      ]
    }
  ],
  term: [
    {
      id: 'term-1',
      title: 'AIA Term Life Insurance',
      description: 'Affordable protection for specific term periods',
      category: 'Term',
      tags: ['Affordable', 'High Coverage', 'Renewable'],
      highlights: [
        'High coverage at low premiums',
        'Renewable and convertible options',
        'Various term periods available',
        'No medical exam for qualifying amounts'
      ]
    }
  ],
  medical: [
    {
      id: 'med-1',
      title: 'AIA HealthShield Plus',
      description: 'Comprehensive medical insurance with extended coverage',
      category: 'Medical',
      tags: ['Comprehensive', 'Cashless', 'Worldwide Coverage'],
      highlights: [
        'Cashless treatment at panel hospitals',
        'Worldwide emergency coverage',
        'No claim bonus benefits',
        'Pre and post hospitalization coverage'
      ]
    }
  ]
};

const categoryInfo = {
  investment: {
    title: 'Investment Products',
    description: 'Grow your wealth with our range of investment-linked and guaranteed products',
    icon: '📈'
  },
  endowment: {
    title: 'Endowment Products', 
    description: 'Balanced solutions combining savings and protection for your financial goals',
    icon: '💰'
  },
  'whole-life': {
    title: 'Whole Life Products',
    description: 'Lifelong protection with cash value accumulation and estate planning benefits',
    icon: '🛡️'
  },
  term: {
    title: 'Term Products',
    description: 'Affordable life protection for specific periods and life stages',
    icon: '⏳'
  },
  medical: {
    title: 'Medical Insurance Products',
    description: 'Comprehensive health protection for you and your family',
    icon: '🏥'
  }
};

export default function ProductCategory() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const category = categoryInfo[categoryId as keyof typeof categoryInfo];
  const products = sampleProducts[categoryId as keyof typeof sampleProducts] || [];

  // Get all unique tags from products
  const allTags = Array.from(new Set(products.flatMap(product => product.tags)));

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleTagClick = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => product.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const handleProductClick = (productId: string) => {
    // TODO: Navigate to product detail page
    console.log('Navigate to product:', productId);
  };

  if (!category) {
    return <div>Category not found</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader 
        title={category.title}
        subtitle={category.description}
        showBackButton
        onBack={() => window.history.back()}
      />
      
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and Filters */}
        <div className="mb-8">
          <div className="mb-6">
            <SearchBar 
              onSearch={handleSearch} 
              placeholder={`Search ${category.title.toLowerCase()}...`}
            />
          </div>
          
          {/* Tag Filters */}
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-muted-foreground mr-2">Filter by tags:</span>
            {allTags.map(tag => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => handleTagClick(tag)}
              >
                {tag}
              </Badge>
            ))}
            {selectedTags.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTags([])}
                className="text-xs"
              >
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              title={product.title}
              description={product.description}
              category={product.category}
              tags={product.tags}
              highlights={product.highlights}
              onClick={() => handleProductClick(product.id)}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No products found matching your criteria.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setSelectedTags([]);
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}