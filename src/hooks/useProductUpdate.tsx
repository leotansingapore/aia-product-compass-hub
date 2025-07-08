import { supabase } from "@/integrations/supabase/client";

export function useProductUpdate() {
  const updateProduct = async (productId: string, field: string, value: any) => {
    console.log('🔄 Updating product:', { productId, field, value });
    
    try {
      const { data, error } = await supabase
        .from('products')
        .update({ [field]: value })
        .eq('id', productId)
        .select('*')
        .single();

      if (error) {
        console.error('❌ Update error:', error);
        throw new Error(error.message);
      }

      console.log('✅ Update successful:', data);
      return data;
    } catch (err) {
      console.error('❌ Update failed:', err);
      throw err;
    }
  };

  return { updateProduct };
}