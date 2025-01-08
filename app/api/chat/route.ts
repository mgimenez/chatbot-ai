import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const systemPrompt = "You are a helpful AI assistant.";

const openai_hf = new OpenAI({
   baseURL: "https://api-inference.huggingface.co/v1/",
   apiKey: process.env.HUGGINGFACE_API_KEY,
});

async function handleHuggingFaceChat(message: string) {
  try {
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: message }
    ];

    const response = await openai_hf.chat.completions.create({
        model: "NousResearch/Hermes-3-Llama-3.1-8B",
        messages,
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.9
    });

    return response.choices[0].message.content || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error('Hugging Face Chat Error:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }


    const finalResponse = await handleHuggingFaceChat(message);
    return NextResponse.json({ success: true, message: finalResponse });
    
  } catch (error) {
    // Mejoramos el logging del error
    console.error('Chat API Error:', {
      error: error
    });
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal Server Error',
        // details: error.message // Solo en desarrollo
      }, 
      { status: 500 }
    );
  }
}