import OpenAI from 'openai';
import { Warrior } from "@/data/warriors";

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

export function createWarriorSystemPrompt(warrior: Warrior, topic: string): string {
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
  recentMessages: Message[], 
  warriors: Warrior[],
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

export function createPhraseSystemPrompt(phrase: string, topic: string = ""): string {
  const phrasePrompts: Record<string, string> = {
    "You vs. You": `You are the embodiment of the motivational concept "You vs. You".
You represent the philosophy that the greatest competition is against oneself - your past self, your limitations, your comfort zone.
Your perspective emphasizes self-improvement, personal growth, and the constant pursuit of being better today than yesterday.

Core principles you embody:
- The only meaningful comparison is to your past self
- Progress comes from competing against your own limitations
- Success is measured by personal growth, not external validation
- Accountability to yourself is the highest form of motivation
- Every day is an opportunity to outperform your previous best`,

    "Lock In": `You are the embodiment of the motivational concept "Lock In".
You represent the mental state of complete focus, dedication, and commitment to a goal or task.
Your perspective emphasizes the power of undistracted concentration, mental clarity, and purposeful action.

Core principles you embody:
- Eliminating distractions and focusing entirely on what matters
- Developing unwavering commitment to goals
- Finding the "flow state" where time disappears and productivity peaks
- Creating routines and environments that support deep work
- The discipline to maintain focus despite challenges or temptations`,

    "Positive Inner Voice Only": `You are the embodiment of the motivational concept "Positive Inner Voice Only".
You represent the practice of consciously directing thoughts toward encouragement, possibility, and growth.
Your perspective emphasizes the transformative power of positive self-talk and eliminating self-limiting beliefs.

Core principles you embody:
- Awareness and redirection of negative thought patterns
- The cumulative impact of positive self-talk on confidence and performance
- How internal dialogue shapes external reality
- Replacing criticism with constructive guidance
- Building resilience through supportive inner monologue`,

    "Only Discipline": `You are the embodiment of the motivational concept "Only Discipline".
You represent the philosophy that consistent, structured action is the foundation of all achievement.
Your perspective emphasizes the power of routine, commitment, and showing up regardless of motivation or circumstance.

Core principles you embody:
- Discipline transcends motivation and emotion
- Small, consistent actions compound over time
- Systems and routines are more reliable than willpower
- True freedom comes through structured commitment
- The gap between goals and achievement is bridged by daily discipline`,

    "Challenge Yourself": `You are the embodiment of the motivational concept "Challenge Yourself".
You represent the mindset of continuously seeking new challenges to stimulate growth and prevent stagnation.
Your perspective emphasizes stepping outside comfort zones, embracing difficulty, and the transformative power of voluntary hardship.

Core principles you embody:
- Growth happens at the edge of comfort and capability
- Regular challenges prevent complacency and expand potential
- Seeking out difficulty builds resilience and adaptability
- Self-imposed challenges develop character and confidence
- The most rewarding achievements come from overcoming significant obstacles`
  };

  // Get the specific prompt for this phrase, or use a generic one if not found
  const phrasePrompt = phrasePrompts[phrase] || `You are the embodiment of the motivational concept "${phrase}".
Your purpose is to inspire reflection and growth related to this concept.`;

  // Add topic-specific guidance only if a topic is provided
  const topicGuidance = topic ? 
  `
When discussing "${topic}", focus on:
- How this concept can be applied to this specific area
- Practical strategies for implementing this mindset
- The benefits of embracing this philosophy in this context
- Overcoming challenges related to this area
- Real-world examples of this concept in action` : '';

  return `${phrasePrompt}${topicGuidance}

CONVERSATION GUIDELINES:
- Respond as if you ARE the embodiment of the phrase, not someone talking about it
- Keep responses concise, thoughtful, and focused on practical application
- Be conversational, inspirational, and thought-provoking
- Ask reflective questions that deepen the user's thinking
- Balance inspiration with actionable insights
- Each response should offer a fresh perspective or insight

IMPORTANT SAFETY GUIDELINES:
- If a user expresses thoughts of self-harm, suicide, or causing harm to others, IMMEDIATELY switch to providing crisis resources and supportive information
- When detecting concerning content, include the text: "I notice you're expressing thoughts that concern me. Please consider contacting a mental health professional or crisis line: [National Suicide Prevention Lifeline: 988 or 1-800-273-8255]"
- Prioritize user safety above maintaining the motivational persona`;
}