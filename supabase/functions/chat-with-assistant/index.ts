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
    const { messages, productId, action, threadId, stream = false } = await req.json();
    
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
      if (stream) {
        return await streamChatWithAssistant(product, messages, openAIApiKey, threadId);
      } else {
        return await chatWithAssistant(product, messages, openAIApiKey, threadId);
      }
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

FORMATTING INSTRUCTIONS:
- Always format your responses using proper markdown for better readability
- Use **bold text** for important points and product names
- Use *italic text* for emphasis
- Use bullet points (-) for lists of features, benefits, or tips
- Use numbered lists (1.) for step-by-step processes
- Use ## for main section headings when appropriate
- Use ### for subsection headings
- Use > for important quotes or key takeaways
- Use \`code\` formatting for technical terms, premium amounts, or specific product codes
- Keep paragraphs concise and well-structured

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
      model: 'gpt-4o-mini',
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

async function streamChatWithAssistant(product: any, messages: any[], openAIApiKey: string, threadId?: string) {
  if (!product.assistant_id) {
    throw new Error('No assistant found for this product. Please create an assistant first.');
  }

  console.log('Streaming chat with assistant for product:', product.title);

  // First, get the assistant response using the regular flow
  const responseData = await getAssistantResponse(product, messages, openAIApiKey, threadId);
  
  // Set up Server-Sent Events headers
  const headers = {
    ...corsHeaders,
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  };

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial metadata
      controller.enqueue(`data: ${JSON.stringify({ 
        type: 'metadata', 
        threadId: responseData.threadId 
      })}\n\n`);

      // Stream the response word by word
      const words = responseData.message.split(' ');
      let currentText = '';
      
      for (let index = 0; index < words.length; index++) {
        currentText += (index > 0 ? ' ' : '') + words[index];
        
        controller.enqueue(`data: ${JSON.stringify({ 
          type: 'content', 
          content: currentText,
          isComplete: index === words.length - 1
        })}\n\n`);
        
        // Add a small delay between words for smooth streaming effect
        if (index < words.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }
      
      controller.enqueue(`data: ${JSON.stringify({ 
        type: 'done',
        threadId: responseData.threadId,
        usage: responseData.usage
      })}\n\n`);
      
      controller.close();
    }
  });

  return new Response(stream, { headers });
}

async function getAssistantResponse(product: any, messages: any[], openAIApiKey: string, threadId?: string) {
  let currentThreadId = threadId;

  // Create a new thread if none provided
  if (!currentThreadId) {
    console.log('Creating new thread...');
    const threadResponse = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'assistants=v2',
      },
      body: JSON.stringify({}),
    });

    const threadData = await threadResponse.json();
    if (!threadResponse.ok) {
      throw new Error(threadData.error?.message || 'Failed to create thread');
    }
    
    currentThreadId = threadData.id;
    console.log('Created thread:', currentThreadId);
  }

  // Get the latest user message
  const latestUserMessage = messages[messages.length - 1];
  if (!latestUserMessage || latestUserMessage.role !== 'user') {
    throw new Error('No user message found');
  }

  // Add the user message to the thread
  console.log('Adding message to thread...');
  const messageResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2',
    },
    body: JSON.stringify({
      role: 'user',
      content: latestUserMessage.content,
    }),
  });

  const messageData = await messageResponse.json();
  if (!messageResponse.ok) {
    throw new Error(messageData.error?.message || 'Failed to add message to thread');
  }

  // Create a run
  console.log('Creating run...');
  const runResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2',
    },
    body: JSON.stringify({
      assistant_id: product.assistant_id,
    }),
  });

  const runData = await runResponse.json();
  if (!runResponse.ok) {
    throw new Error(runData.error?.message || 'Failed to create run');
  }

  const runId = runData.id;
  console.log('Created run:', runId);

  // Poll for completion
  let run = runData;
  const maxAttempts = 30;
  let attempts = 0;

  while (run.status === 'queued' || run.status === 'in_progress') {
    if (attempts >= maxAttempts) {
      throw new Error('Assistant response timed out');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;

    const statusResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs/${runId}`, {
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'OpenAI-Beta': 'assistants=v2',
      },
    });

    run = await statusResponse.json();
    console.log('Run status:', run.status);
  }

  if (run.status !== 'completed') {
    throw new Error(`Assistant run failed with status: ${run.status}`);
  }

  // Get the assistant's response
  console.log('Retrieving messages...');
  const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'OpenAI-Beta': 'assistants=v2',
    },
  });

  const messagesData = await messagesResponse.json();
  if (!messagesResponse.ok) {
    throw new Error('Failed to retrieve messages');
  }

  // Get the latest assistant message
  const assistantMessages = messagesData.data.filter((msg: any) => msg.role === 'assistant');
  if (assistantMessages.length === 0) {
    throw new Error('No assistant response found');
  }

  const latestAssistantMessage = assistantMessages[0];
  const messageContent = latestAssistantMessage.content[0]?.text?.value || 'No response available';

  return {
    message: messageContent,
    threadId: currentThreadId,
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
  };
}

async function chatWithAssistant(product: any, messages: any[], openAIApiKey: string, threadId?: string) {
  const responseData = await getAssistantResponse(product, messages, openAIApiKey, threadId);
  
  return new Response(JSON.stringify(responseData), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
