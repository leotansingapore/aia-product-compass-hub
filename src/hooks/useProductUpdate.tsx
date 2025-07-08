import { supabase } from "@/integrations/supabase/client";

export function useProductUpdate() {
  const updateProduct = async (productId: string, field: string, value: any) => {
    const { error } = await supabase
      .from('products')
      .update({ [field]: value })
      .eq('id', productId);

    if (error) {
      throw new Error(error.message);
    }
  };

  return { updateProduct };
}