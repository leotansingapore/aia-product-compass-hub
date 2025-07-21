
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, productId, action } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get product data
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      throw new Error('Product not found');
    }

    console.log('Product data:', product);

    // Handle different actions
    if (action === 'create_assistant') {
      return await createAssistant(product, openAIApiKey, supabase);
    } else if (action === 'chat') {
      return await chatWithAssistant(product, messages, openAIApiKey);
    } else if (action === 'update_assistant') {
      return await updateAssistant(product, openAIApiKey);
    }

    throw new Error('Invalid action');

  } catch (error) {
    console.error('Error in chat-with-assistant function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An error occurred while processing your request' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createAssistant(product: any, openAIApiKey: string, supabase: any) {
  console.log('Creating assistant for product:', product.id);

  // Create product-specific instructions
  const instructions = `You are a specialized AI assistant for the financial product "${product.title}". 

Product Details:
- Name: ${product.title}
- Description: ${product.description || 'Not provided'}
- Category: ${product.category_id}
- Key Highlights: ${product.highlights ? product.highlights.join(', ') : 'Not provided'}

Your Role:
You are an expert on this specific financial product. You should:
1. Provide detailed information about features, benefits, and use cases
2. Address common objections and concerns about this product
3. Help financial advisors understand how to position this product
4. Answer questions about product eligibility, requirements, and processes
5. Provide practical sales tips and objection handling techniques

Always be professional, accurate, and helpful. If asked about other products, acknowledge but redirect focus to this specific product. If you're unsure about specific details, recommend consulting official product documentation.`;

  // Create assistant via OpenAI API
  const response = await fetch('https://api.openai.com/v1/assistants', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      name: `${product.title} Expert Assistant`,
      instructions: instructions,
      description: `Specialized assistant for the financial product: ${product.title}`,
      temperature: 0.7,
    }),
  });

  const assistantData = await response.json();
  
  if (!response.ok) {
    throw new Error(assistantData.error?.message || 'Failed to create assistant');
  }

  console.log('Created assistant:', assistantData.id);

  // Update product with assistant ID and instructions
  const { error: updateError } = await supabase
    .from('products')
    .update({
      assistant_id: assistantData.id,
      assistant_instructions: instructions
    })
    .eq('id', product.id);

  if (updateError) {
    console.error('Failed to update product with assistant ID:', updateError);
    throw new Error('Failed to save assistant ID');
  }

  return new Response(JSON.stringify({ 
    assistantId: assistantData.id,
    message: 'Assistant created successfully' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function updateAssistant(product: any, openAIApiKey: string) {
  if (!product.assistant_id) {
    throw new Error('No assistant found for this product');
  }

  console.log('Updating assistant:', product.assistant_id);

  // Update assistant instructions
  const instructions = product.assistant_instructions || `You are a specialized AI assistant for the financial product "${product.title}".`;

  const response = await fetch(`https://api.openai.com/v1/assistants/${product.assistant_id}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2',
    },
    body: JSON.stringify({
      name: `${product.title} Expert Assistant`,
      instructions: instructions,
      description: `Specialized assistant for the financial product: ${product.title}`,
    }),
  });

  const assistantData = await response.json();
  
  if (!response.ok) {
    throw new Error(assistantData.error?.message || 'Failed to update assistant');
  }

  return new Response(JSON.stringify({ 
    message: 'Assistant updated successfully' 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function chatWithAssistant(product: any, messages: any[], openAIApiKey: string) {
  console.log('Using fast Chat Completion API for product:', product.title);

  // Build specialized system prompt with product context
  const systemPrompt = `You are a specialized AI assistant for the financial product "${product.title}".

Product Details:
- Name: ${product.title}
- Description: ${product.description || 'Not provided'}
- Category: ${product.category_id}
- Key Highlights: ${product.highlights ? product.highlights.join(', ') : 'Not provided'}

Your Role:
You are an expert on this specific financial product. You should:
1. Provide detailed information about features, benefits, and use cases
2. Address common objections and concerns about this product
3. Help financial advisors understand how to position this product
4. Answer questions about product eligibility, requirements, and processes
5. Provide practical sales tips and objection handling techniques

Always be professional, accurate, and helpful. If asked about other products, acknowledge but redirect focus to this specific product. If you're unsure about specific details, recommend consulting official product documentation.

${product.assistant_instructions ? `\nAdditional Instructions: ${product.assistant_instructions}` : ''}`;

  // Use direct Chat Completion API for much faster responses
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ],
      temperature: 0.7,
      max_tokens: 1000,
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || 'OpenAI API error');
  }

  const assistantMessage = data.choices[0].message.content;

  return new Response(JSON.stringify({ 
    message: assistantMessage,
    usage: data.usage 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
