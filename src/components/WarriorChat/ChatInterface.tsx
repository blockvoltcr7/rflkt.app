import { useState, useRef, useEffect, useCallback } from "react";
import { Warrior } from "@/data/warriors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { RefreshCw, Send, PauseCircle, PlayCircle } from "lucide-react";
import { createChatCompletion, createWarriorSystemPrompt, createContinuousConversationPrompt, getWarriorWisdom, moderateUserMessage } from "@/services/openai";

interface Message {
  warrior: string | "user" | "system";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  warriors: Warrior[];
  topic: string;
  onBack: () => void;
}

export const ChatInterface = ({ warriors, topic, onBack }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationPaused, setConversationPaused] = useState(false);
  const [nextWarriorIndex, setNextWarriorIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Track if we're waiting for API responses to avoid multiple simultaneous calls
  const isProcessingRef = useRef(false);
  
  // Create map of warrior contexts for the OpenAI prompts
  const warriorContexts = useRef<Record<string, any>>({});
  
  const [typingWarrior, setTypingWarrior] = useState<string | null>(null);
  
  const [conversationMemory, setConversationMemory] = useState<{
    overallSummary: string;
    recentMessages: Message[];
  }>({
    overallSummary: "",
    recentMessages: []
  });
  
  useEffect(() => {
    // Initialize warrior contexts
    const contexts: Record<string, any> = {};
    warriors.forEach(warrior => {
      contexts[warrior.id] = {
        systemPrompt: createWarriorSystemPrompt(warrior, topic),
        warrior: warrior
      };
    });
    warriorContexts.current = contexts;
    
    // Initialize chat with welcome message
    const initialMessage: Message = {
      warrior: "system",
      content: `Welcome to a discussion on "${topic}" with historical warriors`,
      timestamp: new Date()
    };
    
    setMessages([initialMessage]);
    
    // Start the initial warrior responses
    startInitialResponses();
  }, [warriors, topic]);
  
  const startInitialResponses = async () => {
    setIsLoading(true);
    isProcessingRef.current = true;
    
    try {
      // Get the first warrior to respond
      const firstWarrior = warriors[0];
      const initialResponse = await getWarriorResponse(firstWarrior, [], topic);
      
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
    } finally {
      isProcessingRef.current = false;
      setIsLoading(false);
    }
  };
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Continue conversation effect - Warriors keep chatting even without user input
  useEffect(() => {
    let conversationTimer: NodeJS.Timeout;
    
    const continueConversation = async () => {
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
    if (!conversationPaused && messages.length > 0) {
      const randomDelay = 8000 + Math.random() * 4000; // 8-12 seconds
      conversationTimer = setTimeout(continueConversation, randomDelay);
    }
    
    return () => {
      clearTimeout(conversationTimer);
    };
  }, [messages, warriors, nextWarriorIndex, isLoading, conversationPaused, topic]);
  
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
        { role: "system", content: systemPrompt },
        { role: "system", content: `When sharing wisdom or advice: ${wisdomPrompt}` },
        ...contextMessages.map(msg => {
          if (msg.warrior === "system") {
            return { role: "system", content: msg.content };
          } else if (msg.warrior === "user") {
            return { role: "user", content: msg.content };
          } else {
            // Get the name of the warrior who sent this message
            const speakerName = warriors.find(w => w.id === msg.warrior)?.name || "Unknown Warrior";
            return { 
              role: "assistant", 
              content: `${speakerName}: ${msg.content}` 
            };
          }
        })
      ];
      
      // If the last message was from the same warrior, add a system message encouraging different behavior
      const lastMessage = contextMessages[contextMessages.length - 1];
      if (lastMessage && lastMessage.warrior === warrior.id) {
        formattedMessages.push({
          role: "system",
          content: "The conversation should continue naturally. Consider asking a question or building on what was just said."
        });
      }
      
      // Add topic reminder to keep conversation focused
      formattedMessages.push({
        role: "system",
        content: `Remember, the conversation topic is "${currentTopic}". If appropriate, ask a question to the user or other warriors to keep the conversation flowing naturally.`
      });
      
      // Get the completion from OpenAI
      const response = await createChatCompletion({
        messages: formattedMessages,
        temperature: 0.8, // Slightly higher temperature for more varied responses
      });
      
      // Remove any instances where the AI included the warrior's name at the beginning
      let cleanedResponse = response;
      const namePrefix = new RegExp(`^\\[?${warrior.name}\\]?:?\\s*`, 'i');
      cleanedResponse = cleanedResponse.replace(namePrefix, '');
      
      return cleanedResponse;
    } catch (error) {
      console.error("Error getting warrior response:", error);
      return "I apologize, but I am unable to respond at the moment.";
    }
  };
  
  // Handle user sending a message
  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading) return;
    
    // Add content moderation check
    const isConcerningContent = moderateUserMessage(userInput);
    
    const userMessage: Message = {
      warrior: "user",
      content: userInput,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setUserInput("");
    setIsLoading(true);
    isProcessingRef.current = true;
    
    try {
      if (isConcerningContent) {
        // Insert a system message with crisis resources
        const crisisMessage: Message = {
          warrior: "system",
          content: "We've detected concerning content in your message. If you're experiencing thoughts of self-harm or suicide, please contact a mental health professional or crisis line immediately: National Suicide Prevention Lifeline: 988 or 1-800-273-8255",
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, crisisMessage]);
        
        // Optional: pause the conversation
        setConversationPaused(true);
        
        // Continue with modified prompt to warriors...
      }
      
      // Get recent context for the conversation
      const recentMessages = messages.slice(-Math.min(6, messages.length));
      
      // Add the user's new message to the context
      const contextWithUserMessage = [...recentMessages, userMessage];
      
      // Choose a single warrior to respond first (randomly or intelligently)
      const respondingWarrior = warriors[nextWarriorIndex];
      
      // Get response from this warrior based on the conversation so far
      const response = await getWarriorResponse(
        respondingWarrior,
        contextWithUserMessage,
        topic
      );
      
      const newMessage: Message = {
        warrior: respondingWarrior.id,
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, newMessage]);
      
      // Update the next warrior index for the continuous conversation
      setNextWarriorIndex((nextWarriorIndex + 1) % warriors.length);
      
      // Pause briefly then resume conversation naturally
      await new Promise(resolve => setTimeout(resolve, 3000));
      setConversationPaused(false);
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      isProcessingRef.current = false;
      setIsLoading(false);
    }
  };
  
  const handleRefocus = async () => {
    if (isProcessingRef.current) return;
    
    setIsLoading(true);
    isProcessingRef.current = true;
    setConversationPaused(true);
    
    toast.info("Refocusing the conversation on the topic", {
      description: topic
    });
    
    try {
      const refocusMessage: Message = {
        warrior: "system",
        content: `Let's refocus our discussion on: "${topic}"`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, refocusMessage]);
      
      // Have each warrior respond to the refocus
      for (let i = 0; i < warriors.length; i++) {
        const warrior = warriors[i];
        
        // Get recent messages plus the refocus message
        const recentMessages = [
          ...messages.slice(-Math.min(4, messages.length)), 
          refocusMessage
        ];
        
        const response = await getWarriorResponse(warrior, recentMessages, topic);
        
        const newMessage: Message = {
          warrior: warrior.id,
          content: response,
          timestamp: new Date()
        };
        
        // Add with delay
        await new Promise(resolve => {
          setTimeout(() => {
            setMessages(prev => [...prev, newMessage]);
            resolve(null);
          }, 1500);
        });
      }
      
      // Set next warrior for continuing conversation
      setNextWarriorIndex(0);
      
    } catch (error) {
      console.error("Error in refocus:", error);
      toast.error("Failed to refocus conversation");
    } finally {
      isProcessingRef.current = false;
      setIsLoading(false);
      setConversationPaused(false);
    }
  };
  
  // Helper to get warrior name by ID
  const getWarriorName = (id: string | "user" | "system"): string => {
    if (id === "user") return "User";
    if (id === "system") return "System";
    return warriors.find(w => w.id === id)?.name || "Unknown Warrior";
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
    <div className="flex flex-col h-[80vh] max-w-4xl w-full mx-auto">
      <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">WarriorChat</h2>
            <p className="text-zinc-400 text-sm">Topic: {topic}</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleConversation}
              className="border-zinc-700 text-zinc-300"
            >
              {conversationPaused ? (
                <PlayCircle className="w-4 h-4 mr-2" />
              ) : (
                <PauseCircle className="w-4 h-4 mr-2" />
              )}
              {conversationPaused ? "Resume" : "Pause"}
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefocus}
              disabled={isLoading}
              className="border-zinc-700 text-zinc-300"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refocus
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onBack}
              className="border-zinc-700 text-zinc-300"
            >
              Back
            </Button>
          </div>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 bg-zinc-950 border-x border-zinc-800 flex flex-col gap-4">
        {messages.map((msg, index) => {
          if (msg.warrior === "system") {
            return (
              <div key={index} className="text-center py-2">
                <span className="text-xs text-zinc-500 bg-black px-3 py-1 rounded-full">
                  {msg.content}
                </span>
              </div>
            );
          }
          
          if (msg.warrior === "user") {
            return (
              <div key={index} className="flex justify-end">
                <div className="bg-zinc-800 p-3 rounded-lg max-w-[80%]">
                  <p className="text-white">{msg.content}</p>
                  <p className="text-xs text-zinc-500 mt-1">
                    You • {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            );
          }
          
          const warrior = warriors.find(w => w.id === msg.warrior);
          if (!warrior) return null;
          
          return (
            <div key={index} className="flex">
              <div 
                className="p-3 rounded-lg max-w-[80%]"
                style={{ backgroundColor: `${warrior.color}20`, borderLeft: `3px solid ${warrior.color}` }}
              >
                <p className="font-semibold text-white">{warrior.name}</p>
                <p className="text-zinc-200">{msg.content}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
        
        {isLoading && typingWarrior && (
          <div className="text-center">
            <span className="inline-block px-3 py-1 rounded-full text-xs text-zinc-400">
              {warriors.find(w => w.id === typingWarrior)?.name || "Warrior"} is thinking...
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4 bg-zinc-900/80 border border-zinc-800 rounded-b-lg">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Join the conversation..."
            disabled={isLoading}
            className="bg-zinc-950 border-zinc-800 text-white"
          />
          <Button 
            type="submit" 
            disabled={!userInput.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
