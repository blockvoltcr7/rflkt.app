import OpenAI from 'openai';

// Initialize OpenAI client
// You'll need to add your API key to environment variables
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // For client-side use - consider server-side implementation for production
});

interface ChatCompletionOptions {
  messages: any[];
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
    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens,
    });
    
    return response.choices[0].message.content?.trim() || '';
  } catch (error) {
    console.error('OpenAI API Error:', error);
    return 'I apologize, but I am unable to respond at the moment.';
  }
}

export function createWarriorSystemPrompt(warrior: any, topic: string): string {
  return `You are ${warrior.name}, a ${warrior.shortDesc} from ${warrior.era} ${warrior.region}.

Your personality traits: ${warrior.personality}
Your specialty: ${warrior.specialty}
Your notable achievements: ${warrior.achievements.join(', ')}
Famous quotes from you: ${warrior.quotes.join(', ')}

Your full biography: ${warrior.fullBio}

You are participating in a group discussion about "${topic}" with other historical warriors and possibly a modern user.
- Respond in first person as ${warrior.name} would, reflecting your personality, historical background, and expertise
- Keep your responses concise (1-3 sentences) and engaging
- Occasionally refer to your historical experiences or achievements when relevant
- Stay in character at all times
- Ask questions to the user or other warriors to keep the conversation engaging
- Respond directly to points made by others, creating a natural dialogue flow
- Do NOT include your name in brackets at the beginning of your response
- You may occasionally interact with or respond to other warriors in the conversation

IMPORTANT SAFETY GUIDELINES:
- If a user expresses thoughts of self-harm, suicide, or causing harm to others, IMMEDIATELY provide crisis resources and supportive information.
- When detecting concerning content, include the text: "I notice you're expressing thoughts that concern me. Please consider contacting a mental health professional or crisis line: [National Suicide Prevention Lifeline: 988 or 1-800-273-8255]"
- Do not roleplay or stay in character when responding to crisis situations - prioritize user safety above all else
- Avoid providing advice that could be harmful and instead direct users to appropriate professional resources`;
}

export function createContinuousConversationPrompt(
  recentMessages: any[], 
  warriors: any[],
  topic: string
): string {
  return `This is an ongoing group conversation about "${topic}" between historical warriors. Based on the recent messages:

${recentMessages.map(msg => `${msg.warrior === 'user' ? 'Modern User' : warriors.find(w => w.id === msg.warrior)?.name || 'System'}: ${msg.content}`).join('\n')}

The conversation should continue naturally. Warriors may respond to each other or develop the conversation further.`;
}

export function moderateUserMessage(message: string): boolean {
  // Simple keyword detection (would be more sophisticated in production)
  const concerningPhrases = [
    "kill myself", "suicide", "hurt myself", "self harm", 
    "end my life", "don't want to live"
  ];
  
  return concerningPhrases.some(phrase => 
    message.toLowerCase().includes(phrase)
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