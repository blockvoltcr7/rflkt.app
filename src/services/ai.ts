import * as OpenAIService from './openai';
import * as GemmaService from './gemma';
import { Warrior } from "@/data/warriors";
import { getModelConfig } from './modelConfig';

// Define Message type locally to avoid circular dependencies
interface Message {
  warrior: string | "user" | "system" | "phrase";
  content: string;
  timestamp: Date;
}

// Model provider options
export type ModelProvider = 'openai' | 'gemma';

// Model options for each provider
export const MODEL_OPTIONS = {
  openai: ['gpt-4o-mini', 'gpt-3.5-turbo', 'gpt-4o'],
  gemma: ['google/gemma-3-27b-it:free']
};

// Default models for each provider
export const DEFAULT_MODELS = {
  openai: 'gpt-4o-mini',
  gemma: 'google/gemma-3-27b-it:free'
};

interface ChatCompletionOptions {
  messages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }>;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  provider?: ModelProvider;
}

export async function createChatCompletion({ 
  messages, 
  model,
  temperature = 0.7,
  max_tokens = 400,
  provider
}: ChatCompletionOptions) {
  // Get the global config
  const config = getModelConfig();
  
  // Use the provided provider/model if specified, otherwise use the global config
  const activeProvider = provider || config.provider;
  const activeModel = model || config.model;
  
  // Select the appropriate service based on the provider
  const service = activeProvider === 'openai' ? OpenAIService : GemmaService;
  
  return service.createChatCompletion({
    messages,
    model: activeModel,
    temperature,
    max_tokens
  });
}

// Re-export the utility functions from OpenAI service
// These functions don't depend on the actual API calls, just prompt formatting
export const {
  createWarriorSystemPrompt,
  createContinuousConversationPrompt,
  moderateUserMessage,
  getWarriorWisdom,
  createPhraseSystemPrompt
} = OpenAIService; 