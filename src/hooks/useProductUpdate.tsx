
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export function useProductUpdate() {
  const { user } = useAuth();
  const { toast } = useToast();

  const updateProduct = async (productId: string, field: string, value: any) => {
    console.log('🔄 Updating product:', { productId, field, value, user: user?.id });
    
    // Check authentication (bypass in development mode)
    const isDevelopment = import.meta.env.DEV;
    if (!user && !isDevelopment) {
      const error = new Error('User not authenticated');
      console.error('❌ Authentication error:', error);
      toast({
        title: "Authentication Error",
        description: "You must be logged in to update products",
        variant: "destructive",
      });
      throw error;
    }
    
    if (isDevelopment && !user) {
      console.log('🚧 Development mode: Allowing update without authentication');
    }

    // Validate data format for JSON fields
    if ((field === 'useful_links' || field === 'training_videos') && !Array.isArray(value)) {
      const error = new Error(`${field} must be an array`);
      console.error('❌ Validation error:', error);
      toast({
        title: "Validation Error", 
        description: `${field} must be an array`,
        variant: "destructive",
      });
      throw error;
    }
    
    try {
      console.log('📡 Sending update to Supabase...', { 
        table: 'products', 
        id: productId, 
        field, 
        value: JSON.stringify(value).substring(0, 200) + '...' 
      });
      
      const { data, error } = await supabase
        .from('products')
        .update({ [field]: value })
        .eq('id', productId)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Supabase update error:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          field,
          productId
        });
        toast({
          title: "Update Failed",
          description: `Failed to update ${field}: ${error.message}`,
          variant: "destructive",
        });
        throw new Error(`Supabase error: ${error.message}`);
      }

      console.log('✅ Update successful:', { 
        data: data ? { id: data.id, [field]: data[field] } : null, 
        updatedField: field 
      });
      
      toast({
        title: "Success",
        description: `${field.replace('_', ' ')} updated successfully`,
      });
      
      return data;
    } catch (err: any) {
      console.error('❌ Update failed:', {
        error: err.message,
        stack: err.stack,
        productId,
        field,
        value: JSON.stringify(value).substring(0, 100),
        userId: user?.id
      });
      
      if (!err.message.includes('Supabase error:')) {
        toast({
          title: "Update Failed",
          description: `An unexpected error occurred: ${err.message}`,
          variant: "destructive",
        });
      }
      throw err;
    }
  };

  return { updateProduct };
}
