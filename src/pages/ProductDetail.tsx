import { useParams, useNavigate } from "react-router-dom";
import { NavigationHeader } from "@/components/NavigationHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductQuiz } from "@/components/ProductQuiz";
import { useProductById, getCategoryIdFromName } from "@/hooks/useProducts";
import { CheckCircle } from "lucide-react";
import { EditableText } from "@/components/EditableText";
import { EditableTags } from "@/components/EditableTags";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";


export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { product, loading } = useProductById(productId || '');
  const { toast } = useToast();

  const updateProduct = async (field: string, value: any) => {
    if (!product) return;
    
    const { error } = await supabase
      .from('products')
      .update({ [field]: value })
      .eq('id', product.id);

    if (error) {
      throw new Error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <NavigationHeader 
          title="Loading..."
          subtitle="Fetching product details..."
          showBackButton
          onBack={() => window.history.back()}
        />
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => navigate('/')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationHeader 
        title={`🧾 ${product.title}`}
        subtitle={(product as any).categories?.name || 'Product Details'}
        showBackButton
        onBack={() => {
          const categoryId = getCategoryIdFromName((product as any).categories?.name || '');
          navigate(`/category/${categoryId}`);
        }}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { 
            label: (product as any).categories?.name || 'Products', 
            href: `/category/${getCategoryIdFromName((product as any).categories?.name || '')}`
          },
          { label: product.title }
        ]}
      />
      
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        
        {/* Tags */}
        <div className="space-y-2">
          <EditableTags
            tags={product.tags || []}
            onSave={(newTags) => updateProduct('tags', newTags)}
          />
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🗂️</span> Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <EditableText
              value={product.description || ''}
              onSave={(newValue) => updateProduct('description', newValue)}
              multiline
              className="text-muted-foreground leading-relaxed"
              placeholder="Add product description..."
            />
          </CardContent>
        </Card>

        {/* Key Highlights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>📊</span> Key Highlights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              {product.highlights?.map((highlight, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{highlight}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Useful Links - Placeholder for future enhancement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🔗</span> Useful Links
            </CardTitle>
            <CardDescription>
              Additional resources and materials (coming soon)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start" disabled>
                📄 Benefit Illustration (PDF)
              </Button>
              <Button variant="outline" className="justify-start" disabled>
                📋 Product Summary (PDF)
              </Button>
              <Button variant="outline" className="justify-start" disabled>
                🌐 AIA Website
              </Button>
              <Button variant="outline" className="justify-start" disabled>
                📚 Supplementary Materials
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* AI Assistant - Placeholder */}
        <Card className="border-primary/20 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🤖</span> Ask the AI (Custom GPT)
            </CardTitle>
            <CardDescription>
              Get instant answers about this product's features, benefits, and objection handling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="hero" size="lg" disabled>
              ➡️ AI Assistant (Coming Soon)
            </Button>
          </CardContent>
        </Card>

        {/* Training Videos - Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🎥</span> Training Videos
            </CardTitle>
            <CardDescription>
              Comprehensive video library for different learning purposes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-4">🎬</div>
                <p className="text-muted-foreground">Training videos coming soon</p>
                <p className="text-sm text-muted-foreground mt-2">Loom-style explainer videos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Knowledge Quiz */}
        {/* Knowledge Quiz - Disabled for now since we don't have quiz data in database yet */}
        {/* <ProductQuiz questions={[]} productId={product.id} /> */}

      </div>
    </div>
  );
}