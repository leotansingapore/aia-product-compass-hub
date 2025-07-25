import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { messages, productInfo, customInstructions, cmfasMode, moduleId, moduleName } = await req.json();
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Build system prompt with appropriate context
    let systemPrompt;
    
    if (cmfasMode) {
      systemPrompt = `You are a helpful CMFAS Exam tutor, your students will ask you questions related to the CMFAS exams and financial advisory services in Singapore.

${moduleId && moduleName ? `
Current Module: ${moduleName} (${moduleId.toUpperCase()})
Focus on topics specifically relevant to this module while maintaining broad CMFAS knowledge.
` : ''}

You should help with:
- Exam preparation strategies and study tips
- Key concepts and regulations in Singapore's financial advisory landscape
- Product knowledge for investment-linked policies, life insurance, health insurance
- Regulatory requirements and compliance (MAS guidelines)
- Practice questions and exam format guidance
- Professional ethics and best practices
- Calculations and technical concepts

Always be encouraging, patient, and educational. Break down complex topics into understandable parts and provide practical examples when helpful.`;
    } else {
      systemPrompt = `You are an AI assistant specialized in helping with financial advisory products. 

Product Context:
${productInfo ? `
Product Name: ${productInfo.name}
Product Category: ${productInfo.category}
Product Summary: ${productInfo.summary || 'Not provided'}
Product Highlights: ${productInfo.highlights ? productInfo.highlights.join(', ') : 'Not provided'}
` : ''}

${customInstructions || 'Provide helpful, accurate information about this financial product. Focus on features, benefits, and addressing common objections or questions that financial advisors might have.'}

Always be professional, accurate, and helpful. If you're unsure about specific product details, acknowledge the limitation and suggest consulting official product documentation.`;
    }

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
          ...messages
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
  } catch (error) {
    console.error('Error in chat-with-gpt function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'An error occurred while processing your request' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});