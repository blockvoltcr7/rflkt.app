import OpenAI from 'openai';
import { Warrior } from "@/data/warriors";
import { loadYamlFile, interpolateTemplate } from '@/utils/yaml';
import path from 'path';

// Define paths to prompt templates
const PROMPT_PATHS = {
  BASE_SAFETY: 'base/safety_guidelines.yaml',
  BASE_PHRASE: 'phrases/base.yaml',
  SPECIFIC_PHRASES: 'phrases/specific',
  BASE_WARRIOR: 'warriors/base.yaml',
  SPECIFIC_WARRIORS: 'warriors/specific',
  CONTINUOUS_CONV: 'conversations/continuous.yaml'
} as const;

/**
 * Loads and caches YAML templates to avoid repeated disk reads
 */
class PromptTemplateCache {
  private static cache: Map<string, any> = new Map();

  static async get(templatePath: string): Promise<any> {
    if (!this.cache.has(templatePath)) {
      const fullPath = path.join(process.cwd(), 'src/prompts', templatePath);
      this.cache.set(templatePath, await loadYamlFile(fullPath));
    }
    return this.cache.get(templatePath);
  }

  static clear(): void {
    this.cache.clear();
  }
}

// Define Message type locally to avoid circular dependencies
interface Message {
  warrior: string | "user" | "system" | "phrase";
  content: string;
  timestamp: Date;
}

// Initialize OpenAI client
// You'll need to add your API key to environment variables
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // For client-side use - consider server-side implementation for production
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
  model = 'gpt-4o-mini', 
  temperature = 0.7,
  max_tokens = 400
}: ChatCompletionOptions) {
  try {
    // Log the API call attempt
    console.log(`Making OpenAI API call to model: ${model}`);
    
    // Check if API key is set
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      console.error("OpenAI API key is missing");
      return "Error: OpenAI API key is missing. Please add it to your .env file.";
    }
    
    // Ensure messages strictly conform to OpenAI's expected types
    const validMessages = messages.map(msg => ({
      role: msg.role as "system" | "user" | "assistant",
      content: msg.content
    }));
    
    // Make the API call
    const response = await openai.chat.completions.create({
      model,
      messages: validMessages,
      temperature,
      max_tokens
    });
    
    // Get the response content
    const content = response.choices[0].message.content?.trim() || '';
    
    // Log success
    console.log("API call successful, response length:", content.length);
    
    return content;
  } catch (error) {
    // Log detailed error information
    console.error('OpenAI API Error:', error);
    
    let errorMessage = 'I apologize, but I am unable to respond at the moment.';
    
    // Provide more specific error message if possible
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        errorMessage = 'API key error: Please check your OpenAI API key.';
      } else if (error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded: The API is receiving too many requests.';
      } else if (error.message.includes('500')) {
        errorMessage = 'OpenAI server error: Please try again later.';
      }
      
      console.error('Error details:', error.message);
    }
    
    return errorMessage;
  }
}

/**
 * Creates a system prompt for a specific warrior
 * @param warrior - The warrior object containing character details
 * @param topic - The conversation topic
 */
export async function createWarriorSystemPrompt(warrior: Warrior, topic: string): Promise<string> {
  const baseTemplate = await PromptTemplateCache.get(PROMPT_PATHS.BASE_WARRIOR);
  let specificTemplate = {};
  
  try {
    specificTemplate = await PromptTemplateCache.get(
      path.join(PROMPT_PATHS.SPECIFIC_WARRIORS, `${warrior.id}.yaml`)
    );
  } catch (error) {
    console.warn(`No specific template found for warrior ${warrior.id}`);
  }

  const safetyGuidelines = await PromptTemplateCache.get(PROMPT_PATHS.BASE_SAFETY);
  
  return interpolateTemplate(baseTemplate.template, {
    ...warrior,
    ...specificTemplate,
    topic,
    safety_guidelines: safetyGuidelines.safety_instructions
  });
}

/**
 * Creates a system prompt for a motivational phrase
 * @param phrase - The name of the motivational phrase
 * @param topic - Optional topic for context
 */
export async function createPhraseSystemPrompt(phrase: string, topic: string = ""): Promise<string> {
  const baseTemplate = await PromptTemplateCache.get(PROMPT_PATHS.BASE_PHRASE);
  const safetyGuidelines = await PromptTemplateCache.get(PROMPT_PATHS.BASE_SAFETY);
  
  let specificTemplate;
  try {
    specificTemplate = await PromptTemplateCache.get(
      path.join(PROMPT_PATHS.SPECIFIC_PHRASES, `${phrase.toLowerCase().replace(/\s+/g, '_')}.yaml`)
    );
  } catch (error) {
    console.warn(`No specific template found for phrase ${phrase}`);
    specificTemplate = {
      phrase_name: phrase,
      core_concept: `the motivational concept "${phrase}"`,
      perspective: "personal growth and development",
      principles: ["Embrace growth", "Stay motivated", "Keep pushing forward"]
    };
  }

  return interpolateTemplate(baseTemplate.template, {
    ...specificTemplate,
    topic,
    safety_guidelines: safetyGuidelines.safety_instructions
  });
}

/**
 * Creates a prompt for continuous conversation between warriors
 * @param recentMessages - Array of recent messages in the conversation
 * @param warriors - Array of warrior objects
 * @param topic - The conversation topic
 */
export async function createContinuousConversationPrompt(
  recentMessages: Message[], 
  warriors: Warrior[],
  topic: string
): Promise<string> {
  const template = await PromptTemplateCache.get(PROMPT_PATHS.CONTINUOUS_CONV);
  
  const formattedMessages = recentMessages.map(msg => ({
    warrior_name: msg.warrior === 'user' ? 'Modern User' : 
      warriors.find(w => w.id === msg.warrior)?.name || 'System',
    content: msg.content
  }));

  return interpolateTemplate(template.template, {
    topic,
    messages: formattedMessages
  });
}

/**
 * Checks if a user message contains concerning content
 * @param message - The user's message
 */
export async function moderateUserMessage(message: string): Promise<boolean> {
  const safetyGuidelines = await PromptTemplateCache.get(PROMPT_PATHS.BASE_SAFETY);
  return safetyGuidelines.crisis_detection.keywords.some(keyword => 
    message.toLowerCase().includes(keyword)
  );
}

export function getWarriorWisdom(warriorId: string): string {
  const wisdomMap: Record<string, string> = {
    "musashi": "Share insights on inner peace, self-mastery, and finding purpose through discipline. Emphasize how solitude can be a strength and how persistence leads to mastery.",
    
    "joan": "Offer wisdom on faith, conviction, and standing up for one's beliefs even when facing opposition. Emphasize the importance of moral courage and spiritual strength.",
    
    "hannibal": "Provide strategic insights on overcoming obstacles, adapting to challenges, and the importance of planning. Focus on resilience and determination in the face of setbacks.",
    
    "leonidas": "Share wisdom on sacrifice, duty, honor, and the strength found in unity and brotherhood. Emphasize the values of discipline and standing firm against overwhelming odds.",
    
    "alexander": "Offer perspectives on ambition, vision, cultural understanding, and lifelong learning. Focus on bold leadership and breaking barriers that others thought impossible."
  };
  
  return wisdomMap[warriorId] || "Share your historical wisdom and perspective on overcoming challenges.";
}