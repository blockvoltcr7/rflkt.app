import { useState, useRef, useEffect, useCallback } from "react";
import { Warrior } from "@/data/warriors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { RefreshCw, Send, PauseCircle, PlayCircle, AlignJustify } from "lucide-react";
import { createChatCompletion, createWarriorSystemPrompt, createContinuousConversationPrompt, getWarriorWisdom, moderateUserMessage, createPhraseSystemPrompt } from "@/services/openai";
import { Message } from "@/types/chat";
import ReactMarkdown from 'react-markdown';

interface ChatInterfaceProps {
  warriors: Warrior[];
  topic: string;
  onBack: () => void;
  chatMode: "warriors" | "phrase";
  selectedPhrase: string;
}

export const ChatInterface = ({ warriors, topic, onBack, chatMode, selectedPhrase }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationPaused, setConversationPaused] = useState(false);
  const [nextWarriorIndex, setNextWarriorIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Track if we're waiting for API responses to avoid multiple simultaneous calls
  const isProcessingRef = useRef(false);
  
  // Create map of warrior contexts for the OpenAI prompts
  const warriorContexts = useRef<Record<string, { systemPrompt: string; warrior: Warrior }>>({});
  
  const [typingWarrior, setTypingWarrior] = useState<string | null>(null);
  
  const [conversationMemory, setConversationMemory] = useState<{
    overallSummary: string;
    recentMessages: Message[];
  }>({
    overallSummary: "",
    recentMessages: []
  });
  
  // If it's defined as a constant/variable, update the value to 10000 (10 seconds)
  const WARRIOR_RESPONSE_DELAY = 10000; // Changed from 6000 to 10000 (10 seconds)
  
  // Check for API key when component mounts
  useEffect(() => {
    // Check if API key is set
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      console.error("OpenAI API key is missing. Please add it to .env file.");
      toast.error("API key missing. Chat functionality will not work.");
      
      // Add a system error message
      const errorMessage: Message = {
        warrior: "system",
        content: "OpenAI API key is missing. Please add it to the .env file to use the chat functionality.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    }
  }, []);
  
  // Initialize chat interface and start conversation
  useEffect(() => {
    // Set loading state immediately
    setIsLoading(true);
    
    console.log(`Initializing chat with mode: ${chatMode}, phrase: ${selectedPhrase}, topic: ${topic}`);
    
    // Initialize warrior contexts if in warrior mode
    if (chatMode === "warriors") {
      // Initialize warrior contexts
      const contexts: Record<string, { systemPrompt: string; warrior: Warrior }> = {};
      warriors.forEach(warrior => {
        contexts[warrior.id] = {
          systemPrompt: createWarriorSystemPrompt(warrior, topic),
          warrior: warrior
        };
      });
      warriorContexts.current = contexts;
    }
    
    // Initialize chat with welcome message
    const initialMessage: Message = {
      warrior: "system",
      content: chatMode === "warriors" 
        ? `Welcome to a discussion on "${topic}" with historical warriors`
        : `Welcome to a reflection with "${selectedPhrase}"`,
      timestamp: new Date()
    };
    
    setMessages([initialMessage]);
    
    // Add a slight delay before starting the conversation
    // This ensures the welcome message is displayed first
    setTimeout(() => {
      // Start the initial warrior responses or phrase reflection
      if (chatMode === "warriors") {
        startInitialResponses();
      } else {
        startPhraseReflection();
      }
    }, 300);
    
    // Cleanup function
    return () => {
      // Clean up any pending operations
      isProcessingRef.current = false;
    };
  }, [warriors, topic, chatMode, selectedPhrase]);
  
  const startInitialResponses = async () => {
    // Don't set loading here since it's already set in the useEffect
    isProcessingRef.current = true;
    
    try {
      // Get the first warrior to respond
      const firstWarrior = warriors[0];
      
      // Show typing indicator
      setTypingWarrior(firstWarrior.id);
      
      const initialResponse = await getWarriorResponse(firstWarrior, [], topic);
      
      // Clear typing indicator
      setTypingWarrior(null);
      
      const firstMessage: Message = {
        warrior: firstWarrior.id,
        content: initialResponse,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, firstMessage]);
      setNextWarriorIndex(1); // Next warrior to respond
      
    } catch (error) {
      console.error("Error in initial responses:", error);
      toast.error("Failed to start conversation");
      
      // Add error message
      const errorMessage: Message = {
        warrior: "system",
        content: "Failed to start the conversation. Please try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      isProcessingRef.current = false;
      setIsLoading(false);
    }
  };
  
  const startPhraseReflection = async () => {
    isProcessingRef.current = true;
    
    try {
      // Debug message
      console.log("Starting phrase reflection for:", selectedPhrase);
      
      // Create system prompt for the phrase
      const phraseSystemPrompt = createPhraseSystemPrompt(selectedPhrase, "");
      
      // Show typing indicator for phrase
      setTypingWarrior("phrase");
      
      // Get initial reflection from the phrase perspective - with a direct explanation prompt
      const initialPrompt = [
        { role: "system" as const, content: phraseSystemPrompt },
        { role: "system" as const, content: "Provide a direct explanation of this phrase. First, explain what the phrase means in 2-3 sentences. Then, provide context for why this concept is important in personal development. Finally, share a specific real-life example that illustrates how this concept can be applied practically. Do not introduce yourself or ask questions." },
        { role: "system" as const, content: "Do not prefix your response with your name or the phrase name. Just provide your response directly." },
        { role: "user" as const, content: "I want to understand this phrase. Please explain it, why it's important, and give me a real example." }
      ];
      
      console.log("Sending API request with prompt:", initialPrompt);
      
      const response = await createChatCompletion({
        messages: initialPrompt,
        temperature: 0.8,
        max_tokens: 500
      });
      
      console.log("Received response:", response);
      
      // Add a short typing delay to make it feel more natural
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear typing indicator
      setTypingWarrior(null);
      
      // Clean up any name/phrase prefixes
      let cleanedResponse = response;
      
      // Remove patterns like "You vs. You:" prefix
      const phrasePattern = new RegExp(`^\\s*${selectedPhrase}\\s*:`, 'i');
      cleanedResponse = cleanedResponse.replace(phrasePattern, '');
      
      // Also remove doubled phrase patterns
      const doublePhrasePattern = new RegExp(`^\\s*${selectedPhrase}\\s*:\\s*${selectedPhrase}\\s*:`, 'i');
      cleanedResponse = cleanedResponse.replace(doublePhrasePattern, '');
      
      // Trim whitespace
      cleanedResponse = cleanedResponse.trim();
      
      // Only proceed if we got a non-empty response
      if (cleanedResponse && cleanedResponse.trim()) {
        const firstMessage: Message = {
          warrior: "phrase",
          content: cleanedResponse,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, firstMessage]);
        console.log("Added phrase message to state:", firstMessage);
      } else {
        console.error("Empty response received from API");
        throw new Error("Empty response from API");
      }
      
    } catch (error) {
      console.error("Error in initial phrase reflection:", error);
      toast.error("Failed to start reflection");
      
      // Add a system error message
      const errorMessage: Message = {
        warrior: "system",
        content: "I apologize, but I encountered an error starting the reflection. Please try again or select a different phrase.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      isProcessingRef.current = false;
      setIsLoading(false);
    }
  };
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Continue conversation effect - Only for Warrior chat mode
  useEffect(() => {
    let conversationTimer: NodeJS.Timeout;
    
    const continueConversation = async () => {
      // Only run this for warrior chat mode
      if (chatMode !== "warriors") return;
      
      // Don't continue if loading, processing, or conversation is paused
      if (isLoading || isProcessingRef.current || conversationPaused || messages.length === 0) return;
      
      isProcessingRef.current = true;
      setIsLoading(true);
      
      try {
        // Get recent context for the conversation (last 6 messages or fewer)
        const recentMessages = messages.slice(-Math.min(6, messages.length));
        
        // Choose next warrior to respond (round-robin)
        const warrior = warriors[nextWarriorIndex];
        
        // Get response from this warrior based on the conversation so far
        const response = await getWarriorResponse(
          warrior,
          recentMessages,
          topic
        );
        
        // Add a variable delay to simulate natural conversation timing (2-4 seconds)
        const typingDelay = 2000 + Math.random() * 2000;
        await new Promise(resolve => setTimeout(resolve, typingDelay));
        
        // Add the new message
        const newMessage: Message = {
          warrior: warrior.id,
          content: response,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // Update next warrior to respond (round-robin)
        setNextWarriorIndex((nextWarriorIndex + 1) % warriors.length);
        
      } catch (error) {
        console.error("Error in continue conversation:", error);
      } finally {
        isProcessingRef.current = false;
        setIsLoading(false);
      }
    };
    
    // Set timer to continue conversation every 8-12 seconds if not paused
    // Only for warrior chat mode
    if (chatMode === "warriors" && !conversationPaused && messages.length > 0) {
      const randomDelay = 8000 + Math.random() * 4000; // 8-12 seconds
      conversationTimer = setTimeout(continueConversation, randomDelay);
    }
    
    return () => {
      clearTimeout(conversationTimer);
    };
  }, [messages, warriors, nextWarriorIndex, isLoading, conversationPaused, topic, chatMode]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  
  // Function to get a specific warrior's response via OpenAI
  const getWarriorResponse = async (
    warrior: Warrior,
    contextMessages: Message[],
    currentTopic: string
  ): Promise<string> => {
    try {
      // Get the system prompt for this warrior
      const systemPrompt = warriorContexts.current[warrior.id].systemPrompt;
      
      // Add wisdom guidance based on warrior
      const wisdomPrompt = getWarriorWisdom(warrior.id);
      
      // Format messages for the OpenAI API
      const formattedMessages = [
        { role: "system" as const, content: systemPrompt },
        { role: "system" as const, content: `When sharing wisdom or advice: ${wisdomPrompt}` },
        // Add instruction to not prefix response with the warrior's name
        { role: "system" as const, content: "Do not prefix your response with your name or role. Just provide your response directly." },
        ...contextMessages.map(msg => {
          if (msg.warrior === "system") {
            return { role: "system" as const, content: msg.content };
          } else if (msg.warrior === "user") {
            return { role: "user" as const, content: msg.content };
          } else if (msg.warrior === "phrase") {
            return { role: "assistant" as const, content: msg.content };
          } else {
            // Get the name of the warrior who sent this message
            const speakerName = warriors.find(w => w.id === msg.warrior)?.name || "Unknown Warrior";
            return { 
              role: "assistant" as const, 
              content: `${speakerName}: ${msg.content}` 
            };
          }
        })
      ];
      
      // If the last message was from the same warrior, add a system message encouraging different behavior
      const lastMessage = contextMessages[contextMessages.length - 1];
      if (lastMessage && lastMessage.warrior === warrior.id) {
        formattedMessages.push({
          role: "system" as const, 
          content: "The last message in this conversation was from you. Add something new to the discussion or respond to a different point."
        });
      }
      
      // Call OpenAI API
      const response = await createChatCompletion({
        messages: formattedMessages,
        temperature: 0.8,
        max_tokens: 300
      });
      
      // Clean up any remaining warrior name prefixes that might still be in the response
      let cleanedResponse = response;
      
      // Remove patterns like "Alexander the Great:" or "Miyamoto Musashi:"
      const warriorName = warrior.name;
      const namePattern = new RegExp(`^\\s*${warriorName}\\s*:`, 'i');
      cleanedResponse = cleanedResponse.replace(namePattern, '');
      
      // Also remove patterns where the name appears twice
      const doubleNamePattern = new RegExp(`^\\s*${warriorName}\\s*:\\s*${warriorName}\\s*:`, 'i');
      cleanedResponse = cleanedResponse.replace(doubleNamePattern, '');
      
      // Trim whitespace
      cleanedResponse = cleanedResponse.trim();
      
      return cleanedResponse;
    } catch (error) {
      console.error("Error getting warrior response:", error);
      return "I apologize, but I am unable to respond at the moment.";
    }
  };
  
  // Function to get response from a phrase perspective
  const getPhraseResponse = async (
    contextMessages: Message[],
    currentTopic: string = ""
  ): Promise<string> => {
    try {
      // Create system prompt for the phrase, passing empty topic if not provided
      const phraseSystemPrompt = createPhraseSystemPrompt(selectedPhrase, currentTopic || "");
      
      // Format messages for the OpenAI API
      const formattedMessages = [
        { role: "system" as const, content: phraseSystemPrompt },
        // Add instruction not to prefix the response with the phrase name
        { role: "system" as const, content: "Do not prefix your response with your name or role. Just provide your response directly." },
        ...contextMessages.map(msg => {
          if (msg.warrior === "system") {
            return { role: "system" as const, content: msg.content };
          } else if (msg.warrior === "user") {
            return { role: "user" as const, content: msg.content };
          } else if (msg.warrior === "phrase") {
            return { role: "assistant" as const, content: msg.content };
          } else {
            // Get the name of the warrior who sent this message (should not happen in phrase mode)
            const speakerName = warriors.find(w => w.id === msg.warrior)?.name || "Unknown Warrior";
            return { 
              role: "assistant" as const, 
              content: `${speakerName}: ${msg.content}` 
            };
          }
        })
      ];
      
      // Call OpenAI API
      const response = await createChatCompletion({
        messages: formattedMessages,
        temperature: 0.8,
        max_tokens: 500
      });
      
      // Clean up any name/phrase prefixes
      let cleanedResponse = response;
      
      // Remove patterns like "You vs. You:" prefix
      const phrasePattern = new RegExp(`^\\s*${selectedPhrase}\\s*:`, 'i');
      cleanedResponse = cleanedResponse.replace(phrasePattern, '');
      
      // Also remove doubled phrase patterns
      const doublePhrasePattern = new RegExp(`^\\s*${selectedPhrase}\\s*:\\s*${selectedPhrase}\\s*:`, 'i');
      cleanedResponse = cleanedResponse.replace(doublePhrasePattern, '');
      
      // Trim whitespace
      cleanedResponse = cleanedResponse.trim();
      
      return cleanedResponse;
    } catch (error) {
      console.error("Error getting phrase response:", error);
      return "I'm reflecting on this, but need a moment to gather my thoughts.";
    }
  };

  // Handle user sending a message
  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    
    const trimmedInput = userInput.trim();
    setUserInput("");
    
    // Check for concerning content
    if (moderateUserMessage(trimmedInput)) {
      // Add system message with crisis resources
      const crisisMessage: Message = {
        warrior: "system",
        content: "I notice you're expressing thoughts that concern me. If you're experiencing a crisis, please consider contacting a mental health professional or crisis line: National Suicide Prevention Lifeline: 988 or 1-800-273-8255",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, crisisMessage]);
      return;
    }
    
    // Add user message to chat
    const userMessage: Message = {
      warrior: "user",
      content: trimmedInput,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Set loading state
    setIsLoading(true);
    isProcessingRef.current = true;
    
    // Get recent context (last 10 messages)
    const recentContext = messages.slice(-Math.min(10, messages.length));
    
    try {
      // Handle differently based on chat mode
      if (chatMode === "warriors") {
        // For warrior chat, choose a warrior to respond to the user
        const respondingWarrior = warriors[nextWarriorIndex];
        
        // Indicate which warrior is typing
        setTypingWarrior(respondingWarrior.id);
        
        // Get response from warrior
        const response = await getWarriorResponse(
          respondingWarrior,
          [...recentContext, userMessage],
          topic
        );
        
        // Add warrior's response
        const newMessage: Message = {
          warrior: respondingWarrior.id,
          content: response,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // Update next warrior
        setNextWarriorIndex((nextWarriorIndex + 1) % warriors.length);
      } else {
        console.log("Sending message in phrase chat mode");
        
        // For phrase chat, get a response from the phrase perspective
        
        // Indicate the phrase is "typing"
        setTypingWarrior("phrase");
        
        // Get response from phrase
        const response = await getPhraseResponse(
          [...recentContext, userMessage],
          ""  // Empty topic for phrase chat
        );
        
        console.log("Phrase response received:", response);
        
        // Add phrase response if we got one
        if (response && response.trim()) {
          const newMessage: Message = {
            warrior: "phrase",
            content: response,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, newMessage]);
        } else {
          // Handle empty response
          const errorMessage: Message = {
            warrior: "system",
            content: "I apologize, but I couldn't generate a response. Please try again.",
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, errorMessage]);
        }
      }
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
      
      // Add error message
      const errorMessage: Message = {
        warrior: "system",
        content: "I apologize, but there was an error processing your message. Please try again.",
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setTypingWarrior(null);
      setIsLoading(false);
      isProcessingRef.current = false;
    }
  };
  
  const handleRefocus = async () => {
    if (isLoading || isProcessingRef.current) return;
    
    setIsLoading(true);
    isProcessingRef.current = true;
    
    try {
      // Create a refocus message that's different based on chat mode
      const refocusMessage: Message = {
        warrior: "system",
        content: chatMode === "warriors" 
          ? `Let's refocus our discussion on: "${topic}"`
          : `Let's continue exploring the concept of "${selectedPhrase}"`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, refocusMessage]);
      
      // Need to wait a bit for the UI to update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get response based on chat mode
      if (chatMode === "warriors") {
        // Choose a warrior to respond to the refocus
        const respondingWarrior = warriors[nextWarriorIndex];
        
        // Indicate which warrior is typing
        setTypingWarrior(respondingWarrior.id);
        
        // Build a summary of the conversation so far
        const summary = await getConversationSummary();
        
        // Create a system message with the summary (not shown to user)
        const summaryContext: Message = {
          warrior: "system",
          content: `Here's a summary of the conversation so far: ${summary}. Please continue the discussion focusing on ${topic}.`,
          timestamp: new Date()
        };
        
        // Get recent messages for context
        const recentMessages = messages.slice(-5);
        
        // Get response from warrior
        const response = await getWarriorResponse(
          respondingWarrior,
          [...recentMessages, summaryContext, refocusMessage],
          topic
        );
        
        // Clear typing indicator
        setTypingWarrior(null);
        
        // Add warrior's response
        const newMessage: Message = {
          warrior: respondingWarrior.id,
          content: response,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // Update next warrior
        setNextWarriorIndex((nextWarriorIndex + 1) % warriors.length);
      } else {
        // Phrase chat mode
        
        // Show typing indicator
        setTypingWarrior("phrase");
        
        // Get recent messages for context
        const recentMessages = messages.slice(-5);
        
        // Get response from phrase perspective
        const response = await getPhraseResponse(
          [...recentMessages, refocusMessage],
          ""
        );
        
        // Clear typing indicator after a short delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTypingWarrior(null);
        
        // Add phrase response
        const newMessage: Message = {
          warrior: "phrase",
          content: response,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, newMessage]);
      }
      
    } catch (error) {
      console.error("Error in refocus:", error);
      toast.error("Failed to refocus conversation");
    } finally {
      isProcessingRef.current = false;
      setIsLoading(false);
    }
  };
  
  // Helper function to get a summary of the conversation
  const getConversationSummary = async (): Promise<string> => {
    try {
      // Only summarize if we have enough messages
      if (messages.length < 3) {
        return "The conversation has just started";
      }
      
      // Prepare a prompt for summarization
      const summaryPrompt = [
        { 
          role: "system" as const, 
          content: "Summarize the following conversation in a brief paragraph. Focus on the main points discussed."
        },
        {
          role: "user" as const,
          content: messages.map(msg => {
            const speaker = msg.warrior === "user" 
              ? "User" 
              : msg.warrior === "system" 
                ? "System" 
                : msg.warrior === "phrase"
                  ? selectedPhrase
                  : warriors.find(w => w.id === msg.warrior)?.name || "Unknown";
            
            return `${speaker}: ${msg.content}`;
          }).join("\n\n")
        }
      ];
      
      // Call OpenAI to summarize
      const summary = await createChatCompletion({
        messages: summaryPrompt,
        temperature: 0.5,
        max_tokens: 150
      });
      
      return summary;
    } catch (error) {
      console.error("Error summarizing conversation:", error);
      return "Unable to summarize the conversation";
    }
  };
  
  // Helper to get warrior name by ID
  const getWarriorName = (id: string | "user" | "system" | "phrase"): string => {
    if (id === "user") return "You";
    if (id === "system") return "System";
    if (id === "phrase") return selectedPhrase;
    
    return warriors.find(w => w.id === id)?.name || "Unknown";
  };
  
  // Toggle auto-continuation of conversation
  const toggleConversation = () => {
    setConversationPaused(!conversationPaused);
    
    if (conversationPaused) {
      toast.info("Conversation will continue automatically");
    } else {
      toast.info("Conversation paused");
    }
  };

  // Every 10 messages, summarize the conversation to maintain context
  useEffect(() => {
    const summarizeConversation = async () => {
      if (messages.length > 0 && messages.length % 10 === 0) {
        // Implementation for summarization logic
        // This would use OpenAI to create a summary of the conversation
      }
    };
    
    summarizeConversation();
  }, [messages]);

  return (
    <div className="flex flex-col h-screen max-h-[800px]">
      <div className="flex items-center justify-between p-4 border-b border-zinc-800">
        <Button variant="ghost" onClick={onBack} className="text-zinc-400">
          ← Back
        </Button>
        <h2 className="text-lg font-semibold text-white">
          {chatMode === "warriors" 
            ? `Warrior Chat: ${topic}`
            : `"${selectedPhrase}"`}
        </h2>
        <div className="flex space-x-2">
          {chatMode === "warriors" && (
            <Button 
              variant="outline" 
              size="icon"
              onClick={toggleConversation}
              className="text-zinc-400"
            >
              {conversationPaused ? <PlayCircle size={20} /> : <PauseCircle size={20} />}
            </Button>
          )}
          <Button 
            variant="outline" 
            size="icon"
            onClick={handleRefocus}
            className="text-zinc-400"
          >
            <RefreshCw size={20} />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.warrior === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`rounded-lg px-3 py-1.5 max-w-[80%] ${
                message.warrior === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : message.warrior === 'system'
                    ? 'bg-zinc-800 text-zinc-300 italic text-base'
                    : 'bg-zinc-800 text-white'
              }`}
            >
              {message.warrior !== 'user' && message.warrior !== 'system' && (
                <div className="font-bold text-sm text-zinc-400 mb-0.5">
                  {getWarriorName(message.warrior)}
                </div>
              )}
              <div className="whitespace-pre-wrap prose prose-invert max-w-none [&_strong]:text-white [&_strong]:font-bold [&_em]:text-zinc-300 [&_ul]:pl-5 [&_ol]:pl-5 [&_li]:mb-0.5 [&_h1]:text-xl [&_h1]:mb-1 [&_h2]:text-lg [&_h2]:mb-1 [&_h3]:text-base [&_h3]:mb-1 [&_p]:mb-1 [&_a]:text-blue-400 [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-zinc-600 [&_blockquote]:pl-2 [&_blockquote]:italic [&_blockquote]:text-zinc-300 [&_ul]:my-1 [&_ol]:my-1 [&_p+p]:mt-1 [&_p+ul]:mt-1 [&_p+ol]:mt-1 [&_hr]:my-2">
                <ReactMarkdown>{message.content}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}
        
        {/* Typing indicator */}
        {typingWarrior && (
          <div className="flex justify-start">
            <div className="rounded-lg px-3 py-1.5 bg-zinc-800 text-white">
              <div className="font-bold text-sm text-zinc-400 mb-0.5">
                {getWarriorName(typingWarrior)}
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse delay-150"></div>
                <div className="w-2 h-2 rounded-full bg-zinc-400 animate-pulse delay-300"></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Loading state - shown when initial load is happening */}
        {isLoading && !typingWarrior && (
          <div className="flex justify-center py-4">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-zinc-500 animate-pulse"></div>
              <div className="w-3 h-3 rounded-full bg-zinc-500 animate-pulse delay-150"></div>
              <div className="w-3 h-3 rounded-full bg-zinc-500 animate-pulse delay-300"></div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-zinc-800">
        <div className="flex space-x-2">
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Join the conversation..."
            className="bg-zinc-900 border-zinc-700 text-white"
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading || isProcessingRef.current}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={isLoading || isProcessingRef.current || !userInput.trim()}
            variant="default"
          >
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};
