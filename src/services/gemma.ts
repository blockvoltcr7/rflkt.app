import axios from 'axios';
import OpenAI from 'openai';
import { Warrior } from "@/data/warriors";

// Define Message type locally to avoid circular dependencies
interface Message {
  warrior: string | "user" | "system" | "phrase";
  content: string;
  timestamp: Date;
}

// Initialize OpenRouter client for Gemma
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// Initialize OpenAI SDK with OpenRouter base URL
const openRouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: OPENROUTER_API_KEY || '',
  defaultHeaders: {
    'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
    'X-Title': 'RFLKT Warrior Chat',
  },
  dangerouslyAllowBrowser: true
});

interface ChatCompletionOptions {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

export async function createChatCompletion({ 
  messages, 
  model = 'google/gemma-3-27b-it:free', 
  temperature = 0.7,
  max_tokens = 400
}: ChatCompletionOptions) {
  try {
    // Force the correct model name format for Gemma
    const validModelName = model.includes(':free') ? model : 'google/gemma-3-27b-it:free';
    
    // Log the API call attempt
    console.log(`Making Gemma API call via OpenRouter to model: ${validModelName} (originally: ${model})`);
    console.log('API Key available:', !!OPENROUTER_API_KEY);
    
    // Check if API key is set
    if (!OPENROUTER_API_KEY) {
      console.error("OpenRouter API key is missing");
      return "Error: OpenRouter API key is missing. Please add it to your .env file.";
    }
    
    // Ensure messages strictly conform to expected types
    const validMessages = messages.map(msg => ({
      role: msg.role as "system" | "user" | "assistant",
      content: msg.content
    }));
    
    // Log request payload for debugging
    console.log('Request payload:', {
      model: validModelName,
      messages: validMessages.length,
      temperature,
      max_tokens
    });
    
    // Use OpenAI SDK with OpenRouter base URL
    const completion = await openRouter.chat.completions.create({
      model: validModelName,
      messages: validMessages,
      temperature,
      max_tokens
    });
    
    // Log success
    console.log("API call successful, response:", completion);
    
    const content = completion.choices[0].message.content?.trim() || '';
    
    return content;
  } catch (error) {
    // Log detailed error information
    console.error('Gemma API Error:', error);
    
    let errorMessage = 'I apologize, but I am unable to respond at the moment.';
    
    // Provide more specific error message if possible
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        errorMessage = 'API key error: Please check your OpenRouter API key.';
      } else if (error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded: The API is receiving too many requests.';
      } else if (error.message.includes('500')) {
        errorMessage = 'OpenRouter server error: Please try again later.';
      }
      
      console.error('Error details:', error.message);
      
      // Include the full error message to help with debugging
      errorMessage = `${errorMessage} (${error.message})`;
    }
    
    return errorMessage;
  }
}

// Re-export the functions from OpenAI service to maintain the same interface
export { 
  createWarriorSystemPrompt,
  createContinuousConversationPrompt,
  moderateUserMessage,
  getWarriorWisdom,
  createPhraseSystemPrompt
} from './openai'; 